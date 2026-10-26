// Tests für Assembler und Maschine (laufen über tests/index.html)

function run(source, inputs) {
  const prog = VN.assemble(source);
  if (!prog.ok) throw new Error('Assemblerfehler: ' + JSON.stringify(prog.errors));
  const m = new VN.Machine();
  m.load(prog.memory, prog.names);
  for (const v of inputs || []) m.provideInput(v);
  const stop = m.runToEnd(1e6);
  return { m, stop, prog };
}

function example(id, lang) { return VN.EXAMPLES.find(e => e.id === id).source[lang || 'de']; }

// Sprache nur für die Dauer von fn umstellen
function inLang(lang, fn) {
  const old = VN.i18n.lang;
  VN.i18n.setLang(lang);
  try { return fn(); } finally { VN.i18n.setLang(old); }
}

// ---------------------------------------------------------------- Assembler

test('Assembler: Opcodes und Operanden', () => {
  const p = VN.assemble('LOAD #5\nADD x\nSTORE x\nHALT\nx: DATA 7');
  eq(p.errors, []);
  eq(p.memory.slice(0, 9), [11, 5, 3, 8, 2, 8, 0, 0, 7]);
  eq(p.labels, { x: 8 });
  eq(p.cells[0].kind, 'op'); eq(p.cells[1].kind, 'arg'); eq(p.cells[8].kind, 'data');
});

test('Assembler: Groß-/Kleinschreibung, Kommentare, Label allein in Zeile', () => {
  const p = VN.assemble('; Kommentar\nstart:\n  load #1 ; eins\n  jmp START\n');
  eq(p.errors, []);
  eq(p.memory.slice(0, 4), [11, 1, 20, 0]);
});

test('Assembler: DATA mit mehreren Werten und Label+Abstand', () => {
  const p = VN.assemble('LOAD l+2\nHALT\nl: DATA 3, -1, 4');
  eq(p.errors, []);
  eq(p.memory.slice(0, 7), [1, 6, 0, 0, 3, -1, 4]);
});

test('Assembler: Fehlermeldungen mit Zeilennummer', () => {
  const p = VN.assemble('LOAD y\nFOO 3\nSTORE #4\nADD\nx: DATA 1\nx: DATA 2\nJMP 100\nLOAD #10000');
  eq(p.errors.map(e => e.line), [1, 2, 3, 4, 6, 7, 8]);
  ok(p.errors[0].message.includes('„y“'), p.errors[0].message);
});

test('Assembler: Programm zu groß', () => {
  const p = VN.assemble('HALT\n'.repeat(51));
  ok(!p.ok && p.errors[0].message.includes('zu groß'), JSON.stringify(p.errors));
});

test('Assembler: Befehlsname als Label wird abgelehnt', () => {
  const p = VN.assemble('add: HALT');
  ok(!p.ok);
});

// ---------------------------------------------------------------- Maschine

test('Beispiel Ausdruck: (3+4+5)*(7-2**3) = -12', () => {
  const { m, stop } = run(example('ausdruck'));
  eq(stop, null); eq(m.outputs, [-12]);
});

test('Beispiel Maximum', () => {
  eq(run(example('maximum'), [3, 8]).m.outputs, [8]);
  eq(run(example('maximum'), [8, 3]).m.outputs, [8]);
  eq(run(example('maximum'), [-5, -5]).m.outputs, [-5]);
});

test('Beispiel Countdown', () => {
  eq(run(example('countdown'), [4]).m.outputs, [4, 3, 2, 1]);
});

test('Beispiel Summe 1..n', () => {
  eq(run(example('summe'), [4]).m.outputs, [10]);
  eq(run(example('summe'), [0]).m.outputs, [0]);
});

test('Beispiel Fakultät und Überlauf', () => {
  eq(run(example('fakultaet'), [7]).m.outputs, [5040]);
  const { m, stop } = run(example('fakultaet'), [8]);
  eq(stop.type, 'error'); ok(m.error.includes('Überlauf'), m.error);
});

test('Beispiel selbstmodifizierende Liste', () => {
  const { m, prog } = run(example('liste'));
  eq(m.outputs, [14]);
  eq(m.mem[prog.labels.befehl + 1], prog.labels.liste + 5);
});

test('Flags nach CMP und bedingte Sprünge', () => {
  const src = (j) => `LOAD #3\nCMP #5\n${j} ja\nOUT #0\nHALT\nja: OUT #1\nHALT`;
  const expect = { JE: 0, JNE: 1, JL: 1, JLE: 1, JG: 0, JGE: 0 };
  for (const [j, out] of Object.entries(expect)) eq(run(src(j)).m.outputs, [out], j);
  const { m } = run('LOAD #3\nCMP #3\nHALT');
  eq(m.flags, { z: true, n: false }); eq(m.acc, 3);
});

test('LOAD setzt keine Flags, SUB schon', () => {
  const { m } = run('LOAD #0\nSUB #1\nLOAD #5\nHALT');
  eq(m.flags, { z: false, n: true }); eq(m.acc, 5);
});

test('DIV und MOD wie in Python (// und %)', () => {
  eq(run('LOAD #-7\nDIV #2\nSTORE x\nOUT x\nLOAD #-7\nMOD #2\nSTORE x\nOUT x\nHALT\nx: DATA 0').m.outputs, [-4, 1]);
});

test('Laufzeitfehler: Division durch 0, unbekannter Opcode', () => {
  ok(run('LOAD #1\nDIV #0\nHALT').m.error.includes('Division durch 0'));
  const { m } = run('JMP x\nx: DATA 99');
  ok(m.error.includes('Unbekannter Opcode 99'), m.error);
});

test('Leerer Speicher hält sofort an (Opcode 0 = HALT)', () => {
  const m = new VN.Machine();
  eq(m.runToEnd(), null); eq(m.halted, true); eq(m.counters.instructions, 1);
});

test('IN wartet auf Eingabe', () => {
  const prog = VN.assemble('IN x\nOUT x\nHALT\nx: DATA 0');
  const m = new VN.Machine();
  m.load(prog.memory, prog.names);
  eq(m.runToEnd().type, 'wait');
  m.provideInput(42);
  eq(m.runToEnd(), null); eq(m.outputs, [42]);
});

test('Mikroschritte folgen den fünf Phasen', () => {
  const prog = VN.assemble('ADD x\nHALT\nx: DATA 1');
  const m = new VN.Machine();
  m.load(prog.memory, prog.names);
  const phases = [];
  let s;
  while ((s = m.step()) && s.type !== 'instrEnd') if (s.type === 'micro') phases.push(s.phase);
  eq(phases, ['fetch', 'fetch', 'fetch', 'fetch', 'fetch', 'fetch', 'decode',
    'operands', 'operands', 'execute', 'writeback']);
  eq(m.counters.memAccess, 3); eq(m.counters.steps, 11); eq(m.counters.instructions, 1);
});

test('Format: dez / hex / bin (Zweierkomplement)', () => {
  eq(VN.format(-1, 'hex'), ['FFFF']);
  eq(VN.format(17, 'bin'), ['00000000', '00010001']);
  eq(VN.format(-12, 'dec'), ['-12']);
});

// ---------------------------------------------------------------- Sprachen

test('i18n: alle Schlüssel in beiden Sprachen vorhanden', () => {
  const { de, en } = VN.i18n.messages;
  eq(Object.keys(de).filter(k => !(k in en)), [], 'fehlt in en');
  eq(Object.keys(en).filter(k => !(k in de)), [], 'fehlt in de');
  for (const ins of VN.isa.INSTRUCTIONS) {
    ok(('ins.' + ins.code) in de, 'Text für Opcode ' + ins.code);
    if (ins.test) ok(('cond.' + ins.code) in de, 'Bedingung für Opcode ' + ins.code);
  }
});

test('i18n: Beispiele liefern in DE und EN dieselbe Ausgabe', () => {
  const inputs = { maximum: [3, 8], countdown: [3], summe: [4], fakultaet: [5] };
  for (const ex of VN.EXAMPLES) {
    const de = run(example(ex.id, 'de'), inputs[ex.id]).m.outputs;
    const en = run(example(ex.id, 'en'), inputs[ex.id]).m.outputs;
    eq(en, de, ex.id);
    ok(de.length > 0, ex.id + ' ohne Ausgabe');
  }
});

test('i18n: englische Meldungen', () => {
  inLang('en', () => {
    const p = VN.assemble('LOAD y');
    eq(p.errors[0].message, 'Label “y” is not defined.');
    const { m } = run('LOAD #1\nDIV #0\nHALT');
    eq(m.error, 'Division by zero (DIV).');
    eq(VN.isa.text(VN.isa.byCode.get(3)), 'ACC ← ACC + mem[x]');
  });
  eq(VN.assemble('LOAD y').errors[0].message, 'Label „y“ ist nicht definiert.');
});

// ---------------------------------------------------------------- Speicherfarben (Nutzung zur Laufzeit)

test('Speicherfarbe: STORE in freie Zelle wird Daten, Reset stellt zurück', () => {
  const { m, prog } = run('LOAD #7\nSTORE 50\nHALT');
  eq(m.cellKind(50, prog.cells[50].kind), { kind: 'data', modified: false });
  eq(m.cellKind(0, prog.cells[0].kind), { kind: 'op', modified: false });
  m.reset();
  eq(m.cellKind(50, prog.cells[50].kind), { kind: 'free', modified: false });
});

test('Speicherfarbe: überschriebene Programmzelle ist „verändert“', () => {
  const { m, prog } = run(example('liste'));
  const a = prog.labels.befehl + 1;
  eq(m.cellKind(a, prog.cells[a].kind), { kind: 'arg', modified: true });
  const s = prog.labels.summe;
  eq(m.cellKind(s, prog.cells[s].kind), { kind: 'data', modified: false });
});

test('Speicherfarbe: als Befehl geholte Datenzelle wird Programm', () => {
  const { m, prog } = run('JMP x\nx: DATA 0, 0');   // 0 0 = HALT
  const x = prog.labels.x;
  eq(m.cellKind(x, prog.cells[x].kind), { kind: 'op', modified: false });
  eq(m.cellKind(x + 1, prog.cells[x + 1].kind), { kind: 'arg', modified: false });
});
