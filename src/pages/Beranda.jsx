import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useKsdas } from '../hooks/useKsdas.js';
import { aturFilterLaporan } from '../store.js';
import FilterProdi from '../components/FilterProdi.jsx';
import { KartuGrafik, GrafikBatang, GrafikTren } from '../components/grafik.jsx';
import { LencanaStatus, CatatanAsumsi, JudulHalaman } from '../components/ui.jsx';
import { hitungKartu, statusNaskah, sisaHari, kolomKurang, masihBerlaku } from '../lib/status.js';
import { aktifPadaTahun } from '../lib/ami.js';
import { CAKUPAN, JENIS_NASKAH, namaProdi } from '../data/master.js';
import { formatTanggal, tahunDari } from '../lib/tanggal.js';
import { formatAngka } from '../lib/format.js';

const MAKS_DAFTAR = 8;

function KartuMetrik({ kartu, lihatDraf }) {
  const isi = [
    { kunci: 'total', judul: 'Total Naskah', ket: 'Semua naskah yang dapat Anda akses' },
    { kunci: 'masihAktif', judul: 'Masih Aktif', ket: 'Berlaku lebih dari 30 hari lagi' },
    {
      kunci: 'perluPerhatian',
      judul: 'Perlu Perhatian',
      ket: lihatDraf ? 'Berakhir ≤ 30 hari lagi, atau masih draf' : 'Berakhir ≤ 30 hari lagi',
    },
    { kunci: 'tindakLanjut', judul: 'Tindak Lanjut', ket: 'Sudah kedaluwarsa, belum diputuskan diperpanjang atau tidak' },
  ];
  const jumlahBagian = kartu.masihAktif + kartu.perluPerhatian + kartu.tindakLanjut + kartu.riwayat;
  return (
    <section aria-label="Ringkasan kerja sama">
      <div className="ks-kartu-grid">
        {isi.map((k) => (
          <div key={k.kunci} className="card ks-card ks-stat">
            <div className="card-body">
              <p className="ks-stat-judul">{k.judul}</p>
              <p className="ks-stat-nilai">{formatAngka(kartu[k.kunci])}</p>
              <p className="ks-stat-ket">{k.ket}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="ks-rekonsiliasi">
        <span aria-hidden="true">{jumlahBagian === kartu.total ? '✓' : '✕'}</span> Cek konsistensi (FR-HOME-02): {kartu.total} total ={' '}
        {kartu.masihAktif} aktif + {kartu.perluPerhatian} perlu perhatian + {kartu.tindakLanjut} tindak lanjut + {kartu.riwayat} riwayat
        (kedaluwarsa yang sudah ditindaklanjuti).
      </p>
    </section>
  );
}

function DaftarPantau({ tersaring, hariIni, mitraById, lihatDraf }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const kelompok = useMemo(() => {
    const per = (kode) => tersaring.filter((n) => statusNaskah(n, hariIni) === kode);
    return [
      { kode: 'akan_berakhir', label: 'Akan berakhir', isi: per('akan_berakhir').sort((a, b) => sisaHari(a, hariIni) - sisaHari(b, hariIni)) },
      { kode: 'kedaluwarsa', label: 'Kedaluwarsa', isi: per('kedaluwarsa').sort((a, b) => sisaHari(b, hariIni) - sisaHari(a, hariIni)) },
      ...(lihatDraf ? [{ kode: 'draf', label: 'Draf', isi: per('draf') }] : []),
    ];
  }, [tersaring, hariIni, lihatDraf]);
  const [tab, setTab] = useState('akan_berakhir');
  const aktif = kelompok.find((k) => k.kode === tab) ?? kelompok[0];

  const keterangan = (n) => {
    if (aktif.kode === 'draf') return `Kolom kurang: ${kolomKurang(n).join(', ')}`;
    const sisa = sisaHari(n, hariIni);
    if (sisa === 0) return 'Berakhir hari ini';
    return sisa > 0 ? `${sisa} hari lagi` : `Lewat ${-sisa} hari`;
  };

  const lihatSemua = () => {
    dispatch(aturFilterLaporan({ status: [aktif.kode], jenis: [], preset: 'semua', dari: '', sampai: '' }));
    navigate('/laporan');
  };

  return (
    <section className="card ks-card" aria-labelledby="judul-pantau">
      <div className="card-body">
        <div className="ks-kepala-kartu">
          <div>
            <h2 className="h6 mb-1" id="judul-pantau">
              Daftar pantau
            </h2>
            <p className="small text-secondary mb-0">Pengingat otomatis untuk naskah yang berakhir dalam 30 hari (FR-HOME-04, FR-HOME-05).</p>
          </div>
        </div>
        <ul className="nav nav-pills ks-tab mt-3" role="tablist">
          {kelompok.map((k) => (
            <li className="nav-item" key={k.kode} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={aktif.kode === k.kode}
                className={`nav-link ${aktif.kode === k.kode ? 'active' : ''}`}
                onClick={() => setTab(k.kode)}
              >
                {k.label} <span className="ks-tab-jumlah">{k.isi.length}</span>
              </button>
            </li>
          ))}
        </ul>
        {aktif.isi.length === 0 ? (
          <p className="ks-kosong mt-3">Tidak ada naskah pada kategori ini.</p>
        ) : (
          <ul className="ks-pantau" role="tabpanel">
            {aktif.isi.slice(0, MAKS_DAFTAR).map((n) => (
              <li key={n.id}>
                <div className="ks-pantau-utama">
                  <span className="ks-jenis">{n.jenis}</span>
                  {/* FR-HOME-07: tautan pintas ke rincian naskah */}
                  <Link to={`/naskah/${n.id}`}>{n.judul || '(judul belum diisi)'}</Link>
                </div>
                <div className="ks-pantau-meta">
                  <span>{mitraById[n.mitraId]?.nama ?? 'Mitra belum diisi'}</span>
                  <span>{(n.prodi ?? []).map(namaProdi).join(', ') || 'Prodi belum diisi'}</span>
                  <span>Berakhir {formatTanggal(n.tanggalBerakhir)}</span>
                </div>
                <div className="ks-pantau-kanan">
                  <LencanaStatus kode={statusNaskah(n, hariIni)} />
                  <span className="small text-secondary">{keterangan(n)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {aktif.isi.length > MAKS_DAFTAR && (
          <button type="button" className="btn btn-link btn-sm px-0 mt-2" onClick={lihatSemua}>
            Lihat semua {aktif.isi.length} naskah di Laporan & Ekspor →
          </button>
        )}
      </div>
    </section>
  );
}

export default function Beranda() {
  const { tersaring, hariIni, mitraById, akses, prodiAktif } = useKsdas();
  const kartu = useMemo(() => hitungKartu(tersaring, hariIni), [tersaring, hariIni]);

  const grafik = useMemo(() => {
    const lengkap = tersaring.filter((n) => statusNaskah(n, hariIni) !== 'draf');
    const tahunIni = Number(hariIni.slice(0, 4));
    const tahunAwal = Math.max(tahunIni - 7, Math.min(tahunIni, ...lengkap.map((n) => tahunDari(n.tanggalMulai))));
    const tren = [];
    for (let t = tahunAwal; t <= tahunIni; t += 1) {
      tren.push({
        tahun: String(t),
        aktif: lengkap.filter((n) => aktifPadaTahun(n, t)).length,
        baru: lengkap.filter((n) => tahunDari(n.tanggalMulai) === t).length,
      });
    }
    const berlaku = tersaring.filter((n) => masihBerlaku(n, hariIni));
    const perJenis = JENIS_NASKAH.map((j) => ({ label: j, nilai: tersaring.filter((n) => n.jenis === j).length }));
    const perProdi = prodiAktif
      .map((p) => ({ label: namaProdi(p), nilai: berlaku.filter((n) => n.prodi.includes(p)).length }))
      .sort((a, b) => b.nilai - a.nilai);
    const mitraBerlaku = [...new Set(berlaku.map((n) => n.mitraId))].map((id) => mitraById[id]).filter(Boolean);
    const perCakupan = Object.entries(CAKUPAN).map(([k, label]) => ({ label, nilai: mitraBerlaku.filter((m) => m.cakupan === k).length }));
    return { tren, perJenis, perProdi, perCakupan, jumlahBerlaku: berlaku.length };
  }, [tersaring, hariIni, mitraById, prodiAktif]);

  const kolomBatang = (judulLabel) => [
    { key: 'label', header: judulLabel },
    { key: 'nilai', header: 'Jumlah', angka: true },
  ];

  return (
    <div className="ks-tumpuk">
      <JudulHalaman judul="Beranda" sub={`Ringkasan kerja sama per ${formatTanggal(hariIni)}`} />
      <FilterProdi />
      <KartuMetrik kartu={kartu} lihatDraf={akses.lihatDraf} />
      <CatatanAsumsi kode="A-02">
        Definisi kartu belum ditetapkan di SRS. Prototipe memakai empat status yang saling lepas; lihat temuan K-04.
      </CatatanAsumsi>
      <DaftarPantau tersaring={tersaring} hariIni={hariIni} mitraById={mitraById} lihatDraf={akses.lihatDraf} />

      <KartuGrafik
        judul="Kerja sama per tahun"
        keterangan="Berlaku = periodenya beririsan dengan tahun itu. Baru = ditandatangani pada tahun itu."
        kolom={[
          { key: 'tahun', header: 'Tahun' },
          { key: 'aktif', header: 'Berlaku', angka: true },
          { key: 'baru', header: 'Baru', angka: true },
        ]}
        baris={grafik.tren}
      >
        <GrafikTren
          data={grafik.tren}
          seri={[
            { key: 'aktif', nama: 'Berlaku' },
            { key: 'baru', nama: 'Baru' },
          ]}
        />
      </KartuGrafik>

      {grafik.perProdi.length > 1 && (
        <KartuGrafik
          judul="Kerja sama yang masih berlaku per prodi"
          keterangan={`Satu naskah bisa melibatkan beberapa prodi, jadi jumlah per prodi dapat melebihi ${grafik.jumlahBerlaku} naskah berlaku.`}
          kolom={kolomBatang('Prodi')}
          baris={grafik.perProdi}
        >
          <GrafikBatang data={grafik.perProdi} namaSeri="Naskah berlaku" lebarLabel={220} />
        </KartuGrafik>
      )}

      <KartuGrafik judul="Naskah menurut jenis" keterangan="Semua status, sesuai filter." kolom={kolomBatang('Jenis')} baris={grafik.perJenis}>
        <GrafikBatang data={grafik.perJenis} namaSeri="Naskah" lebarLabel={56} />
      </KartuGrafik>

      <KartuGrafik
        judul="Mitra dengan kerja sama berlaku, menurut cakupan"
        keterangan="Dasar indikator AMI 1–3. Atribut cakupan mitra belum ada di model data (K-03)."
        kolom={kolomBatang('Cakupan')}
        baris={grafik.perCakupan}
      >
        <GrafikBatang data={grafik.perCakupan} namaSeri="Mitra" lebarLabel={120} />
      </KartuGrafik>
    </div>
  );
}
