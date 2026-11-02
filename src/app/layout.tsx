import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Schoolbell } from "next/font/google";

import { ScrollProgress } from "@/components/scroll-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, siteConfig } from "@/lib/site";

import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const hand = Schoolbell({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-schoolbell",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Brandon Sim", url: siteConfig.x }],
  creator: "Brandon Sim",
  keywords: [
    "ThePokeID",
    "Pokémon cards",
    "trading cards",
    "TCG",
    "Brandon Sim",
    "holo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.handle,
    creator: siteConfig.handle,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e10600",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteUrl,
  logo: `${siteUrl}/brand/logo-mark.png`,
  sameAs: [siteConfig.x],
  founder: {
    "@type": "Person",
    name: "Brandon Sim",
    sameAs: siteConfig.x,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ScrollProgress />
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
