import { create } from 'zustand';
import type { AppState, ActiveEffect, UniformValue } from './types';
import { generateInstanceId, equalStops } from './composer';
import { getEffect } from './effects/index';
import { getPreset } from './presets';
import { decodeShaderUrl } from './persistence';

// --- Constants ---
const AUTOSAVE_KEY = 'glint-studio-autosave';
const AUTOSAVE_INTERVAL = 10_000;
const MAX_HISTORY = 50;
const PARAM_DEBOUNCE_MS = 600;

const UNDOABLE_KEYS: (keyof AppState)[] = [
  'shaderName', 'activePresetId', 'activeEffects', 'paramValues',
  'colors', 'colorStops', 'exportFunctionName',
];

// --- Helpers ---

function snapshotUndoable(state: AppState): Partial<AppState> {
  const snap: Record<string, unknown> = {};
  for (const k of UNDOABLE_KEYS) {
    const val = state[k];
    snap[k] = typeof val === 'object' && val !== null
      ? JSON.parse(JSON.stringify(val))
      : val;
  }
  return snap as Partial<AppState>;
}

function loadAutosave(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.activeEffects)) return null;
    // Migrate legacy colorA/colorB
    if (!data.colors && data.colorA) {
      data.colors = [data.colorA, data.colorB].filter(Boolean);
      delete data.colorA;
      delete data.colorB;
    }
    return data;
  } catch {
    return null;
  }
}

function buildInitialState(): AppState {
  const defaultPreset = getPreset('glow')!;
  const defaultEffects: ActiveEffect[] = [];
  const defaultParams: Record<string, UniformValue> = {};

  for (const { blockId } of defaultPreset.effects) {
    const block = getEffect(blockId);
    if (!block) continue;
    const instanceId = generateInstanceId();
    defaultEffects.push({ instanceId, blockId, enabled: true });
    for (const param of block.params) {
      const scopedId = `${instanceId}_${param.id}`;
      const overrideKey = `${blockId}.${param.id}`;
      defaultParams[scopedId] = defaultPreset.paramOverrides[overrideKey] ?? param.defaultValue;
    }
  }

  // Apply Glow preset overrides
  for (const ae of defaultEffects) {
    if (ae.blockId === 'glow-waves') {
      defaultParams[`${ae.instanceId}_waveSpeed`] = 1.2;
    }
  }

  const state: AppState = {
    shaderName: defaultPreset.name,
    activePresetId: defaultPreset.id,
    activeEffects: defaultEffects,
    paramValues: defaultParams,
    colors: defaultPreset.colors ?? [],
    colorStops: defaultPreset.colorStops ?? equalStops((defaultPreset.colors ?? []).length),
    compiledFragmentSource: '',
    editorOpen: false,
    editorHeight: 250,
    playing: true,
    timeScale: 1,
    compileErrors: [],
    exportFunctionName: 'renderShader',
    usesTexture: false,
    vertexType: 'simple',
    exportAsync: false,
  };

  // Shared URL takes priority, then autosave
  const sharedState = decodeShaderUrl(window.location.hash);
  if (sharedState) {
    Object.assign(state, sharedState);
    window.history.replaceState(null, '', window.location.pathname);
  } else {
    const autosave = loadAutosave();
    if (autosave) {
      Object.assign(state, autosave);
    }
  }

  // Ensure colorStops is always populated and matches colors length
  if (!state.colorStops || state.colorStops.length !== state.colors.length) {
    state.colorStops = equalStops(state.colors.length);
  }

  return state;
}

// --- Store types ---

interface StoreActions {
  /** Basic setState — no history. For continuous updates like slider drag visuals. */
  set: (partial: Partial<AppState>) => void;
  /** Pushes an undo snapshot before applying. For discrete user actions. */
  setWithHistory: (partial: Partial<AppState>) => void;
  /** For parameter tweaks (sliders). Debounced — rapid changes produce one undo entry. */
  setParamChange: (partial: Partial<AppState>) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  saveAutosave: () => void;
  destroy: () => void;
}

export type GlintStore = AppState & StoreActions;

// --- Internal undo/redo stacks (not reactive — canUndo/canRedo booleans are) ---
let undoStack: Partial<AppState>[] = [];
let redoStack: Partial<AppState>[] = [];
let paramDebounceTimer: number | null = null;
let pendingParamSnapshot: Partial<AppState> | null = null;
let autosaveTimer: number | null = null;

// --- Store ---

export const useStore = create<GlintStore>()((set, get) => {
  // Start autosave interval
  autosaveTimer = window.setInterval(() => {
    get().saveAutosave();
  }, AUTOSAVE_INTERVAL);

  function flushParamDebounce(): void {
    if (pendingParamSnapshot) {
      undoStack.push(pendingParamSnapshot);
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0;
      pendingParamSnapshot = null;
      set({ canUndo: undoStack.length > 0, canRedo: false });
    }
    if (paramDebounceTimer !== null) {
      clearTimeout(paramDebounceTimer);
      paramDebounceTimer = null;
    }
  }

  function pushUndo(state: GlintStore): void {
    undoStack.push(snapshotUndoable(state));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
  }

  const initial = buildInitialState();

  return {
    ...initial,
    canUndo: false,
    canRedo: false,

    set: (partial) => set(partial),

    setWithHistory: (partial) => {
      flushParamDebounce();
      pushUndo(get());
      redoStack.length = 0;
      set({ ...partial, canUndo: true, canRedo: false });
    },

    setParamChange: (partial) => {
      if (!pendingParamSnapshot) {
        pendingParamSnapshot = snapshotUndoable(get());
      }
      set({ ...partial, canUndo: true });
      if (paramDebounceTimer !== null) clearTimeout(paramDebounceTimer);
      paramDebounceTimer = window.setTimeout(() => {
        flushParamDebounce();
      }, PARAM_DEBOUNCE_MS);
    },

    undo: () => {
      flushParamDebounce();
      const snapshot = undoStack.pop();
      if (!snapshot) return false;
      redoStack.push(snapshotUndoable(get()));
      set({
        ...snapshot,
        canUndo: undoStack.length > 0,
        canRedo: true,
      });
      return true;
    },

    redo: () => {
      const snapshot = redoStack.pop();
      if (!snapshot) return false;
      undoStack.push(snapshotUndoable(get()));
      set({
        ...snapshot,
        canUndo: true,
        canRedo: redoStack.length > 0,
      });
      return true;
    },

    saveAutosave: () => {
      try {
        const state = get();
        const data = {
          shaderName: state.shaderName,
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
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      } catch {
        // localStorage full or unavailable
      }
    },

    destroy: () => {
      if (autosaveTimer !== null) {
        clearInterval(autosaveTimer);
        autosaveTimer = null;
      }
      if (paramDebounceTimer !== null) {
        clearTimeout(paramDebounceTimer);
        paramDebounceTimer = null;
      }
      undoStack = [];
      redoStack = [];
      pendingParamSnapshot = null;
    },
  };
});

export { AUTOSAVE_KEY };
