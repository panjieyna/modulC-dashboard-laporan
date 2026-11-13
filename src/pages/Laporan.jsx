import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useKsdas } from '../hooks/useKsdas.js';
import { aturFilterLaporan, catatEkspor } from '../store.js';
import FilterProdi from '../components/FilterProdi.jsx';
import { LencanaStatus, TabelSederhana, CatatanAsumsi, JudulHalaman } from '../components/ui.jsx';
import { saringLaporan, presetPeriode, barisDaftarNaskah, KOLOM_DAFTAR } from '../lib/laporan.js';
import { STATUS, URUTAN_STATUS } from '../lib/status.js';
import { aktifPadaTahun, hitungCapaianProdi } from '../lib/ami.js';
import { JENIS_NASKAH, CAKUPAN, namaProdi, fakultasDariProdi, namaFakultas } from '../data/master.js';
import { PERAN } from '../config/akses.js';
import { formatTanggal } from '../lib/tanggal.js';
import { formatTarget } from '../lib/format.js';
import { unduhXlsx, stempelWaktu } from '../lib/ekspor.js';

const PER_HALAMAN = 25;
const BELUM = 'Data belum lengkap';

function PilihanChip({ label, pilihan, terpilih, onUbah, labelOpsi = (x) => x }) {
  const toggle = (v) => onUbah(terpilih.includes(v) ? terpilih.filter((x) => x !== v) : [...terpilih, v]);
  return (
    <fieldset className="ks-chip-grup">
      <legend className="ks-filter-label">{label}</legend>
      {pilihan.map((v) => (
        <button key={v} type="button" className={`ks-chip-tombol ${terpilih.includes(v) ? 'aktif' : ''}`} aria-pressed={terpilih.includes(v)} onClick={() => toggle(v)}>
          {labelOpsi(v)}
        </button>
      ))}
    </fieldset>
  );
}

export default function Laporan() {
  const dispatch = useDispatch();
  const { tersaring, dalamCakupan, hariIni, mitraById, naskahById, akses, pengguna, prodiAktif } = useKsdas();
  const f = useSelector((s) => s.filter.laporan);
  const target = useSelector((s) => s.pengaturanAmi.target);
  const riwayat = useSelector((s) => s.riwayatEkspor);
  const [halaman, setHalaman] = useState(1);
  const [prodiLaporan, setProdiLaporan] = useState('');
  const preset = useMemo(() => presetPeriode(hariIni), [hariIni]);

  const hasil = useMemo(() => saringLaporan(tersaring, f, hariIni), [tersaring, f, hariIni]);
  const baris = useMemo(() => barisDaftarNaskah(hasil, { mitraById, naskahById, hariIni }), [hasil, mitraById, naskahById, hariIni]);
  const jumlahHalaman = Math.max(1, Math.ceil(baris.length / PER_HALAMAN));
  const halSah = Math.min(halaman, jumlahHalaman);
  const barisTampil = baris.slice((halSah - 1) * PER_HALAMAN, halSah * PER_HALAMAN);

  const ubah = (payload) => {
    dispatch(aturFilterLaporan(payload));
    setHalaman(1);
  };
  const pilihPreset = (id) => {
    const p = preset.find((x) => x.id === id);
    ubah({ preset: id, dari: p?.dari ?? '', sampai: p?.sampai ?? '' });
  };
  const statusTersedia = URUTAN_STATUS.filter((s) => akses.lihatDraf || s !== 'draf');

  const ringkasFilter = [
    `Prodi: ${prodiAktif.length > 3 ? `${prodiAktif.length} prodi` : prodiAktif.map(namaProdi).join(', ')}`,
    `Jenis: ${f.jenis.length ? f.jenis.join(', ') : 'semua'}`,
    `Status: ${f.status.length ? f.status.map((s) => STATUS[s].label).join(', ') : 'semua'}`,
    `Tanggal tanda tangan: ${f.dari || f.sampai ? `${f.dari || '…'} s.d. ${f.sampai || '…'}` : 'semua'}`,
  ].join('; ');

  const catat = (berkas, jumlahBaris, filter) =>
    dispatch(catatEkspor({ waktu: new Date().toISOString(), peran: pengguna.peran, berkas, jumlahBaris, filter }));

  const eksporDaftar = async () => {
    const namaFile = `KSDAS_Daftar-Naskah_${stempelWaktu()}.xlsx`;
    await unduhXlsx({
      namaFile,
      lembar: [{ nama: 'Daftar naskah', kolom: KOLOM_DAFTAR, baris }],
      info: {
        Laporan: 'Daftar naskah kerja sama sesuai filter di layar (FR-REP-02, FR-REP-03)',
        Filter: ringkasFilter,
        'Jumlah baris': baris.length,
        'Dibuat oleh (peran)': PERAN[pengguna.peran].label,
        'Waktu dibuat': new Date().toLocaleString('id-ID'),
        Catatan: 'DATA CONTOH dari prototipe uji coba Modul C. Berkas naskah dan anggaran sengaja tidak disertakan (FR-REP-05).',
      },
    });
    catat(namaFile, baris.length, ringkasFilter);
  };

  // US-2.14 / FR-REP-04: format resmi belum diterima, jadi struktur ini masih draf.
  const eksporPerProdi = async () => {
    const prodi = prodiLaporan || prodiAktif[0];
    const ts = Number(hariIni.slice(0, 4));
    const naskahProdi = dalamCakupan.filter((n) => (n.prodi ?? []).includes(prodi) && aktifPadaTahun(n, ts));
    const barisNaskah = barisDaftarNaskah(naskahProdi, { mitraById, naskahById, hariIni }).map((b) => ({
      ...b,
      nomor: b.nomor || BELUM,
      cakupan: b.cakupan || BELUM,
    }));
    const hitungJenis = (j) => naskahProdi.filter((n) => n.jenis === j).length;
    const hitungCakupan = (k) => naskahProdi.filter((n) => mitraById[n.mitraId]?.cakupan === k).length;
    const ringkasan = [
      { k: 'Program studi', v: namaProdi(prodi) },
      { k: 'Fakultas', v: namaFakultas(fakultasDariProdi(prodi)) },
      { k: 'Tahun (TS)', v: ts },
      { k: 'Kerja sama berlaku pada TS', v: naskahProdi.length },
      ...JENIS_NASKAH.map((j) => ({ k: `  ${j}`, v: hitungJenis(j) })),
      ...Object.entries(CAKUPAN).map(([k, label]) => ({ k: `  Mitra ${label.toLowerCase()}`, v: hitungCakupan(k) })),
      { k: 'Naskah tanpa nomor', v: naskahProdi.filter((n) => !n.nomor).length },
    ];
    const lembar = [
      { nama: 'Ringkasan', kolom: [{ key: 'k', header: 'Butir', width: 40 }, { key: 'v', header: 'Nilai', width: 40 }], baris: ringkasan },
      { nama: 'Kerja sama TS', kolom: KOLOM_DAFTAR, baris: barisNaskah },
    ];
    if (akses.lihatAmi) {
      const capaian = hitungCapaianProdi(dalamCakupan, mitraById, prodi, ts, { target });
      lembar.push({
        nama: 'Indikator AMI',
        kolom: [
          { key: 'ind', header: 'Indikator', width: 50 },
          { key: 'target', header: 'Target', width: 12 },
          { key: 'nilai', header: 'Capaian', width: 12 },
          { key: 'status', header: 'Status', width: 18 },
        ],
        baris: capaian.indikator.map((i) => ({
          ind: `${i.id}. ${i.nama}`,
          target: formatTarget(i),
          nilai: i.nilai === null ? BELUM : Math.round(i.nilai * 10) / 10,
          status: i.memenuhi ? 'Memenuhi' : 'Belum memenuhi',
        })),
      });
    }
    const namaFile = `KSDAS_Laporan-Prodi_${prodi}_${ts}_${stempelWaktu()}.xlsx`;
    await unduhXlsx({
      namaFile,
      lembar,
      info: {
        Laporan: 'Laporan kerja sama per program studi (DRAF FORMAT)',
        Status: 'Format formulir resmi LAM/BAN-PT/Dikti belum diterima (Backlog §5 butir 6). Isian kosong ditandai "Data belum lengkap".',
        'Dibuat oleh (peran)': PERAN[pengguna.peran].label,
        'Waktu dibuat': new Date().toLocaleString('id-ID'),
        Catatan: 'DATA CONTOH dari prototipe uji coba Modul C.',
      },
    });
    catat(namaFile, barisNaskah.length, `Laporan per prodi ${namaProdi(prodi)}, TS ${ts}`);
  };

  // Kolom tampilan = KOLOM_DAFTAR (sama dengan Excel); hanya cara menggambarnya yang berbeda.
  const kolomTampil = KOLOM_DAFTAR.map((k) => {
    if (k.key === 'judul') return { ...k, lebarMin: 240, render: (b) => <Link to={`/naskah/${b.id}`}>{b.judul || '(judul belum diisi)'}</Link> };
    if (k.key === 'mitra' || k.key === 'prodi') return { ...k, lebarMin: 200 };
    if (k.key === 'status') return { ...k, render: (b) => <LencanaStatus kode={b.kodeStatus} /> };
    if (k.key === 'mulai' || k.key === 'berakhir') return { ...k, nowrap: true, render: (b) => formatTanggal(b[k.key]) };
    if (k.key === 'no') return { ...k, angka: true };
    return { ...k, nowrap: true };
  });

  return (
    <div className="ks-tumpuk">
      <JudulHalaman
        judul="Laporan & Ekspor"
        sub="Rekap naskah per periode dan status, dapat diunduh dalam format Excel."
        aksi={
          akses.ekspor && (
            <button type="button" className="btn btn-sm btn-primary" onClick={eksporDaftar} disabled={!baris.length}>
              Ekspor daftar (.xlsx)
            </button>
          )
        }
      />
      <FilterProdi />
      <section className="card ks-card" aria-label="Filter laporan">
        <div className="card-body ks-tumpuk-kecil">
          <div className="ks-filter-baris flex-wrap">
            <label className="ks-filter-label" htmlFor="preset">
              Periode tanda tangan
            </label>
            <select id="preset" className="form-select form-select-sm w-auto" value={f.preset} onChange={(e) => pilihPreset(e.target.value)}>
              {preset.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              <option value="kustom">Rentang kustom</option>
            </select>
            <input type="date" className="form-control form-control-sm w-auto" aria-label="Dari tanggal" value={f.dari} onChange={(e) => ubah({ dari: e.target.value, preset: 'kustom' })} />
            <span className="text-secondary">s.d.</span>
            <input type="date" className="form-control form-control-sm w-auto" aria-label="Sampai tanggal" value={f.sampai} onChange={(e) => ubah({ sampai: e.target.value, preset: 'kustom' })} />
          </div>
          <PilihanChip label="Jenis" pilihan={JENIS_NASKAH} terpilih={f.jenis} onUbah={(jenis) => ubah({ jenis })} />
          <PilihanChip label="Status" pilihan={statusTersedia} terpilih={f.status} onUbah={(status) => ubah({ status })} labelOpsi={(s) => STATUS[s].label} />
        </div>
      </section>

      <section className="card ks-card" aria-labelledby="judul-hasil">
        <div className="card-body">
          <div className="ks-kepala-kartu">
            <div>
              <h2 className="h6 mb-1" id="judul-hasil">
                {baris.length} naskah
              </h2>
              <p className="small text-secondary mb-0">
                Berkas Excel berisi kolom dan baris yang sama persis dengan tabel ini (US-2.13). Diurutkan dari tanggal mulai terbaru.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <TabelSederhana kolom={kolomTampil} baris={barisTampil} kelas="ks-tabel-lebar" kosong="Tidak ada naskah yang cocok dengan filter." />
          </div>
          {jumlahHalaman > 1 && (
            <nav className="ks-paginasi" aria-label="Halaman tabel">
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={halSah === 1} onClick={() => setHalaman(halSah - 1)}>
                ← Sebelumnya
              </button>
              <span className="small text-secondary">
                Halaman {halSah} dari {jumlahHalaman}
              </span>
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={halSah === jumlahHalaman} onClick={() => setHalaman(halSah + 1)}>
                Berikutnya →
              </button>
            </nav>
          )}
        </div>
      </section>

      {akses.ekspor && prodiAktif.length > 0 && (
        <section className="card ks-card" aria-labelledby="judul-per-prodi">
          <div className="card-body">
            <h2 className="h6 mb-1" id="judul-per-prodi">
              Laporan per program studi (draf format akreditasi)
            </h2>
            <p className="small text-secondary">
              US-2.14 / FR-REP-04. Formulir resmi LAM/BAN-PT/Dikti belum diterima, jadi struktur lembar masih sementara. Isian yang datanya belum ada
              ditandai "Data belum lengkap", tidak dikosongkan.
            </p>
            <div className="ks-filter-baris flex-wrap">
              <label className="ks-filter-label" htmlFor="prodi-laporan">
                Prodi
              </label>
              <select
                id="prodi-laporan"
                className="form-select form-select-sm w-auto"
                value={prodiLaporan || prodiAktif[0]}
                onChange={(e) => setProdiLaporan(e.target.value)}
              >
                {prodiAktif.map((p) => (
                  <option key={p} value={p}>
                    {namaProdi(p)}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={eksporPerProdi}>
                Unduh laporan prodi (.xlsx)
              </button>
            </div>
          </div>
        </section>
      )}

      <CatatanAsumsi kode="A-12">Semester ganjil dianggap Agustus–Januari dan genap Februari–Juli. Perlu konfirmasi kalender akademik.</CatatanAsumsi>

      <section className="card ks-card" aria-labelledby="judul-riwayat">
        <div className="card-body">
          <h2 className="h6 mb-1" id="judul-riwayat">
            Riwayat ekspor sesi ini
          </h2>
          <p className="small text-secondary">
            Simulasi jejak ekspor (US-2.13 "aksi ekspor tercatat dengan filter yang dipakai"). Audit log permanen dan tidak dapat diubah tetap dicatat server.
          </p>
          <TabelSederhana
            kolom={[
              { key: 'waktu', header: 'Waktu', render: (r) => new Date(r.waktu).toLocaleString('id-ID') },
              { key: 'peran', header: 'Peran', render: (r) => PERAN[r.peran].label },
              { key: 'berkas', header: 'Berkas' },
              { key: 'jumlahBaris', header: 'Baris', angka: true },
              { key: 'filter', header: 'Filter' },
            ]}
            baris={riwayat.map((r, i) => ({ ...r, id: `${r.waktu}-${i}` }))}
            kosong="Belum ada ekspor."
          />
        </div>
      </section>
    </div>
  );
}
