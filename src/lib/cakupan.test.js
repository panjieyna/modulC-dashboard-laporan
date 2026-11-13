import { describe, it, expect } from 'vitest';
import { naskahDalamCakupan, prodiDalamCakupan, kebijakan } from './cakupan.js';
import { saringLaporan, barisDaftarNaskah, KOLOM_DAFTAR } from './laporan.js';

const lengkap = { jenis: 'PKS', judul: 'x', mitraId: 'M1', tanggalMulai: '2025-01-01', tanggalBerakhir: '2027-01-01', statusVerifikasi: 'terverifikasi' };
const daftar = [
  { ...lengkap, id: 'A', prodi: ['S1IF'] },
  { ...lengkap, id: 'B', prodi: ['S1SI'] },
  { ...lengkap, id: 'C', prodi: ['S1MR'] },
  { ...lengkap, id: 'D', prodi: ['S1IF', 'S1MR'] },
  { ...lengkap, id: 'E', prodi: ['S1IF'], tanggalBerakhir: null }, // draf
];
const idDari = (arr) => arr.map((n) => n.id);

describe('Hak akses data Modul C', () => {
  it('Perbaikan Pertemuan 2: Kaprodi tidak dapat melihat prodi lain', () => {
    expect(idDari(naskahDalamCakupan(daftar, { peran: 'kaprodi', prodi: 'S1SI' }))).toEqual(['B']);
  });

  it('Perbaikan Pertemuan 2: Dekan hanya melihat data fakultasnya', () => {
    expect(idDari(naskahDalamCakupan(daftar, { peran: 'dekan', fakultas: 'FITE' }))).toEqual(['A', 'B', 'D']);
    expect(prodiDalamCakupan({ peran: 'dekan', fakultas: 'FITE' })).toEqual(['S1IF', 'S1SI', 'S1TE']);
  });

  it('Perbaikan Pertemuan 2: naskah draf hanya tampil untuk admin', () => {
    expect(idDari(naskahDalamCakupan(daftar, { peran: 'admin' }))).toContain('E');
    expect(idDari(naskahDalamCakupan(daftar, { peran: 'pimpinan' }))).not.toContain('E');
  });

  it('FR-PART-10 / US-3.5: capaian AMI hanya untuk Admin dan Pimpinan (tampilan)', () => {
    expect(['admin', 'pimpinan', 'dekan', 'kaprodi', 'dosen'].filter((p) => kebijakan(p).lihatAmi)).toEqual(['admin', 'pimpinan']);
  });
});

describe('Ekspor laporan', () => {
  it('US-2.13 / FR-REP-03: baris ekspor sama dengan hasil filter di layar, kolom sama', () => {
    const tersaring = saringLaporan(daftar, { status: ['aktif'] }, '2026-11-13');
    const baris = barisDaftarNaskah(tersaring, { mitraById: { M1: { nama: 'Mitra', cakupan: 'nasional' } }, naskahById: {}, hariIni: '2026-11-13' });
    expect(baris).toHaveLength(tersaring.length);
    KOLOM_DAFTAR.forEach((k) => expect(baris[0]).toHaveProperty(k.key));
  });

  it('FR-REP-05: tidak ada kolom berkas, anggaran, atau catatan audit', () => {
    const kunci = KOLOM_DAFTAR.map((k) => k.key);
    ['berkas', 'anggaran', 'audit'].forEach((k) => expect(kunci).not.toContain(k));
  });

  it('FR-REL-03: PKS tanpa induk diberi label "Tanpa MoU induk"', () => {
    const [b] = barisDaftarNaskah([daftar[0]], { mitraById: {}, naskahById: {}, hariIni: '2026-11-13' });
    expect(b.induk).toBe('Tanpa MoU induk');
  });
});
