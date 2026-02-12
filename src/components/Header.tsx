import { useCallback } from 'react';
import { useStore } from '../store';
import { TimeControls } from './TimeControls';
import { handleSaveShader } from '../save';
import type { Renderer } from '../renderer';

interface HeaderProps {
  rendererRef: React.RefObject<Renderer | null>;
}

export function Header({ rendererRef }: HeaderProps) {
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const editorOpen = useStore((s) => s.editorOpen);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  const handleToggleEditor = useCallback(() => {
    const { editorOpen, set } = useStore.getState();
    set({ editorOpen: !editorOpen });
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-logo">
          <span>&#9670;</span>glint studio
        </div>
      </div>

      <div className="header-center">
        <TimeControls rendererRef={rendererRef} />
      </div>

      <div className="header-right">
        {/* Undo */}
        <button
          className="btn btn-ghost btn-icon"
          title={canUndo ? 'Undo (Ctrl+Z)' : ''}
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
          title={canRedo ? 'Redo (Ctrl+Shift+Z)' : ''}
          aria-label="Redo"
          disabled={!canRedo}
          style={{ opacity: canRedo ? 1 : 0.3 }}
          onClick={redo}
          dangerouslySetInnerHTML={{
            __html: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 7H4a3 3 0 0 0 0 6h2"/><path d="M9 5l2 2-2 2"/></svg>',
          }}
        />

        {/* Code editor toggle */}
        <button className="btn" title="Toggle code editor (Ctrl+E)" onClick={handleToggleEditor}>
          Code
        </button>

        {/* Save */}
        <button className="btn btn-primary" title="Save shader (Ctrl+S)" onClick={handleSaveShader}>
          Save
        </button>
      </div>
    </div>
  );
}
