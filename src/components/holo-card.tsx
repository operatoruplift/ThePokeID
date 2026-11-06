"use client";

import { useState } from "react";

import { CardFace } from "@/components/card-face";
import { CardSurface } from "@/components/card-surface";
import { foilTier, type ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

type HoloCardProps = {
  card: ExampleCard;
  onSelect?: () => void;
  large?: boolean;
  priority?: boolean;
  showMeta?: boolean;
  fill?: boolean;
  /** Maximum 3D rotation in degrees; 0 keeps the card still but shiny. */
  tilt?: number;
  /** How wide the card is drawn, so the browser fetches a scan at least that sharp. */
  sizes?: string;
  className?: string;
};

export function HoloCard({
  card,
  onSelect,
  large = false,
  priority = false,
  showMeta = true,
  fill = false,
  tilt,
  sizes = "(max-width: 768px) 46vw, 240px",
  className,
}: HoloCardProps) {
  const [focused, setFocused] = useState(false);
  const tier = foilTier(card.rarity);
  const label = `${card.name}. ${card.setName} number ${card.number}. ${card.rarity}.`;

  const frame = (
    <CardSurface
      className={cn("w-full", fill ? "h-full" : "aspect-[63/88]", `foil-${tier}`)}
      focused={focused}
      tilt={tilt}
    >
      <CardFace
        card={card}
        large={large}
        priority={priority}
        sizes={large ? "(max-width: 768px) 80vw, 360px" : sizes}
      />
    </CardSurface>
  );

  const meta = showMeta ? (
    <div className="mt-3">
      <p className="font-display text-xl leading-none tracking-tight text-current">{card.name}</p>
      <p className="mt-1 text-xs leading-snug text-current/70">
        #{card.number} · {card.rarity}
      </p>
    </div>
  ) : null;

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        aria-haspopup="dialog"
        className={cn("holo-card-trigger block w-full rounded-lg text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-bolt", className)}
      >
        {frame}
        {meta}
      </button>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      {showMeta ? null : <span className="sr-only">{label}</span>}
      {frame}
      {meta}
    </div>
  );
}
