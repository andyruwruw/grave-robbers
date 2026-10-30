// Packages
import { Vector3 } from 'three';

// Local Imports
import { toWorld } from '../space/world-coords';

// Types
import type { Camera } from 'three';

/**
 * Seconds a bar stays after the last hit.
 */
const HOLD = 2.5;

/**
 * Seconds a bar takes to fade.
 */
const FADE = 0.4;

/**
 * The bar's fill color.
 */
const FILL = '#e5484d';

/**
 * One bar over something that's been hit.
 */
interface Bar {
  /**
   * The bar's element.
   */
  el: HTMLDivElement;

  /**
   * The fill inside it.
   */
  fill: HTMLDivElement;

  /**
   * Tile-space x of what was hit.
   */
  x: number;

  /**
   * Tile-space y of what was hit.
   */
  y: number;

  /**
   * Ground height it stands on.
   */
  ground: number;

  /**
   * How far above the ground the bar floats.
   */
  lift: number;

  /**
   * Seconds since the last hit.
   */
  age: number;
}

/**
 * Small health bars over things that survive a hit (tiles and monsters),
 * so you can tell how much longer a tree, wall, grave, or zombie will
 * take. Each one fades a moment after the last hit.
 */
export class HealthBars {
  /**
   * Every bar showing, by key.
   */
  private _bars = new Map<string, Bar>();

  /**
   * Scratch point projected to the screen, reused every frame.
   */
  private _projected = new Vector3();

  /**
   * Starts with no bars.
   * @param _layer The element the bars are drawn in, over the canvas.
   */
  constructor(private _layer: HTMLElement) {}

  /**
   * Shows (or refreshes) bar `key` `lift` above tile-space (x, y), standing
   * on `ground`, with `health` left (0 to 1). Gone at 0, and nothing shows
   * for something that's untouched.
   * @param key What was hit.
   * @param health Health left, 0 to 1.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param ground Ground height it stands on.
   * @param lift How far above the ground the bar floats.
   */
  hit(key: string, health: number, x: number, y: number, ground: number, lift: number): void {
    if (health <= 0 || health >= 1) {
      this.remove(key);
      return;
    }
    let bar = this._bars.get(key);
    if (!bar) {
      const el = document.createElement('div');
      el.className = 'pointer-events-none absolute left-0 top-0 h-1.5 w-10 border border-background bg-background';
      const fill = document.createElement('div');
      fill.className = 'h-full transition-[width] duration-150';
      fill.style.backgroundColor = FILL;
      el.appendChild(fill);
      this._layer.appendChild(el);
      bar = { el, fill, x, y, ground, lift, age: 0 };
      this._bars.set(key, bar);
    }
    bar.fill.style.width = `${health * 100}%`;
    bar.age = 0;
    this.move(key, x, y, ground);
  }

  /**
   * Keeps a bar over something that moves.
   * @param key What was hit.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param ground Ground height it stands on.
   */
  move(key: string, x: number, y: number, ground: number): void {
    const bar = this._bars.get(key);
    if (bar) {
      bar.x = x;
      bar.y = y;
      bar.ground = ground;
    }
  }

  /**
   * Takes a bar away.
   * @param key What was hit.
   */
  remove(key: string): void {
    this._bars.get(key)?.el.remove();
    this._bars.delete(key);
  }

  /**
   * Whether a bar is showing.
   * @param key What was hit.
   * @returns True while its bar shows.
   */
  has(key: string): boolean {
    return this._bars.has(key);
  }

  /**
   * Ages, fades and places every bar over what it belongs to.
   * @param dt Seconds since the last frame.
   * @param camera The world camera.
   * @param width The layer's width, in pixels.
   * @param height The layer's height, in pixels.
   */
  update(dt: number, camera: Camera, width: number, height: number): void {
    for (const [key, bar] of this._bars) {
      bar.age += dt;
      if (bar.age > HOLD + FADE) {
        this.remove(key);
        continue;
      }
      const { x, z } = toWorld(bar.x, bar.y);
      this._projected.set(x, bar.ground + bar.lift, z).project(camera);
      const sx = (this._projected.x + 1) / 2 * width;
      const sy = (1 - this._projected.y) / 2 * height;
      bar.el.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%, -100%)`;
      bar.el.style.opacity = String(Math.min(1, (HOLD + FADE - bar.age) / FADE));
    }
  }

  /**
   * Removes every bar.
   */
  dispose(): void {
    this._bars.forEach((bar: Bar): void => bar.el.remove());
    this._bars.clear();
  }
}
