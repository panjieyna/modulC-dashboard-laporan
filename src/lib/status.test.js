import { describe, it, expect } from 'vitest';
import { statusNaskah, hitungKartu, kolomKurang, URUTAN_STATUS } from './status.js';
import { buatDataContoh } from '../data/dummy.js';

const HARI_INI = '2026-11-13';
const dasar = { id: 'X', jenis: 'PKS', judul: 'Uji', mitraId: 'M1', tanggalMulai: '2025-01-01', prodi: ['S1IF'], tindakLanjut: null };
const berakhir = (tanggalBerakhir, extra = {}) => ({ ...dasar, tanggalBerakhir, ...extra });

describe('Status naskah dan kartu Beranda', () => {
  it('BR-05 / FR-HOME-05: batas pengingat tepat 30 hari', () => {
    expect(statusNaskah(berakhir('2026-12-13'), HARI_INI)).toBe('akan_berakhir'); // sisa 30 hari
    expect(statusNaskah(berakhir('2026-12-14'), HARI_INI)).toBe('aktif'); // sisa 31 hari
    expect(statusNaskah(berakhir('2026-11-13'), HARI_INI)).toBe('akan_berakhir'); // berakhir hari ini, masih berlaku
    expect(statusNaskah(berakhir('2026-11-12'), HARI_INI)).toBe('kedaluwarsa');
  });

  it('Perbaikan Pertemuan 2: status ditentukan dari tanggal, bukan tombol', () => {
    expect(statusNaskah(berakhir('2026-01-01', { tindakLanjut: 'diperpanjang' }), HARI_INI)).toBe('riwayat');
  });

  it('UC-05 alur 2a: tanggal berakhir kosong masuk daftar belum lengkap, bukan pengingat', () => {
    const n = berakhir(null);
    expect(statusNaskah(n, HARI_INI)).toBe('draf');
    expect(kolomKurang(n)).toContain('Periode (mulai & berakhir)');
  });

  it('FR-HOME-02: setiap naskah masuk tepat satu kategori dan jumlah kategori = total', () => {
    const daftar = [
      berakhir('2028-01-01'),
      berakhir('2026-11-20'),
      berakhir('2026-10-01'),
      berakhir('2025-06-30', { tindakLanjut: 'tidak_diperpanjang' }),
      { ...dasar, prodi: [] },
    ];
    const k = hitungKartu(daftar, HARI_INI);
    expect(k.masihAktif + k.perluPerhatian + k.tindakLanjut + k.riwayat).toBe(k.total);
    expect(URUTAN_STATUS.reduce((s, kode) => s + k.perStatus[kode], 0)).toBe(k.total);
    expect(k).toMatchObject({ total: 5, masihAktif: 1, perluPerhatian: 2, tindakLanjut: 1, riwayat: 1 });
  });

  it('FR-HOME-02 pada seluruh data contoh: kategori tetap saling lepas', () => {
    const { naskah } = buatDataContoh(HARI_INI);
    const k = hitungKartu(naskah, HARI_INI);
    expect(k.masihAktif + k.perluPerhatian + k.tindakLanjut + k.riwayat).toBe(naskah.length);
  });
});
