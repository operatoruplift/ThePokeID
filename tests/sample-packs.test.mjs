import assert from "node:assert/strict";
import { test } from "node:test";

import {
  SAMPLE_PACKS,
  TEAR_DEPTH,
  bodyClipPath,
  packForSeed,
  stripClipPath,
  tearProfile,
} from "../src/lib/sample-packs.ts";

test("each pack tile opens its own named pack; other seeds get a numbered sample pack", () => {
  assert.equal(new Set(SAMPLE_PACKS.map((pack) => pack.seed)).size, SAMPLE_PACKS.length);
  for (const pack of SAMPLE_PACKS) assert.equal(packForSeed(pack.seed), pack);

  const next = packForSeed(2);
  assert.equal(next.name, "Sample pack 02");
  assert.equal(next.seed, 2);
  assert.ok(["aurora", "eclipse"].includes(next.finish));
  assert.deepEqual(packForSeed(2), next, "the same seed always gives the same pack");
});

test("a sealed pack's strip and body meet exactly along the tear", () => {
  const tear = tearProfile();
  assert.ok(tear.every((depth) => depth >= 0 && depth <= TEAR_DEPTH));

  const strip = stripClipPath(14, 7, tear);
  const body = bodyClipPath(14, 7, tear);
  // The strip's torn edge sits `offset` px above its bottom; the body's dips `depth` px below its top.
  const stripEdge = new Map(
    [...strip.matchAll(/([\d.]+)% calc\(100% - ([\d.]+)px\)/g)].map((m) => [m[1], Number(m[2])]),
  );
  const bodyEdge = [...body.matchAll(/([\d.]+)% ([\d.]+)px/g)].map((m) => [m[1], Number(m[2])]);

  assert.equal(bodyEdge.length, tear.length);
  assert.equal(stripEdge.size, tear.length);
  for (const [x, depth] of bodyEdge) {
    assert.ok(stripEdge.has(x), `strip has no point at ${x}%`);
    // The body starts TEAR_DEPTH above the strip's bottom, so the edges coincide.
    assert.ok(Math.abs(stripEdge.get(x) + depth - TEAR_DEPTH) < 0.011, `gap or overlap at ${x}%`);
  }
});

test("pack edges are crimped with evenly spaced teeth", () => {
  const strip = stripClipPath(14, 7);
  const teeth = [...strip.matchAll(/([\d.]+)% (0|7)px/g)];
  assert.equal(teeth.length, 29, "14 teeth need 29 points across the top");
  assert.equal(teeth[0][2], "7");
  assert.equal(teeth[1][2], "0");
  assert.equal(teeth.at(-1)[1], "100.00");
});
