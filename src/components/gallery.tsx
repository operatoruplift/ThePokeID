"use client";

import { useMemo, useState } from "react";

import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXAMPLE_CARDS, isChase, type ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pikachu", label: "Pikachu" },
  { id: "holo", label: "Holo" },
  { id: "chase", label: "Chase" },
  { id: "classic", label: "Classics" },
  { id: "trainer", label: "Trainers" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matches(card: ExampleCard, filter: FilterId, query: string) {
  const haystack = `${card.name} ${card.setName} ${card.rarity} ${card.number} ${card.artist ?? ""}`.toLowerCase();
  if (query && !haystack.includes(query)) return false;
  switch (filter) {
    case "pikachu":
      return card.name.toLowerCase().includes("pikachu");
    case "holo":
      return card.rarity.includes("Holo");
    case "chase":
      return isChase(card);
    case "classic":
      return card.releaseDate < "2004-01-01";
    case "trainer":
      return card.supertype === "Trainer";
    default:
      return true;
  }
}

export function Gallery() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ExampleCard | null>(null);
  const needle = query.trim().toLowerCase();

  const shown = useMemo(
    () => EXAMPLE_CARDS.filter((card) => matches(card, filter, needle)),
    [filter, needle],
  );

  return (
    <section id="binder" className="scroll-mt-24 bg-stage pb-10 text-ink md:pb-14">
      <div className="mx-auto max-w-6xl px-5">
        <p className="eyebrow">The binder</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-3xl leading-tight md:text-4xl">
            Tilt the foil.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Real Pokémon TCG artwork, with the original names, sets, and card numbers.
            Tilt a card, then open it to flip, zoom, and explore its details.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter example cards">
            {FILTERS.map((item) => {
              const pressed = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "min-h-11 rounded-md border px-3.5 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt",
                    pressed
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-pearl text-ink hover:bg-white",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cards, sets, or illustrators"
            aria-label="Search example cards"
            className="border-line bg-white text-ink placeholder:text-mist focus-visible:border-bolt lg:max-w-xs"
          />
        </div>

        <p className="mt-5 text-sm font-bold text-mist">
          {shown.length} {shown.length === 1 ? "card" : "cards"}
        </p>

        {shown.length === 0 ? (
          <div className="mt-6 rounded-[10px] border border-dashed border-line bg-pearl px-6 py-12 text-center">
            <p className="font-display text-2xl">Nothing in that sleeve.</p>
            <p className="mt-2 text-mist">No example cards match. Clear it and look again.</p>
            <Button
              className="mt-6"
              variant="gold"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
            >
              Reset
            </Button>
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map((card) => (
              <li key={card.id}>
                <HoloCard card={card} onSelect={() => setActive(card)} sizes="(min-width: 1280px) 210px, (min-width: 1024px) 26vw, (min-width: 640px) 32vw, 46vw" />
              </li>
            ))}
          </ul>
        )}
      </div>
      <CardDialog card={active} onClose={() => setActive(null)} />
    </section>
  );
}
