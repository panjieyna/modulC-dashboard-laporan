import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ambilData } from '../data/sumberData.js';
import { kebijakan, naskahDalamCakupan, prodiDalamCakupan, saringProdi } from '../lib/cakupan.js';

/**
 * Data yang sudah dibatasi hak akses pengguna lalu disaring filter prodi.
 * Semua halaman Modul C memakai hook ini, sehingga kartu, grafik, analisis, dan
 * ekspor menghitung dari himpunan data yang sama (NFR-08).
 */
export function useKsdas() {
  const pengguna = useSelector((s) => s.sesi);
  const filterProdi = useSelector((s) => s.filter.prodi);

  return useMemo(() => {
    const data = ambilData();
    const akses = kebijakan(pengguna.peran);
    const prodiCakupan = prodiDalamCakupan(pengguna);
    const dalamCakupan = naskahDalamCakupan(data.naskah, pengguna);
    const terpilihSah = filterProdi.filter((p) => prodiCakupan.includes(p));
    const pakaiFilter = terpilihSah.length > 0 && terpilihSah.length < prodiCakupan.length;
    const prodiAktif = pakaiFilter ? terpilihSah : prodiCakupan;
    const tersaring = pakaiFilter ? saringProdi(dalamCakupan, prodiAktif) : dalamCakupan;
    return { ...data, pengguna, akses, prodiCakupan, prodiAktif, pakaiFilter, dalamCakupan, tersaring };
  }, [pengguna, filterProdi]);
}
