// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { CENTER_X, CENTER_Y } from '../../config/classic';
import { ClassicPass } from '../classic-pass';
import { Chapel } from '../landmarks/chapel';
import { Hill } from '../landmarks/hill';
import { Mausoleums } from '../landmarks/mausoleums';
import { WellPlaza } from '../landmarks/well-plaza';

// Types
import type { Landmark } from '../landmarks/landmark';
import type { Rect } from '../../types/geometry';

/**
 * One landmark in each quadrant of the map.
 */
export class LandmarkPass extends ClassicPass {
  /**
   * One landmark per quadrant, in shuffled order, each tried at a few
   * spots until it fits on open ground. The hill (with the watchtower) is
   * tried again in the other quadrants if its own was too cramped.
   */
  landmarks(): void {
    const quadrants: Rect[] = [
      { x: 2, y: 2, w: CENTER_X - 4, h: CENTER_Y - 4 },
      { x: CENTER_X + 2, y: 2, w: MAP_WIDTH - CENTER_X - 4, h: CENTER_Y - 4 },
      { x: 2, y: CENTER_Y + 2, w: CENTER_X - 4, h: MAP_HEIGHT - CENTER_Y - 4 },
      { x: CENTER_X + 2, y: CENTER_Y + 2, w: MAP_WIDTH - CENTER_X - 4, h: MAP_HEIGHT - CENTER_Y - 4 },
    ];
    const hill = new Hill(this._canvas);
    const { structures } = this.gen;
    const candidates: (Landmark | false)[] = [
      structures.chapel && new Chapel(this._canvas),
      structures.tower && hill,
      structures.mausoleums && new Mausoleums(this._canvas),
      structures.well && new WellPlaza(this._canvas),
    ];
    const builders = this.shuffle(candidates.filter((b): b is Landmark => b !== false));
    const spots = this.shuffle(quadrants);
    const placed = spots.map((q: Rect, i: number): boolean => builders[i]?.tryIn(q) ?? false);
    if (structures.tower && !placed[builders.indexOf(hill)]) {
      spots.some((q: Rect, i: number): boolean => !placed[i] && hill.tryIn(q)) || spots.some((q: Rect): boolean => hill.tryIn(q));
    }
  }
}
