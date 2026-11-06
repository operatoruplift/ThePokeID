# Reference card artwork

These are authentic printed Pokémon TCG card scans, not generated or redrawn
card designs. Files are stored exactly as downloaded; `sources.json` records each
file's source URL and SHA-256 checksum.

- Twelve card fronts: the high-resolution scans the Pokémon TCG API serves at
  `images.pokemontcg.io/{set}/{number}_hires.png`, retrieved 2026-11-06. Vintage
  scans are 600×825 and modern scans 733–734×1024, the largest the API publishes.
  They replaced smaller, recompressed copies of the same scans; each pair was
  compared pixel by pixel (including 1st Edition stamps) before the swap.
- Printed card-back scan: `Arc29/Card-flipping-game` at
  `09a82c1156fe06ba99b889bac93482bd54f9ca83`,
  `src/resources/images/s-l1600.jpg`.

Metadata is checked against `PokemonTCG/pokemon-tcg-data` at
`39a26a144c8b6ef6c2fb17b2c29d0bb7121e3a11`. Missing rarity values for the
Southern Islands and Pokémon Rumble promotional cards are displayed as Promo.
Tetsu Kayama's Exeggcute artist credit was verified on the printed scan.

Pokémon artwork and trademarks remain the property of Pokémon / Nintendo /
Creatures / GAME FREAK and their respective rights holders. A source repository's
software license does not transfer ownership of the artwork. This is a fan
reference collection, not a claim of affiliation, ownership, inventory, or sale.
