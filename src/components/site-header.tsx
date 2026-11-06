"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Heart,
  House,
  Layers3,
  Menu,
  Newspaper,
  PackageOpen,
  Sparkles,
} from "lucide-react";
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

const LINKS = [
  { href: "/#top", id: "top", label: "Home", icon: House, color: "#919191" },
  { href: "/#packs", id: "packs", label: "Packs", icon: PackageOpen, color: "#e3350d" },
  { href: "/#floor", id: "floor", label: "Pulls", icon: Layers3, color: "#ee6b2f" },
  { href: "/#rip", id: "rip", label: "Pack rip", icon: Sparkles, color: "#e6bc2f" },
  { href: "/#binder", id: "binder", label: "Binder", icon: BookOpen, color: "#4dad5b" },
  { href: "/#favourite", id: "favourite", label: "Favourite", icon: Heart, color: "#30a7d7" },
  { href: "/#list", id: "list", label: "Updates", icon: Newspaper, color: "#1b53ba" },
] as const;

function navStyle(color: string): CSSProperties {
  return { "--nav-color": color } as CSSProperties;
}

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const updateHeader = () => {
      const header = headerRef.current;
      if (!header) return;
      // Keep the full header's space reserved, as Pokémon.com's main-filler does.
      setCompact(window.innerWidth >= 768 && window.scrollY > header.offsetHeight - 57);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);
    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
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
    <header ref={headerRef} className={cn("site-header", compact && "is-compact")}>
      <div className="brand-strip">
        <div className="brand-strip-inner">
          <Link href="/#top" className="brand-home" onClick={() => setActive("top")}>
            <Image src="/brand/logo.webp" alt="" width={56} height={56} className="brand-logo" />
            <span>
              <span className="brand-name">ThePokeID</span>
            </span>
          </Link>
          <Link href="/#rip" className="brand-feature brand-feature-packs" onClick={() => setActive("rip")}>
            <span className="brand-feature-content">
              <PackageOpen className="brand-feature-icon" aria-hidden="true" />
              <span>
                <span className="brand-feature-title">One pack. One hit.</span>
                <span className="brand-feature-subtitle">Try the example rip</span>
              </span>
            </span>
          </Link>
          <Link href="/#binder" className="brand-feature brand-feature-binder" onClick={() => setActive("binder")}>
            <span className="brand-feature-content">
              <BookOpen className="brand-feature-icon" aria-hidden="true" />
              <span>
                <span className="brand-feature-title">Find your favourite</span>
                <span className="brand-feature-subtitle">Explore the card collection</span>
              </span>
            </span>
          </Link>
          <a href={siteConfig.x} target="_blank" rel="noreferrer" className="brand-feature brand-feature-social">
            <span className="brand-feature-content">
              <ArrowUpRight className="brand-feature-icon" aria-hidden="true" />
              <span>
                <span className="brand-feature-title">The real hits</span>
                <span className="brand-feature-subtitle">Follow {siteConfig.handle}</span>
              </span>
            </span>
          </a>
        </div>
      </div>

      <div className="main-nav-slot">
        <nav className="main-nav" aria-label="Page">
          <div className="main-nav-inner">
            <div className="nav-tiles">
              {LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={cn("nav-tile", active === link.id && "is-active")}
                    style={navStyle(link.color)}
                    aria-current={active === link.id ? "location" : undefined}
                    onClick={() => setActive(link.id)}
                  >
                    <Icon className="nav-icon" aria-hidden="true" />
                    <span className="nav-label">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mobile-nav-controls">
              <Link href="/#top" className="mobile-nav-home" onClick={() => setActive("top")}>
                <House aria-hidden="true" />
                Explore the desk
              </Link>
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
                    {LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
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
                          <Icon className="nav-icon" aria-hidden="true" />
                          <span className="nav-label">{link.label}</span>
                        </Link>
                      );
                    })}
                </nav>
                <a href={siteConfig.x} target="_blank" rel="noreferrer" className="mobile-social-link">
                  Follow {siteConfig.handle}
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </nav>
      </div>
    </header>
  );
}
