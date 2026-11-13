const angka = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

export const formatAngka = (n) => (n === null || n === undefined ? '-' : angka.format(n));

/** Nilai indikator AMI: '-' bila tidak ada data (US-3.3), persen dengan satu desimal. */
export function formatNilaiIndikator(nilai, satuan) {
  if (nilai === null || nilai === undefined) return '-';
  return satuan === 'persen' ? `${angka.format(nilai)}%` : angka.format(nilai);
}

export function formatTarget(def) {
  const simbol = def.pembanding === '>' ? '>' : '≥';
  return `${simbol} ${angka.format(def.target)}${def.satuan === 'persen' ? '%' : ''}`;
}

export function formatSelisih(selisih, satuan) {
  if (selisih === null || selisih === undefined) return '';
  const tanda = selisih > 0 ? '+' : selisih < 0 ? '−' : '±';
  return `${tanda}${angka.format(Math.abs(selisih))}${satuan === 'persen' ? ' poin' : ''}`;
}
