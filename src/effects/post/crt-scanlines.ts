import type { EffectBlock } from '../../types';

export const crtScanlinesEffect: EffectBlock = {
  id: 'crt-scanlines',
  name: 'CRT Scanlines',
  description: 'Retro scanline overlay with flicker',
  category: 'post',
  order: 230,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'lineWidth',
      label: 'Line Density',
      type: 'float',
      defaultValue: 300.0,
      min: 50,
      max: 800,
      step: 10,
      uniformName: '',
      glslDefault: '300.0',
      group: 'effects',
    },
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'float',
      defaultValue: 0.15,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'effects',
    },
    {
      id: 'flicker',
      label: 'Flicker',
      type: 'float',
      defaultValue: 0.03,
      min: 0,
      max: 0.2,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.03',
      group: 'effects',
    },
  ],
  glslBody: `{
  float _scan = sin(gl_FragCoord.y * 3.14159 * 2.0 / (u_resolution.y / $lineWidth)) * 0.5 + 0.5;
  color *= 1.0 - _scan * $intensity;
  float _flk = hash(vec2(floor(t * 15.0), 0.0));
  color *= 1.0 - $flicker * (_flk - 0.5);
}`,
};
