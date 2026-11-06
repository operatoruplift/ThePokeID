"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CardBack } from "@/components/card-face";
import { CardSurface } from "@/components/card-surface";
import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { Button } from "@/components/ui/button";
import { dealPack, type ExampleCard } from "@/data/cards";
import { OPEN_DEMO_PACK } from "@/lib/card-events";
import { cn } from "@/lib/utils";

const SPARKS = [
  { left: "8%", top: "22%", delay: "0ms" },
  { left: "18%", top: "70%", delay: "60ms" },
  { left: "78%", top: "18%", delay: "30ms" },
  { left: "88%", top: "64%", delay: "90ms" },
  { left: "30%", top: "12%", delay: "120ms" },
  { left: "64%", top: "78%", delay: "40ms" },
  { left: "48%", top: "8%", delay: "80ms" },
  { left: "72%", top: "36%", delay: "10ms" },
];

type Phase = "sealed" | "shaking" | "tearing" | "revealing" | "open";

function PackCard({
  card,
  index,
  hot,
  reduce,
  onSelect,
}: {
  card: ExampleCard;
  index: number;
  hot: boolean;
  reduce: boolean;
  onSelect: () => void;
}) {
  const isHit = index === 4;
  return (
    <li className="relative shrink-0 snap-center">
      {isHit && hot ? (
        <span className="gold-plate absolute -top-8 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
          The hit
        </span>
      ) : null}
      <div
        className={cn(
          "relative aspect-[63/88] w-[142px] sm:w-[176px]",
          !reduce && !hot && "deal-flip",
        )}
        style={!reduce && !hot ? { animationDelay: `${index * 180}ms` } : undefined}
      >
        <div className="pack-face" inert={!hot && !reduce ? true : undefined}>
          <HoloCard card={card} fill showMeta={false} onSelect={onSelect} sizes="(min-width: 640px) 176px, 142px" className="h-full" />
        </div>
        {reduce || hot ? null : (
          <div className="pack-face pack-back" aria-hidden>
            <CardBack />
          </div>
        )}
      </div>
    </li>
  );
}

export function PackRip() {
  const reduce = useReducedMotion() ?? false;
  const [seed, setSeed] = useState(1);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [active, setActive] = useState<ExampleCard | null>(null);
  const timers = useRef<number[]>([]);
  const cards = useMemo(() => dealPack(seed), [seed]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const startReveal = useCallback((nextSeed: number) => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setSeed(nextSeed);
    setPhase(reduce ? "open" : "shaking");
    if (reduce) return;
    timers.current = [
      window.setTimeout(() => setPhase("tearing"), 480),
      window.setTimeout(() => setPhase("revealing"), 980),
      window.setTimeout(() => setPhase("open"), 2480),
    ];
  }, [reduce]);

  useEffect(() => {
    const reveal = (event: Event) => {
      const nextSeed = (event as CustomEvent<{ seed: number }>).detail?.seed;
      if (Number.isSafeInteger(nextSeed) && nextSeed > 0) startReveal(nextSeed);
    };
    window.addEventListener(OPEN_DEMO_PACK, reveal);
    return () => window.removeEventListener(OPEN_DEMO_PACK, reveal);
  }, [startReveal]);

  function rip() {
    if (phase === "shaking" || phase === "tearing" || phase === "revealing") return;
    startReveal(phase === "open" ? seed + 1 : seed);
  }

  const showCards = phase === "revealing" || phase === "open";
  const away = phase === "tearing" || showCards;
  const status =
    phase === "open"
      ? "Tilt a card, or rip another."
      : phase === "sealed"
        ? "Five cards. The last one is the hit."
        : "Hold on.";

  return (
    <section id="rip" className="relative scroll-mt-28 overflow-hidden border-y border-line bg-pearl text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-stage to-transparent" />
      {/* A holo glow and foil ring behind the pack, like the rim of a premium box lid. */}
      <div className="rip-glow pointer-events-none" aria-hidden />
      <div className="rip-halo pointer-events-none" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="eyebrow">The sample pack</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-[28px] leading-tight md:text-[36px]">
            Five cards. One breath. Then the hit.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Real Pokémon card backs, five genuine cards, and a final reveal. These mixed-set
            demos do not represent official packs or pull rates. Seed {String(seed).padStart(2, "0")} repeats the same deal.
          </p>
        </div>

        <div className="relative mt-8 grid min-h-[400px] min-w-0 grid-cols-[minmax(0,1fr)] place-items-center">
          <div
            inert={away ? true : undefined}
            aria-hidden={away}
            className={cn(
              "relative col-start-1 row-start-1",
              phase === "shaking" && "is-shaking",
              away && "is-away",
              showCards && "pointer-events-none",
            )}
          >
            <CardSurface className="aspect-[63/88] w-[230px]">
              <button type="button" onClick={rip} disabled={phase !== "sealed" && phase !== "open"} aria-label="Reveal five cards" className="absolute inset-0 block w-full rounded-lg focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sun">
                <CardBack />
              </button>
            </CardSurface>
          </div>

          {showCards ? (
            <ul className="col-start-1 row-start-1 flex w-full min-w-0 snap-x items-end justify-start gap-3 overflow-x-auto px-1 pt-10 pb-2 lg:justify-center">
              {cards.map((card, index) => (
                <PackCard
                  key={`${seed}-${card.id}`}
                  card={card}
                  index={index}
                  hot={phase === "open"}
                  reduce={reduce}
                  onSelect={() => setActive(card)}
                />
              ))}
            </ul>
          ) : null}

          {phase === "revealing"
            ? SPARKS.map((spark) => (
                <span
                  key={`${spark.left}-${spark.top}`}
                  className="spark"
                  style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
                />
              ))
            : null}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <p role="status" className="text-sm text-mist">{status}</p>
          <Button
            variant="gold"
            size="lg"
            onClick={rip}
            disabled={phase === "shaking" || phase === "tearing" || phase === "revealing"}
          >
            {phase === "open" ? "Rip another example" : "Rip the example pack"}
          </Button>
        </div>
      </div>
      <CardDialog card={active} onClose={() => setActive(null)} />
    </section>
  );
}
