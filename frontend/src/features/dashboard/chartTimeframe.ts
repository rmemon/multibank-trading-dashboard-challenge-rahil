export type ChartTimeframe = "1H" | "1D" | "1W" | "1M";

/** Maps UI range → API params (`buildHistoricalSeries` walks back from now). */
export const CHART_TIMEFRAMES: Record<
  ChartTimeframe,
  { limit: number; stepSec: number; sessionLabel: string }
> = {
  /** ~1 minute bars for the last hour */
  "1H": { limit: 60, stepSec: 60, sessionLabel: "session" },
  /** Hourly samples for ~24h */
  "1D": { limit: 24, stepSec: 3600, sessionLabel: "24h" },
  /** Daily candles for ~7 days */
  "1W": { limit: 7, stepSec: 86_400, sessionLabel: "7d" },
  /** Daily candles for ~30 days */
  "1M": { limit: 30, stepSec: 86_400, sessionLabel: "30d" },
};

export const CHART_TIMEFRAME_ORDER: ChartTimeframe[] = ["1H", "1D", "1W", "1M"];

export function formatChartAxisLabel(ts: number, tf: ChartTimeframe): string {
  const d = new Date(ts);
  if (tf === "1H") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  if (tf === "1D") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
