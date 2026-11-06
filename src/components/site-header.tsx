"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

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

/** Section colors, each at least 4.5:1 against white so the hovered label stays readable. */
const LINKS = [
  { href: "/#top", id: "top", label: "Home", color: "#5a6577" },
  { href: "/#packs", id: "packs", label: "Packs", color: "#d1301a" },
  { href: "/#floor", id: "floor", label: "Pulls", color: "#b9520f" },
  { href: "/#rip", id: "rip", label: "Pack rip", color: "#8c6a00" },
  { href: "/#binder", id: "binder", label: "Binder", color: "#22803a" },
  { href: "/#favourite", id: "favourite", label: "Favourite", color: "#1773ad" },
  { href: "/#list", id: "list", label: "Updates", color: "#6c43c9" },
] as const;

/** As on Pokémon.com, the logo leads home and the bar lists the sections. */
const BAR_LINKS = LINKS.filter((link) => link.id !== "top");

function navStyle(color: string): CSSProperties {
  return { "--nav-color": color } as CSSProperties;
}

/** A single-color Poké Ball; only its top half rises above the bar's bottom edge. */
function NavBall() {
  return (
    <span className="nav-ball" aria-hidden="true">
      <svg viewBox="0 0 26 26">
        <circle cx="13" cy="13" r="13" fill="currentColor" />
        <rect x="0" y="12" width="26" height="2" fill="white" />
        <circle cx="13" cy="13" r="5.4" fill="white" />
        <circle cx="13" cy="13" r="2.7" fill="currentColor" />
      </svg>
    </span>
  );
}

function MiniBall() {
  return (
    <svg className="utility-ball" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" fill="white" stroke="#262626" strokeWidth="1.5" />
      <path d="M1.5 8a6.5 6.5 0 0 1 13 0Z" fill="#e3350d" />
      <path d="M1 8h14" stroke="#262626" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.3" fill="white" stroke="#262626" strokeWidth="1.3" />
    </svg>
  );
}

export function SiteHeader() {
  const utilityRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const update = () => {
      // The utility row scrolls away; once it has, the bar is pinned and casts a shadow.
      const utility = utilityRef.current;
      const offset = utility && utility.offsetParent !== null ? utility.offsetHeight : 0;
      setStuck(window.scrollY > offset);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
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
    <header className={cn("site-header", stuck && "is-stuck")}>
      <div ref={utilityRef} className="utility-bar">
        <div className="utility-inner">
          <Link href="/#rip" className="utility-link" onClick={() => setActive("rip")}>
            <span className="utility-link-content">
              <MiniBall />
              Rip a sample pack
            </span>
          </Link>
          <Link href="/#favourite" className="utility-link" onClick={() => setActive("favourite")}>
            <span className="utility-link-content">
              <MiniBall />
              Find your favourite
            </span>
          </Link>
          <span className="utility-divider" aria-hidden="true" />
          <a href={siteConfig.x} target="_blank" rel="noreferrer" className="utility-link">
            <span className="utility-link-content">
              Follow {siteConfig.handle}
              <ArrowUpRight className="utility-external" aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>

      <div className="main-bar">
        <div className="main-bar-inner">
          <Link href="/#top" className="nav-brand" onClick={() => setActive("top")}>
            <Image src="/brand/logo.webp" alt="" width={44} height={44} className="nav-brand-logo" />
            <span className="nav-brand-name">ThePokeID</span>
          </Link>

          <nav className="nav-links" aria-label="Page">
            {BAR_LINKS.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn("nav-link", active === link.id && "is-active")}
                style={navStyle(link.color)}
                aria-current={active === link.id ? "location" : undefined}
                onClick={() => setActive(link.id)}
              >
                <span className="nav-label">{link.label}</span>
                <NavBall />
              </Link>
            ))}
          </nav>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="mobile-menu-trigger" aria-label="Open menu">
                <Menu aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="mobile-menu-panel top-0 right-0 left-auto h-full w-[min(100%,20rem)] translate-x-0 translate-y-0 rounded-none">
              <DialogTitle>Explore ThePokeID</DialogTitle>
              <DialogDescription>Your next favourite is on the desk.</DialogDescription>
              <nav className="mobile-nav-list" aria-label="Mobile">
                {LINKS.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={cn("mobile-nav-link", active === link.id && "is-active")}
                    style={navStyle(link.color)}
                    aria-current={active === link.id ? "location" : undefined}
                    onClick={() => {
                      setActive(link.id);
                      setOpen(false);
                    }}
                  >
                    <span className="mobile-nav-ball" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
              <a href={siteConfig.x} target="_blank" rel="noreferrer" className="mobile-social-link">
                Follow {siteConfig.handle}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
