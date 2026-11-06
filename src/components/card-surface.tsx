"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type CardSurfaceProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  contentClassName?: string;
  /** Maximum rotation in degrees toward each edge. */
  tilt?: number;
  /** Use when a surrounding control, rather than a child, owns keyboard focus. */
  focused?: boolean;
};

function resetPosition(element: HTMLDivElement | null) {
  if (!element) return;
  element.style.setProperty("--rx", "0deg");
  element.style.setProperty("--ry", "0deg");
  element.style.setProperty("--tx", "0px");
  element.style.setProperty("--ty", "0px");
  element.style.setProperty("--px", "0.5");
  element.style.setProperty("--py", "0.32");
}

/** Supply an aspect ratio or height through className; artwork fills the surface. */
export function CardSurface({
  children,
  className,
  contentClassName,
  tilt = 14,
  focused = false,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onPointerCancel,
  onFocusCapture,
  onBlurCapture,
  ...props
}: CardSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const motionQueryRef = useRef<MediaQueryList | null>(null);
  const frameRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    motionQueryRef.current = query;
    const reset = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      resetPosition(surfaceRef.current);
    };
    query.addEventListener("change", reset);
    return () => {
      query.removeEventListener("change", reset);
      reset();
    };
  }, []);

  useEffect(() => {
    if (!focused) resetPosition(surfaceRef.current);
  }, [focused]);

  function enter(event: PointerEvent<HTMLDivElement>) {
    onPointerEnter?.(event);
    if (!event.defaultPrevented && event.pointerType !== "touch") {
      setHovered(true);
      updatePosition(event);
    }
  }

  function updatePosition(event: PointerEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.pointerType === "touch" || motionQueryRef.current?.matches) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const rotation = Math.max(0, Math.min(20, tilt));
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      element.style.setProperty("--px", px.toFixed(4));
      element.style.setProperty("--py", py.toFixed(4));
      element.style.setProperty("--rx", `${(0.5 - py) * rotation * 2}deg`);
      element.style.setProperty("--ry", `${(px - 0.5) * rotation * 2}deg`);
      element.style.setProperty("--tx", `${(px - 0.5) * 18}px`);
      element.style.setProperty("--ty", `${(py - 0.5) * 18}px`);
      frameRef.current = null;
    });
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    updatePosition(event);
  }

  function reset() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    resetPosition(surfaceRef.current);
  }

  function leave(event: PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    setHovered(false);
    reset();
  }

  function cancel(event: PointerEvent<HTMLDivElement>) {
    onPointerCancel?.(event);
    setHovered(false);
    reset();
  }

  function focus(event: FocusEvent<HTMLDivElement>) {
    onFocusCapture?.(event);
    setFocusWithin(true);
  }

  function blur(event: FocusEvent<HTMLDivElement>) {
    onBlurCapture?.(event);
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
    setFocusWithin(false);
    reset();
  }

  return (
    <div
      {...props}
      ref={surfaceRef}
      className={cn("card-surface holo", hovered && "is-hovered", (hovered || focusWithin || focused) && "is-hot", className)}
      data-card-surface
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={cancel}
      onFocusCapture={focus}
      onBlurCapture={blur}
    >
      <div className={cn("card-surface-art absolute inset-0 overflow-hidden rounded-[8px] bg-stage shadow-[0_5px_12px_rgba(0,0,0,0.15)]", contentClassName)}>
        {children}
        <span className="holo-foil" aria-hidden="true" />
        <span className="holo-spark" aria-hidden="true" />
        <span className="holo-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
