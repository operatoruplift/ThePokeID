import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { EXAMPLE_CARDS, cardById, dealPack, isChase } from "../src/data/cards.ts";

const assetRoot = new URL("../public/cards/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("sources.json", assetRoot), "utf8"));

test("every displayed card has a verified bundled scan instead of a remote or generated face", () => {
  assert.equal(new Set(EXAMPLE_CARDS.map(card => card.id)).size, EXAMPLE_CARDS.length);
  for (const card of EXAMPLE_CARDS) {
    assert.equal(cardById(card.id), card);
    for (const src of new Set([card.image, card.imageLarge])) {
      assert.ok(src.startsWith("/cards/"));
      const entry = manifest.assets.find(asset => asset.cardId === card.id && src === `/cards/${asset.file}`);
      assert.ok(entry, `No verified artwork source for ${card.id}`);
      assert.match(entry.source, /^https:\/\/github\.com\//);
      const bytes = readFileSync(new URL(entry.file, assetRoot));
      assert.ok(bytes.length > 1000);
      assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256, card.id);
    }
  }
});

test("the printed card back is present and matches its verified source", () => {
  const entry = manifest.assets.find(asset => asset.file === "back.jpg");
  assert.ok(entry);
  const bytes = readFileSync(new URL(entry.file, assetRoot));
  assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff");
  assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.sha256);
});

test("mixed-set demo packs stay deterministic and contain five distinct real cards with a final chase", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const pack = dealPack(seed);
    assert.equal(pack.length, 5);
    assert.equal(new Set(pack.map(card => card.id)).size, 5);
    assert.deepEqual(pack.map(card => card.id), dealPack(seed).map(card => card.id));
    assert.equal(isChase(pack[4]), true);
    assert.ok(pack.slice(0, 4).every(card => card.supertype === "Pokémon" && !isChase(card)));
    assert.ok(pack.every(card => EXAMPLE_CARDS.includes(card)));
  }
});
