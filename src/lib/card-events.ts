export const OPEN_DEMO_PACK = "pokeid:open-pack";

/** Keep the selection tiles and the reveal table in sync without a page reload. */
export function openDemoPack(seed: number) {
  window.dispatchEvent(new CustomEvent(OPEN_DEMO_PACK, { detail: { seed } }));
}
