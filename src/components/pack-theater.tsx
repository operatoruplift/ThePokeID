"use client";

import { useEffect, useRef, type RefObject } from "react";

import { foilTier, isChase, type ExampleCard } from "@/data/cards";
import type { PackStage, StageEvents, StageView } from "@/lib/pack3d/stage";
import type { PackFinish } from "@/lib/sample-packs";

type PackTheaterProps = {
  /** The box on the page the pack and cards are framed in. */
  frameRef: RefObject<HTMLElement | null>;
  /** Filled with the running stage, so the page can start its audio from a click. */
  stageRef: RefObject<PackStage | null>;
  /** Off for reduced motion: the 2D pack stays, and three.js is never loaded. */
  enabled: boolean;
  /** Showing the 3D pack instead of the 2D one. */
  active: boolean;
  /** Bumped for every new pack, even one with the same seed. */
  deal: number;
  packName: string;
  packFinish: PackFinish;
  cards: ExampleCard[];
  view: StageView;
  sound: boolean;
  events: StageEvents;
  /** The stage is built and ready to take over from the 2D pack. */
  onReady: () => void;
  /** The stage could not start, lost WebGL, or was taken down. */
  onRelease: () => void;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** The page's own fonts, loaded, for lettering painted onto the pack. */
async function pageFonts() {
  const style = getComputedStyle(document.documentElement);
  const display = style.getPropertyValue("--font-lato").trim() || "Arial, sans-serif";
  const body = style.getPropertyValue("--font-roboto").trim() || "Arial, sans-serif";
  try {
    await Promise.all([
      document.fonts.load(`700 64px ${display}`),
      document.fonts.load(`600 32px ${body}`),
      document.fonts.load(`700 32px ${body}`),
    ]);
  } catch {
    // Fallback fonts still paint.
  }
  return { display, body };
}

/**
 * The 3D theater behind the sample pack. It loads three.js only when the section is
 * close to the screen, builds the stage, and then mirrors the page's rip state into
 * it. Until it is ready, or if WebGL is missing, the 2D pack carries on alone.
 */
export function PackTheater({
  frameRef,
  stageRef,
  enabled,
  active,
  deal,
  packName,
  packFinish,
  cards,
  view,
  sound,
  events,
  onReady,
  onRelease,
}: PackTheaterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef(events);
  const readyRef = useRef(onReady);
  const releaseRef = useRef(onRelease);
  const soundRef = useRef(sound);
  const activeRef = useRef(active);
  const visibleRef = useRef(false);

  useEffect(() => {
    eventsRef.current = events;
    readyRef.current = onReady;
    releaseRef.current = onRelease;
    soundRef.current = sound;
  });

  // Build the stage once the section is near, and take it down on the way out.
  useEffect(() => {
    const container = containerRef.current;
    const frame = frameRef.current;
    if (!enabled || !container || !frame) return;
    let cancelled = false;
    let stage: PackStage | null = null;
    let resize: ResizeObserver | null = null;
    let onScreen: IntersectionObserver | null = null;

    const release = () => {
      resize?.disconnect();
      onScreen?.disconnect();
      stage?.dispose();
      stage = null;
      stageRef.current = null;
    };

    const proxy: StageEvents = {
      onPackTap: () => eventsRef.current.onPackTap(),
      onTorn: () => eventsRef.current.onTorn(),
      onOpened: () => eventsRef.current.onOpened(),
      onCardTap: () => eventsRef.current.onCardTap(),
      onCardThrow: (direction) => eventsRef.current.onCardThrow(direction),
      onLost: () => {
        release();
        releaseRef.current();
      },
    };

    async function boot() {
      try {
        const [module, logo, fonts] = await Promise.all([import("@/lib/pack3d/stage"), loadImage("/brand/logo.webp"), pageFonts()]);
        if (cancelled || !container || !frame) return;
        if (!module.canUseWebGL()) {
          releaseRef.current();
          return;
        }
        stage = module.createPackStage(container, frame, proxy, { fonts, logo, sound: soundRef.current });
        stageRef.current = stage;
        stage.setVisible(false);
        resize = new ResizeObserver(() => stage?.layout());
        resize.observe(container);
        resize.observe(frame);
        onScreen = new IntersectionObserver(
          (entries) => {
            visibleRef.current = entries.some((entry) => entry.isIntersecting);
            stage?.setVisible(visibleRef.current && activeRef.current);
          },
          { rootMargin: "120px 0px" },
        );
        onScreen.observe(container);
        readyRef.current();
      } catch {
        release();
        // A stage that failed part way may have left its canvas behind.
        container?.replaceChildren();
        if (!cancelled) releaseRef.current();
      }
    }

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        void boot();
      },
      { rootMargin: "900px 0px" },
    );
    near.observe(container);

    return () => {
      cancelled = true;
      near.disconnect();
      const hadStage = stage !== null;
      release();
      if (hadStage) releaseRef.current();
    };
  }, [frameRef, stageRef, enabled]);

  // Deal a new pack into the stage whenever the page deals one.
  useEffect(() => {
    activeRef.current = active;
    const stage = stageRef.current;
    if (!stage) return;
    stage.setVisible(active && visibleRef.current);
    if (!active) return;
    stage.deal(
      { name: packName, finish: packFinish },
      cards.map((card) => ({ id: card.id, image: card.imageLarge, tier: isChase(card) ? "chase" : foilTier(card.rarity) })),
    );
  }, [stageRef, active, deal, packName, packFinish, cards]);

  // Mirror the page's rip state; the stage animates its way there.
  const { phase, step, faceUp, exitDir } = view;
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !active) return;
    stage.sync({ phase, step, faceUp, exitDir });
  }, [stageRef, active, deal, phase, step, faceUp, exitDir]);

  useEffect(() => {
    stageRef.current?.setSound(sound);
  }, [stageRef, sound]);

  return <div ref={containerRef} className="rip-canvas-wrap" data-active={active || undefined} aria-hidden="true" />;
}
