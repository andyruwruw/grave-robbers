// Types
import type { MapStructure } from '@halloween/shared/map-gen/settings';
import type { Point } from './geometry';

/**
 * What a huge world's site holds: the hub (crypt and spawns) or a
 * landmark.
 */
export type SiteKind = 'hub' | 'chapel' | 'well' | 'tower' | 'mausoleums' | 'graveyard' | 'crypt' | 'ruins' | 'stones' | 'patch';

/**
 * A place in a huge world something is built on, with a flat pad around it
 * and roads to its neighbors.
 */
export interface Site {
  /**
   * Its middle's column.
   */
  x: number;

  /**
   * Its middle's row.
   */
  y: number;

  /**
   * What goes there.
   */
  kind: SiteKind;

  /**
   * The flat pad's radius in tiles.
   */
  radius: number;

  /**
   * The pad's terrain level.
   */
  level: number;

  /**
   * Where roads end: its middle, or the hub's arm ends.
   */
  gates: Point[];
}

/**
 * How a kind of site is picked and laid out.
 */
export interface SiteKindInfo {
  /**
   * How often it's picked, against the others.
   */
  weight: number;

  /**
   * Its pad's radius in tiles.
   */
  radius: number;

  /**
   * The landmark knob that turns it off.
   */
  needs: MapStructure;
}
