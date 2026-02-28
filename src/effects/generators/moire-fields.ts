import type { EffectBlock } from '../../types';

export const moireFieldsEffect: EffectBlock = {
  id: 'moire-fields',
  name: 'Moiré Fields',
  description: 'Overlapping rotated line grids creating shimmering moiré interference',
  category: 'generator',
  order: 175,
  requiredUtils: ['hash', 'noise'],
  params: [
    {
      id: 'lineCount',
      label: 'Line Count',
      type: 'float',
      defaultValue: 40,
      min: 10,
      max: 80,
      step: 1,
      uniformName: '',
      glslDefault: '40.0',
      group: 'pattern',
    },
    {
      id: 'lineWidth',
      label: 'Line Width',
      type: 'float',
      defaultValue: 0.06,
      min: 0.01,
      max: 0.2,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.06',
      group: 'pattern',
    },
    {
      id: 'rotation',
      label: 'Rotation',
      type: 'float',
      defaultValue: 0,
      min: 0,
      max: 360,
      step: 1,
      uniformName: '',
      glslDefault: '0.0',
      group: 'pattern',
      displayUnit: 'deg',
    },
    {
      id: 'warp',
      label: 'Warp',
      type: 'float',
      defaultValue: 0.15,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'pattern',
    },
    {
      id: 'drift',
      label: 'Drift Speed',
      type: 'float',
      defaultValue: 0.08,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.08',
      group: 'animation',
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
  float _freq = $lineCount;
  float _lw = $lineWidth;

  // Noise-based spatial warping — breaks the uniform grid
  vec2 _warpOff = vec2(
    noise(_ctr * 2.0 + vec2(t * 0.05, 0.0)),
    noise(_ctr * 2.0 + vec2(0.0, t * 0.05) + vec2(5.2, 1.3))
  );
  vec2 _warped = _ctr + (_warpOff - 0.5) * $warp;

  // Three grid angles: 0°, 60°, 120° relative to global rotation
  // Each drifts at different speed for continuously shifting interference
  float _baseAngle = $rotation;
  float _drift1 = t * $drift;
  float _drift2 = t * $drift * 1.37;
  float _drift3 = t * $drift * 0.73;

  float _a1 = _baseAngle + _drift1;
  float _a2 = _baseAngle + 1.0472 + _drift2;
  float _a3 = _baseAngle + 2.0944 + _drift3;

  // Rotated projections through warped space
  float _p1 = _warped.x * cos(_a1) + _warped.y * sin(_a1);
  float _p2 = _warped.x * cos(_a2) + _warped.y * sin(_a2);
  float _p3 = _warped.x * cos(_a3) + _warped.y * sin(_a3);

  // Raw sine stripes
  float _s1 = sin(_p1 * _freq * 6.2832);
  float _s2 = sin(_p2 * _freq * 6.2832);
  float _s3 = sin(_p3 * _freq * 6.2832);

  // Lorentzian line profile — luminous soft glow like Chladni
  float _sharp = _lw * 2.0;
  float _line1 = 1.0 / (1.0 + pow((1.0 - abs(_s1)) / _sharp, 2.0));
  float _line2 = 1.0 / (1.0 + pow((1.0 - abs(_s2)) / _sharp, 2.0));
  float _line3 = 1.0 / (1.0 + pow((1.0 - abs(_s3)) / _sharp, 2.0));

  // Interference: multiply grids for moiré, add glow halos
  float _moire = _line1 * _line2 * _line3;
  _moire = pow(_moire, 0.5);

  // Soft glow from individual grids bleeding through
  float _glowSum = (_line1 + _line2 + _line3) / 3.0;
  float _halo = $glow * _glowSum * 0.4;

  // Radial density falloff — pattern fades gently at edges
  float _radial = 1.0 - smoothstep(0.3, 0.8, length(_ctr));

  mixFactor = clamp((_moire + _halo) * _radial, 0.0, 1.0);
}`,
};
