import type { EffectBlock } from '../types';

// Generators
import { gradientEffect } from './generators/gradient';
import { noiseEffect } from './generators/noise';
import { voronoiEffect } from './generators/voronoi';
import { causticsEffect } from './generators/caustics';
import { chladniEffect } from './generators/chladni';
import { domainWarpEffect } from './generators/domain-warp';
import { waveEffect } from './generators/wave';
import { glowWavesEffect } from './generators/glow-waves';
import { spiralEffect } from './generators/spiral';
import { ledBarsEffect } from './generators/led-bars';
import { dotLattice3dEffect } from './generators/dot-lattice-3d';
import { moireFieldsEffect } from './generators/moire-fields';
import { starfieldEffect } from './generators/starfield';
import { waveMeshEffect } from './generators/wave-mesh';
import { interferenceRingsEffect } from './generators/interference-rings';
import { hexLatticeEffect } from './generators/hex-lattice';

// Post-processing
import { brightnessEffect } from './post/brightness';
import { vignetteEffect } from './post/vignette';
import { filmGrainEffect } from './post/film-grain';
import { crtScanlinesEffect } from './post/crt-scanlines';
import { chromaticAberrationEffect } from './post/chromatic-aberration';
import { dotGridEffect } from './post/dot-grid';
import { asciiEffect } from './post/ascii';
import { ditherEffect } from './post/dither';

// UV transforms
import { pixelateEffect } from './uv/pixelate';
import { diffuseBlurEffect } from './uv/diffuse-blur';
import { kaleidoscopeEffect } from './uv/kaleidoscope';
import { polarEffect } from './uv/polar';

/** All available effect blocks, keyed by id. */
const registry = new Map<string, EffectBlock>();

const allEffects: EffectBlock[] = [
  // UV transforms
  pixelateEffect,
  diffuseBlurEffect,
  kaleidoscopeEffect,
  polarEffect,
  // Generators
  gradientEffect,
  noiseEffect,
  voronoiEffect,
  causticsEffect,
  chladniEffect,
  domainWarpEffect,
  waveEffect,
  glowWavesEffect,
  spiralEffect,
  ledBarsEffect,
  dotLattice3dEffect,
  moireFieldsEffect,
  starfieldEffect,
  waveMeshEffect,
  interferenceRingsEffect,
  hexLatticeEffect,
  // Post
  brightnessEffect,
  vignetteEffect,
  filmGrainEffect,
  crtScanlinesEffect,
  chromaticAberrationEffect,
  dotGridEffect,
  asciiEffect,
  ditherEffect,
];

for (const effect of allEffects) {
  registry.set(effect.id, effect);
}

/** Get an effect block by id. */
export function getEffect(id: string): EffectBlock | undefined {
  return registry.get(id);
}

/** Get all available effect blocks. */
export function getAllEffects(): EffectBlock[] {
  return allEffects;
}

/** Get effects grouped by category for the catalog picker UI. */
export function getEffectsByCategory(): {
  'uv-transform': EffectBlock[];
  'generator': EffectBlock[];
  'post': EffectBlock[];
} {
  return {
    'uv-transform': allEffects.filter(e => e.category === 'uv-transform'),
    'generator': allEffects.filter(e => e.category === 'generator'),
    'post': allEffects.filter(e => e.category === 'post'),
  };
}
