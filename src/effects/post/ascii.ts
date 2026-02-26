import type { EffectBlock } from '../../types';

// 4x5 bitmap font encoding.
// Each character is a 20-bit value packed into a float (requires highp).
// Rows are top-to-bottom, columns left-to-right.
// Encoding: r0*65536 + r1*4096 + r2*256 + r3*16 + r4
// where each row is 4 bits (0-15), bit 3 = leftmost pixel.
//
//  0: .##.  1: .#..  2: .##.  3: ####  4: #..#
//     #..#     ##..     #..#     ...#     #..#
//     #..#     .#..     ..#.     .##.     ####
//     #..#     .#..     .#..     ...#     ...#
//     .##.     ####     ####     ####     ...#
//
//  5: ####  6: .##.  7: ####  8: .##.  9: .##.
//     #...     #...     ...#     #..#     #..#
//     ###.     ###.     ..#.     .##.     .###
//     ...#     #..#     .#..     #..#     ...#
//     ###.     .##.     .#..     .##.     .##.
//
//  A: .##.  E: ####  F: ####  H: #..#  L: #...
//     #..#     #...     #...     #..#     #...
//     ####     ###.     ###.     ####     #...
//     #..#     #...     #...     #..#     #...
//     #..#     ####     #...     #..#     ####
//
//  N: #..#  P: ###.  S: .###  T: ####  X: #..#
//     ##.#     #..#     #...     .#..     #..#
//     ####     ###.     .##.     .#..     .##.
//     #.##     #...     ...#     .#..     #..#
//     #..#     #...     ###.     .#..     #..#
//
//  Z: ####  +: ....  #: .#.#  *: #..#  !: .##.
//     ...#     .#..     ####     .##.     .##.
//     .##.     ####     .#.#     ####     .##.
//     #...     .#..     ####     .##.     ....
//     ####     ....     .#.#     #..#     .##.

export const asciiEffect: EffectBlock = {
  id: 'ascii',
  name: 'ASCII',
  description: 'ASCII-art appearance with bitmap characters',
  category: 'post',
  order: 260,
  requiredUtils: [],
  params: [
    {
      id: 'charset',
      label: 'Charset',
      type: 'select',
      defaultValue: 3,
      options: [
        { label: 'Standard', value: 0 },
        { label: 'Blocks', value: 1 },
        { label: 'Binary', value: 2 },
        { label: 'Detailed', value: 3 },
        { label: 'Minimal', value: 4 },
        { label: 'Alphabetic', value: 5 },
        { label: 'Numeric', value: 6 },
        { label: 'Math', value: 7 },
        { label: 'Symbols', value: 8 },
      ],
      uniformName: '',
      glslDefault: '3.0',
      group: 'effects',
    },
    {
      id: 'font',
      label: 'Font',
      type: 'select',
      defaultValue: 0,
      options: [
        { label: 'Pixel', value: 0 },
        { label: 'Round', value: 1 },
        { label: 'Dot Matrix', value: 2 },
        { label: 'Bold', value: 3 },
        { label: 'Outline', value: 4 },
      ],
      uniformName: '',
      glslDefault: '0.0',
      group: 'effects',
    },
    {
      id: 'cellSize',
      label: 'Cell Size',
      type: 'float',
      defaultValue: 24,
      min: 8,
      max: 64,
      step: 1,
      uniformName: '',
      glslDefault: '14.0',
      group: 'effects',
    },
    {
      id: 'threshold',
      label: 'Threshold',
      type: 'float',
      defaultValue: 0.1,
      min: 0,
      max: 0.5,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.1',
      group: 'effects',
    },
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'float',
      defaultValue: 1.0,
      min: 0,
      max: 1,
      step: 0.05,
      uniformName: '',
      glslDefault: '1.0',
      group: 'effects',
    },
    {
      id: 'padding',
      label: 'Padding',
      type: 'float',
      defaultValue: 0.1,
      min: 0,
      max: 2.0,
      step: 0.01,
      uniformName: '',
      glslDefault: '0.1',
      group: 'effects',
    },
    {
      id: 'invert',
      label: 'Invert',
      type: 'bool',
      defaultValue: 0,
      uniformName: '',
      glslDefault: '0.0',
      group: 'effects',
    },
  ],
  glslBody: `{
  float _cs = $cellSize;
  // Gap in pixels, proportional to cell size — character always renders at _cs pixels
  float _gap = $padding * _cs;
  float _totalCs = _cs + _gap;
  vec2 _cell = floor(gl_FragCoord.xy / _totalCs);
  vec2 _cellPx = mod(gl_FragCoord.xy, _totalCs);

  // Character is centered; gap pixels surround it
  float _halfGap = _gap * 0.5;
  float _inChar = step(_halfGap, _cellPx.x) * step(_halfGap, _cellPx.y)
                * step(_cellPx.x, _halfGap + _cs) * step(_cellPx.y, _halfGap + _cs);
  // Map character pixels to 0-1 (exactly _cs pixels → 0-1, size never changes)
  vec2 _innerUv = clamp((_cellPx - _halfGap) / _cs, 0.0, 1.0);

  vec2 _cuv = _innerUv - 0.5;
  float _luma = dot(color, vec3(0.299, 0.587, 0.114));
  float _cset = $charset;
  float _char = 0.0;

  if (_cset < 0.5) {
    // Standard: luminance thresholds pick progressively denser shapes
    float _c = length(_cuv);
    float _d = max(abs(_cuv.x), abs(_cuv.y));
    _char = max(_char, step(0.1, _luma) * (1.0 - smoothstep(0.0, 0.12, _c)));
    _char = max(_char, step(0.3, _luma) * (1.0 - smoothstep(0.06, 0.08, abs(_cuv.y))) * (1.0 - smoothstep(0.2, 0.25, abs(_cuv.x))));
    float _cross = min(1.0 - smoothstep(0.06, 0.08, abs(_cuv.x)), 1.0) + min(1.0 - smoothstep(0.06, 0.08, abs(_cuv.y)), 1.0);
    _char = max(_char, step(0.5, _luma) * clamp(_cross, 0.0, 1.0));
    _char = max(_char, step(0.75, _luma) * (1.0 - smoothstep(0.35, 0.4, _d)));
  } else if (_cset < 1.5) {
    // Blocks: filled rectangles sized by luminance
    float _sz = _luma * 0.9 + 0.1;
    _char = step(abs(_cuv.x), _sz * 0.5) * step(abs(_cuv.y), _sz * 0.5);
    _char *= step($threshold, _luma);
  } else if (_cset > 3.5 && _cset < 4.5) {
    // Minimal: circles sized by luminance
    float _r = _luma * 0.4;
    _char = 1.0 - smoothstep(_r - 0.05, _r, length(_cuv));
    _char *= step($threshold, _luma);
  } else {
    // Bitmap character modes
    float _ci = 0.0;
    float _seed = fract(sin(dot(_cell, vec2(43.37, 17.89))) * 12345.6789);
    float _ts = floor(t * 3.0 + _seed * 3.0);
    float _h = fract(sin(dot(_cell + vec2(_ts * 0.37, _ts * 0.73), vec2(127.1, 311.7))) * 43758.5453);

    if (_cset < 2.5) {
      // Binary: random 0 or 1
      _ci = step(0.5, _h);
    } else if (_cset < 3.5) {
      // Detailed: density-ordered characters mapped to luminance bands
      // Ordered sparse→dense: 1 ! + L T S X A N #
      float _band = floor(clamp(_luma * 1.2, 0.0, 0.999) * 10.0);
      if      (_band < 1.0)  _ci = 1.0;   // 1 (lightest)
      else if (_band < 2.0)  _ci = 24.0;  // !
      else if (_band < 3.0)  _ci = 21.0;  // +
      else if (_band < 4.0)  _ci = 14.0;  // L
      else if (_band < 5.0)  _ci = 18.0;  // T
      else if (_band < 6.0)  _ci = 17.0;  // S
      else if (_band < 7.0)  _ci = 19.0;  // X
      else if (_band < 8.0)  _ci = 10.0;  // A
      else if (_band < 9.0)  _ci = 15.0;  // N
      else                    _ci = 22.0;  // # (heaviest)
    } else if (_cset < 5.5) {
      // Alphabetic: random cycling letters (A E F H L N P S T X Z)
      _ci = floor(_h * 11.0) + 10.0;
    } else if (_cset < 6.5) {
      // Numeric: random cycling digits (0-9)
      _ci = floor(_h * 10.0);
    } else if (_cset < 7.5) {
      // Math: digits + symbols mixed
      float _pick = floor(_h * 14.0);
      _ci = mix(_pick, _pick - 10.0 + 21.0, step(10.0, _pick));
    } else {
      // Symbols: + # * !
      _ci = floor(_h * 4.0) + 21.0;
    }

    // Character bitmaps (4x5, encoded as 20-bit highp floats)
    // 0-9, A E F H L N P S T X Z, + # * !
    highp float _bm = 432534.0;
    if      (_ci < 1.0)  _bm = 432534.0;
    else if (_ci < 2.0)  _bm = 312399.0;
    else if (_ci < 3.0)  _bm = 430671.0;
    else if (_ci < 4.0)  _bm = 988703.0;
    else if (_ci < 5.0)  _bm = 630545.0;
    else if (_ci < 6.0)  _bm = 1019422.0;
    else if (_ci < 7.0)  _bm = 429718.0;
    else if (_ci < 8.0)  _bm = 987716.0;
    else if (_ci < 9.0)  _bm = 431766.0;
    else if (_ci < 10.0) _bm = 431894.0;
    else if (_ci < 11.0) _bm = 434073.0;
    else if (_ci < 12.0) _bm = 1019535.0;
    else if (_ci < 13.0) _bm = 1019528.0;
    else if (_ci < 14.0) _bm = 630681.0;
    else if (_ci < 15.0) _bm = 559247.0;
    else if (_ci < 16.0) _bm = 647097.0;
    else if (_ci < 17.0) _bm = 958088.0;
    else if (_ci < 18.0) _bm = 493086.0;
    else if (_ci < 19.0) _bm = 1000516.0;
    else if (_ci < 20.0) _bm = 628377.0;
    else if (_ci < 21.0) _bm = 988815.0;
    else if (_ci < 22.0) _bm = 20288.0;
    else if (_ci < 23.0) _bm = 390645.0;
    else if (_ci < 24.0) _bm = 618345.0;
    else                  _bm = 419334.0;

    // Decode pixel from bitmap using padded inner UV
    float _col = min(floor(_innerUv.x * 4.0), 3.0);
    float _row = min(floor((1.0 - _innerUv.y) * 5.0), 4.0);
    highp float _bi = (4.0 - _row) * 4.0 + (3.0 - _col);
    float _bit = step(0.5, mod(floor(_bm / exp2(_bi)), 2.0));
    vec2 _pf = fract(vec2(_innerUv.x * 4.0, (1.0 - _innerUv.y) * 5.0));
    float _font = $font;

    if (_font < 0.5) {
      // Pixel: sharp bitmap
      _char = _bit;
    } else if (_font < 1.5) {
      // Round: anti-aliased edges
      float _ex = smoothstep(0.0, 0.2, _pf.x) * smoothstep(0.0, 0.2, 1.0 - _pf.x);
      float _ey = smoothstep(0.0, 0.2, _pf.y) * smoothstep(0.0, 0.2, 1.0 - _pf.y);
      _char = _bit * _ex * _ey;
    } else if (_font < 2.5) {
      // Dot Matrix: circles at each on-pixel
      _char = _bit * (1.0 - smoothstep(0.3, 0.45, length(_pf - 0.5)));
    } else if (_font < 3.5) {
      // Bold: dilate — on if current or any neighbor is on
      float _lc = max(_col - 1.0, 0.0);
      float _rc = min(_col + 1.0, 3.0);
      float _ur = max(_row - 1.0, 0.0);
      float _dr = min(_row + 1.0, 4.0);
      _char = max(_bit, max(
        max(step(0.5, mod(floor(_bm / exp2((4.0 - _row) * 4.0 + (3.0 - _lc))), 2.0)),
            step(0.5, mod(floor(_bm / exp2((4.0 - _row) * 4.0 + (3.0 - _rc))), 2.0))),
        max(step(0.5, mod(floor(_bm / exp2((4.0 - _ur) * 4.0 + (3.0 - _col))), 2.0)),
            step(0.5, mod(floor(_bm / exp2((4.0 - _dr) * 4.0 + (3.0 - _col))), 2.0)))
      ));
    } else {
      // Outline: on if current is on and at least one neighbor is off
      float _lc = max(_col - 1.0, 0.0);
      float _rc = min(_col + 1.0, 3.0);
      float _ur = max(_row - 1.0, 0.0);
      float _dr = min(_row + 1.0, 4.0);
      float _nb = step(0.5, mod(floor(_bm / exp2((4.0 - _row) * 4.0 + (3.0 - _lc))), 2.0))
               * step(0.5, mod(floor(_bm / exp2((4.0 - _row) * 4.0 + (3.0 - _rc))), 2.0))
               * step(0.5, mod(floor(_bm / exp2((4.0 - _ur) * 4.0 + (3.0 - _col))), 2.0))
               * step(0.5, mod(floor(_bm / exp2((4.0 - _dr) * 4.0 + (3.0 - _col))), 2.0));
      _char = _bit * (1.0 - _nb);
    }

    _char *= step($threshold, _luma);
  }

  // Kill character in gutter zone
  _char *= _inChar;

  if ($invert > 0.5) { _char = 1.0 - _char; }

  // Terminal compositing: all visible characters at uniform high brightness on black.
  // Image content is encoded by character PRESENCE (lit vs black cells), not brightness.
  vec3 _hue = color / max(_luma, 0.001);
  vec3 _charColor = min(_hue * 0.65, vec3(1.0));
  color = mix(color, _charColor * _char, $intensity);
}`,
};
