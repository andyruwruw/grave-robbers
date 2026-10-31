// Local Imports
import { createMonsterAvatar } from '../../avatars/monsters/create-monster-avatar';
import { SHAKE_TIME } from '../camera/config/camera';
import {
  BILE_SPLASH,
  BLOOD,
  DEATH_PUFF,
  DEMON_BURST,
  DIRT,
  SLAM_DIRT,
  SLAM_MARK,
} from '../config/effect-colors';
import { bloodCount } from '../helpers/blood-count';
import { ScenePart } from '../scene-part';
import {
  LIFT_HEIGHT,
  MONSTER_BAR_LIFT,
  MONSTER_PIVOT,
  STRIKER_RANGE,
} from './config/actors';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { ShakeSource } from '../../types/effects';
import type { CameraRig } from '../camera/camera-rig';
import type { WorldContext } from '../world-context';
import type { ActorLift } from './actor-lift';
import type { PlayerAvatars } from './player-avatars';
import type { SnapshotInterpolator } from './snapshot-interpolator';

/**
 * One MonsterAvatar per monster: created, updated, and removed from each
 * snapshot (bleeding and knocked back when hit, torn apart when they die),
 * then placed every frame, with a brute's slams throwing up dirt.
 */
export class MonsterAvatars extends ScenePart {
  /**
   * Every monster's avatar, by monster id.
   */
  readonly monsters = new Map<number, MonsterAvatar>();

  /**
   * Avatars of monsters that just vanished, waiting for this tick's death
   * events to tear them apart.
   */
  private _dying: MonsterAvatar[] = [];

  /**
   * Starts with no monsters.
   * @param ctx What every part of the scene shares.
   * @param _rig The camera, shaken when monsters are hit and slam.
   * @param _interp Where everyone is drawn in the past.
   * @param _lift Monsters the TV's mouse holds up.
   * @param _players The players, to find who struck a monster.
   */
  constructor(ctx: WorldContext, private _rig: CameraRig, private _interp: SnapshotInterpolator, private _lift: ActorLift, private _players: PlayerAvatars) {
    super(ctx);
  }

  /**
   * Applies the latest monsters: creates, updates, and removes avatars.
   * Vanished avatars wait for this tick's death events to tear them apart.
   * @param monsters Every monster.
   */
  set(monsters: MonsterState[]): void {
    const seen = new Set<number>();
    const now = performance.now() / 1000;
    const blood = this._ctx.display.blood;
    for (const m of monsters) {
      seen.add(m.id);
      this._interp.record(`m${m.id}`, m.x, m.y, now);
      const existing = this.monsters.get(m.id);
      if (existing) {
        if (m.hurts > existing.target.hurts) {
          const angle = this.knockFromNearestPlayer(existing, m);
          this._rig.shake = SHAKE_TIME;
          this._ctx.chips.puff(m.x, m.y, BLOOD[m.kind], bloodCount(30, blood));
          this._ctx.gore.spatter(m.x, m.y, BLOOD[m.kind], bloodCount(12, blood), angle, 1.4);
          this._ctx.healthBars.hit(`m${m.id}`, m.health, m.x, m.y, this._ctx.elevation(m.x, m.y), MONSTER_BAR_LIFT);
          this._ctx.lightMap.darken(this._ctx.chips.group);
        }
        existing.target = m;
        continue;
      }
      const avatar = createMonsterAvatar(m);
      this._ctx.lightMap.darken(avatar.group);
      this.monsters.set(m.id, avatar);
      this.scene.add(avatar.group, avatar.trail);
    }
    for (const [id, avatar] of this.monsters) {
      if (!seen.has(id)) {
        this._ctx.healthBars.remove(`m${id}`);
        this.scene.remove(avatar.trail);
        this._dying.push(avatar);
        this.monsters.delete(id);
        this._interp.forget(`m${id}`);
        this._ctx.impacts.delete(`m${id}`);
      }
    }
  }

  /**
   * A monster died at (x, y): the avatar that just vanished nearest there
   * bursts apart along `angle` in a spray of blood (with no blood at all,
   * it just vanishes in a puff).
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param kind The monster's kind.
   * @param angle The direction of the killing blow.
   */
  kill(x: number, y: number, kind: MonsterKind, angle: number): void {
    let best = -1;
    let bestDist = 1.5;
    this._dying.forEach((avatar: MonsterAvatar, i: number): void => {
      const d = Math.hypot(avatar.target.x - x, avatar.target.y - y);
      if (avatar.target.kind === kind && d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    const blood = this._ctx.display.blood;
    this._ctx.chips.puff(x, y, BLOOD[kind], bloodCount(40, blood));
    this._ctx.gore.spatter(x, y, BLOOD[kind], bloodCount(22, blood), angle, 1.8);
    this._ctx.gore.spatter(x, y, BLOOD[kind], bloodCount(8, blood), null, 0.8);
    if (kind === 'demon') {
      this._ctx.chips.puff(x, y, DEMON_BURST, bloodCount(90, blood));
      this._ctx.gore.spatter(x, y, DEMON_BURST, bloodCount(40, blood), null, 2.8);
      this._ctx.gore.spatter(x, y, BLOOD[kind], bloodCount(20, blood), null, 1.6);
      this._rig.shake = SHAKE_TIME * 2;
    } else if (kind === 'bloater') {
      this._ctx.chips.puff(x, y, BILE_SPLASH, bloodCount(70, blood));
      this._ctx.gore.spatter(x, y, BILE_SPLASH, bloodCount(36, blood), null, 2.4);
      this._rig.shake = SHAKE_TIME;
    }
    if (best >= 0 && blood > 0) {
      const [avatar] = this._dying.splice(best, 1);
      avatar.group.visible = !this._ctx.monstersHidden;
      this._ctx.gore.tearApart(avatar.group, avatar.body, angle, (): void => avatar.dispose());
    } else {
      this._ctx.chips.puff(x, y, DEATH_PUFF[kind], 10);
    }
  }

  /**
   * Frees the vanished avatars no death event tore apart.
   */
  flushDying(): void {
    for (const avatar of this._dying) {
      this.scene.remove(avatar.group);
      avatar.dispose();
    }
    this._dying = [];
  }

  /**
   * Places every monster for this frame (interpolated or eased toward the
   * snapshot; lifted and dangling if the TV's mouse holds them; hidden while
   * a blood fountain holds it, where `FountainVictims` floats its head),
   * throws up dirt where a slam lands, and keeps health bars over their
   * heads.
   * @param dt Seconds since the last frame.
   * @param time Clock seconds.
   * @param drawnAt The moment interpolated monsters are drawn at.
   */
  update(dt: number, time: number, drawnAt: number): void {
    for (const monster of this.monsters.values()) {
      const past = this._interp.delay > 0 ? this._interp.sample(`m${monster.target.id}`, drawnAt) : null;
      monster.exact = past !== null;
      if (past) {
        monster.target = { ...monster.target, x: past.x, y: past.y };
      }
      const mLift = this._lift.height(`m${monster.target.id}`, monster.target.lifted, dt);
      monster.update(dt, time, this._ctx.elevation(monster.target.x, monster.target.y) + mLift);
      monster.tintEyes(this._ctx.look.eyes);
      monster.group.visible = !this._ctx.monstersHidden && (mLift > 0 || !this.caught(monster.target.id));
      this._lift.dangle(`m${monster.target.id}`, monster.group, mLift, MONSTER_PIVOT, dt, time);
      monster.flail(mLift / LIFT_HEIGHT, time);
      if (monster.impactCount !== (this._ctx.impacts.get(`m${monster.target.id}`) ?? 0)) {
        this._ctx.impacts.set(`m${monster.target.id}`, monster.impactCount);
        const { x, y } = monster.position;
        const hx = x + Math.cos(monster.target.facing) * 0.9;
        const hy = y + Math.sin(monster.target.facing) * 0.9;
        this._ctx.chips.puff(hx, hy, SLAM_DIRT, 26);
        this._ctx.chips.puff(hx, hy, DIRT, 14);
        this._ctx.gore.spatter(hx, hy, SLAM_MARK, 9, null, 0.45);
        this._ctx.lightMap.darken(this._ctx.chips.group);
        this._rig.shake = SHAKE_TIME;
      }
      const key = `m${monster.target.id}`;
      if (this._ctx.healthBars.has(key)) {
        const { x, y } = monster.position;
        this._ctx.healthBars.move(key, x, y, this._ctx.elevation(x, y));
      }
    }
  }

  /**
   * What shakes the trees this frame: every visible monster stomping.
   * @returns The shake sources.
   */
  quakeSources(): ShakeSource[] {
    return [...this.monsters.values()].filter((m: MonsterAvatar): boolean => m.quake > 0 && !this._ctx.monstersHidden).map((m: MonsterAvatar): ShakeSource => ({ x: m.group.position.x, z: m.group.position.z, strength: m.quake }));
  }

  /**
   * Whether a blood fountain holds a monster.
   * @param id The monster's id.
   * @returns True if it's some fountain's victim.
   */
  private caught(id: number): boolean {
    for (const v of this._ctx.victims) {
      if (v.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * A monster just got hit: whoever stands closest (within weapon reach)
   * swung, so the hit travels from them through the monster.
   * @param monster The monster's avatar.
   * @param m Its latest state.
   * @returns The direction of the hit, or null if nobody was close (a bolt
   *   or spikes).
   */
  private knockFromNearestPlayer(monster: MonsterAvatar, m: MonsterState): number | null {
    let best: PlayerState | null = null;
    let bestDist = STRIKER_RANGE;
    for (const { target: p } of this._players.avatars.values()) {
      const d = Math.hypot(p.x - m.x, p.y - m.y);
      if (!p.dead && d < bestDist) {
        best = p;
        bestDist = d;
      }
    }
    if (!best) {
      return null;
    }
    const angle = Math.atan2(m.y - best.y, m.x - best.x);
    monster.knock(angle);
    return angle;
  }
}
