// SVG-Darstellung der Maschine im Stil der Vorlesungsfolien (\VonNeumannBild, \ALUBild)
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const { MEM_SIZE, disassemble, byCode } = VN.isa;
  const t = VN.t;

  // Lage der Busse (Mittellinie)
  const BUS = { data: 372, addr: 402, ctrl: 432 };
  const BUS_H = 20;

  // Speicherraster
  const GRID = { x: 360, y: 514, w: 61, h: 26, cols: 10 };

  // Pfade der Wertplättchen; Schlüssel = route aus machine.js
  const ROUTES = {
    'pc>mem': [[590, 284], [590, BUS.addr], [640, BUS.addr], [640, 470]],
    'irArg>mem': [[850, 284], [850, BUS.addr], [640, BUS.addr], [640, 470]],
    'mem>irOp': [[560, 470], [560, BUS.data], [770, BUS.data], [770, 300], [715, 300], [715, 284]],
    'mem>irArg': [[560, 470], [560, BUS.data], [770, BUS.data], [770, 300], [800, 300], [800, 284]],
    'irOp>dec': [[730, 240], [730, 160]],
    'irArg>opReg': [[820, 240], [820, 226], [500, 226], [500, 70], [336, 70], [336, 88]],
    'irArg>pc': [[820, 240], [820, 226], [590, 226], [590, 240]],
    'mem>opReg': [[560, 470], [560, BUS.data], [482, BUS.data], [482, 110], [386, 110]],
    'opReg>acc': [[336, 132], [300, 175], [240, 215], [240, 285], [70, 285], [70, 110], [94, 110]],
    'alu>acc': [[240, 230], [240, 285], [70, 285], [70, 110], [94, 110]],
    'acc>mem': [[144, 88], [144, 74], [50, 74], [50, BUS.data], [560, BUS.data], [560, 470]],
    'in>acc': [[90, 520], [90, 500], [200, 500], [200, BUS.data], [50, BUS.data], [50, 74], [144, 74], [144, 88]],
    'acc>out': [[144, 88], [144, 74], [50, 74], [50, BUS.data], [200, BUS.data], [200, 500], [212, 500], [212, 520]],
  };

  function el(tag, attrs, parent, text) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  function pathD(points) { return 'M' + points.map(p => p.join(',')).join(' L'); }

  class View {
    constructor(svg, handlers) {
      this.svg = svg;
      this.handlers = handlers || {};
      this.build();
    }

    // Neu aufbauen, z. B. nach einem Sprachwechsel
    rebuild() {
      this.stopAnimation();
      while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
      this.build();
    }

    // ------------------------------------------------------------------ Aufbau

    build() {
      const svg = this.svg;
      this.regs = {};
      this.cells = [];
      svg.setAttribute('viewBox', '0 0 1000 790');
      const defs = el('defs', {}, svg);
      // Stealth-Pfeilspitze wie in TikZ
      for (const [id, cls] of [['arrow', 'arrow-data'], ['arrow-addr', 'arrow-addr'], ['arrow-ctrl', 'arrow-ctrl']]) {
        const mk = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7,
          orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs);
        el('path', { d: 'M0,0 L10,5 L0,10 L3,5 z', class: cls }, mk);
      }

      const lines = el('g', { class: 'lines' });   // Verbindungen zuerst …
      const boxes = el('g', {});                   // … darüber die Bausteine

      // CPU-Container mit Rechenwerk und Steuerwerk
      el('rect', { x: 20, y: 20, width: 960, height: 325, rx: 4, class: 'cpu' }, svg);
      el('text', { x: 30, y: 38, class: 'title cpu-title' }, svg, 'CPU');
      el('rect', { x: 35, y: 45, width: 460, height: 290, rx: 2, class: 'unit' }, svg);
      el('text', { x: 485, y: 63, class: 'title unit-title', 'text-anchor': 'end' }, svg, t('v.arith'));
      el('rect', { x: 510, y: 45, width: 460, height: 290, rx: 2, class: 'unit' }, svg);
      el('text', { x: 960, y: 63, class: 'title unit-title', 'text-anchor': 'end' }, svg, t('v.control'));

      // Speicherwerk und Ein-/Ausgabewerk
      el('rect', { x: 300, y: 470, width: 680, height: 310, rx: 2, class: 'memunit' }, svg);
      el('text', { x: 312, y: 490, class: 'title' }, svg, t('v.memory'));
      el('rect', { x: 20, y: 470, width: 265, height: 310, rx: 2, class: 'iounit' }, svg);
      el('text', { x: 32, y: 490, class: 'title' }, svg, t('v.io'));

      // Busse
      const busDefs = [['data', t('v.dataBus')], ['addr', t('v.addrBus')], ['ctrl', t('v.ctrlBus')]];
      this.busValues = {};
      this.busRects = {};
      for (const [id, label] of busDefs) {
        const y = BUS[id] - BUS_H / 2;
        this.busRects[id] = el('rect', { x: 20, y, width: 960, height: BUS_H, class: 'bus bus-' + id }, svg);
        el('text', { x: 30, y: BUS[id] + 4.5, class: 'bus-label bus-label-' + id }, svg, label);
        // Wert zwischen den Anschlüssen (x = 200 … 560), damit keine Linie die Zahl kreuzt
        this.busValues[id] = el('text', { x: 232, y: BUS[id] + 4.5, class: 'bus-label bus-value' }, svg, '');
      }

      svg.appendChild(lines);   // über den Bussen, mit weißem Rand an Kreuzungen
      svg.appendChild(boxes);

      // --- Verbindungslinien (Farbe nach Bus)
      const line = (pts, kind, ends) => {
        const attrs = { d: pathD(pts), class: 'conn conn-' + kind };
        const marker = `url(#${kind === 'data' ? 'arrow' : 'arrow-' + kind})`;
        if (ends === 'end' || ends === 'both') attrs['marker-end'] = marker;
        if (ends === 'start' || ends === 'both') attrs['marker-start'] = marker;
        el('path', { d: attrs.d, class: 'halo' }, lines);
        el('path', attrs, lines);
      };
      // Rechenwerk
      line([[144, 88], [144, 74], [50, 74], [50, BUS.data - BUS_H / 2]], 'data', 'both');
      line([[482, BUS.data - BUS_H / 2], [482, 110], [386, 110]], 'data', 'end');
      line([[144, 132], [144, 155]], 'data', 'end');
      line([[336, 132], [336, 155]], 'data', 'end');
      line([[240, 245], [240, 285], [70, 285], [70, 110], [94, 110]], 'data', 'end');
      line([[332, 232], [400, 232]], 'data', 'end');
      // Steuerwerk
      line([[590, 284], [590, BUS.addr - BUS_H / 2]], 'addr', 'end');
      line([[850, 284], [850, BUS.addr - BUS_H / 2]], 'addr', 'end');
      line([[770, BUS.data - BUS_H / 2], [770, 300]], 'data', 'none');
      line([[715, 300], [800, 300]], 'data', 'none');
      line([[715, 300], [715, 284]], 'data', 'end');
      line([[800, 300], [800, 284]], 'data', 'end');
      line([[730, 240], [730, 160]], 'data', 'end');
      line([[930, 335], [930, BUS.ctrl - BUS_H / 2]], 'ctrl', 'end');
      // Speicher und E/A
      line([[560, BUS.data + BUS_H / 2], [560, 470]], 'data', 'both');
      line([[640, BUS.addr + BUS_H / 2], [640, 470]], 'addr', 'end');
      line([[720, BUS.ctrl + BUS_H / 2], [720, 470]], 'ctrl', 'end');
      line([[200, BUS.data + BUS_H / 2], [200, 500]], 'data', 'none');
      line([[90, 500], [212, 500]], 'data', 'none');
      line([[90, 520], [90, 500]], 'data', 'end');
      line([[212, 500], [212, 520]], 'data', 'end');

      // --- Rechenwerk wie \ALUBild
      this.reg('acc', boxes, 94, 88, 100, 44, t('v.acc'));
      this.reg('opReg', boxes, 286, 88, 100, 44, t('v.opReg'));
      el('text', { x: 150, y: 149, class: 'small' }, boxes, 'Op. 1');
      el('text', { x: 342, y: 149, class: 'small' }, boxes, 'Op. 2');
      this.alu = el('path', { d: 'M80,155 L208,155 L240,182 L272,155 L400,155 L320,245 L160,245 Z', class: 'alu' }, boxes);
      this.aluOp = el('text', { x: 240, y: 208, class: 'alu-op', 'text-anchor': 'middle' }, boxes, '');
      el('text', { x: 240, y: 232, class: 'alu-label', 'text-anchor': 'middle' }, boxes, 'ALU');
      el('text', { x: 155, y: 300, class: 'small', 'text-anchor': 'middle' }, boxes, t('v.result'));
      this.reg('flags', boxes, 400, 210, 76, 44, t('v.flags'), 'flagreg');

      // --- Steuerwerk
      this.phaseChips = {};
      VN.PHASES.forEach((p, i) => {
        const x = 530 + i * 86;
        const g = el('g', { class: 'phase' }, boxes);
        el('rect', { x, y: 74, width: 82, height: 24, rx: 12 }, g);
        el('text', { x: x + 41, y: 90, 'text-anchor': 'middle' }, g, p.short);
        el('title', {}, g, `${p.name}: ${p.title}`);
        this.phaseChips[p.id] = g;
      });
      const dec = el('g', { class: 'reg' }, boxes);
      this.regs.dec = { rect: el('rect', { x: 530, y: 112, width: 426, height: 48, rx: 2 }, dec) };
      el('text', { x: 538, y: 125, class: 'reg-label' }, dec, t('v.decoder'));
      this.decText = el('text', { x: 538, y: 146, class: 'dec-text' }, dec, '');
      this.decDesc = el('text', { x: 948, y: 146, class: 'dec-desc', 'text-anchor': 'end' }, dec, '');
      this.reg('pc', boxes, 525, 240, 130, 44, t('v.pc'));
      this.reg('irOp', boxes, 680, 240, 70, 44, 'Opcode');
      this.reg('irArg', boxes, 750, 240, 120, 44, t('v.irArg'));
      el('text', { x: 738, y: 236, class: 'small' }, boxes, t('v.ir'));   // rechts vom Pfeil zum Decoder

      // --- Ein-/Ausgabewerk
      this.reg('inReg', boxes, 35, 520, 110, 44, t('v.in'));
      this.reg('outReg', boxes, 155, 520, 115, 44, t('v.out'));
      el('text', { x: 35, y: 592, class: 'reg-label' }, boxes, t('v.outputs'));
      this.outList = el('g', { class: 'outlist' }, boxes);

      // --- Speicherraster
      // Legende: Programm, Daten, zur Laufzeit veränderte Programmzelle (Ecke)
      el('rect', { x: 748, y: 480, width: 10, height: 10, class: 'cell kind-op' }, boxes);
      const lgProg = el('text', { x: 762, y: 489, class: 'small' }, boxes, t('v.program'));
      // Bei längeren Wörtern (z. B. Französisch) nach rechts ausweichen, sonst feste Lage
      const after = (text, x) => {
        try { const b = text.getBBox(); return Math.max(x, Math.ceil(b.x + b.width + 8)); } catch (e) { return x; }
      };
      const xData = after(lgProg, 830);
      el('rect', { x: xData, y: 480, width: 10, height: 10, class: 'cell kind-data' }, boxes);
      const lgData = el('text', { x: xData + 14, y: 489, class: 'small' }, boxes, t('v.data'));
      const xMod = after(lgData, 892);
      el('rect', { x: xMod, y: 480, width: 10, height: 10, class: 'cell kind-op' }, boxes);
      el('path', { d: `M${xMod + 4},480 L${xMod + 10},480 L${xMod + 10},486 Z`, class: 'cell-mod' }, boxes);
      el('text', { x: xMod + 14, y: 489, class: 'small' }, boxes, t('v.modified'));
      for (let c = 0; c < GRID.cols; c++) {
        el('text', { x: GRID.x + c * GRID.w + GRID.w / 2, y: GRID.y - 5, class: 'small grid-label',
          'text-anchor': 'middle' }, boxes, '+' + c);
      }
      for (let a = 0; a < MEM_SIZE; a++) {
        const r = Math.floor(a / GRID.cols), c = a % GRID.cols;
        const x = GRID.x + c * GRID.w, y = GRID.y + r * GRID.h;
        if (c === 0) {
          el('text', { x: GRID.x - 6, y: y + GRID.h / 2 + 4, class: 'small grid-label', 'text-anchor': 'end' },
            boxes, String(r * 10).padStart(2, '0'));
        }
        const g = el('g', { class: 'cellg' }, boxes);
        const rect = el('rect', { x, y, width: GRID.w, height: GRID.h, class: 'cell' }, g);
        const text = el('text', { x: x + GRID.w / 2, y: y + GRID.h / 2 + 4, class: 'cell-text',
          'text-anchor': 'middle' }, g, '0');
        const mod = el('path', { d: `M${x + GRID.w - 10},${y} L${x + GRID.w},${y} L${x + GRID.w},${y + 10} Z`,
          class: 'cell-mod', visibility: 'hidden' }, g);
        const title = el('title', {}, g, '');
        g.addEventListener('click', () => this.handlers.onCellClick && this.handlers.onCellClick(a));
        this.cells.push({ g, rect, text, mod, title, x, y });
      }

      // Ebene für die Wertplättchen
      this.tokenLayer = el('g', { class: 'tokens' }, svg);
    }

    // Register: Rahmen, Beschriftung oben, Wert darunter (binär zweizeilig)
    reg(id, parent, x, y, w, h, label, extraClass) {
      const g = el('g', { class: 'reg ' + (extraClass || '') }, parent);
      const rect = el('rect', { x, y, width: w, height: h, rx: 2 }, g);
      el('text', { x: x + 5, y: y + 12, class: 'reg-label' }, g, label);
      const text = el('text', { x: x + w / 2, y: y + 32, class: 'reg-value', 'text-anchor': 'middle' }, g, '');
      this.regs[id] = { rect, text, x, y, w, h };
    }

    setMultiline(textEl, lines, x, yBase, lineHeight) {
      while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
      if (lines.length === 1) { textEl.textContent = lines[0]; textEl.setAttribute('y', yBase); return; }
      textEl.setAttribute('y', yBase - lineHeight / 2);
      lines.forEach((l, i) => el('tspan', { x, dy: i === 0 ? 0 : lineHeight }, textEl, l));
    }

    setReg(id, value, mode) {
      const r = this.regs[id];
      const lines = typeof value === 'string' ? [value] : VN.format(value, mode);
      r.text.classList.toggle('bin', lines.length > 1);
      this.setMultiline(r.text, lines, r.x + r.w / 2, r.y + 32, 10);
    }

    // ------------------------------------------------------------------ Aktualisieren

    // m: Maschine, info: {mode, cells, step}
    render(m, info) {
      const mode = info.mode;
      const step = info.step || {};
      const active = new Set(step.active || []);

      this.setReg('acc', m.acc, mode);
      this.setReg('opReg', m.opReg, mode);
      this.setReg('pc', m.pc, mode);
      this.setReg('irOp', m.ir.op, mode);
      this.setReg('irArg', m.ir.arg, mode);
      this.setReg('inReg', m.inReg, mode);
      this.setReg('outReg', m.outReg, mode);
      this.setReg('flags', `Z ${+m.flags.z}  N ${+m.flags.n}`);
      for (const [id, r] of Object.entries(this.regs)) r.rect.classList.toggle('active', active.has(id));
      this.regs.inReg.rect.classList.toggle('waiting', m.waiting);
      this.alu.classList.toggle('active', active.has('alu'));

      // ALU-Anzeige
      const ins = m.decoded && m.decoded.ins;
      const f = (v) => VN.formatInline(v, mode === 'bin' ? 'dec' : mode);   // binär passt nicht in die ALU
      this.aluOp.textContent = !(ins && ins.op) ? ''
        : m.aluIn ? `${f(m.aluIn[0])} ${VN.isa.ALU_OPS[ins.op].symbol} ${f(m.aluIn[1])} = ${f(m.aluResult)}`
          : VN.isa.ALU_OPS[ins.op].symbol;

      // Decoder
      this.decText.textContent = m.decoded ? m.decoded.text : '';
      this.decDesc.textContent = m.decoded ? VN.isa.text(m.decoded.ins) : '';

      // Phasen
      for (const [id, g] of Object.entries(this.phaseChips)) {
        g.classList.toggle('current', !m.halted && m.phase === id && !!info.step);
      }

      // Busse
      this.busValues.addr.textContent = m.bus.addr === null ? '' : VN.formatInline(m.bus.addr, mode);
      this.busValues.data.textContent = m.bus.data === null ? '' : VN.formatInline(m.bus.data, mode);
      this.busValues.ctrl.textContent = m.bus.ctrl ? t('bus.' + m.bus.ctrl) : '';
      for (const [id, r] of Object.entries(this.busRects)) r.classList.toggle('active', step.bus === id);

      // Ausgaben (die letzten 8)
      while (this.outList.firstChild) this.outList.removeChild(this.outList.firstChild);
      const outs = m.outputs.slice(-8);
      outs.forEach((v, i) => {
        const nr = m.outputs.length - outs.length + i + 1;
        el('text', { x: 40, y: 614 + i * 20, class: 'small' }, this.outList, `${nr}.`);
        el('text', { x: 140, y: 614 + i * 20, class: 'out-value', 'text-anchor': 'end' }, this.outList,
          VN.formatInline(v, mode));
      });

      // Speicher
      const cells = info.cells || [];
      const instrStart = (m.halted || m.instrAddr === null) ? null : m.instrAddr;
      for (let a = 0; a < MEM_SIZE; a++) {
        const c = this.cells[a];
        const v = m.mem[a];
        const lines = VN.format(v, mode);
        this.setMultiline(c.text, lines, c.x + GRID.w / 2, c.y + GRID.h / 2 + 4, 10);
        c.text.classList.toggle('bin', lines.length > 1);
        const { kind, modified } = m.cellKind(a, cells[a] && cells[a].kind);
        c.mod.setAttribute('visibility', modified ? 'visible' : 'hidden');
        c.rect.setAttribute('class', 'cell kind-' + (kind === 'arg' ? 'op' : kind)
          + (a === step.cell ? (step.write ? ' accessed write' : ' accessed') : '')
          + (a === m.pc && !m.halted ? ' pc' : '')
          + (instrStart !== null && (a === instrStart || a === instrStart + 1) ? ' current' : ''));
        c.text.classList.toggle('zero', v === 0 && kind === 'free');
        const ins = byCode.get(v);
        let tip = t('v.cellTip', { a, v });
        if (kind === 'op' && ins) tip += ` = ${disassemble(v, m.mem[a + 1], m.names)}`;
        if (cells[a] && cells[a].label) tip += `  (${cells[a].label})`;
        if (modified) tip += '\n' + t('v.modifiedTip');
        c.title.textContent = tip + '\n' + t('v.clickEdit');
      }
    }

    // ------------------------------------------------------------------ Animation

    // Wertplättchen entlang des Pfads bewegen; liefert ein Promise
    animate(route, text, duration) {
      const pts = ROUTES[route];
      if (!pts || duration <= 0) return Promise.resolve();
      const g = el('g', { class: 'token' }, this.tokenLayer);
      const w = Math.max(28, text.length * 8 + 12);
      el('rect', { x: -w / 2, y: -10, width: w, height: 20, rx: 3 }, g);
      el('text', { x: 0, y: 4.5, 'text-anchor': 'middle' }, g, text);

      const seg = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        seg.push(len);
        total += len;
      }
      const at = (d) => {
        for (let i = 0; i < seg.length; i++) {
          if (d <= seg[i] || i === seg.length - 1) {
            const t = seg[i] ? Math.min(1, d / seg[i]) : 1;
            return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
          }
          d -= seg[i];
        }
        return pts[pts.length - 1];
      };

      return new Promise(resolve => {
        const t0 = performance.now();
        const finish = () => {
          if (!g.isConnected) return;
          g.remove();
          clearTimeout(guard);
          this.cancelAnimation = null;
          resolve();
        };
        // Ohne requestAnimationFrame (Hintergrund-Tab, headless) endet die Animation trotzdem
        const guard = setTimeout(finish, duration + 150);
        this.cancelAnimation = finish;
        const frame = (now) => {
          if (!g.isConnected) return;
          const u = Math.min(1, (now - t0) / duration);
          const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;  // ease-in-out
          const [x, y] = at(e * total);
          g.setAttribute('transform', `translate(${x},${y})`);
          if (u < 1) requestAnimationFrame(frame);
          else finish();
        };
        const [x0, y0] = pts[0];
        g.setAttribute('transform', `translate(${x0},${y0})`);
        requestAnimationFrame(frame);
      });
    }

    stopAnimation() { if (this.cancelAnimation) this.cancelAnimation(); }
  }

  VN.View = View;
})(VN);
