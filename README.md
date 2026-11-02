# ThePokeID

Brand site for [ThePokeID](https://x.com/thepokeID), Brandon Sim's Pokémon trading-card desk. One page: an animated hero, a sample pull wall, an example pack rip, a holo binder, a "What's your favourite?" picker, scroll-driven drops, and a preview waitlist.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Deploy

Import the repo into Vercel. Framework preset is Next.js. No environment variables are required.

Optional: set `NEXT_PUBLIC_SITE_URL` to the production origin (for example `https://thepokeid.com`) so canonical URLs, the sitemap, and JSON-LD use that host. On Vercel, `VERCEL_URL` is used when the variable is unset.

## Example data

Card names, rarities, and image URLs are a curated snapshot of the public [Pokémon TCG API](https://pokemontcg.io) for the 30th Celebration sets. Images are loaded from that API's CDN. They are not committed as files.

Pulls, the pack, drops, and the waitlist are placeholders. The waitlist stores an email in `localStorage` only. Nothing is sent to a server.

## Brand assets

`public/brand` holds the supplied logo, avatar, and X banner. The logo background was removed so it can sit on the page.
