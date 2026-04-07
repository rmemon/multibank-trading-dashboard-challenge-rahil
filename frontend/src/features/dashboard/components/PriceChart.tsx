import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUsd } from "../../../lib/formatUsd";
import type { ChartPoint } from "../../../types/market";

type Props = {
  symbol: string;
  name: string;
  data: ChartPoint[];
  loading?: boolean;
  /** Shown next to % change (e.g. session, 24h, 7d) */
  rangeLabel: string;
};

type Row = { t: string; price: number; label: string };

/**
 * Reference coding-challenge layout: `panel-head` + `chart-wrap`, ComposedChart with
 * Area (fill) + Line (stroke) for a clear price path.
 */
export function PriceChart({ symbol, name, data, loading, rangeLabel }: Props) {
  const rows = useMemo<Row[]>(
    () => data.map((p) => ({ t: p.t, price: p.price, label: p.t })),
    [data],
  );

  const { lastPrice, deltaPct, up } = useMemo(() => {
    if (!data.length) {
      return { lastPrice: null as number | null, deltaPct: 0, up: true };
    }
    const last = data[data.length - 1]!.price;
    const first = data[0]!.price;
    const deltaPct = first !== 0 ? ((last - first) / first) * 100 : 0;
    return { lastPrice: last, deltaPct, up: last >= first };
  }, [data]);

  return (
    <div className="chart-panel-root">
      <div className="panel-head chart-head">
        <div>
          <h2 className="chart-panel__title">{symbol}</h2>
          {name && name !== "—" && <p className="chart-panel__subtitle">{name}</p>}
        </div>
        {lastPrice != null && data.length > 0 && (
          <div className="chart-stat">
            <span className="chart-stat__last tabular">{formatUsd(lastPrice)}</span>
            <span className={`chart-stat__chg${up ? " chart-stat__chg--up" : " chart-stat__chg--down"}`}>
              {deltaPct >= 0 ? "+" : ""}
              {deltaPct.toFixed(2)}% <span className="chart-stat__range">{rangeLabel}</span>
            </span>
          </div>
        )}
      </div>

      <div className="chart-wrap">
        {data.length === 0 ? (
          <p className="chart-wrap__empty">{loading ? "Loading chart…" : "No data for this symbol."}</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-series)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-series)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-dim)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                minTickGap={24}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                width={64}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(2)}k` : v.toFixed(v < 1 ? 4 : 2)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "var(--text-muted)" }}
                formatter={(value) => [
                  typeof value === "number" ? formatUsd(value) : "—",
                  "Price",
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="none"
                fill="url(#fillPrice)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--chart-series)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
