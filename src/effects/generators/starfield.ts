import type { EffectBlock } from '../../types';

export const starfieldEffect: EffectBlock = {
  id: 'starfield',
  name: 'Starfield',
  description: 'Multi-layer parallax starfield with depth and motion streaking',
  category: 'generator',
  order: 180,
  requiredUtils: ['hash', 'noise'],
  params: [
    {
      id: 'layers',
      label: 'Layers',
      type: 'select',
      defaultValue: 6,
      min: 0,
      max: 1,
      step: 1,
      uniformName: '',
      glslDefault: '6.0',
      group: 'field',
      options: [
        { label: '4 Layers', value: 4 },
        { label: '6 Layers', value: 6 },
        { label: '8 Layers', value: 8 },
      ],
    },
    {
      id: 'density',
      label: 'Density',
      type: 'float',
      defaultValue: 15,
      min: 5,
      max: 30,
      step: 1,
      uniformName: '',
      glslDefault: '15.0',
      group: 'field',
    },
    {
      id: 'speed',
      label: 'Speed',
      type: 'float',
      defaultValue: 0.1,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.1',
      group: 'animation',
    },
    {
      id: 'streak',
      label: 'Streak',
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
      id: 'twinkle',
      label: 'Twinkle',
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
      id: 'brightness',
      label: 'Brightness',
      type: 'float',
      defaultValue: 1.5,
      min: 0.5,
      max: 3.0,
      step: 0.05,
      uniformName: '',
      glslDefault: '1.5',
      group: 'look',
    },
    {
      id: 'nebula',
      label: 'Nebula',
      type: 'float',
      defaultValue: 0.3,
      min: 0,
      max: 1.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.3',
      group: 'look',
    },
  ],
  glslBody: `{
  float _accum = 0.0;
  vec2 _ctr = (uv - 0.5) * vec2(aspect, 1.0);
  float _layers = $layers;

  // Nebula density field — large-scale noise structure
  float _neb1 = noise(_ctr * 1.5 + vec2(t * 0.01, 0.0));
  float _neb2 = noise(_ctr * 3.0 + vec2(0.0, t * 0.015) + vec2(5.2, 1.3));
  float _nebula = (_neb1 * 0.6 + _neb2 * 0.4);
  _nebula = smoothstep(0.25, 0.75, _nebula);

  // Unrolled 8-layer loop
  for (int _i = 0; _i < 8; _i++) {
    if (float(_i) >= _layers) break;

    float _depth = 1.0 + float(_i) * 0.5;
    float _layerScale = $density * _depth;
    float _layerSpeed = $speed * (1.0 / _depth);

    // Scrolling UV per layer — each drifts in a slightly different direction
    float _h0 = float(_i) * 0.37;
    vec2 _scroll = vec2(
      sin(_h0 * 5.0) * 0.3 + 0.1,
      cos(_h0 * 3.7) * 0.2 - 0.5
    ) * _layerSpeed * t;

    vec2 _suv = _ctr * _layerScale + _scroll;
    vec2 _cell = floor(_suv);
    vec2 _frac = fract(_suv) - 0.5;

    // Star properties from hash
    float _h1 = hash(_cell + float(_i) * 100.0);
    float _h2 = hash(_cell + float(_i) * 100.0 + vec2(31.0, 97.0));
    float _h3 = hash(_cell + float(_i) * 100.0 + vec2(73.0, 13.0));

    // Skip dim stars in sparse regions (nebula-driven density)
    float _densityThreshold = (1.0 - $nebula) * 0.3;
    float _localDensity = noise(vec2(_cell * 0.1) + float(_i) * 7.0);
    float _nebulaBoost = mix(1.0, _nebula * 1.5 + 0.5, $nebula);
    if (_h3 < _densityThreshold * (1.0 - _localDensity)) continue;

    // Jitter star position within cell
    vec2 _starPos = vec2(_h1 - 0.5, _h2 - 0.5) * 0.8;
    vec2 _delta = _frac - _starPos;

    // Motion streak: elongate along scroll direction
    float _streakLen = $streak * _layerSpeed * 3.0;
    vec2 _streakDir = normalize(_scroll + vec2(0.001));
    float _along = abs(dot(_delta, _streakDir));
    float _perp = abs(dot(_delta, vec2(-_streakDir.y, _streakDir.x)));
    float _starDist = sqrt(_perp * _perp + _along * _along / (1.0 + _streakLen * 10.0));

    // Star size: varies with hash and depth, big stars are rare
    float _sizeBase = mix(0.06, 0.25, _h3 * _h3);
    float _size = _sizeBase / _depth;

    // Lorentzian glow — brighter core, wider halo than Gaussian
    float _r2 = _starDist * _starDist;
    float _s2 = _size * _size * 0.015;
    float _glow = _s2 / (_r2 + _s2);

    // Twinkle
    float _phase = _h1 * 6.2832;
    float _twinkleVal = 1.0 - $twinkle * 0.5 + $twinkle * 0.5 * sin(t * (2.0 + _h2 * 4.0) + _phase);

    // Depth fade
    float _depthFade = 1.0 / (_depth * 0.5);

    _accum += _glow * _twinkleVal * _depthFade * $brightness * _nebulaBoost;
  }

  // Add subtle nebula background glow
  float _nebBg = _nebula * $nebula * 0.15;
  _accum += _nebBg;

  mixFactor = clamp(_accum, 0.0, 1.0);
}`,
};
