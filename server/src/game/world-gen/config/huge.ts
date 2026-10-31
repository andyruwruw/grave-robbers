// Types
import type { SiteKind, SiteKindInfo } from '../types/sites';

/**
 * The hub at the world's middle: a crypt with four cobbled arms (each
 * HUB_ARM tiles long, two spawns on each) on a flat pad HUB_RADIUS across.
 */
export const HUB_RADIUS = 18;

/**
 * How far each of the hub's arms runs out from the crypt's courtyard.
 */
export const HUB_ARM = 9;

/**
 * Sites (everything but the hub) are scattered at random, each at least
 * SITE_SPACING tiles from every other, until SITE_TRIES darts in a row
 * miss.
 */
export const SITE_SPACING = 30;

/**
 * Darts thrown for site spots.
 */
export const SITE_TRIES = 4000;

/**
 * How far in from the map's edge (tiles) a site's middle stays, past its
 * own radius.
 */
export const SITE_EDGE = 10;

/**
 * Each kind of site: how often it's picked (a weight), its pad's radius,
 * and the landmark switch that turns it off.
 */
export const SITE_KINDS: Record<Exclude<SiteKind, 'hub'>, SiteKindInfo> = {
  chapel: { weight: 2, radius: 10, needs: 'chapel' },
  well: { weight: 2, radius: 10, needs: 'well' },
  tower: { weight: 1.5, radius: 9, needs: 'tower' },
  mausoleums: { weight: 2, radius: 8, needs: 'mausoleums' },
  graveyard: { weight: 3, radius: 10, needs: 'plots' },
  crypt: { weight: 1, radius: 10, needs: 'crypts' },
  ruins: { weight: 2.5, radius: 9, needs: 'ruins' },
  stones: { weight: 1.5, radius: 9, needs: 'stones' },
  patch: { weight: 1.5, radius: 9, needs: 'patches' },
};

/**
 * The height field: two octaves of noise, LAND_SCALE and HILL_SCALE tiles
 * across, the second weighted HILL_WEIGHT.
 */
export const LAND_SCALE = 52;

/**
 * The finer octave's scale.
 */
export const HILL_SCALE = 17;

/**
 * The finer octave's share of the height field.
 */
export const HILL_WEIGHT = 0.35;

/**
 * The share of the world a level up for each of the `mountains` knob
 * (times `mountainSize`), at most HIGH_MAX.
 */
export const HIGH_SHARE = 0.07;

/**
 * The most of the world that can be raised.
 */
export const HIGH_MAX = 0.7;

/**
 * The share of the raised ground that goes a level higher again, times
 * the `peaks` knob.
 */
export const PEAK_SHARE = 0.5;

/**
 * The share of the world sunk into hollows for each of the `pits` knob
 * (times `pitSize`), at most LOW_MAX.
 */
export const LOW_SHARE = 0.06;

/**
 * The most of the world that can be sunk.
 */
export const LOW_MAX = 0.35;

/**
 * The most of the world hills and hollows may take together; they shrink
 * in step to fit.
 */
export const GROUND_LEFT = 0.85;

/**
 * How far past a site's pad (tiles) the ground eases back from the pad's
 * height to its own.
 */
export const PAD_BLEND = 7;

/**
 * The chasm around the map: at least RING_MIN tiles deep, up to
 * RING_MIN + RING_WOBBLE where the noise pushes it in.
 */
export const RING_MIN = 3;

/**
 * How much deeper than RING_MIN the noise pushes the ring in, at most.
 */
export const RING_WOBBLE = 4;

/**
 * Crevasses winding through the wilds: where a noise field CREVASSE_SCALE
 * tiles across crosses its middle (within CREVASSE_WIDTH), kept
 * CREVASSE_CLEARANCE tiles from any site. Plus SINKHOLES round pits.
 */
export const CREVASSE_SCALE = 46;

/**
 * How near the noise's middle (0.5) a tile must be to fall into a crevasse.
 */
export const CREVASSE_WIDTH = 0.03;

/**
 * Tiles every crevasse and sinkhole keeps from a site's pad.
 */
export const CREVASSE_CLEARANCE = 5;

/**
 * Round pits dotted over the wilds.
 */
export const SINKHOLES = 7;

/**
 * Roads: each site joins its nearest neighbors along a minimum spanning
 * tree, plus, with ROAD_LOOPS chance, the nearest one it isn't joined to
 * yet within ROAD_LOOP_REACH tiles, so the network has loops.
 */
export const ROAD_LOOPS = 0.6;

/**
 * How far (tiles) a loop road may reach.
 */
export const ROAD_LOOP_REACH = 60;

/**
 * Route costs per step: up to ROAD_WIGGLE more on a noise field (so roads
 * wander), ROAD_CLIMB more to change level, ROAD_BRIDGE more to cross
 * chasm, ROAD_TRESPASS more through another site's pad, and only
 * ROAD_REUSE on a road already laid (so roads merge).
 */
export const ROAD_WIGGLE = 4;

/**
 * How many tiles across the noise roads wander on is.
 */
export const ROAD_WIGGLE_SCALE = 14;

/**
 * Extra cost of a step up or down a level.
 */
export const ROAD_CLIMB = 10;

/**
 * Extra cost of a step over chasm (a bridge).
 */
export const ROAD_BRIDGE = 14;

/**
 * Extra cost of a step through a site the road isn't for.
 */
export const ROAD_TRESPASS = 40;

/**
 * The whole cost of a step along a road already laid.
 */
export const ROAD_REUSE = 0.5;

/**
 * How hard a road's route search heads for its goal: the cost it guesses
 * per tile left. Above the least a step can cost, so the search is quick
 * but the road not always the very cheapest.
 */
export const ROAD_HASTE = 2;

/**
 * Roads stop this share of a site's radius short of its middle, leaving
 * the pad open for its landmark (which paths out to meet them).
 */
export const ROAD_STOP = 0.8;

/**
 * Lamp posts go along the last LAMP_STRETCH tiles of a road into each
 * site.
 */
export const LAMP_STRETCH = 9;

/**
 * Wild woods: thick where the forest noise (FOREST_SCALE tiles across) is
 * above FOREST_FROM, a scattering of trees, rocks, pumpkins, and lone
 * graves everywhere else (each times its knob).
 */
export const FOREST_SCALE = 20;

/**
 * Forest noise above this grows thick woods.
 */
export const FOREST_FROM = 0.5;

/**
 * Chance of a lone tree on a wild tile.
 */
export const LONE_TREES = 0.03;

/**
 * Chance of a lone rock on a wild tile (times ROCKS_HIGH on raised
 * ground).
 */
export const LONE_ROCKS = 0.012;

/**
 * How many times more rocks raised ground gets.
 */
export const ROCKS_HIGH = 2.5;

/**
 * Chance of a lone pumpkin on a wild tile (times PUMPKINS_ROADSIDE beside
 * a road).
 */
export const LONE_PUMPKINS = 0.0015;

/**
 * How many times more pumpkins grow beside a road.
 */
export const PUMPKINS_ROADSIDE = 8;

/**
 * Chance of a lone grave on a wild tile (times GRAVEFIELD_BOOST in old
 * burial grounds, where a noise GRAVEFIELD_SCALE tiles across is above
 * GRAVEFIELD_FROM).
 */
export const LONE_GRAVES = 0.004;

/**
 * The burial ground noise's scale.
 */
export const GRAVEFIELD_SCALE = 26;

/**
 * Burial ground noise above this is an old burial ground.
 */
export const GRAVEFIELD_FROM = 0.7;

/**
 * How many times more graves an old burial ground has.
 */
export const GRAVEFIELD_BOOST = 14;

/**
 * Stairs: each round of reaching everything adds flights at least
 * CONNECT_SPREAD tiles apart, for at most CONNECT_ROUNDS rounds.
 */
export const CONNECT_SPREAD = 12;

/**
 * Rounds of adding stairs to reach everything.
 */
export const CONNECT_ROUNDS = 40;
