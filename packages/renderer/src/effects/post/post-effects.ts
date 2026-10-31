// Packages
import {
  HalfFloatType,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Local Imports
import {
  BLOOM_RADIUS,
  BLOOM_THRESHOLD,
  DAY_BLOOM_CUT,
  MAX_ABERRATION,
  MAX_BLOOM_STRENGTH,
  MAX_SATURATION_BOOST,
  NO_BLOOM_LAYER,
} from './config/post';
import { GradeShader } from './grade-shader';
import { LayerPass } from './layer-pass';

// Types
import type {
  Camera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { StyleSettings } from '../../types/effects';

/**
 * The TV's post-processing chain: scene, bloom, the no-bloom layer, grade
 * (focus, saturation, aberration), then output conversion. Runs at the same low resolution as
 * the scene, so effects stay chunky and pixelated.
 */
export class PostEffects {
  /**
   * The pass chain.
   */
  private _composer: EffectComposer;

  /**
   * The bloom pass.
   */
  private _bloom: UnrealBloomPass;

  /**
   * The grade pass (focus, saturation, aberration).
   */
  private _grade: ShaderPass;

  /**
   * Focus from the style, before daylight lifts it.
   */
  private _focus = 0;

  /**
   * Bloom strength from the style, before daylight washes it out.
   */
  private _glow = 0;

  /**
   * How bright day it is, 0..1.
   */
  private _day = 0;

  /**
   * Color fringe shift from the style, before a blood moon adds to it.
   */
  private _aberration = 0;

  /**
   * Extra color fringe shift from world events.
   */
  private _eventAberration = 0;

  /**
   * Builds the pass chain.
   * @param renderer The TV's renderer.
   * @param scene The world scene.
   * @param camera The world camera.
   */
  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    this._composer = new EffectComposer(renderer, target);
    this._composer.addPass(new RenderPass(scene, camera));
    this._bloom = new UnrealBloomPass(new Vector2(1, 1), 0, BLOOM_RADIUS, BLOOM_THRESHOLD);
    this._composer.addPass(this._bloom);
    this._composer.addPass(new LayerPass(scene, camera, NO_BLOOM_LAYER));
    this._grade = new ShaderPass(GradeShader);
    this._composer.addPass(this._grade);
    this._composer.addPass(new OutputPass());
  }

  /**
   * Fits the passes to the render size.
   * @param width Render width, in pixels.
   * @param height Render height, in pixels.
   */
  setSize(width: number, height: number): void {
    this._composer.setPixelRatio(1);
    this._composer.setSize(width, height);
    this._grade.uniforms.aspect.value = width / height;
  }

  /**
   * Applies the TV's look controls.
   * @param style The look controls.
   */
  setStyle(style: StyleSettings): void {
    this._glow = style.glow * MAX_BLOOM_STRENGTH;
    this._bloom.strength = this._glow * (1 - DAY_BLOOM_CUT * this._day);
    this._bloom.enabled = style.glow > 0;
    this._focus = style.focus;
    this._grade.uniforms.focus.value = this._focus * (1 - this._day);
    this._grade.uniforms.saturation.value = 1 + style.vibrance * MAX_SATURATION_BOOST;
    this._aberration = style.aberration * MAX_ABERRATION;
    this.setEventAberration(this._eventAberration);
  }

  /**
   * World events fringe the colors more, on top of the Aberration setting.
   * @param add Extra shift, in screen uv.
   */
  setEventAberration(add: number): void {
    this._eventAberration = add;
    this._grade.uniforms.aberration.value = this._aberration + add;
  }

  /**
   * 0..1: daylight lifts the darkness away from the players and washes out
   * most of the bloom.
   * @param amount How bright day it is, 0..1.
   */
  setDay(amount: number): void {
    this._day = amount;
    this._grade.uniforms.focus.value = this._focus * (1 - amount);
    this._bloom.strength = this._glow * (1 - DAY_BLOOM_CUT * amount);
  }

  /**
   * Renders a frame. `players` are screen uv positions of living players.
   * @param players Screen uv positions of living players.
   */
  render(players: { x: number; y: number }[]): void {
    const slots = this._grade.uniforms.players.value as Vector3[];
    slots.forEach((slot: Vector3, i: number): void => {
      const p = players[i];
      slot.set(p?.x ?? 0, p?.y ?? 0, p ? 1 : 0);
    });
    this._composer.render();
  }

  /**
   * Frees the passes.
   */
  dispose(): void {
    this._composer.dispose();
    this._bloom.dispose();
  }
}
