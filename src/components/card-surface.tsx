"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { createCardMotion, DEFAULT_TILT, type CardMotion } from "@/lib/card-tilt";
import { cn } from "@/lib/utils";

/** A touch must rest on a card this long before it reacts, so scrolling past cards keeps them still. */
const TOUCH_HOLD_MS = 90;

type SurfaceHandlers = Pick<
  ComponentPropsWithoutRef<"div">,
  | "onPointerEnter"
  | "onPointerMove"
  | "onPointerLeave"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerUp"
  | "onFocusCapture"
  | "onBlurCapture"
>;

type MotionRefs = {
  surfaceRef: RefObject<HTMLDivElement | null>;
  artRef: RefObject<HTMLDivElement | null>;
  shadowRef: RefObject<HTMLSpanElement | null>;
};

function isFocusVisible(element: Element | null) {
  return element instanceof Element && element.matches(":focus-visible");
}

/**
 * Pointer and focus handling shared by cards and framed objects. The surface stays
 * still and measures the pointer; only the art moves, so its motion never feeds back
 * into the pointer position.
 */
function useCardMotion({ surfaceRef, artRef, shadowRef }: MotionRefs, tilt: number, focused: boolean, handlers: SurfaceHandlers) {
  const motionRef = useRef<CardMotion | null>(null);
  const holdRef = useRef<number | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const engagedRef = useRef(false);
  const pressedRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    const motion = createCardMotion({ art, shadow: shadowRef.current }, tilt);
    motionRef.current = motion;
    return () => {
      motion.destroy();
      if (motionRef.current === motion) motionRef.current = null;
    };
  }, [artRef, shadowRef, tilt]);

  useEffect(
    () => () => {
      if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    },
    [],
  );

  // A surrounding control owns focus: present for keyboard focus, shine only for clicks.
  useEffect(() => {
    const surface = surfaceRef.current;
    const motion = motionRef.current;
    if (!surface || !motion || engagedRef.current) return;
    if (focused && isFocusVisible(document.activeElement)) {
      const rect = surface.getBoundingClientRect();
      motion.present(rect.width, rect.height);
    } else if (!focused) {
      motion.release();
    }
  }, [focused, surfaceRef]);

  function place(element: HTMLElement, clientX: number, clientY: number) {
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    motionRef.current?.follow(
      (clientX - rect.left) / rect.width,
      (clientY - rect.top) / rect.height,
      rect.width,
      rect.height,
      pressedRef.current,
    );
  }

  function engage(element: HTMLElement, clientX: number, clientY: number) {
    engagedRef.current = true;
    setHovered(true);
    place(element, clientX, clientY);
  }

  function cancelHold() {
    if (holdRef.current !== null) window.clearTimeout(holdRef.current);
    holdRef.current = null;
  }

  function disengage() {
    cancelHold();
    touchRef.current = null;
    engagedRef.current = false;
    pressedRef.current = false;
    setHovered(false);
    const surface = surfaceRef.current;
    const active = document.activeElement;
    if (surface && isFocusVisible(active) && (focused || surface.contains(active))) {
      const rect = surface.getBoundingClientRect();
      motionRef.current?.present(rect.width, rect.height);
    } else {
      motionRef.current?.release();
    }
  }

  const surfaceHandlers = {
    onPointerEnter(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerEnter?.(event);
      // Touch reacts to a held press instead, so a swipe can scroll past the card.
      if (event.defaultPrevented || event.pointerType === "touch") return;
      engage(event.currentTarget, event.clientX, event.clientY);
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerMove?.(event);
      if (event.defaultPrevented) return;
      if (event.pointerType === "touch") {
        if (touchRef.current) touchRef.current = { x: event.clientX, y: event.clientY };
        if (engagedRef.current) place(event.currentTarget, event.clientX, event.clientY);
        return;
      }
      // Covers a card that appeared under a pointer that has not left it yet.
      if (engagedRef.current) place(event.currentTarget, event.clientX, event.clientY);
      else engage(event.currentTarget, event.clientX, event.clientY);
    },
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerDown?.(event);
      if (event.defaultPrevented) return;
      pressedRef.current = true;
      if (event.pointerType === "touch") {
        cancelHold();
        const element = event.currentTarget;
        touchRef.current = { x: event.clientX, y: event.clientY };
        holdRef.current = window.setTimeout(() => {
          holdRef.current = null;
          const point = touchRef.current;
          if (point) engage(element, point.x, point.y);
        }, TOUCH_HOLD_MS);
        return;
      }
      if (engagedRef.current) place(event.currentTarget, event.clientX, event.clientY);
    },
    onPointerUp(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerUp?.(event);
      pressedRef.current = false;
      if (event.pointerType === "touch") {
        disengage();
        return;
      }
      if (engagedRef.current) place(event.currentTarget, event.clientX, event.clientY);
    },
    onPointerLeave(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerLeave?.(event);
      disengage();
    },
    onPointerCancel(event: PointerEvent<HTMLDivElement>) {
      handlers.onPointerCancel?.(event);
      disengage();
    },
    onFocusCapture(event: FocusEvent<HTMLDivElement>) {
      handlers.onFocusCapture?.(event);
      setFocusWithin(true);
      if (!engagedRef.current && isFocusVisible(event.target)) {
        const rect = event.currentTarget.getBoundingClientRect();
        motionRef.current?.present(rect.width, rect.height);
      }
    },
    onBlurCapture(event: FocusEvent<HTMLDivElement>) {
      handlers.onBlurCapture?.(event);
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      setFocusWithin(false);
      if (!engagedRef.current) motionRef.current?.release();
    },
  };

  return { hovered, hot: hovered || focusWithin || focused, surfaceHandlers };
}

type CardSurfaceProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  contentClassName?: string;
  /** Maximum rotation in degrees toward each edge. 0 keeps the card still but shiny. */
  tilt?: number;
  /** Use when a surrounding control, rather than a child, owns keyboard focus. */
  focused?: boolean;
};

/** Supply an aspect ratio or height through className; artwork fills the surface. */
export function CardSurface({
  children,
  className,
  contentClassName,
  tilt = DEFAULT_TILT,
  focused = false,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  onFocusCapture,
  onBlurCapture,
  ...props
}: CardSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const card = useCardMotion({ surfaceRef, artRef, shadowRef }, tilt, focused, {
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onFocusCapture,
    onBlurCapture,
  });

  return (
    <div
      {...props}
      ref={surfaceRef}
      className={cn("card-surface holo", card.hovered && "is-hovered", card.hot && "is-hot", className)}
      data-card-surface
      {...card.surfaceHandlers}
    >
      <span ref={shadowRef} className="card-surface-shadow" aria-hidden="true" />
      <div ref={artRef} className={cn("card-surface-art absolute inset-0 overflow-hidden rounded-[8px] bg-stage", contentClassName)}>
        {children}
        <span className="holo-foil" aria-hidden="true" />
        <span className="holo-spark" aria-hidden="true" />
        <span className="holo-shade" aria-hidden="true" />
        <span className="holo-glare" aria-hidden="true" />
      </div>
    </div>
  );
}

type TiltFrameProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  /** Classes for the moving frame, such as a slab's case. */
  frameClassName?: string;
  tilt?: number;
};

/** Moves an object that sizes itself, such as a slab, the way CardSurface moves a card. */
export function TiltFrame({
  children,
  className,
  frameClassName,
  tilt = DEFAULT_TILT,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  onFocusCapture,
  onBlurCapture,
  ...props
}: TiltFrameProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const frame = useCardMotion({ surfaceRef, artRef, shadowRef }, tilt, false, {
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onFocusCapture,
    onBlurCapture,
  });

  return (
    <div
      {...props}
      ref={surfaceRef}
      className={cn("tilt-frame holo", frame.hovered && "is-hovered", frame.hot && "is-hot", className)}
      {...frame.surfaceHandlers}
    >
      <span ref={shadowRef} className="card-surface-shadow" aria-hidden="true" />
      <div ref={artRef} className={cn("tilt-frame-art relative", frameClassName)}>
        {children}
        <span className="holo-shade" aria-hidden="true" />
        <span className="holo-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
