"use client";

import { Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { CardDialog } from "@/components/card-dialog";
import { HoloCard } from "@/components/holo-card";
import { cardById, type ExampleCard } from "@/data/cards";
import { DROPS, type DropStory, type DropTone } from "@/data/desk";
import { loopPosition } from "@/lib/loop";
import { cn } from "@/lib/utils";

/** Pearl, then the two holo finishes of the collection boxes. */
const toneClass: Record<DropTone, string> = {
  paper: "drop-pearl text-ink",
  sun: "drop-eclipse text-white",
  brand: "drop-aurora text-ink",
};

/** The loop drifts this many pixels per second. */
const DRIFT = 26;
/** Space between stories, and before the first one. */
const GAP = 20;
/** A pointer must move this far before a press becomes a drag. */
const DRAG_SLOP = 6;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function StoryCopy({ story }: { story: DropStory }) {
  const card = cardById(story.cardId);
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-current">
        {story.index} — {story.kicker}
      </p>
      <h3 className="mt-3 font-display text-3xl leading-tight text-current">{story.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-current">{story.body}</p>
      <p className="mt-3 text-sm font-bold text-current">
        {card.name} · #{card.number}
      </p>
    </div>
  );
}

function StoryPanel({ story, onSelect }: { story: DropStory; onSelect: (card: ExampleCard) => void }) {
  const card = cardById(story.cardId);
  return (
    <article className={cn("drop-panel story-panel", toneClass[story.tone])} data-story={story.id}>
      <StoryCopy story={story} />
      <HoloCard card={card} onSelect={() => onSelect(card)} showMeta={false} sizes="200px" className="story-card" />
    </article>
  );
}

/**
 * The three stories on an endless strip that drifts slowly to the left. Each story
 * leaves on one side and comes back on the other, so there are no copies to hide
 * from keyboards or screen readers. It stops while the mouse is over it or a story
 * has keyboard focus, can be dragged either way (and flung, with momentum), and
 * has a pause button for everyone else.
 */
function StoryLoop({ reduce, onSelect }: { reduce: boolean; onSelect: (card: ExampleCard) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);
  const pitch = useRef(0);
  const hovering = useRef(false);
  const focused = useRef(false);
  const drag = useRef<{ id: number; x: number; start: number; lastX: number; lastT: number; active: boolean } | null>(null);
  const dragged = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const stopped = paused || reduce;

  useEffect(() => {
    pausedRef.current = stopped;
  }, [stopped]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const panels = Array.from(track.children) as HTMLElement[];
    // One story's width plus the gap after it.
    const measure = () => {
      pitch.current = panels[0] ? panels[0].offsetWidth + GAP : 0;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current?.active) {
        if (Math.abs(velocity.current) > 4) {
          offset.current += velocity.current * dt;
          velocity.current *= Math.pow(0.05, dt);
        } else {
          velocity.current = 0;
          if (!hovering.current && !focused.current && !pausedRef.current) offset.current += DRIFT * dt;
        }
      }
      const p = pitch.current;
      if (p > 0) {
        const total = p * panels.length;
        offset.current = ((offset.current % total) + total) % total;
        panels.forEach((panel, i) => {
          const x = GAP + loopPosition(i, offset.current, p, panels.length);
          panel.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  function down(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || drag.current) return;
    dragged.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, start: offset.current, lastX: event.clientX, lastT: event.timeStamp, active: false };
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.x;
    if (!current.active) {
      if (Math.abs(dx) < DRAG_SLOP) return;
      // Capture only once it is a drag, so a plain tap still reaches the card.
      current.active = true;
      dragged.current = true;
      velocity.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const dt = Math.max(1, event.timeStamp - current.lastT) / 1000;
    velocity.current = -(event.clientX - current.lastX) / dt;
    current.lastX = event.clientX;
    current.lastT = event.timeStamp;
    offset.current = current.start - dx;
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    // A slow release settles in place; a flick keeps going and eases off.
    if (event.timeStamp - current.lastT > 80) velocity.current = 0;
    velocity.current = Math.max(-2400, Math.min(2400, velocity.current));
  }

  function swallowDragClick(event: MouseEvent<HTMLDivElement>) {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  // Keyboard focus stops the loop and brings the focused story to the start of the strip.
  function focusIn(event: FocusEvent<HTMLDivElement>) {
    focused.current = true;
    const panel = (event.target as HTMLElement).closest<HTMLElement>(".story-panel");
    const track = trackRef.current;
    if (!panel || !track) return;
    velocity.current = 0;
    offset.current = Array.from(track.children).indexOf(panel) * pitch.current;
  }

  function focusOut(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    focused.current = false;
  }

  return (
    <div className="relative">
      <div className="mx-auto mb-5 flex max-w-6xl items-end justify-between gap-4 px-5">
        <div>
          <p className="eyebrow">From the desk</p>
          <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">Three cards worth a story.</h2>
        </div>
        <button
          type="button"
          className="story-loop-toggle"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={stopped}
          aria-label={stopped ? "Play the stories" : "Pause the stories"}
        >
          {stopped ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>
      <div
        className="story-loop"
        role="group"
        aria-roledescription="carousel"
        aria-label="Stories from the desk"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hovering.current = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hovering.current = false;
        }}
        onClickCapture={swallowDragClick}
        onDragStart={(event) => event.preventDefault()}
        onFocus={focusIn}
        onBlur={focusOut}
      >
        <div ref={trackRef} className="story-track">
          {DROPS.map((story) => (
            <StoryPanel key={story.id} story={story} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Drops() {
  const [active, setActive] = useState<ExampleCard | null>(null);
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  return (
    <section id="drops" className="scroll-mt-24 bg-stage py-12 md:py-16">
      <p className="sr-only">Example drops, not confirmed sales.</p>
      <StoryLoop reduce={reduce} onSelect={setActive} />
      <CardDialog card={active} onClose={() => setActive(null)} />
    </section>
  );
}
