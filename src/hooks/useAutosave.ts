import { useEffect } from 'react';
import { useStore } from '../store';

/**
 * Saves to localStorage on page unload to prevent data loss.
 * The 10s interval autosave is already running inside the Zustand store.
 */
export function useAutosave() {
  useEffect(() => {
    function handleBeforeUnload() {
      useStore.getState().saveAutosave();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
