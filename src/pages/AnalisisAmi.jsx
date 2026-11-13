import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useKsdas } from '../hooks/useKsdas.js';
import { aturTahunAmi, aturHanyaTerverifikasi, aturTarget, catatEkspor } from '../store.js';
import FilterProdi from '../components/FilterProdi.jsx';
import { GrafikKolomTahun } from '../components/grafik.jsx';
import { AksesDitolak, LencanaCapaian, Modal, TabelSederhana, CatatanAsumsi, JudulHalaman } from '../components/ui.jsx';
import { INDIKATOR_AMI, BATAS_HARI_MOU_TIDUR, targetBawaan } from '../config/ami.js';
import { hitungCapaianProdi, perbandinganAntarTahun, tahunDataPertama, daftarMouTidur } from '../lib/ami.js';
import { CAKUPAN, namaProdi } from '../data/master.js';
import { formatNilaiIndikator, formatTarget, formatSelisih, formatAngka } from '../lib/format.js';
import { formatTanggal } from '../lib/tanggal.js';
import { unduhXlsx, stempelWaktu } from '../lib/ekspor.js';
import { PERAN } from '../config/akses.js';

function RincianIndikator({ ind, prodi, tahun, naskahById, mitraById }) {
  const kolomNaskah = [
    { key: 'nomor', header: 'Nomor', render: (n) => n.nomor || <span className="text-secondary">Data belum lengkap</span> },
    { key: 'jenis', header: 'Jenis' },
    { key: 'judul', header: 'Judul', render: (n) => <Link to={`/naskah/${n.id}`}>{n.judul}</Link> },
    { key: 'mitra', header: 'Mitra', render: (n) => mitraById[n.mitraId]?.nama },
    { key: 'cakupan', header: 'Cakupan', render: (n) => CAKUPAN[mitraById[n.mitraId]?.cakupan] },
    { key: 'periode', header: 'Periode', render: (n) => `${formatTanggal(n.tanggalMulai)} – ${formatTanggal(n.tanggalBerakhir)}` },
  ];
  const kolomMitra = [
    { key: 'nama', header: 'Mitra' },
    { key: 'cakupan', header: 'Cakupan', render: (m) => CAKUPAN[m.cakupan] },
    { key: 'pendukung', header: 'Pendukung belajar', render: (m) => (m.pendukungPembelajaran ? 'Ya' : 'Tidak') },
  ];
  const keBaris = (daftarId) =>
    (daftarId ?? []).map((id) => (ind.jenisRincian === 'mitra' ? mitraById[id] : naskahById[id])).filter(Boolean);
  const kolom = ind.jenisRincian === 'mitra' ? kolomMitra : kolomNaskah;
  const labelPembilang = { I4: 'Mitra pendukung belajar', I5: `Kerja sama berlaku ${tahun}`, I6: 'MoU yang punya turunan berlaku' }[ind.id] ?? 'Naskah yang dihitung';
  const labelPenyebut = { I4: 'Seluruh mitra prodi', I5: `Kerja sama berlaku ${tahun - 1}`, I6: 'Seluruh MoU berlaku' }[ind.id];

  return (
    <div className="ks-tumpuk-kecil">
      <dl className="ks-dl">
        <dt>Prodi / TS</dt>
        <dd>
          {namaProdi(prodi)} · {tahun}
        </dd>
        <dt>Rumus</dt>
        <dd>{ind.rumus}</dd>
        <dt>Hasil</dt>
        <dd>
          <strong>{formatNilaiIndikator(ind.nilai, ind.satuan)}</strong>
          {ind.penyebut && ind.id !== 'I5' && (
            <span className="text-secondary">
              {' '}
              ({ind.pembilang.length} dari {ind.penyebut.length})
            </span>
          )}{' '}
          · target {formatTarget(ind)} · <LencanaCapaian memenuhi={ind.memenuhi} />
        </dd>
      </dl>
      {ind.catatan && <p className="small text-secondary">{ind.catatan}</p>}
      <h3 className="h6 mt-2">
        {labelPembilang} ({ind.pembilang.length})
      </h3>
      <TabelSederhana kolom={kolom} baris={keBaris(ind.pembilang)} kosong="Tidak ada data yang memenuhi kriteria." />
      {labelPenyebut && (
        <>
          <h3 className="h6 mt-3">
            {labelPenyebut} ({ind.penyebut.length})
          </h3>
          <TabelSederhana kolom={kolom} baris={keBaris(ind.penyebut)} kosong="Tidak ada data." />
        </>
      )}
    </div>
  );
}

function PengaturanTarget({ onTutup }) {
  const dispatch = useDispatch();
  const target = useSelector((s) => s.pengaturanAmi.target);
  const [draf, setDraf] = useState(target);
  const simpan = () => {
    const bersih = Object.fromEntries(Object.entries(draf).map(([k, v]) => [k, Number(v)]));
    dispatch(aturTarget(bersih));
    onTutup();
  };
  return (
    <Modal
      judul="Atur target indikator AMI"
      lebar=""
      onTutup={onTutup}
      kaki={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => setDraf(targetBawaan())}>
            Kembalikan bawaan
          </button>
          <button type="button" className="btn btn-primary" onClick={simpan}>
            Simpan
          </button>
        </>
      }
    >
      <p className="small text-secondary">
        US-3.2: target dapat diubah Admin dan perhitungan berikutnya memakai nilai baru. Di prototipe, perubahan hanya berlaku untuk sesi ini.
      </p>
      {INDIKATOR_AMI.map((i) => (
        <div className="mb-3" key={i.id}>
          <label className="form-label" htmlFor={`target-${i.id}`}>
            {i.id}. {i.nama} <span className="text-secondary">({i.pembanding === '>' ? 'lebih dari' : 'minimal'})</span>
          </label>
          <div className="input-group input-group-sm">
            <input
              id={`target-${i.id}`}
              type="number"
              min="0"
              step={i.satuan === 'persen' ? '0.5' : '1'}
              className="form-control"
              value={draf[i.id]}
              onChange={(e) => setDraf({ ...draf, [i.id]: e.target.value })}
            />
            <span className="input-group-text">{i.satuan === 'persen' ? '%' : 'naskah'}</span>
          </div>
        </div>
      ))}
    </Modal>
  );
}

function PerbandinganTahun({ daftar, mitraById, prodiPilihan, opsi, tahunIni, awalData }) {
  const [prodi, setProdi] = useState(prodiPilihan[0]);
  const [rentang, setRentang] = useState(5);
  const [idInd, setIdInd] = useState('I6');
  const prodiSah = prodiPilihan.includes(prodi) ? prodi : prodiPilihan[0];
  const p = useMemo(
    () => perbandinganAntarTahun(daftar, mitraById, prodiSah, tahunIni - rentang + 1, tahunIni, opsi),
    [daftar, mitraById, prodiSah, rentang, tahunIni, opsi],
  );
  const barisInd = p.baris.find((b) => b.def.id === idInd);
  const panah = { naik: '▲', turun: '▼', tetap: '=' };

  return (
    <section className="card ks-card" aria-labelledby="judul-banding">
      <div className="card-body">
        <h2 className="h6 mb-1" id="judul-banding">
          Perbandingan capaian antar tahun
        </h2>
        <p className="small text-secondary">
          US-3.3. Tahun sebelum data pertama tercatat ({awalData ?? '–'}) ditampilkan "-", bukan 0%.
        </p>
        <div className="ks-filter-baris flex-wrap">
          <label className="ks-filter-label" htmlFor="banding-prodi">
            Prodi
          </label>
          <select id="banding-prodi" className="form-select form-select-sm w-auto" value={prodiSah} onChange={(e) => setProdi(e.target.value)}>
            {prodiPilihan.map((kode) => (
              <option key={kode} value={kode}>
                {namaProdi(kode)}
              </option>
            ))}
          </select>
          <label className="ks-filter-label" htmlFor="banding-rentang">
            Rentang
          </label>
          <select id="banding-rentang" className="form-select form-select-sm w-auto" value={rentang} onChange={(e) => setRentang(Number(e.target.value))}>
            {[3, 5, 8].map((n) => (
              <option key={n} value={n}>
                {n} tahun terakhir
              </option>
            ))}
          </select>
        </div>
        <div className="table-responsive mt-3">
          <table className="table table-sm ks-tabel">
            <thead>
              <tr>
                <th scope="col">Indikator</th>
                <th scope="col">Target</th>
                {p.tahun.map((t) => (
                  <th scope="col" key={t} className="text-end">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.baris.map((b) => (
                <tr key={b.def.id}>
                  <th scope="row" className="fw-normal">
                    {b.def.id}. {b.def.ringkas}
                  </th>
                  <td className="text-nowrap">{formatTarget(b.def)}</td>
                  {b.sel.map((s) => (
                    <td key={s.tahun} className="text-end ks-angka text-nowrap">
                      {formatNilaiIndikator(s.nilai, b.def.satuan)}
                      {s.arah && (
                        <span className={`ks-arah ks-arah-${s.arah}`} title={formatSelisih(s.selisih, b.def.satuan)}>
                          <span aria-hidden="true"> {panah[s.arah]}</span>
                          <span className="visually-hidden">
                            {' '}
                            {s.arah} {formatSelisih(s.selisih, b.def.satuan)}
                          </span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ks-filter-baris mt-2">
          <label className="ks-filter-label" htmlFor="banding-ind">
            Grafik
          </label>
          <select id="banding-ind" className="form-select form-select-sm w-auto" value={idInd} onChange={(e) => setIdInd(e.target.value)}>
            {INDIKATOR_AMI.map((i) => (
              <option key={i.id} value={i.id}>
                {i.id}. {i.nama}
              </option>
            ))}
          </select>
        </div>
        <GrafikKolomTahun
          data={barisInd.sel.map((s) => ({ tahun: String(s.tahun), nilai: s.nilai }))}
          namaSeri={barisInd.def.ringkas}
          target={barisInd.def.target}
          satuan={barisInd.def.satuan}
        />
      </div>
    </section>
  );
}

export default function AnalisisAmi() {
  const dispatch = useDispatch();
  const { akses, tersaring, dalamCakupan, mitraById, naskahById, hariIni, prodiAktif, pengguna } = useKsdas();
  const tahun = useSelector((s) => s.filter.tahunAmi);
  const hanyaTerverifikasi = useSelector((s) => s.filter.hanyaTerverifikasi);
  const target = useSelector((s) => s.pengaturanAmi.target);
  const [rincian, setRincian] = useState(null);
  const [aturTargetBuka, setAturTargetBuka] = useState(false);

  const tahunIni = Number(hariIni.slice(0, 4));
  const awalData = useMemo(() => tahunDataPertama(dalamCakupan), [dalamCakupan]);
  const opsi = useMemo(() => ({ hanyaTerverifikasi, target }), [hanyaTerverifikasi, target]);

  // Perhitungan memakai seluruh naskah dalam cakupan, lalu dipilah per prodi terpilih.
  const hasil = useMemo(
    () => prodiAktif.map((p) => hitungCapaianProdi(dalamCakupan, mitraById, p, tahun, opsi)),
    [prodiAktif, dalamCakupan, mitraById, tahun, opsi],
  );
  const mouTidur = useMemo(() => daftarMouTidur(tersaring, hariIni), [tersaring, hariIni]);

  if (!akses.lihatAmi) {
    return <AksesDitolak alasan="Capaian SPMI & AMI hanya dapat dilihat Admin Kerjasama dan Pimpinan (SRS FR-PART-10, Backlog US-3.5). Aturan ini masih dipertanyakan, lihat temuan K-01." />;
  }

  const totalBelumVerif = hasil.reduce((s, h) => s + h.peringatan.belumTerverifikasi, 0);
  const totalIkutBelumVerif = hasil.reduce((s, h) => s + h.peringatan.ikutDihitungBelumTerverifikasi, 0);
  const pilihanTahun = [];
  for (let t = tahunIni; t >= (awalData ?? tahunIni); t -= 1) pilihanTahun.push(t);

  const eksporAmi = async () => {
    const barisCapaian = hasil.map((h) => ({
      prodi: namaProdi(h.prodi),
      tahun: h.tahun,
      jumlahKerjaSama: h.jumlahKerjaSama,
      ...Object.fromEntries(h.indikator.map((i) => [i.id, i.nilai === null ? '-' : Math.round(i.nilai * 10) / 10])),
      memenuhi: `${h.jumlahMemenuhi}/${h.indikator.length}`,
    }));
    const barisRincian = hasil.flatMap((h) =>
      h.indikator.flatMap((i) =>
        i.pembilang.map((id) => {
          const n = i.jenisRincian === 'mitra' ? null : naskahById[id];
          return {
            prodi: namaProdi(h.prodi),
            indikator: `${i.id}. ${i.nama}`,
            nomor: n ? n.nomor || 'Data belum lengkap' : '',
            judul: n ? n.judul : '',
            mitra: n ? mitraById[n.mitraId]?.nama : mitraById[id]?.nama,
          };
        }),
      ),
    );
    const namaFile = `KSDAS_Capaian-AMI_${tahun}_${stempelWaktu()}.xlsx`;
    await unduhXlsx({
      namaFile,
      lembar: [
        {
          nama: 'Capaian AMI',
          kolom: [
            { key: 'prodi', header: 'Program studi', width: 36 },
            { key: 'tahun', header: 'TS', width: 8 },
            { key: 'jumlahKerjaSama', header: 'Kerja sama berlaku', width: 18 },
            ...INDIKATOR_AMI.map((i) => ({ key: i.id, header: `${i.id} ${i.ringkas} (${formatTarget({ ...i, target: target[i.id] })})`, width: 26 })),
            { key: 'memenuhi', header: 'Indikator memenuhi', width: 18 },
          ],
          baris: barisCapaian,
        },
        {
          nama: 'Rincian (asal nilai)',
          kolom: [
            { key: 'prodi', header: 'Program studi', width: 36 },
            { key: 'indikator', header: 'Indikator', width: 44 },
            { key: 'nomor', header: 'Nomor naskah', width: 24 },
            { key: 'judul', header: 'Judul naskah', width: 52 },
            { key: 'mitra', header: 'Mitra', width: 40 },
          ],
          baris: barisRincian,
        },
      ],
      info: {
        Laporan: 'Capaian indikator AMI kerja sama per prodi',
        'Tahun (TS)': tahun,
        Prodi: prodiAktif.map(namaProdi).join(', '),
        'Hanya naskah terverifikasi': hanyaTerverifikasi ? 'Ya' : 'Tidak',
        'Dibuat oleh (peran)': PERAN[pengguna.peran].label,
        'Waktu dibuat': new Date().toLocaleString('id-ID'),
        Catatan: 'DATA CONTOH dari prototipe uji coba Modul C. Rumus indikator mengikuti asumsi di docs/temuan-requirement-modul-c.md.',
      },
    });
    dispatch(catatEkspor({ waktu: new Date().toISOString(), peran: pengguna.peran, berkas: namaFile, jumlahBaris: barisCapaian.length, filter: `TS ${tahun}; ${prodiAktif.length} prodi` }));
  };

  const eksporMouTidur = async () => {
    const namaFile = `KSDAS_MoU-tidur_${stempelWaktu()}.xlsx`;
    await unduhXlsx({
      namaFile,
      lembar: [
        {
          nama: 'MoU tidur',
          kolom: [
            { key: 'nomor', header: 'Nomor', width: 24 },
            { key: 'judul', header: 'Judul', width: 52 },
            { key: 'mitra', header: 'Mitra', width: 40 },
            { key: 'prodi', header: 'Prodi', width: 36 },
            { key: 'mulai', header: 'Tanggal mulai', width: 14, tipe: 'tanggal' },
            { key: 'berakhir', header: 'Tanggal berakhir', width: 14, tipe: 'tanggal' },
            { key: 'umurHari', header: 'Hari tanpa turunan', width: 18 },
          ],
          baris: mouTidur.map((m) => ({
            nomor: m.nomor || 'Data belum lengkap',
            judul: m.judul,
            mitra: mitraById[m.mitraId]?.nama,
            prodi: m.prodi.map(namaProdi).join(', '),
            mulai: m.tanggalMulai,
            berakhir: m.tanggalBerakhir,
            umurHari: m.umurHari,
          })),
        },
      ],
      info: {
        Laporan: `MoU tanpa turunan PKS/MoA/CA/IA berlaku > ${BATAS_HARI_MOU_TIDUR} hari (FR-REP-07)`,
        'Per tanggal': hariIni,
        'Dibuat oleh (peran)': PERAN[pengguna.peran].label,
        Catatan: 'DATA CONTOH dari prototipe uji coba Modul C.',
      },
    });
    dispatch(catatEkspor({ waktu: new Date().toISOString(), peran: pengguna.peran, berkas: namaFile, jumlahBaris: mouTidur.length, filter: 'MoU tidur' }));
  };

  return (
    <div className="ks-tumpuk">
      <JudulHalaman
        judul="Analisis SPMI & AMI"
        sub="Capaian enam indikator kerja sama per prodi, dihitung otomatis dari data naskah."
        aksi={
          <>
            {akses.ubahTargetAmi && (
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setAturTargetBuka(true)}>
                Atur target
              </button>
            )}
            {akses.ekspor && (
              <button type="button" className="btn btn-sm btn-primary" onClick={eksporAmi}>
                Ekspor capaian (.xlsx)
              </button>
            )}
          </>
        }
      />

      <div className="ks-filter-baris flex-wrap">
        <label className="ks-filter-label" htmlFor="tahun-ami">
          Tahun (TS)
        </label>
        <select id="tahun-ami" className="form-select form-select-sm w-auto" value={tahun} onChange={(e) => dispatch(aturTahunAmi(Number(e.target.value)))}>
          {pilihanTahun.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="form-check form-switch ms-md-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="hanya-verif"
            checked={hanyaTerverifikasi}
            onChange={(e) => dispatch(aturHanyaTerverifikasi(e.target.checked))}
          />
          <label className="form-check-label" htmlFor="hanya-verif">
            Hanya naskah terverifikasi
          </label>
        </div>
      </div>
      <FilterProdi />

      {(totalBelumVerif > 0 || totalIkutBelumVerif > 0) && (
        <div className="alert alert-warning py-2 mb-0" role="status">
          <span aria-hidden="true">! </span>
          {totalBelumVerif > 0
            ? `${totalBelumVerif} keterlibatan naskah belum terverifikasi tidak ikut dihitung (FR-QA-07).`
            : `${totalIkutBelumVerif} keterlibatan naskah belum terverifikasi ikut dihitung. Hasil belum final (UC-06 4a).`}
        </div>
      )}

      <section className="card ks-card" aria-labelledby="judul-capaian">
        <div className="card-body">
          <h2 className="h6 mb-1" id="judul-capaian">
            Capaian indikator AMI, TS {tahun}
          </h2>
          <p className="small text-secondary">
            Klik nilai untuk melihat asal angkanya: data tabel lalu naskah sumbernya. Satu kerja sama multi-prodi dinilai di setiap prodi yang terlibat.
          </p>
          <div className="table-responsive">
            <table className="table table-sm ks-tabel ks-tabel-capaian">
              <thead>
                <tr>
                  <th scope="col">Prodi</th>
                  {INDIKATOR_AMI.map((i) => (
                    <th scope="col" key={i.id} className="text-end">
                      <span className="d-block">
                        {i.id}. {i.ringkas}
                      </span>
                      <span className="ks-target">{formatTarget({ ...i, target: target[i.id] })}</span>
                    </th>
                  ))}
                  <th scope="col" className="text-end">
                    Memenuhi
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasil.map((h) => (
                  <tr key={h.prodi}>
                    <th scope="row" className="fw-normal">
                      {namaProdi(h.prodi)}
                      <span className="d-block small text-secondary">{formatAngka(h.jumlahKerjaSama)} kerja sama berlaku</span>
                    </th>
                    {h.indikator.map((i) => (
                      <td key={i.id} className="text-end">
                        <button
                          type="button"
                          className={`ks-sel-nilai ${i.memenuhi ? 'ya' : 'tidak'}`}
                          onClick={() => setRincian({ ind: i, prodi: h.prodi })}
                          aria-label={`${i.nama}, ${namaProdi(h.prodi)}: ${formatNilaiIndikator(i.nilai, i.satuan)}, ${i.memenuhi ? 'memenuhi' : 'belum memenuhi'}. Lihat rincian`}
                        >
                          <span className="ks-angka">{formatNilaiIndikator(i.nilai, i.satuan)}</span>
                          <span className="ks-status-ikon" aria-hidden="true">
                            {i.memenuhi ? '✓' : '✕'}
                          </span>
                        </button>
                      </td>
                    ))}
                    <td className="text-end ks-angka">
                      {h.jumlahMemenuhi}/{h.indikator.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small text-secondary mb-0">
            <span className="ks-nada-good">✓</span> memenuhi target · <span className="ks-nada-critical">✕</span> belum memenuhi. Kondisi memenuhi maupun
            tidak tetap masuk perhitungan SPMI.
          </p>
        </div>
      </section>

      <CatatanAsumsi kode="K-02">
        Enam indikator diambil dari rapat 09/11/2026. Satuan hitung (per naskah), LoI tidak dihitung, dan pembanding "&gt; 0%" serta "≥ 45%" masih
        asumsi. Lihat docs/temuan-requirement-modul-c.md.
      </CatatanAsumsi>

      {prodiAktif.length > 0 && (
        <PerbandinganTahun daftar={dalamCakupan} mitraById={mitraById} prodiPilihan={prodiAktif} opsi={opsi} tahunIni={tahunIni} awalData={awalData} />
      )}

      {akses.lihatMouTidur && (
        <section className="card ks-card" aria-labelledby="judul-tidur">
          <div className="card-body">
          <h2 className="h6 mb-1" id="judul-tidur">
            MoU tidur ({mouTidur.length})
          </h2>
          <p className="small text-secondary">
            MoU berlaku tanpa turunan PKS/MoA/CA/IA yang berlaku, lebih dari {BATAS_HARI_MOU_TIDUR} hari sejak tanggal mulai (FR-REL-04, FR-PART-09).
          </p>
          <TabelSederhana
            kolom={[
              { key: 'judul', header: 'MoU', render: (m) => <Link to={`/naskah/${m.id}`}>{m.nomor || m.judul}</Link> },
              { key: 'mitra', header: 'Mitra', render: (m) => mitraById[m.mitraId]?.nama },
              { key: 'prodi', header: 'Prodi', render: (m) => m.prodi.map(namaProdi).join(', ') },
              { key: 'mulai', header: 'Mulai', nowrap: true, render: (m) => formatTanggal(m.tanggalMulai) },
              { key: 'umurHari', header: 'Hari tanpa turunan', angka: true },
            ]}
            baris={mouTidur}
            kosong="Tidak ada MoU tidur pada filter ini."
          />
          {akses.ekspor && mouTidur.length > 0 && (
            <button type="button" className="btn btn-sm btn-outline-secondary mt-3" onClick={eksporMouTidur}>
              Ekspor MoU tidur (.xlsx)
            </button>
          )}
          </div>
        </section>
      )}

      {rincian && (
        <Modal judul={`${rincian.ind.id}. ${rincian.ind.nama}`} onTutup={() => setRincian(null)}>
          <RincianIndikator ind={rincian.ind} prodi={rincian.prodi} tahun={tahun} naskahById={naskahById} mitraById={mitraById} />
        </Modal>
      )}
      {aturTargetBuka && <PengaturanTarget onTutup={() => setAturTargetBuka(false)} />}
    </div>
  );
}
