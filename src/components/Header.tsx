import { useCallback } from 'react';
import { useStore } from '../store';
import { TimeControls } from './TimeControls';
import { PlayPauseButton } from './PlayPauseButton';
import { handleSaveShader } from '../save';
import type { Renderer } from '../renderer';

interface HeaderProps {
  rendererRef: React.RefObject<Renderer | null>;
  isMobile?: boolean;
}

export function Header({ rendererRef, isMobile }: HeaderProps) {
  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  const handleToggleEditor = useCallback(() => {
    const { editorOpen, set } = useStore.getState();
    set({ editorOpen: !editorOpen });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    const { sidebarOpen, set } = useStore.getState();
    set({ sidebarOpen: !sidebarOpen });
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <button
          className="btn btn-ghost btn-icon sidebar-toggle"
          title={sidebarOpen ? 'Hide sidebar (Ctrl+B)' : 'Show sidebar (Ctrl+B)'}
          aria-label="Toggle sidebar"
          onClick={handleToggleSidebar}
          dangerouslySetInnerHTML={{
            __html: sidebarOpen
              ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="14" height="12" rx="2"/><line x1="6" y1="2" x2="6" y2="14"/></svg>'
              : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="14" height="12" rx="2"/><line x1="6" y1="2" x2="6" y2="14" stroke-dasharray="2 2"/></svg>',
          }}
        />
        <div className="header-logo">
          <span>&#9670;</span>{!isMobile && <>glint studio</>}
        </div>
      </div>

      {!isMobile && (
        <div className="header-center">
          <TimeControls rendererRef={rendererRef} />
        </div>
      )}

      <div className="header-right">
        {!isMobile && (
          <>
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
          </>
        )}

        {isMobile && <PlayPauseButton rendererRef={rendererRef} />}

        {/* Save — always visible */}
        <button className="btn btn-primary" title="Save shader (Ctrl+S)" onClick={handleSaveShader}>
          Save
        </button>
      </div>
    </div>
  );
}
