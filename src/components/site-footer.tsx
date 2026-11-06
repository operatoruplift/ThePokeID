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
    <footer className="site-footer foil-edge text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.3fr_0.7fr_0.8fr]">
        <div>
          <Image src="/brand/logo.webp" alt="" width={72} height={72} className="size-16" />
          <p className="silver-text mt-4 font-display text-3xl">ThePokeID</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#c9ced6]">
            A place for Pokémon cards. The question stands: what&apos;s your favourite?
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow eyebrow-on-dark">Explore the desk</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 md:grid-cols-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-[#c9ced6] underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow eyebrow-on-dark">Follow on X</p>
          <a
            href={siteConfig.x}
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-3 inline-flex min-h-12 items-center rounded-[6px] px-5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            {siteConfig.handle}
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-6xl border-t border-white/10 px-5 py-6 text-xs leading-relaxed text-[#a9b0bb]">
        Independent fan project. Not affiliated with, endorsed by, or sponsored by Nintendo,
        The Pokémon Company, Creatures Inc., or GAME FREAK. Pokémon and related marks belong
        to their owners. Card scans are bundled for this reference collection; names and set
        details are matched to Pokémon TCG data. Demo pulls, the pack, and the drops are
        not inventory and not offers to sell.
      </p>
    </footer>
  );
}
