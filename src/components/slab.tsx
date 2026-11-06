"use client";

import { useState } from "react";

import { CardDialog } from "@/components/card-dialog";
import { TiltFrame } from "@/components/card-surface";
import { HoloCard } from "@/components/holo-card";
import { cardById } from "@/data/cards";

const card = cardById("base1-4");

export function Slab() {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-stage text-ink" aria-labelledby="slab-title">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[240px_1fr] md:py-14">
        {/* The slab moves as one piece; the encased card keeps its shine but stays seated. */}
        <TiltFrame className="mx-auto w-full max-w-[280px]" frameClassName="slab" tilt={14}>
          <div className="relative aspect-[63/88] overflow-hidden rounded-lg">
            <HoloCard card={card} large fill showMeta={false} tilt={0} className="h-full" onSelect={() => setOpen(true)} />
          </div>
          <div className="mt-3 flex items-center justify-between text-white">
            <span className="font-display text-2xl leading-none">ID</span>
            <span className="text-right font-display text-2xl leading-none text-sun">#{card.number}</span>
          </div>
        </TiltFrame>
        <div>
          <p className="text-sm font-bold text-brand">Desk plate</p>
          <h2 id="slab-title" className="mt-2 font-display text-3xl leading-tight md:text-4xl">
            Name it before it hits the sleeve.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-mist">
            Collector desks slab the hit. This plate is ThePokeID&apos;s version of that moment:
            set, number, rarity. It is not a grading certificate.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Card", card.name],
              ["Set", card.setName],
              ["Number", `#${card.number}`],
              ["Rarity", card.rarity],
              ["Artist", card.artist ?? "Unknown"],
              ["Status", "On the desk"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-line bg-[#f2f2f2] px-4 py-3">
                <dt className="text-xs font-bold text-mist">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <CardDialog card={open ? card : null} onClose={() => setOpen(false)} />
    </section>
  );
}
