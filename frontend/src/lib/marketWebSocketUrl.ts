/**
 * Market stream URL. In development, connect straight to the API port so Vite’s
 * HTTP proxy does not tunnel WebSockets (avoids noisy ECONNABORTED on reconnect/HMR).
 *
 * Production: if `VITE_API_BASE_URL` is set (separate API host), WebSocket uses
 * `wss://` on that same host. Same-origin deploy: leave both API env vars unset.
 */
function websocketBaseFromApiBase(): string | undefined {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    const wsProto = u.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${u.host}`;
  } catch {
    return undefined;
  }
}

export function getMarketWebSocketUrl(token: string): string {
  const explicit = import.meta.env.VITE_MARKET_WS_URL?.replace(/\/$/, "");
  if (explicit) {
    return `${explicit}/ws?token=${encodeURIComponent(token)}`;
  }
  const fromApi = websocketBaseFromApiBase();
  if (fromApi) {
    return `${fromApi}/ws?token=${encodeURIComponent(token)}`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
}
