"use client";

import { CardBack } from "@/components/card-face";
import { CardSurface } from "@/components/card-surface";
import { Button } from "@/components/ui/button";
import { openDemoPack } from "@/lib/card-events";

const PACKS = [
  { name: "The 30", line: "A new favourite awaits", seed: 1 },
  { name: "Night rip", line: "Five cards to discover", seed: 7 },
  { name: "Classic desk", line: "From across the collection", seed: 13 },
  { name: "Chase sleeve", line: "Save the last card for the hit", seed: 19 },
] as const;

export function PackGrid() {
  return (
    <div id="packs" className="scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Explore the desk</p>
          <h2 className="mt-3 font-display text-[28px] leading-tight md:text-[32px]">Pick your next reveal</h2>
        </div>
        <p className="hidden max-w-[12rem] text-right text-xs leading-relaxed text-mist sm:block">
          Mixed-set demos. Nothing here is for sale.
        </p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {PACKS.map((pack) => (
          <li key={pack.name}>
            <article className="pack-tile flex h-full flex-col rounded-[10px] border border-line bg-pearl p-3">
              <div className="grid place-items-center rounded-[6px] bg-white px-2 py-4">
                <CardSurface className="aspect-[63/88] w-full max-w-[132px]">
                  <a href="#rip" onClick={() => openDemoPack(pack.seed)} aria-label={`Reveal ${pack.name} demo cards`} className="absolute inset-0 block rounded-lg focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sun">
                    <CardBack />
                  </a>
                </CardSurface>
              </div>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">{pack.name}</h3>
              <p className="mt-1 flex-1 text-xs text-mist">{pack.line}</p>
              <Button asChild variant="gold" size="sm" className="mt-3 w-full">
                <a href="#rip" onClick={() => openDemoPack(pack.seed)}>Reveal cards</a>
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
