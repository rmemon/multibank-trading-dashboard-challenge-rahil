import { createContext } from "react";
import type { AuthUser } from "../../api/authApi";

export type AuthContextValue = {
  isAuthenticated: boolean;
  /** False until initial token validation (or no token) has finished */
  isReady: boolean;
  /** Current user from login or GET /api/auth/me */
  user: AuthUser | null;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
