/**
 * Everything that comes out of the dark. Zombies, vampires, and ghosts are
 * there from the start; the rest turn up as the world level climbs (see
 * `levels.ts`): skeleton archers, ghouls that scuttle on all fours and
 * pounce, witches that lob potions, brutes (huge, slow zombies), and
 * demons that move only through shadow and step out of it behind you.
 */
export type MonsterKind = 'zombie' | 'vampire' | 'ghost' | 'brute' | 'skeleton' | 'witch' | 'ghoul' | 'demon';

export const MONSTER_KINDS: MonsterKind[] = ['zombie', 'vampire', 'ghost', 'brute', 'skeleton', 'witch', 'ghoul', 'demon'];

/**
 * How a monster's attack lands once its windup ends: a melee hitbox in
 * front of it, an arrow, a lobbed potion, a pounce (a fixed leap), a lunge
 * (a dash just past its target, see DEMON_LUNGE), or a ghost's ectoplasm
 * (ghosts keep their own timing).
 */
export type AttackStyle = 'melee' | 'arrow' | 'potion' | 'pounce' | 'lunge' | 'ecto';

export const ATTACK_STYLE: Record<MonsterKind, AttackStyle> = {
  zombie: 'melee',
  vampire: 'melee',
  ghost: 'ecto',
  brute: 'melee',
  skeleton: 'arrow',
  witch: 'potion',
  ghoul: 'pounce',
  demon: 'lunge',
};

/**
 * Kinds that walk and think like zombies: path to whoever they see,
 * shamble around otherwise, chew through what's built in the way.
 */
export function isShambler(kind: MonsterKind): boolean {
  return kind === 'zombie' || kind === 'brute' || kind === 'skeleton' || kind === 'witch' || kind === 'ghoul';
}

/**
 * Kinds that keep to the dark like vampires (and demons).
 */
export function isShadowWalker(kind: MonsterKind): boolean {
  return kind === 'vampire' || kind === 'demon';
}

export function isMonsterKind(kind: string): kind is MonsterKind {
  return (MONSTER_KINDS as string[]).includes(kind);
}

/**
 * Zombies proper (zombies and brutes): what carries junk and wears armor.
 */
export function isZombie(kind: MonsterKind): boolean {
  return kind === 'zombie' || kind === 'brute';
}

/**
 * Stats for one kind of monster. Ghosts can't be hurt and never attack
 * players, so their hp and damage are unused.
 */
export interface MonsterDef {
  /**
   * Name shown in the kill feed.
   */
  label: string;
  hp: number;

  /**
   * Tiles per second.
   */
  speed: number;
  damage: number;

  /**
   * Seconds from one attack starting to the next (windup included).
   */
  cooldown: number;

  /**
   * Seconds an attack winds up (shown on the TV) before it lands. The
   * monster stands its ground and turns to keep its target in front.
   */
  windup: number;

  /**
   * Half-width (radians) of a melee hitbox in front of it.
   */
  arc: number;

  /**
   * For ranged attacks and pounces, how far off it starts one; shooters
   * back away from anyone closer than `keep`.
   */
  range?: number;
  keep?: number;

  /**
   * Seconds before an attack lands that its aim stops following its target
   * (a ghoul's pounce, so stepping aside dodges it); without it, the aim
   * follows right up to the strike.
   */
  lock?: number;

  /**
   * How close (tile units, center to center) a player must be for a
   * melee attack to start; its hitbox reaches STRIKE_SLACK further, so
   * stepping away during the windup is what dodges it. A ghoul's pounce
   * hits anyone this close along its leap.
   */
  reach: number;

  /**
   * How far (tiles) it notices a player it has a clear line of sight to,
   * in front of it (within SIGHT_CONE of where it faces); any direction
   * counts within NEAR_SIGHT.
   */
  sight: number;

  /**
   * Seconds it keeps heading for where it last saw someone.
   */
  memory: number;

  /**
   * How far (tiles) its hits throw a player.
   */
  knockback?: number;
}

export const MONSTERS: Record<MonsterKind, MonsterDef> = {
  zombie: { label: 'Zombie', hp: 10, speed: 1.6, damage: 2, cooldown: 0.9, windup: 0.35, arc: 1.2, reach: 1.1, sight: 7, memory: 6 },
  vampire: { label: 'Vampire', hp: 18, speed: 4.8, damage: 3, cooldown: 0.7, windup: 0.25, arc: 1, reach: 0.85, sight: 14, memory: 6 },
  ghost: { label: 'Ghost', hp: 8, speed: 1.3, damage: 0, cooldown: 0, windup: 0, arc: 0, reach: 0, sight: 6, memory: 0 },
  brute: { label: 'Brute', hp: 30, speed: 1.15, damage: 3.5, cooldown: 1.3, windup: 0.65, arc: 1.1, reach: 1, sight: 7, memory: 8, knockback: 2.4 },
  skeleton: { label: 'Skeleton', hp: 9, speed: 1.9, damage: 2, cooldown: 1.8, windup: 0.7, arc: 0, reach: 0.85, range: 6.5, keep: 3, sight: 9, memory: 6 },
  witch: { label: 'Witch', hp: 14, speed: 1.5, damage: 1.5, cooldown: 2.6, windup: 0.9, arc: 0, reach: 0.85, range: 6, keep: 3.5, sight: 8, memory: 8 },
  ghoul: { label: 'Ghoul', hp: 8, speed: 4.4, damage: 2, cooldown: 2, windup: 0.5, arc: 0, reach: 0.7, range: 3.6, lock: 0.3, sight: 9, memory: 6 },
  demon: { label: 'Demon', hp: 22, speed: 2.6, damage: 3.5, cooldown: 1.4, windup: 0.45, arc: 1, reach: 0.95, range: 3.6, lock: 0.12, sight: 12, memory: 10 },
};

/**
 * How much further than `reach` a melee hitbox lands.
 */
export const STRIKE_SLACK = 0.25;

/**
 * What monsters notice: anyone within NEAR_SIGHT tiles in any direction,
 * or within their `sight` inside SIGHT_CONE radians either side of where
 * they face, with nothing tall in between (trees don't block it). Only
 * monsters within SIGHT_SEARCH tiles of a player are checked at all.
 */
export const NEAR_SIGHT = 5;
export const SIGHT_CONE = 1.1;
export const SIGHT_SEARCH = 15;

/**
 * A skeleton's arrows (tiles per second, flying a little past its range,
 * stopped by walls) and a witch's potions (lobbed to where its target
 * stood, bursting over SPLASH_RADIUS and leaving a purple puddle for
 * PUDDLE_SECONDS that does PUDDLE_DAMAGE per second to anyone standing in
 * it and slows them to GHOST_SLOW while they do).
 */
export const ARROW_SPEED = 9;
export const POTION_SPEED = 5.5;
export const SPLASH_RADIUS = 1.2;
export const PUDDLE_SECONDS = 5;
export const PUDDLE_DAMAGE = 1;

/**
 * A witch caught up close swings her broom instead: a wide sweep (`arc`
 * radians either side) that lands after `windup`, knocks whoever it hits
 * `knockback` tiles away, and slows them for `slow` seconds; at most one
 * every `cooldown`.
 */
export const WITCH_SWIPE = { reach: 1.3, windup: 0.4, cooldown: 1.6, arc: 1.7, damage: 1.5, knockback: 2.8, slow: 2 };

/**
 * A ghoul's pounce: how far it leaps along its aim and how long the leap
 * takes.
 */
export const GHOUL_LEAP = 3.6;
export const GHOUL_LEAP_TIME = 0.32;

/**
 * A ghoul that sees someone but can't pounce yet runs circles around them
 * GHOUL_ORBIT tiles out (within GHOUL_CIRCLE tiles), switching direction
 * every few seconds or when it runs into something.
 */
export const GHOUL_ORBIT = 3;
export const GHOUL_CIRCLE = 7;

/**
 * A ghoul only pounces from at least this far, so there's always a leap
 * to sidestep.
 */
export const GHOUL_MIN_POUNCE = 2;

/**
 * Demons step through shadow: while hunting someone more than
 * DEMON_BLINK_MIN tiles off, every DEMON_BLINK_EVERY seconds (give or take
 * a third) one vanishes and reappears on a dark tile DEMON_BLINK_BEHIND
 * tiles behind its target's back. At most MAX_DEMONS are out at once.
 */
export const DEMON_BLINK_MIN = 3;

/**
 * A demon in the shadows lunges at anyone within its `range`, even
 * someone standing in light: a dash just past where they stand (at most
 * DEMON_LUNGE tiles) taking DEMON_LUNGE_TIME, raking whoever it touches.
 * Caught in the light afterwards, it slinks back to the dark.
 */
export const DEMON_LUNGE = 4;
export const DEMON_LUNGE_TIME = 0.24;
export const DEMON_BLINK_EVERY = 5;
export const DEMON_BLINK_BEHIND = 1.7;
export const MAX_DEMONS = 2;

/**
 * One brute blow never does more than BRUTE_MAX_HIT, however high the
 * world level, before armor.
 */
export const BRUTE_MAX_HIT = 4.5;

/**
 * A brute's damage to a structure per blow (hits never push it).
 */
export const BRUTE_WALL_DAMAGE = 6;

/**
 * Collision radius in tiles (zombies and vampires; ghosts drift through
 * everything).
 */
export const MONSTER_RADIUS = 0.3;

/**
 * Damage a zombie does to a structure in its way, per bite (one bite per
 * `cooldown`).
 */
export const ZOMBIE_WALL_DAMAGE = 2;

/**
 * Built things a vampire smashes through when they're in its way (dark
 * ones only; walls still stop it), and its damage per blow.
 */
export const VAMPIRE_SMASHES: ReadonlySet<string> = new Set(['door', 'wood-fence']);
export const VAMPIRE_WALL_DAMAGE = 3;

/**
 * Zombies that can see a scarecrow within this many tiles go for it before
 * players.
 */
export const SCARECROW_RANGE = 8;

/**
 * Seconds a ghost must sit inside a light to snuff it, and how long a
 * player standing in the light scares it off for.
 */
export const GHOST_SNUFF_TIME = 3;
export const GHOST_SCARE_TIME = 4;

/**
 * Ghosts lob slow balls of ectoplasm at anyone within GHOST_SHOT_RANGE
 * tiles, one every GHOST_SHOT_COOLDOWN seconds (give or take a quarter).
 * A hit does a little damage and slows the player to GHOST_SLOW of their
 * speed for GHOST_SLOW_SECONDS. Like ghosts, the balls drift through walls,
 * but they're slow enough to step out of the way.
 */
export const GHOST_SHOT_RANGE = 5;

/**
 * A ghost that sees someone within its sight gets angry and drifts after
 * them, keeping about GHOST_KEEP tiles away, until they're GHOST_FORGET
 * tiles off. Weapons barely hurt one (GHOST_DAMAGE of a hit's damage, at
 * least 1) but knock it GHOST_KNOCKBACK times as far.
 */
export const GHOST_KEEP = 2.5;
export const GHOST_FORGET = 9;
export const GHOST_DAMAGE = 0.25;
export const GHOST_KNOCKBACK = 5;

/**
 * Zombies and vampires walk at this fraction of their speed through a
 * tree's trunk.
 */
export const MONSTER_TREE_SLOW = 0.7;
export const GHOST_SHOT_COOLDOWN = 4;
export const GHOST_SHOT_SPEED = 5;
export const GHOST_SHOT_REACH = 8;
export const GHOST_SHOT_DAMAGE = 1;
export const GHOST_SLOW = 0.45;
export const GHOST_SLOW_SECONDS = 2.5;

/**
 * Trickle spawning: a base number of monsters plus more per living player,
 * and seconds between spawns while under the cap. The blood moon raises
 * both.
 */
export const BASE_MONSTERS = 2;
export const MONSTERS_PER_PLAYER = 4;
export const SPAWN_INTERVAL = 4.5;
export const BLOOD_MOON_MONSTERS_PER_PLAYER = 7;
export const BLOOD_MOON_SPAWN_INTERVAL = 1;
export const MAX_MONSTERS = 60;

/**
 * Zombies kept shambling around while nobody is playing, so the TV is never
 * empty. The server starts with that many already out.
 */
export const IDLE_ZOMBIES = 10;

/**
 * One ghost per this many burning built lights (fewer lights per ghost
 * during a blood moon), at most one new ghost every GHOST_SPAWN_INTERVAL.
 */
export const LIGHTS_PER_GHOST = 3;
export const BLOOD_MOON_LIGHTS_PER_GHOST = 2;
export const GHOST_SPAWN_INTERVAL = 20;

/**
 * Monsters appear near the map edge, at least this far from every player.
 */
export const SPAWN_EDGE = 5;
export const SPAWN_MIN_DISTANCE = 10;

/**
 * A blood moon rises after BLOOD_MOON_CALM to BLOOD_MOON_CALM +
 * BLOOD_MOON_CALM_SPREAD seconds of play (the clock only runs while someone
 * is connected) and lasts BLOOD_MOON_DURATION. The TV can also summon one.
 */
export const BLOOD_MOON_CALM = 480;
export const BLOOD_MOON_CALM_SPREAD = 240;
export const BLOOD_MOON_DURATION = 90;

/**
 * Fraction of a light's radius that counts as lit for vampires: they wait
 * where the glow is already faint.
 */
export const LIT_FRACTION = 0.75;
