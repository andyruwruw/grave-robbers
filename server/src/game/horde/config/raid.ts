// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * What raiding monsters go for in a base (`raidTarget`): its tables,
 * stations, fires, coffins, turrets, and wards. Walls, doors, and fences
 * in the way get chewed on the way there. Storage chests are left alone,
 * so a raid never eats what players put away.
 */
export const RAID_TARGETS: ReadonlySet<Tile> = new Set<Tile>([
  'research-table', 'anvil', 'coffin', 'campfire', 'soul-fire',
  'sawmill', 'furnace', 'sifter', 'bloodforge', 'cauldron', 'oven', 'quarry', 'digger', 'altar',
  'bolt-turret', 'swiper', 'flamethrower', 'ballista', 'sentry',
  'effigy', 'obelisk', 'bell', 'soul-cage', 'blood-fountain',
]);
