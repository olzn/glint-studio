import { useStore } from '../store';
import { TimeControls } from './TimeControls';
import { PresetsPanel } from './PresetsPanel';
import { ColorsSection } from './ColorsSection';
import { EffectsSection } from './EffectsSection';
import { SavedSection } from './SavedSection';
import { ExportPanel } from './ExportPanel';
import type { Renderer } from '../renderer';

interface SidebarProps {
  rendererRef?: React.RefObject<Renderer | null>;
  isMobile?: boolean;
}

export function Sidebar({ rendererRef, isMobile }: SidebarProps) {
  const shaderName = useStore((s) => s.shaderName);
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const set = useStore((s) => s.set);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  return (
    <div className="sidebar">
      {isMobile && rendererRef && (
        <div className="sidebar-toolbar">
          {/* Undo */}
          <button
            className="btn btn-ghost btn-icon"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            disabled={!canUndo}
            style={{ opacity: canUndo ? 1 : 0.3 }}
            onClick={undo}
            dangerouslySetInnerHTML={{
              __html: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h7a3 3 0 0 1 0 6H8"/><path d="M5 5L3 7l2 2"/></svg>',
            }}
          />
          {/* Redo */}
          <button
            className="btn btn-ghost btn-icon"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            disabled={!canRedo}
            style={{ opacity: canRedo ? 1 : 0.3 }}
            onClick={redo}
            dangerouslySetInnerHTML={{
              __html: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 7H4a3 3 0 0 0 0 6h2"/><path d="M9 5l2 2-2 2"/></svg>',
            }}
          />
          <div className="sidebar-toolbar-separator" />
          <TimeControls rendererRef={rendererRef} hidePlayPause />
        </div>
      )}

      {/* Shader name field */}
      <div className="sidebar-name-field">
        <label className="sidebar-name-label">Shader Name</label>
        <input
          type="text"
          className="sidebar-shader-name"
          placeholder="Shader name…"
          spellCheck={false}
          autoComplete="off"
          value={shaderName}
          onChange={(e) => set({ shaderName: e.target.value })}
          onBlur={(e) => {
            if (!e.target.value.trim()) set({ shaderName: 'Untitled' });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>

      <PresetsPanel />
      <ColorsSection />
      <EffectsSection />
      <SavedSection />
      <ExportPanel />
    </div>
  );
}
