import { useSyncExternalStore, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────
 * MOTION TUNING STORE
 *
 * Shared state for animation tuning values. All animation
 * components read from here so DialKit sliders in the
 * Motion section affect the entire app in real time.
 * ───────────────────────────────────────────────────────── */

export interface MotionValues {
  // Section expand/collapse
  sectionVisualDuration: number;
  sectionBounce: number;

  // Effect item animations
  effectVisualDuration: number;
  effectBounce: number;
  effectInitialX: number;

  // Catalog overlay
  catalogVisualDuration: number;
  catalogBounce: number;
  catalogInitialY: number;

  // Button interactions
  hoverScale: number;
  tapScale: number;
}

const DEFAULTS: MotionValues = {
  sectionVisualDuration: 0.25,
  sectionBounce: 0.05,
  effectVisualDuration: 0.2,
  effectBounce: 0.1,
  effectInitialX: -12,
  catalogVisualDuration: 0.2,
  catalogBounce: 0.05,
  catalogInitialY: -8,
  hoverScale: 1.15,
  tapScale: 0.9,
};

let values: MotionValues = { ...DEFAULTS };
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): MotionValues {
  return values;
}

export function updateMotionValue<K extends keyof MotionValues>(key: K, value: MotionValues[K]) {
  values = { ...values, [key]: value };
  notify();
}

export function getMotionValues(): MotionValues {
  return values;
}

export function useMotionTuning() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  const update = useCallback(<K extends keyof MotionValues>(key: K, value: MotionValues[K]) => {
    updateMotionValue(key, value);
  }, []);

  return { values: current, update };
}
