import type { EffectBlock } from '../../types';

export const domainWarpEffect: EffectBlock = {
  id: 'domain-warp',
  name: 'Domain Warp',
  description: 'Warped FBM noise with organic flow',
  category: 'generator',
  order: 120,
  requiredUtils: ['hash', 'noise', 'fbm'],
  params: [
    {
      id: 'noiseScale',
      label: 'Noise Scale',
      type: 'float',
      defaultValue: 0.8,
      min: 0.1,
      max: 5.0,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.8',
      group: 'noise',
    },
    {
      id: 'warpIntensity',
      label: 'Warp Intensity',
      type: 'float',
      defaultValue: 4.0,
      min: 0,
      max: 10.0,
      step: 0.1,
      uniformName: '',
      glslDefault: '4.0',
      group: 'noise',
    },
    {
      id: 'rotation',
      label: 'Rotation',
      type: 'float',
      defaultValue: 40,
      min: 0,
      max: 360,
      step: 1,
      uniformName: '',
      glslDefault: '0.7',
      group: 'transform',
      displayUnit: 'deg',
    },
    {
      id: 'driftSpeed1',
      label: 'Drift Speed X',
      type: 'float',
      defaultValue: 0.03,
      min: 0,
      max: 0.2,
      step: 0.001,
      uniformName: '',
      glslDefault: '0.03',
      group: 'animation',
    },
    {
      id: 'driftSpeed2',
      label: 'Drift Speed Y',
      type: 'float',
      defaultValue: 0.04,
      min: 0,
      max: 0.2,
      step: 0.001,
      uniformName: '',
      glslDefault: '0.04',
      group: 'animation',
    },
    {
      id: 'mixLow',
      label: 'Mix Low',
      type: 'float',
      defaultValue: 0.25,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.25',
      group: 'blending',
    },
    {
      id: 'mixHigh',
      label: 'Mix High',
      type: 'float',
      defaultValue: 0.75,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.75',
      group: 'blending',
    },
  ],
  glslBody: `{
  float _ca = cos($rotation);
  float _sa = sin($rotation);
  vec2 _rot = vec2(st.x * _ca - st.y * _sa, st.x * _sa + st.y * _ca);

  vec2 _drift1 = vec2(sin(t * $driftSpeed1) * 0.5, cos(t * $driftSpeed2) * 0.5);
  vec2 _drift2 = vec2(cos(t * 0.025) * 0.5, sin(t * 0.035) * 0.5);
  float _drift3 = sin(t * 0.02) * 0.5;

  vec2 _q = vec2(
    fbm(_rot * $noiseScale + vec2(0.0, 0.0) + _drift1),
    fbm(_rot * $noiseScale + vec2(5.2, 1.3) + _drift1.yx)
  );

  vec2 _r = vec2(
    fbm(_rot * $noiseScale + $warpIntensity * _q + vec2(1.7, 9.2) + _drift2),
    fbm(_rot * $noiseScale + $warpIntensity * _q + vec2(8.3, 2.8) + _drift2.yx)
  );

  float _f = fbm(_rot * $noiseScale + $warpIntensity * _r + _drift3);
  mixFactor = smoothstep($mixLow, $mixHigh, _f);
  mixFactor += 0.15 * (_q.x - 0.5);
  mixFactor = clamp(mixFactor, 0.0, 1.0);
}`,
  postMixGlsl: `{
  color *= 0.85 + 0.15 * smoothstep(0.0, 0.5, mixFactor);
}`,
};
