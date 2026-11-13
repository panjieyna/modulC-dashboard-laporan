import { isoKeDate } from './tanggal.js';

/**
 * Buat dan unduh berkas .xlsx di peramban. ExcelJS dimuat dinamis supaya
 * halaman awal tetap ringan.
 *
 * lembar: [{ nama, kolom: [{ key, header, width, tipe? }], baris: [objek] }]
 * info  : objek kunci-nilai untuk lembar "Info" (filter, waktu, peran) — jejak ekspor.
 */
export async function unduhXlsx({ namaFile, lembar, info }) {
  const buffer = await buatXlsx({ lembar, info });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Susun workbook dan kembalikan isinya sebagai buffer. Terpisah dari unduhan agar dapat diuji. */
export async function buatXlsx({ lembar, info }) {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'KSDAS (prototipe Modul C)';
  wb.created = new Date();

  for (const l of lembar) {
    const ws = wb.addWorksheet(l.nama.slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.columns = l.kolom.map((k) => ({ header: k.header, key: k.key, width: k.width ?? 16 }));
    for (const b of l.baris) {
      const row = {};
      for (const k of l.kolom) {
        const v = b[k.key];
        row[k.key] = k.tipe === 'tanggal' && v ? isoKeDate(v) : v;
      }
      ws.addRow(row);
    }
    ws.getRow(1).font = { bold: true };
    l.kolom.forEach((k, i) => {
      if (k.tipe === 'tanggal') ws.getColumn(i + 1).numFmt = 'dd/mm/yyyy';
      if (k.tipe === 'persen') ws.getColumn(i + 1).numFmt = '0.0"%"';
    });
    if (l.kolom.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: l.kolom.length } };
  }

  if (info) {
    const wi = wb.addWorksheet('Info');
    wi.columns = [
      { header: 'Keterangan', key: 'k', width: 30 },
      { header: 'Nilai', key: 'v', width: 90 },
    ];
    Object.entries(info).forEach(([k, v]) => wi.addRow({ k, v: String(v) }));
    wi.getRow(1).font = { bold: true };
  }

  return wb.xlsx.writeBuffer();
}

export function stempelWaktu(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
