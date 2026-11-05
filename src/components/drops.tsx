"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";

import { HoloCard } from "@/components/holo-card";
import { cardById } from "@/data/cards";
import { DROPS, type DropStory, type DropTone } from "@/data/desk";
import { cn } from "@/lib/utils";

const toneClass: Record<DropTone, string> = {
  paper: "bg-[#f2f2f2] text-ink",
  sun: "bg-[#bd4c1b] text-white",
  brand: "bg-[#14799f] text-white",
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function StoryCopy({ story }: { story: DropStory }) {
  const card = cardById(story.cardId);
  return (
    <div>
      <p className="text-sm font-bold text-current">
        {story.index} — {story.kicker}
      </p>
      <h3 className="mt-3 font-display text-3xl leading-tight text-current md:text-4xl">
        {story.title}
      </h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-current">{story.body}</p>
      <p className="mt-4 text-sm font-bold text-current">
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
              "flex w-[82%] max-w-md shrink-0 snap-center flex-col justify-between gap-6 rounded-md p-6 sm:w-[70%]",
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
                <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-8 md:grid-cols-[1.1fr_200px] lg:px-12">
                  <StoryCopy story={story} />
                  <HoloCard card={card} showMeta={false} className="mx-auto w-full max-w-[240px]" />
                </div>
              </article>
            );
          })}
        </motion.div>
        <p className="absolute right-6 bottom-6 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-ink">
          Scroll to slide
        </p>
      </div>
    </div>
  );
}

export function Drops() {
  // Hydrate the server's layout first, then apply the browser preference.
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  return (
    <section id="drops" className="scroll-mt-24 bg-stage pb-8 md:pb-0">
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
