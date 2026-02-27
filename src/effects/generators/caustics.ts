import type { EffectBlock } from '../../types';

export const causticsEffect: EffectBlock = {
  id: 'caustics',
  name: 'Caustics',
  description: 'Swimming pool light caustics with layered Voronoi ridges',
  category: 'generator',
  order: 116,
  requiredUtils: ['hash', 'noise'],
  params: [
    {
      id: 'scale',
      label: 'Scale',
      type: 'float',
      defaultValue: 5.0,
      min: 1,
      max: 15,
      step: 0.5,
      uniformName: '',
      glslDefault: '5.0',
      group: 'caustics',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.4,
      min: 0,
      max: 2,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.4',
      group: 'caustics',
    },
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'float',
      defaultValue: 1.5,
      min: 0.5,
      max: 5.0,
      step: 0.1,
      uniformName: '',
      glslDefault: '1.5',
      group: 'caustics',
    },
    {
      id: 'sharpness',
      label: 'Sharpness',
      type: 'float',
      defaultValue: 8.0,
      min: 1,
      max: 20,
      step: 0.5,
      uniformName: '',
      glslDefault: '8.0',
      group: 'caustics',
    },
    {
      id: 'jitter',
      label: 'Jitter',
      type: 'float',
      defaultValue: 0.8,
      min: 0,
      max: 1,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.8',
      group: 'caustics',
    },
    {
      id: 'distortion',
      label: 'Distortion',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.3',
      group: 'caustics',
    },
  ],
  glslBody: `{
  // Noise-based UV distortion for organic water warping
  vec2 _cuv = st * $scale;
  vec2 _warp = vec2(
    noise(_cuv * 0.5 + vec2(t * $speed * 0.3, 0.0)),
    noise(_cuv * 0.5 + vec2(0.0, t * $speed * 0.3) + vec2(5.2, 1.3))
  );
  _cuv += (_warp - 0.5) * $distortion * 2.0;

  float _caustic = 1.0;

  // Layer 0: 1.0x scale
  {
    vec2 _p0 = _cuv;
    vec2 _motion0 = vec2(sin(t * $speed * 0.7), cos(t * $speed)) * 0.5;
    _p0 += _motion0;
    vec2 _cell0 = floor(_p0);
    vec2 _frac0 = fract(_p0);
    float _d1_0 = 8.0;
    float _d2_0 = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 _nb0 = vec2(float(i), float(j));
        vec2 _id0 = _cell0 + _nb0;
        vec2 _pt0 = vec2(hash(_id0), hash(_id0 + vec2(57.0, 113.0)));
        _pt0 = 0.5 + $jitter * 0.5 * sin(t * $speed * 0.5 + 6.2831 * _pt0);
        float _dd0 = length(_nb0 + _pt0 - _frac0);
        if (_dd0 < _d1_0) { _d2_0 = _d1_0; _d1_0 = _dd0; }
        else if (_dd0 < _d2_0) { _d2_0 = _dd0; }
      }
    }
    float _ridge0 = _d2_0 - _d1_0;
    _caustic *= 1.0 / (1.0 + pow(_ridge0 * $sharpness, 2.0));
  }

  // Layer 1: 0.7x scale, offset in space and time
  {
    vec2 _p1 = _cuv * 0.7 + vec2(3.7, 1.9);
    vec2 _motion1 = vec2(cos(t * $speed * 0.9 + 1.0), sin(t * $speed * 0.6 + 2.0)) * 0.5;
    _p1 += _motion1;
    vec2 _cell1 = floor(_p1);
    vec2 _frac1 = fract(_p1);
    float _d1_1 = 8.0;
    float _d2_1 = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 _nb1 = vec2(float(i), float(j));
        vec2 _id1 = _cell1 + _nb1;
        vec2 _pt1 = vec2(hash(_id1), hash(_id1 + vec2(57.0, 113.0)));
        _pt1 = 0.5 + $jitter * 0.5 * sin(t * $speed * 0.6 + 6.2831 * _pt1 + 1.5);
        float _dd1 = length(_nb1 + _pt1 - _frac1);
        if (_dd1 < _d1_1) { _d2_1 = _d1_1; _d1_1 = _dd1; }
        else if (_dd1 < _d2_1) { _d2_1 = _dd1; }
      }
    }
    float _ridge1 = _d2_1 - _d1_1;
    _caustic *= 1.0 / (1.0 + pow(_ridge1 * $sharpness, 2.0));
  }

  // Layer 2: 0.45x scale, different offset
  {
    vec2 _p2 = _cuv * 0.45 + vec2(7.1, 4.3);
    vec2 _motion2 = vec2(sin(t * $speed * 0.5 + 3.0), cos(t * $speed * 0.8 + 4.0)) * 0.5;
    _p2 += _motion2;
    vec2 _cell2 = floor(_p2);
    vec2 _frac2 = fract(_p2);
    float _d1_2 = 8.0;
    float _d2_2 = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 _nb2 = vec2(float(i), float(j));
        vec2 _id2 = _cell2 + _nb2;
        vec2 _pt2 = vec2(hash(_id2), hash(_id2 + vec2(57.0, 113.0)));
        _pt2 = 0.5 + $jitter * 0.5 * sin(t * $speed * 0.7 + 6.2831 * _pt2 + 3.0);
        float _dd2 = length(_nb2 + _pt2 - _frac2);
        if (_dd2 < _d1_2) { _d2_2 = _d1_2; _d1_2 = _dd2; }
        else if (_dd2 < _d2_2) { _d2_2 = _dd2; }
      }
    }
    float _ridge2 = _d2_2 - _d1_2;
    _caustic *= 1.0 / (1.0 + pow(_ridge2 * $sharpness, 2.0));
  }

  // Sqrt re-expands compressed range from multiplying 3 layers
  _caustic = pow(_caustic, 0.5) * $intensity;
  mixFactor = clamp(_caustic, 0.0, 1.0);
}`,
};
