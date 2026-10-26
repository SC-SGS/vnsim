// Bedienoberfläche: Editor, Ablaufsteuerung, Speichertabelle, Laden/Speichern/Teilen
(function () {
  'use strict';
  const { MEM_SIZE, MIN_VALUE, MAX_VALUE, INSTRUCTIONS, disassemble, byCode } = VN.isa;
  const t = VN.t;
  const lang = () => VN.i18n.lang;
  const $ = (id) => document.getElementById(id);

  // Animationsdauer je Mikroschritt und Pause je Befehl ohne Animation, nach Tempo 1 … 6
  const ANIM_MS = [1600, 1000, 650, 400, 220, 110];
  const NOANIM_INSTR_MS = [800, 400, 150, 50, 10, 0];
  const STEP_LIMIT = 200000;
  const STORAGE_KEY = 'vnsim-source';

  const machine = new VN.Machine();
  let program = VN.assemble('');      // letztes Assemblerergebnis (cells, names)
  let loadedSource = null;             // Quelltext, aus dem der Speicher stammt
  let runId = 0;                       // erhöht bei Reset/Pause → laufende Schleife bricht ab
  let busy = false;                    // Schleife läuft gerade
  let running = false;                 // Dauerlauf (Start) statt Einzelschritt
  let resumeUnit = null;               // nach Eingabe fortsetzen mit dieser Schrittweite
  let lastStep = null;
  let newInstruction = true;

  const ui = {
    source: $('source'), gutter: $('gutter'), lineHl: $('line-hl'), errors: $('errors'),
    status: $('status'), statusPhase: $('status-phase'), statusText: $('status-text'),
    microlog: $('microlog'), input: $('input'), btnInput: $('btn-input'),
    run: $('btn-run'), pause: $('btn-pause'), step: $('btn-step'), reset: $('btn-reset'),
    granularity: $('sel-granularity'), speed: $('rng-speed'), anim: $('chk-anim'), format: $('sel-format'),
    memtable: $('memtable'),
  };

  const view = new VN.View($('machine'), { onCellClick: focusMemoryCell });

  // ------------------------------------------------------------------ Hilfsfunktionen

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const speed = () => +ui.speed.value - 1;
  const fmtMode = () => ui.format.value;
  const started = () => machine.counters.steps > 0 && !machine.halted;
  const phaseName = (id) => (VN.PHASES.find(p => p.id === id) || { name: '' }).name;
  const phaseShort = (id) => (VN.PHASES.find(p => p.id === id) || { short: '' }).short;

  function setStatus(kind, badge, text) {
    ui.status.className = 'status' + (kind ? ' ' + kind : '');
    ui.statusPhase.textContent = badge;
    ui.statusText.textContent = text;
  }

  function storeSource() {
    try { localStorage.setItem(STORAGE_KEY, ui.source.value); } catch (e) { /* privat/gesperrt */ }
  }

  // ------------------------------------------------------------------ Assemblieren / Laden

  function assembleAndLoad() {
    const src = ui.source.value;
    program = VN.assemble(src);
    showErrors(program.errors);
    if (!program.ok) {
      const e = program.errors[0];
      setStatus('error', t('st.error'), t('st.errLine', { line: e.line, msg: e.message }) +
        (program.errors.length > 1 ? t('st.more', { n: program.errors.length - 1 }) : ''));
      return false;
    }
    machine.load(program.memory, program.names);
    loadedSource = src;
    newInstruction = true;
    lastStep = null;
    ui.microlog.innerHTML = '';
    return true;
  }

  function ensureLoaded() {
    if (loadedSource !== ui.source.value) return assembleAndLoad();
    if (machine.halted) {   // erneut starten: Speicher wie nach dem Laden
      machine.reset();
      newInstruction = true;
      lastStep = null;
      ui.microlog.innerHTML = '';
    }
    return true;
  }

  // ------------------------------------------------------------------ Ablauf

  async function execute(unit) {
    if (busy) return;
    if (!machine.waiting && !ensureLoaded()) { render(); return; }
    const myRun = ++runId;
    busy = true;
    running = unit === 'end';
    updateControls();
    if (!started()) setStatus('', t('st.running'), t('st.runningText'));

    let count = 0;
    let lastYield = performance.now();
    try {
      for (;;) {
        if (myRun !== runId) return;
        const s = machine.step();
        if (!s) { finished(); return; }
        if (s.type === 'error') { lastStep = s; failed(s.text); return; }
        if (s.type === 'wait') { waitForInput(unit); return; }
        if (s.type === 'phaseEnd') { if (unit === 'phase') break; continue; }
        if (s.type === 'instrEnd') {
          newInstruction = true;
          if (unit === 'instr') break;
          if (!ui.anim.checked) {
            const ms = NOANIM_INSTR_MS[speed()];
            if (ms > 0 || performance.now() - lastYield > 30) {
              lastStep = null;
              render();
              await sleep(ms);
              lastYield = performance.now();
            }
          }
          continue;
        }

        // Mikroschritt
        if (++count > STEP_LIMIT) {
          setStatus('error', t('st.stopped'), t('st.limit', { n: STEP_LIMIT }));
          break;
        }
        logMicro(s);
        if (ui.anim.checked) {
          await showMicro(s, myRun);
          if (myRun !== runId) return;
        } else {
          lastStep = s;
          if (unit !== 'end') render();
        }
        if (s.halt) { finished(); return; }
        if (unit === 'micro') break;
      }
      render();
      if (!machine.halted) {
        setStatus('', phaseName(machine.phase) || t('st.pause'), lastStep ? lastStep.text : t('st.stoppedText'));
      }
    } finally {
      if (myRun === runId) { busy = false; running = false; updateControls(); }
    }
  }

  async function showMicro(s, myRun) {
    const dur = ANIM_MS[speed()];
    setStatus('', phaseName(s.phase), s.text);
    if (s.route) {
      await view.animate(s.route, VN.formatInline(s.value, fmtMode()), dur);
      if (myRun !== runId) return;
    }
    lastStep = s;
    render();
    await sleep(s.route ? dur * 0.35 : dur * 0.7);
  }

  function logMicro(s) {
    if (newInstruction) { ui.microlog.innerHTML = ''; newInstruction = false; }
    const prev = ui.microlog.querySelector('.last');
    if (prev) prev.classList.remove('last');
    const li = document.createElement('li');
    li.dataset.phase = s.phase;
    li.className = 'last';
    const ph = document.createElement('span');
    ph.className = 'ph';
    ph.textContent = phaseShort(s.phase);
    li.append(ph, s.text);
    li.title = s.text;
    ui.microlog.appendChild(li);
    ui.microlog.scrollTop = ui.microlog.scrollHeight;
  }

  function finished() {
    lastStep = null;
    render();
    const c = machine.counters;
    setStatus('done', t('st.done'), t('st.doneText', { i: c.instructions, s: c.steps, m: c.memAccess }) +
      (machine.outputs.length ? t('st.output', { list: machine.outputs.join(', ') }) : ''));
  }

  function failed(text) {
    render();
    setStatus('error', t('st.runtimeError'), text);
  }

  function waitForInput(unit) {
    resumeUnit = unit;
    lastStep = null;
    render();
    setStatus('', t('st.input'), t('st.inputText'));
    ui.input.disabled = false;
    ui.btnInput.disabled = false;
    ui.input.value = '';
    ui.input.focus();
  }

  function submitInput() {
    const text = ui.input.value.trim();
    const v = Number(text);
    if (!/^[+-]?\d+$/.test(text) || v < MIN_VALUE || v > MAX_VALUE) {
      setStatus('error', t('st.input'), t('st.inputInvalid', { min: MIN_VALUE, max: MAX_VALUE }));
      ui.input.focus();
      return;
    }
    machine.provideInput(v);
    ui.input.disabled = true;
    ui.btnInput.disabled = true;
    ui.input.value = '';
    const unit = resumeUnit || 'instr';
    resumeUnit = null;
    execute(unit);
  }

  function pause() {
    if (!busy) return;
    runId++;
    view.stopAnimation();
    busy = false;
    running = false;
    render();
    setStatus('', t('st.pause'), t('st.pauseText'));
    updateControls();
  }

  function reset() {
    runId++;
    view.stopAnimation();
    busy = false;
    running = false;
    resumeUnit = null;
    ui.input.disabled = true;
    ui.btnInput.disabled = true;
    if (loadedSource === ui.source.value) machine.reset();
    else assembleAndLoad();
    lastStep = null;
    newInstruction = true;
    ui.microlog.innerHTML = '';
    render();
    if (program.ok) setStatus('', t('st.ready'), t('st.resetText'));
    updateControls();
  }

  function updateControls() {
    ui.run.disabled = busy || machine.waiting;
    ui.step.disabled = busy || machine.waiting;
    ui.pause.disabled = !busy;
    ui.source.readOnly = busy || started();
    ui.run.textContent = t(started() ? 'ui.continue' : 'ui.run');
  }

  // ------------------------------------------------------------------ Darstellung

  function render() {
    const cells = loadedSource === null ? [] : program.cells;
    view.render(machine, { mode: fmtMode(), cells, step: lastStep });
    $('cnt-instr').textContent = machine.counters.instructions;
    $('cnt-steps').textContent = machine.counters.steps;
    $('cnt-mem').textContent = machine.counters.memAccess;
    renderLineHighlight();
    renderMemTable();
  }

  function renderLineHighlight() {
    const hl = ui.lineHl;
    let line = null;
    let error = false;
    if (machine.instrAddr !== null && loadedSource === ui.source.value && program.cells[machine.instrAddr]) {
      line = program.cells[machine.instrAddr].line;
      error = !!machine.error;
    }
    if (!line) { hl.style.display = 'none'; return; }
    hl.style.display = 'block';
    hl.classList.toggle('error', error);
    hl.style.top = (8 + (line - 1) * lineHeight() - ui.source.scrollTop) + 'px';
    hl.dataset.line = line;
  }

  function lineHeight() { return parseFloat(getComputedStyle(ui.source).lineHeight) || 20; }

  function renderGutter() {
    const n = ui.source.value.split('\n').length;
    const errLines = new Set((program.errors || []).map(e => e.line));
    let html = '';
    for (let i = 1; i <= n; i++) html += errLines.has(i) ? `<span class="err">${i}</span>\n` : `${i}\n`;
    ui.gutter.innerHTML = html + '\n\n';
    ui.gutter.scrollTop = ui.source.scrollTop;
  }

  function showErrors(errors) {
    ui.errors.innerHTML = '';
    for (const e of errors) {
      const li = document.createElement('li');
      const b = document.createElement('b');
      b.textContent = t('err.line', { line: e.line });
      li.append(b, ' ', e.message);
      li.addEventListener('click', () => gotoLine(e.line));
      ui.errors.appendChild(li);
    }
    renderGutter();
  }

  function gotoLine(line) {
    const lines = ui.source.value.split('\n');
    let pos = 0;
    for (let i = 0; i < line - 1; i++) pos += lines[i].length + 1;
    ui.source.focus();
    ui.source.setSelectionRange(pos, pos + (lines[line - 1] || '').length);
    ui.source.scrollTop = Math.max(0, (line - 4) * lineHeight());
  }

  // ------------------------------------------------------------------ Speichertabelle

  const memRows = [];
  function buildMemTable() {
    for (let a = 0; a < MEM_SIZE; a++) {
      const tr = document.createElement('tr');
      const tdA = document.createElement('td');
      tdA.textContent = a;
      const tdV = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'numeric';
      input.setAttribute('aria-label', t('mem.cell', { a }));
      input.addEventListener('change', () => editCell(a, input));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const next = memRows[a + (e.key === 'ArrowUp' ? -1 : 1)];
          if (e.key === 'Enter') editCell(a, input);
          if (next) next.input.focus();
        }
      });
      tdV.appendChild(input);
      const tdM = document.createElement('td');
      tdM.className = 'meaning';
      tr.append(tdA, tdV, tdM);
      ui.memtable.appendChild(tr);
      memRows.push({ tr, input, meaning: tdM });
    }
  }

  function renderMemTable() {
    const cells = loadedSource === null ? [] : program.cells;
    ui.memtable.parentElement.classList.toggle('bin', fmtMode() === 'bin');
    for (let a = 0; a < MEM_SIZE; a++) {
      const row = memRows[a];
      const v = machine.mem[a];
      const { kind, modified } = machine.cellKind(a, cells[a] && cells[a].kind);
      row.tr.className = 'kind-' + kind + (modified ? ' modified' : '') + (a === machine.pc ? ' pc' : '');
      if (document.activeElement !== row.input) row.input.value = VN.formatInline(v, fmtMode());
      let meaning = '';
      if (kind === 'op') meaning = disassemble(v, machine.mem[a + 1], machine.names) || t('mem.noInstr');
      else if (kind === 'arg') meaning = '  ↳ Operand';
      const label = cells[a] && cells[a].label;
      row.meaning.textContent = '';
      if (label) {
        const span = document.createElement('span');
        span.className = 'label';
        span.textContent = label + ': ';
        row.meaning.appendChild(span);
      }
      row.meaning.append(meaning || (kind === 'data' ? t('mem.data') : ''));
    }
  }

  function parseCell(text) {
    text = text.trim().replace(/\s+/g, '');
    let v;
    if (fmtMode() === 'hex' && /^[0-9a-f]{1,4}$/i.test(text)) v = parseInt(text, 16);
    else if (fmtMode() === 'bin' && /^[01]{1,16}$/.test(text)) v = parseInt(text, 2);
    else if (/^[+-]?\d+$/.test(text)) return parseInt(text, 10);
    else return null;
    return v >= 0x8000 ? v - 0x10000 : v;   // 16-Bit-Zweierkomplement
  }

  function editCell(a, input) {
    const v = parseCell(input.value);
    if (v === null || v < MIN_VALUE || v > MAX_VALUE) {
      setStatus('error', t('st.memory'), t('st.memInvalid', { a, min: MIN_VALUE, max: MAX_VALUE }));
      input.value = VN.formatInline(machine.mem[a], fmtMode());
      return;
    }
    if (loadedSource === null && !assembleAndLoad()) return;
    machine.mem[a] = v;
    if (!started()) machine.initial[a] = v;   // gilt auch nach Reset
    setStatus('', t('st.memory'), t('st.memSet', { a, v }) +
      (byCode.has(v) ? t('st.asInstr', { m: byCode.get(v).mnemonic }) : ''));
    render();
  }

  function focusMemoryCell(a) {
    if (document.body.classList.contains('present')) return;
    selectTab('memory');
    const row = memRows[a];
    row.tr.classList.add('focus');
    setTimeout(() => row.tr.classList.remove('focus'), 1200);
    row.input.focus();
    row.input.select();
    const pane = $('pane-memory');
    pane.scrollTop += row.tr.getBoundingClientRect().top - pane.getBoundingClientRect().top - pane.clientHeight / 2;
  }

  // ------------------------------------------------------------------ Befehlsreferenz

  function buildHelp() {
    const rows = INSTRUCTIONS.map(ins => {
      const op = { none: '', addr: ' x', imm: ' #n', target: ' ' + t('help.target') }[ins.operand];
      const flags = (ins.kind === 'alu' || ins.kind === 'cmp') ? 'Z N' : '';
      return `<tr><td>${String(ins.code).padStart(2, '0')}</td><td>${ins.mnemonic}${op}</td>` +
        `<td>${VN.isa.text(ins)}</td><td>${flags}</td></tr>`;
    }).join('');
    $('help').innerHTML = t('help.html', {
      rows, size: MEM_SIZE, last: MEM_SIZE - 1, min: MIN_VALUE, max: MAX_VALUE,
      phases: VN.PHASES.map(p => `<b>${p.name}</b>: ${p.title}`).join(' → '),
    });
  }

  // ------------------------------------------------------------------ Tabs, Dateien, Teilen

  function selectTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === 'pane-' + name));
  }

  function setSource(text) {
    runId++;
    view.stopAnimation();
    busy = false;
    ui.source.value = text;
    ui.source.scrollTop = 0;
    storeSource();
    assembleAndLoad();
    render();
    if (program.ok) setStatus('', t('st.ready'), t('st.loaded'));
    updateControls();
  }

  function encodeSource(s) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeSource(b64) {
    const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  }

  function copyLink() {
    const url = location.href.split('#')[0] + '#p=' + encodeSource(ui.source.value);
    const done = () => setStatus('', t('st.link'), t('st.linkCopied'));
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(done, () => window.prompt(t('st.linkPrompt'), url));
    } else {
      window.prompt(t('st.linkPrompt'), url);
    }
  }

  function saveFile() {
    const blob = new Blob([ui.source.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = t('ui.fileName');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function openFile(file) {
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result));
    reader.readAsText(file);
  }

  function initialSource() {
    const m = /#p=([A-Za-z0-9_-]+)/.exec(location.hash);
    if (m) {
      try { return decodeSource(m[1]); } catch (e) { /* ungültiger Link */ }
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
    } catch (e) { /* kein Speicher verfügbar */ }
    return VN.EXAMPLES[0].source[lang()];
  }

  // ------------------------------------------------------------------ Ereignisse

  function isTextField(t) {
    return t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.isContentEditable);
  }

  function bind() {
    ui.run.addEventListener('click', () => execute('end'));
    ui.step.addEventListener('click', () => execute(ui.granularity.value));
    ui.pause.addEventListener('click', pause);
    ui.reset.addEventListener('click', reset);
    ui.btnInput.addEventListener('click', submitInput);
    ui.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitInput(); });
    ui.format.addEventListener('change', render);

    ui.source.addEventListener('input', () => {
      renderGutter();
      renderLineHighlight();
      clearTimeout(ui.source._t);
      ui.source._t = setTimeout(() => {
        storeSource();
        // Fehler schon beim Tippen anzeigen, Speicher aber erst beim Start neu laden
        const p = VN.assemble(ui.source.value);
        program.errors = p.errors;
        showErrors(p.errors);
        if (p.ok && !busy) setStatus('', t('st.ready'), t('st.changed'));
      }, 400);
    });
    ui.source.addEventListener('scroll', () => { ui.gutter.scrollTop = ui.source.scrollTop; renderLineHighlight(); });
    ui.source.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !ui.source.readOnly) {   // Tabulator einfügen statt Fokuswechsel
        e.preventDefault();
        document.execCommand('insertText', false, '\t');
      }
    });

    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => selectTab(t.dataset.tab)));

    const sel = $('sel-example');
    fillExamples();
    sel.addEventListener('change', () => {
      const ex = VN.EXAMPLES.find(e => e.id === sel.value);
      if (ex) { setSource(ex.source[lang()]); selectTab('program'); }
      sel.value = '';
    });
    $('sel-lang').addEventListener('change', (e) => setLanguage(e.target.value));

    $('btn-open').addEventListener('click', () => $('file-input').click());
    $('file-input').addEventListener('change', (e) => {
      if (e.target.files[0]) openFile(e.target.files[0]);
      e.target.value = '';
    });
    $('btn-save').addEventListener('click', saveFile);
    $('btn-link').addEventListener('click', copyLink);
    $('btn-present').addEventListener('click', () => document.body.classList.toggle('present'));

    window.addEventListener('hashchange', () => {
      const m = /#p=([A-Za-z0-9_-]+)/.exec(location.hash);
      if (m) { try { setSource(decodeSource(m[1])); } catch (e) { /* ignorieren */ } }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5') { e.preventDefault(); if (!ui.run.disabled) execute('end'); return; }
      if (e.key === 'F10') { e.preventDefault(); if (!ui.step.disabled) execute(ui.granularity.value); return; }
      if (e.key === 'Escape') { e.preventDefault(); reset(); return; }
      if (isTextField(e.target)) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (busy) pause(); else if (!ui.run.disabled) execute('end');
      } else if (e.key === 'p' || e.key === 'P') {
        document.body.classList.toggle('present');
      }
    });
  }

  // ------------------------------------------------------------------ Sprache

  // Statische Texte aus index.html (data-i18n, data-i18n-title, data-i18n-aria)
  function applyStaticTexts() {
    document.documentElement.lang = lang();
    document.title = t('ui.title');
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = t(e.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-aria]').forEach(e => e.setAttribute('aria-label', t(e.dataset.i18nAria)));
    memRows.forEach((row, a) => row.input.setAttribute('aria-label', t('mem.cell', { a })));
    $('sel-lang').value = lang();
  }

  function fillExamples() {
    const sel = $('sel-example');
    while (sel.options.length > 1) sel.remove(1);
    for (const ex of VN.EXAMPLES) {
      const o = document.createElement('option');
      o.value = ex.id;
      o.textContent = ex.title[lang()];
      sel.appendChild(o);
    }
  }

  function setLanguage(newLang) {
    const old = lang();
    if (newLang === old) return;
    VN.i18n.setLang(newLang, true);
    try {   // ?lang= in der Adresse anpassen, damit ein Neuladen die Wahl behält
      const url = new URL(location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', newLang);
        history.replaceState(null, '', url);
      }
    } catch (e) { /* file:// o. Ä. */ }

    applyStaticTexts();
    fillExamples();
    buildHelp();
    view.rebuild();
    ui.microlog.innerHTML = '';
    newInstruction = true;

    // Unverändertes Beispiel durch die Fassung in der neuen Sprache ersetzen
    const ex = VN.EXAMPLES.find(e => e.source[old] === ui.source.value);
    if (ex && !busy && !started()) {
      setSource(ex.source[newLang]);
    } else {
      const p = VN.assemble(ui.source.value);
      if (loadedSource === ui.source.value) program = p;
      else program.errors = p.errors;
      showErrors(p.errors);
      render();
      updateControls();
      if (!busy) setStatus('', t('st.ready'), t('st.readyText'));
    }
  }

  // ------------------------------------------------------------------ Start

  buildMemTable();
  applyStaticTexts();
  buildHelp();
  bind();
  ui.source.value = initialSource();
  if (assembleAndLoad()) setStatus('', t('st.ready'), t('st.readyText'));
  render();
  updateControls();
})();
