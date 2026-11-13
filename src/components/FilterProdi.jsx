import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { aturFilterProdi } from '../store.js';
import { FAKULTAS, PRODI, namaProdi } from '../data/master.js';
import { useKsdas } from '../hooks/useKsdas.js';

/**
 * FR-HOME-03 / US-1.1: filter prodi multi-select (checkbox), langsung memperbarui
 * semua angka di halaman. Untuk Kaprodi/Dosen, filter terisi otomatis dan terkunci.
 */
export default function FilterProdi() {
  const dispatch = useDispatch();
  const { prodiCakupan, prodiAktif, pakaiFilter } = useKsdas();
  const terpilih = useSelector((s) => s.filter.prodi);
  const [buka, setBuka] = useState(false);

  if (prodiCakupan.length <= 1) {
    return (
      <div className="ks-filter-baris">
        <span className="ks-filter-label">Prodi</span>
        <span className="ks-chip">{prodiCakupan[0] ? namaProdi(prodiCakupan[0]) : 'Belum ditetapkan'}</span>
        <span className="small text-secondary">Terisi otomatis sesuai peran Anda.</span>
      </div>
    );
  }

  const tercentang = (kode) => !pakaiFilter || prodiAktif.includes(kode);
  const simpan = (daftar) => dispatch(aturFilterProdi(daftar.length === prodiCakupan.length ? [] : daftar));
  const toggle = (kode) => {
    const dasar = pakaiFilter ? prodiAktif : prodiCakupan;
    const baru = dasar.includes(kode) ? dasar.filter((p) => p !== kode) : [...dasar, kode];
    if (baru.length) simpan(baru);
  };
  const hanyaFakultas = (fak) => simpan(PRODI.filter((p) => p.fakultas === fak && prodiCakupan.includes(p.kode)).map((p) => p.kode));
  const fakultasTampil = FAKULTAS.filter((f) => PRODI.some((p) => p.fakultas === f.kode && prodiCakupan.includes(p.kode)));
  const ringkasan = pakaiFilter
    ? prodiAktif.length <= 2
      ? prodiAktif.map(namaProdi).join(', ')
      : `${prodiAktif.length} dari ${prodiCakupan.length} prodi`
    : `Semua prodi (${prodiCakupan.length})`;

  return (
    <div className="ks-filter">
      <div className="ks-filter-baris">
        <span className="ks-filter-label" id="label-filter-prodi">
          Prodi
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary ks-filter-tombol"
          aria-expanded={buka}
          aria-controls="panel-filter-prodi"
          onClick={() => setBuka((b) => !b)}
        >
          {ringkasan} <span aria-hidden="true">{buka ? '▴' : '▾'}</span>
        </button>
        {pakaiFilter && (
          <button type="button" className="btn btn-sm btn-link" onClick={() => dispatch(aturFilterProdi([]))}>
            Tampilkan semua
          </button>
        )}
      </div>
      {buka && (
        <div id="panel-filter-prodi" className="ks-filter-panel" role="group" aria-labelledby="label-filter-prodi">
          {fakultasTampil.map((f) => (
            <fieldset key={f.kode} className="ks-filter-grup">
              <legend>
                {f.kode}
                {fakultasTampil.length > 1 && (
                  <button type="button" className="btn btn-link btn-sm p-0 ms-2" onClick={() => hanyaFakultas(f.kode)}>
                    hanya fakultas ini
                  </button>
                )}
              </legend>
              {PRODI.filter((p) => p.fakultas === f.kode && prodiCakupan.includes(p.kode)).map((p) => (
                <div className="form-check" key={p.kode}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`prodi-${p.kode}`}
                    checked={tercentang(p.kode)}
                    disabled={tercentang(p.kode) && pakaiFilter && prodiAktif.length === 1}
                    onChange={() => toggle(p.kode)}
                  />
                  <label className="form-check-label" htmlFor={`prodi-${p.kode}`}>
                    {p.nama}
                  </label>
                </div>
              ))}
            </fieldset>
          ))}
        </div>
      )}
      {/* sinkron dengan state global agar filter bertahan antar halaman (FR-SRC-04) */}
      <span className="visually-hidden" aria-live="polite">
        {terpilih.length ? `${terpilih.length} prodi dipilih` : 'Semua prodi'}
      </span>
    </div>
  );
}
