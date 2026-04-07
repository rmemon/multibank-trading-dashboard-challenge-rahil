/**
 * Public health check (no auth). Used to wait for cold-started hosts (e.g. Render free tier).
 */
export function healthUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";
  return `${base}/api/health`;
}

export async function fetchServerHealth(timeoutMs: number): Promise<boolean> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(healthUrl(), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  } finally {
    clearTimeout(tid);
  }
}
