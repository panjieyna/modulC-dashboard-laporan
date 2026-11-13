import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { gantiTema, aturPeran, aturFakultas, aturProdiPengguna } from '../store.js';
import { PERAN } from '../config/akses.js';
import { FAKULTAS, PRODI, namaProdi } from '../data/master.js';
import { useKsdas } from '../hooks/useKsdas.js';

// FR-AUTH-05: tidak boleh ada pengalih peran di produksi. Simulasi hanya muncul saat
// `npm run dev`, atau bila build demo diberi VITE_SIMULASI_PERAN=true.
const SIMULASI_PERAN = import.meta.env.DEV || import.meta.env.VITE_SIMULASI_PERAN === 'true';

const MENU = [
  { ke: '/', label: 'Beranda', modul: 'C', akhir: true },
  { ke: '/analisis', label: 'Analisis SPMI & AMI', modul: 'C', izin: 'lihatAmi' },
  { ke: '/laporan', label: 'Laporan & Ekspor', modul: 'C' },
  { ke: '/naskah', label: 'Naskah', modul: 'A' },
  { ke: '/struktur', label: 'Struktur & Panduan', modul: '–' },
];

function SimulasiPeran() {
  const dispatch = useDispatch();
  const sesi = useSelector((s) => s.sesi);
  return (
    <div className="ks-simulasi" role="group" aria-label="Simulasi peran (hanya prototipe)">
      <span className="ks-simulasi-label">Simulasi peran</span>
      <select className="form-select form-select-sm" value={sesi.peran} onChange={(e) => dispatch(aturPeran(e.target.value))} aria-label="Peran">
        {Object.entries(PERAN).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
      {sesi.peran === 'dekan' && (
        <select className="form-select form-select-sm" value={sesi.fakultas} onChange={(e) => dispatch(aturFakultas(e.target.value))} aria-label="Fakultas">
          {FAKULTAS.map((f) => (
            <option key={f.kode} value={f.kode}>
              {f.kode}
            </option>
          ))}
        </select>
      )}
      {(sesi.peran === 'kaprodi' || sesi.peran === 'dosen') && (
        <select className="form-select form-select-sm" value={sesi.prodi} onChange={(e) => dispatch(aturProdiPengguna(e.target.value))} aria-label="Prodi">
          {PRODI.map((p) => (
            <option key={p.kode} value={p.kode}>
              {p.nama}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default function Layout() {
  const dispatch = useDispatch();
  const tema = useSelector((s) => s.tampilan.tema);
  const { pengguna, akses } = useKsdas();

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema);
    try {
      localStorage.setItem('ksdas-tema', tema);
    } catch {
      /* storage diblokir: tema tetap berlaku untuk sesi ini */
    }
  }, [tema]);

  const konteks =
    pengguna.peran === 'dekan' ? pengguna.fakultas : pengguna.peran === 'kaprodi' || pengguna.peran === 'dosen' ? namaProdi(pengguna.prodi) : null;

  return (
    <div className="ks-app">
      <aside className="ks-sidebar">
        <div className="ks-brand">
          <span className="ks-logo" aria-hidden="true">
            Del
          </span>
          <div>
            <strong>KSDAS</strong>
            <small>Institut Teknologi Del</small>
          </div>
        </div>
        <nav aria-label="Menu utama">
          <ul className="ks-menu">
            {MENU.filter((m) => !m.izin || akses[m.izin]).map((m) => (
              <li key={m.ke}>
                <NavLink to={m.ke} end={m.akhir} className={({ isActive }) => `ks-menu-link ${isActive ? 'aktif' : ''} ${m.modul !== 'C' ? 'luar' : ''}`}>
                  <span>{m.label}</span>
                  {m.modul !== 'C' && <span className="ks-menu-tag">{m.modul === '–' ? 'luar C' : `Modul ${m.modul}`}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <p className="ks-sidebar-catatan">Prototipe uji coba Modul C. Logo dan warna resmi IT Del menyusul (US-5.5).</p>
      </aside>

      <div className="ks-utama">
        <header className="ks-topbar">
          <span className="ks-banner" role="note">
            Data contoh, bukan data klien
          </span>
          <div className="ks-topbar-kanan">
            {SIMULASI_PERAN && <SimulasiPeran />}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => dispatch(gantiTema())}
              aria-label={tema === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            >
              {tema === 'dark' ? '☀ Terang' : '☾ Gelap'}
            </button>
            <span className="ks-pengguna">
              {PERAN[pengguna.peran].label}
              {konteks && <small> · {konteks}</small>}
            </span>
          </div>
        </header>
        <main className="ks-konten" id="konten">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
