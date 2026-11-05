/* next/og renders a standalone share poster from the same authentic scans as the site. */
/* eslint-disable @next/next/no-img-element -- Satori requires standard image elements. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const socialImageMetadata = {
  // Bump this id when changing the poster so social crawlers receive a new URL.
  id: "real-cards-v2",
  size: { width: 1200, height: 630 },
  contentType: "image/png",
  alt: "ThePokeID — Show me the card. Authentic Charizard, Pikachu, and Umbreon cards beside the ThePokeID logo. Real cards. Your favourites.",
};

const [logo, charizard, pikachu, umbreon, regular, bold] = await Promise.all([
  readFile(join(process.cwd(), "public/brand/logo-mark.png")),
  readFile(join(process.cwd(), "src/app/_social/charizard.png")),
  readFile(join(process.cwd(), "public/cards/xy12-35.png")),
  readFile(join(process.cwd(), "src/app/_social/umbreon.png")),
  readFile(join(process.cwd(), "src/fonts/lato-latin-400-normal.woff")),
  readFile(join(process.cwd(), "src/fonts/lato-latin-700-normal.woff")),
]);

function source(data: Buffer) {
  return `data:image/png;base64,${data.toString("base64")}`;
}

const cards = [
  { name: "Charizard", src: source(charizard), left: 623, top: 182, rotate: "-15deg" },
  { name: "Umbreon", src: source(umbreon), left: 916, top: 154, rotate: "14deg" },
  { name: "Pikachu", src: source(pikachu), left: 778, top: 191, rotate: "0deg" },
];

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f4f4f4",
          color: "#252525",
          fontFamily: "Lato",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 660, top: 10, width: 590, height: 590, display: "flex", borderRadius: "50%", background: "#f5d546" }} />
        <div style={{ position: "absolute", left: 690, top: 40, width: 530, height: 530, display: "flex", borderRadius: "50%", border: "2px solid #efd04a" }} />

        <div style={{ position: "absolute", left: 60, top: 49, display: "flex", alignItems: "center" }}>
          <img src={source(logo)} width={86} height={86} alt="ThePokeID logo" />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 16 }}>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>ThePokeID</div>
            <div style={{ display: "flex", marginTop: 5, fontSize: 21, color: "#666666" }}>@thepokeID</div>
          </div>
        </div>

        <div style={{ position: "absolute", left: 64, top: 218, display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 700, letterSpacing: -3, lineHeight: 1.03 }}>
          <div style={{ display: "flex" }}>Show me</div>
          <div style={{ display: "flex", color: "#286bb1", marginTop: 4 }}>the card.</div>
        </div>
        <div style={{ position: "absolute", left: 68, top: 446, display: "flex", fontSize: 26, color: "#555555" }}>A collection worth a closer look.</div>

        {cards.map((card) => (
          <div key={card.name} style={{ position: "absolute", left: card.left, top: card.top, display: "flex", width: 237, height: 330, transform: `rotate(${card.rotate})`, borderRadius: 13, boxShadow: "0px 14px 24px rgba(25, 40, 65, 0.24)" }}>
            <img src={card.src} width={237} height={330} alt={`${card.name} Pokémon trading card`} style={{ borderRadius: 13 }} />
          </div>
        ))}

        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#286bb1", padding: "0 68px", color: "#ffffff" }}>
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>Real cards. Your favourites.</div>
          <div style={{ display: "flex", fontSize: 19, letterSpacing: 2 }}>THE COLLECTOR’S DESK</div>
        </div>
      </div>
    ),
    {
      ...socialImageMetadata.size,
      fonts: [
        { name: "Lato", data: Uint8Array.from(regular).buffer, weight: 400, style: "normal" },
        { name: "Lato", data: Uint8Array.from(bold).buffer, weight: 700, style: "normal" },
      ],
    },
  );
}
