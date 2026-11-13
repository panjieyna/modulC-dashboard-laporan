// Indikator AMI kerja sama per prodi.
// Sumber: "Rangkuman Requirement KSDAS" rapat 09/11/2026 bagian 7 (enam indikator, TS = tahun sekarang).
// Rumus di Product Backlog US-3.2 (M/N, standar 50%) dianggap digantikan oleh enam indikator ini (K-02).
// Target dapat diubah Admin (US-3.2 "ambang dapat diubah"); pembanding '>' / '>=' masih perlu dikonfirmasi.

export const INDIKATOR_AMI = [
  {
    id: 'I1',
    nama: 'Kerja sama internasional TS',
    ringkas: 'Internasional',
    satuan: 'jumlah',
    target: 2,
    pembanding: '>=',
    rumus: 'Jumlah naskah kerja sama yang berlaku pada TS, melibatkan prodi, dengan mitra berskala internasional.',
  },
  {
    id: 'I2',
    nama: 'Kerja sama nasional TS',
    ringkas: 'Nasional',
    satuan: 'jumlah',
    target: 6,
    pembanding: '>=',
    rumus: 'Jumlah naskah kerja sama yang berlaku pada TS, melibatkan prodi, dengan mitra berskala nasional.',
  },
  {
    id: 'I3',
    nama: 'Kerja sama wilayah/lokal TS',
    ringkas: 'Wilayah/lokal',
    satuan: 'jumlah',
    target: 2,
    pembanding: '>=',
    rumus: 'Jumlah naskah kerja sama yang berlaku pada TS, melibatkan prodi, dengan mitra berskala wilayah/lokal.',
  },
  {
    id: 'I4',
    nama: 'Mitra pendukung belajar di luar kampus',
    ringkas: 'Mitra pendukung belajar',
    satuan: 'persen',
    target: 17,
    pembanding: '>=',
    rumus: 'Mitra yang mendukung pembelajaran di luar kampus (mis. tempat magang) ÷ seluruh mitra prodi pada TS × 100%.',
  },
  {
    id: 'I5',
    nama: 'Tren jumlah kerja sama dibanding tahun lalu',
    ringkas: 'Tren vs TS-1',
    satuan: 'persen',
    target: 0,
    pembanding: '>',
    rumus: '(Jumlah kerja sama berlaku TS − jumlah TS-1) ÷ jumlah TS-1 × 100%.',
  },
  {
    id: 'I6',
    nama: 'MoU yang ditindaklanjuti PKS/IA',
    ringkas: 'MoU ditindaklanjuti',
    satuan: 'persen',
    target: 45,
    pembanding: '>=',
    rumus: 'MoU berlaku yang punya turunan (MoA/PKS/CA/IA) berlaku untuk prodi ini ÷ seluruh MoU berlaku prodi × 100%.',
  },
];

export const ATURAN_AMI = {
  // LoI belum dianggap "kerja sama" karena baru surat niat (asumsi A-04).
  jenisDihitung: ['MoU', 'MoA', 'PKS', 'CA', 'IA'],
  jenisTurunan: ['MoA', 'PKS', 'CA', 'IA'],
  // FR-QA-07: dihitung dari naskah yang telah terverifikasi. UC-06 4a: tetap bisa dijalankan dengan peringatan.
  hanyaTerverifikasi: true,
};

// FR-REL-04 / FR-PART-09: MoU "tidur" bila tanpa turunan aktif > 180 hari sejak penandatanganan.
export const BATAS_HARI_MOU_TIDUR = 180;

export const targetBawaan = () => Object.fromEntries(INDIKATOR_AMI.map((i) => [i.id, i.target]));
