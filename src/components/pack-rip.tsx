"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { CardBack } from "@/components/card-face";
import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { Button } from "@/components/ui/button";
import { dealPack, type ExampleCard } from "@/data/cards";
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

function PackArt() {
  return (
    <svg viewBox="0 0 230 340" className="h-[340px] w-[230px]" aria-hidden>
      <defs>
        <linearGradient id="pack-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3a30" />
          <stop offset="1" stopColor="#9b0400" />
        </linearGradient>
        <linearGradient id="pack-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="210" height="320" rx="22" fill="url(#pack-red)" />
      <rect x="10" y="176" width="210" height="154" rx="22" fill="#f7f3ee" />
      <rect x="10" y="168" width="210" height="26" fill="#161616" />
      <circle cx="115" cy="181" r="38" fill="#f7f3ee" stroke="#1a0b0d" strokeWidth="8" />
      <circle cx="115" cy="181" r="16" fill="#ffffff" stroke="#1a0b0d" strokeWidth="4" />
      <text
        x="115"
        y="96"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize="32"
        fill="#ffd000"
        stroke="#2454e6"
        strokeWidth="5"
        paintOrder="stroke"
      >
        POKEID
      </text>
      <text
        x="115"
        y="258"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="13"
        letterSpacing="3"
        fill="#1a0b0d"
      >
        DESK PACK
      </text>
      <text
        x="115"
        y="304"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize="44"
        fill="#e10600"
      >
        30
      </text>
      <rect x="10" y="10" width="210" height="320" rx="22" fill="url(#pack-gloss)" />
      <rect
        x="10"
        y="10"
        width="210"
        height="320"
        rx="22"
        fill="none"
        stroke="#1a0b0d"
        strokeWidth="6"
      />
    </svg>
  );
}

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
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-sun px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
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
          <HoloCard card={card} fill showMeta={false} onSelect={onSelect} className="h-full" />
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

  function later(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function rip() {
    if (phase === "shaking" || phase === "tearing" || phase === "revealing") return;
    if (phase === "open") {
      setSeed((value) => value + 1);
    }
    if (reduce) {
      setPhase("open");
      return;
    }
    clearTimers();
    setPhase("shaking");
    later(480, () => setPhase("tearing"));
    later(980, () => setPhase("revealing"));
    later(980 + 180 * 4 + 780, () => setPhase("open"));
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
    <section id="rip" className="relative scroll-mt-28 overflow-hidden border-y border-line bg-[#f2f2f2] text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-stage to-transparent" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 58%, rgba(48,167,215,0.14), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="text-sm font-bold text-[#1b6b9e]">The sample pack</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-[28px] leading-tight md:text-[36px]">
            Five cards. One breath. Then the hit.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Real cards from different sets, dealt in a five-card demo. The wrapper is PokeID
            art; this is not an official pack or a promise of pull rates. Seed {String(seed).padStart(2, "0")} repeats the same deal.
          </p>
        </div>

        <div className="relative mt-8 grid min-h-[400px] min-w-0 grid-cols-[minmax(0,1fr)] place-items-center">
          <div
            className={cn(
              "relative col-start-1 row-start-1",
              phase === "shaking" && "is-shaking",
              away && "is-away",
              showCards && "pointer-events-none",
            )}
          >
            <PackArt />
            {phase === "tearing" ? (
              <p className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-hand text-7xl text-sun">
                riip
              </p>
            ) : null}
            {phase === "tearing" ? <div className="tear-line absolute top-1/2 right-[12%] left-[12%]" /> : null}
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
            variant="sun"
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
