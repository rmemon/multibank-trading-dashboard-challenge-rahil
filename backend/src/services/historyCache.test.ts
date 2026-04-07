import test from "node:test";
import assert from "node:assert/strict";
import { HistoryCache } from "./historyCache.js";

test("HistoryCache returns cached value before TTL", () => {
  const c = new HistoryCache();
  c.set("k", { a: 1 }, 60_000);
  assert.deepEqual(c.get<{ a: number }>("k"), { a: 1 });
});

test("HistoryCache misses after TTL", async () => {
  const c = new HistoryCache();
  c.set("k", 42, 10);
  await new Promise((r) => setTimeout(r, 25));
  assert.equal(c.get("k"), undefined);
});
