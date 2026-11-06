/**
 * Light for the 3D rip: a twinkling starfield, bursts of sparks, and soft glows and
 * rays. Everything here is additive, so it brightens what is behind it and feeds the
 * bloom pass instead of covering things up. Browser only.
 */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  type Vector3,
} from "three";

import { paintGlow } from "@/lib/pack3d/art";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function glowTexture(color?: string) {
  const texture = new CanvasTexture(paintGlow(128, color));
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A glow card that always faces forward; brightness comes from `opacity` and `color`. */
export function glowPlane(texture: Texture, color: string, size = 1) {
  const material = new MeshBasicMaterial({
    map: texture,
    color: new Color(color),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const mesh = new Mesh(new PlaneGeometry(size, size), material);
  mesh.renderOrder = 2;
  return mesh;
}

/**
 * A fan of light rays spreading upward from the group's origin. Each ray is a long
 * glow stretched from its base; turn the group to aim the fan.
 */
export function rayFan(texture: Texture, color: string, count: number, spread: number, length: number, seed = 3) {
  const random = seeded(seed);
  const group = new Group();
  const material = new MeshBasicMaterial({
    map: texture,
    color: new Color(color),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  for (let i = 0; i < count; i++) {
    const geometry = new PlaneGeometry(0.22 + random() * 0.3, length * (0.6 + random() * 0.5));
    // Base of the ray at the origin, reaching up.
    geometry.translate(0, (geometry.parameters.height / 2) * 0.92, 0);
    const ray = new Mesh(geometry, material);
    ray.rotation.z = (i / Math.max(1, count - 1) - 0.5) * spread + (random() - 0.5) * 0.12;
    ray.renderOrder = 2;
    group.add(ray);
  }
  return { group, material };
}

const SPARK_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uScale;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / max(0.1, -mv.z);
    vAlpha = aAlpha;
    vColor = aColor;
  }
`;

const SPARK_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    gl_FragColor = vec4(vColor * (halo * halo + core * 2.2) * vAlpha, 1.0);
  }
`;

export type SparkBurst = {
  count: number;
  /** Launch speed range, in units a second. */
  speed: [number, number];
  /** 1 sends sparks straight up, 0 in every direction. */
  up?: number;
  /** How far sparks start from the origin. */
  radius?: number;
  /** Extra spread across x, as a share of the speed. */
  spreadX?: number;
  life: [number, number];
  /** Sizes in scene units. */
  size: [number, number];
  colors: string[];
  gravity?: number;
};

/** A pool of sparks that fly, fall, and fade, in world space. */
export class Sparks {
  readonly points: Points<BufferGeometry, ShaderMaterial>;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private velocity: Float32Array;
  private life: Float32Array;
  private span: Float32Array;
  private gravity: Float32Array;
  private baseSize: Float32Array;
  private next = 0;
  private random = seeded(11);
  private color = new Color();

  constructor(private capacity: number) {
    this.positions = new Float32Array(capacity * 3);
    this.colors = new Float32Array(capacity * 3);
    this.sizes = new Float32Array(capacity);
    this.alphas = new Float32Array(capacity);
    this.velocity = new Float32Array(capacity * 3);
    this.life = new Float32Array(capacity);
    this.span = new Float32Array(capacity);
    this.gravity = new Float32Array(capacity);
    this.baseSize = new Float32Array(capacity);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(this.positions, 3));
    geometry.setAttribute("aColor", new BufferAttribute(this.colors, 3));
    geometry.setAttribute("aSize", new BufferAttribute(this.sizes, 1));
    geometry.setAttribute("aAlpha", new BufferAttribute(this.alphas, 1));
    const material = new ShaderMaterial({
      uniforms: { uScale: { value: 400 } },
      vertexShader: SPARK_VERTEX,
      fragmentShader: SPARK_FRAGMENT,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    this.points = new Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
  }

  /** Pixels per scene unit at distance 1, so sizes stay true as the canvas resizes. */
  setScale(scale: number) {
    this.points.material.uniforms.uScale.value = scale;
  }

  emit(origin: Vector3, burst: SparkBurst) {
    const random = this.random;
    const up = burst.up ?? 0.7;
    for (let n = 0; n < burst.count; n++) {
      const i = this.next;
      this.next = (this.next + 1) % this.capacity;
      // A random direction, pulled toward straight up by `up`.
      let dx = random() * 2 - 1;
      let dy = random() * 2 - 1;
      let dz = random() * 2 - 1;
      dx *= 1 + (burst.spreadX ?? 0);
      dy = dy * (1 - up) + up * (0.6 + random() * 0.4);
      dz *= 1 - up * 0.6;
      const length = Math.hypot(dx, dy, dz) || 1;
      const speed = burst.speed[0] + random() * (burst.speed[1] - burst.speed[0]);
      const radius = burst.radius ?? 0;
      this.positions[i * 3] = origin.x + (dx / length) * radius;
      this.positions[i * 3 + 1] = origin.y + (dy / length) * radius * 0.4;
      this.positions[i * 3 + 2] = origin.z + (dz / length) * radius * 0.4;
      this.velocity[i * 3] = (dx / length) * speed;
      this.velocity[i * 3 + 1] = (dy / length) * speed;
      this.velocity[i * 3 + 2] = (dz / length) * speed;
      this.span[i] = burst.life[0] + random() * (burst.life[1] - burst.life[0]);
      this.life[i] = this.span[i];
      this.gravity[i] = burst.gravity ?? -4;
      this.baseSize[i] = burst.size[0] + random() * (burst.size[1] - burst.size[0]);
      this.color.set(burst.colors[Math.floor(random() * burst.colors.length)]);
      this.colors[i * 3] = this.color.r;
      this.colors[i * 3 + 1] = this.color.g;
      this.colors[i * 3 + 2] = this.color.b;
    }
    this.points.geometry.attributes.aColor.needsUpdate = true;
  }

  update(dt: number, time: number) {
    let alive = false;
    for (let i = 0; i < this.capacity; i++) {
      if (this.life[i] <= 0) {
        if (this.alphas[i] !== 0) this.alphas[i] = 0;
        continue;
      }
      alive = true;
      this.life[i] -= dt;
      const k = Math.max(0, this.life[i] / this.span[i]);
      const drag = Math.pow(0.35, dt);
      this.velocity[i * 3] *= drag;
      this.velocity[i * 3 + 1] = this.velocity[i * 3 + 1] * drag + this.gravity[i] * dt;
      this.velocity[i * 3 + 2] *= drag;
      this.positions[i * 3] += this.velocity[i * 3] * dt;
      this.positions[i * 3 + 1] += this.velocity[i * 3 + 1] * dt;
      this.positions[i * 3 + 2] += this.velocity[i * 3 + 2] * dt;
      // Sparks glint as they fall, and fade out over their last stretch.
      const glint = 0.75 + 0.25 * Math.sin(time * 30 + i * 1.7);
      this.alphas[i] = Math.min(1, k * 2.2) * glint;
      this.sizes[i] = this.baseSize[i] * (0.4 + 0.6 * k);
    }
    const attributes = this.points.geometry.attributes;
    attributes.position.needsUpdate = true;
    attributes.aAlpha.needsUpdate = true;
    attributes.aSize.needsUpdate = true;
    this.points.visible = alive;
  }

  clear() {
    this.life.fill(0);
    this.alphas.fill(0);
    this.points.geometry.attributes.aAlpha.needsUpdate = true;
    this.points.visible = false;
  }
}

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 40.0);
    gl_PointSize = aSize * uPixelRatio * (0.75 + 0.35 * twinkle);
    vAlpha = twinkle;
    vColor = aColor;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor * a * a * vAlpha, 1.0);
  }
`;

/** A deep field of stars behind the stage, twinkling slowly. */
export function starfield(count = 1400) {
  const random = seeded(5);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const tints = ["#ffffff", "#dfe6ff", "#c7d4ff", "#fff1d6", "#d8fff4"].map((c) => new Color(c));
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() * 2 - 1) * 34;
    positions[i * 3 + 1] = (random() * 2 - 1) * 20;
    positions[i * 3 + 2] = -6 - random() * 34;
    // Mostly faint pinpricks, with a few bright ones.
    const bright = random();
    sizes[i] = 1 + Math.pow(bright, 6) * 4.5 + random() * 1.2;
    phases[i] = random();
    const tint = tints[Math.floor(random() * tints.length)];
    const level = 0.35 + 0.65 * Math.pow(random(), 2);
    colors[i * 3] = tint.r * level;
    colors[i * 3 + 1] = tint.g * level;
    colors[i * 3 + 2] = tint.b * level;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  geometry.setAttribute("aColor", new BufferAttribute(colors, 3));
  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return points;
}
