"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";

import { CardFace } from "@/components/card-face";
import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { cardById, type ExampleCard } from "@/data/cards";
import { cardsFor, FAVOURITE_IDS } from "@/data/desk";
import { createBrowserStorage } from "@/lib/browser-storage";
import { cn } from "@/lib/utils";

const storage = createBrowserStorage("pokeid-favourite");
const options = cardsFor(FAVOURITE_IDS);
const validIds = new Set(options.map((card) => card.id));
function getSnapshot() {
  const stored = storage.read();
  return stored && validIds.has(stored) ? stored : null;
}

export function Favourite() {
  const picked = useSyncExternalStore(storage.subscribe, getSnapshot, () => null);
  const [error, setError] = useState("");
  const [inspected, setInspected] = useState<ExampleCard | null>(null);

  function choose(id: string) {
    setError(storage.write(id) ? "" : "Your browser couldn't save this pick. Allow browser storage and try again.");
  }

  function clear() {
    setError(storage.write(null) ? "" : "Your browser couldn't clear this pick. Allow browser storage and try again.");
  }

  const selected = picked ? cardById(picked) : null;

  return (
    <section id="favourite" className="scroll-mt-24 bg-stage text-ink">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <p className="text-sm font-bold text-brand">The question</p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl leading-tight md:text-4xl">
          What&apos;s your favourite?
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-mist">
          The banner already asks. Save a favourite on this device, then tap it for a closer look.
        </p>

        <div className="relative mt-6 aspect-[2/1] overflow-hidden rounded-md bg-ink sm:aspect-[3/1]">
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
                <HoloCard card={selected} showMeta={false} onSelect={() => setInspected(selected)} />
                <p className="stamp pointer-events-none absolute top-8 right-0 rounded-md border-2 border-ink bg-sun px-3 py-2 font-display text-xl text-ink">
                  Locked in
                </p>
                <p className="mt-3 font-display text-2xl leading-tight">{selected.name}</p>
                <p className="mt-1 text-sm text-mist">
                  #{selected.number} · {selected.rarity}
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-2 min-h-11 text-sm font-bold text-brand underline-offset-4 hover:underline"
                >
                  Clear pick
                </button>
              </>
            ) : (
              <div className="grid aspect-[63/88] place-items-center rounded-md border-2 border-dashed border-line bg-[#f2f2f2] px-6 text-center">
                <div>
                  <p className="font-display text-3xl text-brand">Pick one.</p>
                  <p className="mt-2 text-sm text-mist">Pikachu is the banner. Charizard is allowed.</p>
                </div>
              </div>
            )}
          </div>

          <ul className="grid grid-cols-2 gap-3 min-[400px]:grid-cols-4 sm:gap-4">
            {options.map((card) => {
              const pressed = card.id === picked;
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    aria-label={`Choose ${card.name}, number ${card.number}, as your favourite`}
                    aria-pressed={pressed}
                    onClick={() => choose(card.id)}
                    className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bolt"
                  >
                    <span
                      className={cn(
                        "relative block aspect-[63/88] overflow-hidden rounded-md bg-white",
                        pressed ? "ring-4 ring-bolt ring-offset-2 ring-offset-white" : "ring-1 ring-ink/15",
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
        <p role="status" className="sr-only">
          {selected ? `${selected.name} is your favourite.` : "No favourite selected."}
        </p>
        {error ? <p role="alert" className="mt-4 text-sm text-brand">{error}</p> : null}
      </div>
      <CardDialog card={inspected} onClose={() => setInspected(null)} />
    </section>
  );
}
