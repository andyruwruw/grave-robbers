// Packages
import { DirectionalLight, HemisphereLight } from 'three';
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { MOON_OFFSET } from '../camera/config/camera';
import { ScenePart } from '../scene-part';
import {
  BLOOD_MOON,
  BLOOD_MOON_FADE,
  DAY_FADE,
  DAY_GROUND,
  DAY_SKY,
  MOON,
  NIGHT_GROUND,
  NIGHT_SKY,
  SUN,
} from './config/sky';

// Types
import type { PostEffects } from '../../effects/post/post-effects';
import type { WorldContext } from '../world-context';

/**
 * The moon (the shadow-casting light) and the sky's soft fill, shifting
 * toward red under a blood moon and toward sunlight by day or in the map
 * editor's flat light.
 */
export class SkyLighting extends ScenePart {
  /**
   * The sky's soft fill light.
   */
  readonly sky = new HemisphereLight(NIGHT_SKY, NIGHT_GROUND, 2);

  /**
   * The moon, which casts the shadows.
   */
  readonly moon: DirectionalLight;

  /**
   * Whether a blood moon is up.
   */
  bloodMoon = false;

  /**
   * Broad daylight (the Game tab's daytime).
   */
  daytime = false;

  /**
   * The map editor's view: flat daylight, no blood moon.
   */
  flat = false;

  /**
   * How far (0..1) the scene has shifted toward a blood moon.
   */
  private _bloodMix = 0;

  /**
   * How far (0..1) the scene has shifted toward day.
   */
  private _dayMix = 0;

  /**
   * Adds the sky and the moon to the scene.
   * @param ctx What every part of the scene shares.
   */
  constructor(ctx: WorldContext) {
    super(ctx);
    this.scene.add(this.sky);
    const moon = new DirectionalLight(MOON, 2.2);
    this.moon = moon;
    moon.position.copy(MOON_OFFSET);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    const s = moon.shadow.camera;
    s.left = -MAP_WIDTH / 2 - 2;
    s.right = MAP_WIDTH / 2 + 2;
    s.top = MAP_HEIGHT / 2 + 4;
    s.bottom = -MAP_HEIGHT / 2 - 4;
    s.near = 1;
    s.far = 80;
    this.scene.add(moon, moon.target);
  }

  /**
   * Keeps the moon over what the camera follows.
   * @param x World x the camera looks at.
   * @param z World z the camera looks at.
   */
  followMoon(x: number, z: number): void {
    this.moon.position.set(x + MOON_OFFSET.x, MOON_OFFSET.y, z + MOON_OFFSET.z);
    this.moon.target.position.set(x, 0, z);
  }

  /**
   * Eases toward (or away from) the blood moon and day, and colors the
   * moon, sky, darkness, fog, and grade to match.
   * @param dt Seconds since the last frame.
   * @param post The post-processing, which grades day differently.
   */
  update(dt: number, post: PostEffects): void {
    this._bloodMix = Math.min(1, Math.max(0, this._bloodMix + (this.bloodMoon ? 1 : -1) * BLOOD_MOON_FADE * dt));
    this._dayMix = Math.min(1, Math.max(0, this._dayMix + (this.daytime || this.flat ? 1 : -1) * DAY_FADE * (this.flat ? 4 : 1) * dt));
    this._ctx.lightMap.setSky(this.flat ? 0 : this._bloodMix, this._dayMix);
    this._ctx.fog.setBloodMoon(this._bloodMix);
    this._ctx.fog.setDay(this._dayMix);
    post.setDay(this._dayMix);
    this.moon.color.copy(MOON).lerp(BLOOD_MOON, this._bloodMix).lerp(SUN, this._dayMix);
    this.moon.intensity = 2.2 + this._dayMix * 1.3;
    this.sky.intensity = 2 + this._dayMix;
    this.sky.color.copy(NIGHT_SKY).lerp(DAY_SKY, this._dayMix);
    this.sky.groundColor.copy(NIGHT_GROUND).lerp(DAY_GROUND, this._dayMix);
  }
}
