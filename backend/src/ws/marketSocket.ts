import type { IncomingMessage } from "node:http";
import type { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { INSTRUMENTS } from "../market/instruments.js";
import { getMarketEngine } from "../market/marketEngine.js";
import { verifyAccessToken } from "../services/authService.js";

function extractToken(req: IncomingMessage): string | null {
  const host = req.headers.host ?? "localhost";
  const raw = req.url ?? "/";
  const url = new URL(raw, `http://${host}`);
  return url.searchParams.get("token");
}

/**
 * Authenticated market stream: `ws://host/ws?token=<jwt>`
 * Messages: `tick` (price updates), `alert` (threshold), `heartbeat`.
 */
export function attachMarketWebSocket(wss: WebSocketServer): void {
  const engine = getMarketEngine();

  wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
    const token = extractToken(req);
    if (!token) {
      socket.close(1008, "Unauthorized");
      return;
    }
    try {
      verifyAccessToken(token);
    } catch {
      socket.close(1008, "Unauthorized");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "welcome",
        symbols: INSTRUMENTS.map((i) => i.symbol),
      }),
    );

    const unsubTick = engine.onTick((tick) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "tick", ...tick }));
      }
    });

    const unsubAlert = engine.onAlert((alert) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "alert", ...alert }));
      }
    });

    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "heartbeat", t: Date.now() }));
      }
    }, 30_000);

    socket.on("close", () => {
      clearInterval(ping);
      unsubTick();
      unsubAlert();
    });
    socket.on("error", () => {
      clearInterval(ping);
      unsubTick();
      unsubAlert();
    });
  });
}
