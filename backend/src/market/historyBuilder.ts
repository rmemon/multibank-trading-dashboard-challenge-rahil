import { getInstrument } from "./instruments.js";

export type HistoryPoint = { t: number; price: number };

/**
 * Deterministic mocked OHLC-style series ending near `now` (for tests & cache keys).
 */
export function buildHistoricalSeries(
  symbol: string,
  now: number,
  count: number,
  stepMs: number,
): HistoryPoint[] {
  const inst = getInstrument(symbol);
  const mid = inst?.basePrice ?? 100;
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const points: HistoryPoint[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * stepMs;
    const phase = (i + seed) * 0.18;
    const wobble = Math.sin(phase) * mid * 0.004 + Math.cos(phase * 0.7) * mid * 0.002;
    const price = Math.max(0.0001, mid + wobble + (i / count - 0.5) * mid * 0.006);
    points.push({ t, price });
  }
  return points;
}
