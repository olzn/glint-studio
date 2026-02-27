import type { ShaderParam, UniformValue } from './types';
import type { Renderer } from './renderer';

const DEG_TO_RAD = Math.PI / 180;

/**
 * Syncs parameter values from the state store to the WebGL renderer.
 * Handles unit conversion (e.g., degrees -> radians) before sending to the GPU.
 */
export function syncUniforms(
  renderer: Renderer,
  params: ShaderParam[],
  values: Record<string, UniformValue>
): void {
  for (const param of params) {
    let value = values[param.id] ?? param.defaultValue;

    // Convert degrees to radians for the GPU
    if (param.displayUnit === 'deg' && typeof value === 'number') {
      value = value * DEG_TO_RAD;
    }

    renderer.setUniform(param.uniformName, param.type, value);
  }
}

/**
 * Sync the dynamic color uniforms (u_color0, u_color1, ...).
 */
export function syncColors(
  renderer: Renderer,
  colors: string[]
): void {
  for (let i = 0; i < colors.length; i++) {
    renderer.setUniform(`u_color${i}`, 'color', colors[i]);
  }
}

/**
 * Sync the dynamic color stop uniforms (u_stop0, u_stop1, ...).
 */
export function syncColorStops(
  renderer: Renderer,
  stops: number[]
): void {
  for (let i = 0; i < stops.length; i++) {
    renderer.setUniform(`u_stop${i}`, 'float', stops[i]);
  }
}

/**
 * Build default param values from a param list.
 */
export function defaultParamValues(params: ShaderParam[]): Record<string, UniformValue> {
  const values: Record<string, UniformValue> = {};
  for (const p of params) {
    values[p.id] = p.defaultValue;
  }
  return values;
}
