import { useSelector } from 'react-redux';

// Palet kategorikal tervalidasi (validator dataviz: lolos CVD & normal-vision, mode terang dan gelap).
// Slot dipakai berurutan dan tidak pernah diputar ulang. Teks memakai token tinta, bukan warna seri.
const TERANG = {
  seri: ['#2a78d6', '#eb6834', '#1baf7a'],
  permukaan: '#fcfcfb',
  tinta: '#0b0b0b',
  tinta2: '#52514e',
  redup: '#898781',
  grid: '#e1e0d9',
  sumbu: '#c3c2b7',
  sorot: 'rgba(11,11,11,0.05)',
  batas: 'rgba(11,11,11,0.10)',
};

const GELAP = {
  seri: ['#3987e5', '#d95926', '#199e70'],
  permukaan: '#1a1a19',
  tinta: '#f0efec',
  tinta2: '#c3c2b7',
  redup: '#898781',
  grid: '#2c2c2a',
  sumbu: '#383835',
  sorot: 'rgba(255,255,255,0.06)',
  batas: 'rgba(255,255,255,0.10)',
};

export function usePaletGrafik() {
  const tema = useSelector((s) => s.tampilan.tema);
  return tema === 'dark' ? GELAP : TERANG;
}
