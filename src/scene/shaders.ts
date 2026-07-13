export const stoneVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const stoneFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uGlow;
uniform float uHot;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  float grain = noise(vWorld.xz * 1.8 + vWorld.y * 0.7);
  float veins = smoothstep(0.45, 0.75, noise(vWorld.xy * 3.2 + uTime * 0.02));
  vec3 base = uColor * (0.72 + grain * 0.35);
  base = mix(base, base * 0.55, veins * 0.35);

  float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.2);
  float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.15, 0.8, 0.4))), 3.0);

  vec3 col = base;
  col += uGlow * (0.12 + uHot * 0.75) * rim;
  col += uGlow * uHot * 0.28 * fresnel;
  col += vec3(0.04, 0.05, 0.03) * (1.0 - vUv.y);

  float heightFade = smoothstep(-0.2, 0.35, vWorld.y);
  col *= 0.55 + 0.45 * heightFade;

  gl_FragColor = vec4(col, 1.0);
}
`;

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
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorld;

void main() {
  float d = length(vWorld.xz);
  float ring = abs(sin(d * 0.55 - uTime * 0.15));
  float grid =
    smoothstep(0.02, 0.0, abs(fract(vWorld.x * 0.25) - 0.5) - 0.48) *
    smoothstep(0.02, 0.0, abs(fract(vWorld.z * 0.25) - 0.5) - 0.48);

  vec3 soil = vec3(0.07, 0.08, 0.06);
  vec3 mark = vec3(0.18, 0.16, 0.12);
  vec3 col = mix(soil, mark, grid * 0.35 * (1.0 - smoothstep(4.0, 16.0, d)));
  col += vec3(0.12, 0.1, 0.06) * (1.0 - ring) * 0.04 * (1.0 - smoothstep(6.0, 14.0, d));

  float alpha = 1.0 - smoothstep(12.0, 22.0, d);
  gl_FragColor = vec4(col, alpha);
}
`;
