/**
 * Market stream URL. In development, connect straight to the API port so Vite’s
 * HTTP proxy does not tunnel WebSockets (avoids noisy ECONNABORTED on reconnect/HMR).
 * Production: same-origin `/ws` unless `VITE_MARKET_WS_URL` is set.
 */
export function getMarketWebSocketUrl(token: string): string {
  const base = import.meta.env.VITE_MARKET_WS_URL?.replace(/\/$/, "");
  if (base) {
    return `${base}/ws?token=${encodeURIComponent(token)}`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}
