import type { EffectBlock } from '../../types';

export const chromaticAberrationEffect: EffectBlock = {
  id: 'chromatic-aberration',
  name: 'Chromatic Aberration',
  description: 'RGB channel offset from center',
  category: 'post',
  order: 240,
  requiredUtils: [],
  params: [
    {
      id: 'amount',
      label: 'Amount',
      type: 'float',
      defaultValue: 0.005,
      min: 0,
      max: 0.05,
      step: 0.001,
      uniformName: '',
      glslDefault: '0.005',
      group: 'effects',
    },
  ],
  // Note: This effect reads back from the current color and shifts channels.
  // Because we don't have a texture to sample, we approximate by offsetting
  // the color channels based on UV distance from center.
  glslBody: `{
  vec2 _dir = uv - 0.5;
  float _dist = length(_dir);
  float _shift = _dist * $amount;
  color.r *= 1.0 + _shift * 10.0;
  color.b *= 1.0 - _shift * 10.0;
}`,
};
