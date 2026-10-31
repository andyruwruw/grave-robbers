// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { Vector3 } from 'three';

// Local Imports
import { LABEL_HEIGHT } from '../../avatars/player/config/player-look';
import { PlayerAvatar } from '../../avatars/player/player-avatar';
import { SHAKE_TIME } from '../camera/config/camera';
import { DUST, PLAYER_BLOOD } from '../config/effect-colors';
import { MAUL_DUST } from '../effects/config/infusion-effects';
import { bloodCount } from '../helpers/blood-count';
import {
  MUZZLE_FIRE,
  MUZZLE_FLASH,
  MUZZLE_OUT,
  MUZZLE_SMOKE,
} from '../config/muzzle-colors';
import { ScenePart } from '../scene-part';
import { LIFT_HEIGHT, PLAYER_PIVOT } from './config/actors';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { BuildPreview } from '../build/build-preview';
import type { CameraRig } from '../camera/camera-rig';
import type { WorldContext } from '../world-context';
import type { ActorLift } from './actor-lift';
import type { SnapshotInterpolator } from './snapshot-interpolator';

/**
 * One PlayerAvatar per player: created, updated, and removed from each
 * snapshot (with a muzzle flash, dust, blood, and screen shake as they
 * shoot, swing, get hurt, and die), then placed every frame with their name
 * label.
 */
export class PlayerAvatars extends ScenePart {
  /**
   * Every player's avatar, by player id.
   */
  readonly avatars = new Map<string, PlayerAvatar>();

  /**
   * This screen's own player, moved ahead of the server (/play's
   * prediction), drawn there instead of where the last snapshot put it.
   */
  predicted: { id: string; x: number; y: number; facing: number; moving: boolean } | null = null;

  /**
   * Scratch point for projecting labels and focus points to the screen.
   */
  private _projected = new Vector3();

  /**
   * Starts with no players.
   * @param ctx What every part of the scene shares.
   * @param _rig The camera, shaken when players shoot and get hurt.
   * @param _interp Where everyone is drawn in the past.
   * @param _lift Players the TV's mouse holds up.
   */
  constructor(ctx: WorldContext, private _rig: CameraRig, private _interp: SnapshotInterpolator, private _lift: ActorLift) {
    super(ctx);
  }

  /**
   * Applies the latest server snapshot: creates, updates, and removes avatars.
   * @param players Every player.
   */
  set(players: PlayerState[]): void {
    const seen = new Set<string>();
    const now = performance.now() / 1000;
    for (const p of players) {
      seen.add(p.id);
      this._interp.record(`p${p.id}`, p.x, p.y, now);
      const existing = this.avatars.get(p.id);
      if (existing) {
        if (p.swings > existing.target.swings && !p.drawn) {
          this.swung(p);
        }
        if (p.hurts > existing.target.hurts) {
          this._rig.shake = SHAKE_TIME;
          this._ctx.chips.puff(p.x, p.y, PLAYER_BLOOD, bloodCount(24, this._ctx.display.blood));
          this._ctx.gore.spatter(p.x, p.y, PLAYER_BLOOD, bloodCount(10, this._ctx.display.blood), null, 1);
          this._ctx.lightMap.darken(this._ctx.chips.group);
        }
        if (p.dead && !existing.target.dead) {
          this._ctx.chips.puff(existing.target.x, existing.target.y, PLAYER_BLOOD, bloodCount(40, this._ctx.display.blood));
          this._ctx.gore.spatter(existing.target.x, existing.target.y, PLAYER_BLOOD, bloodCount(24, this._ctx.display.blood), null, 1.6);
        }
        existing.target = p;
        continue;
      }
      const avatar = new PlayerAvatar(p, this._ctx.labelLayer);
      this._ctx.lightMap.darken(avatar.group);
      this.avatars.set(p.id, avatar);
      this.scene.add(avatar.group, avatar.marker, avatar.trail, avatar.blocker);
    }
    for (const [id, avatar] of this.avatars) {
      if (!seen.has(id)) {
        this.remove(id, avatar);
      }
    }
  }

  /**
   * What a new swing or shot with the weapon in hand throws up: a gun's
   * muzzle blast, smoke, and shake (not a Hellmouth's spray, whose flame
   * jet comes with its own event), or a Flesh-Sprung Maul's dust along its
   * arc.
   * @param p The player.
   */
  private swung(p: PlayerState): void {
    const weapon = p.gear.weapon;
    const infusion = p.gearInfusion.weapon;
    if ((weapon === 'musket' || weapon === 'blood-gun') && !variantOf(weapon, infusion)?.twist.spray) {
      const mx = p.x + Math.cos(p.facing) * MUZZLE_OUT;
      const my = p.y + Math.sin(p.facing) * MUZZLE_OUT;
      this._ctx.chips.spark(mx, my, MUZZLE_FIRE, weapon === 'musket' ? 26 : 18);
      this._ctx.chips.spark(mx, my, MUZZLE_FLASH, 10);
      this._ctx.chips.puff(mx, my, MUZZLE_SMOKE, weapon === 'musket' ? 40 : 28);
      this._rig.shake = Math.max(this._rig.shake, SHAKE_TIME * 0.6);
    } else if (weapon === 'infused-hammer' && infusion?.essence === 'tendons' && infusion.level === 2) {
      const out = GEAR['infused-hammer'].weapon!.reach * MAUL_DUST.reach;
      for (let i = 0; i < MAUL_DUST.puffs; i++) {
        const a = p.facing + MAUL_DUST.halfArc * (2 * i / (MAUL_DUST.puffs - 1) - 1);
        this._ctx.chips.puff(p.x + Math.cos(a) * out, p.y + Math.sin(a) * out, DUST, MAUL_DUST.chips);
      }
    }
  }

  /**
   * Removes every avatar (the renderer is going away).
   */
  removeAll(): void {
    for (const [id, avatar] of this.avatars) {
      this.remove(id, avatar);
    }
  }

  /**
   * Starts a player's swing now, before the server says so (/play's
   * instant attacks).
   * @param id The player's id.
   */
  predictSwing(id: string): void {
    this.avatars.get(id)?.predictSwing(this._ctx.clock.elapsedTime);
  }

  /**
   * Places every player for this frame (predicted, interpolated, or eased
   * toward the snapshot; lifted and dangling if the TV's mouse holds them),
   * with their facing-tile marker and name label (shown as the display
   * says), and notes where the living ones are on screen for the focus
   * effect.
   * @param dt Seconds since the last frame.
   * @param time Clock seconds.
   * @param drawnAt The moment interpolated players are drawn at.
   * @param w The container's width.
   * @param h The container's height.
   * @param focusPoints Collects living players' screen points (0..1).
   * @param preview Shows each player's marker.
   */
  update(dt: number, time: number, drawnAt: number, w: number, h: number, focusPoints: { x: number; y: number }[], preview: BuildPreview): void {
    const display = this._ctx.display;
    for (const avatar of this.avatars.values()) {
      const mine = this.predicted?.id === avatar.target.id ? this.predicted : null;
      const past = !mine && this._interp.delay > 0 ? this._interp.sample(`p${avatar.target.id}`, drawnAt) : null;
      avatar.exact = mine !== null || past !== null;
      if (mine) {
        avatar.target = { ...avatar.target, x: mine.x, y: mine.y, facing: mine.facing, moving: mine.moving };
      } else if (past) {
        avatar.target = { ...avatar.target, x: past.x, y: past.y };
      }
      const own = avatar.target.id === this._ctx.localPlayer;
      avatar.nameTag.showName = own ? display.showMyName : display.showNames;
      avatar.nameTag.showHealth = own ? display.showMyHealthBar : display.showHealthBars;
      const pLift = this._lift.height(`p${avatar.target.id}`, avatar.target.lifted, dt);
      avatar.turn.maxSpeed = this._ctx.display.turnSpeed;
      avatar.update(dt, time, this._ctx.elevation(avatar.target.x, avatar.target.y) + pLift);
      this._lift.dangle(`p${avatar.target.id}`, avatar.group, pLift, PLAYER_PIVOT, dt, time);
      avatar.flail(pLift / LIFT_HEIGHT, time);
      preview.show(avatar);
      this._projected.set(avatar.group.position.x, avatar.group.position.y + LABEL_HEIGHT, avatar.group.position.z).project(this.camera);
      const sx = (this._projected.x + 1) / 2 * w;
      const sy = (1 - this._projected.y) / 2 * h;
      avatar.label.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%, -100%)`;
      if (avatar.target.connected && !avatar.target.dead) {
        this._projected.set(avatar.group.position.x, avatar.group.position.y + 0.5, avatar.group.position.z).project(this.camera);
        focusPoints.push({ x: (this._projected.x + 1) / 2, y: (this._projected.y + 1) / 2 });
      }
    }
  }

  /**
   * Takes a player's avatar out of the scene and frees it.
   * @param id The player's id.
   * @param avatar Their avatar.
   */
  private remove(id: string, avatar: PlayerAvatar): void {
    this._ctx.impacts.delete(id);
    this.scene.remove(avatar.group, avatar.marker, avatar.trail, avatar.blocker);
    avatar.dispose();
    this.avatars.delete(id);
    this._interp.forget(`p${id}`);
  }
}
