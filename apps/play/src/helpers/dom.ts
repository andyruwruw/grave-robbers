/**
 * The nearest element under `el` that scrolls.
 *
 * @param el - Where to start looking (it, then its ancestors).
 * @returns The scrolling element, or null.
 */
export function scroller(el: HTMLElement | null): HTMLElement | null {
  for (let e = el; e; e = e.parentElement) {
    const style = getComputedStyle(e);
    if (/(auto|scroll)/.test(style.overflowY + style.overflowX) && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth)) {
      return e;
    }
  }
  return null;
}

/**
 * An element's center on screen.
 *
 * @param el - The element.
 * @returns Its center in css px.
 */
export function center(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
