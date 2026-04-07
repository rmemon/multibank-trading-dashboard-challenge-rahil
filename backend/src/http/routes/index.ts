import { Router } from "express";
import { alertsRouter } from "./alerts.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { tickersRouter } from "./tickers.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/tickers", tickersRouter);
apiRouter.use("/alerts", alertsRouter);
