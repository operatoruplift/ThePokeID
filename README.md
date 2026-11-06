# ThePokeID

Brand site for [ThePokeID](https://x.com/thepokeID). One page: authentic Pokémon card scans, interactive foil and card inspection, a demo pack rip, a "What's your favourite?" picker, scroll-driven drops, and a preview waitlist.

## Run locally

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Use Node.js 24 for development and the built-in regression tests. Next.js requires
Node.js 20.9 or newer. To use the same origin as the default local metadata, run
`npm run dev -- --port 4327`.

Validation:

```bash
npm run lint
npm test
npm run build
```

## Deploy

Import the repo into Vercel. Framework preset is Next.js. No environment variables are required.

Optional: set `NEXT_PUBLIC_SITE_URL` to the production origin (for example `https://thepokeid.com`) so canonical URLs, the sitemap, and JSON-LD use that host. On Vercel, `VERCEL_URL` is used when the variable is unset.

## Card collection

Twelve genuine Pokémon TCG fronts and a printed card-back scan are bundled in
`public/cards`. Names, HP, set numbers, rarities, and illustrators are matched to
the public Pokémon TCG dataset; the Exeggcute illustrator was read from the scan
where the dataset omitted it. Source commits, URLs, and checksums are recorded in
`public/cards/sources.json`. No runtime connection to an image CDN is required.

Cards follow the pointer with perspective rotation up to 14° toward each edge,
sideways movement, lift, scale, and a shifting shadow alongside their foil shine.
The artwork moves inside a stationary hit area so its motion does not feed back
into pointer coordinates, and settles back when the pointer leaves. Touch input
keeps the cards still for scrolling and tapping; reduced motion disables the 3D
movement. Cards open a keyboard-accessible inspector. Tap or
press the flip control to see the back, and zoom to inspect the original scan;
enlarged scans can be panned on mobile. Reduced motion is respected. The selected
favourite and featured desk card also open the inspector.

All card areas use the shared `CardSurface` hover treatment, including the hero
fan, feed thumbnails, favourite picker, story cards, and card backs. The four
selection tiles and face-down reveal use the original blue Pokémon card back,
not custom pack drawings. Choosing a tile starts its deterministic demo deal.

Pulls, the mixed-set demo pack, drops, and the waitlist are demonstrations. Chase
highlights are editorial selections, separate from official rarity. The pack
does not represent official collation or pull rates. The waitlist stores an email
in `localStorage` only; nothing is sent to a server.

Favourites and preview-list entries sync across tabs on the same origin. When
browser storage is blocked or full, the site displays an error instead of
claiming the entry was saved.

## Brand assets

The interface uses a light editorial layout, colored icon navigation, and locally
bundled Lato/Roboto typography inspired by Pokémon's website. Header motion is
based on Pokémon.com's published [main.css](https://assets.pokemon.com/static2/_ui/css/main.css)
and [gus.css](https://assets.pokemon.com/static2/_ui/css/gus.css): navigation tiles
fade to their section color over 300ms with a 100ms icon-color transition. A red
and white Poké Ball springs up in place of the section icon on hover or keyboard
focus, and peeks up behind the label in the compact bar. The utility strip uses the
475ms downward bounce (6px at 40%, 1px at 60%) and fades neighboring promotions to
20% opacity over 200ms. Keyboard focus receives the same treatment; reduced
motion disables animation and transitions. Hover effects only run on devices
that support hover. The desktop navigation becomes a fixed 57px label-only bar
after scrolling past the header, with its original space reserved to prevent a
layout jump. Mobile navigation uses an accessible drawer.

`public/brand` holds the supplied logo, avatar, and X banner. The logo background was removed so it can sit on the page.

Web fonts are bundled in `src/fonts` with their licenses and provenance. Builds
do not download Google Fonts or card artwork. Card scans are served locally, with
optimized thumbnails and original files in the inspector.

## Share previews

Open Graph and Twitter images are rendered with `next/og` at 1200×630 using the
supplied logo and authentic card scans. Both routes use the versioned metadata
ID `real-cards-v2`; bump that ID when changing the design to give social crawlers
a fresh image URL. The shared composition is in `src/lib/social-image.tsx`.
