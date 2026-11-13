import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { buatXlsx } from './ekspor.js';
import { barisDaftarNaskah, saringLaporan, KOLOM_DAFTAR } from './laporan.js';
import { buatDataContoh } from '../data/dummy.js';

const HARI_INI = '2026-11-13';

describe('Berkas Excel hasil ekspor', () => {
  it('US-2.13: jumlah baris dan judul kolom di berkas sama dengan tabel di layar', async () => {
    const { naskah, mitra } = buatDataContoh(HARI_INI);
    const mitraById = Object.fromEntries(mitra.map((m) => [m.id, m]));
    const naskahById = Object.fromEntries(naskah.map((n) => [n.id, n]));
    const tersaring = saringLaporan(naskah, { status: ['aktif', 'akan_berakhir'] }, HARI_INI);
    const baris = barisDaftarNaskah(tersaring, { mitraById, naskahById, hariIni: HARI_INI });

    const buffer = await buatXlsx({ lembar: [{ nama: 'Daftar naskah', kolom: KOLOM_DAFTAR, baris }], info: { Filter: 'uji' } });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.getWorksheet('Daftar naskah');

    expect(ws.rowCount - 1).toBe(baris.length); // minus baris judul
    expect(ws.getRow(1).values.slice(1)).toEqual(KOLOM_DAFTAR.map((k) => k.header));
    expect(wb.getWorksheet('Info')).toBeDefined(); // jejak filter ikut di berkas
  });
});
