/** Shared GLSL utility functions used by effect blocks. */

export const GLSL_HASH = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}`;

export const GLSL_NOISE = `
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}`;

export const GLSL_FBM = `
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}`;

export type UtilId = 'hash' | 'noise' | 'fbm';

/** Dependency graph: fbm requires noise, noise requires hash */
const UTIL_DEPS: Record<UtilId, UtilId[]> = {
  hash: [],
  noise: ['hash'],
  fbm: ['noise', 'hash'],
};

const UTIL_CODE: Record<UtilId, string> = {
  hash: GLSL_HASH,
  noise: GLSL_NOISE,
  fbm: GLSL_FBM,
};

/**
 * Given a set of required utility IDs, returns the GLSL code for all
 * required utilities in dependency order, deduplicated.
 */
export function resolveUtils(required: UtilId[]): string {
  const included = new Set<UtilId>();
  const ordered: UtilId[] = [];

  function add(id: UtilId) {
    if (included.has(id)) return;
    for (const dep of UTIL_DEPS[id]) {
      add(dep);
    }
    included.add(id);
    ordered.push(id);
  }

  for (const id of required) {
    add(id);
  }

  return ordered.map(id => UTIL_CODE[id]).join('\n');
}
