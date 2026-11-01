// Types
import type { Bundle } from '../../goods/goods';
import type { SortKey, SortSide } from '../../structures/sorting';
import type { StructureKind } from '../../structures/types/structures';

/**
 * The panel USE opened on a structure, as the phone shows it (a storage
 * chest has its own `stash` message): a bone digger's haul, or a station's
 * batches. Sent again whenever it changes, and null once it's closed.
 */
export type UsePanel = DiggerPanel | StationPanel | SorterPanel;

/**
 * An open bone digger.
 */
export interface DiggerPanel {
  /**
   * Which panel.
   */
  kind: 'digger';

  /**
   * The builder's skill level for it.
   */
  level: number;

  /**
   * What it has dug up, waiting to be collected.
   */
  hoard: Bundle;

  /**
   * Most it holds before it stops digging (DIGGER_CAPACITY).
   */
  capacity: number;

  /**
   * How far through its next dig, 0 to 1 (rounded to tenths).
   */
  progress: number;

  /**
   * Seconds one dig takes at its level.
   */
  seconds: number;
}

/**
 * An open station (sawmill, furnace, and so on).
 */
export interface StationPanel {
  /**
   * Which panel.
   */
  kind: 'station';

  /**
   * Which station.
   */
  station: StructureKind;

  /**
   * The builder's skill level for it.
   */
  level: number;

  /**
   * Batches waiting, the current one included.
   */
  queue: number;

  /**
   * Most batches it holds.
   */
  max: number;

  /**
   * How far through the current batch, 0 to 1 (rounded to tenths).
   */
  progress: number;

  /**
   * Seconds one batch takes at its level.
   */
  seconds: number;

  /**
   * Goods it has pulled in from piles toward its next batch.
   */
  buffer: Bundle;

  /**
   * What it has made and is holding to be collected.
   */
  made: Bundle;

  /**
   * How much it holds before it stops (STATION_HOLD).
   */
  hold: number;
}

/**
 * A belt sorter's panel: the side things roll out when nothing sends
 * them elsewhere, and which thing goes out each other side.
 */
export interface SorterPanel {
  /**
   * Which panel.
   */
  kind: 'sorter';

  /**
   * The side it was laid toward, where everything else goes.
   */
  forward: SortSide;

  /**
   * Which thing goes out each side.
   */
  routes: Partial<Record<SortSide, SortKey>>;
}
