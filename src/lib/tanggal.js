// Semua tanggal disimpan sebagai string ISO 'YYYY-MM-DD' dan dihitung dalam UTC
// agar tidak bergeser karena zona waktu.

const MS_HARI = 86_400_000;
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const pad = (n) => String(n).padStart(2, '0');

export function keUtc(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function hariIniISO(sekarang = new Date()) {
  return `${sekarang.getFullYear()}-${pad(sekarang.getMonth() + 1)}-${pad(sekarang.getDate())}`;
}

/** Jumlah hari dari `dari` ke `ke` (negatif bila `ke` sebelum `dari`). */
export function selisihHari(dari, ke) {
  return Math.round((keUtc(ke) - keUtc(dari)) / MS_HARI);
}

export function tambahHari(iso, n) {
  return new Date(keUtc(iso) + n * MS_HARI).toISOString().slice(0, 10);
}

export const tahunDari = (iso) => (iso ? Number(iso.slice(0, 4)) : null);

export function formatTanggal(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${BULAN[Number(m) - 1]} ${y}`;
}

export function isoKeDate(iso) {
  return new Date(keUtc(iso));
}
