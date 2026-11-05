import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";

import { createBrowserStorage } from "../src/lib/browser-storage.ts";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let browser;
let values;

beforeEach(() => {
  values = new Map();
  browser = new EventTarget();
  browser.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
});

after(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else delete globalThis.window;
});

function storageEvent(key) {
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: key });
  browser.dispatchEvent(event);
}

test("writes and clears saved choices, notifying the current page", () => {
  const store = createBrowserStorage("choice");
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  assert.equal(store.read(), null);
  assert.equal(store.write("Pikachu"), true);
  assert.equal(store.read(), "Pikachu");
  assert.equal(store.write(null), true);
  assert.equal(store.read(), null);
  assert.equal(updates, 2);
  unsubscribe();
  store.write("Charizard");
  assert.equal(updates, 2);
});

test("observes matching cross-tab changes and browser-wide clearing only", () => {
  const store = createBrowserStorage("choice");
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  storageEvent("unrelated");
  assert.equal(updates, 0);
  values.set("choice", "Pikachu");
  storageEvent("choice");
  assert.equal(store.read(), "Pikachu");
  storageEvent(null);
  assert.equal(updates, 2);
  unsubscribe();
  storageEvent("choice");
  assert.equal(updates, 2);
});

test("blocked storage reads and writes fail safely without claiming a save", () => {
  Object.defineProperty(browser, "localStorage", {
    get() { throw new DOMException("Blocked", "SecurityError"); },
  });
  const store = createBrowserStorage("choice");
  assert.equal(store.read(), null);
  assert.equal(store.write("Pikachu"), false);
  assert.equal(store.write(null), false);
});

test("quota errors preserve the existing value and do not notify a false success", () => {
  values.set("choice", "Pikachu");
  browser.localStorage.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  const store = createBrowserStorage("choice");
  let updates = 0;
  const unsubscribe = store.subscribe(() => updates++);
  assert.equal(store.write("Charizard"), false);
  assert.equal(store.read(), "Pikachu");
  assert.equal(updates, 0);
  unsubscribe();
});
