import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/authService.js";

/**
 * Requires `Authorization: Bearer <jwt>`. Attaches `req.auth` with `{ sub, email }`.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
