/**
 * Easing, springs, and a small tween runner for the 3D stage. Tweens advance on the
 * stage's own clock, so they pause with it and stay in step with the frame they
 * render. Pure, so it can be tested in Node.
 */

export type Ease = (t: number) => number;

export const linear: Ease = (t) => t;
export const easeInQuad: Ease = (t) => t * t;
export const easeInCubic: Ease = (t) => t * t * t;
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutQuint: Ease = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Overshoots its target a little, then settles back onto it. */
export function easeOutBack(overshoot = 1.4): Ease {
  const c3 = overshoot + 1;
  return (t) => 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
}

export function clamp(x: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, x));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Rises from 0 to 1 and back to 0 over t from 0 to 1: a bump. */
export function bump(t: number) {
  return Math.sin(Math.PI * clamp(t));
}

export type SpringState = { value: number; velocity: number };

/**
 * One step of a damped spring pulling `state` toward `target`, in place. Steps longer
 * than a sixtieth of a second are split up so a slow frame cannot blow it up.
 */
export function springStep(state: SpringState, target: number, stiffness: number, damping: number, dt: number) {
  let remaining = dt;
  while (remaining > 0) {
    const h = Math.min(remaining, 1 / 60);
    const force = stiffness * (target - state.value) - damping * state.velocity;
    state.velocity += force * h;
    state.value += state.velocity * h;
    remaining -= h;
  }
  return state.value;
}

type Running = {
  key: string | null;
  elapsed: number;
  delay: number;
  duration: number;
  ease: Ease;
  update: (k: number, t: number) => void;
  resolve: (finished: boolean) => void;
};

/**
 * Tweens on the stage clock. `add` returns a promise that resolves true when the tween
 * finishes and false if it is cancelled. A keyed tween replaces any running tween
 * with the same key, so two animations never fight over one property.
 */
export class Tweens {
  private running = new Set<Running>();

  add(duration: number, ease: Ease, update: (k: number, t: number) => void, options: { delay?: number; key?: string } = {}) {
    const key = options.key ?? null;
    if (key !== null) this.cancel(key);
    return new Promise<boolean>((resolve) => {
      this.running.add({ key, elapsed: 0, delay: options.delay ?? 0, duration: Math.max(1e-4, duration), ease, update, resolve });
    });
  }

  /** Resolves after `seconds` of stage time, or false if cancelled first. */
  wait(seconds: number, key?: string) {
    return this.add(seconds, linear, () => undefined, { key });
  }

  update(dt: number) {
    for (const tween of [...this.running]) {
      if (!this.running.has(tween)) continue;
      let step = dt;
      if (tween.delay > 0) {
        tween.delay -= step;
        if (tween.delay > 0) continue;
        step = -tween.delay;
        tween.delay = 0;
      }
      tween.elapsed += step;
      const t = clamp(tween.elapsed / tween.duration);
      tween.update(tween.ease(t), t);
      if (t >= 1) {
        this.running.delete(tween);
        tween.resolve(true);
      }
    }
  }

  cancel(key: string) {
    for (const tween of this.running) {
      if (tween.key !== key) continue;
      this.running.delete(tween);
      tween.resolve(false);
    }
  }

  /** Cancels every tween whose key starts with `prefix`, or all of them. */
  cancelAll(prefix?: string) {
    for (const tween of [...this.running]) {
      if (prefix !== undefined && !tween.key?.startsWith(prefix)) continue;
      this.running.delete(tween);
      tween.resolve(false);
    }
  }

  get size() {
    return this.running.size;
  }
}
