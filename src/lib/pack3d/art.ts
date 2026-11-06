/**
 * Canvas-painted textures for the 3D pack and cards: the pack's printed foil, a
 * roughness and metalness map so the print is matte while the foil shines, foil
 * creases, rounded card corners, and soft sprites for light and stars. Browser only.
 */

import { CRIMP, PACK_H, PACK_W, TEAR_V } from "@/lib/pack3d/shape";

export type Finish = "aurora" | "eclipse";

export const ART_W = 1024;
export const ART_H = Math.round((ART_W * PACK_H) / PACK_W);

const FINISHES: Record<Finish, { stops: string[]; ink: string; perf: string }> = {
  aurora: { stops: ["#e4fb9e", "#9be7a7", "#57d0c0", "#49aee8", "#7a8cf0", "#a284f3"], ink: "#1e2230", perf: "rgba(30,34,48,0.5)" },
  eclipse: { stops: ["#2a2b7e", "#46349f", "#6f39b4", "#9c3c9e", "#b8429a"], ink: "#ffffff", perf: "rgba(255,255,255,0.7)" },
};

const RAINBOW = ["#ffffff", "#ffd96b", "#c8f07a", "#73e0c4", "#6cb8ff", "#a68cff", "#f08bd6", "#ffffff"];

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable");
  return { element, context };
}

/** Letter-spaced text without relying on canvas letterSpacing support. */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((sum, w) => sum + w, 0) + spacing * (text.length - 1);
  let cursor = x - total / 2;
  ctx.textAlign = "left";
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i] + spacing;
  });
  ctx.textAlign = "center";
}

function foil(ctx: CanvasRenderingContext2D, finish: Finish, w: number, h: number, darken = 0) {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  const { stops } = FINISHES[finish];
  stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  // Embossed chevrons pressed into the foil.
  ctx.lineWidth = 10;
  for (let y = -h * 0.2; y < h * 1.2; y += 74) {
    for (const [style, shift] of [["rgba(255,255,255,0.08)", 0], ["rgba(0,0,0,0.06)", 6]] as const) {
      ctx.strokeStyle = style;
      ctx.beginPath();
      for (let x = -40; x <= w + 40; x += 80) ctx.lineTo(x, y + shift + (Math.round(x / 80) % 2 === 0 ? 0 : 40));
      ctx.stroke();
    }
  }
  // Soft diagonal light, as foil catches it.
  for (const [x0, alpha] of [[0.2, 0.14], [0.62, 0.1]] as const) {
    const band = ctx.createLinearGradient(w * x0, 0, w * (x0 + 0.35), h * 0.4);
    band.addColorStop(0, "rgba(255,255,255,0)");
    band.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
    band.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, 0, w, h);
  }
  if (darken > 0) {
    ctx.fillStyle = `rgba(10,12,30,${darken})`;
    ctx.fillRect(0, 0, w, h);
  }
  // Shading toward the heat-sealed sides.
  const sides = ctx.createLinearGradient(0, 0, w, 0);
  sides.addColorStop(0, "rgba(0,0,0,0.28)");
  sides.addColorStop(0.1, "rgba(0,0,0,0)");
  sides.addColorStop(0.9, "rgba(0,0,0,0)");
  sides.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = sides;
  ctx.fillRect(0, 0, w, h);
}

function crimps(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const band = CRIMP * h;
  for (const top of [0, h - band]) {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(0, top, w, band);
    for (let y = top; y < top + band; y += 6) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(0, y, w, 2);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(0, y + 2, w, 2);
    }
  }
}

function perforation(ctx: CanvasRenderingContext2D, finish: Finish, w: number, h: number) {
  const y = (1 - TEAR_V) * h;
  ctx.save();
  ctx.strokeStyle = FINISHES[finish].perf;
  ctx.lineWidth = 3;
  ctx.setLineDash([16, 11]);
  ctx.beginPath();
  ctx.moveTo(26, y);
  ctx.lineTo(w - 26, y);
  ctx.stroke();
  ctx.restore();
}

function lid(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, logo: HTMLImageElement | null) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  // Conic gradients arrived in 2023 Safari and Firefox; older browsers get a plain rim.
  if (typeof ctx.createConicGradient === "function") {
    const ring = ctx.createConicGradient(-Math.PI / 3, cx, cy);
    RAINBOW.forEach((color, i) => ring.addColorStop(i / (RAINBOW.length - 1), color));
    ctx.fillStyle = ring;
  } else {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f8fb";
  ctx.fill();
  if (logo) {
    const size = (r - 14) * 1.3;
    ctx.drawImage(logo, cx - size / 2, cy - size / 2, size, size);
  }
}

export type PackArt = { name: string; finish: Finish; logo: HTMLImageElement | null; display: string; body: string };

/** Where the lid sits on the front, as shares of the art's width and height. */
const LID_Y = 0.43;
const LID_R = 0.27;

/** The front's lettering, in the current fill: once in ink, once into the surface map. */
function frontLettering(ctx: CanvasRenderingContext2D, { name, display, body }: PackArt, w: number, h: number) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 34px ${body}`;
  spaced(ctx, "THEPOKEID", w / 2, (CRIMP + (1 - TEAR_V)) * 0.5 * h + 4, 13);
  const lidY = h * LID_Y;
  const lidR = w * LID_R;
  ctx.font = `700 ${name.length > 12 ? 78 : 96}px ${display}`;
  ctx.fillText(name, w / 2, lidY + lidR + 110);
  ctx.font = `600 30px ${body}`;
  spaced(ctx, "5 CARDS · SAMPLE PACK", w / 2, lidY + lidR + 190, 9);
}

/** The back's lettering and fine print, in the current fill. */
function backLettering(ctx: CanvasRenderingContext2D, { display, body }: PackArt, w: number, h: number) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 64px ${display}`;
  ctx.fillText("ThePokeID", w / 2, h * 0.36);
  ctx.font = `600 26px ${body}`;
  spaced(ctx, "SAMPLE PACK · NOT FOR SALE", w / 2, h * 0.36 + 64, 8);
  for (let line = 0; line < 6; line++) ctx.fillRect(w * 0.2, h * 0.5 + line * 26, w * (line % 2 ? 0.52 : 0.6), 8);
}

const BARCODE = { x: 0.32, y: 0.74, w: 0.36, h: 130 };

/** The pack's printed front. Canvas y runs down, so v = 1 is the top row. */
export function paintFront(art: PackArt) {
  const { element, context: ctx } = canvas(ART_W, ART_H);
  const w = ART_W;
  const h = ART_H;
  foil(ctx, art.finish, w, h);
  crimps(ctx, w, h);
  perforation(ctx, art.finish, w, h);
  // The notch where the tear starts.
  ctx.fillStyle = "rgba(10,12,30,0.55)";
  ctx.beginPath();
  ctx.moveTo(0, (1 - TEAR_V) * h - 18);
  ctx.lineTo(26, (1 - TEAR_V) * h);
  ctx.lineTo(0, (1 - TEAR_V) * h + 18);
  ctx.fill();
  lid(ctx, w / 2, h * LID_Y, w * LID_R, art.logo);
  ctx.fillStyle = FINISHES[art.finish].ink;
  frontLettering(ctx, art, w, h);
  return element;
}

/** The back: the same foil, with fine print, a barcode, and the perforation. */
export function paintBack(art: PackArt) {
  const { element, context: ctx } = canvas(ART_W, ART_H);
  const w = ART_W;
  const h = ART_H;
  foil(ctx, art.finish, w, h, 0.12);
  crimps(ctx, w, h);
  perforation(ctx, art.finish, w, h);
  ctx.fillStyle = FINISHES[art.finish].ink;
  ctx.globalAlpha = 0.9;
  backLettering(ctx, art, w, h);
  ctx.globalAlpha = 1;
  // A plain barcode panel near the bottom.
  const bx = w * BARCODE.x;
  const by = h * BARCODE.y;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(bx, by, w * BARCODE.w, BARCODE.h);
  ctx.fillStyle = "#1e2230";
  let x = bx + 18;
  for (let i = 0; x < bx + w * BARCODE.w - 18; i++) {
    const bar = [3, 6, 2, 4, 8, 3, 2, 5][i % 8];
    ctx.fillRect(x, by + 16, bar, 98);
    x += bar + [4, 3, 6, 3][i % 4];
  }
  return element;
}

/**
 * Roughness in green and metalness in blue, as three.js reads them: the foil is
 * glossy metal, and the lid, the lettering, and the barcode are satin ink. The ink is
 * painted with the same lettering as the art, so it follows the letters exactly.
 */
export function paintSurfaceMap(art: PackArt, side: "front" | "back") {
  const { element, context: ctx } = canvas(ART_W / 2, ART_H / 2);
  const w = ART_W;
  const h = ART_H;
  ctx.scale(0.5, 0.5);
  // Foil: fairly glossy, two-thirds metal, so the printed colour still shows.
  ctx.fillStyle = "rgb(255, 82, 166)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgb(255, 104, 150)";
  ctx.fillRect(0, 0, w, CRIMP * h);
  ctx.fillRect(0, h - CRIMP * h, w, CRIMP * h);
  // Ink: satin, barely metallic.
  const ink = "rgb(255, 140, 20)";
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  if (side === "front") {
    ctx.beginPath();
    ctx.arc(w / 2, h * LID_Y, w * LID_R, 0, Math.PI * 2);
    ctx.fill();
    frontLettering(ctx, art, w, h);
  } else {
    backLettering(ctx, art, w, h);
    ctx.fillRect(w * BARCODE.x, h * BARCODE.y, w * BARCODE.w, BARCODE.h);
  }
  return element;
}

/**
 * A normal map of crumpled foil, with fine ridges across the crimps. Heights from a
 * few layered waves and a seeded noise, turned into normals by finite differences.
 */
export function paintCreases(width = 512, height = Math.round((512 * PACK_H) / PACK_W)) {
  const heights = new Float32Array(width * height);
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const grid = 24;
  const noise = Array.from({ length: (grid + 1) * (grid + 2) }, random);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < height; y++) {
    const v = 1 - y / height;
    const crimped = v < CRIMP || v > 1 - CRIMP;
    for (let x = 0; x < width; x++) {
      const gx = (x / width) * grid;
      const gy = (y / height) * grid;
      const ix = Math.floor(gx);
      const iy = Math.floor(gy);
      const fx = smooth(gx - ix);
      const fy = smooth(gy - iy);
      const at = (cx: number, cy: number) => noise[cy * (grid + 1) + cx];
      const n =
        at(ix, iy) * (1 - fx) * (1 - fy) + at(ix + 1, iy) * fx * (1 - fy) + at(ix, iy + 1) * (1 - fx) * fy + at(ix + 1, iy + 1) * fx * fy;
      let value = n * 0.9 + 0.25 * Math.sin(x * 0.11 + y * 0.03) * Math.sin(y * 0.07 - x * 0.02);
      if (crimped) value = 0.6 * Math.sin(y * 1.6);
      heights[y * width + x] = value;
    }
  }
  const { element, context: ctx } = canvas(width, height);
  const image = ctx.createImageData(width, height);
  const strength = 2.2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const h = (cx: number, cy: number) => heights[Math.min(height - 1, Math.max(0, cy)) * width + Math.min(width - 1, Math.max(0, cx))];
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const k = (y * width + x) * 4;
      image.data[k] = (-dx / len) * 127.5 + 127.5;
      image.data[k + 1] = (dy / len) * 127.5 + 127.5;
      image.data[k + 2] = (1 / len) * 127.5 + 127.5;
      image.data[k + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return element;
}

/** White inside a card's rounded outline, black outside: an alpha map for the corners. */
export function paintCardCorners(width = 256, ratio = 88 / 63) {
  const height = Math.round(width * ratio);
  const { element, context: ctx } = canvas(width, height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  const r = width * 0.045;
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, height - 2, r);
  ctx.fill();
  return element;
}

/** A soft round light, bright in the middle; for glows, sparks, and stars. */
export function paintGlow(size = 128, color = "255,236,190") {
  const { element, context: ctx } = canvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${color},1)`);
  g.addColorStop(0.25, `rgba(${color},0.6)`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return element;
}

/**
 * The theater's night sky: deep indigo behind the pack, falling off to near black.
 * The sky is drawn about twice the size of the view, so the view sees its middle half.
 */
export function paintBackdrop(size = 1024) {
  const { element, context: ctx } = canvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "#2a3274");
  g.addColorStop(0.16, "#1a1f52");
  g.addColorStop(0.34, "#0d1030");
  g.addColorStop(0.55, "#06070f");
  g.addColorStop(1, "#05060c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return element;
}

/** "Swipe to tear" with an arrow, in white on clear, for the line above a sealed pack. */
export function paintHint(body: string) {
  const { element, context: ctx } = canvas(1024, 128);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textBaseline = "middle";
  ctx.font = `600 44px ${body}`;
  ctx.textAlign = "center";
  spaced(ctx, "SWIPE ACROSS TO TEAR", 430, 64, 7);
  // A long arrow pointing the way to drag.
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(790, 64);
  ctx.lineTo(960, 64);
  ctx.moveTo(934, 44);
  ctx.lineTo(962, 64);
  ctx.lineTo(934, 84);
  ctx.stroke();
  return element;
}

/** A gold plate with dark lettering, like the hit's label on the 2D table. */
export function paintPlate(text: string, body: string) {
  const { element, context: ctx } = canvas(512, 128);
  const gold = ctx.createLinearGradient(0, 0, 512, 128);
  gold.addColorStop(0, "#f8dc85");
  gold.addColorStop(0.38, "#eab64a");
  gold.addColorStop(0.55, "#fbe7a9");
  gold.addColorStop(1, "#d99a22");
  ctx.fillStyle = gold;
  ctx.beginPath();
  ctx.roundRect(8, 16, 496, 96, 48);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#2a1f05";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `700 46px ${body}`;
  spaced(ctx, text.toUpperCase(), 256, 66, 10);
  return element;
}

/** Stands in for a card scan that failed to load. */
export function paintMissingCard(body: string, width = 512, ratio = 88 / 63) {
  const height = Math.round(width * ratio);
  const { element, context: ctx } = canvas(width, height);
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#5b6372";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 34px ${body}`;
  ctx.fillText("Artwork unavailable", width / 2, height / 2);
  return element;
}

/** A soft bar of light: bright along its middle, fading above, below, and at the ends. */
export function paintLeak(width = 256, height = 128) {
  const { element, context: ctx } = canvas(width, height);
  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "rgba(255,255,255,0)");
  vertical.addColorStop(0.42, "rgba(255,255,255,0.75)");
  vertical.addColorStop(0.5, "rgba(255,255,255,1)");
  vertical.addColorStop(0.58, "rgba(255,255,255,0.75)");
  vertical.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "destination-in";
  const ends = ctx.createLinearGradient(0, 0, width, 0);
  ends.addColorStop(0, "rgba(0,0,0,0)");
  ends.addColorStop(0.08, "rgba(0,0,0,1)");
  ends.addColorStop(0.9, "rgba(0,0,0,1)");
  ends.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = ends;
  ctx.fillRect(0, 0, width, height);
  return element;
}
