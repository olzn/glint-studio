import type { Preset } from './types';

export const blankPreset: Preset = {
  id: 'blank',
  name: 'Blank',
  description: 'Empty canvas',
  effects: [],
  paramOverrides: {},
  colors: [],
};

export const swirlPreset: Preset = {
  id: 'swirl',
  name: 'Swirl',
  description: 'Organic domain-warped noise flow',
  effects: [
    { blockId: 'domain-warp' },
    { blockId: 'brightness' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    // domain-warp params use blockId_paramId for matching
    'domain-warp.noiseScale': 0.8,
    'domain-warp.warpIntensity': 4.0,
    'domain-warp.rotation': 40,
    'domain-warp.driftSpeed1': 0.03,
    'domain-warp.driftSpeed2': 0.04,
    'domain-warp.mixLow': 0.25,
    'domain-warp.mixHigh': 0.75,
    'brightness.amount': 0.0,
    'vignette.strength': 0.0,
    'vignette.radius': 0.7,
    'film-grain.intensity': 0.08,
  },
  colors: ['#3c1ea8', '#ff7130'],
};

export const glowPreset: Preset = {
  id: 'glow',
  name: 'Glow',
  description: 'Sine-wave displacement with warm glow',
  effects: [
    { blockId: 'glow-waves' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'glow-waves.maskStart': 0.45,
    'glow-waves.waveFreq': 5.0,
    'glow-waves.waveSpeed': 0.25,
    'glow-waves.displacement': 0.30,
    'glow-waves.brightness': 0.3,
    'glow-waves.breathColor': '#1a0a00',
    'vignette.strength': 0.0,
    'vignette.radius': 0.7,
    'film-grain.intensity': 0.04,
  },
  colors: ['#432cdc', '#ff7130'],
  colorStops: [0.6, 0.9],
};

export const cellsPreset: Preset = {
  id: 'cells',
  name: 'Cells',
  description: 'Organic cell patterns with shifting boundaries',
  effects: [
    { blockId: 'voronoi' },
    { blockId: 'brightness' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'voronoi.scale': 5.0,
    'voronoi.speed': 0.25,
    'voronoi.jitter': 0.9,
    'voronoi.edgeWidth': 0.12,
    'brightness.amount': 0.05,
    'vignette.strength': 0.4,
    'vignette.radius': 0.75,
    'film-grain.intensity': 0.03,
  },
  colors: ['#0a1628', '#1e88e5', '#e0f7fa'],
};

export const neonPreset: Preset = {
  id: 'neon',
  name: 'Neon',
  description: 'Fast spiral with chromatic split and scanlines',
  effects: [
    { blockId: 'spiral' },
    { blockId: 'chromatic-aberration' },
    { blockId: 'crt-scanlines' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'spiral.arms': 2,
    'spiral.tightness': 15,
    'spiral.speed': 0.8,
    'spiral.thickness': 0.4,
    'chromatic-aberration.amount': 0.015,
    'crt-scanlines.lineWidth': 600,
    'crt-scanlines.intensity': 0.15,
    'crt-scanlines.flicker': 0.03,
    'vignette.strength': 0.5,
    'vignette.radius': 0.65,
  },
  colors: ['#0a0020', '#ff006e', '#00f5d4'],
};

export const silkPreset: Preset = {
  id: 'silk',
  name: 'Silk',
  description: 'Kaleidoscopic domain-warp mandala',
  effects: [
    { blockId: 'kaleidoscope' },
    { blockId: 'domain-warp' },
    { blockId: 'chromatic-aberration' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'kaleidoscope.segments': 6,
    'kaleidoscope.rotation': 0,
    'domain-warp.noiseScale': 0.6,
    'domain-warp.warpIntensity': 3.0,
    'domain-warp.rotation': 20,
    'domain-warp.driftSpeed1': 0.025,
    'domain-warp.driftSpeed2': 0.03,
    'domain-warp.mixLow': 0.2,
    'domain-warp.mixHigh': 0.8,
    'chromatic-aberration.amount': 0.008,
    'vignette.strength': 0.3,
    'vignette.radius': 0.8,
    'film-grain.intensity': 0.03,
  },
  colors: ['#1a0033', '#8b5cf6', '#f59e0b'],
};

export const mistPreset: Preset = {
  id: 'mist',
  name: 'Mist',
  description: 'Soft atmospheric noise layers',
  effects: [
    { blockId: 'diffuse-blur' },
    { blockId: 'noise' },
    { blockId: 'brightness' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'diffuse-blur.amount': 0.05,
    'diffuse-blur.scale': 15,
    'diffuse-blur.speed': 0.1,
    'noise.scale': 2.5,
    'noise.speed': 0.15,
    'brightness.amount': -0.05,
    'vignette.strength': 0.5,
    'vignette.radius': 0.65,
    'film-grain.intensity': 0.05,
  },
  colors: ['#0f172a', '#475569', '#94a3b8', '#e2e8f0'],
};

export const prismPreset: Preset = {
  id: 'prism',
  name: 'Prism',
  description: 'Radial rainbow wave refraction',
  effects: [
    { blockId: 'polar' },
    { blockId: 'wave' },
    { blockId: 'chromatic-aberration' },
    { blockId: 'brightness' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'polar.scale': 2.0,
    'polar.rotation': 0,
    'wave.frequency': 8.0,
    'wave.amplitude': 0.5,
    'wave.speed': 0.4,
    'wave.angle': 0,
    'chromatic-aberration.amount': 0.02,
    'brightness.amount': 0.1,
    'vignette.strength': 0.3,
    'vignette.radius': 0.8,
  },
  colors: ['#ff006e', '#fb5607', '#ffbe0b', '#3a86ff', '#8338ec'],
};

export const signalPreset: Preset = {
  id: 'signal',
  name: 'Signal',
  description: 'Scrolling noise rendered as terminal characters',
  effects: [
    { blockId: 'noise' },
    { blockId: 'ascii' },
  ],
  paramOverrides: {
    'noise.scale': 10,
    'noise.speed': 0.12,
    'ascii.charset': 3,
    'ascii.font': 1,
    'ascii.cellSize': 28,
    'ascii.threshold': 0.15,
    'ascii.intensity': 1,
    'ascii.padding': 0.12,
    'ascii.invert': 0,
  },
  colors: ['#000a00', '#22c55e'],
};

export const presets: Preset[] = [
  blankPreset, swirlPreset, glowPreset,
  cellsPreset, neonPreset, silkPreset, mistPreset, prismPreset, signalPreset,
];

export function getPreset(id: string): Preset | undefined {
  return presets.find(p => p.id === id);
}
