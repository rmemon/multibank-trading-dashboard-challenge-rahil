import { useEffect, useState, type ReactNode } from "react";
import { fetchServerHealth } from "../lib/serverHealth";
import "./ServerReadyGate.css";

const POLL_MS = 2500;
/** Per attempt: cold start on free hosts can exceed 10s */
const HEALTH_TIMEOUT_MS = 28000;

export function ServerReadyGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function waitForServer() {
      while (!cancelled) {
        const ok = await fetchServerHealth(HEALTH_TIMEOUT_MS);
        if (cancelled) return;
        if (ok) {
          setReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    }

    waitForServer();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <ServerReadySplash />;
  }

  return <>{children}</>;
}

function ServerReadySplash() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="server-ready" role="status" aria-live="polite" aria-busy="true">
      <div className="server-ready-inner">
        <div className="server-ready-spinner-wrap" aria-hidden>
          <div className="server-ready-spinner" />
        </div>
        <h1 className="server-ready-title">Connecting to the API</h1>
        <p className="server-ready-body">
          Checking that the trading dashboard backend is reachable. If the demo server was idle, it may need a
          moment to start.
        </p>
        <p className="server-ready-hint">
          Free hosting can take up to a minute to wake from sleep. This page will continue until the server
          responds.
        </p>
        <div className="server-ready-pulse" aria-hidden>
          <span className="server-ready-dot" />
          <span className="server-ready-dot" />
          <span className="server-ready-dot" />
        </div>
        <p className="server-ready-elapsed">Waiting {seconds}s…</p>
      </div>
    </div>
  );
}
