import { cardById, type ExampleCard } from "@/data/cards";

/** Sample floor order. These are example pulls, not a live feed. */
export const FLOOR_IDS = [
  "me55-30",
  "me55-149",
  "me55c-4",
  "me55-154",
  "me55-157",
  "me55c-101",
  "me55-156",
  "me55-150",
] as const;

/** Cards offered in the "What's your favourite?" picker. */
export const FAVOURITE_IDS = [
  "me55-30",
  "me55-23",
  "me55-35",
  "me55-42",
  "me55-53",
  "me55-149",
  "me55-150",
  "me55c-4",
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
    body: "The X header is a question with a number on its cheek. Pikachu, card 30, is where this desk starts. This panel is a sample of that mood, not a claim the card is in hand.",
    cardId: "me55-30",
    tone: "paper",
  },
  {
    id: "the-rip",
    index: "02",
    kicker: "Night desk",
    title: "The rip",
    body: "A rip is a five-card breath. Four of them are the story you tell on the way to the fifth. The example pack on this site uses that same shape.",
    cardId: "me55-150",
    tone: "sun",
  },
  {
    id: "the-id",
    index: "03",
    kicker: "Name it",
    title: "The ID",
    body: "ThePokeID is the habit of saying the set, the number, and the rarity before a card disappears into a sleeve. Identify it. Then show it.",
    cardId: "me55-151",
    tone: "brand",
  },
];

export function cardsFor(ids: readonly string[]): ExampleCard[] {
  return ids.map((id) => cardById(id));
}
