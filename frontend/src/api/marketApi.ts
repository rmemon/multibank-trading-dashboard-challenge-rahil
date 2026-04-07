import { authFetch } from "./authApi";
import type { TickerQuote } from "../types/market";

export async function fetchTickers(): Promise<{ tickers: TickerQuote[] }> {
  const res = await authFetch("/api/tickers");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = typeof err?.error === "string" ? err.error : "Could not load tickers";
    throw new Error(msg);
  }
  return res.json();
}

export type HistoryResponse = {
  symbol: string;
  interval: string;
  points: { t: number; price: number }[];
};

export async function fetchHistory(
  symbol: string,
  options?: { limit?: number; stepSec?: number },
): Promise<HistoryResponse> {
  const limit = options?.limit ?? 72;
  const stepSec = options?.stepSec ?? 60;
  const q = new URLSearchParams({
    limit: String(limit),
    stepSec: String(stepSec),
  });
  const res = await authFetch(`/api/tickers/${encodeURIComponent(symbol)}/history?${q}`);
  if (!res.ok) {
    throw new Error("Could not load chart history");
  }
  return res.json();
}
