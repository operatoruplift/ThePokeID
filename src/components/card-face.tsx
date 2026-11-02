"use client";

import Image from "next/image";
import { useState } from "react";

import type { ExampleCard } from "@/data/cards";

const TYPE_BAND: Record<string, string> = {
  Grass: "#3c9a4a",
  Fire: "#e4572e",
  Water: "#3a7ec8",
  Lightning: "#e0ac12",
  Psychic: "#a15eb5",
  Fighting: "#c45c2a",
  Darkness: "#3d3848",
  Metal: "#7f8d9c",
  Dragon: "#5b4dbe",
  Colorless: "#8d8578",
};

export function IdentityPlate({ card }: { card: ExampleCard }) {
  const band = TYPE_BAND[card.types[0] ?? ""] ?? "#e10600";
  return (
    <div className="absolute inset-0 flex flex-col bg-[#f6f1e8] text-ink">
      <div className="flex items-start justify-between gap-2 px-3 py-2 text-white" style={{ background: band }}>
        <p className="font-display text-lg leading-none">{card.name}</p>
        {card.hp ? <p className="font-display text-sm">{card.hp}</p> : null}
      </div>
      <div className="grid flex-1 place-items-center">
        <div className="grid size-[42%] place-items-center rounded-full border-4 border-ink bg-sun font-display text-2xl">
          {card.number}
        </div>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Example</p>
        <p className="text-xs">{card.rarity}</p>
      </div>
    </div>
  );
}

export function CardBack() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-brand text-sun">
      <div className="absolute inset-2 rounded-xl border-2 border-sun/80" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid size-16 place-items-center rounded-full border-[6px] border-ink bg-paper font-display text-xl text-brand">
          ID
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center text-[10px] font-bold uppercase tracking-[0.22em]">
        Example
      </p>
    </div>
  );
}

export function CardFace({
  card,
  large = false,
  priority = false,
  sizes = "(max-width: 768px) 46vw, 220px",
}: {
  card: ExampleCard;
  large?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="absolute inset-0">
      <IdentityPlate card={card} />
      {failed ? null : (
        <Image
          src={large ? card.imageLarge : card.image}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
