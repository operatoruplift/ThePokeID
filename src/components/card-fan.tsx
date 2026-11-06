"use client";

import { useState } from "react";

import { CardDialog } from "@/components/card-dialog";
import { CardFace } from "@/components/card-face";
import { CardSurface } from "@/components/card-surface";
import { cardById, type ExampleCard } from "@/data/cards";

const FAN_IDS = ["xy12-35", "base1-2", "base1-4", "ecard3-H30", "ex15-100"] as const;

const POSES = [
  { rotate: -20, x: -92, y: 28, z: 1 },
  { rotate: -10, x: -46, y: 10, z: 2 },
  { rotate: 0, x: 0, y: 0, z: 4 },
  { rotate: 11, x: 48, y: 12, z: 3 },
  { rotate: 20, x: 96, y: 30, z: 1 },
];

export function CardFan() {
  const [active, setActive] = useState<ExampleCard | null>(null);
  const cards = FAN_IDS.map((id) => cardById(id));

  return (
    <>
    <div className="relative mx-auto h-[360px] w-full max-w-[520px]">
      <div className="absolute inset-x-10 bottom-6 h-24 rounded-full bg-brand/40 blur-3xl" />
      {cards.map((card, index) => {
        const pose = POSES[index];
        return (
          <div
            key={card.id}
            className="fan-position absolute top-4 left-1/2 w-[132px] sm:w-[150px]"
            style={{
              transform: `translateX(calc(-50% + ${pose.x}px)) translateY(${pose.y}px) rotate(${pose.rotate}deg)`,
            }}
          >
            <CardSurface className="fan-card aspect-[63/88] w-full">
              <button type="button" onClick={() => setActive(card)} aria-label={`Inspect ${card.name} from ${card.setName}`} aria-haspopup="dialog" className="absolute inset-0 block w-full rounded-lg focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sun">
                <CardFace card={card} priority={index === 2} sizes="(min-width: 640px) 150px, 132px" />
              </button>
            </CardSurface>
          </div>
        );
      })}
    </div>
    <CardDialog card={active} onClose={() => setActive(null)} />
    </>
  );
}
