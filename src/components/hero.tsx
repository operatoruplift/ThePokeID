import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { CardFan } from "@/components/card-fan";
import { Button } from "@/components/ui/button";
import { EXAMPLE_CARDS } from "@/data/cards";

export function Hero() {
  return (
    <section id="top" className="scroll-mt-28 px-5 pt-6 pb-2 md:px-8 md:pt-8">
      <div className="grid gap-4 md:grid-cols-[1.65fr_1fr]">
        <article className="overflow-hidden rounded-[10px] bg-[#2a2b7e] shadow-[0_10px_30px_rgb(42_43_126_/_0.18)]">
          <Link href="/#favourite" className="group relative block aspect-[3/1] overflow-hidden bg-pearl">
            <Image src="/brand/banner.jpg" alt="What's your favourite? Pikachu and a colourful world of Pokémon." fill priority sizes="(max-width: 768px) 100vw, 660px" className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none" />
          </Link>
          <div className="hero-feature-copy foil-edge p-5 text-white md:p-7">
            <p className="eyebrow eyebrow-on-dark">Welcome to ThePokeID</p>
            <h1 className="mt-3 font-display text-[30px] leading-tight md:text-[36px]">Show me the card.</h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/90">
              A favourite worth finding. A pack worth opening. Explore ThePokeID&apos;s
              Pokémon collection and see what catches your eye.
            </p>
            <Button asChild variant="gold" className="mt-5">
              <a href="#rip">Try a sample pack <ArrowRight aria-hidden /></a>
            </Button>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="overflow-hidden rounded-[10px] border border-line bg-white">
            <div className="hero-card-art holo-lid overflow-hidden">
              <CardFan />
            </div>
            <div className="px-5 py-4">
              <p className="eyebrow">The binder</p>
              <h2 className="mt-2 font-display text-[23px] leading-tight"><Link href="/#binder" className="underline-offset-4 hover:underline">A binder full of possibilities</Link></h2>
              <p className="mt-1.5 text-sm text-mist">Discover {EXAMPLE_CARDS.length} real cards, from familiar faces to the chase.</p>
            </div>
          </article>
          <Link href="/#favourite" className="hero-question charcoal-band group flex items-center gap-4 rounded-[10px] px-5 py-4 transition-colors">
            <BookOpen className="size-10 shrink-0 text-sun" strokeWidth={1.5} aria-hidden />
            <div>
              <h2 className="font-display text-xl leading-tight text-white">Which card is your favourite?</h2>
              <p className="mt-1 text-sm text-[#c9ced6]">Make your pick. Keep it on your desk.</p>
            </div>
            <ArrowRight className="ml-auto size-5 shrink-0 text-sun transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
      <dl className="hero-stats mt-4 grid grid-cols-2 rounded-[10px] border border-line bg-pearl sm:grid-cols-4">
        {[
          [String(EXAMPLE_CARDS.length), "Cards to explore"],
          ["8", "Desk pulls"],
          ["4", "Sample packs"],
          ["1", "Favourite to find"],
        ].map(([value, label]) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <dd className="foil-text font-display text-[28px] leading-none">{value}</dd>
            <dt className="text-sm text-mist">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
