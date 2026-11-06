"use client";

import Image from "next/image";
import { useState } from "react";

import type { ExampleCard } from "@/data/cards";

/** Card scans keep their fine print and foil texture at this quality (see next.config.ts). */
const SCAN_QUALITY = 85;

export function CardBack() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[8px] bg-[#18376e]" data-card-back>
      <Image src="/cards/back.jpg" alt="" fill sizes="(max-width: 768px) 90vw, 560px" quality={SCAN_QUALITY} className="object-contain" />
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
  const src = large ? card.imageLarge : card.image;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 bg-[#f2f2f2]" data-card-id={card.id}>
      {failedSrc === src ? (
        <div className="absolute inset-0 grid place-items-center p-3 text-center text-xs text-mist" role="img" aria-label={`${card.name} artwork unavailable`}>
          Artwork unavailable
        </div>
      ) : (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes={sizes}
          quality={SCAN_QUALITY}
          priority={priority}
          // The inspector uses the original scan; thumbnails are optimized locally.
          unoptimized={large}
          className="object-contain"
          data-card-image={card.id}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
