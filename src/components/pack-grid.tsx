import { Button } from "@/components/ui/button";

const PACKS = [
  {
    name: "The 30",
    line: "Pikachu rare run",
    price: "24",
    glow: "rgba(255,208,0,0.55)",
    top: "#ff3a30",
  },
  {
    name: "Night rip",
    line: "Special illustration",
    price: "48",
    glow: "rgba(225,6,0,0.65)",
    top: "#7a0410",
  },
  {
    name: "Classic desk",
    line: "Holo classics",
    price: "18",
    glow: "rgba(36,84,230,0.45)",
    top: "#e10600",
  },
  {
    name: "Chase sleeve",
    line: "Futuristic rare",
    price: "64",
    glow: "rgba(255,208,0,0.7)",
    top: "#ffd000",
  },
] as const;

function PackGlyph({ top }: { top: string }) {
  return (
    <svg viewBox="0 0 160 230" className="relative h-44 w-auto drop-shadow-2xl" aria-hidden>
      <rect x="8" y="8" width="144" height="214" rx="16" fill={top} />
      <rect x="8" y="118" width="144" height="104" rx="16" fill="#f7f3ee" />
      <rect x="8" y="112" width="144" height="18" fill="#141414" />
      <circle cx="80" cy="121" r="22" fill="#f7f3ee" stroke="#141414" strokeWidth="6" />
      <circle cx="80" cy="121" r="8" fill="#fff" stroke="#141414" strokeWidth="3" />
      <text x="80" y="72" textAnchor="middle" fontSize="18" fontFamily="Arial Black, sans-serif" fill="#ffd000" stroke="#2454e6" strokeWidth="3" paintOrder="stroke">
        POKEID
      </text>
      <text x="80" y="176" textAnchor="middle" fontSize="18" fontFamily="Arial Black, sans-serif" fill="#e10600">
        30
      </text>
      <rect x="8" y="8" width="144" height="214" rx="16" fill="none" stroke="#1a0b0d" strokeWidth="4" />
    </svg>
  );
}

export function PackGrid() {
  return (
    <div id="packs" className="scroll-mt-28">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">Newest packs</p>
          <h2 className="mt-2 font-display text-4xl leading-none tracking-tight md:text-5xl">
            Glow on. Price is a sample.
          </h2>
        </div>
        <p className="hidden max-w-[12rem] text-right text-xs leading-relaxed text-paper/60 sm:block">
          Original wrappers. Nothing here is for sale.
        </p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {PACKS.map((pack) => (
          <li key={pack.name}>
            <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#12141c] p-3">
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-xl bg-black/40 py-4">
                <span
                  className="pack-glow absolute size-28 rounded-full blur-2xl"
                  style={{ background: pack.glow }}
                />
                <PackGlyph top={pack.top} />
              </div>
              <h3 className="mt-3 font-display text-2xl leading-none">{pack.name}</h3>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-paper/50">
                {pack.line}
              </p>
              <Button asChild variant="sun" size="sm" className="mt-3 w-full">
                <a href="#rip">Open · ${pack.price}</a>
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
