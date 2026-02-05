import type { EffectBlock } from '../../types';

export const filmGrainEffect: EffectBlock = {
  id: 'film-grain',
  name: 'Film Grain',
  description: 'Animated noise grain overlay',
  category: 'post',
  order: 220,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'float',
      defaultValue: 0.08,
      min: 0,
      max: 0.3,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.08',
      group: 'effects',
    },
  ],
  glslBody: `{
  float _grain = hash(gl_FragCoord.xy + fract(t * 60.0) * 100.0);
  color += (_grain - 0.5) * $intensity;
}`,
};
