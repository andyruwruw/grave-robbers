// Local Imports
import { LIGHT_RANGE } from '../config/light-map';
import {
  DENSITY_RANGE,
  DITHER_STEPS,
  LAYER_OPACITY,
} from './config/fog';

/**
 * Places a fog sheet and hands the fragment shader its world xz.
 */
export const FOG_VERTEX_SHADER = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/**
 * Draws one fog sheet: the simulated density (or drifting noise off the
 * grid), fine creeping detail, lit by the light map, and dithered into a
 * few opacity steps.
 */
export const FOG_FRAGMENT_SHADER = /* glsl */ `
  uniform float time;
  uniform float layer;
  uniform float density;
  uniform vec3 fogColor;
  uniform sampler2D densityMap;
  uniform vec4 densityWindow;
  uniform float simulated;
  uniform sampler2D lightMap;
  uniform vec3 lightOutside;
  uniform vec4 lightWindow;
  varying vec2 vWorld;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 3; i++) {
      sum += noise(p) * amp;
      p = p * 2.03 + 17.1;
      amp *= 0.45;
    }
    return sum;
  }

  float bayer(vec2 frag) {
    vec2 p = mod(floor(frag), 4.0);
    float i = p.x + p.y * 4.0;
    return mod(i * 9.0 + floor(i / 4.0) * 6.0, 16.0) / 16.0;
  }

  void main() {
    vec2 p = vWorld * (0.5 - layer * 0.08) + layer * 7.3;
    vec2 creep = vec2(time * 0.012, time * -0.008);
    float detail = smoothstep(0.2, 0.75, fbm(p + creep + 0.5 * vec2(fbm(p * 0.6 - creep), fbm(p * 0.6 + 3.1))));

    vec2 uv = (vWorld - densityWindow.xy) / densityWindow.zw;
    bool offGrid = simulated < 0.5 || any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)));
    float base = offGrid
      ? smoothstep(0.3, 0.8, fbm(vWorld * 0.12 + 40.0)) * 0.8
      : texture2D(densityMap, uv).r * ${DENSITY_RANGE.toFixed(2)};
    float fog = base * (0.35 + 0.9 * detail) * (1.0 - layer * 0.18);

    vec2 lightUv = (vWorld - lightWindow.xy) / lightWindow.zw;
    bool unlit = any(lessThan(lightUv, vec2(0.0))) || any(greaterThan(lightUv, vec2(1.0)));
    vec3 level = texture2D(lightMap, lightUv).rgb;
    vec3 light = unlit ? lightOutside : level * level * ${LIGHT_RANGE.toFixed(1)};
    vec3 color = fogColor * (light * 0.5 + 0.02);

    float alpha = clamp(fog * density, 0.0, 1.0);
    alpha = floor(alpha * ${DITHER_STEPS.toFixed(1)} + bayer(gl_FragCoord.xy)) / ${DITHER_STEPS.toFixed(1)} * ${LAYER_OPACITY.toFixed(2)};
    if (alpha <= 0.0) {
      discard;
    }
    gl_FragColor = vec4(color, alpha);
  }
`;
