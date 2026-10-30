// Sprachumschaltung (Deutsch, Englisch, Französisch, Spanisch, Schwäbisch): VN.t('schluessel', {platzhalter: wert})
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';

  const LANGS = ['de', 'en', 'fr', 'es', 'swg'];
  // Rückfallsprache für Texte, die in einer Sprache fehlen (Schwäbisch ist ein Osterei)
  const PARTIAL = { swg: 'de' };
  const STORAGE_KEY = 'vnsim-lang';

  const messages = {
    de: {
      // ---------------------------------------------------------------- Befehle (isa.js)
      'ins.0': 'Programm anhalten',
      'ins.1': 'Akku ← Speicher[x]',
      'ins.11': 'Akku ← n',
      'ins.2': 'Speicher[x] ← Akku',
      'ins.3': 'Akku ← Akku + Speicher[x]',
      'ins.13': 'Akku ← Akku + n',
      'ins.4': 'Akku ← Akku − Speicher[x]',
      'ins.14': 'Akku ← Akku − n',
      'ins.5': 'Akku ← Akku · Speicher[x]',
      'ins.15': 'Akku ← Akku · n',
      'ins.6': 'Akku ← Akku // Speicher[x]',
      'ins.16': 'Akku ← Akku // n',
      'ins.7': 'Akku ← Akku % Speicher[x]',
      'ins.17': 'Akku ← Akku % n',
      'ins.8': 'Flags ← Akku − Speicher[x] (Akku bleibt)',
      'ins.18': 'Flags ← Akku − n (Akku bleibt)',
      'ins.20': 'Springe immer',
      'ins.21': 'Springe, wenn gleich (Z = 1)',
      'ins.22': 'Springe, wenn ungleich (Z = 0)',
      'ins.23': 'Springe, wenn kleiner (N = 1)',
      'ins.24': 'Springe, wenn kleiner oder gleich',
      'ins.25': 'Springe, wenn größer',
      'ins.26': 'Springe, wenn größer oder gleich (N = 0)',
      'ins.30': 'Akku ← Eingabe',
      'ins.31': 'Ausgabe ← Akku',
      'cond.21': 'Z = 1',
      'cond.22': 'Z = 0',
      'cond.23': 'N = 1',
      'cond.24': 'N = 1 oder Z = 1',
      'cond.25': 'N = 0 und Z = 0',
      'cond.26': 'N = 0',

      // ---------------------------------------------------------------- Assembler
      'asm.mnemonicLabel': '„{name}“ ist ein Befehlsname und kann kein Label sein.',
      'asm.dupLabel': 'Label „{name}“ ist bereits definiert.',
      'asm.dataArgs': 'DATA erwartet einen oder mehrere Werte, z. B. „DATA 0“ oder „DATA 1, 2, 3“.',
      'asm.unknown': 'Unbekannter Befehl „{m}“.',
      'asm.tooBig': 'Programm zu groß: {n} Speicherzellen benötigt, es gibt nur {max}.',
      'asm.undefLabel': 'Label „{name}“ ist nicht definiert.',
      'asm.badOperand': '„{arg}“ ist keine gültige Adresse und kein Label.',
      'asm.notInt': '„{arg}“ ist keine ganze Zahl.',
      'asm.valueRange': 'Wert {v} liegt außerhalb von {min} … {max}.',
      'asm.noOperand': '{m} erwartet keinen Operanden.',
      'asm.ioOperand': '{m} erwartet keinen Operanden: IN liest in den Akku, OUT gibt den Akku aus (z. B. „IN“ und dann „STORE x“, „LOAD x“ und dann „OUT“).',
      'asm.oneOperand': '{m} erwartet genau einen Operanden.',
      'asm.noImm': '{m} erwartet eine Adresse, keinen Direktwert (#).',
      'asm.immNotInt': 'Direktwert „{arg}“ ist keine ganze Zahl.',
      'asm.immRange': 'Direktwert {v} liegt außerhalb von {min} … {max}.',
      'outOfMem': '{what} {v} liegt außerhalb des Speichers (0 … {max}).',
      'what.addr': 'Adresse',
      'what.target': 'Sprungziel',
      'what.pc': 'Befehlszähler',
      'what.result': 'Ergebnis',
      'what.input': 'Eingabe',

      // ---------------------------------------------------------------- Maschine
      'phase.fetch': 'Befehl holen',
      'phase.decode': 'Befehl dekodieren',
      'phase.operands': 'Operanden laden',
      'phase.execute': 'Befehl ausführen',
      'phase.writeback': 'Ergebnis zurückschreiben',
      'm.overflow': 'Überlauf: {what} {v} liegt außerhalb von {min} … {max}.',
      'm.pcToBus': 'Befehlszähler {pc} → Adressbus',
      'm.fetchToIr': 'Speicher[{a}] = {v} → Datenbus → Befehlsregister ({part})',
      'm.pcInc': 'Befehlszähler erhöhen → {pc}',
      'm.badOpcode': 'Unbekannter Opcode {op} an Adresse {a} – steht dort vielleicht ein Datenwert statt eines Befehls?',
      'm.decode': 'Befehlsdecoder: {op} ist {m} – {text}',
      'm.immToOp': 'Direktwert {v} → Operandenregister',
      'm.addrToBus': 'Adresse {a} → Adressbus',
      'm.memToOp': 'Speicher[{a}] = {v} → Datenbus → Operandenregister',
      'm.halt': 'HALT: Programm beendet.',
      'm.div0': 'Division durch 0 ({m}).',
      'm.cmp': 'ALU vergleicht: {a} − {b} = {r} → Flags {flags}',
      'm.alu': 'ALU rechnet: {a} {op} {b} = {r} → Flags {flags}',
      'm.condMet': 'Bedingung {cond} erfüllt',
      'm.always': 'unbedingter Sprung',
      'm.jump': '{why}: Sprungziel {t} → Befehlszähler',
      'm.noJump': 'Bedingung {cond} nicht erfüllt: kein Sprung, Befehlszähler bleibt {pc}',
      'm.resToAcc': 'Ergebnis {v} → Akku',
      'm.opToAcc': 'Operand {v} → Akku',
      'm.accToMem': 'Akku {v} → Datenbus → Speicher[{a}]',
      'm.wait': 'Warte auf Eingabe …',
      'm.inToReg': 'Eingabe {v} → Eingaberegister',
      'm.inToAcc': 'Eingaberegister {v} → Datenbus → Akku',
      'm.accToOut': 'Akku {v} → Datenbus → Ausgaberegister',
      'bus.read': 'lesen',
      'bus.write': 'schreiben',

      // ---------------------------------------------------------------- Grafik
      'v.arith': 'Rechenwerk',
      'v.control': 'Steuerwerk',
      'v.memory': 'Speicherwerk',
      'v.io': 'Ein-/Ausgabewerk',
      'v.acc': 'Akku',
      'v.opReg': 'Operand',
      'v.result': 'Ergebnis',
      'v.flags': 'Flags',
      'v.irArg': 'Operand',
      'v.decoder': 'Befehlsdecoder',
      'v.pc': 'Befehlszähler',
      'v.ir': 'Befehlsregister',
      'v.in': 'Eingabe',
      'v.out': 'Ausgabe',
      'v.outputs': 'Bisherige Ausgaben',
      'v.program': 'Programm',
      'v.data': 'Daten',
      'v.modified': 'verändert',
      'v.modifiedTip': 'Programmzelle wurde zur Laufzeit überschrieben',
      'v.dataBus': 'Datenbus',
      'v.addrBus': 'Adressbus',
      'v.ctrlBus': 'Steuerbus',
      'v.cellTip': 'Adresse {a}: {v}',
      'v.clickEdit': 'Klicken zum Bearbeiten',

      // ---------------------------------------------------------------- Oberfläche
      'ui.title': 'VNSim – Von-Neumann-Simulator',
      'ui.subtitle': 'Von-Neumann-Simulator',
      'ui.run': '▶ Start',
      'ui.continue': '▶ Weiter',
      'ui.run.title': 'Start / Fortsetzen (F5)',
      'ui.pause': '❚❚ Pause',
      'ui.pause.title': 'Pause (Leertaste)',
      'ui.step': '⏭ Schritt',
      'ui.step.title': 'Einen Schritt ausführen (F10)',
      'ui.reset': '⟲ Reset',
      'ui.reset.title': 'Zurücksetzen (Esc)',
      'ui.controls': 'Ablauf',
      'ui.granularity': 'Schrittweite',
      'ui.gran.micro': 'Mikroschritt',
      'ui.gran.phase': 'Phase',
      'ui.gran.instr': 'Befehl',
      'ui.speed': 'Tempo',
      'ui.anim': 'Animation',
      'ui.numbers': 'Zahlen',
      'ui.fmt.dec': 'dezimal',
      'ui.fmt.hex': 'hex',
      'ui.fmt.bin': 'binär',
      'ui.examples': 'Beispiele …',
      'ui.examples.title': 'Beispielprogramm laden',
      'ui.open': 'Öffnen',
      'ui.open.title': 'Programm aus Datei laden',
      'ui.save': 'Speichern',
      'ui.save.title': 'Programm als Datei speichern',
      'ui.link': 'Link',
      'ui.link.title': 'Link mit diesem Programm in die Zwischenablage kopieren',
      'ui.present': 'Beamer',
      'ui.present.title': 'Präsentationsmodus (P)',
      'ui.lang.title': 'Sprache / Language',
      'ui.tab.program': 'Programm',
      'ui.tab.memory': 'Speicher',
      'ui.tab.help': 'Befehle',
      'ui.tab.about': 'Über',
      'ui.source': 'Assembler-Quelltext',
      'ui.memHint': 'Werte direkt ändern: Programm und Daten liegen im selben Speicher.',
      'ui.memAddr': 'Adr.',
      'ui.memValue': 'Wert',
      'ui.memMeaning': 'Bedeutung',
      'ui.svg': 'Schema des Von-Neumann-Rechners',
      'ui.input': 'Eingabe',
      'ui.cntInstr': 'Befehle',
      'ui.cntSteps': 'Takte',
      'ui.cntMem': 'Speicherzugriffe',
      'ui.fileName': 'programm.vns',

      'st.ready': 'Bereit',
      'st.readyText': 'Programm schreiben oder Beispiel wählen, dann ▶ Start.',
      'st.error': 'Fehler',
      'st.errLine': 'Zeile {line}: {msg}',
      'st.more': ' (und {n} weitere)',
      'st.running': 'Läuft',
      'st.runningText': 'Programm wird ausgeführt …',
      'st.stopped': 'Angehalten',
      'st.limit': 'Mehr als {n} Takte – vielleicht eine Endlosschleife? Mit ▶ geht es weiter.',
      'st.stoppedText': 'Angehalten.',
      'st.done': 'Fertig',
      'st.doneText': 'Programm beendet: {i} Befehle, {s} Takte, {m} Speicherzugriffe.',
      'st.output': ' Ausgabe: {list}',
      'st.runtimeError': 'Laufzeitfehler',
      'st.input': 'Eingabe',
      'st.inputText': 'IN: Bitte eine ganze Zahl eingeben und mit Enter bestätigen.',
      'st.inputInvalid': 'Bitte eine ganze Zahl von {min} bis {max} eingeben.',
      'st.pause': 'Pause',
      'st.pauseText': 'Angehalten. ▶ setzt fort, ⏭ geht einzeln weiter.',
      'st.resetText': 'Zurückgesetzt. ▶ Start oder ⏭ Schritt.',
      'st.loaded': 'Programm geladen. ▶ Start oder ⏭ Schritt.',
      'st.changed': 'Programm geändert – ▶ Start lädt es neu.',
      'st.memory': 'Speicher',
      'st.memInvalid': 'Ungültiger Wert für Zelle {a}: erlaubt sind ganze Zahlen von {min} bis {max}.',
      'st.memSet': 'Zelle {a} ← {v}',
      'st.asInstr': ' (als Befehl: {m})',
      'st.link': 'Link',
      'st.linkCopied': 'Link mit dem Programm in die Zwischenablage kopiert.',
      'st.linkPrompt': 'Link zum Kopieren:',
      'err.line': 'Zeile {line}:',
      'mem.cell': 'Speicherzelle {a}',
      'mem.noInstr': '? kein Befehl',
      'mem.data': 'Daten',

      'about.html': `
<h2>VNSim – Von-Neumann-Simulator</h2>
<p>Simulator eines einfachen Von-Neumann-Rechners mit Akkumulator: Programm und Daten liegen im selben
Speicher, jeder Befehl läuft sichtbar in den Phasen Fetch, Decode, Fetch Operands, Execute und Write Back ab.</p>
<p>Entstanden im Rahmen der Vorlesung „Informatik für Ingenieurwissenschaften“ an der Universität Stuttgart.</p>
<p>Autor: Dirk Pflüger<br>
Quellcode: <a href="https://github.com/SC-SGS/vnsim" target="_blank" rel="noopener">github.com/SC-SGS/vnsim</a><br>
Lizenz: MIT<br>
Schrift: TeX Gyre Heros (GUST Font License)</p>`,
      'help.target': 'ziel',
      'help.html': `
<h2>Befehlssatz</h2>
<table><thead><tr><th>Code</th><th>Befehl</th><th>Wirkung</th><th>setzt</th></tr></thead><tbody>{rows}</tbody></table>
<h2>Assembler-Direktive DATA</h2>
<p><code>DATA</code> ist kein Befehl der Maschine, sondern eine Anweisung an den Assembler:
<code>name: DATA w1, w2, …</code> legt die Werte in die nächsten freien Speicherzellen; <code>name</code> ist
die Adresse der ersten Zelle. Die Maschine kennt DATA nicht – wird eine solche Zelle als Befehl ausgeführt,
gilt ihr Wert als Opcode.</p>
<p><b>Speicherstelle benennen:</b> <code>b: DATA 0</code> reserviert die nächste freie Zelle mit dem Startwert 0
und gibt ihr den Namen <code>b</code>, ähnlich einer Variablen. Danach kann man überall <code>b</code> statt der
Adresse schreiben, z. B. <code>LOAD b</code>, <code>STORE b</code>, <code>ADD b</code>; der Assembler setzt die
Adresse ein.</p>
<h2>Farben im Speicher</h2>
<p><b>Gelb</b>: Befehl (Opcode und Operand) – vom Assembler erzeugt oder zur Laufzeit als Befehl geholt.
<b>Blau</b>: Daten – mit DATA angelegt oder zur Laufzeit beschrieben (STORE).
<b>Gelb mit blauer Ecke</b>: Programmzelle, die zur Laufzeit überschrieben wurde (selbstmodifizierender Code).
Reset stellt die Farben wie nach dem Assemblieren her.</p>
<p>Zusätzlich: kräftig gelb = Zugriff im aktuellen Mikroschritt (roter Rahmen beim Schreiben),
dicker blauer Rahmen = Zelle, auf die der Befehlszähler zeigt, dünner blauer Rahmen = aktueller Befehl.</p>
<h2>Speicher und Zahlen</h2>
<p>{size} Zellen (Adressen 0 … {last}), jede speichert eine ganze Zahl von {min} bis {max}.
Programm und Daten liegen im selben Speicher. Ein Befehl belegt zwei Zellen: Opcode und Operand.
Die Direktwert-Variante (<code>#n</code>) hat den Opcode + 10.</p>
<p>Flags: <b>Z</b> (Ergebnis null) und <b>N</b> (Ergebnis negativ) werden von ADD, SUB, MUL, DIV, MOD und CMP gesetzt,
nicht von LOAD und IN. CMP berechnet Akku − Operand, ohne den Akku zu ändern.
DIV und MOD rechnen wie <code>//</code> und <code>%</code> in Python.</p>
<p><b>Ein- und Ausgabe</b> laufen wie alle Daten über den Akku: <code>IN</code> und dann <code>STORE x</code>
speichert eine Eingabe, <code>LOAD x</code> und dann <code>OUT</code> gibt eine Speicherzelle aus.</p>
<p><b>Faustregel:</b> Vor jeden bedingten Sprung (JE … JGE) ein CMP setzen – dann ist klar, worauf sich der
Sprung bezieht. Weil auch die Rechenbefehle die Flags setzen, kann das CMP manchmal entfallen
(z. B. <code>SUB #1</code> direkt vor <code>JG</code>); das spart einen Befehl, ist aber leichter zu übersehen.</p>
<h2>Syntax</h2>
<pre>; Kommentar
start:  LOAD  #5      ; Direktwert
        ADD   x       ; Wert an Adresse x
        STORE 42      ; Adresse als Zahl
        JMP   start   ; Sprungziel
x:      DATA  7       ; Datenzelle(n): DATA 1, 2, 3</pre>
<p>Eine Zahl ohne <code>#</code> ist eine <b>Adresse</b> – für die Zahl 2 <code>#2</code> schreiben
(<code>MOD 2</code> rechnet mit dem Inhalt von Zelle 2).</p>
<p>Labels stehen am Zeilenanfang und enden mit <code>:</code>. <code>x+1</code> adressiert die Zelle nach <code>x</code>.
Groß-/Kleinschreibung spielt keine Rolle.</p>
<h2>Befehlszyklus</h2>
<p>{phases}. Jede Phase besteht aus Mikroschritten (Takten); in jedem Takt wird ein Wert über einen Bus
oder innerhalb der CPU übertragen.</p>
<h2>Tastatur</h2>
<p>F5 Start/Weiter · Leertaste Pause · F10 Schritt · Esc Reset · P Beamer-Modus</p>`,
    },

    en: {
      'ins.0': 'Stop the program',
      'ins.1': 'ACC ← mem[x]',
      'ins.11': 'ACC ← n',
      'ins.2': 'mem[x] ← ACC',
      'ins.3': 'ACC ← ACC + mem[x]',
      'ins.13': 'ACC ← ACC + n',
      'ins.4': 'ACC ← ACC − mem[x]',
      'ins.14': 'ACC ← ACC − n',
      'ins.5': 'ACC ← ACC · mem[x]',
      'ins.15': 'ACC ← ACC · n',
      'ins.6': 'ACC ← ACC // mem[x]',
      'ins.16': 'ACC ← ACC // n',
      'ins.7': 'ACC ← ACC % mem[x]',
      'ins.17': 'ACC ← ACC % n',
      'ins.8': 'Flags ← ACC − mem[x] (ACC unchanged)',
      'ins.18': 'Flags ← ACC − n (ACC unchanged)',
      'ins.20': 'Always jump',
      'ins.21': 'Jump if equal (Z = 1)',
      'ins.22': 'Jump if not equal (Z = 0)',
      'ins.23': 'Jump if less (N = 1)',
      'ins.24': 'Jump if less or equal',
      'ins.25': 'Jump if greater',
      'ins.26': 'Jump if greater or equal (N = 0)',
      'ins.30': 'ACC ← input',
      'ins.31': 'output ← ACC',
      'cond.21': 'Z = 1',
      'cond.22': 'Z = 0',
      'cond.23': 'N = 1',
      'cond.24': 'N = 1 or Z = 1',
      'cond.25': 'N = 0 and Z = 0',
      'cond.26': 'N = 0',

      'asm.mnemonicLabel': '“{name}” is an instruction name and cannot be used as a label.',
      'asm.dupLabel': 'Label “{name}” is already defined.',
      'asm.dataArgs': 'DATA expects one or more values, e.g. “DATA 0” or “DATA 1, 2, 3”.',
      'asm.unknown': 'Unknown instruction “{m}”.',
      'asm.tooBig': 'Program too large: needs {n} memory cells, only {max} available.',
      'asm.undefLabel': 'Label “{name}” is not defined.',
      'asm.badOperand': '“{arg}” is neither a valid address nor a label.',
      'asm.notInt': '“{arg}” is not an integer.',
      'asm.valueRange': 'Value {v} is outside of {min} … {max}.',
      'asm.noOperand': '{m} takes no operand.',
      'asm.ioOperand': '{m} takes no operand: IN reads into the accumulator, OUT outputs the accumulator (e.g. “IN” followed by “STORE x”, “LOAD x” followed by “OUT”).',
      'asm.oneOperand': '{m} expects exactly one operand.',
      'asm.noImm': '{m} expects an address, not an immediate value (#).',
      'asm.immNotInt': 'Immediate value “{arg}” is not an integer.',
      'asm.immRange': 'Immediate value {v} is outside of {min} … {max}.',
      'outOfMem': '{what} {v} is outside of memory (0 … {max}).',
      'what.addr': 'Address',
      'what.target': 'Jump target',
      'what.pc': 'Program counter',
      'what.result': 'result',
      'what.input': 'input',

      'phase.fetch': 'fetch instruction',
      'phase.decode': 'decode instruction',
      'phase.operands': 'load operands',
      'phase.execute': 'execute instruction',
      'phase.writeback': 'write back result',
      'm.overflow': 'Overflow: {what} {v} is outside of {min} … {max}.',
      'm.pcToBus': 'Program counter {pc} → address bus',
      'm.fetchToIr': 'mem[{a}] = {v} → data bus → instruction register ({part})',
      'm.pcInc': 'Increment program counter → {pc}',
      'm.badOpcode': 'Unknown opcode {op} at address {a} – is there a data value instead of an instruction?',
      'm.decode': 'Instruction decoder: {op} is {m} – {text}',
      'm.immToOp': 'Immediate value {v} → operand register',
      'm.addrToBus': 'Address {a} → address bus',
      'm.memToOp': 'mem[{a}] = {v} → data bus → operand register',
      'm.halt': 'HALT: program finished.',
      'm.div0': 'Division by zero ({m}).',
      'm.cmp': 'ALU compares: {a} − {b} = {r} → flags {flags}',
      'm.alu': 'ALU computes: {a} {op} {b} = {r} → flags {flags}',
      'm.condMet': 'Condition {cond} met',
      'm.always': 'Unconditional jump',
      'm.jump': '{why}: jump target {t} → program counter',
      'm.noJump': 'Condition {cond} not met: no jump, program counter stays {pc}',
      'm.resToAcc': 'Result {v} → accumulator',
      'm.opToAcc': 'Operand {v} → accumulator',
      'm.accToMem': 'Accumulator {v} → data bus → mem[{a}]',
      'm.wait': 'Waiting for input …',
      'm.inToReg': 'Input {v} → input register',
      'm.inToAcc': 'Input register {v} → data bus → ACC',
      'm.accToOut': 'ACC {v} → data bus → output register',
      'bus.read': 'read',
      'bus.write': 'write',

      'v.arith': 'Arithmetic Unit',
      'v.control': 'Control Unit',
      'v.memory': 'Memory',
      'v.io': 'Input/Output',
      'v.acc': 'Accumulator',
      'v.opReg': 'Operand',
      'v.result': 'Result',
      'v.flags': 'Flags',
      'v.irArg': 'Operand',
      'v.decoder': 'Instruction Decoder',
      'v.pc': 'Program Counter',
      'v.ir': 'Instruction Register',
      'v.in': 'Input',
      'v.out': 'Output',
      'v.outputs': 'Outputs so far',
      'v.program': 'Program',
      'v.data': 'Data',
      'v.modified': 'modified',
      'v.modifiedTip': 'Program cell was overwritten at run time',
      'v.dataBus': 'Data Bus',
      'v.addrBus': 'Address Bus',
      'v.ctrlBus': 'Control Bus',
      'v.cellTip': 'Address {a}: {v}',
      'v.clickEdit': 'Click to edit',

      'ui.title': 'VNSim – Von Neumann Simulator',
      'ui.subtitle': 'Von Neumann Simulator',
      'ui.run': '▶ Start',
      'ui.continue': '▶ Continue',
      'ui.run.title': 'Start / continue (F5)',
      'ui.pause': '❚❚ Pause',
      'ui.pause.title': 'Pause (space)',
      'ui.step': '⏭ Step',
      'ui.step.title': 'Execute one step (F10)',
      'ui.reset': '⟲ Reset',
      'ui.reset.title': 'Reset (Esc)',
      'ui.controls': 'Execution',
      'ui.granularity': 'Step size',
      'ui.gran.micro': 'Micro step',
      'ui.gran.phase': 'Phase',
      'ui.gran.instr': 'Instruction',
      'ui.speed': 'Speed',
      'ui.anim': 'Animation',
      'ui.numbers': 'Numbers',
      'ui.fmt.dec': 'decimal',
      'ui.fmt.hex': 'hex',
      'ui.fmt.bin': 'binary',
      'ui.examples': 'Examples …',
      'ui.examples.title': 'Load an example program',
      'ui.open': 'Open',
      'ui.open.title': 'Load program from file',
      'ui.save': 'Save',
      'ui.save.title': 'Save program to file',
      'ui.link': 'Link',
      'ui.link.title': 'Copy a link to this program to the clipboard',
      'ui.present': 'Present',
      'ui.present.title': 'Presentation mode (P)',
      'ui.lang.title': 'Sprache / Language',
      'ui.tab.program': 'Program',
      'ui.tab.memory': 'Memory',
      'ui.tab.help': 'Instructions',
      'ui.tab.about': 'About',
      'ui.source': 'Assembly source code',
      'ui.memHint': 'Edit values directly: program and data share the same memory.',
      'ui.memAddr': 'Addr.',
      'ui.memValue': 'Value',
      'ui.memMeaning': 'Meaning',
      'ui.svg': 'Diagram of the von Neumann computer',
      'ui.input': 'Input',
      'ui.cntInstr': 'Instructions',
      'ui.cntSteps': 'Cycles',
      'ui.cntMem': 'Memory accesses',
      'ui.fileName': 'program.vns',

      'st.ready': 'Ready',
      'st.readyText': 'Write a program or pick an example, then press ▶ Start.',
      'st.error': 'Error',
      'st.errLine': 'Line {line}: {msg}',
      'st.more': ' (and {n} more)',
      'st.running': 'Running',
      'st.runningText': 'Program is running …',
      'st.stopped': 'Stopped',
      'st.limit': 'More than {n} cycles – an infinite loop? Press ▶ to continue.',
      'st.stoppedText': 'Stopped.',
      'st.done': 'Done',
      'st.doneText': 'Program finished: {i} instructions, {s} cycles, {m} memory accesses.',
      'st.output': ' Output: {list}',
      'st.runtimeError': 'Runtime error',
      'st.input': 'Input',
      'st.inputText': 'IN: please enter an integer and press Enter.',
      'st.inputInvalid': 'Please enter an integer from {min} to {max}.',
      'st.pause': 'Pause',
      'st.pauseText': 'Paused. ▶ continues, ⏭ advances step by step.',
      'st.resetText': 'Reset. ▶ Start or ⏭ Step.',
      'st.loaded': 'Program loaded. ▶ Start or ⏭ Step.',
      'st.changed': 'Program changed – ▶ Start reloads it.',
      'st.memory': 'Memory',
      'st.memInvalid': 'Invalid value for cell {a}: integers from {min} to {max} are allowed.',
      'st.memSet': 'Cell {a} ← {v}',
      'st.asInstr': ' (as instruction: {m})',
      'st.link': 'Link',
      'st.linkCopied': 'Link to the program copied to the clipboard.',
      'st.linkPrompt': 'Link to copy:',
      'err.line': 'Line {line}:',
      'mem.cell': 'Memory cell {a}',
      'mem.noInstr': '? no instruction',
      'mem.data': 'Data',

      'about.html': `
<h2>VNSim – Von Neumann Simulator</h2>
<p>Simulator of a simple von Neumann computer with an accumulator: program and data share the same
memory, and every instruction runs visibly through the phases Fetch, Decode, Fetch Operands, Execute and Write Back.</p>
<p>Developed for the lecture “Informatik für Ingenieurwissenschaften” (Computer Science for Engineers)
at the University of Stuttgart.</p>
<p>Author: Dirk Pflüger<br>
Source code: <a href="https://github.com/SC-SGS/vnsim" target="_blank" rel="noopener">github.com/SC-SGS/vnsim</a><br>
License: MIT<br>
Font: TeX Gyre Heros (GUST Font License)</p>`,
      'help.target': 'target',
      'help.html': `
<h2>Instruction set</h2>
<table><thead><tr><th>Code</th><th>Instruction</th><th>Effect</th><th>sets</th></tr></thead><tbody>{rows}</tbody></table>
<p>ACC = accumulator, mem[x] = memory cell x.</p>
<h2>Assembler directive DATA</h2>
<p><code>DATA</code> is not a machine instruction but a directive for the assembler:
<code>name: DATA v1, v2, …</code> places the values in the next free memory cells; <code>name</code> is the
address of the first cell. The machine does not know DATA – if such a cell is executed as an instruction,
its value is taken as an opcode.</p>
<p><b>Naming a memory cell:</b> <code>b: DATA 0</code> reserves the next free cell with initial value 0 and
gives it the name <code>b</code>, similar to a variable. Afterwards you can write <code>b</code> instead of the
address everywhere, e.g. <code>LOAD b</code>, <code>STORE b</code>, <code>ADD b</code>; the assembler fills in
the address.</p>
<h2>Colours in memory</h2>
<p><b>Yellow</b>: instruction (opcode and operand) – produced by the assembler or fetched as an instruction at run time.
<b>Blue</b>: data – created with DATA or written at run time (STORE).
<b>Yellow with a blue corner</b>: program cell that was overwritten at run time (self-modifying code).
Reset restores the colours as after assembling.</p>
<p>In addition: bright yellow = access in the current micro step (red border when writing),
thick blue border = cell the program counter points to, thin blue border = current instruction.</p>
<h2>Memory and numbers</h2>
<p>{size} cells (addresses 0 … {last}), each holding an integer from {min} to {max}.
Program and data share the same memory. An instruction occupies two cells: opcode and operand.
The immediate variant (<code>#n</code>) has opcode + 10.</p>
<p>Flags: <b>Z</b> (result zero) and <b>N</b> (result negative) are set by ADD, SUB, MUL, DIV, MOD and CMP,
but not by LOAD and IN. CMP computes ACC − operand without changing the accumulator.
DIV and MOD work like <code>//</code> and <code>%</code> in Python.</p>
<p><b>Input and output</b> go through the accumulator like all data: <code>IN</code> followed by
<code>STORE x</code> stores an input value, <code>LOAD x</code> followed by <code>OUT</code> outputs a memory cell.</p>
<p><b>Rule of thumb:</b> put a CMP before every conditional jump (JE … JGE) – then it is clear what the jump
refers to. Since arithmetic instructions also set the flags, the CMP can sometimes be omitted
(e.g. <code>SUB #1</code> directly before <code>JG</code>); this saves an instruction but is easier to overlook.</p>
<h2>Syntax</h2>
<pre>; comment
start:  LOAD  #5      ; immediate value
        ADD   x       ; value at address x
        STORE 42      ; address as a number
        JMP   start   ; jump target
x:      DATA  7       ; data cell(s): DATA 1, 2, 3</pre>
<p>A number without <code>#</code> is an <b>address</b> – write <code>#2</code> for the number 2
(<code>MOD 2</code> uses the contents of cell 2).</p>
<p>Labels start a line and end with <code>:</code>. <code>x+1</code> addresses the cell after <code>x</code>.
Upper and lower case are treated the same.</p>
<h2>Instruction cycle</h2>
<p>{phases}. Each phase consists of micro steps (clock cycles); in each cycle one value is transferred
over a bus or within the CPU.</p>
<h2>Keyboard</h2>
<p>F5 start/continue · Space pause · F10 step · Esc reset · P presentation mode</p>`,
    },
    fr: {
      'ins.0': 'Arrêter le programme',
      'ins.1': 'ACC ← mém[x]',
      'ins.11': 'ACC ← n',
      'ins.2': 'mém[x] ← ACC',
      'ins.3': 'ACC ← ACC + mém[x]',
      'ins.13': 'ACC ← ACC + n',
      'ins.4': 'ACC ← ACC − mém[x]',
      'ins.14': 'ACC ← ACC − n',
      'ins.5': 'ACC ← ACC · mém[x]',
      'ins.15': 'ACC ← ACC · n',
      'ins.6': 'ACC ← ACC // mém[x]',
      'ins.16': 'ACC ← ACC // n',
      'ins.7': 'ACC ← ACC % mém[x]',
      'ins.17': 'ACC ← ACC % n',
      'ins.8': 'Flags ← ACC − mém[x] (ACC inchangé)',
      'ins.18': 'Flags ← ACC − n (ACC inchangé)',
      'ins.20': 'Sauter toujours',
      'ins.21': 'Sauter si égal (Z = 1)',
      'ins.22': 'Sauter si différent (Z = 0)',
      'ins.23': 'Sauter si inférieur (N = 1)',
      'ins.24': 'Sauter si inférieur ou égal',
      'ins.25': 'Sauter si supérieur',
      'ins.26': 'Sauter si supérieur ou égal (N = 0)',
      'ins.30': 'ACC ← entrée',
      'ins.31': 'sortie ← ACC',
      'cond.21': 'Z = 1',
      'cond.22': 'Z = 0',
      'cond.23': 'N = 1',
      'cond.24': 'N = 1 ou Z = 1',
      'cond.25': 'N = 0 et Z = 0',
      'cond.26': 'N = 0',

      'asm.mnemonicLabel': '« {name} » est un nom d’instruction et ne peut pas servir d’étiquette.',
      'asm.dupLabel': 'L’étiquette « {name} » est déjà définie.',
      'asm.dataArgs': 'DATA attend une ou plusieurs valeurs, p. ex. « DATA 0 » ou « DATA 1, 2, 3 ».',
      'asm.unknown': 'Instruction inconnue « {m} ».',
      'asm.tooBig': 'Programme trop grand : {n} cellules mémoire nécessaires, seulement {max} disponibles.',
      'asm.undefLabel': 'L’étiquette « {name} » n’est pas définie.',
      'asm.badOperand': '« {arg} » n’est ni une adresse valide ni une étiquette.',
      'asm.notInt': '« {arg} » n’est pas un nombre entier.',
      'asm.valueRange': 'La valeur {v} est hors de l’intervalle {min} … {max}.',
      'asm.noOperand': '{m} n’attend pas d’opérande.',
      'asm.ioOperand': '{m} n’attend pas d’opérande : IN lit dans l’accumulateur, OUT affiche l’accumulateur (p. ex. « IN » puis « STORE x », « LOAD x » puis « OUT »).',
      'asm.oneOperand': '{m} attend exactement un opérande.',
      'asm.noImm': '{m} attend une adresse, pas une valeur immédiate (#).',
      'asm.immNotInt': 'La valeur immédiate « {arg} » n’est pas un nombre entier.',
      'asm.immRange': 'La valeur immédiate {v} est hors de l’intervalle {min} … {max}.',
      'outOfMem': '{what} {v} est en dehors de la mémoire (0 … {max}).',
      'what.addr': 'Adresse',
      'what.target': 'Cible du saut',
      'what.pc': 'Compteur ordinal',
      'what.result': 'résultat',
      'what.input': 'entrée',

      'phase.fetch': 'chercher l’instruction',
      'phase.decode': 'décoder l’instruction',
      'phase.operands': 'charger les opérandes',
      'phase.execute': 'exécuter l’instruction',
      'phase.writeback': 'réécrire le résultat',
      'm.overflow': 'Dépassement : {what} {v} est hors de l’intervalle {min} … {max}.',
      'm.pcToBus': 'Compteur ordinal {pc} → bus d’adresses',
      'm.fetchToIr': 'mém[{a}] = {v} → bus de données → registre d’instruction ({part})',
      'm.pcInc': 'Incrémenter le compteur ordinal → {pc}',
      'm.badOpcode': 'Opcode inconnu {op} à l’adresse {a} – y a-t-il une donnée au lieu d’une instruction ?',
      'm.decode': 'Décodeur d’instructions : {op} est {m} – {text}',
      'm.immToOp': 'Valeur immédiate {v} → registre d’opérande',
      'm.addrToBus': 'Adresse {a} → bus d’adresses',
      'm.memToOp': 'mém[{a}] = {v} → bus de données → registre d’opérande',
      'm.halt': 'HALT : programme terminé.',
      'm.div0': 'Division par zéro ({m}).',
      'm.cmp': 'L’UAL compare : {a} − {b} = {r} → flags {flags}',
      'm.alu': 'L’UAL calcule : {a} {op} {b} = {r} → flags {flags}',
      'm.condMet': 'Condition {cond} remplie',
      'm.always': 'Saut inconditionnel',
      'm.jump': '{why} : cible du saut {t} → compteur ordinal',
      'm.noJump': 'Condition {cond} non remplie : pas de saut, le compteur ordinal reste {pc}',
      'm.resToAcc': 'Résultat {v} → accumulateur',
      'm.opToAcc': 'Opérande {v} → accumulateur',
      'm.accToMem': 'Accumulateur {v} → bus de données → mém[{a}]',
      'm.wait': 'En attente d’une entrée …',
      'm.inToReg': 'Entrée {v} → registre d’entrée',
      'm.inToAcc': 'Registre d’entrée {v} → bus de données → ACC',
      'm.accToOut': 'ACC {v} → bus de données → registre de sortie',
      'bus.read': 'lire',
      'bus.write': 'écrire',

      'v.arith': 'Unité arithmétique',
      'v.control': 'Unité de contrôle',
      'v.memory': 'Mémoire',
      'v.io': 'Entrées/Sorties',
      'v.acc': 'Accumulateur',
      'v.opReg': 'Opérande',
      'v.result': 'Résultat',
      'v.flags': 'Flags',
      'v.irArg': 'Operand',
      'v.decoder': 'Décodeur d’instructions',
      'v.pc': 'Compteur ordinal',
      'v.ir': 'Registre d’instruction',
      'v.in': 'Entrée',
      'v.out': 'Sortie',
      'v.outputs': 'Sorties précédentes',
      'v.program': 'Programme',
      'v.data': 'Données',
      'v.modified': 'modifié',
      'v.modifiedTip': 'Cellule de programme écrasée à l’exécution',
      'v.dataBus': 'Bus de données',
      'v.addrBus': 'Bus d’adresses',
      'v.ctrlBus': 'Bus de contrôle',
      'v.cellTip': 'Adresse {a} : {v}',
      'v.clickEdit': 'Cliquer pour modifier',

      'ui.title': 'VNSim – Simulateur de von Neumann',
      'ui.subtitle': 'Simulateur de von Neumann',
      'ui.run': '▶ Démarrer',
      'ui.continue': '▶ Continuer',
      'ui.run.title': 'Démarrer / continuer (F5)',
      'ui.pause': '❚❚ Pause',
      'ui.pause.title': 'Pause (espace)',
      'ui.step': '⏭ Pas',
      'ui.step.title': 'Exécuter un pas (F10)',
      'ui.reset': '⟲ Réinit.',
      'ui.reset.title': 'Réinitialiser (Échap)',
      'ui.controls': 'Exécution',
      'ui.granularity': 'Pas',
      'ui.gran.micro': 'Micro-étape',
      'ui.gran.phase': 'Phase',
      'ui.gran.instr': 'Instruction',
      'ui.speed': 'Vitesse',
      'ui.anim': 'Animation',
      'ui.numbers': 'Nombres',
      'ui.fmt.dec': 'décimal',
      'ui.fmt.hex': 'hexa',
      'ui.fmt.bin': 'binaire',
      'ui.examples': 'Exemples …',
      'ui.examples.title': 'Charger un programme d’exemple',
      'ui.open': 'Ouvrir',
      'ui.open.title': 'Charger un programme depuis un fichier',
      'ui.save': 'Enregistrer',
      'ui.save.title': 'Enregistrer le programme dans un fichier',
      'ui.link': 'Lien',
      'ui.link.title': 'Copier un lien vers ce programme dans le presse-papiers',
      'ui.present': 'Présenter',
      'ui.present.title': 'Mode présentation (P)',
      'ui.lang.title': 'Langue / Language',
      'ui.tab.program': 'Programme',
      'ui.tab.memory': 'Mémoire',
      'ui.tab.help': 'Instructions',
      'ui.tab.about': 'À propos',
      'ui.source': 'Code source assembleur',
      'ui.memHint': 'Modifier les valeurs directement : programme et données partagent la même mémoire.',
      'ui.memAddr': 'Adr.',
      'ui.memValue': 'Valeur',
      'ui.memMeaning': 'Signification',
      'ui.svg': 'Schéma de l’ordinateur de von Neumann',
      'ui.input': 'Entrée',
      'ui.cntInstr': 'Instructions',
      'ui.cntSteps': 'Cycles',
      'ui.cntMem': 'Accès mémoire',
      'ui.fileName': 'programme.vns',

      'st.ready': 'Prêt',
      'st.readyText': 'Écrire un programme ou choisir un exemple, puis ▶ Démarrer.',
      'st.error': 'Erreur',
      'st.errLine': 'Ligne {line} : {msg}',
      'st.more': ' (et {n} autres)',
      'st.running': 'En cours',
      'st.runningText': 'Exécution du programme …',
      'st.stopped': 'Arrêté',
      'st.limit': 'Plus de {n} cycles – une boucle infinie ? ▶ pour continuer.',
      'st.stoppedText': 'Arrêté.',
      'st.done': 'Terminé',
      'st.doneText': 'Programme terminé : {i} instructions, {s} cycles, {m} accès mémoire.',
      'st.output': ' Sortie : {list}',
      'st.runtimeError': 'Erreur d’exécution',
      'st.input': 'Entrée',
      'st.inputText': 'IN : saisir un nombre entier et valider avec Entrée.',
      'st.inputInvalid': 'Saisir un nombre entier de {min} à {max}.',
      'st.pause': 'Pause',
      'st.pauseText': 'En pause. ▶ continue, ⏭ avance pas à pas.',
      'st.resetText': 'Réinitialisé. ▶ Démarrer ou ⏭ Pas.',
      'st.loaded': 'Programme chargé. ▶ Démarrer ou ⏭ Pas.',
      'st.changed': 'Programme modifié – ▶ Démarrer le recharge.',
      'st.memory': 'Mémoire',
      'st.memInvalid': 'Valeur invalide pour la cellule {a} : nombres entiers de {min} à {max} autorisés.',
      'st.memSet': 'Cellule {a} ← {v}',
      'st.asInstr': ' (comme instruction : {m})',
      'st.link': 'Lien',
      'st.linkCopied': 'Lien vers le programme copié dans le presse-papiers.',
      'st.linkPrompt': 'Lien à copier :',
      'err.line': 'Ligne {line} :',
      'mem.cell': 'Cellule mémoire {a}',
      'mem.noInstr': '? pas une instruction',
      'mem.data': 'Données',

      'about.html': `
<h2>VNSim – Simulateur de von Neumann</h2>
<p>Simulateur d’un ordinateur de von Neumann simple à accumulateur : programme et données partagent la même
mémoire, et chaque instruction parcourt visiblement les phases Fetch, Decode, Fetch Operands, Execute et Write Back.</p>
<p>Développé pour le cours « Informatik für Ingenieurwissenschaften » (informatique pour ingénieurs)
à l’Université de Stuttgart.</p>
<p>Auteur : Dirk Pflüger<br>
Code source : <a href="https://github.com/SC-SGS/vnsim" target="_blank" rel="noopener">github.com/SC-SGS/vnsim</a><br>
Licence : MIT<br>
Police : TeX Gyre Heros (GUST Font License)</p>`,
      'help.target': 'cible',
      'help.html': `
<h2>Jeu d’instructions</h2>
<table><thead><tr><th>Code</th><th>Instruction</th><th>Effet</th><th>modifie</th></tr></thead><tbody>{rows}</tbody></table>
<p>ACC = accumulateur, mém[x] = cellule mémoire x.</p>
<h2>Directive d’assemblage DATA</h2>
<p><code>DATA</code> n’est pas une instruction de la machine mais une directive pour l’assembleur :
<code>nom: DATA v1, v2, …</code> place les valeurs dans les cellules mémoire libres suivantes ; <code>nom</code>
est l’adresse de la première cellule. La machine ne connaît pas DATA – si une telle cellule est exécutée comme
instruction, sa valeur est interprétée comme opcode.</p>
<p><b>Nommer une cellule mémoire :</b> <code>b: DATA 0</code> réserve la cellule libre suivante avec la valeur
initiale 0 et lui donne le nom <code>b</code>, comme une variable. Ensuite, on peut écrire <code>b</code> au lieu
de l’adresse partout, p. ex. <code>LOAD b</code>, <code>STORE b</code>, <code>ADD b</code> ; l’assembleur
insère l’adresse.</p>
<h2>Couleurs dans la mémoire</h2>
<p><b>Jaune</b> : instruction (opcode et opérande) – produite par l’assembleur ou lue comme instruction à l’exécution.
<b>Bleu</b> : données – créées avec DATA ou écrites à l’exécution (STORE).
<b>Jaune avec un coin bleu</b> : cellule de programme écrasée à l’exécution (code auto-modifiant).
Réinitialiser rétablit les couleurs d’après l’assemblage.</p>
<p>De plus : jaune vif = accès de la micro-étape en cours (bordure rouge en écriture),
bordure bleue épaisse = cellule pointée par le compteur ordinal, bordure bleue fine = instruction en cours.</p>
<h2>Mémoire et nombres</h2>
<p>{size} cellules (adresses 0 … {last}), chacune contenant un nombre entier de {min} à {max}.
Programme et données partagent la même mémoire. Une instruction occupe deux cellules : opcode et opérande.
La variante immédiate (<code>#n</code>) a l’opcode + 10.</p>
<p>Flags : <b>Z</b> (résultat nul) et <b>N</b> (résultat négatif) sont positionnés par ADD, SUB, MUL, DIV, MOD
et CMP, mais pas par LOAD ni IN. CMP calcule ACC − opérande sans modifier l’accumulateur.
DIV et MOD fonctionnent comme <code>//</code> et <code>%</code> en Python.</p>
<p><b>Les entrées et sorties</b> passent par l’accumulateur comme toutes les données : <code>IN</code> puis
<code>STORE x</code> enregistre une valeur saisie, <code>LOAD x</code> puis <code>OUT</code> affiche une cellule mémoire.</p>
<p><b>Règle pratique :</b> placer un CMP avant chaque saut conditionnel (JE … JGE) – on voit alors clairement
à quoi le saut se rapporte. Comme les instructions arithmétiques positionnent aussi les flags, le CMP peut
parfois être omis (p. ex. <code>SUB #1</code> juste avant <code>JG</code>) ; cela économise une instruction,
mais passe plus facilement inaperçu.</p>
<h2>Syntaxe</h2>
<pre>; commentaire
debut:  LOAD  #5      ; valeur immédiate
        ADD   x       ; valeur à l’adresse x
        STORE 42      ; adresse sous forme de nombre
        JMP   debut   ; cible du saut
x:      DATA  7       ; cellule(s) de données : DATA 1, 2, 3</pre>
<p>Un nombre sans <code>#</code> est une <b>adresse</b> – écrire <code>#2</code> pour le nombre 2
(<code>MOD 2</code> utilise le contenu de la cellule 2).</p>
<p>Les étiquettes commencent une ligne et se terminent par <code>:</code>. <code>x+1</code> désigne la cellule
après <code>x</code>. Majuscules et minuscules sont équivalentes.</p>
<h2>Cycle d’instruction</h2>
<p>{phases}. Chaque phase se compose de micro-étapes (cycles d’horloge) ; à chaque cycle, une valeur est
transférée sur un bus ou à l’intérieur du processeur.</p>
<h2>Clavier</h2>
<p>F5 démarrer/continuer · Espace pause · F10 pas · Échap réinitialiser · P mode présentation</p>`,
    },
    es: {
      'ins.0': 'Detener el programa',
      'ins.1': 'ACC ← mem[x]',
      'ins.11': 'ACC ← n',
      'ins.2': 'mem[x] ← ACC',
      'ins.3': 'ACC ← ACC + mem[x]',
      'ins.13': 'ACC ← ACC + n',
      'ins.4': 'ACC ← ACC − mem[x]',
      'ins.14': 'ACC ← ACC − n',
      'ins.5': 'ACC ← ACC · mem[x]',
      'ins.15': 'ACC ← ACC · n',
      'ins.6': 'ACC ← ACC // mem[x]',
      'ins.16': 'ACC ← ACC // n',
      'ins.7': 'ACC ← ACC % mem[x]',
      'ins.17': 'ACC ← ACC % n',
      'ins.8': 'Flags ← ACC − mem[x] (ACC sin cambios)',
      'ins.18': 'Flags ← ACC − n (ACC sin cambios)',
      'ins.20': 'Saltar siempre',
      'ins.21': 'Saltar si igual (Z = 1)',
      'ins.22': 'Saltar si distinto (Z = 0)',
      'ins.23': 'Saltar si menor (N = 1)',
      'ins.24': 'Saltar si menor o igual',
      'ins.25': 'Saltar si mayor',
      'ins.26': 'Saltar si mayor o igual (N = 0)',
      'ins.30': 'ACC ← entrada',
      'ins.31': 'salida ← ACC',
      'cond.21': 'Z = 1',
      'cond.22': 'Z = 0',
      'cond.23': 'N = 1',
      'cond.24': 'N = 1 o Z = 1',
      'cond.25': 'N = 0 y Z = 0',
      'cond.26': 'N = 0',

      'asm.mnemonicLabel': '«{name}» es un nombre de instrucción y no puede usarse como etiqueta.',
      'asm.dupLabel': 'La etiqueta «{name}» ya está definida.',
      'asm.dataArgs': 'DATA espera uno o más valores, p. ej. «DATA 0» o «DATA 1, 2, 3».',
      'asm.unknown': 'Instrucción desconocida «{m}».',
      'asm.tooBig': 'Programa demasiado grande: necesita {n} celdas de memoria, solo hay {max}.',
      'asm.undefLabel': 'La etiqueta «{name}» no está definida.',
      'asm.badOperand': '«{arg}» no es una dirección válida ni una etiqueta.',
      'asm.notInt': '«{arg}» no es un número entero.',
      'asm.valueRange': 'El valor {v} está fuera de {min} … {max}.',
      'asm.noOperand': '{m} no lleva operando.',
      'asm.ioOperand': '{m} no lleva operando: IN lee en el acumulador, OUT muestra el acumulador (p. ej. «IN» y luego «STORE x», «LOAD x» y luego «OUT»).',
      'asm.oneOperand': '{m} espera exactamente un operando.',
      'asm.noImm': '{m} espera una dirección, no un valor inmediato (#).',
      'asm.immNotInt': 'El valor inmediato «{arg}» no es un número entero.',
      'asm.immRange': 'El valor inmediato {v} está fuera de {min} … {max}.',
      'outOfMem': '{what} {v} está fuera de la memoria (0 … {max}).',
      'what.addr': 'Dirección',
      'what.target': 'Destino del salto',
      'what.pc': 'Contador de programa',
      'what.result': 'resultado',
      'what.input': 'entrada',

      'phase.fetch': 'buscar la instrucción',
      'phase.decode': 'decodificar la instrucción',
      'phase.operands': 'cargar los operandos',
      'phase.execute': 'ejecutar la instrucción',
      'phase.writeback': 'escribir el resultado',
      'm.overflow': 'Desbordamiento: {what} {v} está fuera de {min} … {max}.',
      'm.pcToBus': 'Contador de programa {pc} → bus de direcciones',
      'm.fetchToIr': 'mem[{a}] = {v} → bus de datos → registro de instrucción ({part})',
      'm.pcInc': 'Incrementar el contador de programa → {pc}',
      'm.badOpcode': 'Opcode desconocido {op} en la dirección {a}: ¿hay un dato en lugar de una instrucción?',
      'm.decode': 'Decodificador de instrucciones: {op} es {m} – {text}',
      'm.immToOp': 'Valor inmediato {v} → registro de operando',
      'm.addrToBus': 'Dirección {a} → bus de direcciones',
      'm.memToOp': 'mem[{a}] = {v} → bus de datos → registro de operando',
      'm.halt': 'HALT: programa terminado.',
      'm.div0': 'División por cero ({m}).',
      'm.cmp': 'La ALU compara: {a} − {b} = {r} → flags {flags}',
      'm.alu': 'La ALU calcula: {a} {op} {b} = {r} → flags {flags}',
      'm.condMet': 'Condición {cond} cumplida',
      'm.always': 'Salto incondicional',
      'm.jump': '{why}: destino del salto {t} → contador de programa',
      'm.noJump': 'Condición {cond} no cumplida: no hay salto, el contador de programa sigue en {pc}',
      'm.resToAcc': 'Resultado {v} → acumulador',
      'm.opToAcc': 'Operando {v} → acumulador',
      'm.accToMem': 'Acumulador {v} → bus de datos → mem[{a}]',
      'm.wait': 'Esperando una entrada …',
      'm.inToReg': 'Entrada {v} → registro de entrada',
      'm.inToAcc': 'Registro de entrada {v} → bus de datos → ACC',
      'm.accToOut': 'ACC {v} → bus de datos → registro de salida',
      'bus.read': 'leer',
      'bus.write': 'escribir',

      'v.arith': 'Unidad aritmética',
      'v.control': 'Unidad de control',
      'v.memory': 'Memoria',
      'v.io': 'Entrada/Salida',
      'v.acc': 'Acumulador',
      'v.opReg': 'Operando',
      'v.result': 'Resultado',
      'v.flags': 'Flags',
      'v.irArg': 'Operand',
      'v.decoder': 'Decodificador de instrucciones',
      'v.pc': 'Contador de programa',
      'v.ir': 'Registro de instrucción',
      'v.in': 'Entrada',
      'v.out': 'Salida',
      'v.outputs': 'Salidas anteriores',
      'v.program': 'Programa',
      'v.data': 'Datos',
      'v.modified': 'modificado',
      'v.modifiedTip': 'Celda de programa sobrescrita durante la ejecución',
      'v.dataBus': 'Bus de datos',
      'v.addrBus': 'Bus de direcciones',
      'v.ctrlBus': 'Bus de control',
      'v.cellTip': 'Dirección {a}: {v}',
      'v.clickEdit': 'Clic para editar',

      'ui.title': 'VNSim – Simulador de von Neumann',
      'ui.subtitle': 'Simulador de von Neumann',
      'ui.run': '▶ Iniciar',
      'ui.continue': '▶ Seguir',
      'ui.run.title': 'Iniciar / continuar (F5)',
      'ui.pause': '❚❚ Pausa',
      'ui.pause.title': 'Pausa (espacio)',
      'ui.step': '⏭ Paso',
      'ui.step.title': 'Ejecutar un paso (F10)',
      'ui.reset': '⟲ Reiniciar',
      'ui.reset.title': 'Reiniciar (Esc)',
      'ui.controls': 'Ejecución',
      'ui.granularity': 'Avance',
      'ui.gran.micro': 'Micropaso',
      'ui.gran.phase': 'Fase',
      'ui.gran.instr': 'Instrucción',
      'ui.speed': 'Ritmo',
      'ui.anim': 'Animación',
      'ui.numbers': 'Números',
      'ui.fmt.dec': 'decimal',
      'ui.fmt.hex': 'hex',
      'ui.fmt.bin': 'binario',
      'ui.examples': 'Ejemplos …',
      'ui.examples.title': 'Cargar un programa de ejemplo',
      'ui.open': 'Abrir',
      'ui.open.title': 'Cargar programa desde un archivo',
      'ui.save': 'Guardar',
      'ui.save.title': 'Guardar el programa en un archivo',
      'ui.link': 'Enlace',
      'ui.link.title': 'Copiar un enlace a este programa al portapapeles',
      'ui.present': 'Presentar',
      'ui.present.title': 'Modo presentación (P)',
      'ui.lang.title': 'Idioma / Language',
      'ui.tab.program': 'Programa',
      'ui.tab.memory': 'Memoria',
      'ui.tab.help': 'Instrucciones',
      'ui.tab.about': 'Acerca de',
      'ui.source': 'Código fuente en ensamblador',
      'ui.memHint': 'Editar los valores directamente: programa y datos comparten la misma memoria.',
      'ui.memAddr': 'Dir.',
      'ui.memValue': 'Valor',
      'ui.memMeaning': 'Significado',
      'ui.svg': 'Esquema del ordenador de von Neumann',
      'ui.input': 'Entrada',
      'ui.cntInstr': 'Instrucciones',
      'ui.cntSteps': 'Ciclos',
      'ui.cntMem': 'Accesos a memoria',
      'ui.fileName': 'programa.vns',

      'st.ready': 'Listo',
      'st.readyText': 'Escribir un programa o elegir un ejemplo y pulsar ▶ Iniciar.',
      'st.error': 'Error',
      'st.errLine': 'Línea {line}: {msg}',
      'st.more': ' (y {n} más)',
      'st.running': 'En ejecución',
      'st.runningText': 'Ejecutando el programa …',
      'st.stopped': 'Detenido',
      'st.limit': 'Más de {n} ciclos: ¿un bucle infinito? Pulsar ▶ para continuar.',
      'st.stoppedText': 'Detenido.',
      'st.done': 'Terminado',
      'st.doneText': 'Programa terminado: {i} instrucciones, {s} ciclos, {m} accesos a memoria.',
      'st.output': ' Salida: {list}',
      'st.runtimeError': 'Error de ejecución',
      'st.input': 'Entrada',
      'st.inputText': 'IN: introducir un número entero y confirmar con Intro.',
      'st.inputInvalid': 'Introducir un número entero de {min} a {max}.',
      'st.pause': 'Pausa',
      'st.pauseText': 'En pausa. ▶ continúa, ⏭ avanza paso a paso.',
      'st.resetText': 'Reiniciado. ▶ Iniciar o ⏭ Paso.',
      'st.loaded': 'Programa cargado. ▶ Iniciar o ⏭ Paso.',
      'st.changed': 'Programa modificado: ▶ Iniciar lo vuelve a cargar.',
      'st.memory': 'Memoria',
      'st.memInvalid': 'Valor no válido para la celda {a}: se admiten números enteros de {min} a {max}.',
      'st.memSet': 'Celda {a} ← {v}',
      'st.asInstr': ' (como instrucción: {m})',
      'st.link': 'Enlace',
      'st.linkCopied': 'Enlace al programa copiado al portapapeles.',
      'st.linkPrompt': 'Enlace para copiar:',
      'err.line': 'Línea {line}:',
      'mem.cell': 'Celda de memoria {a}',
      'mem.noInstr': '? no es una instrucción',
      'mem.data': 'Datos',

      'about.html': `
<h2>VNSim – Simulador de von Neumann</h2>
<p>Simulador de un ordenador de von Neumann sencillo con acumulador: programa y datos comparten la misma
memoria, y cada instrucción recorre de forma visible las fases Fetch, Decode, Fetch Operands, Execute y Write Back.</p>
<p>Desarrollado para la asignatura «Informatik für Ingenieurwissenschaften» (Informática para ingenieros)
en la Universidad de Stuttgart.</p>
<p>Autor: Dirk Pflüger<br>
Código fuente: <a href="https://github.com/SC-SGS/vnsim" target="_blank" rel="noopener">github.com/SC-SGS/vnsim</a><br>
Licencia: MIT<br>
Tipografía: TeX Gyre Heros (GUST Font License)</p>`,
      'help.target': 'destino',
      'help.html': `
<h2>Conjunto de instrucciones</h2>
<table><thead><tr><th>Código</th><th>Instrucción</th><th>Efecto</th><th>modifica</th></tr></thead><tbody>{rows}</tbody></table>
<p>ACC = acumulador, mem[x] = celda de memoria x.</p>
<h2>Directiva de ensamblador DATA</h2>
<p><code>DATA</code> no es una instrucción de la máquina, sino una directiva para el ensamblador:
<code>nombre: DATA v1, v2, …</code> coloca los valores en las siguientes celdas de memoria libres;
<code>nombre</code> es la dirección de la primera celda. La máquina no conoce DATA: si una de esas celdas se
ejecuta como instrucción, su valor se interpreta como opcode.</p>
<p><b>Dar nombre a una celda de memoria:</b> <code>b: DATA 0</code> reserva la siguiente celda libre con el
valor inicial 0 y le da el nombre <code>b</code>, de forma parecida a una variable. A partir de ahí se puede
escribir <code>b</code> en lugar de la dirección, p. ej. <code>LOAD b</code>, <code>STORE b</code>,
<code>ADD b</code>; el ensamblador inserta la dirección.</p>
<h2>Colores en la memoria</h2>
<p><b>Amarillo</b>: instrucción (opcode y operando), generada por el ensamblador o leída como instrucción durante la ejecución.
<b>Azul</b>: datos, creados con DATA o escritos durante la ejecución (STORE).
<b>Amarillo con esquina azul</b>: celda de programa sobrescrita durante la ejecución (código automodificable).
Reiniciar restablece los colores tal como quedan tras el ensamblado.</p>
<p>Además: amarillo intenso = acceso del micropaso actual (borde rojo al escribir),
borde azul grueso = celda a la que apunta el contador de programa, borde azul fino = instrucción actual.</p>
<h2>Memoria y números</h2>
<p>{size} celdas (direcciones 0 … {last}), cada una con un número entero de {min} a {max}.
Programa y datos comparten la misma memoria. Una instrucción ocupa dos celdas: opcode y operando.
La variante inmediata (<code>#n</code>) tiene el opcode + 10.</p>
<p>Flags: <b>Z</b> (resultado cero) y <b>N</b> (resultado negativo) los modifican ADD, SUB, MUL, DIV, MOD y CMP,
pero no LOAD ni IN. CMP calcula ACC − operando sin modificar el acumulador.
DIV y MOD funcionan como <code>//</code> y <code>%</code> en Python.</p>
<p><b>La entrada y la salida</b> pasan por el acumulador como todos los datos: <code>IN</code> y luego
<code>STORE x</code> guarda un valor introducido, <code>LOAD x</code> y luego <code>OUT</code> muestra una celda de memoria.</p>
<p><b>Regla práctica:</b> poner un CMP antes de cada salto condicional (JE … JGE); así queda claro a qué se
refiere el salto. Como las instrucciones aritméticas también modifican los flags, a veces se puede omitir el CMP
(p. ej. <code>SUB #1</code> justo antes de <code>JG</code>); esto ahorra una instrucción, pero es más fácil
pasarlo por alto.</p>
<h2>Sintaxis</h2>
<pre>; comentario
inicio: LOAD  #5      ; valor inmediato
        ADD   x       ; valor en la dirección x
        STORE 42      ; dirección como número
        JMP   inicio  ; destino del salto
x:      DATA  7       ; celda(s) de datos: DATA 1, 2, 3</pre>
<p>Un número sin <code>#</code> es una <b>dirección</b>: para el número 2 hay que escribir <code>#2</code>
(<code>MOD 2</code> usa el contenido de la celda 2).</p>
<p>Las etiquetas van al principio de la línea y terminan en <code>:</code>. <code>x+1</code> designa la celda
siguiente a <code>x</code>. No se distingue entre mayúsculas y minúsculas.</p>
<h2>Ciclo de instrucción</h2>
<p>{phases}. Cada fase consta de micropasos (ciclos de reloj); en cada ciclo se transfiere un valor por un bus
o dentro de la CPU.</p>
<h2>Teclado</h2>
<p>F5 iniciar/continuar · Espacio pausa · F10 paso · Esc reiniciar · P modo presentación</p>`,
    },
    // Schwäbisch (Osterei): Sparhäfele = Akku, Bühne = Speicher, Ausdeutscher = Befehlsdecoder,
    // Schees = Bus, Fähnla = Flags, hopfa = springen; Rückfall auf 'de' über PARTIAL
    swg: {
      'ins.0': 'Feierabend macha',
      'ins.1': 'Sparhäfele ← Bühne[x]',
      'ins.11': 'Sparhäfele ← n',
      'ins.2': 'Bühne[x] ← Sparhäfele',
      'ins.3': 'Sparhäfele ← Sparhäfele + Bühne[x]',
      'ins.13': 'Sparhäfele ← Sparhäfele + n',
      'ins.4': 'Sparhäfele ← Sparhäfele − Bühne[x]',
      'ins.14': 'Sparhäfele ← Sparhäfele − n',
      'ins.5': 'Sparhäfele ← Sparhäfele · Bühne[x]',
      'ins.15': 'Sparhäfele ← Sparhäfele · n',
      'ins.6': 'Sparhäfele ← Sparhäfele // Bühne[x]',
      'ins.16': 'Sparhäfele ← Sparhäfele // n',
      'ins.7': 'Sparhäfele ← Sparhäfele % Bühne[x]',
      'ins.17': 'Sparhäfele ← Sparhäfele % n',
      'ins.8': 'Fähnla ← Sparhäfele − Bühne[x] (Sparhäfele bleibt)',
      'ins.18': 'Fähnla ← Sparhäfele − n (Sparhäfele bleibt)',
      'ins.20': 'Allaweil hopfa',
      'ins.21': 'Hopfa, wenn’s gleich isch (Z = 1)',
      'ins.22': 'Hopfa, wenn’s net gleich isch (Z = 0)',
      'ins.23': 'Hopfa, wenn’s kloiner isch (N = 1)',
      'ins.24': 'Hopfa, wenn’s kloiner oder gleich isch',
      'ins.25': 'Hopfa, wenn’s größer isch',
      'ins.26': 'Hopfa, wenn’s größer oder gleich isch (N = 0)',
      'ins.30': 'Sparhäfele ← Nei',
      'ins.31': 'Raus ← Sparhäfele',
      'cond.21': 'Z = 1',
      'cond.22': 'Z = 0',
      'cond.23': 'N = 1',
      'cond.24': 'N = 1 oder Z = 1',
      'cond.25': 'N = 0 ond Z = 0',
      'cond.26': 'N = 0',

      'asm.mnemonicLabel': '„{name}“ isch a Befehl, koi Label.',
      'asm.dupLabel': 'S Label „{name}“ hemmr scho.',
      'asm.dataArgs': 'DATA will oin oder mehrere Wert, z. B. „DATA 0“ oder „DATA 1, 2, 3“.',
      'asm.unknown': 'Den Befehl „{m}“ kennt mr net.',
      'asm.tooBig': 'S Programm isch z’ groß: {n} Fächla bräucht’s, uf d’r Bühne sen aber bloß {max}.',
      'asm.undefLabel': 'S Label „{name}“ gibt’s net.',
      'asm.badOperand': '„{arg}“ isch weder a Adress no a Label.',
      'asm.notInt': '„{arg}“ isch koi ganze Zahl.',
      'asm.valueRange': 'D’r Wert {v} passt net zwischa {min} ond {max}.',
      'asm.noOperand': '{m} braucht koi Zuagab.',
      'asm.ioOperand': '{m} braucht koi Zuagab: IN duat’s ens Sparhäfele, OUT holt’s raus (z. B. „IN“ ond no „STORE x“, „LOAD x“ ond no „OUT“).',
      'asm.oneOperand': '{m} braucht genau oi Zuagab.',
      'asm.noImm': '{m} will a Adress, koin Direktwert (#).',
      'asm.immNotInt': 'D’r Direktwert „{arg}“ isch koi ganze Zahl.',
      'asm.immRange': 'D’r Direktwert {v} passt net zwischa {min} ond {max}.',
      'outOfMem': '{what} {v} liegt neba d’r Bühne (0 … {max}).',
      'what.addr': 'D’ Adress',
      'what.target': 'S Hopfziel',
      'what.pc': 'D’r Befehlszählr',
      'what.result': 'was rauskommt',
      'what.input': 'was neikommt',

      'phase.fetch': 'Befehl hola',
      'phase.decode': 'Befehl ausdeutscha',
      'phase.operands': 'Zuagab hola',
      'phase.execute': 'Befehl schaffa',
      'phase.writeback': 'Ergebnis wegräuma',
      'm.overflow': 'Überlauf: {what} {v} passt net zwischa {min} ond {max}.',
      'm.pcToBus': 'Befehlszählr {pc} → Adressschees',
      'm.fetchToIr': 'Bühne[{a}] = {v} → Dataschees → Befehlskäschtle ({part})',
      'm.pcInc': 'Befehlszählr oins weiter → {pc}',
      'm.badOpcode': 'Opcode {op} an Adress {a} kennt mr net – stoht do vielleicht a Datawert statt am Befehl?',
      'm.decode': 'Ausdeutscher: {op} isch {m} – {text}',
      'm.immToOp': 'Direktwert {v} → Zuagab',
      'm.addrToBus': 'Adress {a} → Adressschees',
      'm.memToOp': 'Bühne[{a}] = {v} → Dataschees → Zuagab',
      'm.halt': 'HALT: Feierabend.',
      'm.div0': 'Durch 0 teila ({m}) – des goht fei net.',
      'm.cmp': 'ALU vergleicht: {a} − {b} = {r} → Fähnla {flags}',
      'm.alu': 'ALU rechnet: {a} {op} {b} = {r} → Fähnla {flags}',
      'm.condMet': '{cond} stimmt',
      'm.always': 'Hopfa wird allaweil',
      'm.jump': '{why}: Hopfziel {t} → Befehlszählr',
      'm.noJump': '{cond} stimmt net: koi Hopfer, Befehlszählr bleibt bei {pc}',
      'm.resToAcc': 'Was rauskommt ({v}) → Sparhäfele',
      'm.opToAcc': 'Zuagab {v} → Sparhäfele',
      'm.accToMem': 'Sparhäfele {v} → Dataschees → Bühne[{a}]',
      'm.wait': 'Wart uf a Eingab …',
      'm.inToReg': 'Eingab {v} → Nei',
      'm.inToAcc': 'Nei {v} → Dataschees → Sparhäfele',
      'm.accToOut': 'Sparhäfele {v} → Dataschees → Raus',
      'bus.read': 'hola',
      'bus.write': 'nalega',

      'v.arith': 'Rechastub',
      'v.control': 'D’r Chef',
      'v.memory': 'Bühne',
      'v.io': 'Nei ond Raus',
      'v.acc': 'Sparhäfele',
      'v.opReg': 'Zuagab',
      'v.result': 'Was rauskommt',
      'v.flags': 'Fähnla',
      'v.irArg': 'Zuagab',
      'v.decoder': 'Ausdeutscher',
      'v.pc': 'Befehlszählr',
      'v.ir': 'Befehlskäschtle',
      'v.in': 'Nei',
      'v.out': 'Raus',
      'v.outputs': 'Was bisher rauskomma isch',
      'v.program': 'Programm',
      'v.data': 'Data',
      'v.modified': 'verhunzt',
      'v.modifiedTip': 'Des Programmfächle isch onderwegs überschrieba worda',
      'v.dataBus': 'Dataschees',
      'v.addrBus': 'Adressschees',
      'v.ctrlBus': 'Chefschees',
      'v.cellTip': 'Fächle {a}: {v}',
      'v.clickEdit': 'Druff klicka zum Ändra',

      'ui.title': 'VNSim – Von-Neumann-Rechnerle',
      'ui.subtitle': 'Von-Neumann-Rechnerle',
      'ui.run': '▶ Los',
      'ui.continue': '▶ Weiter',
      'ui.run.title': 'Los / weiter (F5)',
      'ui.pause': '❚❚ Paus',
      'ui.pause.title': 'Veschperpaus (Leertaste)',
      'ui.step': '⏭ Schrittle',
      'ui.step.title': 'A Schrittle macha (F10)',
      'ui.reset': '⟲ Nomol',
      'ui.reset.title': 'Nomol vo vorne (Esc)',
      'ui.controls': 'Ablauf',
      'ui.granularity': 'Wie weit',
      'ui.gran.micro': 'Schrittle',
      'ui.gran.phase': 'Phas',
      'ui.gran.instr': 'Befehl',
      'ui.speed': 'Tempo',
      'ui.anim': 'Gwusel',
      'ui.numbers': 'Zahla',
      'ui.fmt.dec': 'dezimal',
      'ui.fmt.hex': 'hex',
      'ui.fmt.bin': 'binär',
      'ui.examples': 'Beischbiel …',
      'ui.examples.title': 'A Beischbielprogramm lada',
      'ui.open': 'Uffmacha',
      'ui.open.title': 'Programm aus ra Datei lada',
      'ui.save': 'Ablega',
      'ui.save.title': 'Programm en a Datei ablega',
      'ui.link': 'Link',
      'ui.link.title': 'Link mit dem Programm en d’ Zwischaablag duaa',
      'ui.present': 'Beamer',
      'ui.present.title': 'Vorführmodus (P)',
      'ui.lang.title': 'Sprach / Language',
      'ui.tab.program': 'Programm',
      'ui.tab.memory': 'Bühne',
      'ui.tab.help': 'Befehl',
      'ui.tab.about': 'Was isch des',
      'ui.source': 'Assembler-Quelltext',
      'ui.memHint': 'Wert direkt ändra: Programm ond Data liegat uf d’r gleicha Bühne.',
      'ui.memAddr': 'Adr.',
      'ui.memValue': 'Wert',
      'ui.memMeaning': 'Was es hoißt',
      'ui.svg': 'Schaubild vom Von-Neumann-Rechnerle',
      'ui.input': 'Nei',
      'ui.cntInstr': 'Befehl',
      'ui.cntSteps': 'Takt',
      'ui.cntMem': 'Bühnagäng',
      'ui.fileName': 'programm.vns',

      'st.ready': 'Parat',
      'st.readyText': 'A Programm schreiba oder a Beischbiel aussuacha, no ▶ Los.',
      'st.error': 'Hoppla',
      'st.errLine': 'Zeil {line}: {msg}',
      'st.more': ' (ond no {n} weitere)',
      'st.running': 'Schafft',
      'st.runningText': 'D’r Rechner schafft …',
      'st.stopped': 'Ghalta',
      'st.limit': 'Meh als {n} Takt – vielleicht a Endlosschleif? Mit ▶ goht’s weiter.',
      'st.stoppedText': 'Ghalta.',
      'st.done': 'Fertig',
      'st.doneText': 'Fertig: {i} Befehl, {s} Takt, {m} Bühnagäng. Net gschimpft isch globt gnug.',
      'st.output': ' Raus komma isch: {list}',
      'st.runtimeError': 'Des hot gschebbert',
      'st.input': 'Nei',
      'st.inputText': 'IN: Bitte a ganze Zahl eigäba ond mit Enter bstätiga.',
      'st.inputInvalid': 'Bitte a ganze Zahl zwischa {min} ond {max} eigäba.',
      'st.pause': 'Veschper',
      'st.pauseText': 'Veschperpaus. ▶ goht’s weiter, ⏭ Schrittle für Schrittle.',
      'st.resetText': 'Wieder vo vorne. ▶ Los oder ⏭ Schrittle.',
      'st.loaded': 'Programm glada. ▶ Los oder ⏭ Schrittle.',
      'st.changed': 'Programm gändert – ▶ Los ladt’s nei.',
      'st.memory': 'Bühne',
      'st.memInvalid': 'Des goht net ens Fächle {a}: bloß ganze Zahla vo {min} bis {max}.',
      'st.memSet': 'Fächle {a} ← {v}',
      'st.asInstr': ' (als Befehl: {m})',
      'st.link': 'Link',
      'st.linkCopied': 'D’r Link mit dem Programm isch en d’r Zwischaablag.',
      'st.linkPrompt': 'Link zum Kopiera:',
      'err.line': 'Zeil {line}:',
      'mem.cell': 'Fächle {a}',
      'mem.noInstr': '? koi Befehl',
      'mem.data': 'Data',

      'about.html': `
<h2>VNSim – Von-Neumann-Rechnerle</h2>
<p>A Simulator für en oifacha Von-Neumann-Rechner mit Sparhäfele: Programm ond Data liegat uf d’r selba Bühne,
ond jeder Befehl lauft sichtbar durch d’ Phasa Fetch, Decode, Fetch Operands, Execute ond Write Back.</p>
<p>Gmacht für d’ Vorlesung „Informatik für Ingenieurwissenschaften“ an d’r Uni Stuagart.</p>
<p>Gschafft hot’s: Dirk Pflüger<br>
Quellcode: <a href="https://github.com/SC-SGS/vnsim" target="_blank" rel="noopener">github.com/SC-SGS/vnsim</a><br>
Lizenz: MIT – koscht nix<br>
Schrift: TeX Gyre Heros (GUST Font License)</p>
<p><i>Die schwäbische Fassung isch a Osterei. Wer’s uf Hochdeutsch will: oba rechts uf DE stella.</i></p>`,
      'help.target': 'ziel',
      'help.html': `
<h2>Was d’r Rechner ka</h2>
<table><thead><tr><th>Code</th><th>Befehl</th><th>Was er duat</th><th>Fähnla</th></tr></thead><tbody>{rows}</tbody></table>
<h2>Wer isch wer</h2>
<p><b>Sparhäfele</b> = Akku, <b>Zuagab</b> = Operand(enregischter), <b>Befehlszählr</b> = Befehlszähler,
<b>Befehlskäschtle</b> = Befehlsregischter, <b>Ausdeutscher</b> = Befehlsdecoder, <b>Rechastub</b> = Rechawerk,
<b>D’r Chef</b> = Steuerwerk, <b>Bühne</b> = Speicher, <b>Fächle</b> = Speicherzell, <b>Schees</b> = Bus,
<b>Fähnla</b> = Flags, <b>hopfa</b> = springa, <b>Bühnagang</b> = Speicherzugriff.</p>
<h2>DATA – des isch koin Befehl</h2>
<p><code>DATA</code> kennt d’r Rechner gar net, des isch bloß a Anweisung an da Assembler:
<code>name: DATA w1, w2, …</code> legt d’ Wert en d’ nächste freie Fächla uf d’r Bühne;
<code>name</code> isch d’ Adress vom erschta Fächle. Wenn mr so a Fächle als Befehl ausführt,
no gilt sei Wert halt als Opcode – ob des Sinn macht oder net.</p>
<p><b>Fächle an Nama geba:</b> <code>b: DATA 0</code> reserviert ’s nächste freie Fächle mit 0 drin
ond nennt’s <code>b</code>, fascht wie a Variable. Danach ka mr überall <code>b</code> schreiba statt dr Adress,
z. B. <code>LOAD b</code>, <code>STORE b</code>, <code>ADD b</code>; d’r Assembler setzt d’ Adress selber ei.</p>
<h2>Farba uf d’r Bühne</h2>
<p><b>Gelb</b>: Befehl (Opcode ond Zuagab) – vom Assembler gmacht oder onderwegs als Befehl gholt.
<b>Blau</b>: Data – mit DATA aaglegt oder onderwegs nagschrieba (STORE).
<b>Gelb mit blauer Eck</b>: a Programmfächle, des onderwegs überschrieba worda isch (des Programm verhunzt sich selber).
⟲ Nomol macht d’ Farba wieder wie nachem Assembliera.</p>
<p>Ond: knallgelb = do wird grad im Schrittle zugriffa (roter Rand beim Schreiba),
dicker blauer Rand = do zeigt d’r Befehlszählr na, dünner blauer Rand = d’r Befehl, der grad dra isch.</p>
<h2>Bühne ond Zahla</h2>
<p>{size} Fächla (Adressa 0 … {last}), en jedem a ganze Zahl vo {min} bis {max}.
Programm ond Data liegat uf d’r gleicha Bühne. A Befehl braucht zwoi Fächla: Opcode ond Zuagab.
Mit Direktwert (<code>#n</code>) isch d’r Opcode um 10 größer.</p>
<p>Fähnla: <b>Z</b> (’s isch null rauskomma) ond <b>N</b> (’s isch negativ rauskomma) setzat ADD, SUB, MUL, DIV, MOD ond CMP,
aber net LOAD ond IN. CMP rechnet Sparhäfele − Zuagab, lässt aber ’s Sparhäfele en Ruah.
DIV ond MOD rechnat wie <code>//</code> ond <code>%</code> en Python.</p>
<p><b>Nei ond Raus</b> goht wie älles übers Sparhäfele: <code>IN</code> ond no <code>STORE x</code> legt a Eingab
uf d’ Bühne, <code>LOAD x</code> ond no <code>OUT</code> gibt a Fächle raus.</p>
<p><b>Faustregel:</b> Vor jeden bedingta Hopfer (JE … JGE) a CMP – no weiß mr, worauf sich d’r Hopfer bezieht.
Weil au d’ Rechabefehl d’ Fähnla setzat, ka mr des CMP manchmol weglassa (z. B. <code>SUB #1</code> direkt
vor <code>JG</code>); des spart en Befehl – ond a Schwob spart gern –, aber mr übersieht’s leichter.</p>
<h2>Wie mr’s schreibt</h2>
<pre>; Kommentar
afang:  LOAD  #5      ; Direktwert
        ADD   x       ; Wert vom Fächle x
        STORE 42      ; Adress als Zahl
        JMP   afang   ; Hopfziel
x:      DATA  7       ; Datafächle: DATA 1, 2, 3</pre>
<p>A Zahl ohne <code>#</code> isch a <b>Adress</b> – für d’ Zahl 2 muass mr <code>#2</code> schreiba
(<code>MOD 2</code> rechnet mit dem, was em Fächle 2 drin isch).</p>
<p>Labels standat am Zeilaafang ond hörat mit <code>:</code> uff. <code>x+1</code> isch ’s Fächle nach <code>x</code>.
Groß oder kloi – des isch wurscht.</p>
<h2>Wie a Befehl abschafft wird</h2>
<p>{phases}. Jede Phas hot Schrittla (Takt); en jedem Takt fährt a Wert mit ra Schees
oder innerhalb vo d’r CPU.</p>
<h2>Tastatur</h2>
<p>F5 Los/Weiter · Leertaste Veschper · F10 Schrittle · Esc Nomol · P Beamer</p>`,
    },
  };

  function detect() {
    try {
      const q = new URLSearchParams(location.search).get('lang');
      if (LANGS.includes(q)) return q;
    } catch (e) { /* kein location */ }
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (LANGS.includes(s)) return s;
    } catch (e) { /* kein Speicher verfügbar */ }
    const nav = ((typeof navigator !== 'undefined' && navigator.language) || 'de').toLowerCase().slice(0, 2);
    return LANGS.includes(nav) ? nav : 'en';
  }

  const i18n = {
    LANGS,
    PARTIAL,
    messages,
    lang: detect(),

    setLang(lang, persist) {
      if (!LANGS.includes(lang)) return;
      this.lang = lang;
      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignorieren */ }
      }
    },

    t(key, params) {
      let msg = messages[this.lang][key];
      if (msg === undefined) msg = messages[PARTIAL[this.lang] || 'en'][key];   // fehlende Übersetzung
      if (msg === undefined) msg = messages.en[key];
      if (msg === undefined) msg = messages.de[key];
      if (msg === undefined) return key;
      return params ? msg.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m)) : msg;
    },

    // Eintrag eines Objekts je Sprache ({de, en, …}), z. B. Titel und Quelltext der Beispiele
    pick(obj, lang) {
      const l = lang || this.lang;
      return obj[l] ?? obj[PARTIAL[l]] ?? obj.en;
    },
  };

  VN.i18n = i18n;
  VN.t = (key, params) => i18n.t(key, params);
})(VN);
