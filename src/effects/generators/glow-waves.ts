import type { EffectBlock } from '../../types';

export const glowWavesEffect: EffectBlock = {
  id: 'glow-waves',
  name: 'Glow Waves',
  description: 'Sine-wave displacement with breathing glow',
  category: 'generator',
  order: 140,
  requiredUtils: ['hash', 'noise', 'fbm'],
  params: [
    {
      id: 'maskStart',
      label: 'Mask Start',
      type: 'float',
      defaultValue: 0.45,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.45',
      group: 'mask',
    },
    {
      id: 'waveFreq',
      label: 'Wave Frequency',
      type: 'float',
      defaultValue: 5.0,
      min: 1.0,
      max: 20.0,
      step: 0.1,
      uniformName: '',
      glslDefault: '5.0',
      group: 'waves',
    },
    {
      id: 'waveSpeed',
      label: 'Wave Speed',
      type: 'float',
      defaultValue: 0.25,
      min: 0,
      max: 2.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.25',
      group: 'waves',
    },
    {
      id: 'displacement',
      label: 'Displacement',
      type: 'float',
      defaultValue: 0.30,
      min: 0,
      max: 0.8,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.30',
      group: 'waves',
    },
    {
      id: 'gradLow',
      label: 'Gradient Low',
      type: 'float',
      defaultValue: 0.6,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.6',
      group: 'blending',
    },
    {
      id: 'gradHigh',
      label: 'Gradient High',
      type: 'float',
      defaultValue: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.9',
      group: 'blending',
    },
    {
      id: 'brightness',
      label: 'Brightness Pulse',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'effects',
    },
    {
      id: 'breathColor',
      label: 'Glow Tint',
      type: 'color',
      defaultValue: '#1a0a00',
      uniformName: '',
      glslDefault: 'vec3(0.10, 0.04, 0.0)',
      group: 'colors',
    },
  ],
  glslBody: `{
  vec2 _guv = uv;
  _guv.y = 1.0 - _guv.y;
  float _mask = smoothstep($maskStart, 1.0, _guv.y);
  float _intensity = _mask * _mask;

  float _w1 = sin(st.x * $waveFreq - t * $waveSpeed + st.y * 0.8);
  float _w2 = sin(st.x * 3.2 + t * 0.18 + 1.4) * 0.7;
  float _w3 = sin(st.x * 8.0 - t * 0.30 - st.y * 1.2 + 2.8) * 0.4;
  float _w4 = sin(st.x * 1.8 + t * 0.12 + st.y * 0.5 + 4.1) * 0.5;
  float _w5 = sin(st.x * 6.3 - t * 0.14 + st.y * 1.7 + 0.9) * 0.35;
  float _w6 = sin(st.x * 2.1 + t * 0.23 - st.y * 0.6 + 5.7) * 0.55;
  float _w7 = sin(st.x * 11.0 - t * 0.08 + st.y * 2.3 + 3.1) * 0.2;
  float _w8 = sin(st.x * 0.9 + t * 0.07 + st.y * 0.3 + 7.4) * 0.65;
  float _wave = (_w1 + _w2 + _w3 + _w4 + _w5 + _w6 + _w7 + _w8) / 4.35;

  float _wv1 = sin(st.x * 4.0 + t * 0.20 + 0.7);
  float _wv2 = sin(st.x * 6.5 - t * 0.22 + st.y * 1.0 + 3.3) * 0.6;
  float _wv3 = sin(st.x * 2.5 - t * 0.15 + 5.0) * 0.5;
  float _wv4 = sin(st.y * 3.7 + t * 0.11 + st.x * 1.4 + 2.1) * 0.45;
  float _wv5 = sin(st.x * 9.2 + t * 0.17 - st.y * 0.8 + 6.3) * 0.25;
  float _wv6 = sin(st.x * 1.3 - t * 0.09 + st.y * 2.1 + 8.5) * 0.55;
  float _wave2 = (_wv1 + _wv2 + _wv3 + _wv4 + _wv5 + _wv6) / 3.35;

  float _displaceAmount = _intensity * $displacement;
  float _yDisplace = _wave * _displaceAmount;
  float _xDisplace = _wave2 * _displaceAmount * 0.4;

  float _gradY = _guv.y + _yDisplace;
  _gradY = clamp(_gradY, 0.0, 1.0);

  float _gradientPos = mix(_guv.y, _gradY, _mask);
  mixFactor = smoothstep($gradLow, $gradHigh, _gradientPos);
}`,
  postMixGlsl: `{
  vec2 _guv2 = uv;
  _guv2.y = 1.0 - _guv2.y;
  float _mask2 = smoothstep($maskStart, 1.0, _guv2.y);
  float _intensity2 = _mask2 * _mask2;

  float _w1b = sin(st.x * $waveFreq - t * $waveSpeed + st.y * 0.8);
  float _w2b = sin(st.x * 3.2 + t * 0.18 + 1.4) * 0.7;
  float _w3b = sin(st.x * 8.0 - t * 0.30 - st.y * 1.2 + 2.8) * 0.4;
  float _w4b = sin(st.x * 1.8 + t * 0.12 + st.y * 0.5 + 4.1) * 0.5;
  float _waveb = (_w1b + _w2b + _w3b + _w4b) / 2.6;

  float _brightPulse = 0.5 + 0.5 * _waveb;
  float _brightnessBoost = 1.0 + _intensity2 * $brightness * _brightPulse;
  color *= mix(1.0, _brightnessBoost, _mask2);

  float _breath = smoothstep(-0.2, 0.5, _waveb);
  color += _intensity2 * $breathColor * _breath;
}`,
};
