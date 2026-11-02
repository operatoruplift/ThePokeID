import Image from "next/image";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const PHRASE = [
  "Example floor",
  "30th Celebration",
  "Not live inventory",
  "Holo on",
  "What's your favourite?",
  "Brandon Sim",
];

function MarqueeRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden}>
      {PHRASE.map((item) => (
        <span
          key={item}
          className="flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          {item}
          <span className="size-1.5 rounded-full bg-brand" />
        </span>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-5 pt-28 pb-12 md:grid-cols-[1.05fr_0.95fr] md:pt-32 md:pb-16">
        <div>
          <p className="rise text-xs font-bold uppercase tracking-[0.22em] text-brand">
            Brandon Sim · Card desk
          </p>
          <h1 className="rise rise-2 mt-4 font-display text-[clamp(3.5rem,8vw,6.6rem)] leading-[0.86] tracking-tight text-ink">
            Show me
            <br />
            the card.
          </h1>
          <p className="rise rise-3 mt-6 max-w-md text-lg leading-relaxed text-mist">
            ThePokeID names the pull out loud. The floor below is a sample desk, not shop
            inventory. The real hits land on X.
          </p>
          <div className="rise rise-4 mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#rip">Rip an example pack</a>
            </Button>
            <Button asChild variant="outline">
              <a href={siteConfig.x} target="_blank" rel="noreferrer">
                Follow {siteConfig.handle}
              </a>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto w-[min(78vw,480px)]">
          <div
            className="absolute inset-[10%] rounded-full bg-brand/25 blur-3xl"
            aria-hidden
          />
          <div className="float-ball relative">
            <Image
              src="/brand/logo.webp"
              alt="ThePokeID logo, a Poké Ball lettered PokeID in yellow and blue"
              width={1040}
              height={1040}
              priority
              className="relative h-auto w-full drop-shadow-[0_24px_40px_rgba(225,6,0,0.28)]"
            />
            <span className="gleam" aria-hidden />
          </div>
        </div>
      </div>
      <div className="overflow-hidden border-y border-ink/10 bg-white/70">
        <div className="marquee flex w-max py-3">
          <MarqueeRow />
          <MarqueeRow hidden />
        </div>
      </div>
    </section>
  );
}
