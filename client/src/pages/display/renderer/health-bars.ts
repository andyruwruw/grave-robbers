// Packages
import { Vector3 } from 'three';

// Local Imports
import { toWorld } from './build-graveyard';

// Types
import type { Camera } from 'three';

const HOLD = 2.5;
const FADE = 0.4;
const FILL = '#e5484d';

/**
 * One bar over something that's been hit.
 */
interface Bar {
  el: HTMLDivElement;
  fill: HTMLDivElement;
  x: number;
  y: number;
  ground: number;
  lift: number;
  age: number;
}

/**
 * Small health bars over things that survive a hit (tiles and monsters),
 * so you can tell how much longer a tree, wall, grave, or zombie will
 * take. Each one fades a moment after the last hit.
 */
export class HealthBars {
  private bars = new Map<string, Bar>();
  private projected = new Vector3();

  constructor(private layer: HTMLElement) {}

  /**
   * Shows (or refreshes) bar `key` `lift` above tile-space (x, y), standing
   * on `ground`, with `health` left (0 to 1). Gone at 0, and nothing shows
   * for something that's untouched.
   */
  hit(key: string, health: number, x: number, y: number, ground: number, lift: number): void {
    if (health <= 0 || health >= 1) {
      this.remove(key);
      return;
    }
    let bar = this.bars.get(key);
    if (!bar) {
      const el = document.createElement('div');
      el.className = 'pointer-events-none absolute left-0 top-0 h-1.5 w-10 border border-background bg-background';
      const fill = document.createElement('div');
      fill.className = 'h-full transition-[width] duration-150';
      fill.style.backgroundColor = FILL;
      el.appendChild(fill);
      this.layer.appendChild(el);
      bar = { el, fill, x, y, ground, lift, age: 0 };
      this.bars.set(key, bar);
    }
    bar.fill.style.width = `${health * 100}%`;
    bar.age = 0;
    this.move(key, x, y, ground);
  }

  /**
   * Keeps a bar over something that moves.
   */
  move(key: string, x: number, y: number, ground: number): void {
    const bar = this.bars.get(key);
    if (bar) {
      bar.x = x;
      bar.y = y;
      bar.ground = ground;
    }
  }

  remove(key: string): void {
    this.bars.get(key)?.el.remove();
    this.bars.delete(key);
  }

  has(key: string): boolean {
    return this.bars.has(key);
  }

  update(dt: number, camera: Camera, width: number, height: number): void {
    for (const [key, bar] of this.bars) {
      bar.age += dt;
      if (bar.age > HOLD + FADE) {
        this.remove(key);
        continue;
      }
      const { x, z } = toWorld(bar.x, bar.y);
      this.projected.set(x, bar.ground + bar.lift, z).project(camera);
      const sx = (this.projected.x + 1) / 2 * width;
      const sy = (1 - this.projected.y) / 2 * height;
      bar.el.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%, -100%)`;
      bar.el.style.opacity = String(Math.min(1, (HOLD + FADE - bar.age) / FADE));
    }
  }

  dispose(): void {
    this.bars.forEach((bar: Bar): void => bar.el.remove());
    this.bars.clear();
  }
}
