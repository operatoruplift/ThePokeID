import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_TILT,
  GENTLE_SPRING,
  LIVELY_SPRING,
  MAX_TILT,
  REDUCED_TILT,
  REST_POSE,
  cardTransform,
  isStill,
  poseForPointer,
  presentPose,
  shadowStyle,
  stepPose,
  travelScale,
  zeroPose,
} from "../src/lib/card-tilt.ts";

const lively = { maxTilt: DEFAULT_TILT, reducedMotion: false };

/** Runs the spring at 60fps until it settles, recording each frame. */
function simulate(from, target, spring, seconds = 3) {
  const current = { ...from };
  const velocity = zeroPose();
  const frames = [];
  for (let t = 0; t < seconds; t += 1 / 60) {
    const settled = stepPose(current, velocity, target, 1 / 60, spring);
    frames.push({ ...current });
    if (settled) return { frames, settled: true };
  }
  return { frames, settled: false };
}

test("a card turns to face the pointer, so the nearest edge comes toward the viewer", () => {
  const right = poseForPointer(1, 0.5, lively);
  assert.equal(right.rotateY, -DEFAULT_TILT);
  assert.equal(right.rotateX, 0);
  const top = poseForPointer(0.5, 0, lively);
  assert.equal(top.rotateX, -DEFAULT_TILT);
  const bottomLeft = poseForPointer(0, 1, lively);
  assert.equal(bottomLeft.rotateX, DEFAULT_TILT);
  assert.equal(bottomLeft.rotateY, DEFAULT_TILT);
});

test("a hovered card leans after the pointer, lifts, and pops; the light follows", () => {
  const pose = poseForPointer(0.9, 0.2, lively);
  assert.ok(pose.shiftX > 0, "moves toward a pointer on the right");
  assert.ok(pose.shiftY < 0, "moves toward a pointer near the top");
  assert.ok(pose.lift > 0);
  assert.ok(pose.scale > 1);
  assert.equal(pose.lightX, 0.9);
  assert.equal(pose.lightY, 0.2);
  assert.equal(pose.energy, 1);

  const centered = poseForPointer(0.5, 0.5, lively);
  assert.equal(centered.rotateX, 0);
  assert.equal(centered.rotateY, 0);
  assert.ok(centered.scale > 1, "even a centered pointer picks the card up");
});

test("pressing pushes the card back toward the page", () => {
  const hovered = poseForPointer(0.7, 0.7, lively);
  const pressed = poseForPointer(0.7, 0.7, { ...lively, pressed: true });
  assert.ok(pressed.scale < hovered.scale);
  assert.ok(pressed.lift < hovered.lift);
  assert.equal(pressed.rotateX, hovered.rotateX);
});

test("pointer positions and tilt requests are clamped", () => {
  const outside = poseForPointer(4, -3, lively);
  assert.deepEqual(outside, poseForPointer(1, 0, lively));
  assert.equal(poseForPointer(1, 0.5, { maxTilt: 90, reducedMotion: false }).rotateY, -MAX_TILT);
  assert.deepEqual(poseForPointer(Number.NaN, Number.NaN, lively), poseForPointer(0.5, 0.5, lively));
});

test("reduced motion keeps a small direct tilt without travel, lift, or pop", () => {
  const pose = poseForPointer(1, 0, { maxTilt: DEFAULT_TILT, reducedMotion: true });
  assert.equal(Math.abs(pose.rotateX), REDUCED_TILT);
  assert.equal(Math.abs(pose.rotateY), REDUCED_TILT);
  assert.equal(pose.shiftX, 0);
  assert.equal(pose.shiftY, 0);
  assert.equal(pose.lift, 0);
  assert.equal(pose.scale, 1);

  const { frames, settled } = simulate(REST_POSE, pose, GENTLE_SPRING);
  assert.ok(settled);
  assert.ok(frames.every(frame => frame.rotateY >= pose.rotateY - 1e-9), "the gentle spring never overshoots");
});

test("a tilt of 0 keeps the card still while its shine follows the pointer", () => {
  const pose = poseForPointer(0.2, 0.8, { maxTilt: 0, reducedMotion: false });
  assert.ok(isStill(pose));
  assert.equal(pose.lightX, 0.2);
  assert.equal(pose.lightY, 0.8);
  assert.equal(shadowStyle(pose, 200, 280).opacity, "0", "a still card casts no lifted shadow");
  assert.ok(!isStill(poseForPointer(0.2, 0.8, lively)));
});

test("keyboard focus presents the card in a gentle three-quarter pose", () => {
  const pose = presentPose(lively);
  assert.ok(pose.lift > 0);
  assert.ok(pose.rotateY > 0 && pose.rotateY < DEFAULT_TILT);
  assert.ok(isStill(presentPose({ maxTilt: DEFAULT_TILT, reducedMotion: true })));
});

test("the lively spring reaches the pointer pose, overshoots, and wobbles back to rest", () => {
  const target = poseForPointer(1, 0.5, lively);
  const toPointer = simulate(REST_POSE, target, LIVELY_SPRING);
  assert.ok(toPointer.settled);
  assert.ok(toPointer.frames.length < 60, "settles within a second");
  assert.ok(toPointer.frames.some(frame => frame.rotateY < target.rotateY), "overshoots for a physical feel");
  assert.deepEqual(toPointer.frames.at(-1), target);

  const back = simulate(target, REST_POSE, LIVELY_SPRING);
  assert.ok(back.settled);
  assert.ok(back.frames.some(frame => frame.rotateY > 0), "swings past flat on release");
  assert.deepEqual(back.frames.at(-1), { ...REST_POSE });
});

test("the spring stays stable on long or invalid frames", () => {
  const current = { ...REST_POSE };
  const velocity = zeroPose();
  const target = poseForPointer(0, 0, lively);
  for (let i = 0; i < 40; i++) stepPose(current, velocity, target, 0.5, LIVELY_SPRING);
  for (const value of Object.values(current)) assert.ok(Number.isFinite(value));
  assert.ok(Math.abs(current.rotateX - target.rotateX) < 0.05);
  stepPose(current, velocity, target, Number.NaN, LIVELY_SPRING);
  for (const value of Object.values(current)) assert.ok(Number.isFinite(value));
});

test("transforms include size-aware perspective and keep large cards' travel modest", () => {
  const pose = poseForPointer(1, 0, lively);
  const small = cardTransform(pose, 200, 280);
  assert.match(small, /^perspective\(600px\) translate3d\([-\d.]+px, [-\d.]+px, 0\) rotateX\(-18deg\) rotateY\(-18deg\) scale\(1\.06\)$/);
  assert.match(cardTransform(pose, 56, 78), /^perspective\(240px\)/);

  assert.equal(travelScale(200), 1);
  assert.equal(travelScale(480), 0.5);
  // An inspector-sized card travels and grows no further than a 240px card of the same shape.
  const travel = (transform) => transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/).slice(1).map(Number);
  assert.deepEqual(travel(cardTransform(pose, 480, 670)), travel(cardTransform(pose, 240, 335)));
  assert.match(cardTransform(pose, 480, 670), /scale\(1\.03\)$/);
  assert.match(cardTransform(REST_POSE, 200, 280), /translate3d\(0px, 0px, 0\) rotateX\(0deg\) rotateY\(0deg\) scale\(1\)$/);
});
