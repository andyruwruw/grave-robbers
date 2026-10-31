// Local Imports
import { DEFAULT_STYLE } from '../../effects/post/config/post';
import { ScenePart } from '../scene-part';

// Types
import type { PostEffects } from '../../effects/post/post-effects';
import type { DisplaySettings } from '../../types/display-settings';
import type { StyleSettings } from '../../types/effects';
import type { CameraRig } from '../camera/camera-rig';
import type { WorldContext } from '../world-context';

/**
 * Applies a screen's look: the post effects and fog (`setStyle`) and its
 * `DisplaySettings` (`apply`). Settings the frame reads (shake, blood,
 * pickups, labels) are kept on the context for the parts to read live;
 * the rest are pushed into the canvas, camera, and effects here.
 */
export class DisplayApplier extends ScenePart {
  /**
   * The look the display settings last asked for, reused between applies.
   */
  private _style: StyleSettings = { ...DEFAULT_STYLE };

  /**
   * Starts with the defaults in place (`WorldContext.display`).
   * @param ctx What every part of the scene shares.
   * @param _rig The camera, tilted to the view angle.
   * @param _post The post effects.
   */
  constructor(ctx: WorldContext, private _rig: CameraRig, private _post: PostEffects) {
    super(ctx);
  }

  /**
   * Applies the post effects (focus, vibrance, glow, aberration) and the
   * fog's thickness.
   * @param style The look.
   */
  setStyle(style: StyleSettings): void {
    this._post.setStyle(style);
    this._ctx.fog.setDensity(style.fog * 2);
    this._ctx.lightMap.setBoost(1 + style.vibrance * 0.5);
  }

  /**
   * Applies a display's settings: brightness on the canvas, the camera's
   * elevation, glow, aberration, and fog (focus and vibrance stay at
   * DEFAULT_STYLE), and whether health bars show; the rest are read live
   * from the context each frame.
   * @param settings The settings.
   */
  apply(settings: DisplaySettings): void {
    Object.assign(this._ctx.display, settings);
    this._ctx.renderer.domElement.style.filter = settings.brightness === 1 ? '' : `brightness(${settings.brightness})`;
    this._rig.setElevation((settings.viewAngle * Math.PI) / 180);
    this._style.glow = settings.glow;
    this._style.aberration = settings.aberration;
    this._style.fog = settings.fog;
    this.setStyle(this._style);
    this._ctx.healthBars.setShown(settings.showHealthBars);
  }
}
