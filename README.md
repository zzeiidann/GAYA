# GAYA

GAYA is an end-to-end machine learning platform that automates data collection, forecasts Indonesian government bond auction yields, and monitors model performance across FR and PBS series through an interactive dashboard.

This public repository contains the presentation layer only. Training data, scraping infrastructure, model parameters, and automated retraining pipelines are maintained separately in a private repository.

## Model coverage

- Only FR and PBS instruments are modeled.
- Each bond series has its own independently trained model.
- The public application receives final predictions plus published lower and upper bounds; it does not receive model coefficients, the 3-month yield feature, or training data.

## Local development

```bash
npm install
npm run dev
```

The application reads `/data/predictions.json`. The private weekly pipeline updates that file after each scheduled model run; the bundled demonstration data is used only if the feed is unavailable.

## Railway deployment

The production image builds the Vite application with Node and serves `dist/` through Caddy. Caddy binds to Railway's injected `$PORT`, provides SPA routing, compression, and a `/health` endpoint.

1. Create a Railway project and choose **Deploy from GitHub repo**.
2. Select `zzeiidann/GAYA` and branch `main`.
3. Let Railway detect the root `Dockerfile`; no build or start command override is required.
4. Open **Settings → Networking** and generate a public domain.
5. Keep GitHub autodeploy enabled so Tuesday prediction commits trigger a fresh deployment.

No Railway environment variable is required by the frontend. The dashboard reads the versioned `public/data/predictions.json` bundled at build time.
