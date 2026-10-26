// Von-Neumann-Maschine: Zustand und Befehlszyklus als Folge von Mikroschritten (ohne DOM)
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';
  const { MEM_SIZE, MIN_VALUE, MAX_VALUE, ALU_OPS, byCode, disassemble, inRange } = VN.isa;
  const t = VN.t;

  // Phasennamen englisch wie auf den Folien; Erklärung über i18n ('phase.<id>')
  const PHASES = [
    { id: 'fetch', name: 'Fetch', short: 'Fetch' },
    { id: 'decode', name: 'Decode', short: 'Decode' },
    { id: 'operands', name: 'Fetch Operands', short: 'Fetch Op.' },
    { id: 'execute', name: 'Execute', short: 'Execute' },
    { id: 'writeback', name: 'Write Back', short: 'Write Back' },
  ];
  for (const p of PHASES) Object.defineProperty(p, 'title', { get: () => t('phase.' + p.id) });

  class MachineError extends Error {}

  class Machine {
    constructor() {
      this.names = {};
      this.load(new Array(MEM_SIZE).fill(0));
    }

    // Speicherabbild übernehmen und alle Register zurücksetzen
    load(memory, names) {
      this.initial = memory.slice();
      if (names) this.names = names;
      this.reset();
    }

    reset() {
      this.mem = this.initial.slice();
      this.pc = 0;
      this.acc = 0;
      this.opReg = 0;
      this.ir = { op: 0, arg: 0 };
      this.flags = { z: false, n: false };
      this.aluResult = null;
      this.aluIn = null;
      this.inReg = null;
      this.outReg = null;
      this.outputs = [];
      this.inputQueue = [];
      this.bus = { addr: null, data: null, ctrl: null };
      this.decoded = null;
      this.instrAddr = null;
      this.phase = null;
      this.halted = false;
      this.error = null;
      this.waiting = false;
      this.counters = { instructions: 0, steps: 0, memAccess: 0 };
      // Nutzung zur Laufzeit: als Befehl geholt ('op'/'arg') bzw. beschrieben
      this.fetchedAs = new Array(MEM_SIZE).fill(null);
      this.written = new Array(MEM_SIZE).fill(false);
      this.gen = this.cycle();
    }

    // Nächster Mikroschritt (oder Markierung für Phasen-/Befehlsende).
    // Rückgabe null, wenn die Maschine angehalten hat.
    step() {
      if (this.halted) return null;
      let res;
      try {
        res = this.gen.next();
      } catch (e) {
        if (!(e instanceof MachineError)) throw e;
        this.halted = true;
        this.error = e.message;
        return { type: 'error', phase: this.phase, text: e.message };
      }
      if (res.done) { this.halted = true; return null; }
      const s = res.value;
      this.waiting = s.type === 'wait';
      if (s.type === 'micro') this.counters.steps++;
      return s;
    }

    provideInput(value) { this.inputQueue.push(value); }

    // ------------------------------------------------------------------ Hilfsfunktionen

    checkValue(v, what) {
      if (!inRange(v)) {
        throw new MachineError(t('m.overflow', { what, v, min: MIN_VALUE, max: MAX_VALUE }));
      }
      return v;
    }

    checkAddr(a, what) {
      if (!Number.isInteger(a) || a < 0 || a >= MEM_SIZE) {
        throw new MachineError(t('outOfMem', { what, v: a, max: MEM_SIZE - 1 }));
      }
      return a;
    }

    readMem(a) { this.counters.memAccess++; return this.mem[a]; }
    writeMem(a, v) { this.counters.memAccess++; this.mem[a] = v; this.written[a] = true; }

    // Rolle einer Zelle für die Darstellung: Assembler-Sicht (staticKind), ergänzt um die Nutzung zur Laufzeit.
    // kind: 'op' | 'arg' | 'data' | 'free'; modified: Programmzelle wurde zur Laufzeit überschrieben.
    cellKind(a, staticKind) {
      const base = staticKind || 'free';
      const isCode = !!this.fetchedAs[a] || base === 'op' || base === 'arg';
      let kind = base;
      if (this.fetchedAs[a]) kind = this.fetchedAs[a];
      else if (!isCode && this.written[a]) kind = 'data';
      return { kind, modified: isCode && this.written[a] };
    }

    name(a) { return this.names[a] ? `${a} (${this.names[a]})` : String(a); }

    // Mikroschritt erzeugen; route = Schlüssel für die Animation in view.js
    micro(text, opts) {
      return Object.assign({ type: 'micro', phase: this.phase, text }, opts || {});
    }

    // ------------------------------------------------------------------ Befehlszyklus

    *cycle() {
      for (;;) {
        // 1. FETCH – beide Zellen des Befehls holen
        this.phase = 'fetch';
        this.instrAddr = this.pc;
        this.aluResult = null;
        this.aluIn = null;
        this.decoded = null;
        for (const part of ['op', 'arg']) {
          this.checkAddr(this.pc, t('what.pc'));
          this.bus.addr = this.pc;
          this.bus.ctrl = 'read';
          yield this.micro(t('m.pcToBus', { pc: this.pc }),
            { route: 'pc>mem', value: this.pc, bus: 'addr', active: ['pc'], cell: this.pc });
          const v = this.readMem(this.pc);
          this.fetchedAs[this.pc] = part;
          this.bus.data = v;
          this.ir[part] = v;
          const target = part === 'op' ? 'Opcode' : 'Operand';
          yield this.micro(t('m.fetchToIr', { a: this.pc, v, part: target }),
            { route: part === 'op' ? 'mem>irOp' : 'mem>irArg', value: v, bus: 'data',
              active: [part === 'op' ? 'irOp' : 'irArg'], cell: this.pc });
          this.pc += 1;
          this.bus.ctrl = null;
          yield this.micro(t('m.pcInc', { pc: this.pc }), { active: ['pc'], value: this.pc });
        }
        yield { type: 'phaseEnd', phase: 'fetch' };

        // 2. DECODE
        this.phase = 'decode';
        const ins = byCode.get(this.ir.op);
        if (!ins) {
          throw new MachineError(t('m.badOpcode', { op: this.ir.op, a: this.pc - 2 }));
        }
        this.decoded = { ins, text: disassemble(ins.code, this.ir.arg, this.names) };
        yield this.micro(t('m.decode', { op: this.ir.op, m: ins.mnemonic, text: VN.isa.text(ins) }),
          { route: 'irOp>dec', value: this.ir.op, active: ['dec'] });
        yield { type: 'phaseEnd', phase: 'decode' };

        // 3. FETCH OPERANDS – nur für Befehle, die einen Wert brauchen
        const needsValue = ['load', 'alu', 'cmp', 'out'].includes(ins.kind);
        if (needsValue) {
          this.phase = 'operands';
          if (ins.operand === 'imm') {
            this.opReg = this.ir.arg;
            yield this.micro(t('m.immToOp', { v: this.ir.arg }),
              { route: 'irArg>opReg', value: this.ir.arg, active: ['opReg'] });
          } else {
            const a = this.checkAddr(this.ir.arg, t('what.addr'));
            this.bus.addr = a;
            this.bus.ctrl = 'read';
            yield this.micro(t('m.addrToBus', { a: this.name(a) }),
              { route: 'irArg>mem', value: a, bus: 'addr', active: ['irArg'], cell: a });
            const v = this.readMem(a);
            this.bus.data = v;
            this.opReg = v;
            this.bus.ctrl = null;
            yield this.micro(t('m.memToOp', { a, v }),
              { route: 'mem>opReg', value: v, bus: 'data', active: ['opReg'], cell: a });
          }
          yield { type: 'phaseEnd', phase: 'operands' };
        }

        // 4. EXECUTE
        this.phase = 'execute';
        let executed = true;
        switch (ins.kind) {
          case 'halt':
            this.halted = true;
            this.counters.instructions++;
            yield this.micro(t('m.halt'), { active: ['dec'], halt: true });
            return;
          case 'alu':
          case 'cmp': {
            const op = ALU_OPS[ins.op];
            if ((ins.op === '//' || ins.op === '%') && this.opReg === 0) {
              throw new MachineError(t('m.div0', { m: ins.mnemonic }));
            }
            const r = op.apply(this.acc, this.opReg);
            this.aluIn = [this.acc, this.opReg];
            this.flags = { z: r === 0, n: r < 0 };
            const flagText = `Z = ${+this.flags.z}, N = ${+this.flags.n}`;
            if (ins.kind === 'cmp') {
              this.aluResult = r;
              yield this.micro(t('m.cmp', { a: this.acc, b: this.opReg, r, flags: flagText }),
                { active: ['alu', 'flags'] });
            } else {
              this.aluResult = this.checkValue(r, t('what.result'));
              yield this.micro(t('m.alu', { a: this.acc, op: op.symbol, b: this.opReg, r, flags: flagText }),
                { active: ['alu', 'flags'] });
            }
            break;
          }
          case 'jump': {
            const target = this.checkAddr(this.ir.arg, t('what.target'));
            const cond = VN.isa.cond(ins);
            if (!ins.test || ins.test(this.flags)) {
              this.pc = target;
              const why = cond ? t('m.condMet', { cond }) : t('m.always');
              yield this.micro(t('m.jump', { why, t: this.name(target) }),
                { route: 'irArg>pc', value: target, active: ['pc', 'flags'] });
            } else {
              yield this.micro(t('m.noJump', { cond, pc: this.pc }),
                { active: ['flags'] });
            }
            break;
          }
          default:
            executed = false;  // load/store/in/out: Datentransport erst in der Write-Back-Phase
        }
        if (executed) yield { type: 'phaseEnd', phase: 'execute' };

        // 5. WRITE BACK
        this.phase = 'writeback';
        let wroteBack = true;
        switch (ins.kind) {
          case 'alu':
            this.acc = this.aluResult;
            yield this.micro(t('m.resToAcc', { v: this.acc }), { route: 'alu>acc', value: this.acc, active: ['acc'] });
            break;
          case 'load':
            this.acc = this.opReg;
            yield this.micro(t('m.opToAcc', { v: this.acc }), { route: 'opReg>acc', value: this.acc, active: ['acc'] });
            break;
          case 'store': {
            const a = this.checkAddr(this.ir.arg, t('what.addr'));
            this.bus.addr = a;
            this.bus.ctrl = 'write';
            yield this.micro(t('m.addrToBus', { a: this.name(a) }),
              { route: 'irArg>mem', value: a, bus: 'addr', active: ['irArg'], cell: a });
            this.bus.data = this.acc;
            this.writeMem(a, this.acc);
            yield this.micro(t('m.accToMem', { v: this.acc, a }),
              { route: 'acc>mem', value: this.acc, bus: 'data', active: ['acc'], cell: a, write: true });
            this.bus.ctrl = null;
            break;
          }
          case 'in': {
            const a = this.checkAddr(this.ir.arg, t('what.addr'));
            while (this.inputQueue.length === 0) {
              yield { type: 'wait', phase: this.phase, text: t('m.wait') };
            }
            this.inReg = this.checkValue(this.inputQueue.shift(), t('what.input'));
            yield this.micro(t('m.inToReg', { v: this.inReg }), { active: ['inReg'], value: this.inReg });
            this.bus.addr = a;
            this.bus.ctrl = 'write';
            yield this.micro(t('m.addrToBus', { a: this.name(a) }),
              { route: 'irArg>mem', value: a, bus: 'addr', active: ['irArg'], cell: a });
            this.bus.data = this.inReg;
            this.writeMem(a, this.inReg);
            yield this.micro(t('m.inToMem', { v: this.inReg, a }),
              { route: 'in>mem', value: this.inReg, bus: 'data', active: ['inReg'], cell: a, write: true });
            this.bus.ctrl = null;
            break;
          }
          case 'out':
            this.outReg = this.opReg;
            this.outputs.push(this.outReg);
            this.bus.data = this.outReg;
            yield this.micro(t('m.opToOut', { v: this.outReg }),
              { route: 'opReg>out', value: this.outReg, bus: 'data', active: ['outReg'], output: true });
            break;
          default:
            wroteBack = false;
        }
        if (wroteBack) yield { type: 'phaseEnd', phase: 'writeback' };

        this.counters.instructions++;
        yield { type: 'instrEnd' };
      }
    }

    // Läuft ohne Animation bis HALT, Fehler, fehlende Eingabe oder Schrittlimit (für Tests)
    runToEnd(maxSteps) {
      let s;
      let n = 0;
      while ((s = this.step())) {
        if (s.type === 'wait' || s.type === 'error') return s;
        if (++n > (maxSteps || 1e6)) return { type: 'limit' };
      }
      return null;
    }
  }

  VN.PHASES = PHASES;
  VN.Machine = Machine;
  VN.MachineError = MachineError;
})(VN);
