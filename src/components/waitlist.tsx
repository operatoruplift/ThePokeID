"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "pokeid-waitlist";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

function writeWaitlist(email: string | null) {
  if (email) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email }));
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const saved = useSyncExternalStore(subscribe, getSnapshot, () => false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setError("That doesn't look like an email.");
      return;
    }
    writeWaitlist(next);
    setError("");
  }

  function reset() {
    writeWaitlist(null);
    setEmail("");
    setError("");
  }

  return (
    <section id="list" className="scroll-mt-24 bg-brand text-white">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">06 — The list</p>
        <h2 className="mt-3 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight md:text-7xl">
          Before it hits the timeline.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
          A note when Brandon posts the next rip. This preview keeps the address in this
          browser only. Nothing is sent to a server.
        </p>

        {saved ? (
          <div className="mt-8 max-w-xl rounded-2xl bg-white/10 p-6">
            <p className="font-hand text-4xl text-sun">You&apos;re on the preview list.</p>
            <p className="mt-2 text-sm text-white/80">
              Stored on this device. Clear it if this isn&apos;t your browser.
            </p>
            <Button variant="sun" className="mt-5" onClick={reset}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <Input
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "waitlist-error" : undefined}
                className="border-white/30 bg-white text-ink"
              />
              {error ? (
                <p id="waitlist-error" className="mt-2 text-sm font-semibold text-sun">
                  {error}
                </p>
              ) : null}
            </div>
            <Button type="submit" variant="sun" className="shrink-0">
              Hold my spot
            </Button>
          </form>
        )}
        <p className="mt-6 font-hand text-2xl text-sun/90">No fake counter. No bots.</p>
      </div>
    </section>
  );
}
