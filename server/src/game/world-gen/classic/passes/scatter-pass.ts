// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { DIRS, GROVES, GROVE_INSET, PUMPKIN_COUNT } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Point } from '../../types/geometry';

/**
 * Groves, rocks, lone trees, graves, and pumpkins over the open ground.
 */
export class ScatterPass extends ClassicPass {
  /**
   * Groves of trees, then rocks, lone trees, and pumpkins on open ground,
   * kept off the spawns.
   * @param spawns The spawn tiles to keep clear.
   */
  scatter(spawns: Point[]): void {
    const nearSpawn = (tx: number, ty: number): boolean =>
      spawns.some(([sx, sy]): boolean => Math.abs(sx - tx) <= 1 && Math.abs(sy - ty) <= 1);
    for (let grove = 0, tries = 0; grove < Math.round(GROVES * this.gen.trees) && tries < 400; tries++) {
      const cx = GROVE_INSET + this.rand() * (MAP_WIDTH - GROVE_INSET * 2);
      const cy = GROVE_INSET + this.rand() * (MAP_HEIGHT - GROVE_INSET * 2);
      if (this.map.get(Math.floor(cx), Math.floor(cy)) !== 'grass') {
        continue;
      }
      grove++;
      const radius = 1.3 + this.rand() * 1.6;
      for (let ty = Math.floor(cy - radius); ty <= cy + radius; ty++) {
        for (let tx = Math.floor(cx - radius); tx <= cx + radius; tx++) {
          if (this.map.get(tx, ty) === 'grass' && !nearSpawn(tx, ty) && Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) < radius && this.rand() < 0.7) {
            this.map.set(tx, ty, 'tree');
          }
        }
      }
    }
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (this.map.get(tx, ty) !== 'grass' || nearSpawn(tx, ty)) {
          continue;
        }
        const roll = this.rand();
        const rock = 0.03 * this.gen.rocks;
        const tree = rock + (this.edge(tx, ty) >= GROVE_INSET ? 0.07 : 0.045) * this.gen.trees;
        const grave = tree + (this.edge(tx, ty) >= 3 ? 0.006 * this.gen.graves * (1 + this.gen.graves) : 0);
        if (roll < rock) {
          this.map.set(tx, ty, 'rock');
        } else if (roll < tree) {
          this.map.set(tx, ty, 'tree');
        } else if (roll < grave) {
          this.map.set(tx, ty, this.rand() < 0.65 ? 'tombstone' : 'cross');
        }
      }
    }
    let pumpkins = 0;
    for (let tries = 0; pumpkins < Math.round(PUMPKIN_COUNT * this.gen.pumpkins) && tries < 800; tries++) {
      const tx = 1 + Math.floor(this.rand() * (MAP_WIDTH - 2));
      const ty = 1 + Math.floor(this.rand() * (MAP_HEIGHT - 2));
      const besidePath = DIRS.some(([dx, dy]): boolean => ['path', 'cobble'].includes(this.map.get(tx + dx, ty + dy)));
      if (this.map.get(tx, ty) === 'grass' && besidePath && !nearSpawn(tx, ty)) {
        this.map.set(tx, ty, 'pumpkin');
        pumpkins++;
      }
    }
  }
}
