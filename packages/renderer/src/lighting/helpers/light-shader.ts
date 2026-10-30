// Local Imports
import { LIGHT_RANGE } from '../config/light-map';

// Types
import type { Material, WebGLProgramParametersWithUniforms } from 'three';
import type { LightUniforms } from '../../types/effects';

/**
 * Makes a Lambert or Basic material darken by the light map at each
 * fragment's ground position.
 * @param material The material to patch.
 * @param uniforms The light map's shared uniforms.
 */
export function patchLightShader(material: Material, uniforms: LightUniforms): void {
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms): void => {
    shader.uniforms.lightMap = uniforms.lightMap;
    shader.uniforms.lightOutside = uniforms.lightOutside;
    shader.uniforms.lightWindow = uniforms.lightWindow;
    shader.vertexShader = `uniform vec4 lightWindow;\nvarying vec2 vLightUv;\n${shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec4 lmPos = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        lmPos = instanceMatrix * lmPos;
      #endif
      lmPos = modelMatrix * lmPos;
      vLightUv = (lmPos.xz - lightWindow.xy) / lightWindow.zw;`,
    )}`;
    shader.fragmentShader = `uniform sampler2D lightMap;\nuniform vec3 lightOutside;\nvarying vec2 vLightUv;\n${shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `bool offMap = any(lessThan(vLightUv, vec2(0.0))) || any(greaterThan(vLightUv, vec2(1.0)));
      vec3 lightLevel = texture2D(lightMap, vLightUv).rgb;
      outgoingLight *= offMap ? lightOutside : lightLevel * lightLevel * ${LIGHT_RANGE.toFixed(1)};
      #include <opaque_fragment>`,
    )}`;
  };
}
