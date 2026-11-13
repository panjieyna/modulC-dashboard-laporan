import { INDIKATOR_AMI, ATURAN_AMI, BATAS_HARI_MOU_TIDUR } from '../config/ami.js';
import { isLengkap, masihBerlaku } from './status.js';
import { selisihHari, tahunDari } from './tanggal.js';

const ids = (arr) => arr.map((x) => x.id);
const persen = (a, b) => (b > 0 ? (a / b) * 100 : 0);

/**
 * Naskah dihitung pada tahun TS bila periodenya beririsan dengan TS.
 * Ini sekaligus memenuhi US-3.1: data terbawa ke tahun berikutnya sampai kedaluwarsa.
 */
export function aktifPadaTahun(n, tahun) {
  if (!isLengkap(n)) return false;
  return n.tanggalMulai <= `${tahun}-12-31` && n.tanggalBerakhir >= `${tahun}-01-01`;
}

export function memenuhiTarget(nilai, pembanding, target) {
  if (nilai === null || nilai === undefined) return false;
  return pembanding === '>' ? nilai > target : nilai >= target;
}

function lengkapiOpsi(opsi = {}) {
  return {
    jenisDihitung: opsi.jenisDihitung ?? ATURAN_AMI.jenisDihitung,
    jenisTurunan: opsi.jenisTurunan ?? ATURAN_AMI.jenisTurunan,
    hanyaTerverifikasi: opsi.hanyaTerverifikasi ?? ATURAN_AMI.hanyaTerverifikasi,
    target: opsi.target ?? {},
  };
}

const terverifikasi = (n) => n.statusVerifikasi === 'terverifikasi';

/** Naskah yang menjadi dasar perhitungan prodi pada tahun TS. */
export function basisProdi(daftar, prodi, tahun, opsi) {
  const o = lengkapiOpsi(opsi);
  const kandidat = daftar.filter(
    (n) => (n.prodi ?? []).includes(prodi) && o.jenisDihitung.includes(n.jenis) && aktifPadaTahun(n, tahun),
  );
  return {
    dihitung: o.hanyaTerverifikasi ? kandidat.filter(terverifikasi) : kandidat,
    belumTerverifikasi: kandidat.filter((n) => !terverifikasi(n)),
  };
}

/**
 * Hitung enam indikator AMI untuk satu prodi dan satu tahun.
 * Setiap indikator membawa daftar pembilang/penyebut agar asal nilai dapat
 * ditelusuri (Perbaikan Pertemuan 2 §4: "dilihat dari data tabel lalu data mentahnya").
 */
export function hitungCapaianProdi(daftar, mitraById, prodi, tahun, opsi) {
  const o = lengkapiOpsi(opsi);
  const { dihitung, belumTerverifikasi } = basisProdi(daftar, prodi, tahun, o);
  const tahunLalu = basisProdi(daftar, prodi, tahun - 1, o).dihitung;
  const draf = daftar.filter((n) => !isLengkap(n) && (n.prodi ?? []).includes(prodi));

  const cakupan = (n) => mitraById[n.mitraId]?.cakupan;
  const perCakupan = (k) => dihitung.filter((n) => cakupan(n) === k);

  const mitraProdi = [...new Set(dihitung.map((n) => n.mitraId))];
  const mitraPendukung = mitraProdi.filter((id) => mitraById[id]?.pendukungPembelajaran);

  const mou = dihitung.filter((n) => n.jenis === 'MoU');
  const punyaTurunanBerlaku = (m) =>
    daftar.some(
      (c) =>
        c.indukId === m.id &&
        o.jenisTurunan.includes(c.jenis) &&
        (c.prodi ?? []).includes(prodi) &&
        aktifPadaTahun(c, tahun) &&
        (!o.hanyaTerverifikasi || terverifikasi(c)),
    );
  const mouLanjut = mou.filter(punyaTurunanBerlaku);

  const nSekarang = dihitung.length;
  const nLalu = tahunLalu.length;

  const mentah = {
    I1: { nilai: perCakupan('internasional').length, pembilang: ids(perCakupan('internasional')) },
    I2: { nilai: perCakupan('nasional').length, pembilang: ids(perCakupan('nasional')) },
    I3: { nilai: perCakupan('lokal').length, pembilang: ids(perCakupan('lokal')) },
    I4: {
      nilai: persen(mitraPendukung.length, mitraProdi.length),
      pembilang: mitraPendukung,
      penyebut: mitraProdi,
      jenisRincian: 'mitra',
    },
    I5: {
      // TS-1 kosong: persentase tidak terdefinisi (asumsi A-07).
      nilai: nLalu > 0 ? ((nSekarang - nLalu) / nLalu) * 100 : null,
      pembilang: ids(dihitung),
      penyebut: ids(tahunLalu),
      catatan: nLalu === 0 ? `TS-1 tidak memiliki kerja sama, sehingga persentase tren tidak dapat dihitung (TS: ${nSekarang}).` : null,
    },
    I6: { nilai: persen(mouLanjut.length, mou.length), pembilang: ids(mouLanjut), penyebut: ids(mou) },
  };

  const indikator = INDIKATOR_AMI.map((def) => {
    const target = o.target[def.id] ?? def.target;
    const h = mentah[def.id];
    let memenuhi = memenuhiTarget(h.nilai, def.pembanding, target);
    if (def.id === 'I5' && h.nilai === null) memenuhi = nSekarang > 0; // dari 0 menjadi > 0 dianggap naik
    return { ...def, target, jenisRincian: 'naskah', penyebut: null, catatan: null, ...h, memenuhi };
  });

  return {
    prodi,
    tahun,
    jumlahKerjaSama: nSekarang,
    indikator,
    jumlahMemenuhi: indikator.filter((i) => i.memenuhi).length,
    peringatan: {
      belumTerverifikasi: o.hanyaTerverifikasi ? belumTerverifikasi.length : 0,
      ikutDihitungBelumTerverifikasi: o.hanyaTerverifikasi ? 0 : belumTerverifikasi.length,
      draf: draf.length,
    },
  };
}

/** Tahun paling awal yang punya data di sistem; sebelum tahun ini dianggap "tidak ada data". */
export function tahunDataPertama(daftar) {
  const tahun = daftar.filter(isLengkap).map((n) => tahunDari(n.tanggalMulai));
  return tahun.length ? Math.min(...tahun) : null;
}

/**
 * US-3.3: perbandingan antar tahun. Tahun sebelum data pertama ditampilkan '-' (nilai null),
 * bukan 0% — sedangkan prodi yang memang tidak punya kerja sama tetap bernilai 0 (UC-06 3b). Lihat K-05.
 */
export function perbandinganAntarTahun(daftar, mitraById, prodi, tahunAwal, tahunAkhir, opsi) {
  const awalData = tahunDataPertama(daftar);
  const daftarTahun = [];
  for (let t = tahunAwal; t <= tahunAkhir; t += 1) daftarTahun.push(t);

  const perTahun = daftarTahun.map((t) => ({
    tahun: t,
    adaData: awalData !== null && t >= awalData,
    hasil: awalData !== null && t >= awalData ? hitungCapaianProdi(daftar, mitraById, prodi, t, opsi) : null,
  }));

  const baris = INDIKATOR_AMI.map((def, idx) => {
    const sel = perTahun.map((pt, i) => {
      const ind = pt.hasil ? pt.hasil.indikator[idx] : null;
      const nilai = ind ? ind.nilai : null;
      const sebelum = i > 0 && perTahun[i - 1].hasil ? perTahun[i - 1].hasil.indikator[idx].nilai : null;
      const selisih = nilai !== null && sebelum !== null ? nilai - sebelum : null;
      let arah = null;
      if (selisih !== null) arah = selisih > 0 ? 'naik' : selisih < 0 ? 'turun' : 'tetap';
      return { tahun: pt.tahun, adaData: pt.adaData, nilai, selisih, arah, memenuhi: ind ? ind.memenuhi : null };
    });
    return { def: { ...def, target: perTahun.find((p) => p.hasil)?.hasil.indikator[idx].target ?? def.target }, sel };
  });

  return { tahun: daftarTahun, baris };
}

/**
 * FR-REL-04 / FR-PART-09: MoU masih berlaku, sudah lebih dari 180 hari sejak tanggal mulai
 * (dipakai sebagai tanggal penandatanganan, asumsi A-10), dan tanpa turunan yang masih berlaku.
 */
export function daftarMouTidur(daftar, hariIni, batasHari = BATAS_HARI_MOU_TIDUR) {
  return daftar
    .filter((n) => n.jenis === 'MoU' && masihBerlaku(n, hariIni) && selisihHari(n.tanggalMulai, hariIni) > batasHari)
    .filter(
      (m) => !daftar.some((c) => c.indukId === m.id && ATURAN_AMI.jenisTurunan.includes(c.jenis) && masihBerlaku(c, hariIni)),
    )
    .map((m) => ({ ...m, umurHari: selisihHari(m.tanggalMulai, hariIni) }))
    .sort((a, b) => b.umurHari - a.umurHari);
}
