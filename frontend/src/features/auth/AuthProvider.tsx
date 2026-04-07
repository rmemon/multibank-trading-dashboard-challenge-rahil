import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCurrentUser, type AuthUser } from "../../api/authApi";
import { AuthContext } from "./authContext";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const t = getStoredToken();
      if (!t) {
        setIsReady(true);
        return;
      }
      const u = await fetchCurrentUser(t);
      if (cancelled) return;
      if (!u) {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } else {
        setUser(u);
      }
      setIsReady(true);
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = () => {
      const t = getStoredToken();
      setToken(t);
      if (!t) setUser(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((accessToken: string, nextUser: AuthUser) => {
    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = isReady && Boolean(token);

  const value = useMemo(
    () => ({ isAuthenticated, isReady, user, login, logout }),
    [isAuthenticated, isReady, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
