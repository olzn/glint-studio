import type { EffectBlock } from '../../types';

export const dotLattice3dEffect: EffectBlock = {
  id: 'dot-lattice-3d',
  name: 'Dot Lattice 3D',
  description: 'Perspective dot grid with cymatic wave interference',
  category: 'generator',
  order: 170,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'density',
      label: 'Density',
      type: 'float',
      defaultValue: 20,
      min: 5,
      max: 50,
      step: 1,
      uniformName: '',
      glslDefault: '20.0',
      group: 'grid',
    },
    {
      id: 'perspective',
      label: 'Perspective',
      type: 'float',
      defaultValue: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.5',
      group: 'grid',
    },
    {
      id: 'dotSize',
      label: 'Dot Size',
      type: 'float',
      defaultValue: 0.04,
      min: 0.01,
      max: 0.12,
      step: 0.005,
      uniformName: '',
      glslDefault: '0.04',
      group: 'grid',
    },
    {
      id: 'waveFreq',
      label: 'Wave Frequency',
      type: 'float',
      defaultValue: 8.0,
      min: 2,
      max: 30,
      step: 0.5,
      uniformName: '',
      glslDefault: '8.0',
      group: 'cymatic',
    },
    {
      id: 'waveSpeed',
      label: 'Wave Speed',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 2,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.3',
      group: 'cymatic',
    },
    {
      id: 'twinkle',
      label: 'Twinkle',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'cymatic',
    },
    {
      id: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      defaultValue: '#ff2020',
      min: 0,
      max: 1,
      step: 0.01,
      uniformName: '',
      glslDefault: 'vec3(1.0,0.125,0.125)',
      group: 'color',
    },
    {
      id: 'accentEnabled',
      label: 'Accent Dots',
      type: 'bool',
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 1,
      uniformName: '',
      glslDefault: '1.0',
      group: 'color',
    },
  ],
  glslBody: `{
  vec2 _uvc = (uv - 0.5) * vec2(aspect, 1.0);

  // Camera above origin, looking down at an angle
  // perspective=0 → steep (nearly top-down), perspective=1 → shallow (dramatic depth)
  float _tilt = 0.8 - $perspective * 0.5;
  vec3 _ro = vec3(0.0, 3.0, 0.0);
  vec3 _fwd = vec3(0.0, -_tilt, sqrt(1.0 - _tilt * _tilt));
  vec3 _rgt = vec3(1.0, 0.0, 0.0);
  vec3 _up = normalize(cross(_fwd, _rgt));
  vec3 _rd = normalize(_fwd + _uvc.x * _rgt + _uvc.y * _up);

  // Wave source positions — orbit slowly for pattern morphing
  float _morphT = t * $waveSpeed * 0.15;
  vec2 _src1 = vec2(sin(_morphT * 1.1) * 5.0, cos(_morphT * 0.9) * 5.0);
  vec2 _src2 = vec2(cos(_morphT * 0.7) * 6.0, sin(_morphT * 1.3) * 4.0);
  vec2 _dir3 = vec2(cos(_morphT * 0.5), sin(_morphT * 0.5));

  float _accum = 0.0;

  // March through 8 horizontal planes below the camera
  for (int _i = 0; _i < 8; _i++) {
    float _planeY = -float(_i) * 0.5;

    // Ray-plane intersection: skip if ray is nearly horizontal
    if (_rd.y < -0.001) {
      float _t = (_planeY - _ro.y) / _rd.y;

      if (_t > 0.0) {
        vec3 _hit = _ro + _rd * _t;
        float _dist = length(_hit - _ro);

        // Grid cell at hit point
        vec2 _gp = _hit.xz * $density;
        vec2 _cell = floor(_gp);
        vec2 _frac = fract(_gp) - 0.5;

        float _h = hash(_cell);
        float _dotDist = length(_frac);

        // Distance-scaled dot size (closer = bigger)
        float _dSize = $dotSize * 3.0 / max(_dist, 0.1);
        float _dot = 1.0 - smoothstep(_dSize * 0.5, _dSize, _dotDist);

        // Cymatic interference: 3 wave sources
        vec2 _cw = _cell / $density;
        float _w1 = sin(length(_cw - _src1) * $waveFreq - t * $waveSpeed);
        float _w2 = sin(length(_cw - _src2) * $waveFreq * 1.2 - t * $waveSpeed * 0.8);
        float _w3 = sin(dot(_cw, _dir3) * $waveFreq * 0.8 - t * $waveSpeed * 1.1);
        float _interference = (_w1 + _w2 + _w3) / 3.0;
        float _cymatic = smoothstep(-0.1, 0.3, _interference);

        // Per-dot twinkle shimmer
        float _twinklePhase = _h * 6.2832;
        float _twinkleAmt = $twinkle * 0.4;
        float _shimmer = 1.0 - _twinkleAmt + _twinkleAmt * sin(t * $twinkle * 6.0 + _twinklePhase);

        // Inverse-square distance fade
        float _fade = 3.0 / (_dist * _dist * 0.1 + 1.0);
        _fade = min(_fade, 1.0);

        _accum += _dot * _cymatic * _shimmer * _fade;
      }
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
        vec2 _gp2 = _hit2.xz * $density;
        vec2 _cell2 = floor(_gp2);

        float _isAccent = step(0.98, hash(_cell2 + vec2(73.0, 159.0)));
        float _lum = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, $accentColor * _lum * 2.5, _isAccent * step(0.05, _lum));
      }
    }
  }
}`,
};
