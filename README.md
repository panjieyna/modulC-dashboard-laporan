# KSDAS · Uji Coba Modul C (Dasbor & Laporan)

Prototipe frontend untuk menguji requirement Modul C KSDAS (Kerjasama and Analytic System, IT Del): grafik ringkasan, perhitungan nilai AMI tiap prodi secara otomatis, dan laporan Excel yang bisa diunduh.

Semua data di prototipe ini **data contoh** (fiktif); tidak ada data klien. Temuan dari uji coba ini ada di [docs/temuan-requirement-modul-c.md](docs/temuan-requirement-modul-c.md).

## Menjalankan

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
npm run dev      # buka http://localhost:5173
npm test         # 26 test otomatis yang dipetakan ke ID requirement
npm run build    # build produksi ke folder dist/
```

## Yang bisa diuji

| Halaman | Isi | Requirement |
|---|---|---|
| Beranda | 4 kartu metrik beserta cek konsistensinya, filter prodi, daftar pantau ≤ 30 hari, 4 grafik dengan tampilan tabel | FR-HOME-01–07, US-1.1, NFR-08 |
| Analisis SPMI & AMI | 6 indikator per prodi (klik nilai untuk melihat asal angkanya), atur target, perbandingan antar tahun, MoU tidur | FR-QA-07, US-3.1–3.5, FR-PART-08–11 |
| Laporan & Ekspor | Rekap per periode, jenis, dan status; ekspor daftar naskah; laporan per prodi (draf format); riwayat ekspor | FR-REP-01–07, US-2.13, US-2.14 |

**Simulasi peran.** Di mode `npm run dev`, bilah atas menampilkan pilihan peran (Admin, Pimpinan, Dekan, Kaprodi, Dosen). Pilihan ini dipakai untuk menguji hak akses. Di build produksi pilihan ini tidak muncul (FR-AUTH-05). Untuk build demo, aktifkan dengan `VITE_SIMULASI_PERAN=true`.

Skenario uji manual singkat:

1. **Admin:** cek bahwa Total = Aktif + Perlu Perhatian + Tindak Lanjut + Riwayat (baris "Cek konsistensi" di Beranda).
2. **Kaprodi S1 Informatika:** filter prodi terkunci, dan menu Analisis SPMI & AMI tidak muncul.
3. **Dekan FITE:** hanya prodi FITE yang tersedia di filter.
4. **Analisis:** klik salah satu nilai, lalu cocokkan jumlah naskah di jendela rincian dengan angka di tabel.
5. **Laporan:** pilih filter, ekspor ke Excel, lalu cocokkan jumlah baris di berkas dengan "N naskah" di layar.
6. **Tema:** ganti ke mode gelap lewat tombol di kanan atas.

## Struktur

```
src/
  config/   akses.js (kebijakan per peran), ami.js (indikator & target)
  data/     master.js (fakultas, prodi), dummy.js (generator data contoh), sumberData.js (pintu data → nanti API)
  lib/      status.js, ami.js, cakupan.js, laporan.js, ekspor.js (+ *.test.js)
  hooks/    useKsdas.js (data sesuai peran + filter), usePaletGrafik.js
  components/, pages/
docs/       temuan-requirement-modul-c.md
```

Logika di `src/lib` ditulis sebagai fungsi murni tanpa React, sehingga bisa diuji dan dipindahkan ke backend. Semua aturan yang masih menunggu keputusan klien dikumpulkan di `src/config`.

## Batasan

- Belum terhubung ke backend. Data dibangkitkan di peramban oleh `src/data/dummy.js`.
- Pembatasan akses hanya di tampilan. Server tetap wajib menolak dengan 403 (lihat temuan bagian 8).
- Target AMI dan riwayat ekspor hanya tersimpan selama sesi berjalan.
- Logo dan warna resmi IT Del belum dipakai, menunggu contoh desain dari klien (US-5.5).
- Tech stack tim menyebut Jest; prototipe ini memakai Vitest karena terintegrasi langsung dengan Vite (API-nya kompatibel dengan Jest).
- `npm audit` masih melaporkan 2 peringatan tingkat moderat dari `uuid` di dalam ExcelJS 4.4. Perbaikan yang ditawarkan npm adalah menurunkan ExcelJS ke versi 3.4, jadi tidak diterapkan. Celahnya ada di fungsi uuid v3/v5/v6 dengan parameter `buf`, yang tidak dipakai oleh fitur ekspor.

## Pustaka sumber terbuka yang dipakai

Sesuai Panduan Proyek Kolaborasi bagian 8.2:

| Pustaka | Lisensi | Kegunaan |
|---|---|---|
| React, React DOM | MIT | UI |
| Vite, @vitejs/plugin-react | MIT | Build dan server pengembangan |
| Redux Toolkit, React Redux | MIT | State (filter, peran, target) |
| React Router | MIT | Navigasi |
| Recharts | MIT | Grafik |
| Bootstrap | MIT | Gaya dasar |
| ExcelJS | MIT | Pembuatan berkas .xlsx |
| Vitest | MIT | Pengujian otomatis |

Palet warna grafik divalidasi untuk buta warna dan kontras pada mode terang dan gelap.

## Pernyataan penggunaan alat bantu AI

Sesuai Panduan Proyek Kolaborasi bagian 8.2: kerangka kode, data contoh, test, dan dokumen temuan di folder ini disusun dengan bantuan **Claude (Anthropic) melalui Claude Code** pada 13 November 2026. Isinya kemudian ditinjau dan disesuaikan oleh anggota tim: _(isi nama peninjau)_.
