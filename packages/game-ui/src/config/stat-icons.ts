/**
 * Every pre-rendered stat and trait icon (`assets/stat-icons/<id>.png`,
 * made by `scripts/render-stat-icons.ts`).
 */
export const STAT_ICONS = [
  'damage', 'speed', 'reach', 'knockback', 'gathering', 'lasts', 'toughness', 'spikes', 'blood', 'dig', 'ghost', 'light', 'flame',
  'gear', 'shield', 'crosshair', 'skull', 'holy', 'fang', 'heart-crack', 'heart-plus', 'sparkle', 'anvil', 'lock', 'scroll', 'arrow',
] as const;

/**
 * Every stat bar color; each has a pre-rendered block
 * (`assets/stat-icons/block-<color>.png`), plus `block-empty`.
 */
export const STAT_COLORS = ['red', 'yellow', 'blue', 'sky', 'green', 'brown', 'tan', 'blood', 'ecto', 'sun', 'orange', 'steel'] as const;
