import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock3, Layers3 } from "lucide-react";
import "./styles.css";

type Family = "FR" | "PBS";

type Prediction = {
  series: string;
  family: Family;
  maturity: string;
  tenor: string;
  tenorYears: number;
  coupon: number;
  lower: number;
  point: number;
  upper: number;
  previous: number;
};

const predictions: Prediction[] = [
  { series: "PBS030", family: "PBS", maturity: "15 Jul 2028", tenor: "1,9 tahun", tenorYears: 1.9, coupon: 5.875, lower: 6.412, point: 6.468, upper: 6.527, previous: 6.491 },
  { series: "FR0103", family: "FR", maturity: "15 Jul 2035", tenor: "8,9 tahun", tenorYears: 8.9, coupon: 6.75, lower: 6.812, point: 6.875, upper: 6.941, previous: 6.902 },
  { series: "FR0106", family: "FR", maturity: "15 Agu 2040", tenor: "14,0 tahun", tenorYears: 14, coupon: 7.125, lower: 6.903, point: 6.974, upper: 7.048, previous: 6.951 },
  { series: "FR0107", family: "FR", maturity: "15 Agu 2045", tenor: "19,0 tahun", tenorYears: 19, coupon: 7.125, lower: 6.994, point: 7.071, upper: 7.151, previous: 7.048 },
  { series: "PBS038", family: "PBS", maturity: "15 Des 2049", tenor: "23,3 tahun", tenorYears: 23.3, coupon: 6.875, lower: 7.018, point: 7.098, upper: 7.181, previous: 7.077 },
  { series: "FR0102", family: "FR", maturity: "15 Jul 2054", tenor: "27,9 tahun", tenorYears: 27.9, coupon: 6.875, lower: 7.061, point: 7.145, upper: 7.232, previous: 7.126 },
];

function BondDoodle() {
  return (
    <svg className="bond-doodle" viewBox="0 0 360 190" aria-hidden="true">
      <g className="doodle-dots">
        {Array.from({ length: 48 }, (_, index) => <circle key={index} cx={230 + (index % 8) * 13} cy={22 + Math.floor(index / 8) * 13} r="2.2" />)}
      </g>
      <g className="certificate">
        <path d="M28 42 Q31 34 41 36 L248 50 Q257 51 256 61 L245 151 Q244 160 235 159 L28 145 Q19 143 21 134 Z" />
        <path d="M43 56 L233 69 L225 140 L36 127 Z" />
        <path d="M62 76 L132 81 M61 92 L116 96 M61 108 L104 111" />
        <circle cx="190" cy="105" r="24" />
        <text x="190" y="112" textAnchor="middle">SBN</text>
      </g>
      <g className="growth-arrow">
        <path d="M112 161 C160 155 192 145 219 124 C245 104 268 75 310 55" />
        <path d="M291 53 L312 53 L309 73" />
      </g>
    </svg>
  );
}

function YieldCurveChart({ selectedSeries, onSelect }: { selectedSeries: string; onSelect: (series: string) => void }) {
  const width = 900;
  const height = 410;
  const left = 72;
  const right = 28;
  const top = 46;
  const bottom = 62;
  const yMin = 6.3;
  const yMax = 7.3;
  const x = (tenor: number) => left + (tenor / 30) * (width - left - right);
  const y = (value: number) => top + ((yMax - value) / (yMax - yMin)) * (height - top - bottom);
  const yTicks = [6.3, 6.5, 6.7, 6.9, 7.1, 7.3];
  const xTicks = [0, 5, 10, 15, 20, 25, 30];
  const curve = predictions.map((item) => `${x(item.tenorYears)},${y(item.point)}`).join(" ");

  return (
    <svg className="yield-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Kurva prediksi yield dan rentang 95 persen">
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
          <text x={left - 13} y={y(tick) + 4} textAnchor="end" className="axis-text">{tick.toFixed(1)}%</text>
        </g>
      ))}
      {xTicks.map((tick) => (
        <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={top} y2={height - bottom} className="chart-grid vertical" />
          <text x={x(tick)} y={height - 29} textAnchor="middle" className="axis-text">{tick}Y</text>
        </g>
      ))}
      <text x="17" y="34" className="axis-title">YIELD</text>
      <text x={width - right} y={height - 8} textAnchor="end" className="axis-title">TENOR</text>
      <polyline points={curve} className="curve-line" />

      {predictions.map((item) => {
        const px = x(item.tenorYears);
        const selected = selectedSeries === item.series;
        return (
          <g className={`chart-security ${item.family.toLowerCase()} ${selected ? "selected" : ""}`} key={item.series} onClick={() => onSelect(item.series)} role="button" tabIndex={0}>
            <line x1={px} x2={px} y1={y(item.upper)} y2={y(item.lower)} className="interval-line" />
            <line x1={px - 8} x2={px + 8} y1={y(item.upper)} y2={y(item.upper)} className="interval-cap" />
            <line x1={px - 8} x2={px + 8} y1={y(item.lower)} y2={y(item.lower)} className="interval-cap" />
            <circle cx={px} cy={y(item.point)} r={selected ? 9 : 7} className="yield-point" />
            <circle cx={px} cy={y(item.point)} r="3" className="yield-core" />
            <text x={px} y={y(item.upper) - 13} textAnchor="middle" className="security-label">{item.series}</text>
          </g>
        );
      })}
    </svg>
  );
}

function App() {
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];
  const change = selected.point - selected.previous;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><strong>GAYA</strong><span>Dashboard</span></div>
        <p>Government Auction Yield Analytics</p>
        <div className="updated"><i /> Data contoh · 8 Agu 2026</div>
      </header>

      <main>
        <section className="intro">
          <div className="intro-copy">
            <span className="eyebrow">LELANG OBLIGASI PEMERINTAH</span>
            <h1>Dashboard prediksi<br />yield lelang</h1>
            <p>Estimasi Weighted Average Yield untuk seri FR dan PBS pada lelang berikutnya.</p>
          </div>
          <BondDoodle />
          <div className="auction-note">
            <small>LELANG BERIKUTNYA</small>
            <b>11 AGU 2026</b>
            <span>Selasa · 09:00–11:00 WIB</span>
          </div>
        </section>

        <section className="summary-grid">
          <article><CalendarDays /><div><span>Tanggal lelang</span><b>11 Agustus 2026</b></div></article>
          <article><Clock3 /><div><span>Jendela penawaran</span><b>09:00–11:00 WIB</b></div></article>
          <article><Layers3 /><div><span>Seri ditawarkan</span><b>6 seri · FR &amp; PBS</b></div></article>
        </section>

        <section className="dashboard-grid">
          <article className="chart-card">
            <div className="panel-head">
              <div><span>LELANG 11 AGUSTUS 2026</span><h2>Kurva prediksi yield</h2></div>
              <div className="chart-legend"><span><i className="fr-key" />FR</span><span><i className="pbs-key" />PBS</span><span><i className="interval-key" />Rentang 95%</span></div>
            </div>
            <YieldCurveChart selectedSeries={selected.series} onSelect={setSelectedSeries} />
            <div className="chart-note">Rentang 95% ditampilkan sebagai garis vertikal pada setiap seri.</div>
          </article>

          <aside className="series-panel">
            <div className="panel-stripe">SERI TERPILIH</div>
            <div className="series-title"><span>{selected.family}</span><h2>{selected.series}</h2><small>{selected.tenor} · {selected.maturity}</small></div>
            <div className="primary-quote"><span>Prediksi WAY</span><b>{selected.point.toFixed(3)}%</b></div>
            <div className="range-values">
              <div><span>Batas bawah</span><b>{selected.lower.toFixed(3)}%</b></div>
              <div><span>Batas atas</span><b>{selected.upper.toFixed(3)}%</b></div>
            </div>
            <div className="coupon"><span>Kupon</span><b>{selected.coupon.toFixed(3)}%</b></div>
            <div className={`movement ${change >= 0 ? "up" : "down"}`}>{change >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}<b>{Math.abs(change * 100).toFixed(1)} bp</b><span>vs. lelang sebelumnya</span></div>
            <p className="private-note">Model dihitung terpisah untuk setiap kode seri.</p>
          </aside>
        </section>

        <section className="table-panel">
          <div className="table-title"><h2>Ringkasan prediksi</h2><span>Klik baris untuk memilih seri</span></div>
          <div className="table-head"><span>Seri</span><span>Tenor</span><span>Jatuh tempo</span><span>Kupon</span><span>Prediksi WAY</span><span>Rentang 95%</span><span>Perubahan</span></div>
          {predictions.map((item) => {
            const delta = item.point - item.previous;
            return (
              <button className={`table-row ${selected.series === item.series ? "selected" : ""}`} onClick={() => setSelectedSeries(item.series)} key={item.series}>
                <span className="series-code"><i className={item.family.toLowerCase()} />{item.series}</span>
                <span>{item.tenor}</span><span>{item.maturity}</span><span className="number">{item.coupon.toFixed(3)}%</span><b className="number">{item.point.toFixed(3)}%</b><span className="number">{item.lower.toFixed(3)}–{item.upper.toFixed(3)}%</span>
                <span className={`delta ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta * 100).toFixed(1)} bp</span>
              </button>
            );
          })}
        </section>
      </main>

      <footer><span>GAYA · Government Auction Yield Analytics</span><span>Estimasi statistik, bukan rekomendasi investasi.</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
