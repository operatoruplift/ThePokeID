export const siteConfig = {
  name: "ThePokeID",
  title: "ThePokeID — Show me the card",
  description:
    "ThePokeID's Pokémon card collection. Authentic card artwork, interactive holo shine, and an example pack rip. Follow @thepokeID on X.",
  x: "https://x.com/thepokeID",
  handle: "@thepokeID",
};

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:4327";
}
