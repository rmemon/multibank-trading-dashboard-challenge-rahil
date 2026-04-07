import type { WebSocketServer } from "ws";
import { WebSocket } from "ws";

/** WebSocket at `/ws` — placeholder; real-time messages added in later steps. */
export function attachMarketWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "welcome",
        message: "Connected.",
      }),
    );

    const ping = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "heartbeat", t: Date.now() }));
      }
    }, 30_000);

    socket.on("close", () => clearInterval(ping));
    socket.on("error", () => clearInterval(ping));
  });
}
