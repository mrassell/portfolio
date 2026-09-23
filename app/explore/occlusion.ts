import * as THREE from 'three';

export const occlusionUniforms = {
  uOccPlayer: { value: new THREE.Vector3(0, -1000, 0) },
  uOccCamera: { value: new THREE.Vector3(0, -1000, 0) },
};

const VERTEX_DECL = /* glsl */ `#include <common>
varying vec3 vOccWorld;`;

const VERTEX_BODY = /* glsl */ `#include <project_vertex>
vec4 occWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  occWorld = instanceMatrix * occWorld;
#endif
vOccWorld = (modelMatrix * occWorld).xyz;`;

const FRAGMENT_DECL = /* glsl */ `#include <common>
uniform vec3 uOccPlayer;
uniform vec3 uOccCamera;
varying vec3 vOccWorld;
float occBayer4(vec2 p) {
  const float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  ivec2 c = ivec2(mod(floor(p), 4.0));
  return (m[c.x + c.y * 4] + 0.5) / 16.0;
}`;

// Screen-door dither inside a tube from the camera to the player, so anything in the way turns see-through.
const FRAGMENT_BODY = /* glsl */ `#include <clipping_planes_fragment>
{
  vec3 seg = uOccPlayer - uOccCamera;
  float t = clamp(dot(vOccWorld - uOccCamera, seg) / max(dot(seg, seg), 1e-4), 0.0, 1.0);
  float d = distance(vOccWorld, uOccCamera + seg * t);
  float fade = (1.0 - smoothstep(1.2, 2.4, d)) * (1.0 - smoothstep(0.82, 0.92, t));
  if (fade * 0.88 > occBayer4(gl_FragCoord.xy)) discard;
}`;

export function createOccludingMaterial(params: THREE.MeshStandardMaterialParameters) {
  const material = new THREE.MeshStandardMaterial(params);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uOccPlayer = occlusionUniforms.uOccPlayer;
    shader.uniforms.uOccCamera = occlusionUniforms.uOccCamera;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', VERTEX_DECL)
      .replace('#include <project_vertex>', VERTEX_BODY);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', FRAGMENT_DECL)
      .replace('#include <clipping_planes_fragment>', FRAGMENT_BODY);
  };
  material.customProgramCacheKey = () => 'occluding-standard-v1';
  return material;
}
