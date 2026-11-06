"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";

import { CardBack } from "@/components/card-face";
import { HoloCard } from "@/components/holo-card";
import type { ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

/** Card sizes on the reveal table (see .pack-stage). */
export const REVEAL_CARD_SIZES = "(min-width: 640px) 196px, 170px";

const HIT_SPARKS = [
  { left: "-6%", top: "12%", delay: "0ms" },
  { left: "104%", top: "18%", delay: "70ms" },
  { left: "-10%", top: "64%", delay: "140ms" },
  { left: "106%", top: "70%", delay: "40ms" },
  { left: "28%", top: "-8%", delay: "110ms" },
  { left: "74%", top: "104%", delay: "160ms" },
];

/** A throw this far, or this fast, sends the card off the table. */
const SWIPE_DISTANCE = 90;
const SWIPE_SPEED = 600;

type PackRevealProps = {
  cards: ExampleCard[];
  /** Index of the card on top of the stack. */
  step: number;
  faceUp: boolean;
  /** Which way the last card left: -1 to the left, 1 to the right. */
  exitDir: number;
  onFlip: () => void;
  onNext: (direction: number) => void;
};

/**
 * One card at a time, after hongyime/pokemonpacks' card viewer: each card turns
 * over, then a tap, swipe, or arrow key sends it off and brings up the next. The
 * last card is the hit; it waits face down until it is flipped on purpose.
 */
export function PackReveal({ cards, step, faceUp, exitDir, onFlip, onNext }: PackRevealProps) {
  const waiting = cards.slice(step + 1);
  const card = cards[step];
  return (
    <div className="pack-stack is-reveal">
      {waiting
        .map((next, i) => (
          <div key={next.id} className="pack-stack-card" style={{ ["--depth" as string]: i + 1 }} aria-hidden="true">
            <CardBack />
          </div>
        ))
        .reverse()}
      <AnimatePresence custom={exitDir}>
        {card ? (
          <RevealCard
            key={card.id}
            card={card}
            hit={step === cards.length - 1}
            faceUp={faceUp}
            exitDir={exitDir}
            onFlip={onFlip}
            onNext={onNext}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function RevealCard({
  card,
  hit,
  faceUp,
  exitDir,
  onFlip,
  onNext,
}: {
  card: ExampleCard;
  hit: boolean;
  faceUp: boolean;
  exitDir: number;
  onFlip: () => void;
  onNext: (direction: number) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-16, 16]);

  function dragEnd(_: unknown, info: PanInfo) {
    const thrown = Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_SPEED;
    if (thrown) onNext(Math.sign(info.offset.x || info.velocity.x) || -1);
  }

  return (
    <motion.div
      className={cn("reveal-card", hit && (faceUp ? "is-hit" : "is-hit-waiting"))}
      style={{ x, rotate }}
      custom={exitDir}
      initial={{ scale: 0.97 }}
      animate={{ scale: hit && faceUp ? 1.06 : 1 }}
      exit="leave"
      variants={{
        leave: (direction: number) => ({
          x: direction * 460,
          rotate: direction * 24,
          opacity: 0,
          transition: { duration: 0.34, ease: [0.4, 0, 1, 1] },
        }),
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      drag={faceUp ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.85}
      onDragEnd={dragEnd}
      onTap={() => (faceUp ? onNext(-1) : onFlip())}
      aria-hidden="true"
    >
      <motion.div
        className="reveal-flip"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: faceUp ? 0 : 180 }}
        transition={{ duration: hit ? 0.95 : 0.6, ease: [0.3, 0.75, 0.2, 1] }}
      >
        <div className="pack-face">
          <HoloCard card={card} fill showMeta={false} sizes={REVEAL_CARD_SIZES} className="h-full" />
        </div>
        <div className="pack-face pack-back">
          <CardBack />
        </div>
      </motion.div>
      {hit && faceUp ? (
        <>
          <span className="gold-plate reveal-hit-plate">The hit</span>
          {HIT_SPARKS.map((spark) => (
            <span
              key={`${spark.left}-${spark.top}`}
              className="spark"
              style={{ left: spark.left, top: spark.top, animationDelay: spark.delay }}
            />
          ))}
        </>
      ) : null}
    </motion.div>
  );
}
