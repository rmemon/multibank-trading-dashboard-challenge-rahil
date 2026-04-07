import {
  DEFAULT_THRESHOLDS,
  evaluateThresholdCrossings,
  type AlertEvent,
} from "../services/alertService.js";
import { historyCache } from "../services/historyCache.js";
import { buildHistoricalSeries } from "./historyBuilder.js";
import { getInstrument, INSTRUMENTS } from "./instruments.js";

export type QuoteSnapshot = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

export type TickPayload = QuoteSnapshot & { t: number };

const HISTORY_CACHE_TTL_MS = 60_000;
const TICK_INTERVAL_MS = Number(process.env.MARKET_TICK_MS) || 2000;

export class MarketEngine {
  private prices = new Map<string, number>();
  private prevPrices = new Map<string, number>();
  private opens = new Map<string, number>();
  private tickListeners = new Set<(tick: TickPayload) => void>();
  private alertListeners = new Set<(a: AlertEvent) => void>();
  private alertCooldown = new Map<string, number>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    for (const inst of INSTRUMENTS) {
      this.prices.set(inst.symbol, inst.basePrice);
      this.prevPrices.set(inst.symbol, inst.basePrice);
      this.opens.set(inst.symbol, inst.basePrice);
    }
  }

  getQuotes(): QuoteSnapshot[] {
    return INSTRUMENTS.map((inst) => {
      const price = this.prices.get(inst.symbol) ?? inst.basePrice;
      const open = this.opens.get(inst.symbol) ?? inst.basePrice;
      const changePct = open !== 0 ? ((price - open) / open) * 100 : 0;
      return {
        symbol: inst.symbol,
        name: inst.name,
        price,
        changePct,
      };
    });
  }

  getHistorical(symbol: string, count: number, stepMs: number): { interval: string; points: { t: number; price: number }[] } {
    if (!getInstrument(symbol)) {
      throw new Error("Unknown symbol");
    }
    const cacheKey = `hist:${symbol}:${count}:${stepMs}`;
    const cached = historyCache.get<{ interval: string; points: { t: number; price: number }[] }>(cacheKey);
    if (cached) {
      return cached;
    }
    const now = Date.now();
    const points = buildHistoricalSeries(symbol, now, count, stepMs);
    const payload = { interval: `${stepMs / 1000}s`, points };
    historyCache.set(cacheKey, payload, HISTORY_CACHE_TTL_MS);
    return payload;
  }

  onTick(fn: (tick: TickPayload) => void): () => void {
    this.tickListeners.add(fn);
    return () => this.tickListeners.delete(fn);
  }

  onAlert(fn: (a: AlertEvent) => void): () => void {
    this.alertListeners.add(fn);
    return () => this.alertListeners.delete(fn);
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.emitTick(), TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private emitTick(): void {
    const now = Date.now();
    for (const inst of INSTRUMENTS) {
      const sym = inst.symbol;
      const prev = this.prices.get(sym) ?? inst.basePrice;
      this.prevPrices.set(sym, prev);
      /* Intraday-style microstructure: small Gaussian-ish noise + slow macro drift. */
      const noise = (Math.random() - 0.5) * prev * 0.0016;
      const drift = Math.sin(now / 42_000 + sym.length * 1.7) * prev * 0.00045;
      let next = Math.max(0.0001, prev + noise + drift);
      this.prices.set(sym, next);

      const open = this.opens.get(sym) ?? inst.basePrice;
      const changePct = open !== 0 ? ((next - open) / open) * 100 : 0;

      const tick: TickPayload = {
        symbol: sym,
        name: inst.name,
        price: next,
        changePct,
        t: now,
      };

      for (const fn of this.tickListeners) {
        fn(tick);
      }

      const alerts = evaluateThresholdCrossings(
        sym,
        next,
        prev,
        DEFAULT_THRESHOLDS,
        this.alertCooldown,
        now,
      );
      for (const a of alerts) {
        for (const fn of this.alertListeners) {
          fn(a);
        }
      }
    }
  }
}

let engineSingleton: MarketEngine | null = null;

export function getMarketEngine(): MarketEngine {
  if (!engineSingleton) {
    engineSingleton = new MarketEngine();
  }
  return engineSingleton;
}
