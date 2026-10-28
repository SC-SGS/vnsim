// Sprachumschaltung Deutsch/Englisch: VN.t('schluessel', {platzhalter: wert})
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';

  const LANGS = ['de', 'en'];
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
    const nav = (typeof navigator !== 'undefined' && navigator.language) || 'de';
    return nav.toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  const i18n = {
    LANGS,
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
      if (msg === undefined) msg = messages.de[key];
      if (msg === undefined) return key;
      return params ? msg.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m)) : msg;
    },
  };

  VN.i18n = i18n;
  VN.t = (key, params) => i18n.t(key, params);
})(VN);
