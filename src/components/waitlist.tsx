"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserStorage } from "@/lib/browser-storage";

const storage = createBrowserStorage("pokeid-waitlist");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSnapshot() {
  const stored = storage.read();
  if (!stored) return false;
  try {
    const value = JSON.parse(stored);
    return typeof value?.email === "string" && EMAIL_PATTERN.test(value.email);
  } catch {
    return false;
  }
}

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const saved = useSyncExternalStore(storage.subscribe, getSnapshot, () => false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = email.trim();
    if (!EMAIL_PATTERN.test(next)) {
      setError("That doesn't look like an email.");
      return;
    }
    if (!storage.write(JSON.stringify({ email: next }))) {
      setError("Your browser couldn't save this email. Allow browser storage and try again.");
      return;
    }
    setError("");
  }

  function reset() {
    if (!storage.write(null)) {
      setError("Your browser couldn't clear this email. Allow browser storage and try again.");
      return;
    }
    setEmail("");
    setError("");
  }

  return (
    <section id="list" className="scroll-mt-24 border-t-8 border-[#30a7d7] bg-[#146d91] text-white">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <p className="text-sm font-bold text-white">The list</p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl leading-tight md:text-4xl">
          Before it hits the timeline.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white">
          A note for the next rip. This preview keeps the address in this
          browser only. Nothing is sent to a server.
        </p>

        {saved ? (
          <div className="mt-6 max-w-xl rounded-md bg-white p-6 text-ink">
            <p role="status" className="font-display text-2xl text-ink">You&apos;re on the preview list.</p>
            <p className="mt-2 text-sm text-mist">
              Stored on this device. Clear it if this isn&apos;t your browser.
            </p>
            <Button variant="sun" className="mt-5" onClick={reset}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
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
                className="border-white bg-white text-ink focus-visible:border-sun"
              />
            </div>
            <Button type="submit" variant="sun" className="shrink-0">
              Hold my spot
            </Button>
          </form>
        )}
        {error ? (
          <p id="waitlist-error" role="alert" className="mt-3 max-w-xl rounded-md bg-white px-4 py-3 text-sm font-semibold text-ink">
            {error}
          </p>
        ) : null}
        <p className="mt-6 text-sm font-bold text-white">No fake counter. No bots.</p>
      </div>
    </section>
  );
}
