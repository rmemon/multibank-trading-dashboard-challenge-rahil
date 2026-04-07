import { Router } from "express";
import { getMarketEngine } from "../../market/marketEngine.js";
import { authenticate } from "../../middleware/authenticate.js";

export const tickersRouter = Router();

tickersRouter.use(authenticate);

/** GET /api/tickers */
tickersRouter.get("/", (_req, res) => {
  res.json({ tickers: getMarketEngine().getQuotes() });
});

/** GET /api/tickers/:symbol/history?limit=72&stepSec=60 (stepSec up to 1d for daily candles) */
tickersRouter.get("/:symbol/history", (req, res) => {
  const { symbol } = req.params;
  const count = Math.min(500, Math.max(5, Number(req.query.limit) || 72));
  const stepSec = Math.min(86_400, Math.max(1, Number(req.query.stepSec) || 60));
  try {
    const data = getMarketEngine().getHistorical(symbol, count, stepSec * 1000);
    res.json({ symbol, ...data });
  } catch {
    res.status(404).json({ error: "Unknown symbol" });
  }
});
