import type { EffectBlock } from '../../types';

export const gradientEffect: EffectBlock = {
  id: 'gradient',
  name: 'Gradient',
  description: 'Linear gradient between two colors',
  category: 'generator',
  order: 100,
  requiredUtils: [],
  params: [
    {
      id: 'angle',
      label: 'Angle',
      type: 'float',
      defaultValue: 0,
      min: 0,
      max: 360,
      step: 1,
      uniformName: '',
      glslDefault: '0.0',
      group: 'gradient',
      displayUnit: 'deg',
    },
    {
      id: 'midpoint',
      label: 'Midpoint',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'gradient',
    },
    {
      id: 'softness',
      label: 'Softness',
      type: 'float',
      defaultValue: 0.5,
      min: 0.01,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'gradient',
    },
  ],
  glslBody: `{
  float _ca = cos($angle);
  float _sa = sin($angle);
  float _grad = (uv.x - 0.5) * _ca + (uv.y - 0.5) * _sa + 0.5;
  mixFactor = smoothstep($midpoint - $softness * 0.5, $midpoint + $softness * 0.5, _grad);
}`,
};
