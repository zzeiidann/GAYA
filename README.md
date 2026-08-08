# GAYA

GAYA is an end-to-end machine learning platform that automates data collection, forecasts Indonesian government bond auction yields, and monitors model performance across FR and PBS series through an interactive dashboard.

This public repository contains the presentation layer only. Training data, scraping infrastructure, model parameters, and automated retraining pipelines are maintained separately in a private repository.

## Model coverage

- Only FR and PBS instruments are modeled.
- Each bond series has its own independently trained model.
- The public application receives final point forecasts and prediction intervals; it does not receive model coefficients or training data.

## Local development

```bash
npm install
npm run dev
```

The current interface uses clearly labeled demonstration data while the automated publication pipeline is being connected.
