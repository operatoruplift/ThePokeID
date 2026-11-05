import { cardById, type ExampleCard } from "@/data/cards";

/** Sample floor order. These are example pulls, not a live feed. */
export const FLOOR_IDS = [
  "xy12-35",
  "base1-4",
  "base1-2",
  "ecard3-H30",
  "ex15-100",
  "xy12-74",
  "pop5-16",
  "ecard3-H31",
] as const;

/** Cards offered in the "What's your favourite?" picker. */
export const FAVOURITE_IDS = [
  "xy12-35",
  "base1-4",
  "base1-2",
  "ecard3-H30",
  "ecard3-H31",
  "pop5-16",
  "sv8-1",
  "xy12-74",
] as const;

export type DropTone = "paper" | "sun" | "brand";

export type DropStory = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  body: string;
  cardId: string;
  tone: DropTone;
};

export const DROPS: DropStory[] = [
  {
    id: "the-30",
    index: "01",
    kicker: "The banner",
    title: "The 30",
    body: "The banner asks one question. This Pikachu brings the familiar artwork from Evolutions: card 35 of 108, illustrated by Mitsuhiro Arita.",
    cardId: "xy12-35",
    tone: "paper",
  },
  {
    id: "the-rip",
    index: "02",
    kicker: "Night desk",
    title: "The rip",
    body: "A rip is a five-card breath. Four of them are the story you tell on the way to the fifth. The example pack on this site uses that same shape.",
    cardId: "ex15-100",
    tone: "sun",
  },
  {
    id: "the-id",
    index: "03",
    kicker: "Name it",
    title: "The ID",
    body: "ThePokeID is the habit of saying the set, the number, and the rarity before a card disappears into a sleeve. Identify it. Then show it.",
    cardId: "ecard3-H30",
    tone: "brand",
  },
];

export function cardsFor(ids: readonly string[]): ExampleCard[] {
  return ids.map((id) => cardById(id));
}
