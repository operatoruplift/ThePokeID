/**
 * Pointer-driven 3D card motion.
 *
 * The pose math and spring are pure so they can be tested in Node; `createCardMotion`
 * drives them on the page with one animation frame loop per card that is moving.
 */

export type CardPose = {
  /** Degrees. Negative brings the top edge toward the viewer. */
  rotateX: number;
  /** Degrees. Negative brings the right edge toward the viewer. */
  rotateY: number;
  /** Travel toward the pointer, as a fraction of the card's width. */
  shiftX: number;
  /** Travel toward the pointer, as a fraction of the card's height. */
  shiftY: number;
  /** Rise off the page, as a fraction of the card's height. */
  lift: number;
  scale: number;
  /** Where the light sits on the card, from 0 to 1. */
  lightX: number;
  lightY: number;
  /** 0 at rest and 1 when the card is picked up; drives its directional shading. */
  energy: number;
};

export type Spring = { stiffness: number; damping: number };

export const DEFAULT_TILT = 18;
export const MAX_TILT = 24;
/** Reduced motion keeps a small, direct tilt without travel, pop, or bounce. */
export const REDUCED_TILT = 5;

const SHIFT_X = 0.1;
const SHIFT_Y = 0.07;
const LIFT = 0.04;
const HOVER_SCALE = 1.06;
const PRESSED_SCALE = 1.015;

/** Underdamped: the card overshoots a little and wobbles back into place. */
export const LIVELY_SPRING: Spring = { stiffness: 240, damping: 17 };
/** Critically damped: settles smoothly with no overshoot. */
export const GENTLE_SPRING: Spring = { stiffness: 320, damping: 2 * Math.sqrt(320) };

export const REST_POSE: Readonly<CardPose> = Object.freeze({
  rotateX: 0,
  rotateY: 0,
  shiftX: 0,
  shiftY: 0,
  lift: 0,
  scale: 1,
  lightX: 0.5,
  lightY: 0.32,
  energy: 0,
});

const KEYS = Object.keys(REST_POSE) as (keyof CardPose)[];

/** How close a value must be to its target, in its own units, to count as settled. */
const PRECISION: Record<keyof CardPose, number> = {
  rotateX: 0.02,
  rotateY: 0.02,
  shiftX: 0.0002,
  shiftY: 0.0002,
  lift: 0.0002,
  scale: 0.0002,
  lightX: 0.001,
  lightY: 0.001,
  energy: 0.002,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** The largest rotation allowed for a requested tilt and motion preference. */
export function tiltLimit(maxTilt: number, reducedMotion: boolean) {
  const limit = Number.isFinite(maxTilt) ? clamp(maxTilt, 0, MAX_TILT) : DEFAULT_TILT;
  return reducedMotion ? Math.min(limit, REDUCED_TILT) : limit;
}

export function zeroPose(): CardPose {
  const pose = { ...REST_POSE };
  for (const key of KEYS) pose[key] = 0;
  return pose;
}

type PoseOptions = { maxTilt: number; reducedMotion: boolean; pressed?: boolean };

/**
 * The pose for a pointer at (px, py), measured from the card's top-left corner
 * as fractions of its size. The card turns to face the pointer, leans after it,
 * and lifts off the page; pressing pushes it back down.
 */
export function poseForPointer(px: number, py: number, { maxTilt, reducedMotion, pressed = false }: PoseOptions): CardPose {
  const x = clamp(Number.isFinite(px) ? px : 0.5, 0, 1);
  const y = clamp(Number.isFinite(py) ? py : 0.5, 0, 1);
  const limit = tiltLimit(maxTilt, reducedMotion);
  // A tilt of 0 keeps the card still; only its light follows the pointer.
  if (limit === 0) return { ...REST_POSE, lightX: x, lightY: y, energy: 1 };

  const dx = x - 0.5;
  const dy = y - 0.5;
  const travel = !reducedMotion;
  return {
    rotateX: dy * 2 * limit,
    rotateY: (0.5 - x) * 2 * limit,
    shiftX: travel ? dx * SHIFT_X : 0,
    shiftY: travel ? dy * SHIFT_Y : 0,
    lift: travel ? (pressed ? LIFT * 0.25 : LIFT) : 0,
    scale: travel ? (pressed ? PRESSED_SCALE : HOVER_SCALE) : 1,
    lightX: x,
    lightY: y,
    energy: pressed ? 0.75 : 1,
  };
}

/** A three-quarter pose that shows a keyboard-focused card is picked up. */
export function presentPose({ maxTilt, reducedMotion }: Omit<PoseOptions, "pressed">): CardPose {
  const limit = tiltLimit(maxTilt, reducedMotion);
  if (limit === 0 || reducedMotion) return { ...REST_POSE, lightX: 0.3, lightY: 0.22, energy: 0.8 };
  return poseForPointer(0.24, 0.26, { maxTilt: limit * 0.55, reducedMotion });
}

/**
 * Advances `current` toward `target` with a damped spring, mutating `current` and
 * `velocity` in place. Returns true once every value has settled on its target.
 */
export function stepPose(current: CardPose, velocity: CardPose, target: Readonly<CardPose>, dt: number, spring: Spring) {
  const elapsed = clamp(Number.isFinite(dt) ? dt : 0, 0, 0.1);
  // Fixed small substeps keep the spring stable on slow or uneven frames.
  const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)));
  const h = elapsed / steps;
  let settled = true;

  for (const key of KEYS) {
    let x = current[key];
    let v = velocity[key];
    const goal = target[key];
    for (let i = 0; i < steps; i++) {
      v += (-spring.stiffness * (x - goal) - spring.damping * v) * h;
      x += v * h;
    }
    const precision = PRECISION[key];
    if (Math.abs(x - goal) < precision && Math.abs(v) < precision * 4) {
      x = goal;
      v = 0;
    } else {
      settled = false;
    }
    current[key] = x;
    velocity[key] = v;
  }
  return settled;
}

function fixed(value: number, digits = 3) {
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

/** True when the pose has no rotation, travel, lift, or scale, whatever its light. */
export function isStill(pose: Readonly<CardPose>) {
  return (
    pose.rotateX === 0 &&
    pose.rotateY === 0 &&
    pose.shiftX === 0 &&
    pose.shiftY === 0 &&
    pose.lift === 0 &&
    pose.scale === 1
  );
}

/** Perspective grows with the card so small thumbnails foreshorten as much as large scans. */
export function cardPerspective(width: number) {
  return Math.round(clamp(width * 3, 240, 1500));
}

/** Cards wider than this travel, lift, and grow no further in pixels than one this wide. */
const TRAVEL_REFERENCE = 240;

/** Shrinks travel for large cards so an inspector-sized card stays clear of nearby text. */
export function travelScale(width: number) {
  return width > TRAVEL_REFERENCE ? TRAVEL_REFERENCE / width : 1;
}

export function cardTransform(pose: Readonly<CardPose>, width: number, height: number) {
  const k = travelScale(width);
  const x = pose.shiftX * width * k;
  const y = (pose.shiftY - pose.lift) * height * k;
  const scale = 1 + (pose.scale - 1) * k;
  return (
    `perspective(${cardPerspective(width)}px) translate3d(${fixed(x, 2)}px, ${fixed(y, 2)}px, 0) ` +
    `rotateX(${fixed(pose.rotateX, 2)}deg) rotateY(${fixed(pose.rotateY, 2)}deg) scale(${fixed(scale, 4)})`
  );
}

/**
 * The shadow stays on the page: it falls further and spreads as the card rises,
 * and only appears for cards that actually leave the page.
 */
export function shadowStyle(pose: Readonly<CardPose>, width: number, height: number) {
  const k = travelScale(width);
  const rise = clamp(pose.lift / LIFT, 0, 1);
  const x = pose.shiftX * width * 0.45 * k - pose.rotateY * 0.35 * rise;
  const y = (pose.shiftY * height * 0.45 + pose.lift * height * 1.6) * k + 3 * rise - pose.rotateX * 0.25 * rise;
  const scale = 0.94 + 0.06 * (1 + (pose.scale - 1) * k);
  return {
    transform: `translate3d(${fixed(x, 2)}px, ${fixed(y, 2)}px, 0) scale(${fixed(scale, 4)})`,
    opacity: fixed(0.55 * rise, 3),
  };
}

/** Directional shading: the edge nearest the light brightens and the far edge dims. */
export function shadeStyle(pose: Readonly<CardPose>) {
  const dx = pose.lightX - 0.5;
  const dy = pose.lightY - 0.5;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const strength = clamp(Math.hypot(dx, dy) * 2, 0, 1) * clamp(pose.energy, 0, 1);
  return { angle: `${fixed(angle, 1)}deg`, strength: fixed(strength, 3) };
}

export type CardMotion = {
  /** Turn toward a pointer at (px, py) on a card of the given size. */
  follow(px: number, py: number, width: number, height: number, pressed: boolean): void;
  /** Hold the keyboard-focus pose. */
  present(width: number, height: number): void;
  /** Spring back to rest. */
  release(): void;
  destroy(): void;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Drives `art` (and an optional `shadow`) on the page. Browser only. */
export function createCardMotion(
  { art, shadow }: { art: HTMLElement; shadow?: HTMLElement | null },
  maxTilt: number,
): CardMotion {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  let reducedMotion = query.matches;
  const current: CardPose = { ...REST_POSE };
  const velocity = zeroPose();
  let target: CardPose = { ...REST_POSE };
  let resting = true;
  let width = 0;
  let height = 0;
  let frame: number | null = null;
  let last = 0;
  let pointer: { px: number; py: number; pressed: boolean } | null = null;

  function clear() {
    art.style.removeProperty("transform");
    for (const name of ["--px", "--py", "--shade-angle", "--shade"]) art.style.removeProperty(name);
    if (shadow) {
      shadow.style.removeProperty("transform");
      shadow.style.removeProperty("opacity");
    }
  }

  function render() {
    if (!width || !height) return;
    // A card that only shines (tilt 0) keeps no transform, so a zoomed scan stays sharp.
    if (isStill(current)) art.style.removeProperty("transform");
    else art.style.transform = cardTransform(current, width, height);
    art.style.setProperty("--px", fixed(current.lightX, 4));
    art.style.setProperty("--py", fixed(current.lightY, 4));
    const shade = shadeStyle(current);
    art.style.setProperty("--shade-angle", shade.angle);
    art.style.setProperty("--shade", shade.strength);
    if (shadow) {
      const style = shadowStyle(current, width, height);
      shadow.style.transform = style.transform;
      shadow.style.opacity = style.opacity;
    }
  }

  function tick(now: number) {
    const dt = last ? (now - last) / 1000 : 1 / 60;
    last = now;
    const settled = stepPose(current, velocity, target, dt, reducedMotion ? GENTLE_SPRING : LIVELY_SPRING);
    if (settled) {
      frame = null;
      last = 0;
      // At rest the card goes back to plain CSS, so idle cards do not hold GPU layers.
      if (resting) clear();
      else render();
      return;
    }
    render();
    frame = requestAnimationFrame(tick);
  }

  function animate() {
    if (frame === null) frame = requestAnimationFrame(tick);
  }

  function aim(next: CardPose, nextWidth: number, nextHeight: number) {
    if (nextWidth > 0 && nextHeight > 0) {
      width = nextWidth;
      height = nextHeight;
    }
    target = next;
    resting = false;
    animate();
  }

  function onPreferenceChange() {
    reducedMotion = query.matches;
    if (pointer) target = poseForPointer(pointer.px, pointer.py, { maxTilt, reducedMotion, pressed: pointer.pressed });
    else if (!resting) target = presentPose({ maxTilt, reducedMotion });
    animate();
  }
  query.addEventListener("change", onPreferenceChange);

  return {
    follow(px, py, nextWidth, nextHeight, pressed) {
      pointer = { px, py, pressed };
      aim(poseForPointer(px, py, { maxTilt, reducedMotion, pressed }), nextWidth, nextHeight);
    },
    present(nextWidth, nextHeight) {
      pointer = null;
      aim(presentPose({ maxTilt, reducedMotion }), nextWidth, nextHeight);
    },
    release() {
      pointer = null;
      target = { ...REST_POSE };
      resting = true;
      animate();
    },
    destroy() {
      query.removeEventListener("change", onPreferenceChange);
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      clear();
    },
  };
}
