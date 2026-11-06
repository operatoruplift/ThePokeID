/**
 * The 3D sample pack. A foil pack floats in a night sky and leans toward the
 * pointer; swipe across it and the top strip tears along the perforation with light
 * leaking through the gap, until it pops free and flies off. Light bursts out of the
 * opening, the five cards rise, the pack drops away, and the cards turn over one at
 * a time, with the hit saved for last.
 *
 * The pack is built here from code (see shape.ts and art.ts) rather than loaded from
 * a model file, so the tear can bend the foil vertex by vertex. React owns the state
 * (which card, face up or down) and calls `sync`; the stage animates to match and
 * reports what the visitor does through `events`. Browser only.
 */

import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DataTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  HalfFloatType,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
  type Material,
  type Object3D,
  type Texture,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import {
  paintBack,
  paintBackdrop,
  paintCardCorners,
  paintCreases,
  paintFront,
  paintHint,
  paintLeak,
  paintMissingCard,
  paintPlate,
  paintSurfaceMap,
  type Finish,
} from "@/lib/pack3d/art";
import { Sparks, glowPlane, glowTexture, rayFan, starfield } from "@/lib/pack3d/fx";
import { PACK_H, PACK_W, TEAR_V, TEAR_Y, peelStrip, surface, tearFront, type SurfaceArrays } from "@/lib/pack3d/shape";
import { createPackSound, type PackSound } from "@/lib/pack3d/sound";
import {
  Tweens,
  bump,
  clamp,
  easeInCubic,
  easeInOutCubic,
  easeInOutSine,
  easeOutBack,
  easeOutCubic,
  lerp,
  linear,
  springStep,
  type SpringState,
} from "@/lib/pack3d/tween";

export type StagePhase = "sealed" | "ripping" | "opening" | "reveal" | "spread";
export type StageView = { phase: StagePhase; step: number; faceUp: boolean; exitDir: number };
export type StageCard = { id: string; image: string; tier: "soft" | "holo" | "rare" | "chase" };
export type StagePack = { name: string; finish: Finish };

export type StageEvents = {
  /** The pack was tapped or clicked without a drag. */
  onPackTap(): void;
  /** The strip has torn all the way off. */
  onTorn(): void;
  /** The cards are out of the pack and waiting on the table. */
  onOpened(): void;
  /** The card in front was tapped. */
  onCardTap(): void;
  /** The card in front was thrown: -1 to the left, 1 to the right. */
  onCardThrow(direction: number): void;
  /** WebGL went away; fall back to the 2D pack. */
  onLost(): void;
};

export type StageOptions = {
  fonts: { display: string; body: string };
  logo: HTMLImageElement | null;
  sound: boolean;
};

export type PackStage = {
  deal(pack: StagePack, cards: StageCard[]): void;
  sync(view: StageView): void;
  setSound(on: boolean): void;
  /** Starts audio; call from a click or key press. */
  unlockSound(): void;
  setVisible(visible: boolean): void;
  layout(): void;
  dispose(): void;
};

/** Cards are drawn at 63 by 88, a little narrower than the pack. */
const CARD_W = 1.72;
const CARD_H = (CARD_W * 88) / 63;
/** The cards' centre inside the sealed pack, and how high they rise out of it. */
const CARD_IN_PACK = -0.1;
const CARD_RISEN = 1.02;
const STACK_GAP = 0.011;
/** The sealed pack sits a little low, leaving room for the cards to rise. */
const PACK_REST_Y = -0.22;
const FOV = 28;
/** The stage frame shows at least this much of the scene, in scene units. */
const FIT_H = 4.6;
const FIT_W = 3.3;
/** On the table the cards are drawn bigger than inside the pack. */
const TABLE_SCALE = 1.2;
const TABLE_POS = new Vector3(0, 0.05, 0.25);
const FRONT = new Vector3(0, 0.02, 0.62);
const FRONT_SCALE = 1.05;
const DRAG_SLOP = 6;
/** A drag tear let go past this point, or flicked, finishes by itself. */
const TEAR_COMMIT = 0.6;
const TEAR_FLICK = 700;
/** A drag across this share of the pack's width tears it all the way. */
const TEAR_REACH = 0.75;
const THROW_DISTANCE = 90;
const THROW_SPEED = 650;
const HOLO: Record<StageCard["tier"], number> = { soft: 0, holo: 0.28, rare: 0.4, chase: 0.5 };

type Card = {
  data: StageCard | null;
  root: Group;
  tilt: Group;
  flip: Group;
  face: Mesh<PlaneGeometry, MeshStandardMaterial>;
  back: Mesh<PlaneGeometry, MeshStandardMaterial>;
  holo: { value: number };
  shift: { value: number };
  state: "pack" | "stack" | "front" | "gone";
  tiltX: SpringState;
  tiltY: SpringState;
};

type TearDrag = { id: number; x: number; y: number; from: number; moved: boolean; lastX: number; lastT: number; velocity: number };
type CardDrag = { id: number; x: number; y: number; lastX: number; lastT: number; velocity: number; moved: boolean };

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported here.
  }
}

function canvasTexture(canvas: HTMLCanvasElement, color = true) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  return texture;
}

function sheet(arrays: SurfaceArrays) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(arrays.positions.slice(), 3));
  geometry.setAttribute("uv", new BufferAttribute(arrays.uvs, 2));
  geometry.setIndex(new BufferAttribute(arrays.indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * What the foil reflects: a night sky, dark below and deep blue above, with a soft
 * white key light, violet and teal strips at the sides, and a warm band overhead.
 * Bright enough for the foil to flash as it turns, never enough to drown the print.
 */
function nightRoom() {
  const room = new Scene();
  room.add(
    new Mesh(
      new SphereGeometry(20, 32, 16),
      new ShaderMaterial({
        side: BackSide,
        vertexShader: /* glsl */ `
          varying vec3 vDirection;
          void main() {
            vDirection = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vDirection;
          void main() {
            float h = vDirection.y;
            vec3 top = vec3(0.12, 0.14, 0.34);
            vec3 middle = vec3(0.04, 0.045, 0.12);
            vec3 low = vec3(0.012, 0.012, 0.03);
            gl_FragColor = vec4(h > 0.0 ? mix(middle, top, h) : mix(middle, low, -h), 1.0);
          }`,
      }),
    ),
  );
  const strip = (r: number, g: number, b: number, width: number, height: number, x: number, y: number, z: number) => {
    const mesh = new Mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ color: new Color(r, g, b), side: DoubleSide }));
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  strip(3.4, 3.2, 3, 7, 4.5, -6, 7, 8);
  strip(2, 1.2, 3, 2.4, 12, 9, 1, -1);
  strip(0.6, 2.4, 2, 2.4, 12, -9, -1, -1);
  strip(2.8, 2.1, 1.4, 10, 1.6, 0, 9, -5);
  strip(0.9, 1, 1.6, 14, 2, 0, -6, 7);
  return room;
}

/** A one-pixel white texture, so materials compile with a map before the real one loads. */
function blankTexture() {
  const texture = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Card fronts: the scan, lit like glossy card stock, with a rainbow that slides across
 * holo cards as they turn. Strength comes from the card's rarity.
 */
function cardFaceMaterial(map: Texture, corners: Texture, env: Texture, holo: { value: number }, shift: { value: number }) {
  const material = new MeshStandardMaterial({
    map,
    envMap: env,
    alphaMap: corners,
    alphaTest: 0.5,
    roughness: 0.55,
    metalness: 0,
    emissive: new Color("#ffffff"),
    emissiveMap: map,
    emissiveIntensity: 0.24,
    envMapIntensity: 0.4,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHolo = holo;
    shader.uniforms.uShift = shift;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uHolo;\nuniform float uShift;")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        if (uHolo > 0.0) {
          vec3 toEye = normalize(vViewPosition);
          float facing = dot(normal, toEye);
          float band = vMapUv.x * 0.85 + vMapUv.y * 1.25 + facing * 2.4 + uShift;
          vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (band + vec3(0.0, 0.33, 0.67)));
          float light = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          float glint = pow(max(0.0, sin((band * 1.7 + vMapUv.x * 2.0) * 6.28318)), 14.0);
          totalEmissiveRadiance += rainbow * uHolo * (0.08 + 0.4 * light) + vec3(glint * uHolo * 0.5);
        }`,
      );
  };
  material.customProgramCacheKey = () => "pokeid-card-holo";
  return material;
}

class Stage implements PackStage {
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private scene = new Scene();
  private camera = new PerspectiveCamera(FOV, 1, 0.1, 140);
  private tweens = new Tweens();
  private sound: PackSound;
  private raycaster = new Raycaster();
  private loader = new TextureLoader();
  private anisotropy: number;
  /** Reflections for every lit material. Set per material, not on the scene: three.js
   * ignores a material's own envMapIntensity when it borrows scene.environment. */
  private env: Texture;

  private view: StageView = { phase: "sealed", step: 0, faceUp: false, exitDir: -1 };
  /** Bumped by every deal; a running sequence stops when it no longer matches. */
  private run = 0;
  private time = 0;
  private visible = true;
  private running = false;
  private frameId = 0;
  private last = 0;
  private ppu = 100;
  /** Scales the pixel ratio down on devices that cannot keep up; never below 1. */
  private quality = 1;
  private frames = 0;
  private slowFrames = 0;
  private disposed = false;

  // Pointer, in canvas coordinates for picking and stage-relative for leaning.
  private ndc = new Vector2();
  private look = { x: 0, y: 0, inside: false };
  private lookX: SpringState = { value: 0, velocity: 0 };
  private lookY: SpringState = { value: 0, velocity: 0 };
  private tearDrag: TearDrag | null = null;
  private cardDrag: CardDrag | null = null;

  // The pack.
  private packRoot = new Group();
  private packSway = new Group();
  private strip = new Group();
  private stripMeshes: Mesh[] = [];
  private stripFrontBase: Float32Array;
  private stripBackBase: Float32Array;
  private stripFront: BufferGeometry;
  private stripBack: BufferGeometry;
  private frontMaterial: MeshPhysicalMaterial;
  private backMaterial: MeshPhysicalMaterial;
  private innerMaterial: MeshStandardMaterial;
  private packKey = "";
  private packTextures: Texture[] = [];
  private tear = 0;
  private lastTear = 0;
  private tearLevel = 0;
  private shake = 0;
  private entered: Promise<boolean> = Promise.resolve(true);
  private packReady = false;
  private stripFlight: { velocity: Vector3; spin: Vector3; age: number } | null = null;
  private leak: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private hint: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private hintLevel = 0;

  // Light.
  private sparks = new Sparks(360);
  private stars = starfield();
  private backdrop: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private burstGlow: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private burstRays: ReturnType<typeof rayFan>;
  private burstLight = new PointLight("#ffe3b3", 0, 9, 1.6);
  private hitFx = new Group();
  private hitGlow: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private hitFlash: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private hitRays: ReturnType<typeof rayFan>;
  private hitPlate: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private hitState: "none" | "waiting" | "shown" = "none";

  // The cards.
  private cardsRoot = new Group();
  private cards: Card[] = [];
  private cardGeometry = new PlaneGeometry(CARD_W, CARD_H);
  private cornerTexture: Texture;
  private cardBackTexture: Promise<Texture>;
  private cardTextures = new Map<string, Promise<Texture>>();
  private texturesReady: Promise<unknown> = Promise.resolve();
  private placeholder = blankTexture();
  private shared: Texture[] = [];

  constructor(
    private container: HTMLElement,
    private frame: HTMLElement,
    private events: StageEvents,
    private options: StageOptions,
  ) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "rip-canvas";
    container.appendChild(this.canvas);

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: "high-performance" });
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());

    // Multisampled, so the foil's edges stay smooth; dense screens need fewer samples.
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: window.devicePixelRatio >= 2 ? 2 : 4 });
    this.composer = new EffectComposer(this.renderer, target);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Only light brighter than white blooms: the bursts, sparks, and glints, not the print.
    this.bloom = new UnrealBloomPass(new Vector2(256, 256), 0.55, 0.45, 1.4);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    const pmrem = new PMREMGenerator(this.renderer);
    const room = nightRoom();
    this.env = this.share(pmrem.fromScene(room, 0.02).texture);
    room.traverse((object) => {
      const mesh = object as Mesh;
      mesh.geometry?.dispose();
      (mesh.material as Material | undefined)?.dispose();
    });
    pmrem.dispose();

    this.sound = createPackSound(!options.sound);
    this.camera.position.set(0, 0, 12);

    this.backdrop = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({ map: this.share(canvasTexture(paintBackdrop())), depthWrite: false }),
    );
    this.backdrop.position.z = -60;
    this.backdrop.renderOrder = -2;
    this.scene.add(this.backdrop, this.stars);
    this.stars.renderOrder = -1;

    this.addLights();

    // The pack: two foil sheets for the body, two for the strip, each with a silver inside.
    const creases = this.share(canvasTexture(paintCreases(), false));
    const foil = () =>
      new MeshPhysicalMaterial({
        map: this.placeholder,
        roughnessMap: this.placeholder,
        metalnessMap: this.placeholder,
        roughness: 1,
        metalness: 1,
        envMap: this.env,
        normalMap: creases,
        normalScale: new Vector2(0.4, 0.4),
        iridescence: 0.3,
        iridescenceIOR: 1.4,
        iridescenceThicknessRange: [200, 480],
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
        envMapIntensity: 1,
      });
    this.frontMaterial = foil();
    this.backMaterial = foil();
    this.innerMaterial = new MeshStandardMaterial({
      color: "#8e95a6",
      metalness: 0.9,
      roughness: 0.36,
      envMap: this.env,
      envMapIntensity: 0.9,
      normalMap: creases,
      normalScale: new Vector2(0.6, 0.6),
      side: BackSide,
    });

    const bodyFront = sheet(surface(0, TEAR_V, 44, 1));
    const bodyBack = sheet(surface(0, TEAR_V, 44, -1));
    const stripFront = surface(TEAR_V, 1, 8, 1);
    const stripBack = surface(TEAR_V, 1, 8, -1);
    this.stripFrontBase = stripFront.positions;
    this.stripBackBase = stripBack.positions;
    this.stripFront = sheet(stripFront);
    this.stripBack = sheet(stripBack);

    this.packSway.add(
      new Mesh(bodyFront, this.frontMaterial),
      new Mesh(bodyFront, this.innerMaterial),
      new Mesh(bodyBack, this.backMaterial),
      new Mesh(bodyBack, this.innerMaterial),
    );
    // The strip turns about its own middle when it flies off.
    const stripMiddle = TEAR_Y + ((1 - TEAR_V) * PACK_H) / 2;
    this.strip.position.y = stripMiddle;
    this.stripMeshes = [
      new Mesh(this.stripFront, this.frontMaterial),
      new Mesh(this.stripFront, this.innerMaterial),
      new Mesh(this.stripBack, this.backMaterial),
      new Mesh(this.stripBack, this.innerMaterial),
    ];
    for (const mesh of this.stripMeshes) {
      mesh.position.y = -stripMiddle;
      this.strip.add(mesh);
    }
    this.packSway.add(this.strip);

    // Light inside the pack, seen only through the gap the tear opens.
    this.leak = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshBasicMaterial({
        map: this.share(canvasTexture(paintLeak())),
        color: new Color(2, 1.8, 1.4),
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.leak.renderOrder = 2;
    this.packSway.add(this.leak);

    // "Swipe across to tear", floating over the pack until the tear starts.
    this.hint = new Mesh(
      new PlaneGeometry(2.6, 0.325),
      new MeshBasicMaterial({ map: this.share(canvasTexture(paintHint(options.fonts.body))), transparent: true, opacity: 0, depthWrite: false }),
    );
    this.hint.position.set(0.1, PACK_H / 2 + 0.32, 0.2);
    this.hint.renderOrder = 4;
    this.packRoot.add(this.hint);

    const glow = this.share(glowTexture());
    this.burstGlow = glowPlane(glow, "#ffffff", 1);
    this.burstGlow.material.color.setRGB(2.4, 2.1, 1.6);
    this.burstGlow.position.set(0, TEAR_Y + 0.1, 0.25);
    this.burstRays = rayFan(glow, "#fff0cc", 11, 2.6, 4.2, 9);
    this.burstRays.material.color.setRGB(1.8, 1.6, 1.25);
    this.burstRays.group.position.set(0, TEAR_Y, -0.05);
    this.burstLight.position.set(0, TEAR_Y + 0.5, 0.9);
    this.packSway.add(this.burstGlow, this.burstRays.group, this.burstLight);

    this.packRoot.add(this.packSway);
    this.packRoot.position.y = PACK_REST_Y;
    this.packRoot.visible = false;
    this.scene.add(this.packRoot);

    // The hit's halo, rays, and plate sit behind and above the card in front.
    const gold = this.share(glowTexture("255,226,160"));
    this.hitGlow = glowPlane(gold, "#ffd27a", 1);
    this.hitGlow.material.color.setRGB(1.7, 1.55, 1.05);
    this.hitFlash = glowPlane(glow, "#ffffff", 1);
    this.hitFlash.material.color.setRGB(2.6, 2.4, 2);
    this.hitRays = rayFan(gold, "#ffd27a", 16, Math.PI * 2 * (15 / 16), 3.6, 4);
    this.hitRays.material.color.setRGB(1.5, 1.15, 0.45);
    this.hitPlate = new Mesh(
      new PlaneGeometry(1.15, 0.29),
      new MeshBasicMaterial({ map: this.share(canvasTexture(paintPlate("The hit", options.fonts.body))), transparent: true, opacity: 0, depthWrite: false }),
    );
    this.hitPlate.position.set(0, CARD_H / 2 + 0.3, 0.4);
    this.hitPlate.renderOrder = 4;
    this.hitFx.add(this.hitRays.group, this.hitGlow, this.hitFlash, this.hitPlate);
    this.hitFx.position.set(FRONT.x, FRONT.y, FRONT.z - 0.25);
    this.hitFx.visible = false;
    this.cardsRoot.add(this.hitFx);

    // Five cards, reused from pack to pack.
    this.cornerTexture = this.share(canvasTexture(paintCardCorners(), false));
    this.cardBackTexture = this.loadTexture("/cards/back.jpg");
    for (let i = 0; i < 5; i++) this.cards.push(this.makeCard());
    this.packSway.add(this.cardsRoot);
    this.cardsRoot.position.y = CARD_IN_PACK;
    void this.cardBackTexture.then((texture) => {
      if (this.disposed) return;
      for (const card of this.cards) {
        card.back.material.map = texture;
        card.back.material.emissiveMap = texture;
        card.back.material.needsUpdate = true;
      }
    });

    this.scene.add(this.sparks.points);

    this.canvas.addEventListener("pointerdown", this.down);
    this.canvas.addEventListener("pointermove", this.move);
    this.canvas.addEventListener("pointerup", this.up);
    this.canvas.addEventListener("pointercancel", this.cancel);
    this.canvas.addEventListener("pointerleave", this.leave);
    this.canvas.addEventListener("webglcontextlost", this.lost);
    document.addEventListener("visibilitychange", this.visibility);

    this.layout();
    this.start();
  }

  private share<T extends Texture>(texture: T) {
    this.shared.push(texture);
    return texture;
  }

  private addLights() {
    this.scene.add(new HemisphereLight("#cdd6ff", "#251a3d", 0.7));
    const key = new DirectionalLight("#ffffff", 1.5);
    key.position.set(-2.5, 3.5, 5);
    const fill = new DirectionalLight("#b6a4ff", 0.45);
    fill.position.set(3, -1.5, 4);
    // Coloured lights behind catch the pack's edges as it turns.
    const violet = new PointLight("#9d84ff", 26, 18, 2);
    violet.position.set(3.6, 2.6, -2.4);
    const teal = new PointLight("#3fe0c5", 20, 18, 2);
    teal.position.set(-3.6, -1.6, -2.4);
    this.scene.add(key, fill, violet, teal);
  }

  private makeCard(): Card {
    const root = new Group();
    const tilt = new Group();
    const flip = new Group();
    const holo = { value: 0 };
    const shift = { value: 0 };
    const face = new Mesh(this.cardGeometry, cardFaceMaterial(this.placeholder, this.cornerTexture, this.env, holo, shift));
    face.position.z = 0.003;
    const back = new Mesh(
      this.cardGeometry,
      new MeshStandardMaterial({
        map: this.placeholder,
        envMap: this.env,
        alphaMap: this.cornerTexture,
        alphaTest: 0.5,
        roughness: 0.5,
        emissive: new Color("#ffffff"),
        emissiveMap: this.placeholder,
        emissiveIntensity: 0.2,
        envMapIntensity: 0.45,
      }),
    );
    back.rotation.y = Math.PI;
    back.position.z = -0.003;
    flip.add(face, back);
    tilt.add(flip);
    root.add(tilt);
    this.cardsRoot.add(root);
    return {
      data: null,
      root,
      tilt,
      flip,
      face,
      back,
      holo,
      shift,
      state: "pack",
      tiltX: { value: 0, velocity: 0 },
      tiltY: { value: 0, velocity: 0 },
    };
  }

  private loadTexture(url: string) {
    let texture = this.cardTextures.get(url);
    if (!texture) {
      texture = this.loader
        .loadAsync(url)
        .catch(() => new CanvasTexture(paintMissingCard(this.options.fonts.body)))
        .then((loaded) => {
          loaded.colorSpace = SRGBColorSpace;
          loaded.anisotropy = this.anisotropy;
          if (this.disposed) loaded.dispose();
          return loaded;
        });
      this.cardTextures.set(url, texture);
    }
    return texture;
  }

  // ---------------------------------------------------------------- layout and loop

  layout() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height || this.disposed) return;
    const box = this.container.getBoundingClientRect();
    const rect = this.frame.getBoundingClientRect();
    const cx = rect.left - box.left + rect.width / 2;
    const cy = rect.top - box.top + rect.height / 2;
    this.ppu = Math.max(20, Math.min(rect.height / FIT_H, rect.width / FIT_W));
    const tan = Math.tan((FOV * Math.PI) / 360);
    const distance = height / (2 * this.ppu * tan);
    this.camera.aspect = width / height;
    this.camera.position.set(0, distance * 0.045, distance);
    this.camera.lookAt(0, 0, 0);
    // Centre the scene on the stage frame rather than the middle of the canvas.
    this.camera.setViewOffset(width, height, width / 2 - cx, height / 2 - cy, width, height);
    this.camera.updateProjectionMatrix();

    const best = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4.2e6 / (width * height)));
    const ratio = Math.max(Math.min(1, best), best * this.quality);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(width, height);
    this.sparks.setScale((height * ratio * this.camera.projectionMatrix.elements[5]) / 2);
    this.stars.material.uniforms.uPixelRatio.value = ratio;

    // The sky is centred on the stage and big enough to fill the view, offset included.
    const tall = 2 * (distance + 60) * tan * 2.2;
    this.backdrop.scale.set(tall * Math.max(1, this.camera.aspect), tall, 1);
    this.render();
  }

  private start() {
    if (this.running || !this.visible || document.hidden || this.disposed) return;
    this.running = true;
    this.last = performance.now();
    this.frameId = requestAnimationFrame(this.loop);
  }

  private stop() {
    cancelAnimationFrame(this.frameId);
    this.running = false;
  }

  private loop = (now: number) => {
    this.frameId = requestAnimationFrame(this.loop);
    // Long gaps (a busy main thread, a background tab) step at most a tenth of a second.
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.adapt(dt);
    this.update(dt);
    this.render();
  };

  private render() {
    this.composer.render();
  }

  /**
   * If most of the last two seconds of frames ran slower than 35 a second, draw
   * fewer pixels: a step down each time, until the canvas matches CSS pixels.
   */
  private adapt(dt: number) {
    this.frames += 1;
    if (dt > 1 / 35) this.slowFrames += 1;
    if (this.frames < 120) return;
    const slow = this.slowFrames / this.frames > 0.6;
    this.frames = 0;
    this.slowFrames = 0;
    const best = Math.min(window.devicePixelRatio || 1, 2);
    if (!slow || best * this.quality <= 1) return;
    this.quality = Math.max(1 / best, this.quality * 0.75);
    this.layout();
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) this.start();
    else this.stop();
  }

  private visibility = () => {
    if (document.hidden) this.stop();
    else this.start();
  };

  private lost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.events.onLost();
  };

  // ---------------------------------------------------------------- frame update

  private update(dt: number) {
    this.time += dt;
    this.tweens.update(dt);
    const t = this.time;

    springStep(this.lookX, this.look.inside ? this.look.x : 0, 38, 10, dt);
    springStep(this.lookY, this.look.inside ? this.look.y : 0, 38, 10, dt);

    // The pack floats, and leans toward the pointer while it waits to be torn.
    const sealed = this.view.phase === "sealed" || this.view.phase === "ripping";
    const lean = sealed ? 1 : 0.4;
    const sway = this.packSway;
    sway.position.y = 0.055 * Math.sin(t * 1.2);
    sway.rotation.y = this.lookX.value * 0.34 * lean + 0.07 * Math.sin(t * 0.5);
    sway.rotation.x = -this.lookY.value * 0.18 * lean + 0.025 * Math.sin(t * 0.8);
    sway.rotation.z = 0.014 * Math.sin(t * 0.9) + this.shake - this.tearLevel * 0.03;

    this.updateTear(dt);
    this.updateStrip(dt);

    // The hint fades in once the pack has landed, and out when the tear starts.
    const hintTarget = this.view.phase === "sealed" && this.packReady && this.tear === 0 ? 1 : 0;
    this.hintLevel += (hintTarget - this.hintLevel) * Math.min(1, dt * 5);
    this.hint.material.opacity = this.hintLevel * (0.75 + 0.25 * Math.sin(t * 2.4));
    this.hint.position.x = 0.1 + 0.05 * Math.sin(t * 2.4);
    this.hint.visible = this.hintLevel > 0.01;

    // The card in front leans toward the pointer; holo cards shimmer as they turn.
    for (let i = 0; i < this.cards.length; i++) {
      const card = this.cards[i];
      if (!card.root.visible) continue;
      const front = card.state === "front";
      springStep(card.tiltX, front ? -this.lookY.value * 0.24 : 0, 60, 12, dt);
      springStep(card.tiltY, front ? this.lookX.value * 0.36 : 0, 60, 12, dt);
      card.tilt.rotation.x = card.tiltX.value;
      card.tilt.rotation.y = card.tiltY.value;
      card.tilt.position.y = front ? 0.035 * Math.sin(t * 1.3) : 0;
      card.shift.value = t * 0.05 + card.tiltY.value * 1.1 + card.tiltX.value * 0.7 + card.flip.rotation.y * 0.3 + i * 0.37;
    }

    if (this.hitState !== "none") {
      this.hitRays.group.rotation.z = t * 0.12;
      if (this.hitState === "waiting") {
        const pulse = 0.5 + 0.5 * Math.sin(t * 4.2);
        this.hitGlow.material.opacity = 0.22 + 0.25 * pulse;
        this.hitGlow.scale.setScalar(3.1 + 0.25 * pulse);
      }
    }

    this.sparks.update(dt, t);
    this.stars.material.uniforms.uTime.value = t;
    this.stars.rotation.y = this.lookX.value * 0.012;
    this.stars.rotation.x = -this.lookY.value * 0.008;
  }

  /** Bends the strip to the current tear, and lets light through the gap. */
  private setTear(progress: number) {
    this.tear = clamp(progress);
    const tearX = tearFront(this.tear);
    for (const [base, geometry] of [
      [this.stripFrontBase, this.stripFront],
      [this.stripBackBase, this.stripBack],
    ] as const) {
      const position = geometry.attributes.position;
      peelStrip(base, position.array as Float32Array, this.tear > 0 ? tearX : -PACK_W);
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    }
    const left = -PACK_W / 2;
    const right = Math.min(PACK_W / 2, tearX);
    const width = Math.max(0.001, right - left);
    this.leak.position.set((left + right) / 2, TEAR_Y + 0.06, 0);
    this.leak.scale.set(width + 0.1, 0.42, 1);
  }

  private updateTear(dt: number) {
    const speed = dt > 0 ? (this.tear - this.lastTear) / dt : 0;
    this.lastTear = this.tear;
    // Smoothed tearing speed drives the sound, the tug on the pack, and the sparks.
    this.tearLevel += (Math.min(1.6, Math.abs(speed)) - this.tearLevel) * Math.min(1, dt * 14);
    this.sound.tear(this.tearLevel);
    const opening = this.view.phase === "opening" || this.stripFlight !== null;
    if (this.tear > 0 && !opening) {
      this.leak.material.opacity = 0.35 + 0.65 * Math.min(1, this.tear * 1.6) + this.tearLevel * 0.2;
    } else if (!opening) {
      this.leak.material.opacity = 0;
    }
    if (this.tearLevel > 0.08 && this.tear > 0 && this.tear < 1) {
      const front = new Vector3(Math.min(PACK_W / 2, tearFront(this.tear)), TEAR_Y + 0.03, 0.12);
      this.packSway.localToWorld(front);
      if (Math.random() < this.tearLevel * 0.9) {
        this.sparks.emit(front, {
          count: 1 + Math.round(this.tearLevel * 2),
          speed: [0.6, 1.8],
          up: 0.55,
          life: [0.35, 0.8],
          size: [0.03, 0.07],
          colors: ["#fff6d8", "#ffd96b", "#ffffff"],
          gravity: -3,
        });
      }
    }
  }

  private updateStrip(dt: number) {
    const flight = this.stripFlight;
    if (!flight) return;
    flight.age += dt;
    flight.velocity.y -= 5.2 * dt;
    this.strip.position.addScaledVector(flight.velocity, dt);
    this.strip.rotation.x += flight.spin.x * dt;
    this.strip.rotation.y += flight.spin.y * dt;
    this.strip.rotation.z += flight.spin.z * dt;
    if (flight.age > 0.8) this.strip.scale.setScalar(Math.max(0.001, 1 - (flight.age - 0.8) / 0.5));
    if (flight.age > 1.3) {
      this.strip.visible = false;
      this.stripFlight = null;
    }
  }

  // ---------------------------------------------------------------- dealing a pack

  deal(pack: StagePack, cards: StageCard[]) {
    this.run += 1;
    const run = this.run;
    this.tweens.cancelAll();
    this.tearDrag = null;
    this.cardDrag = null;
    this.view = { phase: "sealed", step: 0, faceUp: false, exitDir: -1 };
    this.paintPack(pack);

    // A fresh strip, sealed.
    this.stripFlight = null;
    this.strip.visible = true;
    this.strip.position.set(0, TEAR_Y + ((1 - TEAR_V) * PACK_H) / 2, 0);
    this.strip.rotation.set(0, 0, 0);
    this.strip.scale.setScalar(1);
    this.setTear(0);
    this.lastTear = 0;
    this.tearLevel = 0;
    this.shake = 0;
    this.leak.material.opacity = 0;
    this.burstGlow.material.opacity = 0;
    this.burstRays.material.opacity = 0;
    this.burstLight.intensity = 0;
    this.sparks.clear();
    this.setHit("none");

    // The cards go back inside the pack, face down, top card nearest the front.
    this.packSway.add(this.cardsRoot);
    this.cardsRoot.position.set(0, CARD_IN_PACK, 0);
    this.cardsRoot.rotation.set(0, 0, 0);
    this.cardsRoot.scale.setScalar(1);
    this.cards.forEach((card, i) => {
      card.data = cards[i] ?? null;
      card.state = "pack";
      card.root.visible = Boolean(card.data);
      card.root.position.copy(this.packSlot(i));
      card.root.rotation.set(0, 0, 0);
      card.root.scale.setScalar(1);
      card.flip.rotation.set(0, Math.PI, 0);
      card.flip.position.set(0, 0, 0);
      card.holo.value = card.data ? HOLO[card.data.tier] : 0;
    });
    this.texturesReady = Promise.all(
      this.cards.map(async (card) => {
        if (!card.data) return;
        const texture = await this.loadTexture(card.data.image);
        if (run !== this.run || this.disposed) return;
        card.face.material.map = texture;
        card.face.material.emissiveMap = texture;
        card.face.material.needsUpdate = true;
      }),
    );

    this.entered = this.enter(run);
  }

  private paintPack(pack: StagePack) {
    const key = `${pack.name}|${pack.finish}`;
    if (key === this.packKey) return;
    this.packKey = key;
    for (const texture of this.packTextures) texture.dispose();
    const art = { name: pack.name, finish: pack.finish, logo: this.options.logo, ...this.options.fonts };
    const front = canvasTexture(paintFront(art));
    const back = canvasTexture(paintBack(art));
    const frontSurface = canvasTexture(paintSurfaceMap(art, "front"), false);
    const backSurface = canvasTexture(paintSurfaceMap(art, "back"), false);
    for (const texture of [front, back]) texture.anisotropy = this.anisotropy;
    this.packTextures = [front, back, frontSurface, backSurface];
    for (const [material, map, surfaceMap] of [
      [this.frontMaterial, front, frontSurface],
      [this.backMaterial, back, backSurface],
    ] as const) {
      material.map = map;
      material.roughnessMap = surfaceMap;
      material.metalnessMap = surfaceMap;
      material.needsUpdate = true;
    }
  }

  /** Where card i sits inside the sealed pack. */
  private packSlot(i: number) {
    return new Vector3(0, 0, (2 - i) * STACK_GAP);
  }

  /** Where a waiting card sits on the table, `depth` cards down the stack. */
  private stackSlot(depth: number) {
    return new Vector3(depth * 0.016, -depth * 0.016, -depth * 0.03);
  }

  private async enter(run: number) {
    this.packReady = false;
    const root = this.packRoot;
    root.visible = true;
    root.scale.setScalar(1);
    const spin = Math.PI * 2.5;
    root.position.set(0, PACK_REST_Y - 1.2, -11);
    root.rotation.set(0.35, spin, -0.25);
    this.sound.whoosh(0.5);
    const landed = await this.tweens.add(
      1.3,
      linear,
      (_, t) => {
        const k = easeOutCubic(t);
        const settle = easeOutBack(1.15)(t);
        root.position.set(0, lerp(PACK_REST_Y - 1.2, PACK_REST_Y, settle), lerp(-11, 0, k));
        root.rotation.set(lerp(0.35, 0, k), lerp(spin, 0, easeOutCubic(Math.min(1, t * 1.08))), lerp(-0.25, 0, settle));
      },
      { key: "pack.enter" },
    );
    if (run !== this.run) return false;
    if (landed) this.packReady = true;
    return landed;
  }

  // ---------------------------------------------------------------- following React

  sync(next: StageView) {
    const prev = this.view;
    this.view = next;
    const run = this.run;
    if (next.phase === "ripping" && prev.phase === "sealed") {
      void this.autoTear(run);
    } else if (next.phase === "opening" && prev.phase !== "opening") {
      void this.open(run);
    } else if (next.phase === "reveal") {
      if (prev.phase !== "reveal" || next.step !== prev.step) {
        if (prev.phase === "reveal" && next.step > prev.step) this.toss(prev.step, next.exitDir);
        this.present(next.step);
      }
      if (next.faceUp && (!prev.faceUp || next.step !== prev.step || prev.phase !== "reveal")) this.flip(next.step);
    } else if (next.phase === "spread" && prev.phase !== "spread") {
      this.clearTable();
    }
  }

  private async autoTear(run: number) {
    this.tearDrag = null;
    await this.entered;
    if (run !== this.run || this.view.phase !== "ripping") return;
    // A quick shake, like a hand taking hold of the pack, then one clean tear.
    const gripped = await this.tweens.add(
      0.4,
      linear,
      (_, t) => {
        this.shake = Math.sin(t * Math.PI * 6) * 0.045 * (1 - t);
      },
      { key: "pack.shake" },
    );
    this.shake = 0;
    if (!gripped || run !== this.run) return;
    const from = this.tear;
    const torn = await this.tweens.add(lerp(0.32, 0.85, 1 - from), easeInOutSine, (k) => this.setTear(lerp(from, 1, k)), {
      key: "pack.tear",
    });
    if (!torn || run !== this.run) return;
    this.events.onTorn();
  }

  /** Finishes a drag tear that was let go of most of the way across. */
  private async finishTear(run: number) {
    const from = this.tear;
    const torn = await this.tweens.add(0.18 + (1 - from) * 0.4, easeOutCubic, (k) => this.setTear(lerp(from, 1, k)), {
      key: "pack.tear",
    });
    if (!torn || run !== this.run || this.view.phase !== "sealed") return;
    this.events.onTorn();
  }

  /** The strip pops off, light pours out, the cards rise, and the pack drops away. */
  private async open(run: number) {
    this.tearDrag = null;
    this.packReady = false;
    if (this.tear < 1) {
      const from = this.tear;
      await this.tweens.add(0.16, easeOutCubic, (k) => this.setTear(lerp(from, 1, k)), { key: "pack.tear" });
      if (run !== this.run) return;
    }
    this.sound.pop();
    vibrate([16, 40, 28]);
    this.stripFlight = {
      velocity: new Vector3(2.3, 3.3, 1.2),
      spin: new Vector3(1.1, 0.6, -2.4),
      age: 0,
    };
    this.burst();

    // The cards rise out of the opening.
    this.sound.whoosh(0.9);
    void this.tweens.add(0.8, easeOutBack(1.2), (k) => {
      this.cardsRoot.position.y = lerp(CARD_IN_PACK, CARD_RISEN, k);
    }, { delay: 0.12, key: "cards.rise" });
    const risen = await this.tweens.wait(1.0);
    if (!risen || run !== this.run) return;

    // Hand the cards to the table and let the pack fall away.
    this.scene.attach(this.cardsRoot);
    this.cards.forEach((card) => {
      if (card.state === "pack") card.state = "stack";
    });
    const root = this.packRoot;
    void this.tweens
      .add(0.7, easeInCubic, (k) => {
        root.position.y = lerp(PACK_REST_Y, PACK_REST_Y - 6.5, k);
        root.rotation.x = lerp(0, 0.55, k);
        root.rotation.z = lerp(0, -0.12, k);
      }, { key: "pack.drop" })
      .then((dropped) => {
        if (dropped && run === this.run) root.visible = false;
      });
    const position = this.cardsRoot.position.clone();
    const rotation = this.cardsRoot.quaternion.clone();
    const scale = this.cardsRoot.scale.x;
    const level = new Quaternion();
    const slots = this.cards.map((card) => card.root.position.clone());
    const settled = await this.tweens.add(
      0.8,
      easeInOutCubic,
      (k) => {
        this.cardsRoot.position.lerpVectors(position, TABLE_POS, k);
        this.cardsRoot.quaternion.slerpQuaternions(rotation, level, k);
        this.cardsRoot.scale.setScalar(lerp(scale, TABLE_SCALE, k));
        this.cards.forEach((card, i) => card.root.position.lerpVectors(slots[i], this.stackSlot(i), k));
      },
      { delay: 0.05, key: "cards.table" },
    );
    if (!settled || run !== this.run) return;
    await this.texturesReady;
    if (run !== this.run) return;
    this.events.onOpened();
  }

  private burst() {
    this.burstGlow.material.opacity = 0;
    this.burstRays.group.scale.set(1, 0.01, 1);
    void this.tweens.add(
      1.6,
      linear,
      (_, t) => {
        const flash = t < 0.12 ? t / 0.12 : Math.pow(1 - (t - 0.12) / 0.88, 2.2);
        this.burstGlow.material.opacity = flash * 0.85;
        this.burstGlow.scale.setScalar(0.6 + easeOutCubic(Math.min(1, t * 2.2)) * 3.2);
        this.burstRays.material.opacity = flash * 0.5;
        this.burstRays.group.scale.set(1, 0.05 + easeOutCubic(Math.min(1, t * 2.6)) * 0.95, 1);
        this.burstRays.group.rotation.z = Math.sin(t * 2) * 0.08;
        this.burstLight.intensity = flash * 26;
        this.leak.material.opacity = Math.max(0, 1 - t * 3);
      },
      { key: "fx.burst" },
    );
    const origin = new Vector3(0, TEAR_Y + 0.05, 0.1);
    this.packSway.localToWorld(origin);
    this.sparks.emit(origin, {
      count: 110,
      speed: [2.2, 6.2],
      up: 0.78,
      spreadX: 0.5,
      radius: 0.7,
      life: [0.8, 1.9],
      size: [0.05, 0.15],
      colors: ["#fff7de", "#ffd96b", "#9ff3e2", "#c9b8ff", "#ffffff"],
      gravity: -4.6,
    });
  }

  // ---------------------------------------------------------------- the reveal

  private present(step: number) {
    const card = this.cards[step];
    if (!card?.data) return;
    card.state = "front";
    card.root.visible = true;
    const from = card.root.position.clone();
    const scale = card.root.scale.x;
    void this.tweens.add(0.55, easeOutCubic, (k) => {
      card.root.position.lerpVectors(from, FRONT, k);
      card.root.scale.setScalar(lerp(scale, FRONT_SCALE, k));
    }, { key: `card${step}.move` });
    // The rest of the stack moves up a place.
    for (let i = step + 1; i < this.cards.length; i++) {
      const waiting = this.cards[i];
      if (!waiting.data) continue;
      const start = waiting.root.position.clone();
      const slot = this.stackSlot(i - step - 1);
      void this.tweens.add(0.4, easeOutCubic, (k) => waiting.root.position.lerpVectors(start, slot, k), {
        delay: 0.08,
        key: `card${i}.move`,
      });
    }
    this.sound.whoosh(0.35);
    if (step === this.lastCard()) this.setHit("waiting");
  }

  private lastCard() {
    let last = -1;
    this.cards.forEach((card, i) => {
      if (card.data) last = i;
    });
    return last;
  }

  private flip(step: number) {
    const card = this.cards[step];
    if (!card?.data || card.state !== "front") return;
    const hit = step === this.lastCard();
    const from = card.flip.rotation.y;
    if (from === 0) return;
    const duration = hit ? 1.05 : 0.62;
    this.sound.flip();
    void this.tweens.add(duration, easeInOutCubic, (k, t) => {
      card.flip.rotation.y = lerp(from, 0, k);
      card.flip.position.z = (hit ? 0.7 : 0.4) * bump(t);
      card.flip.position.y = 0.1 * bump(t);
    }, { key: `card${step}.flip` });
    if (hit) {
      void this.tweens.wait(duration * 0.55, `card${step}.hit`).then((ok) => {
        if (ok && this.view.phase === "reveal" && this.view.step === step) this.revealHit(card);
      });
    }
  }

  private revealHit(card: Card) {
    this.setHit("shown");
    this.sound.shimmer();
    vibrate([24, 50, 24, 50, 60]);
    const origin = new Vector3();
    card.root.getWorldPosition(origin);
    this.sparks.emit(origin, {
      count: 140,
      speed: [2, 6.5],
      up: 0.25,
      spreadX: 0.6,
      radius: 1.2,
      life: [0.9, 2.2],
      size: [0.05, 0.14],
      colors: ["#fff3c4", "#ffd27a", "#f8dc85", "#ffffff", "#ffe9a8"],
      gravity: -2.2,
    });
    void this.tweens.add(1.4, linear, (_, t) => {
      const flash = t < 0.1 ? t / 0.1 : Math.pow(1 - (t - 0.1) / 0.9, 2);
      this.hitFlash.material.opacity = flash;
      this.hitFlash.scale.setScalar(2 + easeOutCubic(Math.min(1, t * 1.8)) * 4.2);
      const rise = easeOutCubic(Math.min(1, t * 1.6));
      this.hitGlow.material.opacity = 0.35 + 0.35 * rise;
      this.hitGlow.scale.setScalar(3.4 + rise * 1.4);
      this.hitRays.material.opacity = rise * 0.45;
      this.hitRays.group.scale.setScalar(0.4 + rise * 0.6);
      this.hitPlate.material.opacity = easeOutCubic(clamp((t - 0.25) * 3));
      this.hitPlate.position.y = CARD_H / 2 + 0.3 + (1 - easeOutBack(1.6)(clamp((t - 0.25) * 2.5))) * -0.25;
    }, { key: "fx.hit" });
  }

  private setHit(state: "none" | "waiting" | "shown") {
    this.hitState = state;
    this.hitFx.visible = state !== "none";
    if (state === "none") this.tweens.cancel("fx.hit");
    if (state !== "shown") {
      this.hitFlash.material.opacity = 0;
      this.hitRays.material.opacity = 0;
      this.hitPlate.material.opacity = 0;
    }
  }

  private toss(step: number, direction: number) {
    const card = this.cards[step];
    if (!card?.data || card.state === "gone") return;
    card.state = "gone";
    this.tweens.cancel(`card${step}.flip`);
    this.tweens.cancel(`card${step}.hit`);
    const dir = direction < 0 ? -1 : 1;
    const from = card.root.position.clone();
    const spin = card.flip.rotation.z;
    const turn = card.flip.rotation.y;
    this.sound.whoosh(0.7);
    void this.tweens
      .add(0.5, easeInCubic, (k, t) => {
        card.root.position.set(lerp(from.x, dir * 7.5, k), from.y + 0.7 * bump(t * 0.8), lerp(from.z, from.z + 0.5, k));
        card.flip.rotation.z = lerp(spin, -dir * 0.85, k);
        card.flip.rotation.y = lerp(turn, turn + dir * 0.5, k);
      }, { key: `card${step}.move` })
      .then((ok) => {
        if (ok) card.root.visible = false;
      });
    if (step === this.lastCard()) this.setHit("none");
  }

  /** Everything still on the table drops away so the cards can be laid out below. */
  private clearTable() {
    this.tweens.cancel("fx.hit");
    if (this.hitState !== "none") {
      // Stop the waiting pulse so it does not fight the fade.
      this.hitState = "shown";
      const glow = this.hitGlow.material.opacity;
      const rays = this.hitRays.material.opacity;
      const plate = this.hitPlate.material.opacity;
      void this.tweens
        .add(0.4, easeOutCubic, (k) => {
          this.hitGlow.material.opacity = glow * (1 - k);
          this.hitRays.material.opacity = rays * (1 - k);
          this.hitPlate.material.opacity = plate * (1 - k);
        }, { key: "fx.clear" })
        .then((ok) => {
          if (ok) this.setHit("none");
        });
    }
    this.cards.forEach((card, i) => {
      if (!card.root.visible || card.state === "gone") return;
      card.state = "gone";
      const from = card.root.position.clone();
      const scale = card.root.scale.x;
      void this.tweens
        .add(0.55, easeInCubic, (k) => {
          card.root.position.set(from.x, lerp(from.y, from.y - 4.2, k), lerp(from.z, from.z - 1.5, k));
          card.root.scale.setScalar(lerp(scale, scale * 0.85, k));
        }, { delay: i * 0.035, key: `card${i}.move` })
        .then((ok) => {
          if (ok) card.root.visible = false;
        });
    });
  }

  // ---------------------------------------------------------------- input

  private updatePointer(event: PointerEvent) {
    const box = this.canvas.getBoundingClientRect();
    this.ndc.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
    const rect = this.frame.getBoundingClientRect();
    this.look.x = clamp(((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 1.2, -1, 1);
    this.look.y = clamp(((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 1.2, -1, 1);
    this.look.inside = true;
  }

  private pick(objects: Object3D[]) {
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.intersectObjects(objects, true).length > 0;
  }

  private hitsPack() {
    return this.packRoot.visible && this.pick([this.packSway]);
  }

  private frontCard() {
    if (this.view.phase !== "reveal") return null;
    const card = this.cards[this.view.step];
    return card && card.state === "front" && this.pick([card.root]) ? card : null;
  }

  private down = (event: PointerEvent) => {
    if (event.button !== 0) return;
    this.sound.unlock();
    this.updatePointer(event);
    if (this.view.phase === "sealed" && this.hitsPack()) {
      this.tearDrag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        from: this.tear,
        moved: false,
        lastX: event.clientX,
        lastT: event.timeStamp,
        velocity: 0,
      };
      this.canvas.setPointerCapture(event.pointerId);
      return;
    }
    const card = this.frontCard();
    if (card) {
      this.cardDrag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        lastX: event.clientX,
        lastT: event.timeStamp,
        velocity: 0,
        moved: false,
      };
      this.canvas.setPointerCapture(event.pointerId);
    }
  };

  private move = (event: PointerEvent) => {
    this.updatePointer(event);
    const tear = this.tearDrag;
    if (tear && tear.id === event.pointerId) {
      const dx = event.clientX - tear.x;
      const dy = event.clientY - tear.y;
      if (!tear.moved) {
        // Only a sideways drag tears; anything else is a tap or a scroll.
        if (Math.abs(dx) < DRAG_SLOP || Math.abs(dx) < Math.abs(dy) || !this.packReady) return;
        tear.moved = true;
        tear.x = event.clientX;
      }
      const dt = Math.max(1, event.timeStamp - tear.lastT) / 1000;
      tear.velocity = (event.clientX - tear.lastX) / dt;
      tear.lastX = event.clientX;
      tear.lastT = event.timeStamp;
      const progress = tear.from + (event.clientX - tear.x) / (this.ppu * PACK_W * TEAR_REACH);
      if (progress > this.tear) {
        // Each stretch of new tear gives a tiny tick on phones that can buzz.
        if (Math.floor(progress * 14) > Math.floor(this.tear * 14)) vibrate(5);
        this.setTear(progress);
      }
      if (this.tear >= 1) {
        this.tearDrag = null;
        this.events.onTorn();
      }
      return;
    }
    const drag = this.cardDrag;
    if (drag && drag.id === event.pointerId) {
      const dx = event.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_SLOP || !this.view.faceUp) return;
        drag.moved = true;
        this.tweens.cancel(`card${this.view.step}.move`);
      }
      const dt = Math.max(1, event.timeStamp - drag.lastT) / 1000;
      drag.velocity = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
      const card = this.cards[this.view.step];
      const offset = dx / (this.ppu * TABLE_SCALE);
      card.root.position.set(FRONT.x + offset, FRONT.y + Math.abs(offset) * 0.06, FRONT.z);
      card.flip.rotation.z = -offset * 0.1;
      return;
    }
    this.canvas.style.cursor =
      this.view.phase === "sealed" && this.hitsPack() ? "grab" : this.frontCard() ? "pointer" : "";
  };

  private up = (event: PointerEvent) => {
    // On touch screens the first lift, not the first touch, is what lets audio start.
    this.sound.unlock();
    const tear = this.tearDrag;
    if (tear && tear.id === event.pointerId) {
      this.tearDrag = null;
      const flicked = event.timeStamp - tear.lastT < 90 && tear.velocity > TEAR_FLICK;
      if (!tear.moved) this.events.onPackTap();
      else if (this.tear >= TEAR_COMMIT || (flicked && this.tear > 0.15)) void this.finishTear(this.run);
      return;
    }
    const drag = this.cardDrag;
    if (drag && drag.id === event.pointerId) {
      this.cardDrag = null;
      if (!drag.moved) {
        this.events.onCardTap();
        return;
      }
      const dx = event.clientX - drag.x;
      const speed = event.timeStamp - drag.lastT > 90 ? 0 : drag.velocity;
      if (Math.abs(dx) > THROW_DISTANCE || Math.abs(speed) > THROW_SPEED) {
        this.events.onCardThrow(Math.sign(dx || speed) || -1);
      } else {
        this.settleCard(this.view.step);
      }
    }
  };

  private cancel = (event: PointerEvent) => {
    if (this.tearDrag?.id === event.pointerId) this.tearDrag = null;
    if (this.cardDrag?.id === event.pointerId) {
      this.cardDrag = null;
      this.settleCard(this.view.step);
    }
  };

  private leave = () => {
    if (!this.tearDrag && !this.cardDrag) this.look.inside = false;
  };

  private settleCard(step: number) {
    const card = this.cards[step];
    if (!card || card.state !== "front") return;
    const from = card.root.position.clone();
    const spin = card.flip.rotation.z;
    void this.tweens.add(0.45, easeOutBack(1.6), (k) => {
      card.root.position.lerpVectors(from, FRONT, k);
      card.flip.rotation.z = lerp(spin, 0, k);
    }, { key: `card${step}.move` });
  }

  // ---------------------------------------------------------------- settings and teardown

  setSound(on: boolean) {
    this.sound.setMuted(!on);
  }

  unlockSound() {
    this.sound.unlock();
  }

  dispose() {
    this.disposed = true;
    this.run += 1;
    this.stop();
    this.tweens.cancelAll();
    this.canvas.removeEventListener("pointerdown", this.down);
    this.canvas.removeEventListener("pointermove", this.move);
    this.canvas.removeEventListener("pointerup", this.up);
    this.canvas.removeEventListener("pointercancel", this.cancel);
    this.canvas.removeEventListener("pointerleave", this.leave);
    this.canvas.removeEventListener("webglcontextlost", this.lost);
    document.removeEventListener("visibilitychange", this.visibility);
    this.sound.dispose();
    const materials = new Set<Material>();
    this.scene.traverse((object) => {
      const mesh = object as Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as Material | Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => materials.add(m));
      else if (material) materials.add(material);
    });
    materials.forEach((material) => material.dispose());
    for (const texture of [...this.shared, ...this.packTextures, this.placeholder]) texture.dispose();
    for (const texture of this.cardTextures.values()) void texture.then((loaded) => loaded.dispose());
    this.bloom.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}

/** True when this browser can draw the 3D pack. */
export function canUseWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    // Hand the probe's context straight back; browsers only allow a few at once.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function createPackStage(container: HTMLElement, frame: HTMLElement, events: StageEvents, options: StageOptions): PackStage {
  return new Stage(container, frame, events, options);
}
