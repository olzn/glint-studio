import type { EffectBlock } from '../../types';

export const chladniEffect: EffectBlock = {
  id: 'chladni',
  name: 'Chladni',
  description: 'Standing wave nodal patterns that morph between modes',
  category: 'generator',
  order: 118,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'modeA',
      label: 'Mode A',
      type: 'float',
      defaultValue: 5.0,
      min: 1,
      max: 12,
      step: 0.1,
      uniformName: '',
      glslDefault: '5.0',
      group: 'modes',
    },
    {
      id: 'modeB',
      label: 'Mode B',
      type: 'float',
      defaultValue: 3.0,
      min: 1,
      max: 12,
      step: 0.1,
      uniformName: '',
      glslDefault: '3.0',
      group: 'modes',
    },
    {
      id: 'morph',
      label: 'Morph Speed',
      type: 'float',
      defaultValue: 0.15,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'animation',
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
      group: 'style',
    },
    {
      id: 'glow',
      label: 'Glow',
      type: 'float',
      defaultValue: 0.4,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.4',
      group: 'style',
    },
    {
      id: 'layers',
      label: 'Dual Layer',
      type: 'bool',
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 1,
      uniformName: '',
      glslDefault: '1.0',
      group: 'style',
    },
  ],
  glslBody: `{
  // Center UVs to [-1, 1] range
  vec2 _p = (uv - 0.5) * 2.0;
  _p.x *= aspect;

  // Morph modes over time: cycle through mode combinations
  float _mt = t * $morph;
  // Smoothly vary the effective mode numbers around the base values
  float _n1 = $modeA + sin(_mt * 0.7) * 1.5;
  float _m1 = $modeB + cos(_mt * 0.9) * 1.5;

  // Chladni pattern: sin(n*pi*x)*sin(m*pi*y) + sin(m*pi*x)*sin(n*pi*y)
  // Nodal lines are where this equals zero
  float _pi = 3.14159265;
  float _chladni1 = sin(_n1 * _pi * _p.x) * sin(_m1 * _pi * _p.y)
                   + sin(_m1 * _pi * _p.x) * sin(_n1 * _pi * _p.y);

  // Convert to bright nodal lines: thin bright lines where pattern ~ 0
  float _dist1 = abs(_chladni1);
  float _line1 = 1.0 / (1.0 + pow(_dist1 / $lineWidth, 2.0));

  // Soft glow around the lines
  float _glow1 = $glow * 0.5 / (1.0 + _dist1 * _dist1 * 8.0);

  float _pattern = _line1 + _glow1;

  // Optional second layer with offset modes for complexity
  if ($layers > 0.5) {
    float _n2 = $modeA + cos(_mt * 0.5 + 2.0) * 2.0;
    float _m2 = $modeB + sin(_mt * 0.6 + 1.5) * 2.0;

    // Antisymmetric mode (minus instead of plus) for visual variety
    float _chladni2 = sin(_n2 * _pi * _p.x) * sin(_m2 * _pi * _p.y)
                     - sin(_m2 * _pi * _p.x) * sin(_n2 * _pi * _p.y);

    float _dist2 = abs(_chladni2);
    float _line2 = 1.0 / (1.0 + pow(_dist2 / ($lineWidth * 0.7), 2.0));
    float _glow2 = $glow * 0.3 / (1.0 + _dist2 * _dist2 * 8.0);

    // Screen blend the two layers
    float _layer2 = (_line2 + _glow2) * 0.6;
    _pattern = _pattern + _layer2 - _pattern * _layer2;
  }

  mixFactor = clamp(_pattern, 0.0, 1.0);
}`,
};
