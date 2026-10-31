// Types
import type { SortSide } from '@halloween/shared/structures/sorting';

/**
 * Each side of a belt sorter, as its panel names it.
 */
export const SORT_SIDE_LABELS: Record<SortSide, string> = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
};

/**
 * The headings a sorter's picker groups things under, by key prefix
 * (materials, candy, and blood all go under goods).
 */
export const SORT_GROUP_LABELS: Record<'gear' | 'build' | 'goods', string> = {
  gear: 'Gear',
  build: 'Structures',
  goods: 'Goods',
};

/**
 * Where things roll on to out of each side, for the sorter panel's
 * "everything else rolls on ..." line.
 */
export const SORT_SIDE_ONWARD: Record<SortSide, string> = {
  up: 'up',
  down: 'down',
  left: 'to the left',
  right: 'to the right',
};
