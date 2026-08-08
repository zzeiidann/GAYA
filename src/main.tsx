import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  Gauge,
  Info,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import "./styles.css";

type Family = "FR" | "PBS";

type Prediction = {
  series: string;
  family: Family;
  modelVersion: string;
  maturity: string;
  tenor: string;
  coupon: number;
  lower: number;
  point: number;
  upper: number;
  previous: number;
  r2: number;
  observations: number;
  trend: "up" | "down";
  spark: number[];
};

const predictions: Prediction[] = [
  {
    series: "FR0103",
    family: "FR",
    modelVersion: "FR0103-v18",
    maturity: "15 Jul 2035",
    tenor: "8.9 tahun",
    coupon: 6.75,
    lower: 6.812,
    point: 6.875,
    upper: 6.941,
    previous: 6.902,
    r2: 0.86,
    observations: 18,
    trend: "down",
    spark: [6.96, 6.92, 6.94, 6.89, 6.91, 6.87, 6.88],
  },
  {
    series: "FR0106",
    family: "FR",
    modelVersion: "FR0106-v15",
    maturity: "15 Agu 2040",
    tenor: "14.0 tahun",
    coupon: 7.13,
    lower: 6.903,
    point: 6.974,
    upper: 7.048,
    previous: 6.951,
    r2: 0.82,
    observations: 15,
    trend: "up",
    spark: [6.88, 6.91, 6.9, 6.94, 6.92, 6.96, 6.97],
  },
  {
    series: "FR0107",
    family: "FR",
    modelVersion: "FR0107-v12",
    maturity: "15 Agu 2045",
    tenor: "19.0 tahun",
    coupon: 7.13,
    lower: 6.994,
    point: 7.071,
    upper: 7.151,
    previous: 7.048,
    r2: 0.8,
    observations: 12,
    trend: "up",
    spark: [6.99, 7.01, 7.03, 7.0, 7.04, 7.06, 7.07],
  },
  {
    series: "FR0102",
    family: "FR",
    modelVersion: "FR0102-v21",
    maturity: "15 Jul 2054",
    tenor: "27.9 tahun",
    coupon: 6.88,
    lower: 7.061,
    point: 7.145,
    upper: 7.232,
    previous: 7.126,
    r2: 0.84,
    observations: 21,
    trend: "up",
    spark: [7.08, 7.09, 7.12, 7.1, 7.13, 7.14, 7.15],
  },
  {
    series: "PBS030",
    family: "PBS",
    modelVersion: "PBS030-v17",
    maturity: "15 Jul 2028",
    tenor: "1.9 tahun",
    coupon: 5.88,
    lower: 6.412,
    point: 6.468,
    upper: 6.527,
    previous: 6.491,
    r2: 0.88,
    observations: 17,
    trend: "down",
    spark: [6.55, 6.52, 6.53, 6.5, 6.49, 6.48, 6.47],
  },
  {
    series: "PBS038",
    family: "PBS",
    modelVersion: "PBS038-v14",
    maturity: "15 Des 2049",
    tenor: "23.3 tahun",
    coupon: 6.88,
    lower: 7.018,
    point: 7.098,
    upper: 7.181,
    previous: 7.077,
    r2: 0.81,
    observations: 14,
    trend: "up",
    spark: [7.03, 7.01, 7.05, 7.07, 7.06, 7.09, 7.1],
  },
];

function formatYield(value: number) {
  return `${value.toFixed(3)}%`;
}

function Sparkline({ values, trend }: { values: number[]; trend: "up" | "down" }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 88 + 2;
      const y = 30 - ((value - min) / spread) * 23;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className={`sparkline ${trend}`} viewBox="0 0 92 36" aria-label="Tren prediksi">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.3" />
      <circle
        cx="90"
        cy={30 - ((values[values.length - 1] - min) / spread) * 23}
        r="3"
        fill="currentColor"
      />
    </svg>
  );
}

function RangePlot({ item }: { item: Prediction }) {
  const min = 6.3;
  const max = 7.35;
  const position = (value: number) => `${((value - min) / (max - min)) * 100}%`;

  return (
    <div className="range-plot" aria-label={`Rentang ${item.series}`}>
      <div className="range-track" />
      <div
        className="range-span"
        style={{ left: position(item.lower), width: `${((item.upper - item.lower) / (max - min)) * 100}%` }}
      />
      <div className="range-point" style={{ left: position(item.point) }}>
        <span>{item.point.toFixed(3)}</span>
      </div>
    </div>
  );
}

function App() {
  const [family, setFamily] = useState<"ALL" | Family>("ALL");
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      predictions.filter(
        (item) =>
          (family === "ALL" || item.family === family) &&
          item.series.toLowerCase().includes(search.toLowerCase()),
      ),
    [family, search],
  );

  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>GAYA</strong>
            <small>Government Auction Yield Analytics</small>
          </div>
        </div>

        <nav>
          <a className="active" href="#prediksi">Prediksi</a>
          <a href="#models">Model</a>
          <a href="#methodology">Metodologi</a>
        </nav>

        <div className="top-actions">
          <span className="status-pill"><i /> Sistem aktif</span>
          <button className="icon-button" aria-label="Bantuan"><CircleHelp size={19} /></button>
          <div className="avatar">RZ</div>
        </div>
      </header>

      <main>
        <section className="hero" id="prediksi">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> AUCTION INTELLIGENCE</div>
            <h1>Rentang yield, sebelum<br />lelang dimulai.</h1>
            <p>
              Prediksi Weighted Average Yield untuk setiap seri FR dan PBS,
              diperbarui otomatis menggunakan model khusus per seri.
            </p>
          </div>

          <div className="auction-card">
            <div className="auction-card-head">
              <span>Lelang berikutnya</span>
              <span className="demo-label">DATA DEMO</span>
            </div>
            <div className="auction-date">
              <div className="date-box"><b>11</b><small>AGU</small></div>
              <div>
                <strong>Selasa, 11 Agustus 2026</strong>
                <span><Clock3 size={14} /> 09:00–11:00 WIB</span>
              </div>
            </div>
            <div className="countdown">
              <div><b>02</b><small>hari</small></div>
              <i>:</i>
              <div><b>16</b><small>jam</small></div>
              <i>:</i>
              <div><b>22</b><small>menit</small></div>
            </div>
            <div className="auction-foot"><RefreshCw size={13} /> Model terakhir diperbarui 4 Agu 2026, 13:18 WIB</div>
          </div>
        </section>

        <section className="metric-grid" aria-label="Ringkasan model">
          <article className="metric-card feature">
            <div className="metric-icon"><TrendingUp size={20} /></div>
            <div><span>Yield acuan 3 bulan</span><strong>6.909%</strong><small><ArrowDownRight size={13} /> 2,1 bps dari penutupan sebelumnya</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon purple"><Layers3 size={20} /></div>
            <div><span>Model seri aktif</span><strong>6</strong><small>4 FR · 2 PBS pada lelang ini</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon amber"><Gauge size={20} /></div>
            <div><span>R² median</span><strong>0.83</strong><small>Model-level out-of-sample</small></div>
          </article>
          <article className="metric-card">
            <div className="metric-icon blue"><ShieldCheck size={20} /></div>
            <div><span>Cakupan model</span><strong>FR &amp; PBS</strong><small>Seri lainnya tidak dimodelkan</small></div>
          </article>
        </section>

        <section className="workspace">
          <div className="prediction-panel">
            <div className="section-head">
              <div>
                <span className="section-kicker">PREDIKSI LELANG</span>
                <h2>Rentang per seri</h2>
              </div>
              <div className="toolbar">
                <div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari seri" /></div>
                <div className="segmented">
                  {(["ALL", "FR", "PBS"] as const).map((item) => (
                    <button key={item} onClick={() => setFamily(item)} className={family === item ? "active" : ""}>{item === "ALL" ? "Semua" : item}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-head">
              <span>Seri &amp; model</span>
              <span>Tenor</span>
              <span>Rentang prediksi (95%)</span>
              <span>Prediksi</span>
              <span>Tren</span>
            </div>

            <div className="prediction-list">
              {filtered.map((item) => (
                <button
                  key={item.series}
                  className={`prediction-row ${selected.series === item.series ? "selected" : ""}`}
                  onClick={() => setSelectedSeries(item.series)}
                >
                  <span className="series-cell">
                    <b>{item.series}</b>
                    <small>{item.modelVersion}</small>
                  </span>
                  <span className="tenor-cell"><b>{item.tenor}</b><small>{item.maturity}</small></span>
                  <span className="range-cell">
                    <RangePlot item={item} />
                    <small><i>{item.lower.toFixed(3)}</i><i>{item.upper.toFixed(3)}</i></small>
                  </span>
                  <span className="point-cell"><b>{formatYield(item.point)}</b><small>WAY estimasi</small></span>
                  <span className="trend-cell"><Sparkline values={item.spark} trend={item.trend} /></span>
                </button>
              ))}
            </div>

            <div className="table-note"><Info size={14} /> Klik seri untuk melihat detail model. Rentang menggunakan 95% prediction interval.</div>
          </div>

          <aside className="model-panel" id="models">
            <div className="model-panel-head">
              <div><span>MODEL TERPILIH</span><h3>{selected.series}</h3></div>
              <span className="healthy"><Check size={13} /> Sehat</span>
            </div>

            <div className="model-hero">
              <small>Prediksi WAY</small>
              <strong>{formatYield(selected.point)}</strong>
              <span className={selected.trend}><>{selected.trend === "up" ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}</> {Math.abs(selected.point - selected.previous).toFixed(3)}% vs. lelang lalu</span>
            </div>

            <div className="interval-box">
              <div><span>Batas bawah</span><b>{formatYield(selected.lower)}</b></div>
              <div className="interval-divider" />
              <div><span>Batas atas</span><b>{formatYield(selected.upper)}</b></div>
            </div>

            <div className="detail-list">
              <div><span>Model ID</span><b>{selected.modelVersion}</b></div>
              <div><span>Kupon</span><b>{selected.coupon.toFixed(3)}%</b></div>
              <div><span>Observasi seri</span><b>{selected.observations} lelang</b></div>
              <div><span>Model R²</span><b>{selected.r2.toFixed(2)}</b></div>
              <div><span>Terakhir dilatih</span><b>4 Agu 2026</b></div>
            </div>

            <div className="model-rule">
              <Database size={17} />
              <p><b>Satu seri, satu model.</b><br />{selected.series} tidak berbagi koefisien dengan seri FR atau PBS lainnya.</p>
            </div>

            <button className="model-button">Lihat riwayat akurasi <BarChart3 size={16} /></button>
          </aside>
        </section>

        <section className="pipeline" id="methodology">
          <div>
            <span className="section-kicker">PEMBARUAN OTOMATIS</span>
            <h2>Dari hasil lelang ke prediksi berikutnya.</h2>
          </div>
          <div className="pipeline-steps">
            <div><i><CalendarDays size={18} /></i><span><b>01 · Scrape</b><small>Hasil lelang DJPPR</small></span></div>
            <em />
            <div><i><Database size={18} /></i><span><b>02 · Validasi</b><small>FR &amp; PBS saja</small></span></div>
            <em />
            <div><i><Activity size={18} /></i><span><b>03 · Retrain</b><small>Model setiap seri</small></span></div>
            <em />
            <div><i><RefreshCw size={18} /></i><span><b>04 · Publish</b><small>Rentang terbaru</small></span></div>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand"><div className="brand-mark"><span /><span /><span /></div><strong>GAYA</strong></div>
        <p>Hasil bersifat estimasi statistik, bukan rekomendasi investasi.</p>
        <span>© 2026 GAYA · Data demo</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
