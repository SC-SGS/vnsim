// Zahlendarstellung: dezimal, hexadezimal oder binär (16-Bit-Zweierkomplement)
var VN = (typeof VN !== 'undefined') ? VN : {};

(function (VN) {
  'use strict';

  const BITS = 16;

  function twosComplement(v) { return (v + (1 << BITS)) % (1 << BITS); }

  // Liefert eine oder zwei Zeilen (binär: 2 × 8 Bit, damit es in eine Speicherzelle passt)
  function format(v, mode) {
    if (v === null || v === undefined) return ['–'];
    switch (mode) {
      case 'hex': return [twosComplement(v).toString(16).toUpperCase().padStart(4, '0')];
      case 'bin': {
        const s = twosComplement(v).toString(2).padStart(BITS, '0');
        return [s.slice(0, 8), s.slice(8)];
      }
      default: return [String(v)];
    }
  }

  function formatInline(v, mode) {
    const lines = format(v, mode);
    return lines.join(mode === 'bin' ? ' ' : '');
  }

  VN.format = format;
  VN.formatInline = formatInline;
})(VN);
