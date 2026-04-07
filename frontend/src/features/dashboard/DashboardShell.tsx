import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { formatUsd } from "../../lib/formatUsd";
import { PriceChart } from "./components/PriceChart";
import { ThemeToggle } from "./components/ThemeToggle";
import { TickerList } from "./components/TickerList";
import { CHART_TIMEFRAMES, CHART_TIMEFRAME_ORDER, type ChartTimeframe } from "./chartTimeframe";
import { useMarketDashboard } from "./hooks/useMarketDashboard";
import "./DashboardPage.css";

export function DashboardShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>("1H");

  const {
    quotes,
    history,
    lastAlert,
    clearAlert,
    error,
    bootstrapping,
    historyLoading,
    wsConnected,
  } = useMarketDashboard(selectedSymbol, chartTimeframe);

  useEffect(() => {
    if (quotes.length > 0 && !quotes.some((q) => q.symbol === selectedSymbol)) {
      setSelectedSymbol(quotes[0]!.symbol);
    }
  }, [quotes, selectedSymbol]);

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  const selected = useMemo(
    () => quotes.find((t) => t.symbol === selectedSymbol) ?? quotes[0],
    [quotes, selectedSymbol],
  );

  const chartData = history;

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const prices = chartData.map((p) => p.price);
    const open = prices[0];
    const close = prices[prices.length - 1];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    return { open, high, low, close };
  }, [chartData]);

  const displaySymbol = selected?.symbol ?? selectedSymbol;
  const displayName = selected?.name ?? "—";

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__container dashboard__header-inner">
          <div className="dashboard__brand">
            <span className="dashboard__logo" aria-hidden />
            <div>
              <h1 className="dashboard__title">Trading desk</h1>
              <p className="dashboard__tagline">Live prices and charts in one place</p>
            </div>
          </div>
          <div className="dashboard__header-actions">
            {user && (
              <div className="dashboard__user" title={user.id}>
                <span className="dashboard__user-label">Signed in as</span>
                <span className="dashboard__user-email tabular">{user.email}</span>
              </div>
            )}
            <ThemeToggle />
            <button type="button" className="dashboard__sign-out" onClick={handleSignOut}>
              Sign out
            </button>
            <div className="dashboard__status">
              <span
                className={`dashboard__live${wsConnected ? "" : " dashboard__live--offline"}`}
                title={
                  wsConnected
                    ? "WebSocket connected — receiving live ticks"
                    : "WebSocket disconnected — prices may be stale"
                }
              >
                <span className="dashboard__live-dot" aria-hidden />
                {wsConnected ? "Live" : "Offline"}
              </span>
              <time className="dashboard__clock tabular" dateTime={new Date().toISOString()}>
                {new Date().toLocaleString(undefined, {
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard__body">
        <div className="dashboard__container">
          {error && (
            <p className="dashboard__error" role="alert">
              {error}
            </p>
          )}
          {bootstrapping && (
            <p className="dashboard__loading" aria-live="polite">
              Loading market data…
            </p>
          )}
          <p className="dashboard__intro">
            Choose a symbol from your watchlist to explore the chart and session stats. Prices update over WebSocket when
            connected.
          </p>
          {lastAlert && (
            <div
              key={lastAlert.id}
              className={`alert-toast alert-toast--${lastAlert.kind}`}
              role="status"
            >
              <span className="alert-toast__text">
                <strong>{lastAlert.symbol}</strong> — {lastAlert.message}
              </span>
              <button type="button" className="alert-toast__dismiss" onClick={clearAlert}>
                Dismiss
              </button>
            </div>
          )}
          <div className="dashboard__grid">
            <aside className="dashboard__sidebar">
              <TickerList tickers={quotes} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
            </aside>

            <main className="dashboard__main chart-column">
              <div className="resolution-row">
                <span className="resolution-row__label">Range</span>
                {CHART_TIMEFRAME_ORDER.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    className={`chip${chartTimeframe === tf ? " chip-on" : ""}`}
                    aria-pressed={chartTimeframe === tf}
                    onClick={() => setChartTimeframe(tf)}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <section className="dashboard__panel dashboard__panel--chart" aria-labelledby="chart-heading">
                <div className="dashboard__panel-bar">
                  <h2 id="chart-heading" className="visually-hidden">
                    Price chart for {displaySymbol}
                  </h2>
                  {stats && (
                    <dl className="stat-strip">
                      <div className="stat-strip__item">
                        <dt>Open</dt>
                        <dd className="tabular">{formatUsd(stats.open)}</dd>
                      </div>
                      <div className="stat-strip__item">
                        <dt>High</dt>
                        <dd className="tabular">{formatUsd(stats.high)}</dd>
                      </div>
                      <div className="stat-strip__item">
                        <dt>Low</dt>
                        <dd className="tabular">{formatUsd(stats.low)}</dd>
                      </div>
                      <div className="stat-strip__item">
                        <dt>Last</dt>
                        <dd className="tabular">{formatUsd(stats.close)}</dd>
                      </div>
                    </dl>
                  )}
                </div>
                <PriceChart
                  symbol={displaySymbol}
                  name={displayName}
                  data={chartData}
                  loading={historyLoading || bootstrapping}
                  rangeLabel={CHART_TIMEFRAMES[chartTimeframe].sessionLabel}
                />
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
