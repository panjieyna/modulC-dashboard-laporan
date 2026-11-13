import { configureStore, createSlice } from '@reduxjs/toolkit';
import { targetBawaan } from './config/ami.js';
import { fakultasDariProdi } from './data/master.js';

const temaAwal = () => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');

const sesi = createSlice({
  name: 'sesi',
  // Pengguna simulasi. Di sistem nyata diisi dari token login (FR-AUTH-01).
  initialState: { peran: 'admin', fakultas: 'FITE', prodi: 'S1IF' },
  reducers: {
    aturPeran(s, a) {
      s.peran = a.payload;
    },
    aturFakultas(s, a) {
      s.fakultas = a.payload;
    },
    aturProdiPengguna(s, a) {
      s.prodi = a.payload;
      s.fakultas = fakultasDariProdi(a.payload) ?? s.fakultas;
    },
  },
});

const tampilan = createSlice({
  name: 'tampilan',
  initialState: { tema: temaAwal() },
  reducers: {
    gantiTema(s) {
      s.tema = s.tema === 'dark' ? 'light' : 'dark';
    },
  },
});

const filterAwal = {
  prodi: [], // kosong = semua prodi dalam cakupan
  tahunAmi: new Date().getFullYear(),
  hanyaTerverifikasi: true,
  laporan: { jenis: [], status: [], preset: 'semua', dari: '', sampai: '' },
};

// Filter disimpan di store agar tetap ada saat pindah halaman (FR-SRC-04).
const filter = createSlice({
  name: 'filter',
  initialState: filterAwal,
  reducers: {
    aturFilterProdi(s, a) {
      s.prodi = a.payload;
    },
    aturTahunAmi(s, a) {
      s.tahunAmi = a.payload;
    },
    aturHanyaTerverifikasi(s, a) {
      s.hanyaTerverifikasi = a.payload;
    },
    aturFilterLaporan(s, a) {
      s.laporan = { ...s.laporan, ...a.payload };
    },
  },
  extraReducers: (b) => {
    // Ganti pengguna = filter prodi kembali ke cakupan barunya.
    const reset = (s) => {
      s.prodi = [];
      s.laporan = filterAwal.laporan;
    };
    b.addCase(sesi.actions.aturPeran, reset)
      .addCase(sesi.actions.aturFakultas, reset)
      .addCase(sesi.actions.aturProdiPengguna, reset);
  },
});

const pengaturanAmi = createSlice({
  name: 'pengaturanAmi',
  initialState: { target: targetBawaan() },
  reducers: {
    aturTarget(s, a) {
      s.target = { ...s.target, ...a.payload };
    },
    resetTarget(s) {
      s.target = targetBawaan();
    },
  },
});

// Jejak ekspor di sesi ini. Audit log permanen tetap tugas server (US-2.13, FR-COM-08).
const riwayatEkspor = createSlice({
  name: 'riwayatEkspor',
  initialState: [],
  reducers: {
    catatEkspor(s, a) {
      s.unshift(a.payload);
    },
  },
});

export const { aturPeran, aturFakultas, aturProdiPengguna } = sesi.actions;
export const { gantiTema } = tampilan.actions;
export const { aturFilterProdi, aturTahunAmi, aturHanyaTerverifikasi, aturFilterLaporan } = filter.actions;
export const { aturTarget, resetTarget } = pengaturanAmi.actions;
export const { catatEkspor } = riwayatEkspor.actions;

export const store = configureStore({
  reducer: {
    sesi: sesi.reducer,
    tampilan: tampilan.reducer,
    filter: filter.reducer,
    pengaturanAmi: pengaturanAmi.reducer,
    riwayatEkspor: riwayatEkspor.reducer,
  },
});
