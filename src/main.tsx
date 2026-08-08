import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import "./styles.css";

type Prediction = {
  series: string;
  maturity: string;
  tenor: string;
  coupon: number;
  lower: number;
  point: number;
  upper: number;
  previous: number;
  forecastHistory: number[];
  actualHistory: number[];
};

const predictions: Prediction[] = [
  { series: "FR0103", maturity: "15 Jul 2035", tenor: "8,9 tahun", coupon: 6.75, lower: 6.812, point: 6.875, upper: 6.941, previous: 6.902, forecastHistory: [6.96, 6.92, 6.94, 6.89, 6.91, 6.87, 6.875], actualHistory: [6.98, 6.9, 6.97, 6.91, 6.89, 6.902] },
  { series: "FR0106", maturity: "15 Agu 2040", tenor: "14,0 tahun", coupon: 7.125, lower: 6.903, point: 6.974, upper: 7.048, previous: 6.951, forecastHistory: [6.88, 6.91, 6.9, 6.94, 6.92, 6.96, 6.974], actualHistory: [6.9, 6.93, 6.88, 6.95, 6.94, 6.951] },
  { series: "FR0107", maturity: "15 Agu 2045", tenor: "19,0 tahun", coupon: 7.125, lower: 6.994, point: 7.071, upper: 7.151, previous: 7.048, forecastHistory: [6.99, 7.01, 7.03, 7.0, 7.04, 7.06, 7.071], actualHistory: [7.01, 7.0, 7.05, 7.02, 7.06, 7.048] },
  { series: "FR0102", maturity: "15 Jul 2054", tenor: "27,9 tahun", coupon: 6.875, lower: 7.061, point: 7.145, upper: 7.232, previous: 7.126, forecastHistory: [7.08, 7.09, 7.12, 7.1, 7.13, 7.14, 7.145], actualHistory: [7.1, 7.08, 7.14, 7.11, 7.15, 7.126] },
  { series: "PBS030", maturity: "15 Jul 2028", tenor: "1,9 tahun", coupon: 5.875, lower: 6.412, point: 6.468, upper: 6.527, previous: 6.491, forecastHistory: [6.55, 6.52, 6.53, 6.5, 6.49, 6.48, 6.468], actualHistory: [6.57, 6.5, 6.54, 6.49, 6.5, 6.491] },
  { series: "PBS038", maturity: "15 Des 2049", tenor: "23,3 tahun", coupon: 6.875, lower: 7.018, point: 7.098, upper: 7.181, previous: 7.077, forecastHistory: [7.03, 7.01, 7.05, 7.07, 7.06, 7.09, 7.098], actualHistory: [7.05, 7.0, 7.07, 7.05, 7.1, 7.077] },
];

function RangeBar({ item }: { item: Prediction }) {
  const domainMin = 6.3;
  const domainMax = 7.35;
  const pct = (value: number) => ((value - domainMin) / (domainMax - domainMin)) * 100;
  return (
    <div className="range">
      <span className="range-bound">{item.lower.toFixed(3)}</span>
      <div className="range-track">
        <i style={{ left: `${pct(item.lower)}%`, width: `${pct(item.upper) - pct(item.lower)}%` }} />
        <b style={{ left: `${pct(item.point)}%` }} />
      </div>
      <span className="range-bound">{item.upper.toFixed(3)}</span>
    </div>
  );
}

function SeriesChart({ item }: { item: Prediction }) {
  const allValues = [...item.forecastHistory, ...item.actualHistory];
  const min = Math.floor((Math.min(...allValues) - 0.04) * 20) / 20;
  const max = Math.ceil((Math.max(...allValues) + 0.04) * 20) / 20;
  const x = (index: number) => 64 + index * 94;
  const y = (value: number) => 242 - ((value - min) / (max - min)) * 190;
  const line = (values: number[]) => values.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  const ticks = Array.from({ length: 5 }, (_, index) => max - ((max - min) / 4) * index);

  return (
    <svg className="series-chart" viewBox="0 0 720 280" role="img" aria-label={`Riwayat prediksi dan hasil ${item.series}`}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1="58" x2="702" y1={y(tick)} y2={y(tick)} className="grid-line" />
          <text x="48" y={y(tick) + 4} textAnchor="end" className="axis-label">{tick.toFixed(2)}%</text>
        </g>
      ))}
      {item.forecastHistory.map((_, index) => (
        <line key={index} x1={x(index)} x2={x(index)} y1="42" y2="242" className="grid-line vertical" />
      ))}
      <polyline points={line(item.forecastHistory)} className="forecast-line" />
      <polyline points={line(item.actualHistory)} className="actual-line" />
      {item.forecastHistory.map((value, index) => <circle key={`f-${index}`} cx={x(index)} cy={y(value)} r="4" className="forecast-dot" />)}
      {item.actualHistory.map((value, index) => <circle key={`a-${index}`} cx={x(index)} cy={y(value)} r="3.5" className="actual-dot" />)}
      {item.forecastHistory.map((_, index) => <text key={`x-${index}`} x={x(index)} y="266" textAnchor="middle" className="axis-label">{index === 6 ? "Berikutnya" : `L-${6 - index}`}</text>)}
    </svg>
  );
}

function App() {
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];
  const change = selected.point - selected.previous;

  return (
    <div className="site">
      <header>
        <strong>Prediksi Lelang SUN</strong>
        <span>Data contoh</span>
        <time>Terakhir diperbarui 8 Agu 2026</time>
      </header>

      <main>
        <section className="hero">
          <img src="/market-courier-splash.webp" alt="Ilustrasi komik bertema pasar obligasi" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p>Lelang berikutnya · Selasa, 11 Agustus 2026</p>
            <h1>Prediksi yield<br />lelang obligasi</h1>
            <span>Rentang estimasi Weighted Average Yield untuk seri FR dan PBS.</span>
          </div>
          <div className="auction-time"><small>Jendela penawaran</small><b>09:00–11:00 WIB</b></div>
        </section>

        <section className="prediction-section">
          <div className="section-heading">
            <div><h2>Rentang prediksi</h2><p>Klik seri untuk melihat riwayatnya.</p></div>
            <div className="coverage"><span>CAKUPAN</span><b>FR · PBS</b></div>
          </div>

          <div className="prediction-table">
            <div className="table-head">
              <span>Seri</span><span>Jatuh tempo</span><span>Kupon</span><span>Rentang 95%</span><span>Prediksi WAY</span><span>vs. lelang lalu</span>
            </div>
            {predictions.map((item) => {
              const delta = item.point - item.previous;
              return (
                <button className={`table-row ${selected.series === item.series ? "selected" : ""}`} onClick={() => setSelectedSeries(item.series)} key={item.series}>
                  <span className="series"><b>{item.series}</b><small>{item.tenor}</small></span>
                  <span className="maturity">{item.maturity}</span>
                  <span className="number">{item.coupon.toFixed(3)}%</span>
                  <RangeBar item={item} />
                  <span className="prediction">{item.point.toFixed(3)}%</span>
                  <span className={`change ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}{Math.abs(delta * 100).toFixed(1)} bp</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="chart-section" id="chart">
          <div className="chart-summary">
            <span>Seri terpilih</span>
            <h2>{selected.series}</h2>
            <div className="quote"><small>Prediksi WAY</small><b>{selected.point.toFixed(3)}%</b></div>
            <div className="interval"><span>{selected.lower.toFixed(3)}%</span><i /><span>{selected.upper.toFixed(3)}%</span></div>
            <p className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : "−"}{Math.abs(change * 100).toFixed(1)} bp dibanding lelang sebelumnya</p>
          </div>
          <div className="chart-area">
            <div className="chart-header">
              <div><h3>Prediksi dan hasil lelang</h3><span>6 lelang terakhir + prediksi berikutnya</span></div>
              <div className="legend"><span><i className="forecast-key" />Prediksi</span><span><i className="actual-key" />Hasil</span></div>
            </div>
            <SeriesChart item={selected} />
          </div>
        </section>
      </main>

      <footer><span>Estimasi statistik, bukan rekomendasi investasi.</span><span>Hanya hasil akhir model yang ditampilkan.</span></footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
