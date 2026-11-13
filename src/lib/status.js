import { selisihHari } from './tanggal.js';

// FR-HOME-05 / BR-05: pengingat 30 hari sebelum naskah berakhir.
export const BATAS_HARI_PENGINGAT = 30;

const terisi = (v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== '');

/**
 * Lima kolom wajib (asumsi A-01): gabungan "Perbaikan Pertemuan 2" dan SRS FR-REG-02.
 * Periode (mulai + berakhir) dihitung satu kolom, mengikuti SRS. Tanggal berakhir
 * diwajibkan karena status aktif ditentukan dari tanggal (UC-05 alur 2a).
 */
export function kolomKurang(n) {
  const kurang = [];
  if (!terisi(n.mitraId)) kurang.push('Nama mitra');
  if (!terisi(n.jenis)) kurang.push('Jenis naskah');
  if (!terisi(n.judul)) kurang.push('Judul');
  if (!terisi(n.tanggalMulai) || !terisi(n.tanggalBerakhir)) kurang.push('Periode (mulai & berakhir)');
  if (!terisi(n.prodi)) kurang.push('Fakultas/prodi pelaksana');
  return kurang;
}

export const isLengkap = (n) => kolomKurang(n).length === 0;

/**
 * Status naskah yang saling lepas (FR-HOME-02). Setiap status dipetakan ke tepat
 * satu kartu Beranda, sehingga aktif + perlu perhatian + tindak lanjut + riwayat = total.
 */
export const STATUS = {
  aktif: { label: 'Aktif', kartu: 'masihAktif', nada: 'good', ikon: '✓' },
  akan_berakhir: { label: 'Akan berakhir (≤ 30 hari)', kartu: 'perluPerhatian', nada: 'warning', ikon: '!' },
  draf: { label: 'Draf (belum lengkap)', kartu: 'perluPerhatian', nada: 'neutral', ikon: '○' },
  kedaluwarsa: { label: 'Kedaluwarsa', kartu: 'tindakLanjut', nada: 'critical', ikon: '✕' },
  riwayat: { label: 'Riwayat (sudah ditindaklanjuti)', kartu: 'riwayat', nada: 'muted', ikon: '↺' },
};

export const URUTAN_STATUS = ['aktif', 'akan_berakhir', 'draf', 'kedaluwarsa', 'riwayat'];

export function sisaHari(n, hariIni) {
  return n.tanggalBerakhir ? selisihHari(hariIni, n.tanggalBerakhir) : null;
}

export function statusNaskah(n, hariIni) {
  if (!isLengkap(n)) return 'draf';
  const sisa = sisaHari(n, hariIni);
  if (sisa < 0) return n.tindakLanjut ? 'riwayat' : 'kedaluwarsa';
  if (sisa <= BATAS_HARI_PENGINGAT) return 'akan_berakhir';
  return 'aktif';
}

/** Naskah yang masih berlaku hari ini (aktif atau akan berakhir). */
export const masihBerlaku = (n, hariIni) => ['aktif', 'akan_berakhir'].includes(statusNaskah(n, hariIni));

export function hitungKartu(daftar, hariIni) {
  const hasil = {
    total: daftar.length,
    masihAktif: 0,
    perluPerhatian: 0,
    tindakLanjut: 0,
    riwayat: 0,
    perStatus: Object.fromEntries(URUTAN_STATUS.map((s) => [s, 0])),
  };
  for (const n of daftar) {
    const s = statusNaskah(n, hariIni);
    hasil.perStatus[s] += 1;
    hasil[STATUS[s].kartu] += 1;
  }
  return hasil;
}
