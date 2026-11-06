"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";

import { BoosterPack } from "@/components/booster-pack";
import { CardBack } from "@/components/card-face";
import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { PackReveal } from "@/components/pack-reveal";
import { PackTheater } from "@/components/pack-theater";
import { Button } from "@/components/ui/button";
import { dealPack, type ExampleCard } from "@/data/cards";
import { OPEN_DEMO_PACK } from "@/lib/card-events";
import type { PackStage, StageEvents } from "@/lib/pack3d/stage";
import { readSoundOn, soundSetting } from "@/lib/pack3d/sound";
import { packForSeed } from "@/lib/sample-packs";

/**
 * sealed: the pack waits to be ripped · ripping: shake and tear · opening: the
 * strip flies off, the cards rise out, and the pack drops away · reveal: one card
 * at a time · spread: all five on the table.
 */
type Phase = "sealed" | "ripping" | "opening" | "reveal" | "spread";

/** Resting offsets, as shares of the pack's and the cards' own heights. */
const PACK_REST = "8%";
const STACK_IN_PACK = "24%";

const BURST = [
  { left: "30%", top: "20%", delay: "0ms" },
  { left: "70%", top: "16%", delay: "60ms" },
  { left: "22%", top: "36%", delay: "120ms" },
  { left: "78%", top: "34%", delay: "30ms" },
  { left: "50%", top: "8%", delay: "90ms" },
  { left: "40%", top: "28%", delay: "150ms" },
  { left: "60%", top: "26%", delay: "20ms" },
];

function SpreadCard({ card, index, hit, onSelect }: { card: ExampleCard; index: number; hit: boolean; onSelect: () => void }) {
  return (
    <li className="spread-card relative shrink-0 snap-center" style={{ ["--i" as string]: index }}>
      {hit ? (
        <span className="gold-plate absolute -top-8 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
          The hit
        </span>
      ) : null}
      <div className="relative aspect-[63/88] w-[142px] sm:w-[176px]">
        <HoloCard card={card} fill showMeta={false} onSelect={onSelect} sizes="(min-width: 640px) 176px, 142px" className="h-full" />
      </div>
    </li>
  );
}

export function PackRip() {
  const reduce = useReducedMotion() ?? false;
  const [seed, setSeed] = useState(1);
  /** Counts every pack dealt, so the 3D stage re-deals even the same seed. */
  const [deal, setDeal] = useState(0);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [step, setStep] = useState(0);
  const [faceUp, setFaceUp] = useState(false);
  const [exitDir, setExitDir] = useState(-1);
  const [active, setActive] = useState<ExampleCard | null>(null);
  const cards = useMemo(() => dealPack(seed), [seed]);
  const pack = packForSeed(seed);

  const rip = useMotionValue(0);
  const packY = useMotionValue(PACK_REST);
  const packRotate = useMotionValue(0);
  const packOpacity = useMotionValue(1);
  const stackY = useMotionValue(STACK_IN_PACK);

  // Each sequence holds a run number; starting another, or unmounting, cancels it.
  const run = useRef(0);
  const phaseRef = useRef<Phase>("sealed");
  const timers = useRef<number[]>([]);
  const primaryRef = useRef<HTMLButtonElement>(null);

  // The 3D theater takes over from the 2D pack once it has loaded, between packs.
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const modeRef = useRef<"2d" | "3d">("2d");
  const stageReady = useRef(false);
  const stageRef = useRef<PackStage | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const theater = mode === "3d" && !reduce;
  const sound = useSyncExternalStore(soundSetting.subscribe, readSoundOn, () => true);

  const switchMode = useCallback((next: "2d" | "3d") => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const settle = useCallback(() => {
    run.current += 1;
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    for (const value of [rip, packRotate, packOpacity]) value.stop();
    packY.stop();
    stackY.stop();
  }, [rip, packRotate, packOpacity, packY, stackY]);

  useEffect(() => settle, [settle]);

  const loadPack = useCallback(
    (nextSeed: number) => {
      settle();
      rip.set(0);
      packY.set(PACK_REST);
      packRotate.set(0);
      packOpacity.set(1);
      stackY.set(STACK_IN_PACK);
      setSeed(nextSeed);
      setDeal((count) => count + 1);
      setStep(0);
      setFaceUp(false);
      go("sealed");
      if (stageReady.current && modeRef.current === "2d") switchMode("3d");
    },
    [settle, rip, packY, packRotate, packOpacity, stackY, go, switchMode],
  );

  const showAll = useCallback(() => {
    settle();
    go("spread");
  }, [settle, go]);

  /** The strip is free: it flies off, the cards rise out, and the pack drops away. */
  const openPack = useCallback(async () => {
    if (reduce) {
      showAll();
      return;
    }
    const current = ++run.current;
    go("opening");
    await animate(stackY, "-46%", { delay: 0.2, type: "spring", stiffness: 120, damping: 15 });
    if (current !== run.current) return;
    animate(packY, "115%", { duration: 0.55, ease: [0.5, 0, 0.75, 0] });
    animate(packOpacity, 0, { duration: 0.3, delay: 0.25 });
    await animate(stackY, "0%", { delay: 0.1, type: "spring", stiffness: 150, damping: 19 });
    if (current !== run.current) return;
    setStep(0);
    setFaceUp(false);
    go("reveal");
    later(() => setFaceUp(true), 220);
  }, [reduce, showAll, go, stackY, packY, packOpacity, later]);

  /** Pressed rather than dragged: a shake for the tension, then the tear. */
  const ripOpen = useCallback(async () => {
    if (phaseRef.current !== "sealed") return;
    if (reduce) {
      showAll();
      return;
    }
    if (modeRef.current === "3d") {
      // The stage tears the pack and reports back through onTorn.
      stageRef.current?.unlockSound();
      go("ripping");
      return;
    }
    const current = ++run.current;
    go("ripping");
    await animate(packRotate, [0, -5, 5, -4, 4, -2, 0], { duration: 0.5, ease: "easeInOut" });
    if (current !== run.current) return;
    await animate(rip, 1, { duration: 0.62, ease: [0.5, 0, 0.25, 1] });
    if (current !== run.current) return;
    await openPack();
  }, [reduce, showAll, go, packRotate, rip, openPack]);

  const torn = useCallback(() => {
    if (modeRef.current === "3d") {
      if (phaseRef.current === "sealed" || phaseRef.current === "ripping") go("opening");
      return;
    }
    if (phaseRef.current !== "sealed") return;
    void openPack();
  }, [openPack, go]);

  /** The 3D cards are out of the pack: turn over the first one. */
  const opened = useCallback(() => {
    if (phaseRef.current !== "opening") return;
    setStep(0);
    setFaceUp(false);
    go("reveal");
    later(() => setFaceUp(true), 260);
  }, [go, later]);

  const flip = useCallback(() => {
    if (phaseRef.current === "reveal") setFaceUp(true);
  }, []);

  const next = useCallback(
    (direction = -1) => {
      if (phaseRef.current !== "reveal") return;
      if (!faceUp) {
        setFaceUp(true);
        return;
      }
      if (step >= cards.length - 1) {
        showAll();
        return;
      }
      setExitDir(direction < 0 ? -1 : 1);
      setStep(step + 1);
      setFaceUp(false);
      // Cards turn over by themselves; the hit waits to be flipped on purpose.
      if (step + 1 < cards.length - 1) later(() => setFaceUp(true), 380);
    },
    [faceUp, step, cards.length, showAll, later],
  );

  const stageEvents: StageEvents = {
    onPackTap: () => void ripOpen(),
    onTorn: torn,
    onOpened: opened,
    onCardTap: () => (faceUp ? next(-1) : flip()),
    onCardThrow: (direction) => next(direction),
    onLost: () => undefined,
  };

  const stageUp = useCallback(() => {
    stageReady.current = true;
    // Swap in the 3D pack now if the 2D one has not been touched; otherwise at the next pack.
    if (phaseRef.current === "sealed" && rip.get() === 0) switchMode("3d");
  }, [rip, switchMode]);

  const stageDown = useCallback(() => {
    stageReady.current = false;
    if (modeRef.current !== "3d") return;
    switchMode("2d");
    loadPack(seed);
  }, [switchMode, loadPack, seed]);

  useEffect(() => {
    const fromTile = (event: Event) => {
      const nextSeed = (event as CustomEvent<{ seed: number }>).detail?.seed;
      if (!Number.isSafeInteger(nextSeed) || nextSeed <= 0) return;
      stageRef.current?.unlockSound();
      loadPack(nextSeed);
      // Give the scroll to this section time to land, then rip it in view.
      later(() => void ripOpen(), reduce ? 0 : 700);
    };
    window.addEventListener(OPEN_DEMO_PACK, fromTile);
    return () => window.removeEventListener(OPEN_DEMO_PACK, fromTile);
  }, [loadPack, ripOpen, later, reduce]);

  // "Show all five" disappears once the cards are spread; keep focus on the main
  // action instead of letting it fall back to the page.
  useEffect(() => {
    if (phase !== "spread" || !primaryRef.current) return;
    const focused = document.activeElement;
    if (!focused || focused === document.body || focused.closest("#rip")) primaryRef.current.focus();
  }, [phase]);

  function keys(event: KeyboardEvent<HTMLElement>) {
    if (phaseRef.current !== "reveal") return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      next(event.key === "ArrowRight" ? 1 : -1);
    }
  }

  const hitIndex = cards.length - 1;
  const card = cards[step];
  const status =
    phase === "sealed"
      ? "Swipe across the top of the pack to tear it open, or press the button."
      : phase === "ripping" || phase === "opening"
        ? "Ripping…"
        : phase === "reveal"
          ? faceUp
            ? `${step === hitIndex ? "The hit" : `Card ${step + 1} of ${cards.length}`}: ${card.name}, ${card.rarity}.`
            : step === hitIndex
              ? "The hit is face down. Flip it."
              : `Card ${step + 1} of ${cards.length}.`
          : "All five cards. Select one to inspect it.";

  const primary =
    phase === "sealed"
      ? { label: "Rip the pack", action: () => void ripOpen() }
      : phase === "reveal"
        ? !faceUp
          ? { label: step === hitIndex ? "Flip the hit" : "Flip card", action: flip }
          : { label: step === hitIndex ? "See all five" : "Next card", action: () => next(-1) }
        : phase === "spread"
          ? { label: "Get another pack", action: () => loadPack(seed + 1) }
          : { label: "Ripping…", action: () => undefined };

  const openingStack = !theater && (phase === "sealed" || phase === "ripping" || phase === "opening");

  return (
    <section
      id="rip"
      className="rip-theater relative scroll-mt-28 overflow-hidden text-white"
      data-mode={theater ? "3d" : "2d"}
      data-phase={phase}
      onKeyDown={keys}
    >
      <PackTheater
        frameRef={frameRef}
        stageRef={stageRef}
        enabled={!reduce}
        active={theater}
        deal={deal}
        packName={pack.name}
        packFinish={pack.finish}
        cards={cards}
        view={{ phase, step, faceUp, exitDir }}
        sound={sound}
        events={stageEvents}
        onReady={stageUp}
        onRelease={stageDown}
      />
      {/* The 2D pack keeps a holo glow and foil ring behind it, like the rim of a premium box lid. */}
      {theater ? null : <div className="rip-glow pointer-events-none" aria-hidden />}
      {theater ? null : <div className="rip-halo pointer-events-none" aria-hidden />}
      <div className="rip-content relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="eyebrow eyebrow-on-dark">The sample pack</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-[28px] leading-tight md:text-[36px]">
            Five cards. One breath. Then the hit.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#b4bccf]">
            Real Pokémon card backs, five genuine cards, and a final reveal. These mixed-set
            demos do not represent official packs or pull rates. Seed {String(seed).padStart(2, "0")} repeats the same deal.
          </p>
        </div>

        <div ref={frameRef} className="pack-stage mt-8">
          {openingStack ? (
            <motion.div className="pack-stack" style={{ y: stackY }} aria-hidden="true">
              {cards.map((stackCard, i) => (
                <div key={stackCard.id} className="pack-stack-card" style={{ ["--depth" as string]: cards.length - 1 - i }}>
                  <CardBack />
                </div>
              ))}
            </motion.div>
          ) : null}

          {phase === "reveal" && !theater ? (
            <PackReveal cards={cards} step={step} faceUp={faceUp} exitDir={exitDir} onFlip={flip} onNext={next} />
          ) : null}

          {openingStack ? (
            <motion.div className="booster-slot" style={{ y: packY, rotate: packRotate, opacity: packOpacity }}>
              <BoosterPack
                key={seed}
                name={pack.name}
                finish={pack.finish}
                rip={rip}
                open={phase === "opening"}
                interactive={phase === "sealed"}
                onRip={() => void ripOpen()}
                onTorn={torn}
              />
            </motion.div>
          ) : null}

          {phase === "opening" && !theater
            ? BURST.map((spark) => (
                <span key={`${spark.left}-${spark.top}`} className="spark" style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }} />
              ))
            : null}

          {phase === "spread" ? (
            <ul className="pack-spread" aria-label={`${pack.name}: five cards`}>
              {cards.map((spreadCard, index) => (
                <SpreadCard
                  key={`${seed}-${spreadCard.id}`}
                  card={spreadCard}
                  index={index}
                  hit={index === hitIndex}
                  onSelect={() => setActive(spreadCard)}
                />
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <p role="status" className="min-h-5 text-sm text-[#b4bccf]">{status}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              ref={primaryRef}
              variant="gold"
              size="lg"
              onClick={primary.action}
              disabled={phase === "ripping" || phase === "opening"}
            >
              {primary.label}
            </Button>
            {phase === "reveal" ? (
              <Button variant="outline" size="lg" className="rip-outline" onClick={showAll}>
                Show all five
              </Button>
            ) : null}
            {theater ? (
              <button
                type="button"
                className="rip-sound"
                onClick={() => soundSetting.write(sound ? "off" : "on")}
                aria-pressed={sound}
                aria-label="Rip sounds"
                title={sound ? "Sound on" : "Sound off"}
              >
                {sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
              </button>
            ) : null}
          </div>
          {phase === "reveal" ? (
            <p className="text-xs text-[#b4bccf]">
              {theater ? "Tap or throw the card, or use the arrow keys." : "Tap or swipe the card, or use the arrow keys."}
            </p>
          ) : null}
        </div>
      </div>
      <CardDialog card={active} onClose={() => setActive(null)} />
    </section>
  );
}
