import { getStoredToken } from "../features/auth/tokenStorage";

const base = import.meta.env.VITE_API_BASE_URL ?? "";

export type AuthUser = {
  id: string;
  email: string;
};

export type LoginResponse = {
  tokenType: string;
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : "Login failed";
    throw new Error(msg);
  }
  return data as LoginResponse;
}

/** Returns the current user if the token is valid, otherwise null */
export async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data: unknown = await res.json().catch(() => null);
  if (
    typeof data === "object" &&
    data !== null &&
    "user" in data &&
    typeof (data as { user: unknown }).user === "object" &&
    (data as { user: unknown }).user !== null
  ) {
    const u = (data as { user: { id?: unknown; email?: unknown } }).user;
    if (typeof u.id === "string" && typeof u.email === "string") {
      return { id: u.id, email: u.email };
    }
  }
  return null;
}

/** Authorized GET (uses stored token). */
export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, { ...init, headers });
}
