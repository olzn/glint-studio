import type { SavedShader, AppState } from './types';
import { getEffect } from './effects/index';

const STORAGE_KEY = 'glint-studio-library';

// Named colors for descriptive save names
const NAMED_COLORS: Array<{ name: string; r: number; g: number; b: number }> = [
  { name: 'Red', r: 255, g: 0, b: 0 },
  { name: 'Orange', r: 255, g: 127, b: 0 },
  { name: 'Yellow', r: 255, g: 255, b: 0 },
  { name: 'Green', r: 0, g: 180, b: 0 },
  { name: 'Cyan', r: 0, g: 220, b: 220 },
  { name: 'Blue', r: 0, g: 80, b: 255 },
  { name: 'Purple', r: 128, g: 0, b: 255 },
  { name: 'Pink', r: 255, g: 100, b: 180 },
  { name: 'White', r: 255, g: 255, b: 255 },
  { name: 'Black', r: 0, g: 0, b: 0 },
  { name: 'Gray', r: 128, g: 128, b: 128 },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function nearestColorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = 'Gray';
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const dist = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = c.name;
    }
  }
  return best;
}

export function generateShaderName(state: AppState): string {
  const effects = state.activeEffects.filter(ae => ae.enabled);
  const generators = effects.filter(ae => {
    const block = getEffect(ae.blockId);
    return block && block.category === 'generator';
  });
  const postCount = effects.filter(ae => {
    const block = getEffect(ae.blockId);
    return block && block.category === 'post';
  }).length;

  // Build effect part
  let effectPart = '';
  if (generators.length === 0) {
    const uvEffects = effects.filter(ae => {
      const block = getEffect(ae.blockId);
      return block && block.category === 'uv-transform';
    });
    if (uvEffects.length > 0) {
      const block = getEffect(uvEffects[0].blockId);
      effectPart = block ? block.name : '';
    }
  } else if (generators.length === 1) {
    const block = getEffect(generators[0].blockId);
    effectPart = block ? block.name : '';
    if (postCount > 0) effectPart += ` + ${postCount} Post`;
  } else {
    const block = getEffect(generators[0].blockId);
    effectPart = block ? `${block.name} + ${generators.length - 1} more` : '';
  }

  if (!effectPart) return 'Untitled';

  // Build color part
  if (state.colors.length === 0) return effectPart;

  const colorNames = state.colors.map(nearestColorName);
  // Deduplicate adjacent same names
  const deduped = colorNames.filter((c, i) => i === 0 || c !== colorNames[i - 1]);
  const colorPart = deduped.join('-');

  return `${effectPart} · ${colorPart}`;
}

export function saveShader(state: AppState): SavedShader {
  const saved: SavedShader = {
    id: crypto.randomUUID(),
    name: state.shaderName || 'Untitled',
    savedAt: Date.now(),
    activePresetId: state.activePresetId,
    activeEffects: state.activeEffects,
    paramValues: state.paramValues,
    colors: state.colors,
    colorStops: state.colorStops,
    exportFunctionName: state.exportFunctionName,
    usesTexture: state.usesTexture,
    vertexType: state.vertexType,
    exportAsync: state.exportAsync,
  };

  const all = loadSavedShaders();
  all.push(saved);
  writeSaved(all);
  return saved;
}

export function loadSavedShaders(): SavedShader[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const shaders = JSON.parse(raw) as SavedShader[];
    // Migrate legacy colorA/colorB to colors[]
    for (const s of shaders) {
      const legacy = s as SavedShader & { colorA?: string; colorB?: string };
      if (!s.colors && legacy.colorA) {
        s.colors = [legacy.colorA, legacy.colorB].filter(Boolean) as string[];
        delete legacy.colorA;
        delete legacy.colorB;
      }
    }
    return shaders;
  } catch {
    return [];
  }
}

export function deleteSavedShader(id: string): void {
  const all = loadSavedShaders().filter(s => s.id !== id);
  writeSaved(all);
}

export function savedShaderToState(saved: SavedShader): Partial<AppState> {
  const result: Partial<AppState> = {
    activePresetId: saved.activePresetId,
    shaderName: saved.name,
    activeEffects: saved.activeEffects,
    paramValues: saved.paramValues,
    colors: saved.colors,
    exportFunctionName: saved.exportFunctionName,
    usesTexture: saved.usesTexture,
    vertexType: saved.vertexType,
    exportAsync: saved.exportAsync,
  };
  if (saved.colorStops) {
    result.colorStops = saved.colorStops;
  }
  return result;
}

export function renameSavedShader(id: string, newName: string): void {
  const all = loadSavedShaders();
  const shader = all.find(s => s.id === id);
  if (shader) {
    shader.name = newName;
    writeSaved(all);
  }
}

export function encodeShaderUrl(saved: SavedShader): string {
  const payload: Record<string, unknown> = {
    n: saved.name,
    e: saved.activeEffects,
    p: saved.paramValues,
    c: saved.colors,
  };
  // Only include stops when they differ from equal distribution
  if (saved.colorStops && saved.colorStops.length === saved.colors.length) {
    const eq = equalStopsForEncode(saved.colors.length);
    const isDefault = saved.colorStops.every((s, i) => Math.abs(s - eq[i]) < 0.001);
    if (!isDefault) {
      payload.s = saved.colorStops;
    }
  }
  return btoa(JSON.stringify(payload));
}

function equalStopsForEncode(count: number): number[] {
  if (count <= 1) return count === 1 ? [0.5] : [];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const MAX_NAME_LENGTH = 120;
const MAX_EFFECTS = 50;
const MAX_COLORS = 20;

function isValidUniformValue(v: unknown): boolean {
  if (typeof v === 'number') return isFinite(v);
  if (typeof v === 'string') return HEX_COLOR_RE.test(v);
  if (Array.isArray(v)) {
    return (v.length === 2 || v.length === 3) && v.every(n => typeof n === 'number' && isFinite(n));
  }
  return false;
}

function sanitizeActiveEffects(raw: unknown): AppState['activeEffects'] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_EFFECTS) return null;
  const result: AppState['activeEffects'] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) return null;
    const { instanceId, blockId, enabled } = item as Record<string, unknown>;
    if (typeof instanceId !== 'string' || typeof blockId !== 'string' || typeof enabled !== 'boolean') return null;
    if (!getEffect(blockId)) return null;
    result.push({ instanceId: String(instanceId), blockId: String(blockId), enabled: Boolean(enabled) });
  }
  return result;
}

function sanitizeParamValues(raw: unknown): Record<string, AppState['paramValues'][string]> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
  const result: Record<string, AppState['paramValues'][string]> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof key !== 'string') return null;
    if (!isValidUniformValue(val)) return null;
    result[key] = val as AppState['paramValues'][string];
  }
  return result;
}

function sanitizeColors(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_COLORS) return null;
  for (const c of raw) {
    if (typeof c !== 'string' || !HEX_COLOR_RE.test(c)) return null;
  }
  return raw as string[];
}

function sanitizeColorStops(raw: unknown, colorCount: number): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  if (raw.length !== colorCount) return undefined;
  for (const s of raw) {
    if (typeof s !== 'number' || !isFinite(s) || s < 0 || s > 1) return undefined;
  }
  return raw as number[];
}

export function decodeShaderUrl(hash: string): Partial<AppState> | null {
  try {
    const match = hash.match(/^#s=(.+)$/);
    if (!match) return null;
    const payload = JSON.parse(atob(match[1]));
    if (typeof payload !== 'object' || payload === null) return null;

    const activeEffects = sanitizeActiveEffects(payload.e);
    if (!activeEffects) return null;

    const paramValues = sanitizeParamValues(payload.p);
    if (!paramValues) return null;

    const colors = sanitizeColors(payload.c);
    if (!colors) return null;

    const rawName = typeof payload.n === 'string' ? payload.n : 'Shared Shader';
    const shaderName = rawName.slice(0, MAX_NAME_LENGTH);

    const result: Partial<AppState> = { shaderName, activeEffects, paramValues, colors, activePresetId: null };
    const colorStops = sanitizeColorStops(payload.s, colors.length);
    if (colorStops) {
      result.colorStops = colorStops;
    }
    return result;
  } catch {
    return null;
  }
}

function writeSaved(shaders: SavedShader[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shaders));
  } catch {
    // localStorage full
  }
}
