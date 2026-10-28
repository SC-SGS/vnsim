// Befehlssatz des Modellrechners – einzige Quelle für Assembler, Decoder, Disassembly und Hilfe.
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';

  const MEM_SIZE = 100;
  const MIN_VALUE = -9999;
  const MAX_VALUE = 9999;

  // Ganzzahlige Division und Rest wie in Python (// und %): Abrunden Richtung -∞
  function floorDiv(a, b) { return Math.floor(a / b); }
  function floorMod(a, b) { return a - b * Math.floor(a / b); }

  const ALU_OPS = {
    '+': { symbol: '+', apply: (a, b) => a + b },
    '-': { symbol: '−', apply: (a, b) => a - b },
    '*': { symbol: '·', apply: (a, b) => a * b },
    '//': { symbol: '//', apply: floorDiv },
    '%': { symbol: '%', apply: floorMod },
  };

  // operand: 'none' | 'addr' (Speicheradresse) | 'imm' (Direktwert #n) | 'target' (Sprungziel)
  // kind:    bestimmt die Mikroschrittfolge in machine.js; Texte stehen in i18n.js ('ins.<code>', 'cond.<code>')
  const INSTRUCTIONS = [
    { code: 0, mnemonic: 'HALT', operand: 'none', kind: 'halt' },
    { code: 1, mnemonic: 'LOAD', operand: 'addr', kind: 'load' },
    { code: 11, mnemonic: 'LOAD', operand: 'imm', kind: 'load' },
    { code: 2, mnemonic: 'STORE', operand: 'addr', kind: 'store' },
    { code: 3, mnemonic: 'ADD', operand: 'addr', kind: 'alu', op: '+' },
    { code: 13, mnemonic: 'ADD', operand: 'imm', kind: 'alu', op: '+' },
    { code: 4, mnemonic: 'SUB', operand: 'addr', kind: 'alu', op: '-' },
    { code: 14, mnemonic: 'SUB', operand: 'imm', kind: 'alu', op: '-' },
    { code: 5, mnemonic: 'MUL', operand: 'addr', kind: 'alu', op: '*' },
    { code: 15, mnemonic: 'MUL', operand: 'imm', kind: 'alu', op: '*' },
    { code: 6, mnemonic: 'DIV', operand: 'addr', kind: 'alu', op: '//' },
    { code: 16, mnemonic: 'DIV', operand: 'imm', kind: 'alu', op: '//' },
    { code: 7, mnemonic: 'MOD', operand: 'addr', kind: 'alu', op: '%' },
    { code: 17, mnemonic: 'MOD', operand: 'imm', kind: 'alu', op: '%' },
    { code: 8, mnemonic: 'CMP', operand: 'addr', kind: 'cmp', op: '-' },
    { code: 18, mnemonic: 'CMP', operand: 'imm', kind: 'cmp', op: '-' },
    { code: 20, mnemonic: 'JMP', operand: 'target', kind: 'jump' },
    { code: 21, mnemonic: 'JE', operand: 'target', kind: 'jump', test: f => f.z },
    { code: 22, mnemonic: 'JNE', operand: 'target', kind: 'jump', test: f => !f.z },
    { code: 23, mnemonic: 'JL', operand: 'target', kind: 'jump', test: f => f.n },
    { code: 24, mnemonic: 'JLE', operand: 'target', kind: 'jump', test: f => f.n || f.z },
    { code: 25, mnemonic: 'JG', operand: 'target', kind: 'jump', test: f => !f.n && !f.z },
    { code: 26, mnemonic: 'JGE', operand: 'target', kind: 'jump', test: f => !f.n },
    { code: 30, mnemonic: 'IN', operand: 'none', kind: 'in' },
    { code: 31, mnemonic: 'OUT', operand: 'none', kind: 'out' },
  ];

  const byCode = new Map(INSTRUCTIONS.map(ins => [ins.code, ins]));

  // Mnemonic → { none|addr|imm|target: Befehl }
  const byMnemonic = new Map();
  for (const ins of INSTRUCTIONS) {
    if (!byMnemonic.has(ins.mnemonic)) byMnemonic.set(ins.mnemonic, {});
    byMnemonic.get(ins.mnemonic)[ins.operand] = ins;
  }

  // Lesbare Form eines Befehls; names bildet Adressen optional auf Labels ab
  function disassemble(code, arg, names) {
    const ins = byCode.get(code);
    if (!ins) return null;
    switch (ins.operand) {
      case 'none': return ins.mnemonic;
      case 'imm': return ins.mnemonic + ' #' + arg;
      default: return ins.mnemonic + ' ' + ((names && names[arg]) || arg);
    }
  }

  function inRange(v) { return Number.isInteger(v) && v >= MIN_VALUE && v <= MAX_VALUE; }

  // Beschreibung und Sprungbedingung in der aktuellen Sprache (i18n.js)
  function text(ins) { return VN.t('ins.' + ins.code); }
  function cond(ins) { return ins.test ? VN.t('cond.' + ins.code) : null; }

  VN.isa = { MEM_SIZE, MIN_VALUE, MAX_VALUE, ALU_OPS, INSTRUCTIONS, byCode, byMnemonic, disassemble, inRange,
    text, cond };
})(VN);
