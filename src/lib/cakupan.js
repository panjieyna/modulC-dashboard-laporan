import { KEBIJAKAN_AKSES } from '../config/akses.js';
import { PRODI } from '../data/master.js';
import { isLengkap } from './status.js';

export const kebijakan = (peran) => KEBIJAKAN_AKSES[peran] ?? KEBIJAKAN_AKSES.dosen;

/** Kode prodi yang boleh dilihat pengguna. */
export function prodiDalamCakupan(pengguna) {
  const k = kebijakan(pengguna.peran);
  if (k.cakupan === 'semua') return PRODI.map((p) => p.kode);
  if (k.cakupan === 'fakultas') return PRODI.filter((p) => p.fakultas === pengguna.fakultas).map((p) => p.kode);
  return pengguna.prodi ? [pengguna.prodi] : [];
}

/** Naskah yang boleh dilihat pengguna (sebelum filter prodi di layar). */
export function naskahDalamCakupan(daftar, pengguna) {
  const k = kebijakan(pengguna.peran);
  const bolehDraf = (n) => k.lihatDraf || isLengkap(n);
  if (k.cakupan === 'semua') return daftar.filter(bolehDraf);
  const izin = new Set(prodiDalamCakupan(pengguna));
  return daftar.filter((n) => bolehDraf(n) && (n.prodi ?? []).some((p) => izin.has(p)));
}

/** Filter prodi di layar: naskah ikut bila melibatkan salah satu prodi terpilih. */
export function saringProdi(daftar, prodiTerpilih) {
  const pilih = new Set(prodiTerpilih);
  return daftar.filter((n) => (n.prodi ?? []).some((p) => pilih.has(p)));
}
