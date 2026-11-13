import { Link, useParams } from 'react-router';
import { useKsdas } from '../hooks/useKsdas.js';
import { LencanaStatus, JudulHalaman } from '../components/ui.jsx';
import { statusNaskah, kolomKurang, sisaHari } from '../lib/status.js';
import { CAKUPAN, namaProdi } from '../data/master.js';
import { formatTanggal } from '../lib/tanggal.js';

/**
 * Tampilan ringkas sebagai tujuan tautan pintas Beranda (FR-HOME-07).
 * Halaman detail lengkap (berkas, relasi, edit) adalah tanggung jawab Modul A.
 */
export default function NaskahRingkas() {
  const { id } = useParams();
  const { dalamCakupan, mitraById, naskahById, hariIni } = useKsdas();
  const n = dalamCakupan.find((x) => x.id === id);

  if (!n) {
    return (
      <div className="card ks-card">
        <div className="card-body">
          <h1 className="h4">Naskah tidak ditemukan</h1>
          <p className="text-secondary mb-0">Naskah tidak ada atau berada di luar hak akses peran Anda (UC-13 alur 1a).</p>
        </div>
      </div>
    );
  }

  const induk = n.indukId ? naskahById[n.indukId] : null;
  const turunan = dalamCakupan.filter((x) => x.indukId === n.id);
  const kurang = kolomKurang(n);
  const sisa = sisaHari(n, hariIni);
  const m = mitraById[n.mitraId];

  return (
    <div className="ks-tumpuk">
      <JudulHalaman judul={n.judul || '(judul belum diisi)'} sub={`${n.jenis} · ${n.nomor || 'nomor belum diisi'}`} aksi={<Link to="/">← Kembali ke Beranda</Link>} />
      <div className="alert alert-info py-2 mb-0" role="note">
        Halaman ringkas untuk menguji tautan pintas dari Beranda. Detail, berkas, dan relasi lengkap dikerjakan Modul A.
      </div>
      <section className="card ks-card">
        <div className="card-body">
          <dl className="ks-dl">
            <dt>Status</dt>
            <dd>
              <LencanaStatus kode={statusNaskah(n, hariIni)} />
              {sisa !== null && <span className="small text-secondary ms-2">{sisa >= 0 ? `${sisa} hari lagi` : `lewat ${-sisa} hari`}</span>}
            </dd>
            <dt>Mitra</dt>
            <dd>{m ? `${m.nama} · ${CAKUPAN[m.cakupan]}` : '—'}</dd>
            <dt>Prodi pelaksana</dt>
            <dd>{(n.prodi ?? []).map(namaProdi).join(', ') || '—'}</dd>
            <dt>Periode</dt>
            <dd>
              {formatTanggal(n.tanggalMulai)} – {formatTanggal(n.tanggalBerakhir)}
            </dd>
            <dt>Verifikasi</dt>
            <dd>{n.statusVerifikasi === 'terverifikasi' ? 'Terverifikasi' : 'Belum diverifikasi'}</dd>
            {kurang.length > 0 && (
              <>
                <dt>Kolom wajib kurang</dt>
                <dd>{kurang.join(', ')}</dd>
              </>
            )}
            <dt>Naskah induk</dt>
            <dd>
              {induk ? (
                <Link to={`/naskah/${induk.id}`}>
                  {induk.jenis} · {induk.nomor || induk.judul}
                </Link>
              ) : ['MoA', 'PKS', 'CA', 'IA'].includes(n.jenis) ? (
                'Tanpa MoU induk'
              ) : (
                '—'
              )}
            </dd>
            <dt>Turunan</dt>
            <dd>
              {turunan.length ? (
                <ul className="mb-0 ps-3">
                  {turunan.map((t) => (
                    <li key={t.id}>
                      <Link to={`/naskah/${t.id}`}>
                        {t.jenis} · {t.nomor || t.judul}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                'Belum ada data'
              )}
            </dd>
          </dl>
        </div>
      </section>
    </div>
  );
}
