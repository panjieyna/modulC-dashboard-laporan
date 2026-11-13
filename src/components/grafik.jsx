import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { usePaletGrafik } from '../hooks/usePaletGrafik.js';
import { TabelSederhana } from './ui.jsx';
import { formatAngka } from '../lib/format.js';

/** Kartu grafik dengan sakelar Grafik/Tabel: setiap grafik punya padanan tabel. */
export function KartuGrafik({ judul, keterangan, kolom, baris, children }) {
  const [tabel, setTabel] = useState(false);
  return (
    <section className="card ks-card">
      <div className="card-body">
        <div className="ks-kepala-kartu">
          <div>
            <h2 className="h6 mb-1">{judul}</h2>
            {keterangan && <p className="small text-secondary mb-0">{keterangan}</p>}
          </div>
          <div className="btn-group btn-group-sm" role="group" aria-label={`Tampilan ${judul}`}>
            <button type="button" className={`btn btn-outline-secondary ${!tabel ? 'active' : ''}`} aria-pressed={!tabel} onClick={() => setTabel(false)}>
              Grafik
            </button>
            <button type="button" className={`btn btn-outline-secondary ${tabel ? 'active' : ''}`} aria-pressed={tabel} onClick={() => setTabel(true)}>
              Tabel
            </button>
          </div>
        </div>
        <div className="mt-3">{tabel ? <TabelSederhana kolom={kolom} baris={baris} /> : children}</div>
      </div>
    </section>
  );
}

function gayaTooltip(p) {
  return {
    contentStyle: {
      background: p.permukaan,
      border: `1px solid ${p.batas}`,
      borderRadius: 8,
      color: p.tinta,
      fontSize: 13,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    },
    labelStyle: { color: p.tinta, fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: p.tinta2, padding: 0 },
  };
}

const sumbu = (p) => ({
  tick: { fill: p.redup, fontSize: 12 },
  axisLine: { stroke: p.sumbu },
  tickLine: false,
});

/** Batang horizontal satu seri (satu warna, slot 1). Judul kartu menamai seri, jadi tanpa legenda. */
export function GrafikBatang({ data, namaSeri, lebarLabel = 180 }) {
  const p = usePaletGrafik();
  if (!data.length) return <p className="ks-kosong">Belum ada data.</p>;
  const tinggi = data.length * 34 + 48; // termasuk pita sumbu-x
  return (
    <div style={{ width: '100%', height: tinggi }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke={p.grid} />
          <XAxis type="number" allowDecimals={false} {...sumbu(p)} />
          <YAxis type="category" dataKey="label" width={lebarLabel} {...sumbu(p)} tick={{ fill: p.tinta2, fontSize: 12 }} />
          <Tooltip cursor={{ fill: p.sorot }} formatter={(v) => [formatAngka(v), namaSeri]} {...gayaTooltip(p)} />
          <Bar dataKey="nilai" name={namaSeri} fill={p.seri[0]} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Garis tren dua seri pada satu sumbu (keduanya jumlah naskah). Legenda + label di ujung garis. */
export function GrafikTren({ data, seri }) {
  const p = usePaletGrafik();
  if (!data.length) return <p className="ks-kosong">Belum ada data.</p>;
  const labelUjung = (nama) =>
    function Label({ x, y, index }) {
      if (index !== data.length - 1) return null;
      return (
        <text x={x + 10} y={y} dy={4} fill={p.tinta2} fontSize={12}>
          {nama}
        </text>
      );
    };
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 92, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} stroke={p.grid} />
          <XAxis dataKey="tahun" {...sumbu(p)} />
          <YAxis allowDecimals={false} width={40} {...sumbu(p)} />
          <Tooltip cursor={{ stroke: p.sumbu, strokeWidth: 1 }} formatter={(v, n) => [formatAngka(v), n]} {...gayaTooltip(p)} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 13, color: p.tinta2 }} />
          {seri.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.nama}
              stroke={p.seri[i]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: p.permukaan, fill: p.seri[i] }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: p.permukaan }}
              label={labelUjung(s.nama)}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Kolom per tahun untuk satu indikator; tahun tanpa data dibiarkan kosong (bukan 0). */
export function GrafikKolomTahun({ data, namaSeri, target, satuan }) {
  const p = usePaletGrafik();
  const fmt = (v) => (v === null || v === undefined ? '-' : `${formatAngka(v)}${satuan === 'persen' ? '%' : ''}`);
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 84, bottom: 4, left: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke={p.grid} />
          <XAxis dataKey="tahun" {...sumbu(p)} />
          <YAxis width={44} {...sumbu(p)} tickFormatter={(v) => `${formatAngka(v)}${satuan === 'persen' ? '%' : ''}`} />
          <Tooltip cursor={{ fill: p.sorot }} formatter={(v) => [fmt(v), namaSeri]} {...gayaTooltip(p)} />
          {target !== undefined && (
            <ReferenceLine
              y={target}
              stroke={p.tinta2}
              strokeWidth={1}
              label={{ value: `Target ${fmt(target)}`, position: 'right', fill: p.tinta2, fontSize: 12 }}
            />
          )}
          <Bar dataKey="nilai" name={namaSeri} fill={p.seri[0]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
