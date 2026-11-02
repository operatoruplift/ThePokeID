import { CardFace } from "@/components/card-face";
import { cardsFor, FLOOR_IDS } from "@/data/desk";
import type { ExampleCard } from "@/data/cards";

const pulls = cardsFor(FLOOR_IDS);

function Ticket({ card, priority = false }: { card: ExampleCard; priority?: boolean }) {
  return (
    <article className="mb-3 flex gap-4 rounded-2xl bg-white p-3 shadow-[0_4px_0_var(--line)]">
      <div className="relative aspect-[63/88] w-16 shrink-0 overflow-hidden rounded-lg bg-paper">
        <CardFace card={card} priority={priority} sizes="64px" />
      </div>
      <div className="min-w-0 py-0.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Example pull</p>
        <h3 className="truncate font-display text-2xl leading-none tracking-tight">{card.name}</h3>
        <p className="mt-1 truncate text-xs text-mist">
          {card.setName} · #{card.number} · {card.rarity}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-snug text-ink/80">{card.note}</p>
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
    <section id="floor" className="scroll-mt-24 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.85fr_1.15fr] md:py-28">
        <div className="md:sticky md:top-28 md:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">01 — The floor</p>
          <h2 className="mt-3 font-display text-5xl leading-[0.92] tracking-tight md:text-6xl">
            Spot it the second it lands.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-mist">
            A sample wall in the rhythm of a live feed. Every row is marked example.
            Scans come from the public Pokémon TCG API, not from a stockroom.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
            Sample, not live
          </p>
        </div>
        <div className="floor-mask h-[640px] overflow-hidden motion-reduce:h-auto motion-reduce:overflow-visible">
          <div className="card-wall">
            <TicketList />
            <TicketList hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
