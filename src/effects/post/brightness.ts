import type { EffectBlock } from '../../types';

export const brightnessEffect: EffectBlock = {
  id: 'brightness',
  name: 'Brightness',
  description: 'Adjust overall color brightness',
  category: 'post',
  order: 200,
  requiredUtils: [],
  params: [
    {
      id: 'amount',
      label: 'Amount',
      type: 'float',
      defaultValue: 0.0,
      min: -0.5,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.0',
      group: 'effects',
    },
  ],
  glslBody: `{
  color *= 1.0 + $amount;
}`,
};
