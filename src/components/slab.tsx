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
    <section className="charcoal-band" aria-labelledby="slab-title">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[240px_1fr] md:py-14">
        {/* The slab moves as one piece; the encased card keeps its shine but stays seated. */}
        <TiltFrame className="mx-auto w-full max-w-[280px]" frameClassName="slab" tilt={14}>
          <div className="relative aspect-[63/88] overflow-hidden rounded-lg">
            <HoloCard card={card} large fill showMeta={false} tilt={0} className="h-full" onSelect={() => setOpen(true)} />
          </div>
          <div className="mt-3 flex items-center justify-between text-white">
            <span className="silver-text font-display text-2xl leading-none">ID</span>
            <span className="text-right font-display text-2xl leading-none text-sun">#{card.number}</span>
          </div>
        </TiltFrame>
        <div>
          <p className="eyebrow eyebrow-on-dark">Desk plate</p>
          <h2 id="slab-title" className="mt-3 font-display text-3xl leading-tight text-white md:text-4xl">
            Name it before it hits the sleeve.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#c9ced6]">
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
              <div key={label} className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a9b0bb]">{label}</dt>
                <dd className="mt-1 text-sm text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <CardDialog card={open ? card : null} onClose={() => setOpen(false)} />
    </section>
  );
}
