export const siteConfig = {
  name: "ThePokeID",
  title: "ThePokeID — Show me the card",
  description:
    "Brandon Sim's Pokémon card brand. Sample pulls, pointer-driven holo shine, and an example pack rip. The real hits land on X @thepokeID.",
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
