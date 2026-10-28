// Packages
import { isBuildItem } from '@halloween/shared/gear';
import { GATHERABLE, GRAVE_TILES, RESOURCES } from '@halloween/shared/items';
import { MELEE_REACH_UP } from '@halloween/shared/players';
import { BUILDABLE_FLOORS, STRUCTURES, isStructure } from '@halloween/shared/structures';
import { TREE, nodeUnlocked, upgradeCost } from '@halloween/shared/tree';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world';

// Local Imports
import { findPath } from './pathing';

// Types
import type { BagItem, RecipeId } from '@halloween/shared/gear';
import type { Bundle, Inventory, Resource } from '@halloween/shared/items';
import type { StructureKind } from '@halloween/shared/structures';
import type { NodeId, TreeNode, TreeState } from '@halloween/shared/tree';
import type { Tile, WorldMap } from '@halloween/shared/world';
import type { Step } from './pathing';

/**
 * What the test player knows each tick.
 */
export interface BotView {
  x: number;
  y: number;
  dead: boolean;
  inventory: Inventory;
  bag: (BagItem | null)[];
  canBuild: (kind: StructureKind) => boolean;
  canPay: (cost: Bundle) => boolean;

  /**
   * Whether it stands by a research table, and the world's skill tree.
   */
  research: boolean;
  tree: TreeState;
  map: WorldMap;
  time: number;
  monsters: { x: number; y: number }[];
}

/**
 * The test player's controls: the same intents a phone sends.
 */
export interface BotHands {
  input: (x: number, y: number) => void;
  aim: (x: number, y: number) => void;
  action: (down: boolean) => void;
  craft: (recipe: RecipeId) => void;
  select: (slot: number | null) => void;
  place: () => string | null;
  upgrade: (node: NodeId) => void;
}

type Task =
  | { kind: 'walk'; path: Step[]; goal: Step | null; until: number; chase?: boolean }
  | { kind: 'swing'; goal: Step; tile: Tile; until: number }
  | { kind: 'build'; goal: Step; build: StructureKind; at: number; until: number };

const FIGHT_RANGE = 5;
const STRIKE_RANGE = 1.1;
const WALK_TIME = 25;
const SWING_TIME = 10;
const STUCK_TIME = 1.5;
const CHASE_REPATH = 0.5;
const CHASE_GIVE_UP = 3;
const BUILD_EVERY = 20;
const WANDER_RANGE = 8;
const PICK_TRIES = 6;
const BUILDS: StructureKind[] = ['torch', 'wood-wall', 'wood-fence', 'campfire', 'scarecrow', 'lantern', 'spikes', 'research-table', 'sawmill', 'furnace', 'palisade', 'stone-wall', 'altar', 'sifter', 'digger', 'bone-wall', 'coffin', 'bell', 'bloodforge', 'sentry', 'cauldron'];
const UPGRADE_EVERY = 3;
const SIDES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function tileOf(v: BotView): Step {
  return { tx: Math.floor(v.x), ty: Math.floor(v.y) };
}

function stepCost(map: WorldMap): (tx: number, ty: number, fx: number, fy: number) => number {
  return (tx: number, ty: number, fx: number, fy: number): number => (!map.isSolid(tx, ty) && map.canStep(fx, fy, tx, ty) ? 1 : Infinity);
}

function isOpen(map: WorldMap): (tx: number, ty: number) => boolean {
  return (tx: number, ty: number): boolean => !map.isSolid(tx, ty);
}

/**
 * How many tiles `from` can walk to, moving only straight (so a stricter
 * count than the 8-way pathing), with `block` treated as solid.
 */
function reachable(map: WorldMap, from: Step, block?: Step): number {
  const seen = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
  const queue = [from];
  seen[from.ty * MAP_WIDTH + from.tx] = 1;
  for (let i = 0; i < queue.length; i++) {
    const { tx, ty } = queue[i];
    for (const [dx, dy] of SIDES) {
      const nx = tx + dx;
      const ny = ty + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT || seen[ny * MAP_WIDTH + nx] || (block && nx === block.tx && ny === block.ty) || map.isSolid(nx, ny) || !map.canStep(tx, ty, nx, ny)) {
        continue;
      }
      seen[ny * MAP_WIDTH + nx] = 1;
      queue.push({ tx: nx, ty: ny });
    }
  }
  return queue.length;
}

/**
 * A server-run player for testing from the TV: paths to and fights any
 * monster that comes close (giving up on ones it can't reach), otherwise
 * runs across the map to chop a random tree, mine a rock or grave, or open
 * a chest, every so often builds something next to itself (never where it
 * would wall itself in), spends its candy on a random upgrade whenever it
 * passes a research table, and walks somewhere random when there's nothing
 * to gather.
 */
export class TestPlayer {
  private task: Task | null = null;
  private nextBuildAt = 0;
  private lastX = 0;
  private lastY = 0;
  private movedAt = 0;
  private ignoreFoesUntil = 0;
  private nextUpgradeAt = 0;

  constructor(readonly token: string, private hands: BotHands) {}

  think(v: BotView): void {
    const { hands } = this;
    if (v.dead) {
      this.task = null;
      hands.input(0, 0);
      hands.aim(0, 0);
      hands.action(false);
      return;
    }
    if (Math.hypot(v.x - this.lastX, v.y - this.lastY) > 0.05) {
      this.lastX = v.x;
      this.lastY = v.y;
      this.movedAt = v.time;
    }
    if (v.research && v.time >= this.nextUpgradeAt) {
      this.nextUpgradeAt = v.time + UPGRADE_EVERY;
      const options = TREE.filter((n: TreeNode): boolean => {
        const cost = upgradeCost(n.id, v.tree);
        return nodeUnlocked(n.id, v.tree) && cost !== null && RESOURCES.every((r: Resource): boolean => v.inventory[r] >= cost[r]);
      });
      if (options.length > 0) {
        hands.upgrade(options[Math.floor(Math.random() * options.length)].id);
      }
    }
    const foe = v.time >= this.ignoreFoesUntil ? this.nearestFoe(v) : null;
    if (foe && Math.hypot(foe.x - v.x, foe.y - v.y) <= STRIKE_RANGE) {
      this.task = null;
      hands.input(0, 0);
      hands.aim(foe.x - v.x, foe.y - v.y);
      hands.action(true);
      return;
    }
    if (foe && !(this.task?.kind === 'walk' && this.task.chase && v.time <= this.task.until)) {
      hands.action(false);
      const path = findPath({ from: tileOf(v), to: { tx: Math.floor(foe.x), ty: Math.floor(foe.y) }, cost: stepCost(v.map), open: isOpen(v.map) });
      if (path && path.length > 0) {
        if (this.task?.kind !== 'walk' || !this.task.chase) {
          this.movedAt = v.time;
        }
        this.task = { kind: 'walk', path, goal: null, until: v.time + CHASE_REPATH, chase: true };
      } else {
        this.ignoreFoesUntil = v.time + CHASE_GIVE_UP;
      }
    }
    if (!this.task || v.time > this.task.until) {
      hands.aim(0, 0);
      hands.action(false);
      this.task = this.choose(v);
      this.movedAt = v.time;
    }
    const task = this.task;
    if (task.kind === 'walk') {
      this.walk(v, task);
    } else if (task.kind === 'swing') {
      hands.input(0, 0);
      hands.aim(task.goal.tx + 0.5 - v.x, task.goal.ty + 0.5 - v.y);
      hands.action(true);
      if (v.map.get(task.goal.tx, task.goal.ty) !== task.tile) {
        this.task = null;
      }
    } else {
      hands.input(0, 0);
      hands.aim(task.goal.tx + 0.5 - v.x, task.goal.ty + 0.5 - v.y);
      if (v.time >= task.at) {
        hands.craft(`build:${task.build}`);
        const slot = v.bag.findIndex((item: BagItem | null): boolean => !!item && isBuildItem(item) && item.build === task.build);
        if (slot >= 0) {
          hands.select(slot);
          hands.place();
          hands.select(null);
        }
        this.task = null;
      }
    }
  }

  private nearestFoe(v: BotView): { x: number; y: number } | null {
    let best: { x: number; y: number } | null = null;
    let bestD = FIGHT_RANGE;
    for (const m of v.monsters) {
      const d = Math.hypot(m.x - v.x, m.y - v.y);
      if (d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  }

  /**
   * Follows the path one tile center at a time; gives up when stuck.
   */
  private walk(v: BotView, task: Extract<Task, { kind: 'walk' }>): void {
    if (v.time - this.movedAt > STUCK_TIME) {
      if (task.chase) {
        this.ignoreFoesUntil = v.time + CHASE_GIVE_UP;
      }
      this.task = null;
      return;
    }
    while (task.path.length > 0 && Math.hypot(task.path[0].tx + 0.5 - v.x, task.path[0].ty + 0.5 - v.y) < 0.2) {
      task.path.shift();
    }
    const next = task.path[0];
    if (!next) {
      this.hands.input(0, 0);
      this.task = task.goal ? { kind: 'swing', goal: task.goal, tile: v.map.get(task.goal.tx, task.goal.ty), until: v.time + SWING_TIME } : null;
      return;
    }
    const dx = next.tx + 0.5 - v.x;
    const dy = next.ty + 0.5 - v.y;
    const d = Math.hypot(dx, dy);
    const speed = Math.min(1, 0.4 + d * 2);
    this.hands.input((dx / d) * speed, (dy / d) * speed);
  }

  /**
   * Builds if it's time and something is affordable, otherwise heads for
   * something worth swinging at anywhere on the map, otherwise walks to a
   * random open tile (or just nearby if boxed in).
   */
  private choose(v: BotView): Task {
    const here = tileOf(v);
    if (v.time >= this.nextBuildAt) {
      this.nextBuildAt = v.time + BUILD_EVERY;
      const affordable = BUILDS.filter((k: StructureKind): boolean => v.canBuild(k) && v.canPay(STRUCTURES[k].cost));
      const spot = SIDES.map(([dx, dy]): Step => ({ tx: here.tx + dx, ty: here.ty + dy }))
        .find((s: Step): boolean => BUILDABLE_FLOORS.has(v.map.get(s.tx, s.ty)) && v.map.level(s.tx, s.ty) === v.map.level(here.tx, here.ty) && reachable(v.map, here, s) === reachable(v.map, here) - 1);
      if (affordable.length > 0 && spot) {
        return { kind: 'build', goal: spot, build: affordable[Math.floor(Math.random() * affordable.length)], at: v.time + 0.3, until: v.time + 2 };
      }
    }
    const wanted = (tile: Tile): boolean => {
      if (tile === 'chest' || GRAVE_TILES.has(tile)) {
        return true;
      }
      const gather = GATHERABLE[tile];
      return !!gather;
    };
    const target = (tx: number, ty: number): Step | null => {
      for (const [dx, dy] of SIDES) {
        const gx = tx + dx;
        const gy = ty + dy;
        if (wanted(v.map.get(gx, gy)) && v.map.base(gx, gy) - v.map.top(tx, ty) <= MELEE_REACH_UP) {
          return { tx: gx, ty: gy };
        }
      }
      return null;
    };
    const cost = stepCost(v.map);
    const open = isOpen(v.map);
    const spots: Step[] = [];
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (open(tx, ty) && target(tx, ty)) {
          spots.push({ tx, ty });
        }
      }
    }
    for (let tries = 0; tries < PICK_TRIES && spots.length > 0; tries++) {
      const to = spots.splice(Math.floor(Math.random() * spots.length), 1)[0];
      const goal = target(to.tx, to.ty)!;
      if (to.tx === here.tx && to.ty === here.ty) {
        return { kind: 'swing', goal, tile: v.map.get(goal.tx, goal.ty), until: v.time + SWING_TIME };
      }
      const path = findPath({ from: here, to, cost, open });
      if (path && path.length > 0) {
        return { kind: 'walk', path, goal, until: v.time + WALK_TIME };
      }
    }
    for (let tries = 0; tries < PICK_TRIES; tries++) {
      const to = { tx: 1 + Math.floor(Math.random() * (MAP_WIDTH - 2)), ty: 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2)) };
      const path = open(to.tx, to.ty) ? findPath({ from: here, to, cost, open }) : null;
      if (path && path.length > 0) {
        return { kind: 'walk', path, goal: null, until: v.time + WALK_TIME };
      }
    }
    const way = SIDES.map(([dx, dy]): Step => ({ tx: here.tx + dx, ty: here.ty + dy }))
      .find((s: Step): boolean => !!GATHERABLE[v.map.get(s.tx, s.ty)] || isStructure(v.map.get(s.tx, s.ty)));
    if (way) {
      return { kind: 'swing', goal: way, tile: v.map.get(way.tx, way.ty), until: v.time + SWING_TIME };
    }
    const to = {
      tx: Math.min(MAP_WIDTH - 2, Math.max(1, here.tx + Math.round((Math.random() * 2 - 1) * WANDER_RANGE))),
      ty: Math.min(MAP_HEIGHT - 2, Math.max(1, here.ty + Math.round((Math.random() * 2 - 1) * WANDER_RANGE))),
    };
    return { kind: 'walk', path: findPath({ from: here, to, cost, open, score: (tx: number, ty: number): number => Math.hypot(tx - to.tx, ty - to.ty) }) ?? [], goal: null, until: v.time + WALK_TIME };
  }
}
