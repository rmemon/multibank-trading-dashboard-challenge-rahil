import "dotenv/config";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createApp } from "./http/app.js";
import { attachMarketWebSocket } from "./ws/marketSocket.js";

const port = Number(process.env.PORT) || 3001;

const app = createApp();
const server = createServer(app);

const wss = new WebSocketServer({ server, path: "/ws" });
attachMarketWebSocket(wss);

server.listen(port, () => {
  console.log(`HTTP + WebSocket listening on http://localhost:${port} (WS path /ws)`);
});
