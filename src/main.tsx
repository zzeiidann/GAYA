import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
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
  history: ForecastPoint[];
};

type ForecastPoint = {
  label: string;
  lower: number;
  point: number;
  upper: number;
  actual: number | null;
};

type ApiForecastPoint = {
  auction_date: string;
  lower: number;
  prediction: number;
  upper: number;
  actual: number | null;
};

type ApiPrediction = {
  series: string;
  family: Family;
  maturity_date: string;
  tenor_years: number;
  coupon_rate_pct: number;
  lower: number;
  prediction: number;
  upper: number;
  history: ApiForecastPoint[];
};

type PredictionPayload = {
  status: "ready" | "failed";
  auction_date: string;
  updated_at: string;
  predictions: ApiPrediction[];
};

const demoPredictions: Prediction[] = [
  { series: "PBS030", family: "PBS", maturity: "15 Jul 2028", tenor: "1,9 tahun", coupon: 5.875, lower: 6.412, point: 6.468, upper: 6.527, history: [] },
  { series: "FR0103", family: "FR", maturity: "15 Jul 2035", tenor: "8,9 tahun", coupon: 6.75, lower: 6.812, point: 6.875, upper: 6.941, history: [] },
  { series: "FR0106", family: "FR", maturity: "15 Agu 2040", tenor: "14,0 tahun", coupon: 7.125, lower: 6.903, point: 6.974, upper: 7.048, history: [] },
  { series: "FR0107", family: "FR", maturity: "15 Agu 2045", tenor: "19,0 tahun", coupon: 7.125, lower: 6.994, point: 7.071, upper: 7.151, history: [] },
  { series: "PBS038", family: "PBS", maturity: "15 Des 2049", tenor: "23,3 tahun", coupon: 6.875, lower: 7.018, point: 7.098, upper: 7.181, history: [] },
  { series: "FR0102", family: "FR", maturity: "15 Jul 2054", tenor: "27,9 tahun", coupon: 6.875, lower: 7.061, point: 7.145, upper: 7.232, history: [] },
];

const auctionLabels = ["14 JUL", "21 JUL", "28 JUL", "04 AGU", "11 AGU"];
const historyOffsets = [-0.104, -0.069, -0.052, -0.026, 0];

function makeHistory(item: Prediction): ForecastPoint[] {
  if (item.history.length > 1) return item.history;
  return auctionLabels.map((label, index) => {
    if (index === auctionLabels.length - 1) {
      return { label, lower: item.lower, point: item.point, upper: item.upper, actual: null };
    }

    const point = item.point + historyOffsets[index];
    const lowerSpread = 0.052 + index * 0.003;
    const upperSpread = 0.058 + index * 0.002;
    return {
      label,
      lower: point - lowerSpread,
      point,
      upper: point + upperSpread,
      actual: null,
    };
  });
}

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00+07:00`);
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options })
    .format(parseLocalDate(value))
    .replaceAll(".", "");
}

function shortAuctionDate(value: string): string {
  return formatDate(value, { day: "2-digit", month: "short" }).toUpperCase();
}

function fullAuctionDate(value: string): string {
  return formatDate(value, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function issueLabel(value: string): string {
  const parsed = parseLocalDate(value);
  return `${String(parsed.getMonth() + 1).padStart(2, "0")}.${String(parsed.getFullYear()).slice(-2)}`;
}

function mapPayload(payload: PredictionPayload): Prediction[] {
  return payload.predictions.map((item) => ({
    series: item.series,
    family: item.family,
    maturity: formatDate(item.maturity_date, { day: "2-digit", month: "short", year: "numeric" }),
    tenor: `${item.tenor_years.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tahun`,
    coupon: item.coupon_rate_pct,
    lower: item.lower,
    point: item.prediction,
    upper: item.upper,
    history: item.history.map((entry) => ({
      label: shortAuctionDate(entry.auction_date),
      lower: entry.lower,
      point: entry.prediction,
      upper: entry.upper,
      actual: entry.actual,
    })),
  }));
}

function ModelChart({ item }: { item: Prediction }) {
  const history = useMemo(() => makeHistory(item), [item]);
  const width = 840;
  const height = 336;
  const left = 58;
  const right = 116;
  const top = 32;
  const bottom = 50;
  const values = history.flatMap((entry) => [
    entry.lower,
    entry.upper,
    ...(entry.actual === null ? [] : [entry.actual]),
  ]);
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
  const actualPoints = history.flatMap((entry, index) =>
    entry.actual === null ? [] : [{ index, value: entry.actual }]
  );
  const actualPath = actualPoints
    .map((entry, index) => `${index === 0 ? "M" : "L"} ${x(entry.index)} ${y(entry.value)}`)
    .join(" ");
  const latest = history.at(-1)!;
  const latestX = x(history.length - 1);
  const latestActual = actualPoints.at(-1);

  return (
    <svg className="model-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Perbandingan WAY aktual dan prediksi model ${item.series}`}>
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
      {actualPath && <path d={actualPath} className="forecast-line actual-line" />}

      {history.map((entry, index) => (
        <g key={`${entry.label}-points`}>
          <circle cx={x(index)} cy={y(entry.upper)} r="3.5" className="forecast-dot upper-dot" />
          <circle cx={x(index)} cy={y(entry.lower)} r="3.5" className="forecast-dot lower-dot" />
          <circle cx={x(index)} cy={y(entry.point)} r={index === history.length - 1 ? 7 : 4.5} className="forecast-dot model-dot" />
        </g>
      ))}

      {actualPoints.map((entry) => (
        <circle
          key={`${history[entry.index].label}-actual`}
          cx={x(entry.index)}
          cy={y(entry.value)}
          r="5"
          className="forecast-dot actual-dot"
        />
      ))}

      <g className="latest-labels">
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.upper)} y2={y(latest.upper)} className="label-link upper-link" />
        <text x={latestX + 25} y={y(latest.upper) + 4} className="end-label upper-text">ATAS {latest.upper.toFixed(3)}%</text>
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.point)} y2={y(latest.point)} className="label-link model-link" />
        <text x={latestX + 25} y={y(latest.point) + 4} className="end-label model-text">MODEL {latest.point.toFixed(3)}%</text>
        <line x1={latestX + 8} x2={latestX + 20} y1={y(latest.lower)} y2={y(latest.lower)} className="label-link lower-link" />
        <text x={latestX + 25} y={y(latest.lower) + 4} className="end-label lower-text">BAWAH {latest.lower.toFixed(3)}%</text>
      </g>

      {latestActual && (
        <g className="latest-actual-label">
          <line
            x1={x(latestActual.index) + 7}
            x2={x(latestActual.index) + 20}
            y1={y(latestActual.value)}
            y2={y(latestActual.value)}
            className="label-link actual-link"
          />
          <text
            x={x(latestActual.index) + 25}
            y={y(latestActual.value) + 4}
            className="end-label actual-text"
          >
            AKTUAL {latestActual.value.toFixed(3)}%
          </text>
        </g>
      )}
    </svg>
  );
}

function App() {
  const [predictions, setPredictions] = useState(demoPredictions);
  const [selectedSeries, setSelectedSeries] = useState("FR0103");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [auctionDate, setAuctionDate] = useState("2026-08-11");
  const [dataLabel, setDataLabel] = useState("DEMO FALLBACK");
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const selected = predictions.find((item) => item.series === selectedSeries) ?? predictions[0];

  useEffect(() => {
    let active = true;
    fetch("/data/predictions.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Prediction feed returned ${response.status}`);
        return response.json() as Promise<PredictionPayload>;
      })
      .then((payload) => {
        if (!active || payload.status !== "ready" || payload.predictions.length === 0) return;
        const mapped = mapPayload(payload);
        setPredictions(mapped);
        setAuctionDate(payload.auction_date);
        setSelectedSeries((current) =>
          mapped.some((item) => item.series === current) ? current : mapped[0].series
        );
        const updated = new Date(payload.updated_at);
        setDataLabel(
          `UPDATED · ${new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          }).format(updated).replace(",", " ·").replaceAll(".", ":").toUpperCase()} WIB`
        );
      })
      .catch(() => {
        if (active) setDataLabel("DEMO FALLBACK");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!modelMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!modelPickerRef.current?.contains(event.target as Node)) setModelMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModelMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [modelMenuOpen]);

  const chooseModel = (series: string) => {
    setSelectedSeries(series);
    setModelMenuOpen(false);
  };

  return (
    <div className="app">
      <header className="comic-masthead">
        <div className="issue-rail">
          <b>WEEKLY AUCTION MONITOR</b>
          <span>WEEK {issueLabel(auctionDate)}</span>
          <span>JAKARTA / GOVERNMENT BONDS</span>
        </div>
        <div className="cover-brand">GAYA</div>
        <div className="cover-title">
          <span>THE</span>
          <b>YIELD<br />DESK</b>
          <small>Government Auction Yield Analytics</small>
        </div>
        <div className="cover-slug">FR + PBS<br /><b>MODEL DESK</b></div>
        <div className="auction-date">
          <small>NEXT AUCTION</small>
          <b>{shortAuctionDate(auctionDate)}</b>
          <span>09:00—11:00 WIB</span>
        </div>
        <div className="cover-status"><i /><span>MODEL BOARD ONLINE</span><small>{dataLabel}</small></div>
      </header>

      <main>
        <section className="story-lede">
          <div className="chapter-mark"><span>BOARD</span><b>01</b></div>
          <div className="heading-copy">
            <span className="eyebrow">AUCTION MODEL BOARD</span>
            <h1>Model lelang FR &amp; PBS</h1>
            <p>Estimasi WAY per seri dan batas prediksinya.</p>
          </div>
          <div className="desk-facts">
            <article><CalendarDays /><div><span>LELANG</span><b>{fullAuctionDate(auctionDate)}</b></div></article>
            <article><Clock3 /><div><span>WINDOW</span><b>09:00—11:00</b></div></article>
            <article><Layers3 /><div><span>UNIVERSE</span><b>{predictions.length} SERI</b></div></article>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="chart-card" data-panel="01">
            <div className="panel-head">
              <div className="model-selector">
                <label id="series-model-label"><Activity /> MODEL SERI</label>
                <div className={`model-picker ${modelMenuOpen ? "open" : ""}`} ref={modelPickerRef}>
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
                    <small>OLS / SERI</small>
                    <ChevronDown />
                  </button>
                  {modelMenuOpen && (
                    <div className="model-options" role="listbox" aria-label="Pilih model seri">
                      <div className="model-options-head"><span>DAFTAR MODEL</span><b>{predictions.length} SERI</b></div>
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
              <div><span>{selected.history.filter((entry) => entry.actual !== null).length} HASIL AKTUAL / 1 PROYEKSI</span><h2>Aktual vs model {selected.series}</h2></div>
              <div className="chart-legend">
                <span><i className="actual-key" />WAY aktual</span>
                <span><i className="lower-key" />Batas bawah</span>
                <span><i className="model-key" />Prediksi model</span>
                <span><i className="upper-key" />Batas atas</span>
              </div>
            </div>
            <ModelChart item={selected} />
          </article>

          <aside className="table-panel" data-panel="02">
            <div className="table-title"><div><span>AUCTION UNIVERSE</span><h2>Seri lelang aktif</h2></div><small>{predictions.length} SERI</small></div>
            <div className="table-head"><span>Seri</span><span>Model</span><span>Bawah</span><span>Atas</span></div>
            {predictions.map((item) => (
              <button type="button" className={`table-row ${selected.series === item.series ? "selected" : ""}`} onClick={() => chooseModel(item.series)} key={item.series}>
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
