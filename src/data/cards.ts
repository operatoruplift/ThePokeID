/**
 * EXAMPLE DATA — not ThePokeID inventory.
 *
 * Metadata is a curated snapshot of the public Pokémon TCG API
 * (https://pokemontcg.io) for the 30th Celebration sets. Card images are
 * remote URLs on that API's CDN. They are not vendored in this repo.
 * Desk notes are original sample copy.
 */

export type ExampleCard = {
  id: string;
  name: string;
  supertype: "Pokémon" | "Trainer";
  subtypes: string[];
  hp?: string;
  types: string[];
  rarity: string;
  setName: string;
  number: string;
  artist?: string;
  image: string;
  imageLarge: string;
  /** Original sample caption. Not a quote from a sale or a social post. */
  note: string;
};

export const EXAMPLE_CARDS: ExampleCard[] = [
  {
    "id": "me55-30",
    "name": "Pikachu",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "60",
    "types": [
      "Lightning"
    ],
    "rarity": "Pikachu Rare",
    "setName": "30th Celebration",
    "number": "30",
    "artist": "DOM",
    "image": "https://images.scrydex.com/pokemon/me55-30/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-30/large",
    "note": "Number 30. The banner already answered, and the desk still asks."
  },
  {
    "id": "me55-23",
    "name": "Pikachu",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "70",
    "types": [
      "Lightning"
    ],
    "rarity": "Pikachu Rare",
    "setName": "30th Celebration",
    "number": "23",
    "artist": "Ken Sugimori",
    "image": "https://images.scrydex.com/pokemon/me55-23/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-23/large",
    "note": "A Pikachu rare with the classic face. Sample, not a listing."
  },
  {
    "id": "me55-35",
    "name": "Pikachu",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "60",
    "types": [
      "Lightning"
    ],
    "rarity": "Pikachu Rare",
    "setName": "30th Celebration",
    "number": "35",
    "artist": "Susumu Maeya",
    "image": "https://images.scrydex.com/pokemon/me55-35/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-35/large",
    "note": "Another 30 in the Pikachu run. The set is full of them on purpose."
  },
  {
    "id": "me55-42",
    "name": "Pikachu",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "60",
    "types": [
      "Lightning"
    ],
    "rarity": "Pikachu Rare",
    "setName": "30th Celebration",
    "number": "42",
    "artist": "Akira Komayama",
    "image": "https://images.scrydex.com/pokemon/me55-42/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-42/large",
    "note": "Pikachu rare, different illustrator, same question."
  },
  {
    "id": "me55-53",
    "name": "Pikachu ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "190",
    "types": [
      "Lightning"
    ],
    "rarity": "Double Rare",
    "setName": "30th Celebration",
    "number": "53",
    "artist": "5ban Graphics",
    "image": "https://images.scrydex.com/pokemon/me55-53/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-53/large",
    "note": "Pikachu ex, double rare. The ex frame before the illustration chase."
  },
  {
    "id": "me55-149",
    "name": "Pikachu ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "190",
    "types": [
      "Lightning"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "149",
    "artist": "kantaro",
    "image": "https://images.scrydex.com/pokemon/me55-149/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-149/large",
    "note": "Special illustration Pikachu ex. The table goes quiet for this one."
  },
  {
    "id": "me55-150",
    "name": "Pikachu ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "190",
    "types": [
      "Lightning"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "150",
    "artist": "kantaro",
    "image": "https://images.scrydex.com/pokemon/me55-150/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-150/large",
    "note": "The other special illustration Pikachu ex. People argue which is the one."
  },
  {
    "id": "me55-151",
    "name": "Mewtwo ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "230",
    "types": [
      "Psychic"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "151",
    "artist": "Yano Keiji",
    "image": "https://images.scrydex.com/pokemon/me55-151/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-151/large",
    "note": "Mewtwo ex, special illustration. The identity plate writes itself."
  },
  {
    "id": "me55-152",
    "name": "Mew ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "160",
    "types": [
      "Psychic"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "152",
    "artist": "Kuroimori",
    "image": "https://images.scrydex.com/pokemon/me55-152/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-152/large",
    "note": "Mew ex, special illustration. Small pokemon, loud card."
  },
  {
    "id": "me55-153",
    "name": "Sylveon ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 1",
      "ex"
    ],
    "hp": "270",
    "types": [
      "Psychic"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "153",
    "artist": "You Iribi",
    "image": "https://images.scrydex.com/pokemon/me55-153/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-153/large",
    "note": "Sylveon ex, special illustration. Ribbon light, sample binder."
  },
  {
    "id": "me55-154",
    "name": "Gengar ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 2",
      "ex"
    ],
    "hp": "280",
    "types": [
      "Darkness"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "154",
    "artist": "CHORISO",
    "image": "https://images.scrydex.com/pokemon/me55-154/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-154/large",
    "note": "Gengar ex, special illustration. Mean in the best way."
  },
  {
    "id": "me55-155",
    "name": "Jirachi ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "160",
    "types": [
      "Metal"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "155",
    "artist": "AKIRA EGAWA",
    "image": "https://images.scrydex.com/pokemon/me55-155/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-155/large",
    "note": "Jirachi ex, special illustration. A wish, filed under example."
  },
  {
    "id": "me55-156",
    "name": "Salamence ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 2",
      "ex"
    ],
    "hp": "330",
    "types": [
      "Dragon"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "156",
    "artist": "Ryota Murayama",
    "image": "https://images.scrydex.com/pokemon/me55-156/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-156/large",
    "note": "Salamence ex, special illustration. The dragon of this sample desk."
  },
  {
    "id": "me55-148",
    "name": "Greninja ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 2",
      "ex"
    ],
    "hp": "300",
    "types": [
      "Water"
    ],
    "rarity": "Special Illustration Rare",
    "setName": "30th Celebration",
    "number": "148",
    "artist": "GIDORA",
    "image": "https://images.scrydex.com/pokemon/me55-148/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-148/large",
    "note": "Greninja ex, special illustration. Water hit, marked example."
  },
  {
    "id": "me55-157",
    "name": "Mewtwo ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "230",
    "types": [
      "Psychic"
    ],
    "rarity": "Futuristic Rare",
    "setName": "30th Celebration",
    "number": "157",
    "artist": "YOSHIROTTEN",
    "image": "https://images.scrydex.com/pokemon/me55-157/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-157/large",
    "note": "Futuristic rare Mewtwo. Looks like it arrived from the next drop."
  },
  {
    "id": "me55-158",
    "name": "Mew ex",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "ex"
    ],
    "hp": "160",
    "types": [
      "Psychic"
    ],
    "rarity": "Futuristic Rare",
    "setName": "30th Celebration",
    "number": "158",
    "artist": "YOSHIROTTEN",
    "image": "https://images.scrydex.com/pokemon/me55-158/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-158/large",
    "note": "Futuristic rare Mew. The foil reads like a screen."
  },
  {
    "id": "me55-131",
    "name": "Lapras",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "130",
    "types": [
      "Water"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "131",
    "artist": "Amelicart",
    "image": "https://images.scrydex.com/pokemon/me55-131/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-131/large",
    "note": "Illustration rare Lapras. Calm art, sample copy."
  },
  {
    "id": "me55-133",
    "name": "Zapdos",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "120",
    "types": [
      "Lightning"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "133",
    "artist": "mashu",
    "image": "https://images.scrydex.com/pokemon/me55-133/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-133/large",
    "note": "Illustration rare Zapdos. Lightning for the favourite section's cousins."
  },
  {
    "id": "me55-130",
    "name": "Moltres",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "120",
    "types": [
      "Fire"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "130",
    "artist": "mashu",
    "image": "https://images.scrydex.com/pokemon/me55-130/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-130/large",
    "note": "Illustration rare Moltres. The fire bird in the sample binder."
  },
  {
    "id": "me55-132",
    "name": "Articuno",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "120",
    "types": [
      "Water"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "132",
    "artist": "mashu",
    "image": "https://images.scrydex.com/pokemon/me55-132/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-132/large",
    "note": "Illustration rare Articuno. The third bird, still an example."
  },
  {
    "id": "me55-143",
    "name": "Kommo-o",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 2"
    ],
    "hp": "180",
    "types": [
      "Dragon"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "143",
    "artist": "Gemi",
    "image": "https://images.scrydex.com/pokemon/me55-143/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-143/large",
    "note": "Illustration rare Kommo-o. Scales, clang, sample slot."
  },
  {
    "id": "me55-142",
    "name": "Gholdengo",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 1"
    ],
    "hp": "130",
    "types": [
      "Metal"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration",
    "number": "142",
    "artist": "toriyufu",
    "image": "https://images.scrydex.com/pokemon/me55-142/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55-142/large",
    "note": "Illustration rare Gholdengo. Coin stack energy."
  },
  {
    "id": "me55c-4",
    "name": "Charizard",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Stage 2"
    ],
    "hp": "120",
    "types": [
      "Fire"
    ],
    "rarity": "Rare Holo",
    "setName": "30th Celebration: Classic Collection",
    "number": "4",
    "artist": "Mitsuhiro Arita",
    "image": "https://images.scrydex.com/pokemon/me55c-4/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-4/large",
    "note": "Classic collection Charizard. The holo still does the thing."
  },
  {
    "id": "me55c-85",
    "name": "Rayquaza-EX",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic",
      "EX"
    ],
    "hp": "170",
    "types": [
      "Dragon"
    ],
    "rarity": "Rare Holo EX",
    "setName": "30th Celebration: Classic Collection",
    "number": "85",
    "artist": "Eske Yoshinob",
    "image": "https://images.scrydex.com/pokemon/me55c-85/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-85/large",
    "note": "Rayquaza-EX from the classic collection slice. Example only."
  },
  {
    "id": "me55c-114",
    "name": "Mew VMAX",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "VMAX"
    ],
    "hp": "310",
    "types": [
      "Psychic"
    ],
    "rarity": "Holo Rare VMAX",
    "setName": "30th Celebration: Classic Collection",
    "number": "114",
    "artist": "5ban Graphics",
    "image": "https://images.scrydex.com/pokemon/me55c-114/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-114/large",
    "note": "Mew VMAX, classic collection. A different era in the same binder."
  },
  {
    "id": "me55c-101",
    "name": "N",
    "supertype": "Trainer",
    "subtypes": [
      "Supporter"
    ],
    "types": [],
    "rarity": "Rare Ultra",
    "setName": "30th Celebration: Classic Collection",
    "number": "101",
    "artist": "Ken Sugimori",
    "image": "https://images.scrydex.com/pokemon/me55c-101/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-101/large",
    "note": "Trainer N, ultra rare. Yes, a trainer can be the pull."
  },
  {
    "id": "me55c-18",
    "name": "Misty",
    "supertype": "Trainer",
    "subtypes": [],
    "types": [],
    "rarity": "Rare Holo",
    "setName": "30th Celebration: Classic Collection",
    "number": "18",
    "artist": "Ken Sugimori",
    "image": "https://images.scrydex.com/pokemon/me55c-18/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-18/large",
    "note": "Misty, rare holo trainer. Sample from the classic collection."
  },
  {
    "id": "me55c-203",
    "name": "Magikarp",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "30",
    "types": [
      "Water"
    ],
    "rarity": "Illustration Rare",
    "setName": "30th Celebration: Classic Collection",
    "number": "203",
    "artist": "Shinji Kanda",
    "image": "https://images.scrydex.com/pokemon/me55c-203/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-203/large",
    "note": "Illustration rare Magikarp. The splash is the whole joke."
  },
  {
    "id": "me55c-149",
    "name": "Lugia",
    "supertype": "Pok\u00e9mon",
    "subtypes": [
      "Basic"
    ],
    "hp": "80",
    "types": [
      "Colorless"
    ],
    "rarity": "Rare Secret",
    "setName": "30th Celebration: Classic Collection",
    "number": "149",
    "artist": "Naoyo Kimura",
    "image": "https://images.scrydex.com/pokemon/me55c-149/small",
    "imageLarge": "https://images.scrydex.com/pokemon/me55c-149/large",
    "note": "Secret rare Lugia. Big wings, example tag."
  }
];

export const CHASE_RARITIES = new Set([
  "Special Illustration Rare",
  "Futuristic Rare",
  "Rare Secret",
  "Rare Ultra",
]);

export function cardById(id: string): ExampleCard {
  const card = EXAMPLE_CARDS.find((entry) => entry.id === id);
  if (!card) throw new Error(`Unknown example card ${id}`);
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

/** Deterministic example pack. The last card is always a chase rarity. */
export function dealPack(seed: number): ExampleCard[] {
  const rand = mulberry32(seed);
  const chase = EXAMPLE_CARDS.filter((card) => CHASE_RARITIES.has(card.rarity));
  const fillers = EXAMPLE_CARDS.filter(
    (card) => card.supertype === "Pokémon" && !CHASE_RARITIES.has(card.rarity),
  );
  const hit = pickFrom(chase, 1, rand);
  const rest = pickFrom(fillers, 4, rand);
  return [...rest, ...hit];
}

export function foilTier(rarity: string): "soft" | "holo" | "rare" | "chase" {
  if (CHASE_RARITIES.has(rarity)) return "chase";
  if (rarity === "Illustration Rare") return "rare";
  if (
    rarity === "Pikachu Rare" ||
    rarity === "Double Rare" ||
    rarity.includes("Holo") ||
    rarity.includes("Rare")
  ) {
    return "holo";
  }
  return "soft";
}
