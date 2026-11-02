"use client";

import { CardFace } from "@/components/card-face";
import { cardById } from "@/data/cards";

const FAN_IDS = ["me55-30", "me55c-4", "me55-149", "me55-154", "me55-156"] as const;

const POSES = [
  { rotate: -20, x: -92, y: 28, z: 1 },
  { rotate: -10, x: -46, y: 10, z: 2 },
  { rotate: 0, x: 0, y: 0, z: 4 },
  { rotate: 11, x: 48, y: 12, z: 3 },
  { rotate: 20, x: 96, y: 30, z: 1 },
];

export function CardFan() {
  const cards = FAN_IDS.map((id) => cardById(id));

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[520px]" aria-hidden>
      <div className="absolute inset-x-10 bottom-6 h-24 rounded-full bg-brand/40 blur-3xl" />
      {cards.map((card, index) => {
        const pose = POSES[index];
        return (
          <div
            key={card.id}
            className="absolute top-4 left-1/2 w-[132px] sm:w-[150px]"
            style={{
              zIndex: pose.z,
              transform: `translateX(calc(-50% + ${pose.x}px)) translateY(${pose.y}px) rotate(${pose.rotate}deg)`,
            }}
          >
            <div className="fan-card" style={{ animationDelay: `${index * 0.18}s` }}>
              <div className="relative aspect-[63/88] overflow-hidden rounded-xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/25">
                <CardFace card={card} priority={index === 2} sizes="160px" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
