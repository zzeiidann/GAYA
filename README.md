<p align="center">
  <img src="docs/readme-cover.svg" width="100%" alt="GAYA — Government Auction Yield Analytics" />
</p>

<p align="center">
  <a href="https://gaya.mohammad-raffy.workers.dev/"><img alt="Live dashboard" src="https://img.shields.io/badge/LIVE_DASHBOARD-OPEN_NOW-e63d2f?style=for-the-badge&labelColor=121318" /></a>
  <img alt="Coverage FR and PBS" src="https://img.shields.io/badge/COVERAGE-FR_+_PBS-167f9e?style=for-the-badge&labelColor=121318" />
  <img alt="Weekly automated update" src="https://img.shields.io/badge/UPDATE-WEEKLY-edbd48?style=for-the-badge&labelColor=121318" />
</p>

<p align="center">
  <strong>Government Auction Yield Analytics for Indonesia's FR and PBS bond market.</strong><br />
  A weekly decision-support dashboard combining awarded yield history, independently fitted per-series projections, and published prediction bounds in one focused desktop view.
</p>

![GAYA dashboard showing actual and predicted auction yields](docs/gaya-dashboard.png)

## Dashboard

GAYA turns the next government bond auction into a compact, series-level view. Select an FR or PBS series to compare awarded weighted-average yield (`WAY`) history against the model path and its published lower and upper bounds.

The dashboard shows:

- the instruments listed for the upcoming DJPPR auction;
- one independently fitted model for each eligible bond series;
- historical actual WAY versus the corresponding backtest prediction;
- the next prediction with lower and upper bounds;
- coupon, remaining tenor, maturity date, and auction window.

### Reading the chart

| Series | Meaning |
| --- | --- |
| ![Actual WAY](https://img.shields.io/badge/WAY-ACTUAL-121318?style=flat-square) | Awarded weighted-average yield published for the historical auction. |
| ![Model](https://img.shields.io/badge/MODEL-PREDICTION-edbd48?style=flat-square&labelColor=121318) | Backtest estimate for historical dates and projection for the next auction. |
| ![Lower](https://img.shields.io/badge/BOUND-LOWER-167f9e?style=flat-square&labelColor=121318) | Published lower prediction bound. |
| ![Upper](https://img.shields.io/badge/BOUND-UPPER-e63d2f?style=flat-square&labelColor=121318) | Published upper prediction bound. |

## Weekly data flow

![GAYA weekly data and deployment flow](docs/pipeline-flow.svg)

The private pipeline performs scraping, validation, feature construction, model fitting, and diagnostics. This public repository is deliberately limited to the presentation layer and a sanitized prediction feed.

| Public in this repository | Kept private |
| --- | --- |
| Series and instrument metadata | Training dataset |
| Actual WAY history | Model coefficients and diagnostics |
| Prediction and published bounds | Market feature inputs |
| Auction and update timestamps | Scraping infrastructure |

If a scheduled auction is unavailable or a series does not have enough observations, the last valid public release remains in place.

## Model coverage

| | Coverage |
| --- | --- |
| ![Instruments](https://img.shields.io/badge/INSTRUMENTS-FR_+_PBS-167f9e?style=for-the-badge&labelColor=121318) | Fixed-rate SUN and Project Based Sukuk series selected from the current auction plan. |
| ![Model granularity](https://img.shields.io/badge/MODEL-PER_SERIES-edbd48?style=for-the-badge&labelColor=121318) | One independently fitted model per eligible bond code, never a pooled model across every series. |
| ![History](https://img.shields.io/badge/CHART-4_ACTUAL_+_1_NEXT-e63d2f?style=for-the-badge&labelColor=121318) | Four historical backtest observations followed by the next auction projection. |

`SPN`, `SPNS`, and `PBSG` instruments are intentionally excluded from the public model board.

## Stack

<table>
  <tr>
    <td width="25%" align="center">
      <img alt="React" src="https://img.shields.io/badge/REACT-UI-167f9e?style=for-the-badge&labelColor=121318" /><br /><br />
      Component-based dashboard and model selector.
    </td>
    <td width="25%" align="center">
      <img alt="TypeScript" src="https://img.shields.io/badge/TYPESCRIPT-DATA_CONTRACT-3178c6?style=for-the-badge&labelColor=121318" /><br /><br />
      Typed public payload and series metadata.
    </td>
    <td width="25%" align="center">
      <img alt="Vite" src="https://img.shields.io/badge/VITE-BUILD-edbd48?style=for-the-badge&labelColor=121318" /><br /><br />
      Fast local development and production bundles.
    </td>
    <td width="25%" align="center">
      <img alt="SVG" src="https://img.shields.io/badge/SVG-CHART-e63d2f?style=for-the-badge&labelColor=121318" /><br /><br />
      Dependency-free chart rendering and labels.
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img alt="GitHub Actions" src="https://img.shields.io/badge/GITHUB_ACTIONS-WEEKLY_RELEASE-ffffff?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=121318" /><br /><br />
      Receives the sanitized release produced by the private weekly workflow.
    </td>
    <td colspan="2" align="center">
      <img alt="Cloudflare" src="https://img.shields.io/badge/CLOUDFLARE-AUTO_DEPLOY-f38020?style=for-the-badge&logo=cloudflare&logoColor=white&labelColor=121318" /><br /><br />
      Rebuilds and serves the production dashboard after every release commit.
    </td>
  </tr>
</table>

The public application has no login, browser-side model, secret key, or user input form. It reads a sanitized release from [`public/data/predictions.json`](public/data/predictions.json); model fitting and sensitive inputs remain in the private pipeline.

## Deployment

Production is served by Cloudflare from the `main` branch:

**[gaya.mohammad-raffy.workers.dev](https://gaya.mohammad-raffy.workers.dev/)**

```text
Build command : npm run build
Output         : dist
```

No frontend environment variable is required.

---

GAYA provides statistical estimates for research and monitoring. It is not an investment recommendation.
