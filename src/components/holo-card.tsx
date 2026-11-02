"use client";

import { useReducedMotion } from "framer-motion";
import { useState, type PointerEvent } from "react";

import { CardFace } from "@/components/card-face";
import { foilTier, type ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

type HoloCardProps = {
  card: ExampleCard;
  onSelect?: () => void;
  large?: boolean;
  priority?: boolean;
  showMeta?: boolean;
  fill?: boolean;
  className?: string;
};

export function HoloCard({
  card,
  onSelect,
  large = false,
  priority = false,
  showMeta = true,
  fill = false,
  className,
}: HoloCardProps) {
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);
  const tier = foilTier(card.rarity);
  const label = `${card.name}. ${card.setName} number ${card.number}. ${card.rarity}.`;

  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType === "touch") return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--px", px.toFixed(4));
    el.style.setProperty("--py", py.toFixed(4));
    el.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
    setHot(true);
  }

  function leave(event: PointerEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--px", "0.5");
    el.style.setProperty("--py", "0.32");
    setHot(false);
  }

  const frame = (
    <div
      className={cn("holo w-full", fill ? "h-full" : "aspect-[63/88]", `foil-${tier}`, hot && "is-hot")}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[14px] bg-stage shadow-[0_16px_30px_rgba(0,0,0,0.28)]">
        <CardFace
          card={card}
          large={large}
          priority={priority}
          sizes={large ? "(max-width: 768px) 80vw, 360px" : "(max-width: 768px) 46vw, 220px"}
        />
        <span className="holo-foil" />
        <span className="holo-spark" />
        <span className="holo-glare" />
      </div>
    </div>
  );

  const meta = showMeta ? (
    <div className="mt-3">
      <p className="font-display text-xl leading-none tracking-tight text-current">{card.name}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-current/60">
        #{card.number} · {card.rarity}
      </p>
    </div>
  ) : null;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={label}
        className={cn("block w-full text-left", className)}
      >
        {frame}
        {meta}
      </button>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {showMeta ? null : <span className="sr-only">{label}</span>}
      {frame}
      {meta}
    </div>
  );
}
