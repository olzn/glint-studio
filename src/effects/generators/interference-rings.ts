import type { EffectBlock } from '../../types';

export const interferenceRingsEffect: EffectBlock = {
  id: 'interference-rings',
  name: 'Interference Rings',
  description: 'Concentric wave sources creating constructive/destructive interference',
  category: 'generator',
  order: 190,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'sources',
      label: 'Sources',
      type: 'select',
      defaultValue: 4,
      min: 0,
      max: 1,
      step: 1,
      uniformName: '',
      glslDefault: '4.0',
      group: 'waves',
      options: [
        { label: '3 Sources', value: 3 },
        { label: '4 Sources', value: 4 },
        { label: '5 Sources', value: 5 },
      ],
    },
    {
      id: 'frequency',
      label: 'Frequency',
      type: 'float',
      defaultValue: 20,
      min: 5,
      max: 40,
      step: 1,
      uniformName: '',
      glslDefault: '20.0',
      group: 'waves',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.15,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'animation',
    },
    {
      id: 'damping',
      label: 'Damping',
      type: 'float',
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      step: 0.05,
      uniformName: '',
      glslDefault: '1.5',
      group: 'waves',
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
  vec2 _ctr = (uv - 0.5) * vec2(aspect, 1.0);
  float _sources = $sources;
  float _spd = $speed;
  float _damp = $damping;

  // 5 source positions — varied orbit radii for spatial interest
  vec2 _p0 = vec2(sin(t * 0.11) * 0.15, cos(t * 0.13) * 0.12);
  vec2 _p1 = vec2(cos(t * 0.07 + 1.5) * 0.35, sin(t * 0.09 + 1.5) * 0.3);
  vec2 _p2 = vec2(sin(t * 0.13 + 3.0) * 0.25, cos(t * 0.08 + 3.0) * 0.4);
  vec2 _p3 = vec2(cos(t * 0.06 + 4.5) * 0.42, sin(t * 0.11 + 4.5) * 0.2);
  vec2 _p4 = vec2(sin(t * 0.09 + 6.0) * 0.18, cos(t * 0.14 + 6.0) * 0.38);

  // Slightly detuned frequencies per source — richer interference
  float _f0 = $frequency;
  float _f1 = $frequency * 1.07;
  float _f2 = $frequency * 0.93;
  float _f3 = $frequency * 1.13;
  float _f4 = $frequency * 0.87;

  float _pattern = 0.0;
  float _glowAccum = 0.0;

  // Source 0 — always active
  {
    float _d = length(_ctr - _p0);
    float _att = 1.0 / (1.0 + _d * _d * _damp);
    float _wave = sin(_d * _f0 - t * _spd * 10.0);
    float _dist = abs(_wave);
    float _ring = _att / (1.0 + pow(_dist / $lineWidth, 2.0));
    float _halo = _att * $glow * 0.3 / (1.0 + _dist * _dist * 4.0);
    _pattern += _ring;
    _glowAccum += _halo;
  }
  // Source 1
  {
    float _d = length(_ctr - _p1);
    float _att = 1.0 / (1.0 + _d * _d * _damp);
    float _wave = sin(_d * _f1 - t * _spd * 10.0 + 1.0);
    float _dist = abs(_wave);
    float _ring = _att / (1.0 + pow(_dist / $lineWidth, 2.0));
    float _halo = _att * $glow * 0.3 / (1.0 + _dist * _dist * 4.0);
    _pattern += _ring;
    _glowAccum += _halo;
  }
  // Source 2
  {
    float _d = length(_ctr - _p2);
    float _att = 1.0 / (1.0 + _d * _d * _damp);
    float _wave = sin(_d * _f2 - t * _spd * 10.0 + 2.0);
    float _dist = abs(_wave);
    float _ring = _att / (1.0 + pow(_dist / $lineWidth, 2.0));
    float _halo = _att * $glow * 0.3 / (1.0 + _dist * _dist * 4.0);
    _pattern += _ring;
    _glowAccum += _halo;
  }
  // Source 3 — active if sources >= 4
  if (_sources >= 3.5) {
    float _d = length(_ctr - _p3);
    float _att = 1.0 / (1.0 + _d * _d * _damp);
    float _wave = sin(_d * _f3 - t * _spd * 10.0 + 3.0);
    float _dist = abs(_wave);
    float _ring = _att / (1.0 + pow(_dist / $lineWidth, 2.0));
    float _halo = _att * $glow * 0.3 / (1.0 + _dist * _dist * 4.0);
    _pattern += _ring;
    _glowAccum += _halo;
  }
  // Source 4 — active if sources >= 5
  if (_sources >= 4.5) {
    float _d = length(_ctr - _p4);
    float _att = 1.0 / (1.0 + _d * _d * _damp);
    float _wave = sin(_d * _f4 - t * _spd * 10.0 + 4.0);
    float _dist = abs(_wave);
    float _ring = _att / (1.0 + pow(_dist / $lineWidth, 2.0));
    float _halo = _att * $glow * 0.3 / (1.0 + _dist * _dist * 4.0);
    _pattern += _ring;
    _glowAccum += _halo;
  }

  // Screen blend rings + glow
  float _result = _pattern + _glowAccum - _pattern * _glowAccum;
  mixFactor = clamp(_result, 0.0, 1.0);
}`,
};
