// Kebijakan akses Modul C — SATU tempat untuk diubah setelah peran disepakati klien.
// Dokumen requirement masih bertentangan soal peran (lihat docs/temuan-requirement-modul-c.md, K-01),
// jadi prototipe mensimulasikan lima peran. Nilai di bawah adalah keputusan sementara.
//
// PENTING: pembatasan di frontend hanya untuk tampilan. Server tetap wajib menolak
// permintaan di luar hak dengan 403 (US-3.5, US-5.2 "penegakan di server").

export const PERAN = {
  admin: { label: 'Admin Kerjasama', keterangan: 'WR III, Kabiro, staf Biro Kerja Sama' },
  pimpinan: { label: 'Pimpinan', keterangan: 'Rektor dan WR selain WR III' },
  dekan: { label: 'Dekan', keterangan: 'Data fakultasnya sendiri' },
  kaprodi: { label: 'Kaprodi', keterangan: 'Data prodinya sendiri' },
  dosen: { label: 'Dosen', keterangan: 'Data prodinya sendiri, hanya melihat' },
};

/**
 * cakupan       : 'semua' | 'fakultas' | 'prodi' — data yang boleh dilihat.
 * lihatDraf     : naskah belum lengkap hanya tampil untuk admin (Perbaikan Pertemuan 2).
 * lihatAmi      : menu Analisis SPMI & AMI (SRS FR-PART-10, Backlog US-3.5).
 * ubahTargetAmi : mengubah target indikator (US-3.2, "Admin penuh").
 * lihatMouTidur : rekap MoU tidur (FR-PART-10).
 * ekspor        : unduh Excel sesuai cakupan (Rangkuman 09/11: data Excel boleh diunduh siapa saja).
 */
export const KEBIJAKAN_AKSES = {
  admin: { cakupan: 'semua', lihatDraf: true, lihatAmi: true, ubahTargetAmi: true, lihatMouTidur: true, ekspor: true },
  pimpinan: { cakupan: 'semua', lihatDraf: false, lihatAmi: true, ubahTargetAmi: false, lihatMouTidur: true, ekspor: true },
  dekan: { cakupan: 'fakultas', lihatDraf: false, lihatAmi: false, ubahTargetAmi: false, lihatMouTidur: false, ekspor: true },
  kaprodi: { cakupan: 'prodi', lihatDraf: false, lihatAmi: false, ubahTargetAmi: false, lihatMouTidur: false, ekspor: true },
  dosen: { cakupan: 'prodi', lihatDraf: false, lihatAmi: false, ubahTargetAmi: false, lihatMouTidur: false, ekspor: true },
};
