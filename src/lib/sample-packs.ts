/** The example packs on the desk, shared by the pack tiles and the rip. */

export type PackFinish = "aurora" | "eclipse";

export type SamplePack = {
  name: string;
  line: string;
  seed: number;
  finish: PackFinish;
};

export const SAMPLE_PACKS: readonly SamplePack[] = [
  { name: "The 30", line: "A new favourite awaits", seed: 1, finish: "aurora" },
  { name: "Night rip", line: "Five cards to discover", seed: 7, finish: "eclipse" },
  { name: "Classic desk", line: "From across the collection", seed: 13, finish: "aurora" },
  { name: "Chase sleeve", line: "Save the last card for the hit", seed: 19, finish: "eclipse" },
];

/** The named pack for a seed, or a numbered sample pack for "rip another". */
export function packForSeed(seed: number): SamplePack {
  const named = SAMPLE_PACKS.find((pack) => pack.seed === seed);
  if (named) return named;
  return {
    name: `Sample pack ${String(seed).padStart(2, "0")}`,
    line: "Five cards. The last one is the hit.",
    seed,
    finish: seed % 2 === 0 ? "eclipse" : "aurora",
  };
}

/** Height of the torn band between a pack's top strip and its body, in px. */
export const TEAR_DEPTH = 3;

/**
 * The tear between a pack's top strip and body: small irregular teeth, so the
 * strip and body interlock while sealed and show torn edges once pulled apart.
 * Each value is how far the edge dips into the torn band, from 0 to TEAR_DEPTH.
 */
export function tearProfile(points = 26): number[] {
  // A fixed pattern keeps server and client renders identical.
  const pattern = [0.2, 0.9, 0.4, 1, 0.1, 0.7, 0.3, 0.95, 0.5, 0.15, 0.8, 0.35, 0.65];
  return Array.from({ length: points + 1 }, (_, i) => Number((pattern[i % pattern.length] * TEAR_DEPTH).toFixed(2)));
}

const pct = (i: number, n: number) => `${((i / n) * 100).toFixed(2)}%`;

/**
 * clip-path for the top strip: crimped top edge, torn bottom edge. The strip's
 * bottom edge sits at `100% - (TEAR_DEPTH - d)`, exactly where the body's top
 * edge begins, so the two halves meet without a gap while the pack is sealed.
 */
export function stripClipPath(teeth = 14, crimp = 7, tear = tearProfile()) {
  const top = Array.from({ length: teeth * 2 + 1 }, (_, i) => `${pct(i, teeth * 2)} ${i % 2 === 0 ? crimp : 0}px`);
  const n = tear.length - 1;
  const bottom = tear
    .map((d, i) => `${pct(i, n)} calc(100% - ${Number((TEAR_DEPTH - d).toFixed(2))}px)`)
    .reverse();
  return `polygon(${[...top, ...bottom].join(", ")})`;
}

/**
 * clip-path for the pack body, which starts TEAR_DEPTH above the strip's bottom:
 * torn top edge matching the strip, crimped bottom edge.
 */
export function bodyClipPath(teeth = 14, crimp = 7, tear = tearProfile()) {
  const n = tear.length - 1;
  const top = tear.map((d, i) => `${pct(i, n)} ${d}px`);
  const bottom = Array.from({ length: teeth * 2 + 1 }, (_, i) => {
    const j = teeth * 2 - i;
    return `${pct(j, teeth * 2)} ${j % 2 === 0 ? `calc(100% - ${crimp}px)` : "100%"}`;
  });
  return `polygon(${[...top, ...bottom].join(", ")})`;
}
