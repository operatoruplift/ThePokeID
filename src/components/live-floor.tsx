import { CardFace } from "@/components/card-face";
import { cardsFor, FLOOR_IDS } from "@/data/desk";
import type { ExampleCard } from "@/data/cards";

const pulls = cardsFor(FLOOR_IDS);

function Ticket({ card, priority = false }: { card: ExampleCard; priority?: boolean }) {
  return (
    <article className="mb-2 flex gap-3 rounded-[5px] border border-line bg-[#f5f5f5] p-2.5 text-ink">
      <div className="relative aspect-[63/88] w-14 shrink-0 overflow-hidden rounded-md bg-black">
        <CardFace card={card} priority={priority} sizes="56px" />
      </div>
      <div className="min-w-0 py-0.5">
        <h3 className="truncate font-display text-lg leading-tight">{card.name}</h3>
        <p className="mt-1 truncate text-[11px] text-mist">
          #{card.number} · {card.rarity}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-mist">{card.note}</p>
      </div>
    </article>
  );
}

function TicketList({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className={hidden ? "is-duplicate" : undefined} aria-hidden={hidden}>
      {pulls.map((card, index) => (
        <Ticket key={`${hidden ? "b" : "a"}-${card.id}`} card={card} priority={!hidden && index < 2} />
      ))}
    </div>
  );
}

export function LiveFloor() {
  return (
    <aside id="floor" className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[26px] leading-tight text-ink">From the desk</h2>
        <span className="relative flex size-2" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:hidden" />
          <span className="relative size-2 rounded-full bg-brand" />
        </span>
      </div>
      <div className="floor-mask h-[420px] overflow-hidden rounded-[5px] border border-line bg-white p-2 motion-reduce:h-auto">
        <div className="card-wall">
          <TicketList />
          <TicketList hidden />
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-mist">
        Real card scans in a sample feed. Open the binder to explore each card.
      </p>
    </aside>
  );
}
