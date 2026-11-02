"use client";

import { useMemo, useState } from "react";

import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHASE_RARITIES, EXAMPLE_CARDS, type ExampleCard } from "@/data/cards";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pikachu", label: "Pikachu" },
  { id: "illustration", label: "Illustration" },
  { id: "chase", label: "Chase" },
  { id: "classic", label: "Classics" },
  { id: "trainer", label: "Trainers" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matches(card: ExampleCard, filter: FilterId, query: string) {
  const haystack = `${card.name} ${card.rarity} ${card.number}`.toLowerCase();
  if (query && !haystack.includes(query)) return false;
  switch (filter) {
    case "pikachu":
      return card.name.toLowerCase().includes("pikachu");
    case "illustration":
      return card.rarity === "Illustration Rare";
    case "chase":
      return CHASE_RARITIES.has(card.rarity);
    case "classic":
      return card.setName.includes("Classic");
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
    <section id="binder" className="scroll-mt-24 bg-stage pb-20 text-paper md:pb-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">03 — The binder</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display text-5xl leading-[0.92] tracking-tight md:text-6xl">
            Tilt the foil.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-paper/70">
            Move a pointer across a card. The shine follows. Every sleeve here is sample
            data from the 30th Celebration sets.
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
                    "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]",
                    pressed
                      ? "border-sun bg-sun text-ink"
                      : "border-white/20 text-paper hover:border-white/50",
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
            placeholder="Search the sample binder"
            aria-label="Search example cards"
            className="border-white/15 bg-white/5 text-paper placeholder:text-paper/40 focus-visible:border-sun lg:max-w-xs"
          />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-paper/60">
          {shown.length} example {shown.length === 1 ? "card" : "cards"}
        </p>

        {shown.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-white/25 px-6 py-16 text-center">
            <p className="font-display text-4xl">Nothing in that sleeve.</p>
            <p className="mt-2 text-paper/70">No example cards match. Clear it and look again.</p>
            <Button
              className="mt-6"
              variant="sun"
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
                <HoloCard card={card} onSelect={() => setActive(card)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <CardDialog card={active} onClose={() => setActive(null)} />
    </section>
  );
}
