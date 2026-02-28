import type { EffectBlock } from '../../types';

export const waveMeshEffect: EffectBlock = {
  id: 'wave-mesh',
  name: 'Wave Mesh',
  description: 'Perspective wireframe grid with wave displacement',
  category: 'generator',
  order: 185,
  requiredUtils: [],
  params: [
    {
      id: 'gridSize',
      label: 'Grid Size',
      type: 'float',
      defaultValue: 20,
      min: 5,
      max: 40,
      step: 1,
      uniformName: '',
      glslDefault: '20.0',
      group: 'grid',
    },
    {
      id: 'perspective',
      label: 'Perspective',
      type: 'float',
      defaultValue: 0.6,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.6',
      group: 'grid',
    },
    {
      id: 'waveFreq',
      label: 'Wave Frequency',
      type: 'float',
      defaultValue: 4.0,
      min: 1,
      max: 10,
      step: 0.1,
      uniformName: '',
      glslDefault: '4.0',
      group: 'wave',
    },
    {
      id: 'waveAmp',
      label: 'Wave Amplitude',
      type: 'float',
      defaultValue: 0.15,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'wave',
    },
    {
      id: 'waveSpeed',
      label: 'Wave Speed',
      type: 'float',
      defaultValue: 0.12,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.12',
      group: 'animation',
    },
    {
      id: 'lineWidth',
      label: 'Line Width',
      type: 'float',
      defaultValue: 0.015,
      min: 0.005,
      max: 0.05,
      step: 0.001,
      uniformName: '',
      glslDefault: '0.015',
      group: 'look',
    },
  ],
  glslBody: `{
  vec2 _uvc = (uv - 0.5) * vec2(aspect, 1.0);

  // Camera setup — same pattern as dot-lattice-3d
  float _tilt = 0.8 - $perspective * 0.5;
  vec3 _ro = vec3(0.0, 3.0, 0.0);
  vec3 _fwd = vec3(0.0, -_tilt, sqrt(1.0 - _tilt * _tilt));
  vec3 _rgt = vec3(1.0, 0.0, 0.0);
  vec3 _up = normalize(cross(_fwd, _rgt));
  vec3 _rd = normalize(_fwd + _uvc.x * _rgt + _uvc.y * _up);

  float _grid = 0.0;

  // Intersect single ground plane (y=0)
  if (_rd.y < -0.001) {
    float _t = -_ro.y / _rd.y;

    if (_t > 0.0) {
      vec3 _hit = _ro + _rd * _t;
      float _dist = length(_hit - _ro);

      // World grid coordinates
      vec2 _wp = _hit.xz * $gridSize;

      // Wave displacement — three crossing sine waves for organic irregularity
      float _wt = t * $waveSpeed * 6.2832;
      float _waveX = sin(_hit.x * $waveFreq + _wt) * $waveAmp
                    + sin(_hit.x * $waveFreq * 1.7 + _hit.z * 0.5 + _wt * 0.8) * $waveAmp * 0.3;
      float _waveZ = sin(_hit.z * $waveFreq * 0.7 + _wt * 1.3) * $waveAmp * 0.7
                    + sin(_hit.z * $waveFreq * 1.4 + _hit.x * 0.3 - _wt * 0.6) * $waveAmp * 0.25;

      // Displace both axes for proper ocean mesh feel
      _wp.x += _waveZ * $gridSize * 0.3;
      _wp.y += _waveX * $gridSize * 0.5;

      // Grid lines — both axes
      vec2 _gf = abs(fract(_wp) - 0.5);

      // Perspective-aware line width: thinner further away
      float _lw = $lineWidth * 50.0 / max(_dist, 0.5);
      _lw = min(_lw, 0.48);

      float _lineX = 1.0 - smoothstep(_lw - _lw * 0.3, _lw + _lw * 0.3, _gf.x);
      float _lineZ = 1.0 - smoothstep(_lw - _lw * 0.3, _lw + _lw * 0.3, _gf.y);
      float _lines = max(_lineX, _lineZ);

      // Distance fade
      float _fade = 4.0 / (_dist * _dist * 0.08 + 1.0);
      _fade = min(_fade, 1.0);

      _grid = _lines * _fade;
    }
  }

  mixFactor = clamp(_grid, 0.0, 1.0);
}`,
  postMixGlsl: `{
  // Glow bloom — bright lines bloom outward
  float _lum = dot(color, vec3(0.299, 0.587, 0.114));
  float _bloom = smoothstep(0.2, 0.7, _lum);
  color += color * _bloom * 0.4;
  // Slight highlight boost at bright intersections
  color += vec3(1.0) * pow(_lum, 4.0) * 0.15;
}`,
};
