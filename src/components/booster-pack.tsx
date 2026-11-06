"use client";

import Image from "next/image";
import { animate, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useRef, type MouseEvent, type PointerEvent } from "react";

import { bodyClipPath, stripClipPath, type PackFinish } from "@/lib/sample-packs";
import { cn } from "@/lib/utils";

const STRIP_CLIP = stripClipPath();
const BODY_CLIP = bodyClipPath();

/** Letting go past this much of a tear finishes the rip; before it, the strip springs back. */
const RIP_COMMIT = 0.55;
/** A drag must cover this share of the pack's width to tear it all the way. */
const RIP_SPAN = 0.8;

type BoosterPackProps = {
  name: string;
  finish: PackFinish;
  /** 0 while sealed, 1 once the top strip has torn free. */
  rip: MotionValue<number>;
  /** The strip has flown off and the cards are coming out. */
  open: boolean;
  /** Sealed and waiting for a rip. */
  interactive: boolean;
  /** A press or tap: rip it automatically. */
  onRip: () => void;
  /** A drag tore the strip free. */
  onTorn: () => void;
};

/**
 * A sealed sample pack in the site's foil finish. Drag across it to tear the top
 * strip along its perforation, or press it to rip it open.
 */
export function BoosterPack({ name, finish, rip, open, interactive, onRip, onTorn }: BoosterPackProps) {
  const packRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; x: number; width: number; moved: boolean } | null>(null);
  const swallowClick = useRef(false);

  useMotionValueEvent(rip, "change", (value) => {
    packRef.current?.style.setProperty("--rip", value.toFixed(4));
  });

  function down(event: PointerEvent<HTMLButtonElement>) {
    if (!interactive || drag.current || event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.current = { id: event.pointerId, x: event.clientX, width: rect.width, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    if (Math.abs(dx) > 6) current.moved = true;
    if (current.moved) rip.set(Math.max(0, Math.min(1, dx / (current.width * RIP_SPAN))));
  }

  function release(event: PointerEvent<HTMLButtonElement>, cancelled: boolean) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    // A plain tap falls through to the click, which rips the pack automatically.
    if (!current.moved) return;
    swallowClick.current = true;
    if (!cancelled && rip.get() >= RIP_COMMIT) {
      animate(rip, 1, { duration: 0.2, ease: "easeOut" }).then(onTorn);
    } else {
      animate(rip, 0, { type: "spring", stiffness: 340, damping: 24 });
    }
  }

  function click(event: MouseEvent<HTMLButtonElement>) {
    if (swallowClick.current) {
      swallowClick.current = false;
      event.preventDefault();
      return;
    }
    if (interactive) onRip();
  }

  return (
    <button
      ref={packRef}
      type="button"
      className={cn("booster", `is-${finish}`, open && "is-open", interactive && "is-sealed")}
      aria-label={`Rip open ${name}`}
      aria-disabled={!interactive}
      onClick={click}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={(event) => release(event, false)}
      onPointerCancel={(event) => release(event, true)}
    >
      <span className="booster-light" aria-hidden="true" />
      <span className="booster-body" style={{ clipPath: BODY_CLIP }} aria-hidden="true">
        <span className="booster-front">
          <span className="booster-lid">
            <Image src="/brand/logo.webp" alt="" width={120} height={120} draggable={false} />
          </span>
          <span className="booster-name">{name}</span>
          <span className="booster-count">5 cards · sample pack</span>
        </span>
      </span>
      <span className="booster-strip" style={{ clipPath: STRIP_CLIP }} aria-hidden="true">
        <span className="booster-strip-label">ThePokeID</span>
      </span>
      <span className="booster-perf" aria-hidden="true" />
      <span className="booster-notch" aria-hidden="true" />
      <span className="booster-hint" aria-hidden="true" />
      <span className="booster-spark" aria-hidden="true" />
    </button>
  );
}
