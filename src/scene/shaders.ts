export const groundVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const groundFragment = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  float d = length(vWorld.xz);
  float grid =
    smoothstep(0.016, 0.0, abs(fract(vWorld.x * 0.16) - 0.5) - 0.494) *
    smoothstep(0.016, 0.0, abs(fract(vWorld.z * 0.16) - 0.5) - 0.494);

  vec3 soil = vec3(0.055, 0.058, 0.048);
  vec3 mark = vec3(0.11, 0.11, 0.09);
  vec3 col = mix(soil, mark, grid * 0.2 * (1.0 - smoothstep(2.5, 11.0, d)));

  float alpha = 1.0 - smoothstep(9.0, 18.0, d);
  gl_FragColor = vec4(col, alpha);
}
`;
