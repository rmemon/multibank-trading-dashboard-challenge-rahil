import { Router } from "express";
import { DEFAULT_THRESHOLDS } from "../../services/alertService.js";
import { authenticate } from "../../middleware/authenticate.js";

export const alertsRouter = Router();

/** GET /api/alerts/thresholds — read-only demo thresholds */
alertsRouter.get("/thresholds", authenticate, (_req, res) => {
  res.json({ thresholds: DEFAULT_THRESHOLDS });
});
