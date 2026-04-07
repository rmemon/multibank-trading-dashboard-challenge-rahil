import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHistory, fetchTickers } from "../../../api/marketApi";
import { formatUsd } from "../../../lib/formatUsd";
import type { ChartPoint, TickerQuote } from "../../../types/market";
import { useAuth } from "../../auth/useAuth";
import { getStoredToken } from "../../auth/tokenStorage";
import { getMarketWebSocketUrl } from "../../../lib/marketWebSocketUrl";
import {
  CHART_TIMEFRAMES,
  type ChartTimeframe,
  formatChartAxisLabel,
} from "../chartTimeframe";

export function useMarketDashboard(selectedSymbol: string, chartTimeframe: ChartTimeframe) {
  const { isAuthenticated, isReady } = useAuth();
  const [quotes, setQuotes] = useState<TickerQuote[]>([]);
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [lastAlert, setLastAlert] = useState<{
    id: string;
    symbol: string;
    message: string;
    kind: "above" | "below";
    t: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const selectedRef = useRef(selectedSymbol);
  selectedRef.current = selectedSymbol;
  const timeframeRef = useRef(chartTimeframe);
  timeframeRef.current = chartTimeframe;
  const alertSeq = useRef(0);
  const clearAlert = useCallback(() => setLastAlert(null), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { tickers } = await fetchTickers();
        if (!cancelled) setQuotes(tickers);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load market data");
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadHist() {
      setHistoryLoading(true);
      const { limit, stepSec } = CHART_TIMEFRAMES[chartTimeframe];
      try {
        const data = await fetchHistory(selectedSymbol, { limit, stepSec });
        if (cancelled) return;
        const pts: ChartPoint[] = data.points.map((p) => ({
          t: formatChartAxisLabel(p.t, chartTimeframe),
          price: p.price,
          ts: p.t,
        }));
        setHistory(pts);
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    loadHist();
    return () => {
      cancelled = true;
    };
  }, [selectedSymbol, chartTimeframe]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;

    const token = getStoredToken();
    if (!token) return;

    const ws = new WebSocket(getMarketWebSocketUrl(token));

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);

    ws.onmessage = (ev) => {
      const raw = ev.data;
      const text = typeof raw === "string" ? raw : null;
      if (!text) return;

      let msg: {
        type?: string;
        symbol?: string;
        name?: string;
        price?: number;
        changePct?: number;
        t?: number;
        kind?: string;
        threshold?: number;
      };
      try {
        msg = JSON.parse(text) as typeof msg;
      } catch {
        return;
      }

      if (msg.type === "tick" && msg.symbol && typeof msg.price === "number" && typeof msg.changePct === "number") {
        setQuotes((prev) =>
          prev.map((q) =>
            q.symbol === msg.symbol
              ? { ...q, price: msg.price!, changePct: msg.changePct! }
              : q,
          ),
        );
        if (
          timeframeRef.current === "1H" &&
          msg.symbol === selectedRef.current &&
          typeof msg.t === "number"
        ) {
          setHistory((prev) => {
            const label = formatChartAxisLabel(msg.t!, "1H");
            const next = [...prev, { t: label, price: msg.price!, ts: msg.t }];
            if (next.length > 200) return next.slice(next.length - 200);
            return next;
          });
        }
        return;
      }

      if (msg.type === "alert" && msg.symbol) {
        const kind = msg.kind === "above" || msg.kind === "below" ? msg.kind : null;
        const threshold = Number(msg.threshold);
        const price = Number(msg.price);
        const t = Number(msg.t);
        if (
          !kind ||
          !Number.isFinite(threshold) ||
          !Number.isFinite(price) ||
          !Number.isFinite(t)
        ) {
          return;
        }
        const id = `a-${++alertSeq.current}-${t}-${msg.symbol}-${kind}`;
        setLastAlert({
          id,
          symbol: msg.symbol,
          kind,
          t,
          message: `${kind === "above" ? "Above" : "Below"} ${formatUsd(threshold)} — last ${formatUsd(price)}`,
        });
      }
    };

    return () => {
      ws.close();
      setWsConnected(false);
    };
  }, [isReady, isAuthenticated]);

  return {
    quotes,
    history,
    lastAlert,
    clearAlert,
    error,
    bootstrapping,
    historyLoading,
    wsConnected,
  };
}
