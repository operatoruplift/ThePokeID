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
`public/cards`. The fronts are the Pokémon TCG API's high-resolution scans (600×825
for vintage cards, 733–734×1024 for modern ones), so cards stay sharp at binder
size on high-density screens. Names, HP, set numbers, rarities, and illustrators
are matched to the public Pokémon TCG dataset; the Exeggcute illustrator was read
from the scan where the dataset omitted it. Source URLs and checksums are recorded
in `public/cards/sources.json`. No runtime connection to an image CDN is required.

Cards react to the pointer in 3D. Each card turns to face the cursor, up to 18°
toward any edge, leans after it, and lifts off the page with a small pop. Its
shadow falls further as it rises, and directional shading, glare, and foil follow
the light. The motion runs on a spring (`src/lib/card-tilt.ts`): cards overshoot
slightly and wobble back to rest when the pointer leaves, and pressing pushes a
card back down. Perspective scales with each card's size, so desk thumbnails tilt
as visibly as the inspector scan, and cards wider than 240px travel no further in
pixels than a 240px card. The artwork moves inside a stationary hit area so its
motion does not feed back into pointer coordinates; resting cards drop their
transforms. The graded slab tilts as one piece with its card seated inside, and
keyboard focus presents a card in a three-quarter pose. On touchscreens, swipes
and quick taps leave cards still; press and hold to tilt a card toward your
finger. Reduced motion keeps a gentle 5° tilt without travel, pop, or bounce.

Cards open a keyboard-accessible inspector. Tap or press the flip control to see
the back, and zoom to inspect the original scan; the zoomed scan holds still and
can be panned on mobile. The selected favourite and featured desk card also open
the inspector.

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

The header follows Pokémon.com's current layout: a utility row of small links that
scrolls away, then a pinned bar with the logo and text links. Hovering or focusing a
link, or scrolling to its section, colors the label and raises a Poké Ball of the
same color from the bar's bottom edge, so its top half shows, centered under the
label. The ball springs up and sinks back when the pointer leaves. Section colors
keep at least 4.5:1 contrast on white. The utility links use the 475ms downward
bounce (6px at 40%, 1px at 60%) from Pokémon.com's published
[gus.css](https://assets.pokemon.com/static2/_ui/css/gus.css). Hover effects run when
any input supports hover. On phones the bar keeps the logo and an accessible
drawer, where each section shows its colored Poké Ball.

The finish takes after the Pokémon TCG 30th Celebration premium collection boxes,
using ThePokeID's own motifs rather than their logos or artwork. Pearl surfaces sit
over an original line-art pattern of Poké Balls, cards, and sparkles, framed by
gold corners. Two holo finishes, aurora (lime to violet) and eclipse (indigo to
gold), are cut by pearl lid circles with rainbow rims. A rainbow foil edge runs
under the header and along the dark bands. Section labels use spaced capitals with
a foil rule, primary buttons and plates are gold foil, and charcoal bands with
silver type carry the slab, the list, and the footer. Text on holo grounds only
sits over stops that keep 4.5:1 contrast. Reduced motion keeps the Poké Ball and
the finishes but drops the springs and sheens. Bundled Lato and Roboto set the type.

`public/brand` holds the supplied logo, avatar, and X banner. The logo background was removed so it can sit on the page.

Web fonts are bundled in `src/fonts` with their licenses and provenance. Builds
do not download Google Fonts or card artwork. Card scans are served locally, with
original files in the inspector. Every other card declares the width it is drawn
at, so the browser fetches a thumbnail at least that sharp for the screen's pixel
density, encoded at quality 85 to keep fine print and foil texture.

## Share previews

Open Graph and Twitter images are rendered with `next/og` at 1200×630 using the
supplied logo and authentic card scans. Both routes use the versioned metadata
ID `real-cards-v2`; bump that ID when changing the design to give social crawlers
a fresh image URL. The shared composition is in `src/lib/social-image.tsx`.
