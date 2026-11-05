"use client";

import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { useId, useState } from "react";

import { CardBack } from "@/components/card-face";
import { CardSurface } from "@/components/card-surface";
import { HoloCard } from "@/components/holo-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

function CardInspector({ card }: { card: ExampleCard }) {
  const [back, setBack] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const hintId = useId();

  function flip() {
    setBack((value) => !value);
  }

  return (
    <>
      <div className="pr-10">
        <DialogTitle>{card.name}</DialogTitle>
        <DialogDescription>
          {card.setName} · #{card.number} · {card.rarity}
        </DialogDescription>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p id={hintId} className="text-sm text-mist">
          {zoomed ? "Scroll or swipe inside the enlarged scan. Tap the card to turn it over." : "Tap the card to turn it over. Zoom in for a closer look."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={flip}>
            <RotateCw aria-hidden="true" />
            {back ? "Show front" : "Show back"}
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>
            {zoomed ? <ZoomOut aria-hidden="true" /> : <ZoomIn aria-hidden="true" />}
            {zoomed ? "Zoom out" : "Zoom in"}
          </Button>
        </div>
      </div>
      <div className={cn("mt-5 grid min-w-0 items-start gap-6", !zoomed && "md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]")}>
        <div className="relative min-w-0">
          <div
            className={cn("card-inspector-scan mx-auto w-full rounded-xl", zoomed ? "max-h-[70dvh] max-w-[560px] overflow-auto bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt" : "max-w-[360px]")}
            role={zoomed ? "region" : undefined}
            aria-label={zoomed ? "Enlarged card scan. Scroll to inspect." : undefined}
            tabIndex={zoomed ? 0 : undefined}
          >
            <button
              type="button"
              className={cn("card-inspector-flip relative block aspect-[63/88] rounded-xl text-left [perspective:1200px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-bolt", zoomed ? "w-[560px] max-w-none" : "w-full")}
              aria-label={`${back ? "Show front" : "Show back"} of ${card.name}`}
              aria-describedby={hintId}
              aria-pressed={back}
              data-side={back ? "back" : "front"}
              onClick={flip}
            >
              <div className={cn("card-inspector-rotator absolute inset-0 [transform-style:preserve-3d] motion-safe:transition-transform motion-safe:duration-500", back && "[transform:rotateY(180deg)]")}>
                <div className="card-inspector-face absolute inset-0 [backface-visibility:hidden]" aria-hidden={back}>
                  <HoloCard card={card} large showMeta={false} fill className="h-full" />
                </div>
                <div className="card-inspector-back absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!back}>
                  <CardSurface className="h-full w-full"><CardBack /></CardSurface>
                </div>
              </div>
            </button>
          </div>
          <p role="status" className="sr-only">{back ? "Card back" : "Card front"}</p>
        </div>
        <div className={cn("min-w-0", zoomed && "mx-auto w-full max-w-[560px]")}>
          <p className="text-base leading-relaxed text-ink">{card.note}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <dt className="text-xs font-bold text-mist">Set</dt>
              <dd>{card.setName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-mist">Type</dt>
              <dd>{card.types.length > 0 ? card.types.join(", ") : card.supertype}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-mist">HP</dt>
              <dd>{card.hp ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-mist">Card number</dt>
              <dd>#{card.number}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-mist">Rarity</dt>
              <dd>{card.rarity}</dd>
            </div>
            {card.subtypes.length > 0 ? (
              <div className="col-span-2">
                <dt className="text-xs font-bold text-mist">Card subtype</dt>
                <dd>{card.subtypes.join(" · ")}</dd>
              </div>
            ) : null}
            {card.artist ? (
              <div className="col-span-2">
                <dt className="text-xs font-bold text-mist">Illustrator</dt>
                <dd>{card.artist}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-mist">Official card artwork. Reference collection, not a ThePokeID listing.</p>
        </div>
      </div>
    </>
  );
}

export function CardDialog({
  card,
  onClose,
}: {
  card: ExampleCard | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={card !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="card-inspector max-h-[94dvh] w-[min(100%-1.5rem,58rem)] overflow-y-auto rounded-xl p-4 sm:p-6">
        {card ? <CardInspector key={card.id} card={card} /> : <DialogTitle className="sr-only">Card</DialogTitle>}
      </DialogContent>
    </Dialog>
  );
}
