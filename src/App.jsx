import { BrowserRouter, Routes, Route, Link } from 'react-router';
import Layout from './components/Layout.jsx';
import Beranda from './pages/Beranda.jsx';
import AnalisisAmi from './pages/AnalisisAmi.jsx';
import Laporan from './pages/Laporan.jsx';
import NaskahRingkas from './pages/NaskahRingkas.jsx';

function BukanModulC({ judul, pemilik }) {
  return (
    <div className="card ks-card">
      <div className="card-body">
        <h1 className="h4">{judul}</h1>
        <p className="text-secondary mb-0">
          Menu ini {pemilik}. Prototipe Modul C hanya menampilkannya agar struktur menu akhir (T0-1) bisa diuji. Kembali ke <Link to="/">Beranda</Link>.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Beranda />} />
          <Route path="analisis" element={<AnalisisAmi />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="naskah" element={<BukanModulC judul="Naskah" pemilik="dikerjakan Modul A (Mitra dan Naskah) dan Modul B (Unggah dan Validasi)" />} />
          <Route path="naskah/:id" element={<NaskahRingkas />} />
          <Route path="struktur" element={<BukanModulC judul="Struktur & Panduan" pemilik="belum dibagi ke modul mana pun, perlu disepakati tim" />} />
          <Route path="*" element={<BukanModulC judul="Halaman tidak ditemukan" pemilik="tidak tersedia" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
