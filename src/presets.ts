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
    'glow-waves.breathEnabled': 0,
    'glow-waves.breathColor': '#1a0a00',
    'vignette.strength': 0.0,
    'vignette.radius': 0.7,
    'film-grain.intensity': 0.04,
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
    { blockId: 'chromatic-aberration' },
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
    'chromatic-aberration.amount': 0.012,
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

export const gemPreset: Preset = {
  id: 'gem',
  name: 'Gem',
  description: 'Light refracting through a cut gemstone',
  effects: [
    { blockId: 'kaleidoscope' },
    { blockId: 'caustics' },
    { blockId: 'chromatic-aberration' },
    { blockId: 'vignette' },
  ],
  paramOverrides: {
    'kaleidoscope.segments': 6,
    'kaleidoscope.rotation': 0,
    'caustics.scale': 4.0,
    'caustics.speed': 0.3,
    'caustics.intensity': 2.2,
    'caustics.sharpness': 12.0,
    'caustics.jitter': 0.85,
    'caustics.distortion': 0.3,
    'chromatic-aberration.amount': 0.015,
    'vignette.strength': 0.45,
    'vignette.radius': 0.65,
  },
  colors: ['#0a0015', '#7c3aed', '#e879f9', '#fdf4ff'],
  colorStops: [0.0, 0.3, 0.65, 1.0],
  palettes: [
    { id: 'default', name: 'Amethyst', colors: ['#0a0015', '#7c3aed', '#e879f9', '#fdf4ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'ruby', name: 'Ruby', colors: ['#0a0005', '#be123c', '#fb7185', '#fff1f2'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'sapphire', name: 'Sapphire', colors: ['#000510', '#1d4ed8', '#60a5fa', '#eff6ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'emerald', name: 'Emerald', colors: ['#000a05', '#059669', '#6ee7b7', '#ecfdf5'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const deepPreset: Preset = {
  id: 'deep',
  name: 'Deep',
  description: 'Underwater infinity mirror with caustic light',
  effects: [
    { blockId: 'dot-lattice-3d' },
    { blockId: 'caustics' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'dot-lattice-3d.density': 15,
    'dot-lattice-3d.perspective': 0.6,
    'dot-lattice-3d.dotSize': 0.05,
    'dot-lattice-3d.waveFreq': 6.0,
    'dot-lattice-3d.waveSpeed': 0.2,
    'dot-lattice-3d.twinkle': 0.4,
    'dot-lattice-3d.accentEnabled': 0,
    'caustics.scale': 4.0,
    'caustics.speed': 0.3,
    'caustics.intensity': 1.2,
    'caustics.sharpness': 6.0,
    'caustics.jitter': 0.9,
    'caustics.distortion': 0.4,
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
    'film-grain.intensity': 0.03,
  },
  colors: ['#020814', '#0c4a6e', '#22d3ee', '#ecfeff'],
  colorStops: [0.0, 0.3, 0.7, 1.0],
  palettes: [
    { id: 'default', name: 'Abyss', colors: ['#020814', '#0c4a6e', '#22d3ee', '#ecfeff'], colorStops: [0.0, 0.3, 0.7, 1.0] },
    { id: 'bioluminescent', name: 'Bioluminescent', colors: ['#020a05', '#065f46', '#34d399', '#d1fae5'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'lava', name: 'Magma', colors: ['#0a0000', '#7f1d1d', '#f97316', '#fef3c7'], colorStops: [0.0, 0.25, 0.6, 1.0] },
  ],
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
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
    'film-grain.intensity': 0.04,
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
    { blockId: 'film-grain' },
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
    'film-grain.intensity': 0.02,
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
    { blockId: 'chromatic-aberration' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
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
    'chromatic-aberration.amount': 0.018,
    'vignette.strength': 0.5,
    'vignette.radius': 0.6,
    'film-grain.intensity': 0.02,
  },
  colors: ['#0a0010', '#6d28d9', '#f472b6', '#fdf4ff'],
  colorStops: [0.0, 0.3, 0.65, 1.0],
  palettes: [
    { id: 'default', name: 'Vortex', colors: ['#0a0010', '#6d28d9', '#f472b6', '#fdf4ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'thermal', name: 'Thermal', colors: ['#050005', '#b91c1c', '#fb923c', '#fefce8'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'arctic', name: 'Arctic', colors: ['#020617', '#1d4ed8', '#67e8f9', '#f0f9ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const resonancePreset: Preset = {
  id: 'resonance',
  name: 'Resonance',
  description: 'Morphing Chladni standing wave patterns',
  effects: [
    { blockId: 'chladni' },
    { blockId: 'vignette' },
    { blockId: 'film-grain' },
  ],
  paramOverrides: {
    'chladni.modeA': 5.0,
    'chladni.modeB': 3.0,
    'chladni.morph': 0.15,
    'chladni.lineWidth': 0.06,
    'chladni.glow': 0.4,
    'chladni.layers': 1,
    'vignette.strength': 0.4,
    'vignette.radius': 0.7,
    'film-grain.intensity': 0.03,
  },
  colors: ['#05050f', '#6d28d9', '#c4b5fd', '#f5f3ff'],
  colorStops: [0.0, 0.3, 0.65, 1.0],
  palettes: [
    { id: 'default', name: 'Violet Resonance', colors: ['#05050f', '#6d28d9', '#c4b5fd', '#f5f3ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
    { id: 'gold', name: 'Sacred Gold', colors: ['#0a0800', '#b45309', '#fbbf24', '#fef9c3'], colorStops: [0.0, 0.3, 0.6, 1.0] },
    { id: 'ice', name: 'Frozen', colors: ['#020617', '#0ea5e9', '#bae6fd', '#f0f9ff'], colorStops: [0.0, 0.3, 0.65, 1.0] },
  ],
};

export const presets: Preset[] = [
  blankPreset, swirlPreset, glowPreset,
  interferencePreset, gemPreset, deepPreset, signalPreset,
  latticePreset, poolPreset, miragePreset, resonancePreset,
];

export function getPreset(id: string): Preset | undefined {
  return presets.find(p => p.id === id);
}
