/**
 * The shape of a foil sample pack, as plain math so it can be tested without WebGL.
 *
 * The pack is a pillow: two foil sheets heat-sealed along the sides and crimped flat
 * at the top and bottom, bulging in between. A perforation runs across just below the
 * top crimp; the strip above it tears away along a jagged edge that the strip and the
 * body share, so the two meet exactly while the pack is sealed.
 *
 * Coordinates: x across the pack, y up, z toward the viewer. u and v run 0 to 1 across
 * and up the sheet. All sizes are in scene units.
 */

export const PACK_W = 2.2;
export const PACK_H = 3.6;
/** Full thickness at the fattest point of the pillow. */
export const PACK_T = 0.34;
/** Height of each crimped band, as a share of the pack's height. */
export const CRIMP = 0.055;
/** Where the perforation runs, as a share of the height from the bottom. */
export const TEAR_V = 0.87;
/** Columns of the foil mesh; an even number, so the crimps have whole teeth. */
export const COLUMNS = 56;
/** Depth of the saw-tooth crimp edges. */
export const TOOTH = 0.05;
/** Half the crimped bands' thickness, so front and back never share a plane. */
export const CRIMP_GAP = 0.004;
/** The tallest a tooth of the torn edge gets. */
export const TEAR_JAG = 0.028;

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * How far the sheet bulges at (u, v), from 0 at the seams and crimps to 1 in the
 * middle. Steep at the side seams, as heat-sealed foil is, and flat in the crimps.
 */
export function pillow(u: number, v: number) {
  const across = Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.55);
  const ramp = 0.15;
  const along = smoothstep(CRIMP, CRIMP + ramp, v) * smoothstep(1 - CRIMP, 1 - CRIMP - ramp, v);
  return across * along;
}

/** Fine creases in the foil, a few thousandths of a unit deep. */
export function wrinkle(u: number, v: number) {
  return 0.006 * Math.sin(u * 37 + v * 11) * Math.sin(v * 29 - u * 7) + 0.003 * Math.sin(u * 91 - v * 53);
}

/** The torn edge's offset in y at column i: irregular, but the same on every render. */
export function tearJag(i: number) {
  const pattern = [0.3, -0.6, 0.9, -0.2, 0.5, -1, 0.15, 0.8, -0.45, 0.6, -0.8, 0.25, -0.1];
  return pattern[i % pattern.length] * TEAR_JAG;
}

/**
 * How far the free strip has curled, in radians, at a distance `s` behind the tear
 * front: flat where it has only just come free, curling up toward the hand pulling it.
 */
export function curlAngle(s: number, span = 0.85, max = 1.15) {
  if (s <= 0) return 0;
  return max * (1 - Math.exp(-s / span));
}

/** x of the tear's leading edge for a rip progress from 0 to 1, starting at the notch. */
export function tearFront(progress: number) {
  return -PACK_W / 2 + Math.min(1, Math.max(0, progress)) * PACK_W * 1.08;
}

export type SurfaceArrays = {
  positions: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  columns: number;
  rows: number;
};

/**
 * One foil sheet between heights v0 and v1. `side` is 1 for the front (bulging toward
 * the viewer) and -1 for the back. The outer crimp edges are saw-toothed; a sheet
 * that ends at the perforation follows the shared torn edge instead.
 */
export function surface(v0: number, v1: number, rows: number, side: 1 | -1): SurfaceArrays {
  const columns = COLUMNS;
  const count = (columns + 1) * (rows + 1);
  const positions = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  for (let j = 0; j <= rows; j++) {
    const v = v0 + ((v1 - v0) * j) / rows;
    for (let i = 0; i <= columns; i++) {
      const u = i / columns;
      let y = (v - 0.5) * PACK_H;
      if (j === rows && v1 === 1) y -= i % 2 === 1 ? TOOTH : 0;
      if (j === 0 && v0 === 0) y += i % 2 === 1 ? TOOTH : 0;
      // Both sheets share the torn edge along the perforation.
      if ((j === rows && v1 === TEAR_V) || (j === 0 && v0 === TEAR_V)) y += tearJag(i);
      const crimped = v < CRIMP + 0.01 || v > 1 - CRIMP - 0.01;
      const bulge = (PACK_T / 2) * pillow(u, v) + wrinkle(u, v) * pillow(u, v);
      const z = side * (bulge + (crimped ? CRIMP_GAP : 0));
      const k = j * (columns + 1) + i;
      positions[k * 3] = (u - 0.5) * PACK_W;
      positions[k * 3 + 1] = y;
      positions[k * 3 + 2] = z;
      // The back's art is printed facing the other way.
      uvs[k * 2] = side === 1 ? u : 1 - u;
      uvs[k * 2 + 1] = v;
    }
  }
  const indices = new Uint32Array(columns * rows * 6);
  let n = 0;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const a = j * (columns + 1) + i;
      const b = a + 1;
      const c = a + columns + 1;
      const d = c + 1;
      // Counter-clockwise from the side the sheet faces.
      if (side === 1) indices.set([a, b, d, a, d, c], n);
      else indices.set([a, d, b, a, c, d], n);
      n += 6;
    }
  }
  return { positions, uvs, indices, columns, rows };
}

/** Height of the perforation, where the strip and body meet. */
export const TEAR_Y = (TEAR_V - 0.5) * PACK_H;
/** How far the curled strip leans toward the viewer. */
const CURL_LEAN = 0.3;

/**
 * Bends a strip sheet for a tear that has reached `tearX`, writing into `out`. Ahead
 * of the tear the strip is still sealed and stays put. Behind it the strip peels up
 * off the pack along a smooth arc that starts at the tear front, so the gap along the
 * perforation opens wider the longer the strip has been free. The strip keeps its
 * length as it bends, as foil does.
 */
export function peelStrip(base: Float32Array, out: Float32Array, tearX: number, columns = COLUMNS) {
  const stride = columns + 1;
  const rows = base.length / 3 / stride - 1;
  // Walk the arc from the tear front toward the free end, column by column.
  let s = 0;
  let arcX = tearX;
  let arcY = TEAR_Y;
  for (let i = columns; i >= 0; i--) {
    const x = (i / columns - 0.5) * PACK_W;
    const free = tearX - x;
    let angle = 0;
    if (free > 0) {
      const steps = Math.max(1, Math.ceil((free - s) / 0.02));
      const h = (free - s) / steps;
      for (let n = 0; n < steps; n++) {
        const a = curlAngle(s + h * (n + 0.5));
        arcX -= Math.cos(a) * h;
        arcY += Math.sin(a) * h;
      }
      s = free;
      angle = curlAngle(free);
    }
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    for (let j = 0; j <= rows; j++) {
      const k = (j * stride + i) * 3;
      if (free <= 0) {
        out[k] = base[k];
        out[k + 1] = base[k + 1];
        out[k + 2] = base[k + 2];
        continue;
      }
      // The strip's height above the perforation turns with the arc.
      const dy = base[k + 1] - TEAR_Y;
      out[k] = arcX + dy * sin;
      out[k + 1] = arcY + dy * cos;
      out[k + 2] = base[k + 2] + CURL_LEAN * (1 - cos);
    }
  }
}
