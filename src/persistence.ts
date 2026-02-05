import type { SavedShader, AppState } from './types';

const STORAGE_KEY = 'shader-tool-library';

export function saveShader(state: AppState): SavedShader {
  const saved: SavedShader = {
    id: crypto.randomUUID(),
    name: state.shaderName || 'Untitled',
    savedAt: Date.now(),
    activePresetId: state.activePresetId,
    activeEffects: state.activeEffects,
    paramValues: state.paramValues,
    colorA: state.colorA,
    colorB: state.colorB,
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
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteSavedShader(id: string): void {
  const all = loadSavedShaders().filter(s => s.id !== id);
  writeSaved(all);
}

export function savedShaderToState(saved: SavedShader): Partial<AppState> {
  return {
    activePresetId: saved.activePresetId,
    shaderName: saved.name,
    activeEffects: saved.activeEffects,
    paramValues: saved.paramValues,
    colorA: saved.colorA,
    colorB: saved.colorB,
    exportFunctionName: saved.exportFunctionName,
    usesTexture: saved.usesTexture,
    vertexType: saved.vertexType,
    exportAsync: saved.exportAsync,
  };
}

function writeSaved(shaders: SavedShader[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shaders));
  } catch {
    // localStorage full
  }
}
