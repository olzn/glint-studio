import type { EffectBlock } from '../../types';

export const terrainFieldEffect: EffectBlock = {
  id: 'terrain-field',
  name: 'Terrain Field',
  description: 'Particle landscape with noise-driven terrain and concentric scan rings',
  category: 'generator',
  order: 200,
  requiredUtils: ['noise'],
  params: [
    {
      id: 'density',
      label: 'Density',
      type: 'float',
      defaultValue: 30,
      min: 10,
      max: 60,
      step: 1,
      uniformName: '',
      glslDefault: '30.0',
      group: 'grid',
    },
    {
      id: 'perspective',
      label: 'Perspective',
      type: 'float',
      defaultValue: 0.55,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.55',
      group: 'grid',
    },
    {
      id: 'dotSize',
      label: 'Dot Size',
      type: 'float',
      defaultValue: 0.15,
      min: 0.1,
      max: 0.3,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.15',
      group: 'grid',
    },
    {
      id: 'elevation',
      label: 'Elevation',
      type: 'float',
      defaultValue: 1.2,
      min: 0.2,
      max: 3.0,
      step: 0.05,
      uniformName: '',
      glslDefault: '1.2',
      group: 'terrain',
    },
    {
      id: 'scale',
      label: 'Terrain Scale',
      type: 'float',
      defaultValue: 2.5,
      min: 0.5,
      max: 6.0,
      step: 0.1,
      uniformName: '',
      glslDefault: '2.5',
      group: 'terrain',
    },
    {
      id: 'drift',
      label: 'Drift',
      type: 'float',
      defaultValue: 0.08,
      min: 0,
      max: 0.3,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.08',
      group: 'animation',
    },
    {
      id: 'ringFreq',
      label: 'Ring Frequency',
      type: 'float',
      defaultValue: 12.0,
      min: 0,
      max: 30,
      step: 1,
      uniformName: '',
      glslDefault: '12.0',
      group: 'rings',
    },
    {
      id: 'ringWidth',
      label: 'Ring Width',
      type: 'float',
      defaultValue: 0.5,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'rings',
    },
  ],
  glslBody: `{
  vec2 _uvc = (uv - 0.5) * vec2(aspect, 1.0);

  // Camera — looking down at the terrain at an angle
  float _tilt = 0.8 - $perspective * 0.5;
  vec3 _ro = vec3(0.0, 3.5, 0.0);
  vec3 _fwd = vec3(0.0, -_tilt, sqrt(1.0 - _tilt * _tilt));
  vec3 _rgt = vec3(1.0, 0.0, 0.0);
  vec3 _up = normalize(cross(_fwd, _rgt));
  vec3 _rd = normalize(_fwd + _uvc.x * _rgt + _uvc.y * _up);

  float _driftT = t * $drift;
  float _accum = 0.0;

  if (_rd.y < -0.001) {
    // Scan horizontal slices from top to bottom
    // Each slice is a flat plane → dots are always perfectly circular
    for (int _i = 0; _i < 24; _i++) {
      float _frac24 = float(_i) / 23.0;
      float _planeY = $elevation * (1.0 - _frac24);

      // Ray–plane intersection
      float _rayT = (_planeY - _ro.y) / _rd.y;
      if (_rayT <= 0.0) continue;

      vec3 _hit = _ro + _rd * _rayT;
      float _dist = length(_hit - _ro);
      vec2 _wp = _hit.xz;

      // Grid cell at this flat hit point
      vec2 _gp = _wp * $density;
      vec2 _cell = floor(_gp);
      vec2 _fc = fract(_gp) - 0.5;

      // Terrain height at cell center (2-octave noise for perf)
      vec2 _cellCenter = (_cell + 0.5) / $density;
      vec2 _np = _cellCenter * $scale * 0.4 + vec2(_driftT * 0.7, _driftT * 0.3);
      float _terrainH = (noise(_np) * 0.65 + noise(_np * 2.0) * 0.35) * $elevation;

      // Ridge layer
      vec2 _rp = _cellCenter * $scale * 0.8 + vec2(-_driftT * 0.3, _driftT * 0.5);
      float _ridge = noise(_rp);
      _ridge = 1.0 - abs(_ridge * 2.0 - 1.0);
      _terrainH += _ridge * $elevation * 0.25;

      // Only draw a dot if this plane matches the terrain height at this cell
      float _sliceThick = $elevation / 23.0;
      float _hDiff = abs(_planeY - _terrainH);
      if (_hDiff > _sliceThick * 1.2) continue;

      // Match strength — tighter match = brighter dot
      float _match = 1.0 - _hDiff / (_sliceThick * 1.2);

      // Dot rendering — always circular since the plane is flat
      float _dotDist = length(_fc);
      float _dSize = $dotSize * 6.0 / max(_dist, 0.5);
      float _dot = 1.0 - smoothstep(_dSize * 0.4, _dSize, _dotDist);

      // Height-based brightness — peaks are brightest
      float _normH = _planeY / max($elevation, 0.01);
      float _heightBright = _normH * 0.6 + 0.4;

      // Concentric scan rings from center
      float _radial = length(_wp);
      float _ringPhase = _radial * $ringFreq - t * $drift * 8.0;
      float _ring = abs(fract(_ringPhase) - 0.5) * 2.0;
      _ring = smoothstep(0.0, $ringWidth, _ring);
      float _ringMask = mix(0.4, 1.0, _ring);

      // Distance fade
      float _fade = 5.0 / (_dist * _dist * 0.06 + 1.0);
      _fade = min(_fade, 1.0);

      // Per-dot variation
      float _h = hash(_cell);
      float _shimmer = 0.85 + 0.15 * sin(t * 0.5 + _h * 6.283);

      _accum += _dot * _match * _heightBright * _ringMask * _fade * _shimmer;
    }
  }

  mixFactor = clamp(_accum, 0.0, 1.0);
}`,
};
