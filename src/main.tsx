import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Zap } from "lucide-react";
import "./styles.css";

type Family = "FR" | "PBS";

type Prediction = {
  series: string;
  family: Family;
  model: string;
  maturity: string;
  tenor: string;
  coupon: number;
  lower: number;
  point: number;
  upper: number;
  previous: number;
  r2: number;
  observations: number;
  spark: number[];
};

const predictions: Prediction[] = [
  { series: "FR0103", family: "FR", model: "FR0103.v18", maturity: "15 JUL 2035", tenor: "8.9Y", coupon: 6.75, lower: 6.812, point: 6.875, upper: 6.941, previous: 6.902, r2: 0.86, observations: 18, spark: [6.96, 6.92, 6.94, 6.89, 6.91, 6.87, 6.88] },
  { series: "FR0106", family: "FR", model: "FR0106.v15", maturity: "15 AUG 2040", tenor: "14.0Y", coupon: 7.125, lower: 6.903, point: 6.974, upper: 7.048, previous: 6.951, r2: 0.82, observations: 15, spark: [6.88, 6.91, 6.9, 6.94, 6.92, 6.96, 6.97] },
  { series: "FR0107", family: "FR", model: "FR0107.v12", maturity: "15 AUG 2045", tenor: "19.0Y", coupon: 7.125, lower: 6.994, point: 7.071, upper: 7.151, previous: 7.048, r2: 0.8, observations: 12, spark: [6.99, 7.01, 7.03, 7.0, 7.04, 7.06, 7.07] },
  { series: "FR0102", family: "FR", model: "FR0102.v21", maturity: "15 JUL 2054", tenor: "27.9Y", coupon: 6.875, lower: 7.061, point: 7.145, upper: 7.232, previous: 7.126, r2: 0.84, observations: 21, spark: [7.08, 7.09, 7.12, 7.1, 7.13, 7.14, 7.15] },
  { series: "PBS030", family: "PBS", model: "PBS030.v17", maturity: "15 JUL 2028", tenor: "1.9Y", coupon: 5.875, lower: 6.412, point: 6.468, upper: 6.527, previous: 6.491, r2: 0.88, observations: 17, spark: [6.55, 6.52, 6.53, 6.5, 6.49, 6.48, 6.47] },
  { series: "PBS038", family: "PBS", model: "PBS038.v14", maturity: "15 DEC 2049", tenor: "23.3Y", coupon: 6.875, lower: 7.018, point: 7.098, upper: 7.181, previous: 7.077, r2: 0.81, observations: 14, spark: [7.03, 7.01, 7.05, 7.07, 7.06, 7.09, 7.1] },
];

function RangeBar({ item }: { item: Prediction }) {
  const domainMin = 6.3;
  const domainMax = 7.35;
  const pct = (value: number) => ((value - domainMin) / (domainMax - domainMin)) * 100;
  return (
    <div className="range-wrap">
      <div className="range-labels"><span>{item.lower.toFixed(3)}</span><span>{item.upper.toFixed(3)}</span></div>
      <div className="range-line">
        <i style={{ left: `${pct(item.lower)}%`, width: `${pct(item.upper) - pct(item.lower)}%` }} />
        <b style={{ left: `${pct(item.point)}%` }}><em>{item.point.toFixed(3)}</em></b>
      </div>
    </div>
  );
}

function HistoryChart({ item }: { item: Prediction }) {
  const values = item.spark;
  const min = Math.min(...values) - 0.02;
  const max = Math.max(...values) + 0.02;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${88 - ((value - min) / (max - min)) * 66}`).join(" ");
  return (
    <svg className="history-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label={`Riwayat ${item.series}`}>
      {[22, 44, 66, 88].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className="chart-grid" />)}
      <polyline points={points} className="chart-shadow" />
      <polyline points={points} className="chart-path" />
      {values.map((value, index) => (
        <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={88 - ((value - min) / (max - min)) * 66} r="1.25" />
      ))}
    </svg>
  );
}

function App() {
  const [family, setFamily] = useState<"ALL" | Family>("ALL");
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];
  const filtered = useMemo(() => predictions.filter((item) => family === "ALL" || item.family === family), [family]);
  const change = selected.point - selected.previous;

  return (
    <div className="site">
      <header className="masthead">
        <div className="mast-title">Prediksi Lelang Obligasi Pemerintah</div>
        <div className="edition"><span>Data contoh</span> · Belum terhubung ke pipeline</div>
        <nav>
          <a href="#board">Prediksi</a>
          <a href="#dossier">Detail model</a>
          <a href="#method">Metode</a>
        </nav>
      </header>

      <main>
        <section className="splash">
          <img src="/market-courier-splash.webp" alt="Ilustrasi komik kurir pasar melintasi grafik obligasi" />
          <div className="splash-shade" />
          <div className="splash-copy">
            <span className="slug">LELANG SUN BERIKUTNYA</span>
            <h1>Prediksi yield<br />per seri obligasi</h1>
            <p>Estimasi Weighted Average Yield beserta rentang prediksi untuk seri FR dan PBS yang ditawarkan pada lelang berikutnya.</p>
            <div className="splash-meta">
              <div><small>TANGGAL LELANG</small><b>11 AGU 2026</b></div>
              <div><small>WAKTU PENAWARAN</small><b>09:00–11:00 WIB</b></div>
              <div><small>SERI DIMODELKAN</small><b>4 FR · 2 PBS</b></div>
            </div>
          </div>
          <div className="comic-stamp"><span>LELANG</span><b>11</b><small>AGUSTUS</small></div>
        </section>

        <section className="signal-strip">
          <div className="signal-number">3M</div>
          <div><span>YIELD ACUAN MODEL</span><b>6.909%</b></div>
          <p>Indonesia 3 bulan, observasi terakhir sebelum pukul 09:00 WIB. Jika belum tersedia, sistem menggunakan penutupan hari kerja sebelumnya.</p>
          <span className="source">DIPERBARUI 8 AGU 2026</span>
        </section>

        <section className="board" id="board">
          <div className="board-heading">
            <div>
              <span className="kicker">RENTANG PREDIKSI 95%</span>
              <h2>Prediksi per seri</h2>
            </div>
            <div className="family-filter">
              {(["ALL", "FR", "PBS"] as const).map((item) => (
                <button className={family === item ? "active" : ""} onClick={() => setFamily(item)} key={item}>
                  {item === "ALL" ? "Semua seri" : item}
                </button>
              ))}
            </div>
          </div>

          <div className="board-table">
            <div className="board-header">
              <span>SERI / MODEL</span><span>JATUH TEMPO / KUPON</span><span>RENTANG PREDIKSI 95%</span><span>PREDIKSI WAY</span><span>Δ LELANG LALU</span><span>R²</span>
            </div>
            {filtered.map((item, index) => {
              const delta = item.point - item.previous;
              return (
                <button className={`board-row ${selected.series === item.series ? "selected" : ""}`} onClick={() => setSelectedSeries(item.series)} key={item.series}>
                  <span className="security">
                    <i>{String(index + 1).padStart(2, "0")}</i>
                    <span><b>{item.series}</b><small>{item.model}</small></span>
                  </span>
                  <span className="maturity"><b>{item.maturity}</b><small>{item.tenor} / {item.coupon.toFixed(3)}%</small></span>
                  <RangeBar item={item} />
                  <span className="way"><b>{item.point.toFixed(3)}%</b><small>ESTIMASI MODEL</small></span>
                  <span className={`delta ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}{Math.abs(delta * 100).toFixed(1)}bp</span>
                  <span className="fit"><b>{item.r2.toFixed(2)}</b><small>R²</small></span>
                </button>
              );
            })}
          </div>
          <div className="board-foot"><span>Pilih seri untuk melihat detail model</span><span>Hanya FR dan PBS</span></div>
        </section>

        <section className="dossier" id="dossier">
          <div className="dossier-title">
            <span>DETAIL MODEL SERI</span>
            <h2>{selected.series}</h2>
            <p>Model independen. Koefisien tidak dibagi dengan kode seri lain.</p>
            <div className="model-id">ID MODEL <b>{selected.model}</b></div>
          </div>
          <div className="chart-panel">
            <div className="chart-top"><span>RIWAYAT PREDIKSI LELANG</span><span>7 OBSERVASI</span></div>
            <HistoryChart item={selected} />
            <div className="chart-axis"><span>T−6</span><span>T−5</span><span>T−4</span><span>T−3</span><span>T−2</span><span>T−1</span><span>NEXT</span></div>
            <div className="chart-callout"><small>PREDIKSI BERIKUTNYA</small><b>{selected.point.toFixed(3)}%</b></div>
          </div>
          <div className="model-stats">
            <div><span>BATAS BAWAH 95%</span><b>{selected.lower.toFixed(3)}%</b></div>
            <div><span>BATAS ATAS 95%</span><b>{selected.upper.toFixed(3)}%</b></div>
            <div><span>PERUBAHAN</span><b className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : "−"}{Math.abs(change * 100).toFixed(1)} BP</b></div>
            <div><span>JUMLAH OBSERVASI</span><b>{selected.observations}</b></div>
            <div><span>MODEL R²</span><b>{selected.r2.toFixed(2)}</b></div>
            <div><span>TERAKHIR DILATIH</span><b>4 AGU 2026</b></div>
          </div>
        </section>

        <section className="method" id="method">
          <div className="method-intro"><span>PEMBARUAN MODEL</span><h2>Satu seri,<br /><i>satu model.</i></h2></div>
          <div className="method-flow">
            {["Ambil hasil DJPPR", "Pilih seri FR + PBS", "Latih per kode seri", "Terbitkan rentang"].map((label, index) => (
              <div key={label}><b>0{index + 1}</b><span>{label}</span>{index < 3 && <ChevronRight />}</div>
            ))}
          </div>
          <div className="method-note"><Zap /><p>Website publik hanya menerima hasil estimasi dan rentangnya. Dataset, koefisien, dan proses pelatihan tetap berada di repositori privat.</p></div>
        </section>
      </main>

      <footer>
        <span>Prediksi Lelang Obligasi Pemerintah</span>
        <p>Estimasi statistik, bukan rekomendasi investasi</p>
        <span>Data contoh</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
