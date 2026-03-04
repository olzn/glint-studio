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
  name: 'Gnosis',
  description: 'Sine-wave displacement with warm glow',
  effects: [
    { blockId: 'glow-waves' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'glow-waves.maskStart': 0.45,
    'glow-waves.waveFreq': 5.0,
    'glow-waves.waveSpeed': 0.25,
    'glow-waves.displacement': 0.30,
    'glow-waves.brightness': 0.3,
    'glow-waves.breathEnabled': 0,
    'glow-waves.breathColor': '#1a0a00',
    'vignette.strength': 0.0,
    'vignette.radius': 0.7,
  },
  colors: ['#432cdc', '#ff7130'],
  colorStops: [0.6, 0.9],
  palettes: [
    { id: 'default', name: 'Default', colors: ['#432cdc', '#ff7130'], colorStops: [0.6, 0.9] },
    { id: 'sunset', name: 'Sunset', colors: ['#1A1751', '#3F2ACD', '#FF8C60'], colorStops: [0.1, 0.63, 0.92] },
    { id: 'lemon', name: 'Lemon', colors: ['#07052C', '#3F2ACD', '#F5FF9A'], colorStops: [0.1, 0.63, 0.92] },
    { id: 'lime', name: 'Lime', colors: ['#07052C', '#3F2ACD', '#CBFB6C'], colorStops: [0.1, 0.63, 0.92] },
    { id: 'mint', name: 'Mint', colors: ['#07052C', '#3F2ACD', '#8CE8AB'], colorStops: [0.1, 0.63, 0.92] },
  ],
};

export const interferencePreset: Preset = {
  id: 'interference',
  name: 'Interference',
  description: 'Kaleidoscopic Chladni standing waves with rainbow fringing',
  effects: [
    { blockId: 'kaleidoscope' },
    { blockId: 'chladni' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'kaleidoscope.segments': 8,
    'kaleidoscope.rotation': 0,
    'chladni.modeA': 4.0,
    'chladni.modeB': 7.0,
    'chladni.morph': 0.12,
    'chladni.lineWidth': 0.05,
    'chladni.glow': 0.5,
    'chladni.layers': 1,
    'vignette.strength': 0.45,
    'vignette.radius': 0.65,
  },
  colors: ['#05050a', '#7c3aed', '#f472b6', '#fef3c7'],
  colorStops: [0.0, 0.3, 0.6, 1.0],
  palettes: [
    { id: 'default', name: 'Prismatic', colors: ['#05050a', '#7c3aed', '#f472b6', '#fef3c7'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'emerald', name: 'Emerald', colors: ['#021a0a', '#059669', '#6ee7b7', '#ecfdf5'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'infrared', name: 'Infrared', colors: ['#0a0005', '#dc2626', '#fb923c', '#fef9c3'], colorStops: [0.0, 0.3, 0.6, 1.0] },
  ],
};

export const lotusPreset: Preset = {
  id: 'lotus',
  name: 'Lotus',
  description: 'Kaleidoscopic Chladni patterns with spiraling petals',
  effects: [
    { blockId: 'kaleidoscope' },
    { blockId: 'chladni' },
    { blockId: 'spiral' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'kaleidoscope.segments': 8,
    'kaleidoscope.rotation': 0,
    'chladni.modeA': 4,
    'chladni.modeB': 7,
    'chladni.morph': 0.26,
    'chladni.lineWidth': 0.22,
    'chladni.glow': 0.63,
    'chladni.layers': 0,
    'spiral.arms': 10,
    'spiral.tightness': 14.03,
    'spiral.speed': 0.5,
    'spiral.lineWidth': 0.06,
    'spiral.glow': 0.4,
    'vignette.strength': 0.45,
    'vignette.radius': 0.65,
  },
  colors: ['#000012', '#17f0ff', '#1589b6', '#c7ffe3'],
  colorStops: [0.0, 0.3, 0.6, 1.0],
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

export const latticePreset: Preset = {
  id: 'lattice',
  name: 'Lattice',
  description: '3D dot grid with cymatic twinkling patterns',
  effects: [
    { blockId: 'dot-lattice-3d' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'dot-lattice-3d.density': 21,
    'dot-lattice-3d.perspective': 0.5,
    'dot-lattice-3d.dotSize': 0.12,
    'dot-lattice-3d.waveFreq': 8,
    'dot-lattice-3d.waveSpeed': 0.3,
    'dot-lattice-3d.twinkle': 0.6,
    'dot-lattice-3d.accentColor': '#ff2020',
    'dot-lattice-3d.accentEnabled': 1,
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
  },
  colors: ['#0a0a0f', '#e0e8ff'],
};

export const poolPreset: Preset = {
  id: 'pool',
  name: 'Pool',
  description: 'Dancing light refracted through rippling water',
  effects: [
    { blockId: 'caustics' },
    { blockId: 'brightness' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'caustics.scale': 5.0,
    'caustics.speed': 0.4,
    'caustics.intensity': 1.8,
    'caustics.sharpness': 10.0,
    'caustics.jitter': 0.85,
    'caustics.distortion': 0.35,
    'brightness.amount': 0.05,
    'vignette.strength': 0.35,
    'vignette.radius': 0.75,
  },
  colors: ['#051428', '#0a5e8c', '#4dd9e8', '#e0fffe'],
  colorStops: [0.0, 0.35, 0.7, 1.0],
  palettes: [
    { id: 'default', name: 'Deep Pool', colors: ['#051428', '#0a5e8c', '#4dd9e8', '#e0fffe'], colorStops: [0.0, 0.35, 0.7, 1.0] },
    { id: 'tropical', name: 'Tropical', colors: ['#022b3a', '#1a936f', '#88d498', '#f0fff0'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'sunset-pool', name: 'Sunset Pool', colors: ['#1a0a2e', '#5b2c8e', '#f4845f', '#ffd6a5'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const miragePreset: Preset = {
  id: 'mirage',
  name: 'Mirage',
  description: 'Radial caustic refraction tunnel',
  effects: [
    { blockId: 'polar' },
    { blockId: 'caustics' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'polar.scale': 1.5,
    'polar.rotation': 0,
    'caustics.scale': 6.0,
    'caustics.speed': 0.35,
    'caustics.intensity': 2.0,
    'caustics.sharpness': 12.0,
    'caustics.jitter': 0.9,
    'caustics.distortion': 0.25,
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
  },
  colors: ['#0a0010', '#6d28d9', '#f472b6', '#fdf4ff'],
  colorStops: [0.0, 0.3, 0.65, 1.0],
  palettes: [
    { id: 'default', name: 'Vortex', colors: ['#0a0010', '#6d28d9', '#f472b6', '#fdf4ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'thermal', name: 'Thermal', colors: ['#050005', '#b91c1c', '#fb923c', '#fefce8'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'arctic', name: 'Arctic', colors: ['#020617', '#1d4ed8', '#67e8f9', '#f0f9ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const warpPreset: Preset = {
  id: 'warp',
  name: 'The Warp',
  description: 'Polar-warped moiré interference tunnel',
  effects: [
    { blockId: 'polar' },
    { blockId: 'moire-fields' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'polar.scale': 2.52,
    'polar.rotation': 0,
    'moire-fields.lineCount': 40,
    'moire-fields.lineWidth': 0.07,
    'moire-fields.rotation': 66,
    'moire-fields.warp': 0.12,
    'moire-fields.drift': 0.1,
    'moire-fields.glow': 0.67,
    'vignette.strength': 0.4,
    'vignette.radius': 0.7,
  },
  colors: ['#05050f', '#713dff', '#e0e7ff'],
  colorStops: [0.0, 0.4, 1.0],
  palettes: [
    { id: 'default', name: 'Violet', colors: ['#05050f', '#713dff', '#e0e7ff'], colorStops: [0.0, 0.4, 1.0] },
    { id: 'gold', name: 'Gold', colors: ['#0a0800', '#d97706', '#fef3c7'], colorStops: [0.0, 0.4, 1.0] },
    { id: 'cyan', name: 'Cyan', colors: ['#020617', '#06b6d4', '#ecfeff'], colorStops: [0.0, 0.4, 1.0] },
  ],
};

export const starfieldPreset: Preset = {
  id: 'starfield',
  name: 'Starfield',
  description: 'Parallax star layers with motion streaking',
  effects: [
    { blockId: 'starfield' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'starfield.layers': 6,
    'starfield.density': 15,
    'starfield.speed': 0.1,
    'starfield.streak': 0.3,
    'starfield.twinkle': 0.5,
    'starfield.brightness': 1.5,
    'starfield.nebula': 0.3,
    'vignette.strength': 0.3,
    'vignette.radius': 0.75,
    'film-grain.intensity': 0.02,
  },
  colors: ['#020206', '#6366f1', '#e0e7ff', '#ffffff'],
  colorStops: [0.0, 0.3, 0.7, 1.0],
  palettes: [
    { id: 'default', name: 'Cosmos', colors: ['#020206', '#6366f1', '#e0e7ff', '#ffffff'], colorStops: [0.0, 0.3, 0.7, 1.0] },
    { id: 'nebula', name: 'Warm Nebula', colors: ['#0a0200', '#dc2626', '#fbbf24', '#fefce8'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'aurora', name: 'Aurora', colors: ['#020a05', '#059669', '#67e8f9', '#f0fdf4'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const topoPreset: Preset = {
  id: 'topo',
  name: 'Topo',
  description: 'Particle landscape with terrain contours and scan rings',
  effects: [
    { blockId: 'terrain-field' },
    { blockId: 'vignette' },
    { blockId: 'ascii' },
  ],
  paramOverrides: {
    'terrain-field.density': 37,
    'terrain-field.perspective': 0.79,
    'terrain-field.dotSize': 0.21,
    'terrain-field.elevation': 0.74,
    'terrain-field.scale': 4.37,
    'terrain-field.drift': 0.08,
    'terrain-field.ringFreq': 14,
    'terrain-field.ringWidth': 0.28,
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
    'ascii.charset': 0,
    'ascii.font': 2,
    'ascii.cellSize': 17,
    'ascii.threshold': 0.1,
    'ascii.intensity': 0.47,
    'ascii.padding': 0.42,
    'ascii.invert': 0,
  },
  colors: ['#020a0f', '#006f8e', '#c9ffc7'],
  colorStops: [0.0, 0.29, 1.0],
  palettes: [
    { id: 'default', name: 'Hologram', colors: ['#020a0f', '#006f8e', '#c9ffc7'], colorStops: [0.0, 0.29, 1.0] },
    { id: 'ocean', name: 'Bathymetry', colors: ['#020814', '#0c4a6e', '#0ea5e9', '#67e8f9', '#ecfeff'], colorStops: [0.0, 0.25, 0.5, 0.75, 1.0] },
    { id: 'infrared', name: 'Thermal', colors: ['#050005', '#7f1d1d', '#dc2626', '#fb923c', '#fefce8'], colorStops: [0.0, 0.2, 0.45, 0.7, 1.0] },
  ],
};

export const godheadPreset: Preset = {
  id: '8bit-godhead',
  name: '8-Bit Godhead',
  description: 'Pixelated kaleidoscopic Chladni pattern',
  effects: [
    { blockId: 'pixelate' },
    { blockId: 'kaleidoscope' },
    { blockId: 'chladni' },
  ],
  paramOverrides: {
    'pixelate.size': 15,
    'kaleidoscope.segments': 6,
    'kaleidoscope.rotation': 0,
    'chladni.modeA': 6.72,
    'chladni.modeB': 7.57,
    'chladni.morph': 0.45,
    'chladni.lineWidth': 0.04,
    'chladni.glow': 0.49,
    'chladni.layers': 1,
  },
  colors: ['#040210', '#6439ed', '#1fd5f0', '#e6fae9'],
  colorStops: [0.0, 0.3, 0.6, 1.0],
  palettes: [
    { id: 'default', name: 'Cosmic', colors: ['#040210', '#6439ed', '#1fd5f0', '#e6fae9'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'fire', name: 'Fire', colors: ['#0a0200', '#b91c1c', '#f97316', '#fef3c7'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'mono', name: 'Mono', colors: ['#050505', '#525252', '#d4d4d4', '#fafafa'], colorStops: [0.0, 0.3, 0.6, 1.0] },
  ],
};

export const presets: Preset[] = [
  blankPreset, swirlPreset, glowPreset,
  interferencePreset, lotusPreset, signalPreset,
  latticePreset, poolPreset, miragePreset,
  warpPreset, starfieldPreset, topoPreset,
  godheadPreset,
];

export function getPreset(id: string): Preset | undefined {
  return presets.find(p => p.id === id);
}
