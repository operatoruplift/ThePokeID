import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "PokeID",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f3",
    theme_color: "#e10600",
    icons: [
      {
        src: "/brand/logo-mark.png",
        sizes: "720x720",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
