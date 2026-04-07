/**
 * Short TTL cache for historical series responses (bonus: caching for historical data).
 */
type CacheEntry<T> = { value: T; expiresAt: number };

export class HistoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const e = this.store.get(key) as CacheEntry<T> | undefined;
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** For tests */
  clear(): void {
    this.store.clear();
  }
}

export const historyCache = new HistoryCache();
