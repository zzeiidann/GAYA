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
