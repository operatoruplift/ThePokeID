"use client";

import { CardFace } from "@/components/card-face";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExampleCard } from "@/data/cards";

export function CardDialog({
  card,
  onClose,
}: {
  card: ExampleCard | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={card !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        {card ? (
          <div className="grid items-center gap-5 sm:grid-cols-[220px_1fr]">
            <div className="relative mx-auto aspect-[63/88] w-full max-w-[240px] overflow-hidden rounded-[14px] bg-stage">
              <CardFace card={card} large sizes="240px" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
                Example card
              </p>
              <DialogTitle className="mt-2">{card.name}</DialogTitle>
              <DialogDescription>
                {card.setName} · #{card.number} · {card.rarity}
                {card.artist ? ` · ${card.artist}` : ""}
              </DialogDescription>
              <p className="mt-4 text-base leading-relaxed text-ink">{card.note}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">Type</dt>
                  <dd>{card.types.length > 0 ? card.types.join(", ") : card.supertype}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">HP</dt>
                  <dd>{card.hp ?? "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">ID</dt>
                  <dd>
                    {card.id} · {card.subtypes.join(" · ") || card.supertype}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-mist">
                Image served live from the public Pokémon TCG API. Not a ThePokeID listing.
              </p>
            </div>
          </div>
        ) : (
          <DialogTitle className="sr-only">Example card</DialogTitle>
        )}
      </DialogContent>
    </Dialog>
  );
}
