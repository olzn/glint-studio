import type { EffectBlock } from '../../types';

export const pixelateEffect: EffectBlock = {
  id: 'pixelate',
  name: 'Pixelate',
  description: 'Snap UV coordinates to a pixel grid',
  category: 'uv-transform',
  order: 10,
  requiredUtils: [],
  params: [
    {
      id: 'size',
      label: 'Pixel Size',
      type: 'float',
      defaultValue: 32.0,
      min: 2,
      max: 128,
      step: 1,
      uniformName: '',
      glslDefault: '32.0',
      group: 'transform',
    },
  ],
  glslBody: `{
  float _px = $size / u_resolution.x;
  float _py = $size / u_resolution.y;
  uv = vec2(floor(uv.x / _px) * _px, floor(uv.y / _py) * _py);
  st = uv * vec2(aspect, 1.0);
}`,
};
