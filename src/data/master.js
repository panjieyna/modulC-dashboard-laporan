// Master data CONTOH untuk prototipe. Di sistem nyata, daftar fakultas dan prodi
// berasal dari STRUKTUR_UNIT yang dikelola Admin (FR-ORG-02), bukan ditulis di kode.

export const FAKULTAS = [
  { kode: 'FITE', nama: 'Fakultas Informatika dan Teknik Elektro' },
  { kode: 'FTI', nama: 'Fakultas Teknologi Industri' },
  { kode: 'FB', nama: 'Fakultas Bioteknologi' },
  { kode: 'FV', nama: 'Fakultas Vokasi' },
];

export const PRODI = [
  { kode: 'S1IF', nama: 'S1 Informatika', fakultas: 'FITE' },
  { kode: 'S1SI', nama: 'S1 Sistem Informasi', fakultas: 'FITE' },
  { kode: 'S1TE', nama: 'S1 Teknik Elektro', fakultas: 'FITE' },
  { kode: 'S1MR', nama: 'S1 Manajemen Rekayasa', fakultas: 'FTI' },
  { kode: 'S1MT', nama: 'S1 Teknik Metalurgi', fakultas: 'FTI' },
  { kode: 'S1BP', nama: 'S1 Teknik Bioproses', fakultas: 'FB' },
  { kode: 'S1BT', nama: 'S1 Bioteknologi', fakultas: 'FB' },
  { kode: 'D3TI', nama: 'D3 Teknologi Informasi', fakultas: 'FV' },
  { kode: 'D3TK', nama: 'D3 Teknologi Komputer', fakultas: 'FV' },
  { kode: 'D4TRPL', nama: 'D4 Teknologi Rekayasa Perangkat Lunak', fakultas: 'FV' },
];

// FR-REG-01: enam klasifikasi naskah.
export const JENIS_NASKAH = ['LoI', 'MoU', 'MoA', 'PKS', 'CA', 'IA'];

// Cakupan mitra untuk indikator AMI 1–3. Atribut ini BELUM ada di model data
// mana pun (lihat docs/temuan-requirement-modul-c.md, K-03).
export const CAKUPAN = {
  internasional: 'Internasional',
  nasional: 'Nasional',
  lokal: 'Wilayah/Lokal',
};

const prodiByKode = Object.fromEntries(PRODI.map((p) => [p.kode, p]));
const fakultasByKode = Object.fromEntries(FAKULTAS.map((f) => [f.kode, f]));

export const namaProdi = (kode) => prodiByKode[kode]?.nama ?? kode;
export const fakultasDariProdi = (kode) => prodiByKode[kode]?.fakultas ?? null;
export const namaFakultas = (kode) => fakultasByKode[kode]?.nama ?? kode;

/** Kode fakultas unik dari daftar prodi sebuah naskah. */
export const fakultasNaskah = (n) => [...new Set((n.prodi ?? []).map(fakultasDariProdi).filter(Boolean))];
