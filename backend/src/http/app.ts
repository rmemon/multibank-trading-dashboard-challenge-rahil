import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/index.js";

/** Comma-separated origins, e.g. `http://localhost:5173,https://app.example.com` */
function corsOrigin(): string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return "http://localhost:5173";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
}

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: corsOrigin(),
      credentials: true,
    }),
  );
  app.use("/api", apiRouter);
  return app;
}
