import assert from "node:assert/strict";
import { test } from "node:test";

import { Tweens, easeOutBack, linear, springStep } from "../src/lib/pack3d/tween.ts";

test("tweens run on the stage clock, after their delay, and land exactly on 1", async () => {
  const tweens = new Tweens();
  const seen = [];
  const done = tweens.add(1, linear, (k) => seen.push(k), { delay: 0.5 });
  tweens.update(0.25);
  assert.deepEqual(seen, []);
  tweens.update(0.5);
  assert.equal(seen.at(-1), 0.25);
  tweens.update(10);
  assert.equal(seen.at(-1), 1);
  assert.equal(await done, true);
  assert.equal(tweens.size, 0);
});

test("a keyed tween replaces the one before it, which reports it was cut short", async () => {
  const tweens = new Tweens();
  let value = 0;
  const first = tweens.add(1, linear, (k) => (value = k), { key: "card.x" });
  const second = tweens.add(1, linear, (k) => (value = 10 * k), { key: "card.x" });
  tweens.update(0.5);
  assert.equal(value, 5);
  assert.equal(await first, false);
  tweens.cancelAll("card");
  assert.equal(await second, false);
  assert.equal(tweens.size, 0);
});

test("one tween's delay does not slow the others in the same frame", () => {
  const tweens = new Tweens();
  let a = 0;
  let b = 0;
  tweens.add(1, linear, (k) => (a = k), { delay: 0.2 });
  tweens.add(1, linear, (k) => (b = k));
  tweens.update(0.5);
  assert.ok(Math.abs(a - 0.3) < 1e-9);
  assert.equal(b, 0.5);
});

test("springs settle on their target, and easeOutBack overshoots before landing", () => {
  const state = { value: 0, velocity: 0 };
  let peak = 0;
  for (let i = 0; i < 240; i++) peak = Math.max(peak, springStep(state, 1, 200, 12, 1 / 60));
  assert.ok(peak > 1, "an underdamped spring should overshoot");
  assert.ok(Math.abs(state.value - 1) < 1e-3);
  // A single long frame is split into small steps instead of exploding.
  const slow = { value: 0, velocity: 0 };
  springStep(slow, 1, 200, 12, 1);
  assert.ok(Math.abs(slow.value) < 2);

  const ease = easeOutBack();
  assert.equal(ease(0), 0);
  assert.ok(Math.abs(ease(1) - 1) < 1e-12);
  assert.ok(Math.max(...Array.from({ length: 99 }, (_, i) => ease((i + 1) / 100))) > 1);
});
