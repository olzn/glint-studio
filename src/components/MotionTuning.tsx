import { useState, useCallback } from 'react';
import { Slider, Folder, SpringVisualization } from 'dialkit';
import { SidebarSection } from './SidebarSection';
import { useMotionTuning } from '../hooks/useMotionTuning';

/* ─────────────────────────────────────────────────────────
 * MOTION TUNING
 *
 * Inline DialKit controls for tuning animation values:
 * - Section spring (expand/collapse)
 * - Effect item spring + entrance offset
 * - Button hover/tap scales
 * - Catalog overlay spring
 * ───────────────────────────────────────────────────────── */

export function MotionTuning() {
  const { values, update } = useMotionTuning();

  return (
    <SidebarSection title="Motion" defaultCollapsed>
      <div className="dialkit-root dialkit-param-controls">
        <Folder title="Section Spring" defaultOpen={false}>
          <SpringEditor
            visualDuration={values.sectionVisualDuration}
            bounce={values.sectionBounce}
            onDurationChange={(v) => update('sectionVisualDuration', v)}
            onBounceChange={(v) => update('sectionBounce', v)}
          />
        </Folder>

        <Folder title="Effect Items" defaultOpen={false}>
          <SpringEditor
            visualDuration={values.effectVisualDuration}
            bounce={values.effectBounce}
            onDurationChange={(v) => update('effectVisualDuration', v)}
            onBounceChange={(v) => update('effectBounce', v)}
          />
          <Slider
            label="Entrance Offset X"
            value={values.effectInitialX}
            onChange={(v) => update('effectInitialX', v)}
            min={-50}
            max={0}
            step={1}
          />
        </Folder>

        <Folder title="Catalog Overlay" defaultOpen={false}>
          <SpringEditor
            visualDuration={values.catalogVisualDuration}
            bounce={values.catalogBounce}
            onDurationChange={(v) => update('catalogVisualDuration', v)}
            onBounceChange={(v) => update('catalogBounce', v)}
          />
          <Slider
            label="Entrance Offset Y"
            value={values.catalogInitialY}
            onChange={(v) => update('catalogInitialY', v)}
            min={-30}
            max={0}
            step={1}
          />
        </Folder>

        <Folder title="Buttons" defaultOpen={false}>
          <Slider
            label="Hover Scale"
            value={values.hoverScale}
            onChange={(v) => update('hoverScale', v)}
            min={1}
            max={1.5}
            step={0.01}
          />
          <Slider
            label="Tap Scale"
            value={values.tapScale}
            onChange={(v) => update('tapScale', v)}
            min={0.5}
            max={1}
            step={0.01}
          />
        </Folder>
      </div>
    </SidebarSection>
  );
}

// --- Spring Editor (inline visualDuration + bounce sliders with preview) ---

function SpringEditor({
  visualDuration,
  bounce,
  onDurationChange,
  onBounceChange,
}: {
  visualDuration: number;
  bounce: number;
  onDurationChange: (v: number) => void;
  onBounceChange: (v: number) => void;
}) {
  const spring = { type: 'spring' as const, visualDuration, bounce };

  return (
    <>
      <SpringVisualization spring={spring} isSimpleMode={true} />
      <Slider
        label="Duration"
        value={visualDuration}
        onChange={onDurationChange}
        min={0.05}
        max={1}
        step={0.01}
      />
      <Slider
        label="Bounce"
        value={bounce}
        onChange={onBounceChange}
        min={0}
        max={0.5}
        step={0.01}
      />
    </>
  );
}
