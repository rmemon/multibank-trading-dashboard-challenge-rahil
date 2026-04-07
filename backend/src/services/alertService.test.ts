import test from "node:test";
import assert from "node:assert/strict";
import { evaluateThresholdCrossings } from "./alertService.js";

const thresholds = [{ symbol: "AAPL", high: 100, low: 90 }];

test("alert fires on upward cross of high", () => {
  const last = new Map<string, number>();
  const now = Date.now();
  const events = evaluateThresholdCrossings("AAPL", 100.5, 99, thresholds, last, now, 0);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.kind, "above");
});

test("cooldown suppresses repeat", () => {
  const last = new Map<string, number>();
  const t0 = Date.now();
  const e1 = evaluateThresholdCrossings("AAPL", 101, 99, thresholds, last, t0, 60_000);
  const e2 = evaluateThresholdCrossings("AAPL", 102, 101, thresholds, last, t0 + 100, 60_000);
  assert.equal(e1.length, 1);
  assert.equal(e2.length, 0);
});

test("downward cross of low", () => {
  const last = new Map<string, number>();
  const now = Date.now();
  const lowTh = [{ symbol: "AAPL", low: 90 }];
  const events = evaluateThresholdCrossings("AAPL", 89.5, 91, lowTh, last, now, 0);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.kind, "below");
});
