import type { EffectBlock } from '../../types';

export const spiralEffect: EffectBlock = {
  id: 'spiral',
  name: 'Spiral',
  description: 'Layered spiral arms with glow and interference',
  category: 'generator',
  order: 150,
  requiredUtils: [],
  params: [
    {
      id: 'arms',
      label: 'Arms',
      type: 'float',
      defaultValue: 4,
      min: 1,
      max: 12,
      step: 1,
      uniformName: '',
      glslDefault: '4.0',
      group: 'spiral',
    },
    {
      id: 'tightness',
      label: 'Tightness',
      type: 'float',
      defaultValue: 8,
      min: 1,
      max: 30,
      step: 0.5,
      uniformName: '',
      glslDefault: '8.0',
      group: 'spiral',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 3,
      step: 0.1,
      uniformName: '',
      glslDefault: '0.5',
      group: 'spiral',
    },
    {
      id: 'lineWidth',
      label: 'Line Width',
      type: 'float',
      defaultValue: 0.06,
      min: 0.01,
      max: 0.3,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.06',
      group: 'look',
    },
    {
      id: 'glow',
      label: 'Glow',
      type: 'float',
      defaultValue: 0.4,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.4',
      group: 'look',
    },
  ],
  glslBody: `{
  vec2 _center = st - vec2(aspect * 0.5, 0.5);
  float _angle = atan(_center.y, _center.x);
  float _dist = length(_center);

  // Primary spiral — Lorentzian line profile
  float _s1 = sin($arms * _angle + _dist * $tightness - t * $speed);
  float _line1 = 1.0 / (1.0 + pow(abs(_s1) / $lineWidth, 2.0));

  // Secondary spiral — offset arms, thinner, counter-rotating
  float _s2 = sin($arms * _angle - _dist * $tightness * 0.7 + t * $speed * 0.6 + 1.57);
  float _line2 = 1.0 / (1.0 + pow(abs(_s2) / ($lineWidth * 0.5), 2.0)) * 0.5;

  // Radial ripple modulation — pulses outward along the spiral
  float _ripple = 0.5 + 0.5 * sin(_dist * 12.0 - t * $speed * 2.0);
  _ripple = mix(1.0, _ripple, 0.3);

  // Glow halo per spiral
  float _glow1 = $glow * 0.4 / (1.0 + _s1 * _s1 * 6.0);
  float _glow2 = $glow * 0.2 / (1.0 + _s2 * _s2 * 6.0);

  // Screen blend both spirals
  float _primary = (_line1 + _glow1) * _ripple;
  float _secondary = _line2 + _glow2;
  float _pattern = _primary + _secondary - _primary * _secondary;

  // Radial fade — brightest near center, fading outward
  float _radialFade = 1.0 / (1.0 + _dist * _dist * 0.8);

  mixFactor = clamp(_pattern * _radialFade, 0.0, 1.0);
}`,
};
