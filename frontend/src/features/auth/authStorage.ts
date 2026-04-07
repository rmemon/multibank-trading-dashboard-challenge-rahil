const AUTH_SESSION_KEY = "trading-dashboard-auth";

export function getSession(): boolean {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSession(): void {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
