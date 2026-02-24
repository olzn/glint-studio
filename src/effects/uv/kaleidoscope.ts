import type { EffectBlock } from '../../types';

export const kaleidoscopeEffect: EffectBlock = {
  id: 'kaleidoscope',
  name: 'Kaleidoscope',
  description: 'N-fold radial mirror symmetry',
  category: 'uv-transform',
  order: 25,
  requiredUtils: [],
  params: [
    {
      id: 'segments',
      label: 'Segments',
      type: 'float',
      defaultValue: 6,
      min: 2,
      max: 12,
      step: 1,
      uniformName: '',
      glslDefault: '6.0',
      group: 'transform',
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
      group: 'transform',
      displayUnit: 'deg',
    },
  ],
  glslBody: `{
  vec2 _center = uv - 0.5;
  float _angle = atan(_center.y, _center.x) + $rotation * 0.01745329;
  float _dist = length(_center);
  float _seg = 6.28318 / $segments;
  _angle = mod(_angle, _seg);
  if (_angle > _seg * 0.5) { _angle = _seg - _angle; }
  uv = vec2(cos(_angle), sin(_angle)) * _dist + 0.5;
  st = uv * vec2(aspect, 1.0);
}`,
};
