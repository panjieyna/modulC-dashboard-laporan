// Generator DATA CONTOH (fiktif) untuk uji coba Modul C.
// Tidak memakai data klien: semua nama mitra karangan dan diberi label "(contoh)".
// Deterministik: seed dan tanggal yang sama selalu menghasilkan data yang sama.

import { PRODI } from './master.js';
import { tambahHari } from '../lib/tanggal.js';

const MITRA_INTERNASIONAL = [
  'Northvale Institute of Technology',
  'Kestrel Polytechnic',
  'Meridale University',
  'Orbis Digital Labs',
  'Halvren Research Centre',
  'Corvane University',
  'Saltmere College of Engineering',
  'Lumora Systems Inc.',
];

const MITRA_NASIONAL = [
  'PT Arunika Data Nusantara',
  'PT Sinar Kawi Teknologi',
  'PT Baskara Energi Lestari',
  'PT Cakrawala Integra',
  'PT Laras Bioindustri',
  'PT Wiyata Solusi Digital',
  'Universitas Sentosa Raya',
  'Universitas Pelita Bangsa Timur',
  'Institut Teknologi Arunaya',
  'Politeknik Tirta Mandala',
  'PT Nawasena Metal',
  'PT Gemilang Rekayasa',
  'Badan Riset Contoh Nasional',
  'PT Samudra Sinergi Data',
  'Yayasan Cerdas Bersama',
  'PT Kirana Agro Bioteknik',
  'PT Adhikari Infrastruktur',
  'Lembaga Mitra Inovasi',
];

const MITRA_LOKAL = [
  'CV Hutan Pinus Kreatif',
  'Koperasi Tani Lembah Hijau',
  'PT Tepian Danau Wisata',
  'CV Ulos Digital Mandiri',
  'Yayasan Pendidikan Bukit Indah',
  'Pemerintah Desa Contoh Sejahtera',
  'BUMDes Contoh Makmur',
  'CV Kopi Lereng Utara',
  'Sekolah Vokasi Contoh',
  'Puskesmas Contoh Harapan',
];

const BIDANG = [
  'kecerdasan artifisial',
  'energi terbarukan',
  'bioproses pangan',
  'rekayasa perangkat lunak',
  'sistem informasi desa',
  'metalurgi ekstraktif',
  'IoT pertanian',
  'keamanan siber',
  'manajemen rantai pasok',
  'analitik data',
];

const POLA_JUDUL = {
  LoI: ['Rencana kerja sama bidang {b}'],
  MoU: ['Kerja sama pendidikan, penelitian, dan pengabdian', 'Kerja sama kelembagaan bidang {b}'],
  MoA: ['Perjanjian pelaksanaan riset {b}'],
  PKS: ['Program magang mahasiswa bidang {b}', 'Penelitian bersama {b}', 'Pengembangan kurikulum {b}', 'Pertukaran dosen bidang {b}'],
  CA: ['Perjanjian kerahasiaan data riset {b}'],
  IA: ['Pelaksanaan magang mahasiswa', 'Kunjungan industri bidang {b}', 'Pelatihan {b} untuk mahasiswa', 'Kuliah tamu {b}'],
};

function jenisMitraDariNama(nama) {
  if (/^(PT|CV)\b/.test(nama) || /Labs|Systems|Inc\./.test(nama)) return 'industri';
  if (/Universit|Institut|Politeknik|College|Polytechnic|Sekolah/.test(nama)) return 'universitas';
  if (/Badan|Pemerintah|Puskesmas|BUMDes/.test(nama)) return 'pemerintah';
  return 'lsm';
}

function pembangkit(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buatDataContoh(hariIni, seed = 20261113) {
  const r = pembangkit(seed);
  const pilih = (arr) => arr[Math.floor(r() * arr.length)];
  const antara = (a, b) => a + Math.floor(r() * (b - a + 1));
  const peluang = (p) => r() < p;
  const ambil = (arr, min, max) => {
    const sisa = [...arr];
    const n = Math.min(antara(min, max), sisa.length);
    const hasil = [];
    for (let i = 0; i < n; i += 1) hasil.push(sisa.splice(Math.floor(r() * sisa.length), 1)[0]);
    return hasil;
  };
  const pad = (n) => String(n).padStart(2, '0');

  // ---------- Mitra ----------
  const mitra = [];
  const tambahMitra = (daftar, cakupan, pPendukung) =>
    daftar.forEach((nama) =>
      mitra.push({
        id: `M${pad(mitra.length + 1)}`,
        nama: `${nama} (contoh)`,
        jenis: jenisMitraDariNama(nama),
        cakupan,
        pendukungPembelajaran: peluang(pPendukung),
      }),
    );
  tambahMitra(MITRA_INTERNASIONAL, 'internasional', 0.35);
  tambahMitra(MITRA_NASIONAL, 'nasional', 0.45);
  tambahMitra(MITRA_LOKAL, 'lokal', 0.5);

  // ---------- Naskah ----------
  const naskah = [];
  let urut = 1;
  const semuaProdi = PRODI.map((p) => p.kode);
  const prodiSeFakultas = (min, max) => {
    const fak = pilih(PRODI).fakultas;
    return ambil(PRODI.filter((p) => p.fakultas === fak).map((p) => p.kode), min, max);
  };
  const judulUntuk = (jenis) => pilih(POLA_JUDUL[jenis]).replace('{b}', pilih(BIDANG));
  const tanggalDiTahun = (tahun) => {
    const iso = `${tahun}-${pad(antara(1, 12))}-${pad(antara(1, 28))}`;
    return iso > hariIni ? tambahHari(hariIni, -antara(20, 200)) : iso;
  };

  function buat(jenis, { mitraId, mulai, durasiHari, prodi, indukId = null }) {
    const id = `N${String(urut).padStart(3, '0')}`;
    const n = {
      id,
      jenis,
      nomor: peluang(0.85) ? `KS/${jenis}/${String(urut).padStart(3, '0')}/${mulai.slice(0, 4)}` : null,
      judul: judulUntuk(jenis),
      mitraId,
      tanggalMulai: mulai,
      tanggalBerakhir: tambahHari(mulai, durasiHari),
      prodi,
      indukId,
      statusVerifikasi: 'belum',
      tindakLanjut: null,
    };
    urut += 1;
    naskah.push(n);
    return n;
  }

  // MoU beserta turunannya (PKS/MoA/CA, lalu IA di bawah PKS/MoA).
  const tahunMou = [2018, 2019, 2020, 2021, 2022, 2023, 2023, 2024, 2024, 2024, 2025, 2025, 2025, 2026, 2026];
  for (let i = 0; i < 42; i += 1) {
    const m = pilih(mitra);
    const mou = buat('MoU', { mitraId: m.id, mulai: tanggalDiTahun(pilih(tahunMou)), durasiHari: antara(3, 5) * 365, prodi: ambil(semuaProdi, 1, 3) });
    if (peluang(0.7)) {
      const jumlah = antara(1, 3);
      for (let j = 0; j < jumlah; j += 1) {
        const mulai = tambahHari(mou.tanggalMulai, antara(30, 500));
        if (mulai > hariIni) continue;
        const jenis = pilih(['PKS', 'PKS', 'PKS', 'MoA', 'CA']);
        const anak = buat(jenis, { mitraId: m.id, mulai, durasiHari: antara(1, 3) * 365, prodi: ambil(mou.prodi, 1, 2), indukId: mou.id });
        if (jenis !== 'CA' && peluang(0.5)) {
          const jumlahIa = antara(1, 2);
          for (let x = 0; x < jumlahIa; x += 1) {
            const mulaiIa = tambahHari(anak.tanggalMulai, antara(15, 200));
            if (mulaiIa > hariIni) continue;
            buat('IA', { mitraId: m.id, mulai: mulaiIa, durasiHari: antara(150, 540), prodi: ambil(anak.prodi, 1, 1), indukId: anak.id });
          }
        }
      }
    }
    if (peluang(0.1)) {
      const mulaiIa = tambahHari(mou.tanggalMulai, antara(60, 300));
      if (mulaiIa <= hariIni) buat('IA', { mitraId: m.id, mulai: mulaiIa, durasiHari: antara(150, 400), prodi: ambil(mou.prodi, 1, 1), indukId: mou.id });
    }
  }

  // PKS dan IA tanpa MoU induk (BR-03), serta LoI.
  for (let i = 0; i < 14; i += 1) {
    buat('PKS', { mitraId: pilih(mitra).id, mulai: tanggalDiTahun(antara(2021, 2026)), durasiHari: antara(2, 4) * 365, prodi: prodiSeFakultas(1, 2) });
  }
  for (let i = 0; i < 4; i += 1) {
    buat('IA', { mitraId: pilih(mitra).id, mulai: tanggalDiTahun(antara(2023, 2026)), durasiHari: antara(150, 400), prodi: prodiSeFakultas(1, 1) });
  }
  for (let i = 0; i < 5; i += 1) {
    buat('LoI', { mitraId: pilih(mitra).id, mulai: tanggalDiTahun(antara(2024, 2026)), durasiHari: 365, prodi: ambil(semuaProdi, 1, 2) });
  }

  // Paksa beberapa naskah berakhir ≤ 30 hari lagi dan beberapa baru saja kedaluwarsa.
  const berjalanLama = () =>
    naskah.filter((n) => n.tanggalBerakhir > tambahHari(hariIni, 30) && n.tanggalMulai < tambahHari(hariIni, -120));
  for (let i = 0; i < 7; i += 1) {
    const kandidat = berjalanLama();
    if (kandidat.length) pilih(kandidat).tanggalBerakhir = tambahHari(hariIni, antara(0, 30));
  }
  for (let i = 0; i < 5; i += 1) {
    const kandidat = berjalanLama();
    if (kandidat.length) pilih(kandidat).tanggalBerakhir = tambahHari(hariIni, -antara(1, 90));
  }

  // Tindak lanjut naskah kedaluwarsa: yang sudah lama umumnya sudah diputuskan.
  for (const n of naskah) {
    if (n.tanggalBerakhir >= hariIni) continue;
    const lamaLewat = n.tanggalBerakhir < tambahHari(hariIni, -120);
    if (peluang(lamaLewat ? 0.93 : 0.3)) n.tindakLanjut = pilih(['diperpanjang', 'tidak_diperpanjang']);
  }

  // Status verifikasi.
  for (const n of naskah) n.statusVerifikasi = peluang(0.82) ? 'terverifikasi' : 'belum';

  // Beberapa draf (kolom wajib kosong), dipilih dari naskah tanpa turunan.
  const punyaAnak = new Set(naskah.map((n) => n.indukId).filter(Boolean));
  for (let i = 0; i < 7; i += 1) {
    const kandidat = naskah.filter((n) => !punyaAnak.has(n.id) && n.statusVerifikasi === 'belum' && !n.draf);
    if (!kandidat.length) break;
    const n = pilih(kandidat);
    n.draf = true;
    const kolom = pilih(['tanggalBerakhir', 'prodi', 'mitraId', 'judul']);
    n[kolom] = kolom === 'prodi' ? [] : null;
  }
  naskah.forEach((n) => delete n.draf);

  return { mitra, naskah };
}
