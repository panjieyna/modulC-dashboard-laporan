// Satu-satunya pintu data untuk Modul C. Sekarang mengembalikan data contoh;
// nanti diganti panggilan API (Axios/RTK Query) ke service milik Modul A dan B.
// Kontrak data yang dibutuhkan ada di docs/temuan-requirement-modul-c.md bagian 5.

import { buatDataContoh } from './dummy.js';
import { hariIniISO } from '../lib/tanggal.js';

let cache = null;

export function ambilData() {
  if (!cache) {
    const hariIni = hariIniISO();
    const { mitra, naskah } = buatDataContoh(hariIni);
    cache = {
      hariIni,
      mitra,
      naskah,
      mitraById: Object.fromEntries(mitra.map((m) => [m.id, m])),
      naskahById: Object.fromEntries(naskah.map((n) => [n.id, n])),
    };
  }
  return cache;
}
