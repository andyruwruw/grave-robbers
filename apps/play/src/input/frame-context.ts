// Local Imports
import { PAD_ACTIONS } from '../config/bindings';

// Types
import type React from 'react';
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
import type { SpatialNav } from '../nav/spatial-nav';
import type { Predictor } from '../prediction/predictor';
import type {
  KeyAction,
  LiveState,
  NavDir,
  PadAction,
} from '../types/play';
import type { GamepadFrame } from './gamepad-frame';
import type { HeldInputs } from './held-inputs';
import type { KeyboardMouse } from './keyboard-mouse';

/**
 * What an input mode reads and writes in one frame. One object lives as
 * long as the input loop: the loop fills in the frame's fields (`now`,
 * `live`, `padTapped`, `root`, `move`, `aim`) at the start of each frame,
 * and the rest carries over between frames.
 */
export interface FrameContext {
  /**
   * This frame's time in ms.
   */
  now: number;

  /**
   * The page's state as this frame started.
   */
  live: LiveState;

  /**
   * The keyboard and mouse.
   */
  keyboard: KeyboardMouse;

  /**
   * This frame's pad reads.
   */
  pad: GamepadFrame;

  /**
   * The first pad button tapped this frame, or -1.
   */
  padTapped: number;

  /**
   * The open menu's (or the join screen's) element, if it's showing.
   */
  root: HTMLElement | null;

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
   * What was last sent.
   */
  held: HeldInputs;

  /**
   * This frame's walk vector, for the prediction.
   */
  move: { x: number; y: number };

  /**
   * This frame's aim vector, for the prediction.
   */
  aim: { x: number; y: number };

  /**
   * The ground point under the mouse while it aims, for USE, or null.
   */
  useAt: { x: number; y: number } | null;

  /**
   * The direction held in a menu, if any.
   */
  navDir: NavDir | null;

  /**
   * When (ms) a held menu direction next repeats.
   */
  navAt: number;

  /**
   * When (ms) movement was last sent.
   */
  sentAt: number;

  /**
   * When (ms) building's aim was last sent.
   */
  buildAimAt: number;

  /**
   * When (ms) the right stick last aimed (the mouse aims only after it moves later).
   */
  padAimAt: number;

  /**
   * When (ms) a predicted swing may next show.
   */
  swingReadyAt: number;

  /**
   * Whether an action's key is held.
   */
  keyDown: (a: KeyAction) => boolean;

  /**
   * Whether an action's key, or its pad button, was pressed this frame.
   */
  tappedAction: (a: KeyAction) => boolean;
}

/**
 * The input loop's one frame context, with the loop's lasting parts.
 *
 * @param keyboard - The keyboard and mouse.
 * @param pad - The pad reads.
 * @param nav - The menu selection.
 * @param rendererRef - The world renderer.
 * @param predictor - The local prediction.
 * @param held - What was last sent.
 * @param live - The page's state at the start.
 * @returns The context.
 */
export function buildFrameContext(
  keyboard: KeyboardMouse,
  pad: GamepadFrame,
  nav: SpatialNav,
  rendererRef: React.RefObject<WorldRenderer | null>,
  predictor: Predictor,
  held: HeldInputs,
  live: LiveState,
): FrameContext {
  const ctx: FrameContext = {
    now: 0,
    live,
    keyboard,
    pad,
    padTapped: -1,
    root: null,
    nav,
    rendererRef,
    predictor,
    held,
    move: { x: 0, y: 0 },
    aim: { x: 0, y: 0 },
    useAt: null,
    navDir: null,
    navAt: 0,
    sentAt: 0,
    buildAimAt: 0,
    padAimAt: -1,
    swingReadyAt: 0,
    keyDown: (a: KeyAction): boolean => ctx.keyboard.down.has(ctx.live.settings.keys[a]),
    tappedAction: (a: KeyAction): boolean => ctx.keyboard.taps.has(ctx.live.settings.keys[a]) || ((PAD_ACTIONS as string[]).includes(a) && ctx.pad.tap(ctx.live.settings.pad[a as PadAction])),
  };
  return ctx;
}
