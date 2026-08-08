import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Crosshair, Zap } from "lucide-react";
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

const marketTape = [
  ["INDO 3M", "6.909", "−0.021", "down"],
  ["SUN 10Y", "6.742", "+0.018", "up"],
  ["USD / IDR", "16,245", "+35", "up"],
  ["BI RATE", "5.25", "UNCH", "flat"],
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
      <div className="market-tape" aria-label="Market tape">
        <div className="tape-live"><i /> MARKET SNAPSHOT · DEMO</div>
        {marketTape.map(([name, value, delta, direction]) => (
          <div className="tape-quote" key={name}>
            <span>{name}</span><b>{value}</b><em className={direction}>{delta}</em>
          </div>
        ))}
        <div className="tape-time">08 AUG 2026 / 16:37 WIB</div>
      </div>

      <header className="masthead">
        <div className="edition">ISSUE 032 <span>/</span> FY 2026</div>
        <div className="mast-title">GOVERNMENT AUCTION YIELD ANALYTICS</div>
        <nav>
          <a href="#board">BOARD</a>
          <a href="#dossier">MODEL LOG</a>
          <a href="#method">METHOD</a>
        </nav>
      </header>

      <main>
        <section className="splash">
          <img src="/market-courier-splash.webp" alt="Ilustrasi komik kurir pasar melintasi grafik obligasi" />
          <div className="splash-shade" />
          <div className="splash-copy">
            <span className="slug"><Crosshair size={15} /> NEXT AUCTION / SUN</span>
            <h1>BEFORE<br />THE <mark>HAMMER</mark><br />FALLS.</h1>
            <p>Rentang Weighted Average Yield untuk tiap seri. Satu kode, satu model. Diterbitkan sebelum jendela lelang dibuka.</p>
            <div className="splash-meta">
              <div><small>AUCTION DATE</small><b>11 AUG ’26</b></div>
              <div><small>WINDOW</small><b>09:00—11:00</b></div>
              <div><small>ACTIVE MODELS</small><b>04 FR / 02 PBS</b></div>
            </div>
          </div>
          <div className="comic-stamp"><span>MODEL DROP</span><b>T−02</b><small>DAYS</small></div>
          <div className="splash-caption">ARTWORK: MARKET COURIER / ORIGINAL CHARACTER</div>
        </section>

        <section className="signal-strip">
          <div className="signal-number">3M</div>
          <div><span>REFERENCE YIELD</span><b>6.909%</b></div>
          <div className="signal-move down"><ArrowDownRight /> −2.1 BPS <small>VS PREV CLOSE</small></div>
          <p>Latest observation at or before 09:00 WIB. If unavailable, previous business-day close is used.</p>
          <span className="source">SOURCE / INVESTING.COM</span>
        </section>

        <section className="board" id="board">
          <div className="board-heading">
            <div>
              <span className="kicker">PREDICTION SHEET / 95% PI</span>
              <h2>THE AUCTION BOARD</h2>
            </div>
            <div className="family-filter">
              {(["ALL", "FR", "PBS"] as const).map((item) => (
                <button className={family === item ? "active" : ""} onClick={() => setFamily(item)} key={item}>
                  {item === "ALL" ? "ALL SERIES" : item}
                </button>
              ))}
            </div>
          </div>

          <div className="board-table">
            <div className="board-header">
              <span>SECURITY / MODEL</span><span>MATURITY / CPN</span><span>95% PREDICTION INTERVAL</span><span>WAY CALL</span><span>Δ LAST</span><span>FIT</span>
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
                  <span className="way"><b>{item.point.toFixed(3)}%</b><small>MODEL TARGET</small></span>
                  <span className={`delta ${delta >= 0 ? "up" : "down"}`}>{delta >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}{Math.abs(delta * 100).toFixed(1)}bp</span>
                  <span className="fit"><b>{item.r2.toFixed(2)}</b><small>R²</small></span>
                </button>
              );
            })}
          </div>
          <div className="board-foot"><span>CLICK ANY ROW FOR THE SERIES DOSSIER</span><span>NO SPN / SPNS / PBSG MODELS</span></div>
        </section>

        <section className="dossier" id="dossier">
          <div className="dossier-title">
            <span>SERIES DOSSIER</span>
            <h2>{selected.series}</h2>
            <p>Model independen. Koefisien tidak dibagi dengan kode seri lain.</p>
            <div className="model-id">MODEL ID <b>{selected.model}</b></div>
          </div>
          <div className="chart-panel">
            <div className="chart-top"><span>ROLLING AUCTION CALL</span><span>7 OBSERVATIONS</span></div>
            <HistoryChart item={selected} />
            <div className="chart-axis"><span>T−6</span><span>T−5</span><span>T−4</span><span>T−3</span><span>T−2</span><span>T−1</span><span>NEXT</span></div>
            <div className="chart-callout"><small>NEXT CALL</small><b>{selected.point.toFixed(3)}%</b></div>
          </div>
          <div className="model-stats">
            <div><span>LOWER / 95%</span><b>{selected.lower.toFixed(3)}%</b></div>
            <div><span>UPPER / 95%</span><b>{selected.upper.toFixed(3)}%</b></div>
            <div><span>MOVE / LAST</span><b className={change >= 0 ? "up" : "down"}>{change >= 0 ? "+" : "−"}{Math.abs(change * 100).toFixed(1)} BP</b></div>
            <div><span>OBSERVATIONS</span><b>{selected.observations}</b></div>
            <div><span>MODEL R²</span><b>{selected.r2.toFixed(2)}</b></div>
            <div><span>LAST RETRAIN</span><b>04 AUG ’26</b></div>
          </div>
        </section>

        <section className="method" id="method">
          <div className="method-intro"><span>HOW IT MOVES</span><h2>ONE SERIES.<br /><i>ONE BRAIN.</i></h2></div>
          <div className="method-flow">
            {["SCRAPE DJPPR", "FILTER FR + PBS", "RETRAIN BY CODE", "PUBLISH RANGE"].map((label, index) => (
              <div key={label}><b>0{index + 1}</b><span>{label}</span>{index < 3 && <ChevronRight />}</div>
            ))}
          </div>
          <div className="method-note"><Zap /><p>The public layer receives only the final point estimate and interval. Training data, coefficients, and retraining pipeline stay private.</p></div>
        </section>
      </main>

      <footer>
        <span>GOVERNMENT AUCTION YIELD ANALYTICS</span>
        <p>STATISTICAL ESTIMATE · NOT INVESTMENT ADVICE</p>
        <span>DEMO / 2026</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
