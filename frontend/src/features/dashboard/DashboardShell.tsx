import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { PriceChart } from "./components/PriceChart";
import { ThemeToggle } from "./components/ThemeToggle";
import { TickerList } from "./components/TickerList";
import { formatUsd, getMockChartPoints, MOCK_TICKERS } from "./mock/marketMock";
import "./DashboardPage.css";

export function DashboardShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState(MOCK_TICKERS[0]?.symbol ?? "AAPL");

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  const selected = useMemo(
    () => MOCK_TICKERS.find((t) => t.symbol === selectedSymbol) ?? MOCK_TICKERS[0],
    [selectedSymbol],
  );

  const chartData = useMemo(() => getMockChartPoints(selectedSymbol), [selectedSymbol]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    const prices = chartData.map((p) => p.price);
    const open = prices[0];
    const close = prices[prices.length - 1];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    return { open, high, low, close };
  }, [chartData]);

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
              <span className="dashboard__live" title="Connect WebSocket to enable live feed">
                <span className="dashboard__live-dot" aria-hidden />
                Live
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
          <p className="dashboard__intro">
            Choose a symbol from your watchlist to explore the chart and session stats.
          </p>
          <div className="dashboard__grid">
            <aside className="dashboard__sidebar">
              <TickerList
                tickers={MOCK_TICKERS}
                selectedSymbol={selectedSymbol}
                onSelect={setSelectedSymbol}
              />
            </aside>

            <main className="dashboard__main">
              <section className="dashboard__panel" aria-labelledby="chart-heading">
                <div className="dashboard__panel-bar">
                  <h2 id="chart-heading" className="visually-hidden">
                    Price chart for {selected.symbol}
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
                <PriceChart symbol={selected.symbol} name={selected.name} data={chartData} />
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
