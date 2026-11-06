"use client";

import { useState } from "react";

import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { cardsFor, FLOOR_IDS } from "@/data/desk";
import type { ExampleCard } from "@/data/cards";

const pulls = cardsFor(FLOOR_IDS);

function Ticket({ card, priority = false, onSelect }: { card: ExampleCard; priority?: boolean; onSelect: () => void }) {
  return (
    <article className="mb-2 flex gap-3 rounded-[8px] border border-line bg-white p-2.5 text-ink">
      <div className="relative aspect-[63/88] w-14 shrink-0 rounded-md bg-white">
        <HoloCard card={card} priority={priority} fill showMeta={false} className="h-full" onSelect={onSelect} />
      </div>
      <div className="min-w-0 py-0.5">
        <h3 className="truncate font-display text-lg leading-tight">{card.name}</h3>
        <p className="mt-1 truncate text-[11px] text-mist">
          #{card.number} · {card.rarity}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-mist">{card.note}</p>
      </div>
    </article>
  );
}

export function LiveFloor() {
  const [active, setActive] = useState<ExampleCard | null>(null);
  return (
    <aside id="floor" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[26px] leading-tight text-ink">From the desk</h2>
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:hidden" />
          <span className="relative size-2 rounded-full bg-brand" />
        </span>
      </div>
      <div className="h-[420px] overflow-y-auto rounded-[10px] border border-line bg-pearl p-2 motion-reduce:h-auto">
        <ul>
          {pulls.map((card, index) => (
            <li key={card.id}><Ticket card={card} priority={index < 2} onSelect={() => setActive(card)} /></li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-mist">
        Move over any card for the shine. Select it to flip, zoom, and explore.
      </p>
      <CardDialog card={active} onClose={() => setActive(null)} />
    </aside>
  );
}
