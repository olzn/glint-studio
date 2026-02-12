import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { Renderer } from '../renderer';
import { compose, VERTEX_SOURCE } from '../composer';
import { syncUniforms, syncColors } from '../uniforms';
import type { ComposeResult } from '../composer';

/**
 * Manages the WebGL renderer lifecycle, shader composition/compilation,
 * and uniform syncing. Attaches to the given container ref.
 *
 * Returns a ref to the Renderer instance (for play/pause/reset/timeScale)
 * and the latest ComposeResult (for the code editor and export).
 */
export function useRenderer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const rendererRef = useRef<Renderer | null>(null);
  const composeResultRef = useRef<ComposeResult | null>(null);

  // --- Create / destroy renderer ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer(container);
    rendererRef.current = renderer;

    // Apply initial playing state
    const state = useStore.getState();
    if (!state.playing) {
      renderer.pause();
    }
    if (state.timeScale !== 1) {
      renderer.setTimeScale(state.timeScale);
    }

    // Initial compile
    compileAndSync(renderer);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Subscribe to state changes for recompilation and uniform sync ---
  useEffect(() => {
    // Track previous values to detect what changed
    let prevActiveEffects = useStore.getState().activeEffects;
    let prevColors = useStore.getState().colors;
    let prevParamValues = useStore.getState().paramValues;
    let prevColorCount = prevColors.length;

    const unsub = useStore.subscribe((state) => {
      const renderer = rendererRef.current;
      if (!renderer) return;

      const effectsChanged = state.activeEffects !== prevActiveEffects;
      const colorsChanged = state.colors !== prevColors;
      const colorCountChanged = state.colors.length !== prevColorCount;
      const paramsChanged = state.paramValues !== prevParamValues;

      // Update prev* BEFORE side effects to prevent re-entrancy.
      // compileAndSync() calls store.set() which re-triggers this subscription
      // synchronously; without this guard, effectsChanged stays true → infinite recursion.
      prevActiveEffects = state.activeEffects;
      prevColors = state.colors;
      prevParamValues = state.paramValues;
      prevColorCount = state.colors.length;

      if (effectsChanged || colorCountChanged) {
        compileAndSync(renderer);
      } else if (colorsChanged || paramsChanged) {
        const result = composeResultRef.current;
        if (result) {
          if (colorsChanged) syncColors(renderer, state.colors);
          if (paramsChanged) syncUniforms(renderer, result.params, state.paramValues);
        }
      }
    });

    return unsub;
  }, []);

  // --- Compile helper ---
  const compileAndSync = useCallback((renderer: Renderer) => {
    const state = useStore.getState();
    const result = compose(state.activeEffects, state.colors.length);
    composeResultRef.current = result;

    const errors = renderer.compile(VERTEX_SOURCE, result.glsl);

    if (errors) {
      useStore.getState().set({
        compileErrors: errors,
        compiledFragmentSource: result.glsl,
      });
    } else {
      useStore.getState().set({
        compileErrors: [],
        compiledFragmentSource: result.glsl,
      });
      syncColors(renderer, state.colors);
      syncUniforms(renderer, result.params, state.paramValues);
    }
  }, []);

  return { rendererRef, composeResultRef };
}
