import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, CalendarDays, ChevronDown, Clock3, Layers3 } from "lucide-react";
import "./styles.css";

type Family = "FR" | "PBS";

type Prediction = {
  series: string;
  family: Family;
  maturity: string;
  tenor: string;
  coupon: number;
  lower: number;
  point: number;
  upper: number;
};

type ForecastPoint = {
  label: string;
  lower: number;
  point: number;
  upper: number;
};

const predictions: Prediction[] = [
  { series: "PBS030", family: "PBS", maturity: "15 Jul 2028", tenor: "1,9 tahun", coupon: 5.875, lower: 6.412, point: 6.468, upper: 6.527 },
  { series: "FR0103", family: "FR", maturity: "15 Jul 2035", tenor: "8,9 tahun", coupon: 6.75, lower: 6.812, point: 6.875, upper: 6.941 },
  { series: "FR0106", family: "FR", maturity: "15 Agu 2040", tenor: "14,0 tahun", coupon: 7.125, lower: 6.903, point: 6.974, upper: 7.048 },
  { series: "FR0107", family: "FR", maturity: "15 Agu 2045", tenor: "19,0 tahun", coupon: 7.125, lower: 6.994, point: 7.071, upper: 7.151 },
  { series: "PBS038", family: "PBS", maturity: "15 Des 2049", tenor: "23,3 tahun", coupon: 6.875, lower: 7.018, point: 7.098, upper: 7.181 },
  { series: "FR0102", family: "FR", maturity: "15 Jul 2054", tenor: "27,9 tahun", coupon: 6.875, lower: 7.061, point: 7.145, upper: 7.232 },
];

const auctionLabels = ["14 JUL", "21 JUL", "28 JUL", "04 AGU", "11 AGU"];
const historyOffsets = [-0.104, -0.069, -0.052, -0.026, 0];

function makeHistory(item: Prediction): ForecastPoint[] {
  return auctionLabels.map((label, index) => {
    if (index === auctionLabels.length - 1) {
      return { label, lower: item.lower, point: item.point, upper: item.upper };
    }

    const point = item.point + historyOffsets[index];
    const lowerSpread = 0.052 + index * 0.003;
    const upperSpread = 0.058 + index * 0.002;
    return {
      label,
      lower: point - lowerSpread,
      point,
      upper: point + upperSpread,
    };
  });
}

function ModelChart({ item }: { item: Prediction }) {
  const history = useMemo(() => makeHistory(item), [item]);
  const width = 840;
  const height = 336;
  const left = 58;
  const right = 116;
  const top = 32;
  const bottom = 50;
  const values = history.flatMap((entry) => [entry.lower, entry.upper]);
  const rawMin = Math.min(...values) - 0.035;
  const rawMax = Math.max(...values) + 0.035;
  const yMin = Math.floor(rawMin * 20) / 20;
  const yMax = Math.ceil(rawMax * 20) / 20;
  const x = (index: number) => left + (index / (history.length - 1)) * (width - left - right);
  const y = (value: number) => top + ((yMax - value) / (yMax - yMin)) * (height - top - bottom);
  const yTicks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) / 4) * index);
  const path = (key: "lower" | "point" | "upper") => history.map((entry, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(entry[key])}`).join(" ");
  const band = [
    ...history.map((entry, index) => `${x(index)},${y(entry.upper)}`),
    ...history.slice().reverse().map((entry, reverseIndex) => `${x(history.length - 1 - reverseIndex)},${y(entry.lower)}`),
  ].join(" ");
  const latest = history.at(-1)!;
  const latestX = x(history.length - 1);

  return (
    <svg className="model-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Pergerakan keluaran model ${item.series}`}>
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
          <text x={left - 12} y={y(tick) + 4} textAnchor="end" className="axis-text">{tick.toFixed(2)}%</text>
        </g>
      ))}
      {history.map((entry, index) => (
        <g key={entry.label}>
          <line x1={x(index)} x2={x(index)} y1={top} y2={height - bottom} className="chart-grid vertical" />
          <text x={x(index)} y={height - 18} textAnchor="middle" className="axis-text date-label">{entry.label}</text>
        </g>
      ))}

      <polygon points={band} className="forecast-band" />
      <path d={path("upper")} className="forecast-line upper-line" />
      <path d={path("lower")} className="forecast-line lower-line" />
      <path d={path("point")} className="forecast-line model-line" />

      {history.map((entry, index) => (
        <g key={`${entry.label}-points`}>
          <circle cx={x(index)} cy={y(entry.upper)} r="3.5" className="forecast-dot upper-dot" />
          <circle cx={x(index)} cy={y(entry.lower)} r="3.5" className="forecast-dot lower-dot" />
          <circle cx={x(index)} cy={y(entry.point)} r={index === history.length - 1 ? 7 : 4.5} className="forecast-dot model-dot" />
        </g>
      ))}

      <g className="latest-labels">
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.upper)} y2={y(latest.upper)} className="label-link upper-link" />
        <text x={latestX + 25} y={y(latest.upper) + 4} className="end-label upper-text">ATAS {latest.upper.toFixed(3)}%</text>
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.point)} y2={y(latest.point)} className="label-link model-link" />
        <text x={latestX + 25} y={y(latest.point) + 4} className="end-label model-text">MODEL {latest.point.toFixed(3)}%</text>
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.lower)} y2={y(latest.lower)} className="label-link lower-link" />
        <text x={latestX + 25} y={y(latest.lower) + 4} className="end-label lower-text">BAWAH {latest.lower.toFixed(3)}%</text>
      </g>
    </svg>
  );
}

function App() {
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];

  const chooseModel = (series: string) => {
    setSelectedSeries(series);
    setModelMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="market-header">
        <div className="header-main">
          <div className="brand-lockup">
            <div className="brand">GAYA<span>///</span></div>
            <div className="brand-copy"><b>GOVERNMENT AUCTION</b><span>YIELD ANALYTICS</span></div>
          </div>
          <div className="desk-title">
            <span>SOVEREIGN BOND DESK</span>
            <b>INDONESIA · FR / PBS</b>
          </div>
          <div className="auction-sticker">
            <small>NEXT AUCTION</small>
            <b>11 AUG ’26</b>
            <span>09:00—11:00 WIB</span>
          </div>
          <div className="market-live"><i /><span>MODEL BOARD</span><b>ONLINE</b><small>Data contoh · 08 AUG 2026</small></div>
        </div>
        <div className="ticker-bar">
          <b>AUCTION WIRE</b>
          <span>6 SERI DITAWARKAN</span><i />
          <span>FR &amp; PBS ONLY</span><i />
          <span>MODEL DIPISAH PER KODE SERI</span><i />
          <strong>WEEKLY MODEL DROP ↗</strong>
        </div>
      </header>

      <main>
        <section className="dashboard-heading">
          <div className="heading-copy">
            <span className="eyebrow">AUCTION MODEL MONITOR</span>
            <h1>Satu seri. Satu model yield.</h1>
            <p>Pilih seri FR atau PBS, lalu baca pergerakan prediksi model beserta batas bawah dan batas atasnya.</p>
          </div>
          <div className="desk-facts">
            <article><CalendarDays /><div><span>TANGGAL LELANG</span><b>11 Agustus 2026</b></div></article>
            <article><Clock3 /><div><span>PENAWARAN</span><b>09:00—11:00 WIB</b></div></article>
            <article><Layers3 /><div><span>MODEL AKTIF</span><b>6 seri</b></div></article>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="chart-card">
            <div className="panel-head">
              <div className="model-selector">
                <label id="series-model-label"><Activity /> MODEL SERI</label>
                <div className={`model-picker ${modelMenuOpen ? "open" : ""}`}>
                  <button
                    className="model-trigger"
                    type="button"
                    aria-labelledby="series-model-label"
                    aria-haspopup="listbox"
                    aria-expanded={modelMenuOpen}
                    onClick={() => setModelMenuOpen((open) => !open)}
                  >
                    <span>{selected.family}</span>
                    <b>{selected.series}</b>
                    <small>PER-SERIES</small>
                    <ChevronDown />
                  </button>
                  {modelMenuOpen && (
                    <div className="model-options" role="listbox" aria-label="Pilih model seri">
                      <div className="model-options-head"><span>MODEL DIRECTORY</span><b>6 ACTIVE</b></div>
                      {predictions.map((item, index) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={item.series === selected.series}
                          className={item.series === selected.series ? "active" : ""}
                          onClick={() => chooseModel(item.series)}
                          key={item.series}
                        >
                          <i>{String(index + 1).padStart(2, "0")}</i>
                          <span><b>{item.series}</b><small>{item.family} · {item.tenor}</small></span>
                          <strong>{item.point.toFixed(3)}%</strong>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="security-facts">
                <span><small>TENOR</small><b>{selected.tenor}</b></span>
                <span><small>KUPON</small><b>{selected.coupon.toFixed(3)}%</b></span>
                <span><small>JATUH TEMPO</small><b>{selected.maturity}</b></span>
              </div>
              <div className="primary-output"><span>PREDIKSI MODEL</span><b>{selected.point.toFixed(3)}%</b></div>
            </div>

            <div className="chart-meta">
              <div><span>MODEL OUTPUT / 5 LELANG</span><h2>Jejak prediksi {selected.series}</h2></div>
              <div className="chart-legend">
                <span><i className="lower-key" />Batas bawah</span>
                <span><i className="model-key" />Prediksi model</span>
                <span><i className="upper-key" />Batas atas</span>
              </div>
            </div>
            <ModelChart item={selected} />
          </article>

          <aside className="table-panel">
            <div className="table-title"><div><span>MODEL DIRECTORY</span><h2>Pilih model seri</h2></div><small>6 ACTIVE</small></div>
            <div className="table-head"><span>Seri</span><span>Model</span><span>Bawah</span><span>Atas</span></div>
            {predictions.map((item) => (
              <button className={`table-row ${selected.series === item.series ? "selected" : ""}`} onClick={() => chooseModel(item.series)} key={item.series}>
                <span className="series-code"><i className={item.family.toLowerCase()} /><span><b>{item.series}</b><small>{item.tenor} · {item.family}</small></span></span>
                <b className="number prediction-number">{item.point.toFixed(3)}%</b>
                <span className="number">{item.lower.toFixed(3)}%</span>
                <span className="number">{item.upper.toFixed(3)}%</span>
              </button>
            ))}
          </aside>
        </section>
      </main>

      <footer>
        <span><b>GAYA</b> · Government Auction Yield Analytics</span>
        <span>Estimasi statistik, bukan rekomendasi investasi.</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
