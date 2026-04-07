import { INSTRUMENTS } from "../market/instruments.js";

/**
 * Price threshold alerts (bonus). In production, thresholds would be per-user / persisted.
 * Bands are derived from each instrument's base so simulated prices cross them regularly.
 */
export type PriceThreshold = {
  symbol: string;
  high?: number;
  low?: number;
};

/** ~0.35% above/below base — tight enough for the mock random walk to cross often. */
const BAND_RATIO = 0.0035;

function roundThreshold(p: number): number {
  if (p < 1) return Math.round(p * 10000) / 10000;
  if (p < 1000) return Math.round(p * 100) / 100;
  return Math.round(p * 100) / 100;
}

export const DEFAULT_THRESHOLDS: PriceThreshold[] = INSTRUMENTS.map((inst) => {
  const p = inst.basePrice;
  const band = p * BAND_RATIO;
  return {
    symbol: inst.symbol,
    high: roundThreshold(p + band),
    low: roundThreshold(Math.max(p * 1e-6, p - band)),
  };
});

export type AlertEvent = {
  symbol: string;
  kind: "above" | "below";
  threshold: number;
  price: number;
  t: number;
};

const DEFAULT_COOLDOWN_MS = 25_000;

/**
 * Emits alerts when price crosses a threshold vs previous tick. Cooldown prevents spam per symbol+side.
 */
export function evaluateThresholdCrossings(
  symbol: string,
  price: number,
  prevPrice: number,
  thresholds: PriceThreshold[],
  lastFired: Map<string, number>,
  now: number,
  cooldownMs: number = DEFAULT_COOLDOWN_MS,
): AlertEvent[] {
  const rule = thresholds.find((t) => t.symbol === symbol);
  if (!rule) return [];
  const out: AlertEvent[] = [];

  if (rule.high !== undefined) {
    const crossed = prevPrice < rule.high && price >= rule.high;
    const key = `${symbol}:high`;
    if (crossed && now - (lastFired.get(key) ?? 0) >= cooldownMs) {
      lastFired.set(key, now);
      out.push({ symbol, kind: "above", threshold: rule.high, price, t: now });
    }
  }

  if (rule.low !== undefined) {
    const crossed = prevPrice > rule.low && price <= rule.low;
    const key = `${symbol}:low`;
    if (crossed && now - (lastFired.get(key) ?? 0) >= cooldownMs) {
      lastFired.set(key, now);
      out.push({ symbol, kind: "below", threshold: rule.low, price, t: now });
    }
  }

  return out;
}
