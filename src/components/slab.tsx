import { CardFace } from "@/components/card-face";
import { cardById } from "@/data/cards";

const card = cardById("me55-149");

export function Slab() {
  return (
    <section className="bg-stage" aria-labelledby="slab-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[280px_1fr] md:py-24">
        <div className="slab mx-auto w-full max-w-[280px]">
          <div className="relative aspect-[63/88] overflow-hidden rounded-lg">
            <CardFace card={card} large sizes="280px" />
          </div>
          <div className="mt-3 flex items-center justify-between text-paper">
            <span className="font-display text-3xl leading-none">ID</span>
            <span className="text-right font-display text-2xl leading-none text-sun">#{card.number}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">Desk plate</p>
          <h2 id="slab-title" className="mt-3 font-display text-5xl leading-[0.92] tracking-tight md:text-6xl">
            Name it before it hits the sleeve.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/70">
            Collector desks slab the hit. This plate is ThePokeID&apos;s version of that moment:
            set, number, rarity. It is not a grading certificate.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Card", card.name],
              ["Set", card.setName],
              ["Number", `#${card.number}`],
              ["Rarity", card.rarity],
              ["Artist", card.artist ?? "Unknown"],
              ["Status", "On the desk"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper/45">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
