/**
 * One thing to draw on the HUD canvas: an icon image or a run of text, at
 * its on-screen box, at its effective opacity.
 */
interface HudDraw {
  /**
   * The icon to draw, or null for text.
   */
  image: HTMLImageElement | null;

  /**
   * The text to draw (empty for an icon).
   */
  text: string;

  /**
   * The text's CSS font and color (empty for an icon).
   */
  font: string;
  color: string;

  /**
   * Where it sits on screen, in CSS pixels.
   */
  x: number;
  y: number;
  w: number;
  h: number;

  /**
   * Its opacity times every ancestor's up to the painted root.
   */
  alpha: number;
}

/**
 * An element's opacity times its ancestors' up to `root` (CSS animations
 * included, since computed styles carry their current value).
 *
 * @param el - The element.
 * @param root - Where to stop.
 * @returns The effective opacity.
 */
const opacityOf = (el: Element, root: Element): number => {
  let alpha = 1;
  for (let n: Element | null = el; n && n !== root.parentElement; n = n.parentElement) {
    alpha *= Number(getComputedStyle(n).opacity) || 0;
  }
  return alpha;
};

/**
 * Reads what's under each `[data-hud-paint]` element in `root`: every
 * icon image and every run of text, where it is and how visible. The
 * elements themselves are kept invisible (`visibility: hidden`) so only
 * the painted copy shows; layout, animations, and opacity still apply.
 *
 * @param root - The HUD's root element.
 * @returns What to draw.
 */
export const collectHud = (root: HTMLElement): HudDraw[] => {
  const draws: HudDraw[] = [];
  for (const group of root.querySelectorAll<HTMLElement>('[data-hud-paint]')) {
    const walker = document.createTreeWalker(group, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let node: Node | null = walker.currentNode; node; node = walker.nextNode()) {
      if (node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0) {
        const r = node.getBoundingClientRect();
        draws.push({ image: node, text: '', font: '', color: '', x: r.left, y: r.top, w: r.width, h: r.height, alpha: opacityOf(node, group) });
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() && node.parentElement) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        const style = getComputedStyle(node.parentElement);
        draws.push({ image: null, text: node.textContent.trim(), font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, color: style.color, x: r.left, y: r.top, w: r.width, h: r.height, alpha: opacityOf(node.parentElement, group) });
      }
    }
  }
  return draws;
};

/**
 * A short fingerprint of what's drawn, so the canvas is only repainted
 * (and uploaded) when something changed.
 *
 * @param draws - What to draw.
 * @returns The fingerprint.
 */
export const hudKey = (draws: HudDraw[]): string => draws
  .map((d: HudDraw): string => `${d.image?.src.length ?? d.text}:${Math.round(d.x)},${Math.round(d.y)},${Math.round(d.w)},${Math.round(d.h)},${Math.round(d.alpha * 50)}`)
  .join('|');

/**
 * Paints the HUD onto a canvas covering the screen at `scale` canvas
 * pixels per CSS pixel.
 *
 * @param ctx - The canvas.
 * @param draws - What to draw.
 * @param scale - Canvas pixels per CSS pixel.
 */
export const paintHud = (ctx: CanvasRenderingContext2D, draws: HudDraw[], scale: number): void => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = 'middle';
  for (const d of draws) {
    ctx.globalAlpha = d.alpha;
    if (d.image) {
      ctx.drawImage(d.image, d.x, d.y, d.w, d.h);
    } else {
      ctx.font = d.font;
      ctx.fillStyle = d.color;
      ctx.fillText(d.text, d.x, d.y + d.h / 2);
    }
  }
  ctx.globalAlpha = 1;
};
