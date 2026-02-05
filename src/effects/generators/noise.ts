import type { EffectBlock } from '../../types';

export const noiseEffect: EffectBlock = {
  id: 'noise',
  name: 'Noise',
  description: 'Animated FBM noise field',
  category: 'generator',
  order: 110,
  requiredUtils: ['hash', 'noise', 'fbm'],
  params: [
    {
      id: 'scale',
      label: 'Scale',
      type: 'float',
      defaultValue: 3.0,
      min: 0.1,
      max: 10.0,
      step: 0.05,
      uniformName: '',
      glslDefault: '3.0',
      group: 'noise',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 2.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'noise',
    },
  ],
  glslBody: `{
  vec2 _np = st * $scale + t * $speed;
  mixFactor = fbm(_np);
}`,
};
