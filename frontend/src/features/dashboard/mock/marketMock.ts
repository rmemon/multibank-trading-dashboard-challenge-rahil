/**
 * Mock market data for UI design. Replace with API / WebSocket later.
 */

export type TickerQuote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

export type ChartPoint = {
  t: string;
  price: number;
};

export const MOCK_TICKERS: TickerQuote[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.42, changePct: 1.24 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 242.18, changePct: -0.86 },
  { symbol: "BTC-USD", name: "Bitcoin", price: 67234.5, changePct: 2.31 },
  { symbol: "ETH-USD", name: "Ethereum", price: 3245.67, changePct: 0.45 },
  { symbol: "XRP-USD", name: "Ripple", price: 0.5234, changePct: -1.12 },
];

/** Synthetic intraday series for chart preview (deterministic per symbol). */
export function getMockChartPoints(symbol: string, count = 72): ChartPoint[] {
  const quote = MOCK_TICKERS.find((q) => q.symbol === symbol);
  const mid = quote?.price ?? 100;
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const points: ChartPoint[] = [];
  const now = Date.now();
  const stepMs = 60_000;

  for (let i = count - 1; i >= 0; i--) {
    const phase = (i + seed) * 0.18;
    const wobble = Math.sin(phase) * mid * 0.004 + Math.cos(phase * 0.7) * mid * 0.002;
    const price = Math.max(0.0001, mid + wobble + (i / count - 0.5) * mid * 0.006);
    const d = new Date(now - i * stepMs);
    points.push({
      t: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
      price,
    });
  }
  return points;
}

export function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const maxFrac = abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maxFrac,
    maximumFractionDigits: maxFrac,
  }).format(value);
}
