import type { EffectBlock } from '../../types';

export const hexLatticeEffect: EffectBlock = {
  id: 'hex-lattice',
  name: 'Hex Lattice',
  description: 'Honeycomb grid with glowing edges, cell pulse propagation, and breathing fill',
  category: 'generator',
  order: 195,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'density',
      label: 'Density',
      type: 'float',
      defaultValue: 12,
      min: 5,
      max: 30,
      step: 1,
      uniformName: '',
      glslDefault: '12.0',
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
      id: 'edgeWidth',
      label: 'Edge Width',
      type: 'float',
      defaultValue: 0.06,
      min: 0.01,
      max: 0.2,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.06',
      group: 'look',
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
      id: 'cellFill',
      label: 'Cell Fill',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'look',
    },
    {
      id: 'pulseSpeed',
      label: 'Pulse Speed',
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
      id: 'pulseFreq',
      label: 'Pulse Frequency',
      type: 'float',
      defaultValue: 5.0,
      min: 1,
      max: 10,
      step: 0.5,
      uniformName: '',
      glslDefault: '5.0',
      group: 'animation',
    },
    {
      id: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      defaultValue: '#ff6600',
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: 'vec3(1.0,0.4,0.0)',
      group: 'color',
    },
    {
      id: 'accentEnabled',
      label: 'Accent Cells',
      type: 'bool',
      defaultValue: 0,
      min: 0,
      max: 1,
      step: 1,
      uniformName: '',
      glslDefault: '0.0',
      group: 'color',
    },
  ],
  glslBody: `{
  vec2 _uvc = (uv - 0.5) * vec2(aspect, 1.0);

  // Camera setup
  float _tilt = 0.8 - $perspective * 0.5;
  vec3 _ro = vec3(0.0, 3.0, 0.0);
  vec3 _fwd = vec3(0.0, -_tilt, sqrt(1.0 - _tilt * _tilt));
  vec3 _rgt = vec3(1.0, 0.0, 0.0);
  vec3 _up = normalize(cross(_fwd, _rgt));
  vec3 _rd = normalize(_fwd + _uvc.x * _rgt + _uvc.y * _up);

  float _accum = 0.0;

  // Single ground plane intersection (honeycomb is flat, not layered like dots)
  if (_rd.y < -0.001) {
    float _t = -_ro.y / _rd.y;

    if (_t > 0.0) {
      vec3 _hit = _ro + _rd * _t;
      float _dist = length(_hit - _ro);

      // Hex grid coordinates — pointy-top hexagons
      float _scale = $density;
      vec2 _wp = _hit.xz * _scale;

      // Convert to axial hex coordinates
      float _hexH = 0.866025; // sqrt(3)/2
      float _q = (2.0 / 3.0) * _wp.x;
      float _r = (-1.0 / 3.0) * _wp.x + (1.0 / _hexH) * _wp.y * 0.5;

      // Cube round for nearest hex center
      float _s = -_q - _r;
      float _rq = floor(_q + 0.5);
      float _rr = floor(_r + 0.5);
      float _rs = floor(_s + 0.5);
      float _dq = abs(_rq - _q);
      float _dr = abs(_rr - _r);
      float _ds = abs(_rs - _s);
      if (_dq > _dr && _dq > _ds) {
        _rq = -_rr - _rs;
      } else if (_dr > _ds) {
        _rr = -_rq - _rs;
      }

      // Hex center in world space
      vec2 _hexCenter = vec2(_rq * 1.5, (_rq * 0.5 + _rr) * _hexH * 2.0);
      vec2 _local = _wp - _hexCenter;

      // Hex SDF — distance from center to edge of unit hexagon
      vec2 _al = abs(_local);
      float _hexDist = max(_al.x, _al.x * 0.5 + _al.y * _hexH);
      float _hexRadius = 0.98; // slight inset for clean edges

      // Normalized: 0 at center, 1 at edge
      float _edgeNorm = _hexDist / _hexRadius;

      // Per-cell hash for variation
      vec2 _cellId = vec2(_rq, _rr);
      float _h = hash(_cellId);
      float _h2 = hash(_cellId + vec2(31.0, 97.0));

      // Pulse propagation — radial wave from origin through cells
      float _cellR = length(_cellId) / _scale;
      float _pulse = sin(_cellR * $pulseFreq * 6.0 - t * $pulseSpeed * 6.2832);
      float _pulseMod = 0.5 + 0.5 * _pulse;

      // Second wave source — offset, different speed for interference
      float _pulse2 = sin((_cellR + _h * 0.3) * $pulseFreq * 4.0 + t * $pulseSpeed * 4.0 + 2.0);
      _pulseMod = _pulseMod * 0.7 + (0.5 + 0.5 * _pulse2) * 0.3;

      // Per-cell breathing — each cell has its own phase
      float _breathPhase = _h * 6.2832;
      float _breath = 0.7 + 0.3 * sin(t * 1.5 + _breathPhase + _pulse * 2.0);

      // Edge glow — Lorentzian profile at hex boundary
      float _edgeFalloff = 1.0 - _edgeNorm;
      float _ew = $edgeWidth;
      float _edgeProximity = max(1.0 - _edgeFalloff, 0.0); // 0 at center, 1 at edge
      float _edgeGlow = 1.0 / (1.0 + pow(_edgeFalloff / _ew, 2.0));

      // Broader halo around edges
      float _edgeHalo = $glow * 0.4 / (1.0 + _edgeFalloff * _edgeFalloff / (_ew * _ew * 4.0));

      // Cell fill — fades from center outward, modulated by pulse
      float _fill = $cellFill * (1.0 - _edgeNorm * _edgeNorm) * _pulseMod * _breath;

      // Combine edges + fill
      float _cell = (_edgeGlow * 0.7 + _edgeHalo) * _pulseMod + _fill;

      // Distance fade
      float _fade = 4.0 / (_dist * _dist * 0.08 + 1.0);
      _fade = min(_fade, 1.0);

      // Perspective-aware edge width compensation
      float _perspComp = min(3.0 / max(_dist, 0.5), 2.0);
      _cell *= _perspComp;

      _accum = _cell * _fade;
    }
  }

  mixFactor = clamp(_accum, 0.0, 1.0);
}`,
  postMixGlsl: `{
  if ($accentEnabled > 0.5) {
    vec2 _uvc2 = (uv - 0.5) * vec2(aspect, 1.0);
    float _tilt2 = 0.8 - $perspective * 0.5;
    vec3 _ro2 = vec3(0.0, 3.0, 0.0);
    vec3 _fwd2 = vec3(0.0, -_tilt2, sqrt(1.0 - _tilt2 * _tilt2));
    vec3 _rgt2 = vec3(1.0, 0.0, 0.0);
    vec3 _up2 = normalize(cross(_fwd2, _rgt2));
    vec3 _rd2 = normalize(_fwd2 + _uvc2.x * _rgt2 + _uvc2.y * _up2);

    if (_rd2.y < -0.001) {
      float _t2 = (-_ro2.y) / _rd2.y;
      if (_t2 > 0.0) {
        vec3 _hit2 = _ro2 + _rd2 * _t2;
        vec2 _wp2 = _hit2.xz * $density;

        // Axial hex rounding
        float _hexH2 = 0.866025;
        float _q2 = (2.0 / 3.0) * _wp2.x;
        float _r2 = (-1.0 / 3.0) * _wp2.x + (1.0 / _hexH2) * _wp2.y * 0.5;
        float _s2 = -_q2 - _r2;
        float _rq2 = floor(_q2 + 0.5);
        float _rr2 = floor(_r2 + 0.5);
        float _rs2 = floor(_s2 + 0.5);
        float _dq2 = abs(_rq2 - _q2);
        float _dr2 = abs(_rr2 - _r2);
        float _ds2 = abs(_rs2 - _s2);
        if (_dq2 > _dr2 && _dq2 > _ds2) {
          _rq2 = -_rr2 - _rs2;
        } else if (_dr2 > _ds2) {
          _rr2 = -_rq2 - _rs2;
        }
        vec2 _cell2 = vec2(_rq2, _rr2);

        float _isAccent = step(0.93, hash(_cell2 + vec2(73.0, 159.0)));
        float _lum = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, $accentColor * _lum * 2.5, _isAccent * step(0.05, _lum));
      }
    }
  }
  // Subtle bloom on bright honeycomb edges
  float _lum2 = dot(color, vec3(0.299, 0.587, 0.114));
  float _bloom = smoothstep(0.3, 0.8, _lum2);
  color += color * _bloom * $glow * 0.3;
}`,
};
