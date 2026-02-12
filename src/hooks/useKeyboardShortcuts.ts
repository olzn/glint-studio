import { useEffect } from 'react';
import { useStore } from '../store';
import { handleSaveShader } from '../save';
import type { Renderer } from '../renderer';

/**
 * Global keyboard shortcuts — mirrors the vanilla main.ts bindings:
 *
 *   Ctrl/Cmd + Z          Undo
 *   Ctrl/Cmd + Shift + Z  Redo
 *   Ctrl/Cmd + Y          Redo
 *   Ctrl/Cmd + E          Toggle code editor
 *   Ctrl/Cmd + S          Save shader
 *   Space                 Play / Pause (when not in an input)
 */
export function useKeyboardShortcuts(rendererRef: React.RefObject<Renderer | null>) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;

      // Undo
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useStore.getState().undo();
        return;
      }

      // Redo (Ctrl+Shift+Z or Ctrl+Y)
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useStore.getState().redo();
        return;
      }
      if (mod && e.key === 'y') {
        e.preventDefault();
        useStore.getState().redo();
        return;
      }

      // Toggle code editor
      if (mod && e.key === 'e') {
        e.preventDefault();
        const { editorOpen, set } = useStore.getState();
        set({ editorOpen: !editorOpen });
        return;
      }

      // Save
      if (mod && e.key === 's') {
        e.preventDefault();
        handleSaveShader();
        return;
      }

      // Space → Play/Pause
      if (e.key === ' ') {
        const tag = document.activeElement?.tagName;
        const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
        const inEditor = document.activeElement?.closest('.cm-editor');
        if (!inInput && !inEditor) {
          e.preventDefault();
          const renderer = rendererRef.current;
          if (!renderer) return;
          const { playing, set } = useStore.getState();
          if (playing) {
            renderer.pause();
            set({ playing: false });
          } else {
            renderer.play();
            set({ playing: true });
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [rendererRef]);
}
