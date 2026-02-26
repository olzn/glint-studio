import type { EffectBlock } from '../../types';

export const voronoiEffect: EffectBlock = {
  id: 'voronoi',
  name: 'Voronoi',
  description: 'Animated cell patterns with shifting boundaries',
  category: 'generator',
  order: 115,
  requiredUtils: ['hash'],
  params: [
    {
      id: 'scale',
      label: 'Scale',
      type: 'float',
      defaultValue: 4.0,
      min: 1,
      max: 15,
      step: 0.5,
      uniformName: '',
      glslDefault: '4.0',
      group: 'voronoi',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 2,
      step: 0.05,
      uniformName: '',
      glslDefault: '0.3',
      group: 'voronoi',
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
      group: 'voronoi',
    },
    {
      id: 'edgeWidth',
      label: 'Edge Width',
      type: 'float',
      defaultValue: 0.15,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.15',
      group: 'voronoi',
    },
  ],
  glslBody: `{
  vec2 _p = st * $scale;
  vec2 _motion = vec2(sin(t * $speed * 0.7), cos(t * $speed)) * 0.5;
  _p += _motion;
  vec2 _cell = floor(_p);
  vec2 _frac = fract(_p);
  float _md = 8.0;
  float _md2 = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 _nb = vec2(float(i), float(j));
      vec2 _id = _cell + _nb;
      vec2 _pt = vec2(hash(_id), hash(_id + vec2(57.0, 113.0)));
      _pt = 0.5 + $jitter * 0.5 * sin(t * $speed * 0.5 + 6.2831 * _pt);
      float _d = length(_nb + _pt - _frac);
      if (_d < _md) { _md2 = _md; _md = _d; }
      else if (_d < _md2) { _md2 = _d; }
    }
  }
  float _edge = _md2 - _md;
  mixFactor = smoothstep(0.0, $edgeWidth, _edge);
}`,
};
