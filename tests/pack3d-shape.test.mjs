import assert from "node:assert/strict";
import { test } from "node:test";

import {
  COLUMNS,
  CRIMP,
  CRIMP_GAP,
  PACK_W,
  TEAR_V,
  TEAR_Y,
  peelStrip,
  surface,
  tearFront,
} from "../src/lib/pack3d/shape.ts";

const stride = COLUMNS + 1;
const at = (sheet, i, j) => {
  const k = (j * stride + i) * 3;
  return [sheet.positions[k], sheet.positions[k + 1], sheet.positions[k + 2]];
};

test("front and back sheets meet along the side seams and stay apart in the crimps", () => {
  const front = surface(0, TEAR_V, 40, 1);
  const back = surface(0, TEAR_V, 40, -1);
  for (let j = 0; j <= 40; j++) {
    const v = (TEAR_V * j) / 40;
    for (const i of [0, COLUMNS]) {
      const [, , zf] = at(front, i, j);
      const [, , zb] = at(back, i, j);
      assert.ok(zf - zb <= 2 * CRIMP_GAP + 1e-6, `seam opens at row ${j}`);
    }
    if (v < CRIMP) {
      // Crimped flat: every point of the band sits at the same small offset.
      for (let i = 0; i <= COLUMNS; i++) {
        assert.ok(Math.abs(at(front, i, j)[2] - CRIMP_GAP) < 1e-6);
        assert.ok(Math.abs(at(back, i, j)[2] + CRIMP_GAP) < 1e-6);
      }
    }
  }
  // The middle bulges out on both sides.
  const middle = Math.round(stride / 2);
  assert.ok(at(front, middle, 20)[2] > 0.1);
  assert.ok(at(back, middle, 20)[2] < -0.1);
});

test("the strip and the body share the torn edge exactly while the pack is sealed", () => {
  for (const side of [1, -1]) {
    const body = surface(0, TEAR_V, 40, side);
    const strip = surface(TEAR_V, 1, 8, side);
    let jagged = 0;
    for (let i = 0; i <= COLUMNS; i++) {
      const edge = at(body, i, 40);
      assert.deepEqual(at(strip, i, 0), edge, `edges part at column ${i}`);
      if (Math.abs(edge[1] - TEAR_Y) > 1e-4) jagged++;
    }
    assert.ok(jagged > COLUMNS / 2, "the torn edge should be jagged, not straight");
  }
});

test("each sheet faces outward", () => {
  for (const side of [1, -1]) {
    const sheet = surface(0, TEAR_V, 40, side);
    const { positions, indices } = sheet;
    for (let t = 0; t < indices.length; t += 3 * 97) {
      const [a, b, c] = [indices[t], indices[t + 1], indices[t + 2]].map((n) => [
        positions[n * 3],
        positions[n * 3 + 1],
        positions[n * 3 + 2],
      ]);
      const ux = b[0] - a[0];
      const uy = b[1] - a[1];
      const vx = c[0] - a[0];
      const vy = c[1] - a[1];
      const normalZ = ux * vy - uy * vx;
      assert.ok(Math.sign(normalZ) === side, `triangle ${t / 3} faces the wrong way`);
    }
  }
});

test("the tear runs from the notch to past the far edge", () => {
  assert.equal(tearFront(0), -PACK_W / 2);
  assert.ok(tearFront(1) > PACK_W / 2);
  assert.equal(tearFront(2), tearFront(1));
  assert.ok(tearFront(0.5) > tearFront(0.25));
});

test("peeling lifts only the strip behind the tear", () => {
  const strip = surface(TEAR_V, 1, 8, 1);
  const out = new Float32Array(strip.positions.length);
  const tearX = 0.2;
  peelStrip(strip.positions, out, tearX);
  const peeled = { positions: out };
  for (let i = 0; i <= COLUMNS; i++) {
    const x = (i / COLUMNS - 0.5) * PACK_W;
    const before = at(strip, i, 0);
    const after = at(peeled, i, 0);
    if (x >= tearX) {
      assert.deepEqual(after, before, `column ${i} moved ahead of the tear`);
      continue;
    }
    // Free foil rises off the perforation, more the further it is from the front.
    assert.ok(after[1] > before[1], `column ${i} did not lift`);
    if (tearX - x > 0.6) assert.ok(after[1] - before[1] > 0.1, `column ${i} barely lifted`);
  }
});

test("the peeling strip bends without stretching", () => {
  // A straight line along the perforation, two rows tall.
  const line = new Float32Array(stride * 2 * 3);
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i <= COLUMNS; i++) {
      const k = (j * stride + i) * 3;
      line[k] = (i / COLUMNS - 0.5) * PACK_W;
      line[k + 1] = TEAR_Y;
    }
  }
  const out = new Float32Array(line.length);
  const tearX = 0.35;
  peelStrip(line, out, tearX);
  let length = 0;
  let first = -1;
  for (let i = COLUMNS; i > 0; i--) {
    if ((i / COLUMNS - 0.5) * PACK_W >= tearX) continue;
    if (first < 0) first = i;
    length += Math.hypot(out[i * 3] - out[(i - 1) * 3], out[i * 3 + 1] - out[(i - 1) * 3 + 1]);
  }
  const straight = (first / COLUMNS) * PACK_W;
  assert.ok(Math.abs(length - straight) < 0.01, `foil stretched from ${straight} to ${length}`);
});

test("a fully torn strip is free along its whole length", () => {
  const strip = surface(TEAR_V, 1, 8, -1);
  const out = new Float32Array(strip.positions.length);
  peelStrip(strip.positions, out, tearFront(1));
  for (let i = 0; i <= COLUMNS; i++) {
    assert.ok(at({ positions: out }, i, 0)[1] > at(strip, i, 0)[1], `column ${i} is still attached`);
  }
});
