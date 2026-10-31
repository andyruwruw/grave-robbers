/**
 * A necromancer that sees someone in its `range` raises the dead: each
 * cast brings NECRO_RAISE skeletons up out of the ground within
 * NECRO_RAISE_SPREAD tiles of it, while it has fewer than NECRO_MINIONS
 * out. With that many out, the cast is a soul bolt (an ectoplasm ball that
 * slows) instead.
 */
export const NECRO_RAISE = 2;

/**
 * Tiles around a necromancer its skeletons come up.
 */
export const NECRO_RAISE_SPREAD = 2.5;

/**
 * Most skeletons one necromancer keeps raised at once.
 */
export const NECRO_MINIONS = 4;

/**
 * Speed of a necromancer's soul bolt (tiles a second).
 */
export const NECRO_BOLT_SPEED = 4.5;

/**
 * Other monsters within NECRO_WARD_RADIUS tiles of a necromancer are warded:
 * hits on them do NECRO_WARD of their damage.
 */
export const NECRO_WARD_RADIUS = 4.5;

/**
 * Share of a hit's damage a warded monster takes.
 */
export const NECRO_WARD = 0.7;

/**
 * Up close a necromancer blasts the grave dirt around it: once a player
 * is within NECRO_NOVA_RADIUS tiles (and NECRO_NOVA_EVERY seconds have
 * passed since the last), it glows for NECRO_NOVA_WINDUP seconds, then
 * hurts and throws back everyone that close.
 */
export const NECRO_NOVA_RADIUS = 2;

/**
 * Damage the necromancer's nova does.
 */
export const NECRO_NOVA_DAMAGE = 4;

/**
 * Knockback (tiles) of the necromancer's nova.
 */
export const NECRO_NOVA_KNOCKBACK = 2.5;

/**
 * Seconds the necromancer's nova glows before it goes off (time to dodge).
 */
export const NECRO_NOVA_WINDUP = 0.45;

/**
 * Least seconds between two of a necromancer's novas.
 */
export const NECRO_NOVA_EVERY = 3;
