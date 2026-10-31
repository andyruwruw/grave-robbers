/**
 * A bloater bursts when it dies or when its windup ends next to someone:
 * everyone within `radius` tiles takes `damage` (scaled like any monster
 * hit) and is thrown `knockback` tiles, every other monster in reach takes
 * `monsters` damage (enough to set off another bloater), and it leaves a
 * bile puddle like a witch's potion.
 */
export const BLOATER_BURST = { radius: 2.2, damage: 5, monsters: 8, knockback: 2.2 };
