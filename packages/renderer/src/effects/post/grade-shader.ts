// Packages
import { Vector3 } from 'three';
import { MAX_PLAYERS } from '@halloween/shared/players/roster';

// Local Imports
import {
  FOCUS_DESATURATE,
  FOCUS_DIM,
  FOCUS_INNER,
  FOCUS_OUTER,
} from './config/post';

/**
 * Focus, saturation, and chromatic aberration in one pass. Player positions
 * arrive as screen uv with z = 1 for active slots.
 */
export const GradeShader = {
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
