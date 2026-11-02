"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { HoloCard } from "@/components/holo-card";
import { cardById } from "@/data/cards";
import { DROPS, type DropStory, type DropTone } from "@/data/desk";
import { cn } from "@/lib/utils";

const toneClass: Record<DropTone, string> = {
  paper: "bg-[#10131c] text-paper",
  sun: "bg-[#24180a] text-paper",
  brand: "bg-brand text-white",
};

function StoryCopy({ story }: { story: DropStory }) {
  const card = cardById(story.cardId);
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">
        {story.index} — {story.kicker}
      </p>
      <h3 className="mt-3 font-display text-5xl leading-[0.9] tracking-tight text-current md:text-6xl">
        {story.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-current/80">{story.body}</p>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-current/60">
        {card.name} · #{card.number}
      </p>
    </div>
  );
}

function SnapStories() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
      {DROPS.map((story) => {
        const card = cardById(story.cardId);
        return (
          <article
            key={story.id}
            className={cn(
              "flex w-[86vw] max-w-md shrink-0 snap-center flex-col justify-between gap-6 rounded-3xl p-6 sm:w-[70vw]",
              toneClass[story.tone],
            )}
          >
            <StoryCopy story={story} />
            <HoloCard card={card} showMeta={false} className="mx-auto max-w-[200px]" />
          </article>
        );
      })}
    </div>
  );
}

function ScrubStories() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.666%"]);

  return (
    <div ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-stage">
        <motion.div style={{ x }} className="flex h-full w-[300%]">
          {DROPS.map((story) => {
            const card = cardById(story.cardId);
            return (
              <article
                key={story.id}
                className={cn("flex h-full w-1/3 items-center", toneClass[story.tone])}
              >
                <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-12 lg:grid-cols-[1.1fr_240px] lg:px-16">
                  <StoryCopy story={story} />
                  <HoloCard card={card} showMeta={false} className="mx-auto w-full max-w-[240px]" />
                </div>
              </article>
            );
          })}
        </motion.div>
        <p className="absolute right-8 bottom-8 rounded-full border border-white/15 bg-stage/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-paper">
          Scroll to slide
        </p>
      </div>
    </div>
  );
}

export function Drops() {
  const reduce = useReducedMotion();

  return (
    <section id="drops" className="scroll-mt-24 bg-stage pb-16 md:pb-0">
      <h2 className="sr-only">05 — From the desk. Example drops, not confirmed sales.</h2>
      {reduce ? (
        <div className="py-8">
          <SnapStories />
        </div>
      ) : (
        <>
          <div className="py-4 md:hidden">
            <SnapStories />
          </div>
          <div className="hidden md:block">
            <ScrubStories />
          </div>
        </>
      )}
    </section>
  );
}
