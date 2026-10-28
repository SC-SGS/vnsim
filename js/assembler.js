// Assembler: Quelltext → Speicherabbild (2 Zellen je Befehl: Opcode, Operand)
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';
  const { MEM_SIZE, byMnemonic, inRange, MIN_VALUE, MAX_VALUE } = VN.isa;
  const t = VN.t;
  const RANGE = { min: MIN_VALUE, max: MAX_VALUE };

  const LABEL_RE = /^([A-Za-z_][A-Za-z0-9_]*)\s*:/;
  const LABEL_OFFSET_RE = /^([A-Za-z_][A-Za-z0-9_]*)\s*([+-]\s*\d+)?$/;
  const INT_RE = /^[+-]?\d+$/;

  // Ergebnis: { ok, memory[100], cells[100]: {kind: 'op'|'arg'|'data'|'free', line, label},
  //             labels: {name: addr}, names: {addr: Name}, errors: [{line, message}] }
  function assemble(source) {
    const errors = [];
    const items = [];          // {line, label, mnemonic, args}
    const labels = new Map();  // kleingeschrieben → {name, addr}
    let pendingLabels = [];
    let addr = 0;

    const lines = source.split(/\r?\n/);
    lines.forEach((raw, i) => {
      const line = i + 1;
      let text = raw.replace(/;.*$/, '').trim();

      // Labels am Zeilenanfang (auch mehrere bzw. allein in der Zeile)
      let m;
      while ((m = LABEL_RE.exec(text))) {
        const name = m[1];
        const key = name.toLowerCase();
        if (byMnemonic.has(name.toUpperCase()) || key === 'data') {
          errors.push({ line, message: t('asm.mnemonicLabel', { name }) });
        } else if (labels.has(key)) {
          errors.push({ line, message: t('asm.dupLabel', { name }) });
        } else {
          const entry = { name, addr: null, line };
          labels.set(key, entry);
          pendingLabels.push(entry);
        }
        text = text.slice(m[0].length).trim();
      }
      if (!text) return;

      const sp = text.search(/\s/);
      const mnemonic = (sp < 0 ? text : text.slice(0, sp)).toUpperCase();
      const rest = sp < 0 ? '' : text.slice(sp).trim();
      const args = rest ? rest.split(',').map(s => s.trim()) : [];

      let size;
      if (mnemonic === 'DATA') {
        if (args.length === 0 || args.some(a => a === '')) {
          errors.push({ line, message: t('asm.dataArgs') });
          return;
        }
        size = args.length;
      } else if (byMnemonic.has(mnemonic)) {
        size = 2;
      } else {
        errors.push({ line, message: t('asm.unknown', { m: mnemonic }) });
        return;
      }

      for (const entry of pendingLabels) entry.addr = addr;
      items.push({ line, mnemonic, args, addr, labelNames: pendingLabels.map(e => e.name) });
      pendingLabels = [];
      addr += size;
    });
    // Label am Ende ohne folgenden Befehl zeigt auf die nächste freie Zelle
    for (const entry of pendingLabels) entry.addr = addr;

    if (addr > MEM_SIZE) {
      errors.push({ line: items[items.length - 1].line,
        message: t('asm.tooBig', { n: addr, max: MEM_SIZE }) });
    }

    const memory = new Array(MEM_SIZE).fill(0);
    const cells = Array.from({ length: MEM_SIZE }, () => ({ kind: 'free', line: null, label: null }));
    const put = (a, value, kind, line, label) => {
      if (a < MEM_SIZE) { memory[a] = value; cells[a] = { kind, line, label: label || null }; }
    };

    function resolveAddress(arg, line, what) {
      if (INT_RE.test(arg)) {
        const v = parseInt(arg, 10);
        if (v < 0 || v >= MEM_SIZE) {
          errors.push({ line, message: t('outOfMem', { what, v, max: MEM_SIZE - 1 }) });
          return 0;
        }
        return v;
      }
      // Label, optional mit Abstand: schleife, befehl+1
      const m = LABEL_OFFSET_RE.exec(arg);
      if (m) {
        const entry = labels.get(m[1].toLowerCase());
        if (!entry) {
          errors.push({ line, message: t('asm.undefLabel', { name: m[1] }) });
          return 0;
        }
        const v = entry.addr + (m[2] ? parseInt(m[2].replace(/\s/g, ''), 10) : 0);
        if (v < 0 || v >= MEM_SIZE) {
          errors.push({ line, message: t('outOfMem', { what, v: `${arg} = ${v}`, max: MEM_SIZE - 1 }) });
          return 0;
        }
        return v;
      }
      errors.push({ line, message: t('asm.badOperand', { arg }) });
      return 0;
    }

    for (const item of items) {
      const { line, mnemonic, args, addr: a } = item;
      const label = item.labelNames[0];
      if (mnemonic === 'DATA') {
        args.forEach((arg, k) => {
          let v = 0;
          if (!INT_RE.test(arg)) errors.push({ line, message: t('asm.notInt', { arg }) });
          else {
            v = parseInt(arg, 10);
            if (!inRange(v)) {
              errors.push({ line, message: t('asm.valueRange', Object.assign({ v }, RANGE)) });
              v = 0;
            }
          }
          put(a + k, v, 'data', line, k === 0 ? label : null);
        });
        continue;
      }

      const variants = byMnemonic.get(mnemonic);
      let ins = null;
      let value = 0;
      if (variants.none) {
        if (args.length > 0) {
          const io = variants.none.kind === 'in' || variants.none.kind === 'out';
          errors.push({ line, message: t(io ? 'asm.ioOperand' : 'asm.noOperand', { m: mnemonic }) });
        }
        ins = variants.none;
      } else if (args.length !== 1) {
        errors.push({ line, message: t('asm.oneOperand', { m: mnemonic }) });
        ins = Object.values(variants)[0];
      } else {
        const arg = args[0];
        if (arg.startsWith('#')) {
          ins = variants.imm;
          const num = arg.slice(1).trim();
          if (!ins) {
            ins = Object.values(variants)[0];
            errors.push({ line, message: t('asm.noImm', { m: mnemonic }) });
          } else if (!INT_RE.test(num)) {
            errors.push({ line, message: t('asm.immNotInt', { arg }) });
          } else {
            value = parseInt(num, 10);
            if (!inRange(value)) {
              errors.push({ line, message: t('asm.immRange', Object.assign({ v: value }, RANGE)) });
              value = 0;
            }
          }
        } else {
          ins = variants.addr || variants.target;
          value = resolveAddress(arg, line, t(ins.operand === 'target' ? 'what.target' : 'what.addr'));
        }
      }
      put(a, ins.code, 'op', line, label);
      put(a + 1, value, 'arg', line, null);
    }

    const labelObj = {};
    const names = {};
    for (const entry of labels.values()) {
      labelObj[entry.name] = entry.addr;
      if (!(entry.addr in names)) names[entry.addr] = entry.name;
    }
    errors.sort((x, y) => x.line - y.line);
    return { ok: errors.length === 0, memory, cells, labels: labelObj, names, errors, size: addr };
  }

  VN.assemble = assemble;
})(VN);
