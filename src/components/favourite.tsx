"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

import { CardFace } from "@/components/card-face";
import { HoloCard } from "@/components/holo-card";
import { cardById } from "@/data/cards";
import { cardsFor, FAVOURITE_IDS } from "@/data/desk";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pokeid-favourite";
const options = cardsFor(FAVOURITE_IDS);
const validIds = new Set(options.map((card) => card.id));
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && validIds.has(stored) ? stored : null;
}

function writeFavourite(id: string | null) {
  if (id) window.localStorage.setItem(STORAGE_KEY, id);
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

export function Favourite() {
  const picked = useSyncExternalStore(subscribe, getSnapshot, () => null);

  function choose(id: string) {
    writeFavourite(id);
  }

  function clear() {
    writeFavourite(null);
  }

  const selected = picked ? cardById(picked) : null;

  return (
    <section id="favourite" className="scroll-mt-24 bg-stage">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">04 — The question</p>
        <h2 className="mt-3 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight md:text-7xl">
          What&apos;s your favourite?
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-paper/70">
          The banner already asks. Lock a sample card on this device. It does not post anywhere.
        </p>

        <div className="relative mt-8 aspect-[3/1] overflow-hidden rounded-3xl bg-ink">
          <Image
            src="/brand/banner.jpg"
            alt="What's your favourite? Banner art with Pikachu and the number 30 over a collage of cards."
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
          <div className="relative mx-auto w-full max-w-[280px]">
            {selected ? (
              <>
                <HoloCard card={selected} showMeta={false} />
                <p className="stamp pointer-events-none absolute top-8 -right-2 rounded-md border-4 border-ink bg-sun px-3 py-2 font-display text-2xl uppercase text-ink">
                  Locked in
                </p>
                <p className="mt-3 font-display text-3xl leading-none">{selected.name}</p>
                <p className="mt-1 text-sm text-paper/60">
                  #{selected.number} · {selected.rarity}
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-brand"
                >
                  Clear pick
                </button>
              </>
            ) : (
              <div className="grid aspect-[63/88] place-items-center rounded-[14px] border-2 border-dashed border-white/25 bg-white/5 px-6 text-center">
                <div>
                  <p className="font-hand text-4xl text-sun">Pick one.</p>
                  <p className="mt-2 text-sm text-paper/60">Pikachu is the banner. Charizard is allowed.</p>
                </div>
              </div>
            )}
          </div>

          <ul className="grid grid-cols-4 gap-3 sm:gap-4">
            {options.map((card) => {
              const pressed = card.id === picked;
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => choose(card.id)}
                    className="block w-full text-left"
                  >
                    <span
                      className={cn(
                        "relative block aspect-[63/88] overflow-hidden rounded-xl bg-white",
                        pressed ? "ring-4 ring-sun ring-offset-2 ring-offset-stage" : "ring-1 ring-white/15",
                      )}
                    >
                      <CardFace card={card} sizes="120px" />
                    </span>
                    <span className="mt-1 block truncate text-[11px] font-semibold">
                      #{card.number}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
