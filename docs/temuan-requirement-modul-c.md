# Temuan Uji Coba Requirement Modul C (Dasbor & Laporan)

Tanggal: 13 November 2026 · Sumber: prototipe `ujicobamodulc` dengan data contoh · Status: draf untuk dibahas tim dan Product Owner

## 1. Ringkasan

Modul C menurut pembagian modul KSDAS: **menampilkan grafik ringkasan, menghitung nilai AMI tiap prodi secara otomatis, dan membuat laporan yang bisa diunduh.** Requirement Modul C dari enam dokumen sudah diimplementasikan sebagai prototipe frontend. Ada 26 test otomatis yang dinamai sesuai ID requirement-nya.

Dari proses itu muncul **12 temuan**. Empat di antaranya **memblokir implementasi final** dan perlu dijawab klien:

| Kode | Temuan | Kenapa memblokir |
|---|---|---|
| K-01 | Peran dan hak akses berbeda di setiap dokumen | Menentukan data apa yang dihitung di dasbor dan siapa yang boleh membuka AMI |
| K-02 | Rumus capaian AMI belum tunggal | Inti Modul C; tiap versi menghasilkan angka berbeda |
| K-03 | Data untuk indikator AMI belum ada di model data | Indikator 1–4 tidak bisa dihitung tanpa atribut baru dari Modul A |
| K-04 | Definisi empat kartu Beranda belum ada | FR-HOME-02 mewajibkan kategori saling lepas, tetapi isinya tidak didefinisikan |

## 2. Dokumen yang dibandingkan

| Kode | Dokumen | Tanggal |
|---|---|---|
| D1 | Product Backlog KSDAS v1.0 | 7 Nov 2026 |
| D2 | Rangkuman Requirement dan Rencana KSDAS (Sprint 1) | Sprint 1 |
| D3 | Dokumentasi Arsitektur & Infrastruktur v0.1 (Tech Stack) | 8 Nov 2026 |
| D4 | Perbaikan Hasil Diskusi Pertemuan 2 | 9 Nov 2026 |
| D5 | Rangkuman Requirement (catatan rapat) | 9 Nov 2026 |
| D6 | SRS v0.2 | – |

Aturan prototipe saat dokumen bertentangan: ikuti keputusan klien terbaru (D4, D5), lalu SRS (D6). Setiap keputusan sementara diberi kode asumsi (A-xx) di bagian 5. Kode yang sama juga muncul sebagai label di layar prototipe.

## 3. Pemetaan requirement Modul C ke prototipe

✓ = berjalan di prototipe dan punya test · ◐ = sebagian, sisanya butuh backend atau modul lain · ✗ = belum

| Requirement | Isi singkat | Status | Bukti di prototipe |
|---|---|---|---|
| FR-HOME-01 | 4 kartu metrik Beranda | ✓ | Beranda |
| FR-HOME-02, NFR-08 | Kategori kartu saling lepas, angka konsisten | ✓ | Baris "Cek konsistensi" di Beranda; `status.test.js` |
| FR-HOME-03, US-1.1 | Filter prodi multi-select; Kaprodi terisi otomatis | ✓ | Filter prodi (dipakai bersama semua halaman) |
| FR-HOME-04 | Daftar pantau draf, akan berakhir, kedaluwarsa | ✓ | Beranda › Daftar pantau |
| FR-HOME-05, BR-05 | Pengingat ≤ 30 hari | ◐ | Tampilan dan batas 30 hari teruji; penjadwal harian dan notifikasi adalah tugas backend/Modul A |
| FR-HOME-06, FR-COM-04 | Panel notifikasi terpusat | ✗ | Butuh service notifikasi; belum jelas modul pemiliknya |
| FR-HOME-07 | Tautan pintas ke rincian naskah | ✓ | Ke halaman ringkas; halaman detail penuh milik Modul A |
| FR-QA-07, US-3.2 | Hitung indikator AMI otomatis | ✓ | Analisis SPMI & AMI; `ami.test.js` |
| US-3.2 | Target dapat diubah Admin | ◐ | Tombol "Atur target"; hanya tersimpan per sesi |
| US-3.1 | Data AMI terbawa sampai kedaluwarsa | ✓ | `ami.test.js` |
| FR-PART-08 | Perbandingan antar prodi | ✓ | Tabel capaian semua prodi |
| US-3.3 | Perbandingan antar tahun, "-" bukan 0% | ✓ | Analisis › Perbandingan; `ami.test.js` |
| FR-PART-09, FR-REL-04 | Daftar MoU tidur | ✓ | Analisis › MoU tidur |
| FR-PART-10, US-3.5 | AMI hanya untuk peran tertentu | ◐ | Menu dan halaman disembunyikan; **server tetap wajib menolak dengan 403** |
| FR-PART-11 | Grafik tren tahunan | ◐ | Jumlah kerja sama berlaku dan baru sudah ada; kegiatan dan serapan mahasiswa butuh data realisasi Modul B |
| FR-REP-01 | Rekap semesteran/tahunan | ✓ | Laporan › Periode tanda tangan |
| FR-REP-02, FR-REP-03, US-2.13 | Ekspor Excel sesuai filter, baris dan kolom sama | ✓ | `ekspor.test.js` membaca ulang berkas .xlsx |
| FR-REP-04, US-2.14 | Laporan format akreditasi/Dikti | ◐ | Draf format; formulir resmi belum diterima (K-12) |
| FR-REP-05 | Ekspor tanpa berkas, anggaran, catatan audit | ✓ | `cakupan.test.js` |
| FR-REP-06 | Dosen hanya mengekspor data prodinya | ✓ | Ekspor selalu memakai data dalam cakupan |
| FR-REP-07 | Ekspor MoU tidur | ✓ | Analisis › Ekspor MoU tidur |
| D4 §4 | Asal nilai dapat ditelusuri ke data mentah | ✓ | Klik sel di tabel capaian; lembar "Rincian (asal nilai)" di Excel |
| D5 §3 | Mode terang/gelap, layout vertikal | ✓ | Tombol tema; grafik ditumpuk satu kolom |
| US-2.13 (jejak) | Ekspor tercatat bersama filternya | ◐ | Riwayat ekspor per sesi dan lembar "Info"; audit log permanen tugas server |

## 4. Temuan

### K-01 · Peran dan hak akses melihat data (memblokir)

| Dokumen | Isi |
|---|---|
| D1 | Peran Admin, Prodi, Dosen. Prodi "semua prodi dapat mengakses (*)". Capaian AMI hanya untuk admin penuh. |
| D3 | Lima peran: `staf_uks`, `kaprodi`, `dekan`, `pimpinan`, `master_admin`. |
| D4 | Admin = WR III dan Biro. Dekan hanya melihat data fakultasnya. **Kaprodi tidak dapat melihat prodi lain.** Dosen belum punya peran. Analisis (termasuk SPMI & AMI) untuk aktor "only view" sesuai otorisasi. |
| D5 | Rektor: lihat dan unduh. Dekan: hanya lihat. **Kaprodi melihat semua kerja sama di fakultasnya.** "Dashboard Kaprodi, Dekan, dan WR menampilkan kerja sama semua prodi." Dosen melihat semua mitra semua prodi. |
| D6 | Tiga peran: Pimpinan, Admin Kerjasama, Dosen (Kaprodi adalah penugasan pada peran Dosen). AMI hanya untuk Admin dan Pimpinan. |

**Keputusan sementara:** prototipe mensimulasikan lima peran (Admin, Pimpinan, Dekan, Kaprodi, Dosen). Kaprodi dan Dosen melihat prodinya sendiri, Dekan melihat fakultasnya, dan AMI hanya untuk Admin dan Pimpinan. Semua aturan ada di satu berkas, `src/config/akses.js`.

**Pertanyaan ke klien:**
1. Cakupan dasbor Kaprodi: prodinya sendiri, fakultasnya, atau semua prodi?
2. Apakah Dosen punya akun di KSDAS?
3. Siapa saja yang boleh membuka Analisis SPMI & AMI?

### K-02 · Rumus capaian AMI (memblokir)

| Dokumen | Isi |
|---|---|
| D1 US-3.2 | Capaian = M/N × 100%, tercapai bila ≥ 50% |
| D4 §3 | Formula belum ditulis eksplisit; persentase MoU "harus di atas 45%" |
| D5 §7 | Enam indikator per prodi: internasional ≥ 2, nasional ≥ 6, lokal ≥ 2, mitra pendukung belajar 17%, tren tidak turun (> 0%), MoU ditindaklanjuti 45% |
| D6 BR-06 | Standar 50% [TBC] |

**Keputusan sementara:** pakai enam indikator D5 (paling baru dan paling rinci). Rumus tiap indikator ada di `src/config/ami.js`.

**Pertanyaan ke klien:**
1. Indikator 1–3: satu MoU dan PKS turunannya dengan mitra yang sama dihitung 1 atau 2 kerja sama? (A-05)
2. Apakah LoI dihitung sebagai kerja sama? (A-04)
3. Indikator 4, "17% dari semua mitra": mitra prodi itu atau mitra seluruh institut? (A-06)
4. Indikator 5: "tidak turun" (≥ 0%) atau "naik" (> 0%)? Bagaimana jika tahun lalu 0? (A-07)
5. Indikator 6: "≥ 45%" atau "di atas 45%"? Apakah turunannya harus melibatkan prodi yang sama? (A-08)
6. Apakah hanya naskah terverifikasi yang dihitung? (A-09)
7. D5 menyebut "data mandiri berasal dari prodi". Apakah ada data AMI yang diinput manual oleh prodi, atau semuanya dihitung dari naskah? (D1 §5 butir 7)

### K-03 · Data untuk indikator AMI belum ada di model data (memblokir)

Indikator 1–4 butuh atribut yang tidak ada di model data D1, D3, maupun D6:

| Kebutuhan | Kondisi model data sekarang |
|---|---|
| Cakupan mitra: internasional / nasional / wilayah-lokal | Mitra hanya punya `jenis` (D1), `jenis_instansi` (D6), `type` dan `country` (D3). `country` bisa membedakan internasional, tetapi tidak bisa membedakan nasional dan lokal. |
| Penanda mitra pendukung pembelajaran di luar kampus (mis. tempat magang) | Tidak ada. Mungkin bisa diturunkan dari realisasi kegiatan magang di Modul B. |
| Relasi naskah ke banyak prodi | Ada di D1 (`Naskah_Prodi`), **tidak ada di entitas NASKAH D6**. |
| Status tindak lanjut naskah kedaluwarsa (diperpanjang atau tidak) | Tidak ada. Dibutuhkan agar kartu "Tindak Lanjut" bisa kosong kembali. |

**Usulan:** Modul A menambah atribut-atribut ini. Kontraknya ada di bagian 6.

### K-04 · Definisi empat kartu Beranda (memblokir)

FR-HOME-01 menyebut kartu Total Naskah, Masih Aktif, Perlu Perhatian, dan Tindak Lanjut, dan FR-HOME-02 mewajibkan kategorinya saling lepas. Masalahnya, isi kartu tidak didefinisikan, dan dokumen lain saling bertabrakan:

- FR-HOME-04 memasukkan draf, akan berakhir, dan kedaluwarsa ke "Perlu Perhatian".
- UC-05 2b memasukkan kedaluwarsa ke daftar "perlu tindak lanjut".
- US-09 memasukkan PKS tanpa induk ke "daftar tindak lanjut". Ini tidak saling lepas dengan "aktif".
- D4 §5 memakai "tindak lanjut" untuk status notifikasi (sudah ditindaklanjuti / menunggu konfirmasi), yaitu arti yang berbeda.

**Keputusan sementara (A-02):**

| Kartu | Isi |
|---|---|
| Masih Aktif | Berlaku lebih dari 30 hari lagi |
| Perlu Perhatian | Berakhir ≤ 30 hari lagi, atau draf (draf hanya terlihat admin) |
| Tindak Lanjut | Sudah kedaluwarsa dan belum diputuskan diperpanjang atau tidak |
| Riwayat (tidak berkartu) | Kedaluwarsa yang sudah ditindaklanjuti |

Total = Aktif + Perlu Perhatian + Tindak Lanjut + Riwayat. Persamaan ini ditampilkan di layar dan diuji otomatis.

**Pertanyaan ke klien:** apakah definisi ini sesuai? Apakah "Riwayat" ikut dihitung di Total?

### K-05 · Tahun tanpa data: "-" atau 0

US-3.3 meminta tahun tanpa data ditampilkan "-", bukan 0%. Sebaliknya, UC-06 3b meminta prodi tanpa naskah bernilai 0 dan ditandai belum memenuhi.

**Keputusan sementara:** tahun sebelum data pertama tercatat di sistem ditampilkan "-". Prodi yang memang tidak punya kerja sama pada tahun yang ada datanya bernilai 0.

### K-06 · Filter Beranda: langsung atau lewat tombol

FR-HOME-03 meminta pembaruan "secara instan". US-1.1 dan UC-12 meminta pengguna menekan "Generate / Buat analisis" lebih dulu.

**Keputusan sementara:** langsung diperbarui, tanpa tombol.

### K-07 · Siapa yang boleh mengekspor Excel

- D5: data Excel boleh dilihat dan diunduh siapa saja.
- FR-REP-02: ekspor hanya untuk Admin dan Pimpinan.
- FR-REP-06: Dosen hanya untuk prodinya.
- D4: Kaprodi mengunduh data prodinya.

**Keputusan sementara:** semua peran boleh mengekspor, tetapi hanya data dalam cakupannya.

### K-08 · Pengingat jatuh tempo

- Jarak waktu: 30 hari (D1, D6) atau 90/60/30 hari (D3).
- Penerima: Admin dan prodi terkait (D1), Admin dan Pimpinan (UC-05), atau Admin dan Dosen pelaksana (FR-COM-05).
- Pemilik fitur: pembagian modul menaruh "peringatan sebelum masa berlaku habis" di Modul A, padahal tampilannya ada di Beranda (Modul C).

**Usulan:** Modul A membuat dan menjadwalkan pengingat; Modul C hanya menampilkannya. Jarak waktu dan penerima perlu dikonfirmasi.

### K-09 · Letak menu laporan

D6 §5.1 menetapkan menu akhir Beranda, Naskah, SPMI & AMI, Struktur & Panduan, tanpa menu laporan. D5 menyebut tab terpisah "Analisis SPMI AMI" serta impor/ekspor. D4 menyebut Dashboard, Naskah, Analisis, Documentation.

**Keputusan sementara:** menu "Laporan & Ekspor" dibuat terpisah dulu agar mudah diuji. Perlu diputuskan apakah tetap menjadi menu sendiri atau masuk ke Beranda/Analisis.

### K-10 · Apakah tanggal berakhir wajib

D4 menyebut kolom wajib "tanggal dokumen" (satu tanggal). D6 FR-REG-02 mewajibkan tanggal mulai dan berakhir. Padahal status aktif ditentukan dari tanggal (D4), sehingga tanpa tanggal berakhir status tidak bisa dihitung.

**Keputusan sementara (A-01):** tanggal berakhir wajib; naskah tanpa tanggal berakhir dianggap draf (sesuai UC-05 2a).

### K-11 · Acuan MoU tidur

FR-REL-04 menetapkan 180 hari sejak tanggal penandatanganan, sedangkan US-17 menyebut "jangka ditetapkan Admin". Model data hanya punya `tanggal_mulai`, tidak ada tanggal tanda tangan.

**Keputusan sementara (A-10):** 180 hari sejak tanggal mulai, ditulis di konfigurasi (`BATAS_HARI_MOU_TIDUR`).

### K-12 · Format laporan akreditasi/Dikti belum ada

Formulir resmi LAM/BAN-PT/Dikti belum dilampirkan (D1 §5 butir 6, D6 [TBC]).

**Keputusan sementara:** laporan per prodi memakai draf format tiga lembar (Ringkasan, Kerja sama TS, Indikator AMI). Isian yang datanya belum ada ditandai "Data belum lengkap". Kami perlu contoh formulir resminya sebelum Sprint 4.

## 5. Daftar asumsi di prototipe

| Kode | Asumsi | Lokasi |
|---|---|---|
| A-01 | Kolom wajib: mitra, jenis, judul, periode (mulai dan berakhir), prodi | `src/lib/status.js` |
| A-02 | Definisi kartu Beranda (K-04) | `src/lib/status.js` |
| A-03 | Naskah dihitung pada tahun TS bila periodenya beririsan dengan TS (ini sekaligus memenuhi US-3.1) | `src/lib/ami.js` |
| A-04 | LoI tidak dihitung sebagai kerja sama | `src/config/ami.js` |
| A-05 | Indikator 1–3 dihitung per naskah, bukan per mitra unik | `src/lib/ami.js` |
| A-06 | Penyebut indikator 4 = mitra unik prodi pada TS | `src/lib/ami.js` |
| A-07 | Indikator 5 bila TS-1 = 0: nilai "-", dianggap memenuhi bila TS > 0 | `src/lib/ami.js` |
| A-08 | Indikator 6: turunan harus berlaku pada TS dan melibatkan prodi yang sama | `src/lib/ami.js` |
| A-09 | Hanya naskah terverifikasi yang dihitung (bisa dimatikan di layar) | `src/config/ami.js` |
| A-10 | MoU tidur dihitung dari tanggal mulai, batas 180 hari | `src/config/ami.js` |
| A-11 | Naskah draf hanya terlihat admin (D4) | `src/config/akses.js` |
| A-12 | Semester ganjil Agustus–Januari, genap Februari–Juli | `src/lib/laporan.js` |

## 6. Kontrak data yang dibutuhkan Modul C dari Modul A dan B

Modul C hanya membaca data. Field yang dibutuhkan (nama mengikuti prototipe dan bisa disesuaikan):

**Naskah (Modul A):** `id`, `jenis` (LoI/MoU/MoA/PKS/CA/IA), `nomor` (opsional), `judul`, `mitraId`, `tanggalMulai`, `tanggalBerakhir`, `prodi[]` (relasi many-to-many), `indukId` (boleh kosong), `statusVerifikasi`, `tindakLanjut` (diperpanjang / tidak_diperpanjang / kosong).

**Mitra (Modul A):** `id`, `nama`, `jenis`, **`cakupan`** (internasional/nasional/lokal), **`pendukungPembelajaran`** (boolean). Dua atribut yang dicetak tebal adalah atribut baru (K-03).

**Realisasi kegiatan (Modul B), untuk tahap berikutnya:** `naskahId`, `prodiId`, `jenis`, `tanggal`, `jumlahPeserta`. Dipakai untuk grafik serapan mahasiswa (FR-PART-11) dan mungkin indikator 4.

**Usulan endpoint:** server sudah membatasi data sesuai peran pengguna, jadi frontend tidak pernah menerima data di luar haknya.

- `GET /api/naskah?prodi=&tahun=`
- `GET /api/mitra`
- `GET /api/ami/capaian?tahun=&prodi=`

Perhitungan AMI sebaiknya dijalankan di backend supaya angkanya hanya punya satu sumber. Fungsi di `src/lib/ami.js` beserta test-nya bisa dipindahkan ke sana.

## 7. Di luar Modul C, tetapi perlu diselaraskan tim

- **D3 dan D6 menggambarkan lingkup yang berbeda.** D3 memuat OCR, alur persetujuan, tanda tangan digital, lima peran, dan notifikasi 90/60/30 hari. D6 (§1.2) dan D1 (Won't) justru mengeluarkan tanda tangan digital dan alur persetujuan dari lingkup.
- **Login.** D6 §2.5 menyebut autentikasi mandiri tanpa SSO, tetapi UC-01 di dokumen yang sama mengarahkan login ke CIS. D3 ADR-006 memakai SSO + JWT.
- **Posisi kotak pencarian.** Kanan atas menurut D2 dan D6 FR-SRC-01, kiri atas menurut D4.
- **Penandatangan PKS.** Dekan menurut D1 dan D6 BR-02, Kaprodi menurut D4.
- **Menu Struktur & Panduan** belum dibagi ke modul mana pun.

## 8. Catatan keamanan (untuk dosen Kripto)

- Menyembunyikan menu dan tombol di frontend **bukan** pengamanan. Server wajib menolak permintaan di luar hak dengan 403 dan mencatat percobaannya (US-3.5, US-5.2).
- Ekspor Excel di prototipe dibuat di peramban dari data yang sudah diterima. Ini hanya aman jika API sudah membatasi data sesuai peran.
- Pengalih peran (simulasi) hanya muncul di mode pengembangan, sesuai FR-AUTH-05.
