/**
 * Where item `index` of `count` sits on an endless strip scrolled by `offset`, given
 * each item's `pitch` (its width plus the gap after it). Items are wrapped into the
 * window from one pitch before the start, so an item leaving on one side re-enters
 * on the other and the strip never shows a gap while it covers the view.
 */
export function loopPosition(index: number, offset: number, pitch: number, count: number) {
  const total = pitch * count;
  const along = index * pitch - offset + pitch;
  return (((along % total) + total) % total) - pitch;
}
