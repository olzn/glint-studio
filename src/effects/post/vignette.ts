import type { EffectBlock } from '../../types';

export const vignetteEffect: EffectBlock = {
  id: 'vignette',
  name: 'Vignette',
  description: 'Darken edges of the frame',
  category: 'post',
  order: 210,
  requiredUtils: [],
  params: [
    {
      id: 'strength',
      label: 'Strength',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'effects',
    },
    {
      id: 'radius',
      label: 'Radius',
      type: 'float',
      defaultValue: 0.7,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.7',
      group: 'effects',
    },
  ],
  glslBody: `{
  float _vDist = distance(uv, vec2(0.5));
  float _vig = smoothstep($radius, $radius + 0.4, _vDist);
  color *= 1.0 - _vig * $strength;
}`,
};
