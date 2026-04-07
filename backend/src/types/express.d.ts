import type { AccessTokenPayload } from "../services/authService.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

export {};
