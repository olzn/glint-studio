import type { EffectBlock } from '../../types';

export const waveEffect: EffectBlock = {
  id: 'wave',
  name: 'Wave',
  description: 'Animated sinusoidal wave pattern',
  category: 'generator',
  order: 130,
  requiredUtils: [],
  params: [
    {
      id: 'frequency',
      label: 'Frequency',
      type: 'float',
      defaultValue: 4.0,
      min: 0.5,
      max: 20.0,
      step: 0.1,
      uniformName: '',
      glslDefault: '4.0',
      group: 'waves',
    },
    {
      id: 'amplitude',
      label: 'Amplitude',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'waves',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 3.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'waves',
    },
    {
      id: 'angle',
      label: 'Direction',
      type: 'float',
      defaultValue: 0,
      min: 0,
      max: 360,
      step: 1,
      uniformName: '',
      glslDefault: '0.0',
      group: 'waves',
      displayUnit: 'deg',
    },
  ],
  glslBody: `{
  float _ca = cos($angle);
  float _sa = sin($angle);
  float _coord = st.x * _ca + st.y * _sa;
  float _wave = sin(_coord * $frequency - t * $speed) * $amplitude;
  mixFactor = 0.5 + _wave;
}`,
};
