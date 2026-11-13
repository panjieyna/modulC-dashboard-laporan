import { useEffect, useId } from 'react';
import { STATUS } from '../lib/status.js';

/** Status selalu tampil sebagai ikon + label; warna tidak pernah berdiri sendiri. */
export function LencanaStatus({ kode }) {
  const s = STATUS[kode];
  return (
    <span className={`ks-status ks-nada-${s.nada}`}>
      <span className="ks-status-ikon" aria-hidden="true">
        {s.ikon}
      </span>
      {s.label}
    </span>
  );
}

export function LencanaCapaian({ memenuhi }) {
  return memenuhi ? (
    <span className="ks-status ks-nada-good">
      <span className="ks-status-ikon" aria-hidden="true">✓</span>Memenuhi
    </span>
  ) : (
    <span className="ks-status ks-nada-critical">
      <span className="ks-status-ikon" aria-hidden="true">✕</span>Belum memenuhi
    </span>
  );
}

export function Modal({ judul, onTutup, children, lebar = 'modal-lg', kaki }) {
  const idJudul = useId();
  useEffect(() => {
    const tutup = (e) => e.key === 'Escape' && onTutup();
    window.addEventListener('keydown', tutup);
    document.body.classList.add('modal-open');
    return () => {
      window.removeEventListener('keydown', tutup);
      document.body.classList.remove('modal-open');
    };
  }, [onTutup]);
  return (
    <>
      <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby={idJudul} onClick={onTutup}>
        <div className={`modal-dialog modal-dialog-scrollable ${lebar}`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5" id={idJudul}>
                {judul}
              </h2>
              <button type="button" className="btn-close" aria-label="Tutup" onClick={onTutup} />
            </div>
            <div className="modal-body">{children}</div>
            {kaki && <div className="modal-footer">{kaki}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}

/** Tabel ringkas untuk "tampilan tabel" setiap grafik (aksesibilitas) dan daftar kecil. */
export function TabelSederhana({ kolom, baris, kosong = 'Belum ada data.', kelas = '' }) {
  if (!baris.length) return <p className="ks-kosong">{kosong}</p>;
  return (
    <div className="table-responsive">
      <table className={`table table-sm ks-tabel mb-0 ${kelas}`}>
        <thead>
          <tr>
            {kolom.map((k) => (
              <th key={k.key} scope="col" className={k.angka ? 'text-end' : undefined}>
                {k.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baris.map((b, i) => (
            <tr key={b.id ?? i}>
              {kolom.map((k) => (
                <td
                  key={k.key}
                  className={[k.angka && 'text-end ks-angka', k.nowrap && 'text-nowrap'].filter(Boolean).join(' ') || undefined}
                  style={k.lebarMin ? { minWidth: k.lebarMin } : undefined}
                >
                  {k.render ? k.render(b) : b[k.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AksesDitolak({ alasan }) {
  return (
    <div className="card ks-card">
      <div className="card-body">
        <h1 className="h4">Halaman tidak tersedia untuk peran Anda</h1>
        <p className="text-secondary mb-2">{alasan}</p>
        <p className="small text-secondary mb-0">
          Di sistem nyata, server juga wajib menolak permintaan ini dengan kode 403 dan mencatat percobaannya di riwayat aktivitas
          (US-3.5). Menyembunyikan menu di frontend bukan pengamanan.
        </p>
      </div>
    </div>
  );
}

/** Penanda asumsi agar penguji tahu bagian mana yang masih perlu dikonfirmasi klien. */
export function CatatanAsumsi({ kode, children }) {
  return (
    <p className="ks-asumsi">
      <span className="ks-asumsi-kode">{kode}</span>
      {children}
    </p>
  );
}

export function JudulHalaman({ judul, sub, aksi }) {
  return (
    <div className="ks-judul-halaman">
      <div>
        <h1 className="h3 mb-1">{judul}</h1>
        {sub && <p className="text-secondary mb-0">{sub}</p>}
      </div>
      {aksi && <div className="ks-judul-aksi">{aksi}</div>}
    </div>
  );
}
