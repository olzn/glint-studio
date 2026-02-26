import { useStore } from './store';
import { saveShader, generateShaderName } from './persistence';
import { showToast } from './components/Toast';

const GENERIC_NAMES = [
  'untitled', 'blank', 'glow', 'swirl', 'retro', 'cosmic',
  'ocean', 'halftone', 'led bars', 'plasma',
];

/**
 * Shared save logic used by Header button, SavedSection button, and Ctrl+S shortcut.
 * Auto-names generic/preset names before saving.
 */
export function handleSaveShader(): void {
  const state = useStore.getState();
  if (!state.shaderName || GENERIC_NAMES.includes(state.shaderName.toLowerCase())) {
    const autoName = generateShaderName(state);
    useStore.getState().set({ shaderName: autoName });
  }
  saveShader(useStore.getState());
  window.dispatchEvent(new Event('glint-save'));
  showToast('Shader saved');
}
