import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "../mock/marketMock";
import { formatUsd } from "../mock/marketMock";

type Props = {
  symbol: string;
  name: string;
  data: ChartPoint[];
};

type PointRow = ChartPoint & { _i: number };

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: {
  active?: boolean;
  // Recharts tooltip payload shape; we only read .payload per point
  payload?: ReadonlyArray<{ payload?: PointRow }>;
  label?: string | number;
  series: ChartPoint[];
}) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.payload;
  if (!raw) return null;
  const row = raw as PointRow;
  const idx = row._i;
  let deltaStr: string | null = null;
  if (idx > 0) {
    const prev = series[idx - 1];
    const d = row.price - prev.price;
    const pct = (d / prev.price) * 100;
    const up = d >= 0;
    deltaStr = `${up ? "+" : ""}${formatUsd(Math.abs(d))} (${up ? "+" : ""}${pct.toFixed(3)}%)`;
  }

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__row chart-tooltip__row--label">
        <span className="chart-tooltip__badge">Price</span>
        <span className="chart-tooltip__time">{String(label ?? row.t)}</span>
      </div>
      <span className="chart-tooltip__price tabular">{formatUsd(row.price)}</span>
      {deltaStr && <span className="chart-tooltip__delta tabular">{deltaStr}</span>}
    </div>
  );
}

export function PriceChart({ symbol, name, data }: Props) {
  const chartRows = useMemo(
    () => data.map((p, i) => ({ ...p, _i: i })) as PointRow[],
    [data],
  );

  const { up, lastPrice, sessionChangePct, stroke, strokeRgb } = useMemo(() => {
    if (data.length < 2) {
      return {
        up: true,
        lastPrice: data[0]?.price ?? 0,
        sessionChangePct: 0,
        stroke: "var(--chart-up)",
        strokeRgb: "52, 211, 153",
      };
    }
    const first = data[0].price;
    const last = data[data.length - 1].price;
    const u = last >= first;
    const sessionChangePct = ((last - first) / first) * 100;
    return {
      up: u,
      lastPrice: last,
      sessionChangePct,
      stroke: u ? "var(--chart-up)" : "var(--chart-down)",
      strokeRgb: u ? "52, 211, 153" : "251, 113, 133",
    };
  }, [data]);

  const fillId = `area-${symbol.replace(/[^a-zA-Z0-9]/g, "")}`;
  const lastIdx = Math.max(0, chartRows.length - 1);

  const renderLastDot = useMemo(() => {
    const Dot = (props: { cx?: number; cy?: number; index?: number }) => {
      const { cx, cy, index } = props;
      if (cx == null || cy == null || index !== lastIdx) return null;
      return (
        <g className="price-chart__last-dot">
          <circle cx={cx} cy={cy} r={10} fill={`rgba(${strokeRgb}, 0.22)`} />
          <circle cx={cx} cy={cy} r={5} fill="var(--chart-surface)" stroke={stroke} strokeWidth={2.5} />
          <circle cx={cx} cy={cy} r={2.5} fill={stroke} />
        </g>
      );
    };
    return Dot;
  }, [lastIdx, stroke, strokeRgb]);

  return (
    <div className="price-chart">
      <div className="price-chart__toolbar">
        <div className="price-chart__identity">
          <h2 className="price-chart__symbol">{symbol}</h2>
          <p className="price-chart__name">{name}</p>
        </div>

        <div className="price-chart__quote" aria-live="polite">
          <span className="price-chart__last tabular">{formatUsd(lastPrice)}</span>
          <span className={`price-chart__session${up ? " price-chart__session--up" : " price-chart__session--down"}`}>
            {sessionChangePct >= 0 ? "+" : ""}
            {sessionChangePct.toFixed(2)}% <span className="price-chart__session-label">session</span>
          </span>
        </div>

        <div className="price-chart__tf" role="group" aria-label="Time range (preview)">
          {["1H", "1D", "1W", "1M"].map((tf, i) => (
            <span key={tf} className={`price-chart__tf-pill${i === 0 ? " price-chart__tf-pill--active" : ""}`}>
              {tf}
            </span>
          ))}
        </div>
      </div>

      <div
        className="price-chart__frame"
        role="img"
        aria-label={`Price chart for ${symbol}, ${chartRows.length} points`}
      >
        <div className="price-chart__canvas">
          <ResponsiveContainer width="100%" height="100%" minHeight={340}>
            <ComposedChart data={chartRows} margin={{ top: 16, right: 8, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
                  <stop offset="50%" stopColor={stroke} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Fine "graph paper" grid — faint, behind major grid */}
              <CartesianGrid
                yAxisId="price"
                horizontal
                vertical
                stroke="var(--chart-grid-line-faint)"
                strokeOpacity={1}
                strokeDasharray="2 5"
                fill="none"
                horizontalCoordinatesGenerator={({ offset }) => {
                  const { top, height } = offset;
                  const n = 11;
                  return Array.from({ length: n - 1 }, (_, i) => top + (height * (i + 1)) / n);
                }}
                verticalCoordinatesGenerator={({ offset }) => {
                  const { left, width } = offset;
                  const n = 13;
                  return Array.from({ length: n - 1 }, (_, i) => left + (width * (i + 1)) / n);
                }}
              />

              {/* Major grid locked to axis ticks + alternating price rows (stock-terminal look) */}
              <CartesianGrid
                yAxisId="price"
                syncWithTicks
                horizontal
                vertical
                stroke="var(--chart-grid-line)"
                strokeOpacity={0.95}
                fill="none"
                horizontalFill={["var(--chart-band-a)", "var(--chart-band-b)"]}
              />

              <XAxis
                dataKey="t"
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "var(--chart-axis)" }}
                interval="preserveStartEnd"
                minTickGap={28}
                dy={6}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={["auto", "auto"]}
                tickCount={8}
                tick={{ fill: "var(--text-muted)", fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "var(--chart-axis)" }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(2)}k` : v.toFixed(v < 1 ? 4 : 2)
                }
                width={68}
                dx={4}
              />

              <ReferenceLine
                yAxisId="price"
                y={lastPrice}
                stroke={stroke}
                strokeDasharray="5 5"
                strokeOpacity={0.4}
                strokeWidth={1}
              />

              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    active={props.active}
                    payload={props.payload}
                    label={props.label}
                    series={data}
                  />
                )}
                cursor={{
                  stroke: "rgba(148, 163, 184, 0.5)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                wrapperStyle={{ outline: "none" }}
                isAnimationActive={false}
              />

              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="none"
                fill={`url(#${fillId})`}
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={720}
                animationEasing="ease-out"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={2.5}
                dot={renderLastDot}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "var(--chart-surface)",
                  fill: stroke,
                }}
                isAnimationActive={true}
                animationDuration={720}
                animationEasing="ease-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
