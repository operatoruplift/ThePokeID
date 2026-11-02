import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

const LINKS = [
  { href: "/#packs", label: "Packs" },
  { href: "/#floor", label: "Floor" },
  { href: "/#rip", label: "Rip" },
  { href: "/#binder", label: "Binder" },
  { href: "/#favourite", label: "Favourite" },
  { href: "/#drops", label: "Drops" },
  { href: "/#list", label: "List" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
        <div>
          <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-16" />
          <p className="mt-4 font-display text-4xl tracking-tight">ThePokeID</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-paper/75">
            A Brandon Sim card brand. The question stands: what&apos;s your favourite?
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-paper/50">Desk</p>
          <ul className="mt-3 space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm hover:text-sun">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-paper/50">X</p>
          <a
            href={siteConfig.x}
            target="_blank"
            rel="noreferrer"
            className="lip mt-3 inline-flex h-12 items-center rounded-xl bg-brand px-5 text-sm font-semibold uppercase tracking-[0.14em] text-white [--lip:var(--brand-deep)]"
          >
            {siteConfig.handle}
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-12 text-xs leading-relaxed text-paper/60">
        Independent fan project. Not affiliated with, endorsed by, or sponsored by Nintendo,
        The Pokémon Company, Creatures Inc., or GAME FREAK. Pokémon and related marks belong
        to their owners. Card images load from the public Pokémon TCG API at pokemontcg.io
        for demonstration and are not stored in this repository. Sample pulls, the pack, and
        the drops are placeholders, not inventory and not offers to sell.
      </p>
    </footer>
  );
}
