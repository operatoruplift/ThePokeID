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
        <article className="overflow-hidden rounded-[5px] bg-[#1b6b9e]">
          <Link href="/#favourite" className="group relative block aspect-[3/1] overflow-hidden bg-[#f2f2f2]">
            <Image src="/brand/banner.jpg" alt="What's your favourite? Pikachu and a colourful world of Pokémon." fill priority sizes="(max-width: 768px) 100vw, 660px" className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none" />
          </Link>
          <div className="p-5 text-white md:p-6">
            <p className="mb-2 text-sm font-medium text-white/85">Welcome to ThePokeID</p>
            <h1 className="font-display text-[30px] leading-tight md:text-[34px]">Show me the card.</h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/90">
              A favourite worth finding. A pack worth opening. Explore ThePokeID&apos;s
              Pokémon collection and see what catches your eye.
            </p>
            <Button asChild variant="inverse" className="mt-5">
              <a href="#rip">Try a sample pack <ArrowRight aria-hidden /></a>
            </Button>
          </div>
        </article>

        <div className="grid gap-4">
          <Link href="/#binder" className="group overflow-hidden rounded-[5px] bg-[#4dad5b]">
            <div className="hero-card-art overflow-hidden bg-[#eef2ed]">
              <CardFan />
            </div>
            <div className="px-5 py-4 text-[#16351b]">
              <h2 className="font-display text-[23px] leading-tight">A binder full of possibilities</h2>
              <p className="mt-2 text-sm">Discover {EXAMPLE_CARDS.length} real cards, from familiar faces to the chase.</p>
            </div>
          </Link>
          <Link href="/#favourite" className="group flex items-center gap-4 rounded-[5px] bg-[#ee6b2f] px-5 py-4 text-[#342015] transition-colors hover:bg-[#e36126]">
            <BookOpen className="size-10 shrink-0" strokeWidth={1.5} aria-hidden />
            <div>
              <h2 className="font-display text-xl leading-tight">Which card is your favourite?</h2>
              <p className="mt-1 text-sm">Make your pick. Keep it on your desk.</p>
            </div>
            <ArrowRight className="ml-auto size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 rounded-[5px] bg-[#f2f2f2] sm:grid-cols-4">
        {[
          [String(EXAMPLE_CARDS.length), "Cards to explore"],
          ["8", "Desk pulls"],
          ["4", "Sample packs"],
          ["1", "Favourite to find"],
        ].map(([value, label]) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <dd className="font-display text-2xl text-[#1b6b9e]">{value}</dd>
            <dt className="text-sm text-mist">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
