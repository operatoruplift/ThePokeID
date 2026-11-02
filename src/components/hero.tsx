import { CardFan } from "@/components/card-fan";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const STATS = [
  { value: "29", label: "Cards" },
  { value: "8", label: "Pulls" },
  { value: "4", label: "Desk packs" },
  { value: "1", label: "Question" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-stage pt-24">
      <div className="mx-auto max-w-6xl px-5 pb-6">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0e121b]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 80% at 78% 45%, rgba(225,6,0,0.45), transparent 60%), radial-gradient(ellipse 40% 50% at 20% 80%, rgba(255,208,0,0.12), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative grid items-center gap-6 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="rise text-xs font-bold uppercase tracking-[0.22em] text-sun">
                Welcome to the desk
              </p>
              <h1 className="rise rise-2 relative mt-3 font-display text-[clamp(3.4rem,7.4vw,6.4rem)] leading-[0.84] tracking-tight uppercase">
                <span
                  aria-hidden
                  className="font-hollow pointer-events-none absolute inset-0 text-transparent"
                  style={{ WebkitTextStroke: "2px #ffd000" }}
                >
                  Show me
                  <br />
                  the card.
                </span>
                <span className="relative">
                  Show me
                  <br />
                  the card.
                </span>
              </h1>
              <p className="rise rise-3 mt-5 max-w-md text-base leading-relaxed text-paper/70 md:text-lg">
                Brandon Sim&apos;s card brand. Rip an example pack, name the hit, and keep the
                question going. The real ones land on X.
              </p>
              <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href="#rip">Rip packs</a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={siteConfig.x} target="_blank" rel="noreferrer">
                    Follow {siteConfig.handle}
                  </a>
                </Button>
              </div>
            </div>
            <CardFan />
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper/50">
                {stat.label}
              </dt>
              <dd className="mt-1 font-display text-3xl leading-none text-sun">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
