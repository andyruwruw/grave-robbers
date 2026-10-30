// Packages
import { sfx } from '@halloween/ui/audio/sfx/sfx';
import { STICK_DEADZONE } from '@halloween/ui/config/input';
import { latestPad, padName } from '@halloween/ui/input/gamepad';

// Local Imports
import { buildFrameContext } from './frame-context';
import { GamepadFrame } from './gamepad-frame';
import { HeldInputs } from './held-inputs';
import { BuildMode } from './modes/build-mode';
import { CaptureMode } from './modes/capture-mode';
import { FightMode } from './modes/fight-mode';
import { IdleMode } from './modes/idle-mode';
import { MenuMode } from './modes/menu-mode';

// Types
import type React from 'react';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { WorldCache } from '@halloween/controls/display/world-cache';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { SpatialNav } from '../nav/spatial-nav';
import type { Predictor } from '../prediction/predictor';
import type { LiveState } from '../types/play';
import type { FrameContext } from './frame-context';
import type { KeyboardMouse } from './keyboard-mouse';
import type { InputMode } from './modes/input-mode';

/**
 * What the input loop reads from the page.
 */
export interface PlayInputDeps {
  /**
   * The page's latest state.
   */
  live: React.RefObject<LiveState>;

  /**
   * The keyboard and mouse.
   */
  keyboard: KeyboardMouse;

  /**
   * The pad being played, kept current here (the rumble reads it).
   */
  padIndex: React.RefObject<number | null>;

  /**
   * The menu selection.
   */
  nav: SpatialNav;

  /**
   * The world renderer.
   */
  rendererRef: React.RefObject<WorldRenderer | null>;

  /**
   * The local prediction of this player.
   */
  predictor: Predictor;

  /**
   * The players as last sent.
   */
  cache: WorldCache;

  /**
   * The open menu's element.
   */
  menuRef: React.RefObject<HTMLDivElement | null>;

  /**
   * The join screen's element.
   */
  joinRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Says which device was used last.
   */
  setDevice: (device: 'pad' | 'keys') => void;

  /**
   * Shows the pad being played, or none.
   */
  setPadName: (name: string | null) => void;
}

/**
 * The /play input, once a frame: finds the pad being played, notes when it
 * was used, then runs one mode (rebinding a pad button, a menu, walking to
 * fight or build, or idle). Unless the mode ends the frame early, it then
 * steps the local prediction and shows it. Keyboard taps and the pad's
 * buttons are remembered for the next frame either way.
 */
export class PlayInputLoop {
  /**
   * This loop's frame context.
   */
  private readonly _ctx: FrameContext;

  /**
   * Rebinding a pad button.
   */
  private readonly _capture = new CaptureMode();

  /**
   * In a menu.
   */
  private readonly _menu = new MenuMode();

  /**
   * Walking to fight.
   */
  private readonly _fight = new FightMode();

  /**
   * Walking to build.
   */
  private readonly _build = new BuildMode();

  /**
   * Neither.
   */
  private readonly _idle = new IdleMode();

  /**
   * The pending animation frame.
   */
  private _frameId = 0;

  /**
   * When (ms) the last full frame ran.
   */
  private _lastFrame = performance.now();

  /**
   * Reads the page through `deps`.
   *
   * @param _deps - What the loop reads from the page.
   */
  constructor(private readonly _deps: PlayInputDeps) {
    this._ctx = buildFrameContext(_deps.keyboard, new GamepadFrame(), _deps.nav, _deps.rendererRef, _deps.predictor, new HeldInputs(), _deps.live.current);
  }

  /**
   * Starts running every frame.
   */
  start(): void {
    this._frameId = requestAnimationFrame(this.frame);
  }

  /**
   * Stops.
   */
  stop(): void {
    cancelAnimationFrame(this._frameId);
  }

  /**
   * One frame.
   *
   * @param now - The frame's time in ms.
   */
  private readonly frame = (now: number): void => {
    this._frameId = requestAnimationFrame(this.frame);
    const d = this._deps;
    const ctx = this._ctx;
    ctx.move = { x: 0, y: 0 };
    ctx.aim = { x: 0, y: 0 };
    const s = d.live.current;
    const gp = latestPad();
    if (!gp && d.padIndex.current !== null) {
      d.padIndex.current = null;
      d.setPadName(null);
    }
    if (gp && d.padIndex.current !== gp.index) {
      d.padIndex.current = gp.index;
      d.setPadName(padName(gp, 'Controller'));
    }
    ctx.now = now;
    ctx.live = s;
    ctx.pad.begin(gp);
    const pad = ctx.pad;
    const padTapped = pad.firstTap();
    ctx.padTapped = padTapped;
    if (padTapped >= 0 || Math.hypot(pad.axis(0), pad.axis(1)) > STICK_DEADZONE || Math.hypot(pad.axis(2), pad.axis(3)) > STICK_DEADZONE) {
      d.setDevice('pad');
      if (padTapped >= 0) {
        void sfx.unlock();
      }
    }
    ctx.root = !s.joined ? d.joinRef.current : d.menuRef.current;
    if (this.mode(ctx).step(ctx) === 'halt') {
      this.finish();
      return;
    }
    const r = d.rendererRef.current;
    const map = r?.worldMap();
    const me = d.cache.players.find((p: PlayerState): boolean => p.id === s.playerId);
    if (r && map && me && !me.dead && !me.lifted) {
      d.predictor.step(Math.min(0.1, (now - this._lastFrame) / 1000), now / 1000, map, me, ctx.move, ctx.aim);
      const { x, y, facing, moving } = d.predictor;
      r.setPredicted({ id: me.id, x, y, facing, moving });
    } else {
      if (me) {
        d.predictor.reset(me);
      }
      r?.setPredicted(null);
    }
    this._lastFrame = now;
    this.finish();
  };

  /**
   * The mode for this frame: rebinding a pad button, then a menu (or the
   * join screen, or a storage chest) that's showing, then walking (to
   * build or fight) while joined and alive, else idle.
   *
   * @param ctx - The frame.
   * @returns The mode.
   */
  private mode(ctx: FrameContext): InputMode {
    const s = ctx.live;
    if (s.capturing?.device === 'pad') {
      return this._capture;
    }
    const inMenu = !s.joined || s.menu !== null || s.stash;
    if (inMenu && ctx.root) {
      return this._menu;
    }
    if (s.joined && !s.dead) {
      return s.building ? this._build : this._fight;
    }
    return this._idle;
  }

  /**
   * Forgets this frame's keyboard taps and remembers the pad's buttons.
   */
  private finish(): void {
    this._deps.keyboard.taps.clear();
    this._ctx.pad.finish();
  }
}
