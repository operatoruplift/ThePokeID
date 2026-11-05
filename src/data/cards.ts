/** Verified Pokémon TCG reference cards. Scans are bundled locally; not inventory. */
export type ExampleCard = {
  id: string;
  name: string;
  supertype: "Pokémon" | "Trainer";
  subtypes: string[];
  hp?: string;
  types: string[];
  rarity: string;
  setName: string;
  setId: string;
  releaseDate: string;
  number: string;
  artist?: string;
  image: string;
  imageLarge: string;
  /** Editorial highlights, separate from the card's printed rarity. */
  chase: boolean;
  note: string;
};

export const EXAMPLE_CARDS: ExampleCard[] = [
  {
    "id": "xy12-35",
    "name": "Pikachu",
    "supertype": "Pokémon",
    "subtypes": [
      "Basic"
    ],
    "hp": "60",
    "types": [
      "Lightning"
    ],
    "rarity": "Common",
    "setName": "Evolutions",
    "setId": "xy12",
    "releaseDate": "2016-11-02",
    "number": "35",
    "artist": "Mitsuhiro Arita",
    "image": "/cards/xy12-35.png",
    "imageLarge": "/cards/xy12-35.png",
    "chase": false,
    "note": "The familiar Pikachu, reprinted in Evolutions with artwork by Mitsuhiro Arita. Number 35 of 108."
  },
  {
    "id": "base1-4",
    "name": "Charizard",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 2"
    ],
    "hp": "120",
    "types": [
      "Fire"
    ],
    "rarity": "Rare Holo",
    "setName": "Base",
    "setId": "base1",
    "releaseDate": "1999-01-09",
    "number": "4",
    "artist": "Mitsuhiro Arita",
    "image": "/cards/base1-4.webp",
    "imageLarge": "/cards/base1-4.webp",
    "chase": true,
    "note": "The Base Set Charizard. Mitsuhiro Arita’s illustration and the original 120 HP are part of the card’s identity."
  },
  {
    "id": "base1-2",
    "name": "Blastoise",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 2"
    ],
    "hp": "100",
    "types": [
      "Water"
    ],
    "rarity": "Rare Holo",
    "setName": "Base",
    "setId": "base1",
    "releaseDate": "1999-01-09",
    "number": "2",
    "artist": "Ken Sugimori",
    "image": "/cards/base1-2.webp",
    "imageLarge": "/cards/base1-2.webp",
    "chase": false,
    "note": "Base Set Blastoise: Ken Sugimori’s artwork, Rain Dance, and Hydro Pump."
  },
  {
    "id": "ecard3-H30",
    "name": "Umbreon",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 1"
    ],
    "hp": "70",
    "types": [
      "Darkness"
    ],
    "rarity": "Rare Holo",
    "setName": "Skyridge",
    "setId": "ecard3",
    "releaseDate": "2003-05-12",
    "number": "H30",
    "artist": "Atsuko Nishida",
    "image": "/cards/ecard3-H30.webp",
    "imageLarge": "/cards/ecard3-H30.webp",
    "chase": false,
    "note": "Umbreon from Skyridge, illustrated by Atsuko Nishida. Its printed card number is H30."
  },
  {
    "id": "ecard3-H31",
    "name": "Vaporeon",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 1"
    ],
    "hp": "70",
    "types": [
      "Water"
    ],
    "rarity": "Rare Holo",
    "setName": "Skyridge",
    "setId": "ecard3",
    "releaseDate": "2003-05-12",
    "number": "H31",
    "artist": "Naoyo Kimura",
    "image": "/cards/ecard3-H31.webp",
    "imageLarge": "/cards/ecard3-H31.webp",
    "chase": false,
    "note": "Vaporeon from Skyridge, illustrated by Naoyo Kimura. The e-Reader border is part of the original scan."
  },
  {
    "id": "ex15-100",
    "name": "Charizard ★ δ",
    "supertype": "Pokémon",
    "subtypes": [
      "Basic",
      "Star"
    ],
    "hp": "90",
    "types": [
      "Darkness"
    ],
    "rarity": "Rare Holo Star",
    "setName": "Dragon Frontiers",
    "setId": "ex15",
    "releaseDate": "2006-11-01",
    "number": "100",
    "artist": "Masakazu Fukuda",
    "image": "/cards/ex15-100.webp",
    "imageLarge": "/cards/ex15-100.webp",
    "chase": true,
    "note": "Charizard ★ δ from Dragon Frontiers. The Gold Star, Darkness type, and Masakazu Fukuda artwork are all on the original card."
  },
  {
    "id": "gym2-2",
    "name": "Blaine's Charizard",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 2"
    ],
    "hp": "100",
    "types": [
      "Fire"
    ],
    "rarity": "Rare Holo",
    "setName": "Gym Challenge",
    "setId": "gym2",
    "releaseDate": "2000-10-16",
    "number": "2",
    "artist": "Ken Sugimori",
    "image": "/cards/gym2-2.webp",
    "imageLarge": "/cards/gym2-2.webp",
    "chase": false,
    "note": "Blaine’s Charizard from Gym Challenge, illustrated by Ken Sugimori. A different Charizard, a different set."
  },
  {
    "id": "pop5-16",
    "name": "Espeon ★",
    "supertype": "Pokémon",
    "subtypes": [
      "Basic",
      "Star"
    ],
    "hp": "70",
    "types": [
      "Psychic"
    ],
    "rarity": "Rare",
    "setName": "POP Series 5",
    "setId": "pop5",
    "releaseDate": "2007-03-01",
    "number": "16",
    "artist": "Masakazu Fukuda",
    "image": "/cards/pop5-16.webp",
    "imageLarge": "/cards/pop5-16.webp",
    "chase": true,
    "note": "Espeon ★ from POP Series 5, illustrated by Masakazu Fukuda. This Gold Star card is printed as a non-holo rare."
  },
  {
    "id": "ru1-7",
    "name": "Pikachu",
    "supertype": "Pokémon",
    "subtypes": [
      "Basic"
    ],
    "hp": "60",
    "types": [
      "Lightning"
    ],
    "rarity": "Promo",
    "setName": "Pokémon Rumble",
    "setId": "ru1",
    "releaseDate": "2009-12-02",
    "number": "7",
    "artist": "Pokemon Rumble",
    "image": "/cards/ru1-7.webp",
    "imageLarge": "/cards/ru1-7.webp",
    "chase": false,
    "note": "Pikachu from Pokémon Rumble. The artwork and the 7/16 card number come from that promotional collection."
  },
  {
    "id": "si1-13",
    "name": "Exeggutor",
    "supertype": "Pokémon",
    "subtypes": [
      "Stage 1"
    ],
    "hp": "70",
    "types": [
      "Grass"
    ],
    "rarity": "Promo",
    "setName": "Southern Islands",
    "setId": "si1",
    "releaseDate": "2001-07-31",
    "number": "13",
    "artist": "Naoyo Kimura",
    "image": "/cards/si1-13.webp",
    "imageLarge": "/cards/si1-13.webp",
    "chase": false,
    "note": "Exeggutor from Southern Islands. Naoyo Kimura’s tropical illustration is printed across this original card."
  },
  {
    "id": "sv8-1",
    "name": "Exeggcute",
    "supertype": "Pokémon",
    "subtypes": [
      "Basic"
    ],
    "hp": "30",
    "types": [
      "Grass"
    ],
    "rarity": "Common",
    "setName": "Surging Sparks",
    "setId": "sv8",
    "releaseDate": "2024-11-08",
    "number": "1",
    "artist": "Tetsu Kayama",
    "image": "/cards/sv8-1.webp",
    "imageLarge": "/cards/sv8-1.webp",
    "chase": false,
    "note": "Exeggcute from Surging Sparks, illustrated by Tetsu Kayama. A modern common alongside the classic cards."
  },
  {
    "id": "xy12-74",
    "name": "Brock's Grit",
    "supertype": "Trainer",
    "subtypes": [
      "Supporter"
    ],
    "types": [],
    "rarity": "Uncommon",
    "setName": "Evolutions",
    "setId": "xy12",
    "releaseDate": "2016-11-02",
    "number": "74",
    "artist": "Ken Sugimori",
    "image": "/cards/xy12-74.png",
    "imageLarge": "/cards/xy12-74.png",
    "chase": false,
    "note": "Brock’s Grit from Evolutions, illustrated by Ken Sugimori. A real Trainer card, number 74 of 108."
  }
];

export const CHASE_RARITIES = new Set([
  "Rare Holo Star", "Rare Secret", "Rare Ultra", "Special Illustration Rare",
]);

export function isChase(card: ExampleCard): boolean {
  return card.chase || CHASE_RARITIES.has(card.rarity);
}

export function cardById(id: string): ExampleCard {
  const card = EXAMPLE_CARDS.find((entry) => entry.id === id);
  if (!card) throw new Error(`Unknown reference card ${id}`);
  return card;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickFrom<T>(items: T[], count: number, rand: () => number): T[] {
  const pool = [...items];
  const chosen: T[] = [];
  while (chosen.length < count && pool.length > 0) {
    const index = Math.floor(rand() * pool.length);
    const [item] = pool.splice(index, 1);
    chosen.push(item);
  }
  return chosen;
}

/** Deterministic mixed-set demo. The last card is an editorial chase selection. */
export function dealPack(seed: number): ExampleCard[] {
  const rand = mulberry32(seed);
  const chase = EXAMPLE_CARDS.filter((card) => isChase(card));
  const fillers = EXAMPLE_CARDS.filter(
    (card) => card.supertype === "Pokémon" && !isChase(card),
  );
  const hit = pickFrom(chase, 1, rand);
  const rest = pickFrom(fillers, 4, rand);
  return [...rest, ...hit];
}

export function foilTier(rarity: string): "soft" | "holo" | "rare" | "chase" {
  if (CHASE_RARITIES.has(rarity)) return "chase";
  if (rarity === "Illustration Rare") return "rare";
  if (
    rarity === "Double Rare" ||
    rarity.includes("Holo")
  ) {
    return "holo";
  }
  return "soft";
}
