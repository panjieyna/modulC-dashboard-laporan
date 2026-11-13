import { statusNaskah, STATUS } from './status.js';
import { CAKUPAN, namaProdi, fakultasNaskah } from '../data/master.js';

/** FR-REP-01: rekap berdasarkan jenis, status keaktifan, dan rentang tanggal penandatanganan. */
export function saringLaporan(daftar, { jenis = [], status = [], dari = '', sampai = '' }, hariIni) {
  return daftar
    .filter((n) => !jenis.length || jenis.includes(n.jenis))
    .filter((n) => !status.length || status.includes(statusNaskah(n, hariIni)))
    .filter((n) => !dari || (n.tanggalMulai && n.tanggalMulai >= dari))
    .filter((n) => !sampai || (n.tanggalMulai && n.tanggalMulai <= sampai))
    .sort((a, b) => (b.tanggalMulai ?? '').localeCompare(a.tanggalMulai ?? ''));
}

/**
 * Preset periode. Semester ganjil = Agustus–Januari, genap = Februari–Juli (asumsi A-12).
 */
export function presetPeriode(hariIni) {
  const y = Number(hariIni.slice(0, 4));
  const bulan = Number(hariIni.slice(5, 7));
  const awalTa = bulan >= 8 ? y : y - 1; // tahun akademik berjalan awalTa/awalTa+1
  return [
    { id: 'semua', label: 'Semua periode', dari: '', sampai: '' },
    { id: `th-${y}`, label: `Tahun ${y}`, dari: `${y}-01-01`, sampai: `${y}-12-31` },
    { id: `th-${y - 1}`, label: `Tahun ${y - 1}`, dari: `${y - 1}-01-01`, sampai: `${y - 1}-12-31` },
    { id: `ganjil-${awalTa}`, label: `Semester Ganjil ${awalTa}/${awalTa + 1}`, dari: `${awalTa}-08-01`, sampai: `${awalTa + 1}-01-31` },
    { id: `genap-${awalTa}`, label: `Semester Genap ${awalTa - 1}/${awalTa}`, dari: `${awalTa}-02-01`, sampai: `${awalTa}-07-31` },
  ];
}

/**
 * Kolom daftar naskah. Tabel di layar dan berkas Excel memakai konstanta yang SAMA,
 * sehingga kolom dan jumlah baris selalu cocok (US-2.13, FR-REP-03, NFR-08).
 * Tidak ada kolom berkas, anggaran, atau catatan audit (FR-REP-05).
 */
export const KOLOM_DAFTAR = [
  { key: 'no', header: 'No', width: 6 },
  { key: 'nomor', header: 'Nomor naskah', width: 24 },
  { key: 'jenis', header: 'Jenis', width: 8 },
  { key: 'judul', header: 'Judul', width: 52 },
  { key: 'mitra', header: 'Mitra', width: 40 },
  { key: 'cakupan', header: 'Cakupan mitra', width: 16 },
  { key: 'fakultas', header: 'Fakultas', width: 12 },
  { key: 'prodi', header: 'Prodi pelaksana', width: 36 },
  { key: 'mulai', header: 'Tanggal mulai', width: 14, tipe: 'tanggal' },
  { key: 'berakhir', header: 'Tanggal berakhir', width: 14, tipe: 'tanggal' },
  { key: 'status', header: 'Status', width: 28 },
  { key: 'verifikasi', header: 'Verifikasi', width: 18 },
  { key: 'induk', header: 'Naskah induk', width: 26 },
];

const JENIS_TURUNAN = ['MoA', 'PKS', 'CA', 'IA'];

export function barisDaftarNaskah(daftar, { mitraById, naskahById, hariIni }) {
  return daftar.map((n, i) => {
    const m = mitraById[n.mitraId];
    const induk = n.indukId ? naskahById[n.indukId] : null;
    const kodeStatus = statusNaskah(n, hariIni);
    let teksInduk = '';
    if (induk) teksInduk = induk.nomor || `${induk.jenis} ${induk.id}`;
    else if (JENIS_TURUNAN.includes(n.jenis)) teksInduk = 'Tanpa MoU induk';
    return {
      id: n.id,
      kodeStatus,
      no: i + 1,
      nomor: n.nomor ?? '',
      jenis: n.jenis ?? '',
      judul: n.judul ?? '',
      mitra: m?.nama ?? '',
      cakupan: CAKUPAN[m?.cakupan] ?? '',
      fakultas: fakultasNaskah(n).join(', '),
      prodi: (n.prodi ?? []).map(namaProdi).join(', '),
      mulai: n.tanggalMulai ?? '',
      berakhir: n.tanggalBerakhir ?? '',
      status: STATUS[kodeStatus].label,
      verifikasi: n.statusVerifikasi === 'terverifikasi' ? 'Terverifikasi' : 'Belum diverifikasi',
      induk: teksInduk,
    };
  });
}
