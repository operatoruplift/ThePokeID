"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#floor", id: "floor", label: "Floor" },
  { href: "/#rip", id: "rip", label: "Rip" },
  { href: "/#binder", id: "binder", label: "Binder" },
  { href: "/#favourite", id: "favourite", label: "Favourite" },
  { href: "/#drops", id: "drops", label: "Drops" },
  { href: "/#list", id: "list", label: "List" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("floor");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = LINKS.map((link) => document.getElementById(link.id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    const visibleHeight = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibleHeight.set(entry.target.id, entry.isIntersecting ? entry.intersectionRect.height : 0);
        }
        let bestId = "";
        let bestHeight = 0;
        for (const [id, height] of visibleHeight) {
          if (height > bestHeight) {
            bestId = id;
            bestHeight = height;
          }
        }
        if (bestId) setActive(bestId);
      },
      { rootMargin: "-20% 0px -35% 0px", threshold: [0, 0.15, 0.4, 0.75] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors",
          scrolled ? "border-b border-line bg-paper/90 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/#top" className="flex items-center gap-2 font-display text-xl tracking-tight">
            <Image
              src="/brand/logo.webp"
              alt=""
              width={36}
              height={36}
              className="size-9"
            />
            ThePokeID
          </Link>
          <nav className="hidden items-center gap-5 md:flex" aria-label="Page">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs font-bold uppercase tracking-[0.16em] text-mist hover:text-ink",
                  active === link.id && "text-brand",
                )}
                aria-current={active === link.id ? "true" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <a href={siteConfig.x} target="_blank" rel="noreferrer">
                On X
              </a>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </DialogTrigger>
              <DialogContent className="top-0 right-0 left-auto h-full w-[min(100%,20rem)] translate-x-0 translate-y-0 rounded-none">
                <DialogTitle>Menu</DialogTitle>
                <DialogDescription>Jump the desk.</DialogDescription>
                <nav className="mt-8 flex flex-col gap-2" aria-label="Mobile">
                  {LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-2 py-3 font-display text-4xl leading-none hover:bg-ink/5"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <a
                    href={siteConfig.x}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-brand"
                  >
                    {siteConfig.handle}
                  </a>
                </nav>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <nav
        aria-label="Sections"
        className="fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 mix-blend-difference xl:block"
      >
        <ul className="flex flex-col gap-3 text-white">
          {LINKS.map((link) => (
            <li key={link.id}>
              <Link href={link.href} className="group flex items-center gap-2">
                <span
                  className={cn(
                    "h-px w-5 bg-white/50 transition-all group-hover:w-9",
                    active === link.id && "w-9 bg-white",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.16em] text-white/55",
                    active === link.id && "text-white",
                  )}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
