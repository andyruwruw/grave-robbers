// Packages
import {
  HalfFloatType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { MAX_PLAYERS } from '@halloween/shared/players';

// Types
import type {
  Camera,
  Scene,
  WebGLRenderer,
} from 'three';

/**
 * Objects on this layer skip the bloom: they're drawn at full brightness
 * after it, so tiny bright details (monster eyes) stay crisp pixels instead
 * of glowing orbs.
 */
export const NO_BLOOM_LAYER = 1;

/**
 * TV look controls, each 0..1. Stored per TV and adjusted from the sidebar.
 */
export interface StyleSettings {
  /**
   * Darken and desaturate the scene by distance from the nearest player.
   */
  focus: number;

  /**
   * Extra color saturation (the light map also brightens with this).
   */
  vibrance: number;

  /**
   * Bloom around bright things: flames, lanterns, pumpkins.
   */
  glow: number;

  /**
   * Red/blue fringing away from players; the area around them stays clear.
   */
  aberration: number;

  /**
   * Thickness of the ground fog (0 turns it off).
   */
  fog: number;
}

export const DEFAULT_STYLE: StyleSettings = { focus: 0.5, vibrance: 0.05, glow: 0.75, aberration: 0.3, fog: 0.5 };

/**
 * Bloom only picks up pixels brighter than this (linear luminance).
 */
const BLOOM_THRESHOLD = 0.3;
const BLOOM_RADIUS = 0.5;
const MAX_BLOOM_STRENGTH = 1.6;

/**
 * Focus falls off between these distances from a player, as a fraction of
 * screen height.
 */
const FOCUS_INNER = 0.1;
const FOCUS_OUTER = 0.45;

/**
 * At full Focus, how dark (multiplier) and how desaturated (0..1) the map
 * gets far from every player. Kept gentle: the night is already dark.
 */
const FOCUS_DIM = 0.55;
const FOCUS_DESATURATE = 0.3;

const MAX_ABERRATION = 0.012;
const MAX_SATURATION_BOOST = 0.4;

/**
 * Focus, saturation, and chromatic aberration in one pass. Player positions
 * arrive as screen uv with z = 1 for active slots.
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    aspect: { value: 1 },
    players: { value: Array.from({ length: MAX_PLAYERS }, (): Vector3 => new Vector3()) },
    focus: { value: 0 },
    saturation: { value: 1 },
    aberration: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float aspect;
    uniform vec3 players[${MAX_PLAYERS}];
    uniform float focus;
    uniform float saturation;
    uniform float aberration;
    varying vec2 vUv;

    void main() {
      float nearest = 10.0;
      vec2 origin = vec2(0.5);
      bool any = false;
      for (int i = 0; i < ${MAX_PLAYERS}; i++) {
        if (players[i].z > 0.5) {
          float dist = length((vUv - players[i].xy) * vec2(aspect, 1.0));
          if (dist < nearest) {
            nearest = dist;
            origin = players[i].xy;
          }
          any = true;
        }
      }
      float away = any
        ? smoothstep(${FOCUS_INNER.toFixed(3)}, ${FOCUS_OUTER.toFixed(3)}, nearest)
        : length(vUv - 0.5) * 2.0;

      vec2 shift = (vUv - origin) * aberration * away * 1.5;
      vec3 color = vec3(
        texture2D(tDiffuse, vUv + shift).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - shift).b
      );

      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = max(mix(vec3(luma), color, saturation), 0.0);

      if (any) {
        float far = away * focus;
        vec3 cool = vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))) * vec3(0.7, 0.75, 1.0);
        color = mix(color, mix(color, cool, ${FOCUS_DESATURATE.toFixed(2)}) * ${FOCUS_DIM.toFixed(2)}, far);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * Draws only one layer of the scene over what's already in the buffer,
 * depth-tested against it. The scene's background is hidden meanwhile,
 * since three.js clears the whole frame for a color background even with
 * autoClear off.
 */
class LayerPass extends Pass {
  constructor(private scene: Scene, private camera: Camera, private layer: number) {
    super();
    this.needsSwap = false;
  }

  render(renderer: WebGLRenderer, _writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    const autoClear = renderer.autoClear;
    const shadows = renderer.shadowMap.autoUpdate;
    const background = this.scene.background;
    renderer.autoClear = false;
    renderer.shadowMap.autoUpdate = false;
    this.scene.background = null;
    this.camera.layers.set(this.layer);
    renderer.setRenderTarget(readBuffer);
    renderer.render(this.scene, this.camera);
    this.camera.layers.set(0);
    this.scene.background = background;
    renderer.shadowMap.autoUpdate = shadows;
    renderer.autoClear = autoClear;
  }
}

/**
 * The TV's post-processing chain: scene, bloom, the no-bloom layer, grade
 * (focus, saturation, aberration), then output conversion. Runs at the same low resolution as
 * the scene, so effects stay chunky and pixelated.
 */
/**
 * How much of the bloom daylight washes out.
 */
const DAY_BLOOM_CUT = 0.95;

export class PostEffects {
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private grade: ShaderPass;
  private focus = 0;
  private glow = 0;
  private day = 0;

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    this.composer = new EffectComposer(renderer, target);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new Vector2(1, 1), 0, BLOOM_RADIUS, BLOOM_THRESHOLD);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new LayerPass(scene, camera, NO_BLOOM_LAYER));
    this.grade = new ShaderPass(GradeShader);
    this.composer.addPass(this.grade);
    this.composer.addPass(new OutputPass());
  }

  setSize(width: number, height: number): void {
    this.composer.setPixelRatio(1);
    this.composer.setSize(width, height);
    this.grade.uniforms.aspect.value = width / height;
  }

  setStyle(style: StyleSettings): void {
    this.glow = style.glow * MAX_BLOOM_STRENGTH;
    this.bloom.strength = this.glow * (1 - DAY_BLOOM_CUT * this.day);
    this.bloom.enabled = style.glow > 0;
    this.focus = style.focus;
    this.grade.uniforms.focus.value = this.focus * (1 - this.day);
    this.grade.uniforms.saturation.value = 1 + style.vibrance * MAX_SATURATION_BOOST;
    this.grade.uniforms.aberration.value = style.aberration * MAX_ABERRATION;
  }

  /**
   * 0..1: daylight lifts the darkness away from the players and washes out
   * most of the bloom.
   */
  setDay(amount: number): void {
    this.day = amount;
    this.grade.uniforms.focus.value = this.focus * (1 - amount);
    this.bloom.strength = this.glow * (1 - DAY_BLOOM_CUT * amount);
  }

  /**
   * Renders a frame. `players` are screen uv positions of living players.
   */
  render(players: { x: number; y: number }[]): void {
    const slots = this.grade.uniforms.players.value as Vector3[];
    slots.forEach((slot: Vector3, i: number): void => {
      const p = players[i];
      slot.set(p?.x ?? 0, p?.y ?? 0, p ? 1 : 0);
    });
    this.composer.render();
  }

  dispose(): void {
    this.composer.dispose();
    this.bloom.dispose();
  }
}
