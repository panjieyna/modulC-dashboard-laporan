import { describe, it, expect } from 'vitest';
import { hitungCapaianProdi, perbandinganAntarTahun, aktifPadaTahun, daftarMouTidur } from './ami.js';

// Data uji kecil yang dihitung manual.
const mitraById = {
  M1: { id: 'M1', cakupan: 'internasional', pendukungPembelajaran: true },
  M2: { id: 'M2', cakupan: 'nasional', pendukungPembelajaran: false },
  M3: { id: 'M3', cakupan: 'lokal', pendukungPembelajaran: true },
  M4: { id: 'M4', cakupan: 'nasional', pendukungPembelajaran: false },
};
const v = 'terverifikasi';
const naskah = [
  { id: 'N1', jenis: 'MoU', judul: 'a', mitraId: 'M1', tanggalMulai: '2024-03-01', tanggalBerakhir: '2028-02-28', prodi: ['S1IF', 'S1SI'], statusVerifikasi: v },
  { id: 'N2', jenis: 'PKS', judul: 'b', mitraId: 'M1', tanggalMulai: '2025-01-10', tanggalBerakhir: '2026-12-31', prodi: ['S1IF'], indukId: 'N1', statusVerifikasi: v },
  { id: 'N3', jenis: 'PKS', judul: 'c', mitraId: 'M2', tanggalMulai: '2023-01-01', tanggalBerakhir: '2024-12-31', prodi: ['S1IF'], statusVerifikasi: v },
  { id: 'N4', jenis: 'IA', judul: 'd', mitraId: 'M3', tanggalMulai: '2026-02-01', tanggalBerakhir: '2026-08-01', prodi: ['S1IF'], statusVerifikasi: 'belum' },
  { id: 'N5', jenis: 'MoU', judul: 'e', mitraId: 'M4', tanggalMulai: '2026-01-15', tanggalBerakhir: '2030-01-14', prodi: ['S1IF'], statusVerifikasi: v },
  { id: 'N6', jenis: 'LoI', judul: 'f', mitraId: 'M2', tanggalMulai: '2026-03-01', tanggalBerakhir: '2027-03-01', prodi: ['S1IF'], statusVerifikasi: v },
];
const ind = (hasil, id) => hasil.indikator.find((i) => i.id === id);

describe('Perhitungan AMI per prodi (Modul C)', () => {
  it('US-3.1: naskah terbawa ke tahun berikutnya dan berhenti saat kedaluwarsa', () => {
    expect(aktifPadaTahun(naskah[0], 2025)).toBe(true);
    expect(aktifPadaTahun(naskah[0], 2026)).toBe(true);
    expect(aktifPadaTahun(naskah[2], 2024)).toBe(true);
    expect(aktifPadaTahun(naskah[2], 2025)).toBe(false);
  });

  it('Indikator 1: kerja sama internasional TS dihitung dan dibandingkan dengan target 2', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    expect(ind(h, 'I1')).toMatchObject({ nilai: 2, memenuhi: true, pembilang: ['N1', 'N2'] });
  });

  it('LoI tidak dihitung sebagai kerja sama (asumsi A-04)', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    expect(ind(h, 'I2').pembilang).not.toContain('N6');
  });

  it('Kasus multi-prodi: satu naskah dihitung pada setiap prodi yang terlibat', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1SI', 2026);
    expect(ind(h, 'I1').pembilang).toEqual(['N1']);
  });

  it('FR-QA-07: hanya naskah terverifikasi yang dihitung, sisanya jadi peringatan (UC-06 4a)', () => {
    const ketat = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    expect(ind(ketat, 'I3').nilai).toBe(0);
    expect(ketat.peringatan.belumTerverifikasi).toBe(1);
    const longgar = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026, { hanyaTerverifikasi: false });
    expect(ind(longgar, 'I3').nilai).toBe(1);
  });

  it('Indikator 4: persentase mitra pendukung belajar dari mitra prodi', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    expect(ind(h, 'I4')).toMatchObject({ nilai: 50, penyebut: ['M1', 'M4'], pembilang: ['M1'], memenuhi: true });
  });

  it('Indikator 5: tren dihitung dari jumlah kerja sama aktif TS dibanding TS-1', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    // 2025: N1, N2 = 2; 2026: N1, N2, N5 = 3 → +50%
    expect(ind(h, 'I5')).toMatchObject({ nilai: 50, memenuhi: true });
  });

  it('Indikator 6: MoU yang ditindaklanjuti PKS/IA berlaku untuk prodi tersebut', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026);
    expect(ind(h, 'I6')).toMatchObject({ nilai: 50, pembilang: ['N1'], penyebut: ['N1', 'N5'], memenuhi: true });
  });

  it('US-3.2: target dapat diubah dan perhitungan berikutnya memakai nilai baru', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1IF', 2026, { target: { I6: 60 } });
    expect(ind(h, 'I6')).toMatchObject({ target: 60, memenuhi: false });
  });

  it('UC-06 3b: prodi tanpa naskah pada tahun itu bernilai 0 dan belum memenuhi', () => {
    const h = hitungCapaianProdi(naskah, mitraById, 'S1TE', 2026);
    expect(ind(h, 'I2')).toMatchObject({ nilai: 0, memenuhi: false });
  });

  it('US-3.3: tahun tanpa data ditampilkan "-" (null), bukan 0%', () => {
    const p = perbandinganAntarTahun(naskah, mitraById, 'S1IF', 2021, 2026);
    const i6 = p.baris.find((b) => b.def.id === 'I6');
    expect(i6.sel.find((s) => s.tahun === 2022)).toMatchObject({ adaData: false, nilai: null });
    expect(i6.sel.find((s) => s.tahun === 2026).nilai).toBe(50);
  });

  it('US-3.3: selisih dan arah naik/turun antar tahun', () => {
    const p = perbandinganAntarTahun(naskah, mitraById, 'S1IF', 2025, 2026);
    const i1 = p.baris.find((b) => b.def.id === 'I1');
    expect(i1.sel[1]).toMatchObject({ nilai: 2, selisih: 0, arah: 'tetap' });
  });

  it('FR-REL-04: MoU tanpa turunan berlaku > 180 hari ditandai tidur', () => {
    const tidur = daftarMouTidur(naskah, '2026-11-13');
    expect(tidur.map((m) => m.id)).toEqual(['N5']);
  });
});
