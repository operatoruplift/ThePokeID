import assert from "node:assert/strict";
import { test } from "node:test";

import { loopPosition } from "../src/lib/loop.ts";

const pitch = 600;
const count = 3;

test("stories keep their spacing and order while the strip scrolls", () => {
  for (const offset of [0, 37.5, 599, 600, 1250, 1799.9]) {
    const xs = Array.from({ length: count }, (_, i) => loopPosition(i, offset, pitch, count));
    for (const x of xs) assert.ok(x >= -pitch && x < pitch * (count - 1), `x=${x} at offset ${offset}`);
    const sorted = [...xs].sort((a, b) => a - b);
    for (let i = 1; i < count; i++) assert.ok(Math.abs(sorted[i] - sorted[i - 1] - pitch) < 1e-9);
  }
});

test("a story leaving on the left comes back on the right after one full loop", () => {
  assert.equal(loopPosition(0, 0, pitch, count), 0);
  assert.equal(loopPosition(0, 600, pitch, count), -600);
  assert.equal(loopPosition(0, 600.5, pitch, count), 1199.5);
  assert.equal(loopPosition(1, 1800, pitch, count), loopPosition(1, 0, pitch, count));
  assert.equal(loopPosition(2, -600, pitch, count), loopPosition(2, 1200, pitch, count), "dragging backwards wraps too");
});

test("the strip always covers a view as wide as two stories", () => {
  for (let offset = 0; offset < pitch * count; offset += 7) {
    const xs = Array.from({ length: count }, (_, i) => loopPosition(i, offset, pitch, count));
    // Something starts at or before 0, and the stories run without a hole up to 2 pitches.
    assert.ok(Math.min(...xs) <= 0);
    assert.ok(Math.max(...xs) + pitch >= pitch * 2);
  }
});
