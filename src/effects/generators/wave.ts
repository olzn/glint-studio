import type { EffectBlock } from '../../types';

export const waveEffect: EffectBlock = {
  id: 'wave',
  name: 'Wave',
  description: 'Layered directional waves with luminous edge glow and harmonic interference',
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
    {
      id: 'glow',
      label: 'Glow',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'look',
    },
    {
      id: 'harmonics',
      label: 'Harmonics',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'look',
    },
  ],
  glslBody: `{
  float _ca = cos($angle);
  float _sa = sin($angle);
  vec2 _dir = vec2(_ca, _sa);
  vec2 _perp = vec2(-_sa, _ca);
  float _coord = st.x * _ca + st.y * _sa;

  // Primary wave
  float _w1 = sin(_coord * $frequency - t * $speed);

  // Harmonic layers — detuned, cross-angled for interference richness
  float _cross = st.x * _perp.x + st.y * _perp.y;
  float _w2 = sin(_coord * $frequency * 2.03 + _cross * 0.4 - t * $speed * 1.3) * 0.5;
  float _w3 = sin(_coord * $frequency * 0.49 + _cross * 0.7 + t * $speed * 0.7) * 0.7;
  float _w4 = sin(_coord * $frequency * 3.01 - _cross * 0.2 - t * $speed * 0.9) * 0.3;

  // Blend harmonics based on parameter
  float _wave = _w1 + $harmonics * (_w2 + _w3 * 0.5 + _w4 * 0.3);
  float _norm = 1.0 + $harmonics * (0.5 + 0.35 + 0.09);
  _wave /= _norm;

  // Lorentzian edge glow — bright luminous bands at wave crests
  float _edgeDist = abs(_wave);
  float _lw = 0.08;
  float _edge = 1.0 / (1.0 + pow(_edgeDist / _lw, 2.0));

  // Broader glow halo around edges
  float _halo = $glow * 0.6 / (1.0 + _edgeDist * _edgeDist * 8.0);

  // Smooth amplitude fill — the underlying wave body
  float _fill = (0.5 + _wave * $amplitude * 0.5);

  // Combine: fill provides the base, edge + halo add luminous character
  float _pattern = _fill * (1.0 - $glow * 0.3) + (_edge * 0.4 + _halo) * $amplitude;

  mixFactor = clamp(_pattern, 0.0, 1.0);
}`,
};
