import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import {
  loadSavedShaders,
  deleteSavedShader,
  savedShaderToState,
  renameSavedShader,
  encodeShaderUrl,
} from '../persistence';
import { handleSaveShader } from '../save';
import { SidebarSection } from './SidebarSection';
import { showToast } from './Toast';
import type { SavedShader } from '../types';

/* ─────────────────────────────────────────────────────────
 * SAVED SHADERS SECTION
 *
 * List of saved shaders with:
 * - Click to load, gradient swatch preview
 * - Inline rename (pencil icon → input)
 * - Copy share link, delete with inline confirm
 * - Keyboard navigation (Arrow Up/Down, Enter, Cmd+Backspace)
 * ───────────────────────────────────────────────────────── */

const RENAME_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z"/></svg>`;
const COPY_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="1" width="7" height="8" rx="1"/><path d="M1 4v6a1 1 0 001 1h5"/></svg>`;
const DELETE_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h8M4.5 3V2h3v1M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3"/></svg>`;
const CHECK_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 6.5l2.5 2.5 5-5"/></svg>`;
const CLOSE_SVG = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

export function SavedSection() {
  const [saved, setSaved] = useState<SavedShader[]>(loadSavedShaders);
  const setWithHistory = useStore((s) => s.setWithHistory);
  const set = useStore((s) => s.set);

  const refresh = useCallback(() => setSaved(loadSavedShaders()), []);

  // Refresh when another part of the app saves (e.g. Header button, Ctrl+S)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'glint-studio-library') refresh();
    };
    // Listen for custom event dispatched by handleSaveShader
    const onSave = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('glint-save', onSave);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('glint-save', onSave);
    };
  }, [refresh]);

  const handleSave = useCallback(() => {
    handleSaveShader();
    refresh();
  }, [refresh]);

  const handleLoad = useCallback(
    (id: string) => {
      const shader = saved.find((s) => s.id === id);
      if (!shader) return;
      const partial = savedShaderToState(shader);
      setWithHistory(partial);
    },
    [saved, setWithHistory],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteSavedShader(id);
      refresh();
    },
    [refresh],
  );

  const handleShare = useCallback(
    (id: string) => {
      const shader = saved.find((s) => s.id === id);
      if (!shader) return;
      const encoded = encodeShaderUrl(shader);
      const url = `${window.location.origin}${window.location.pathname}#s=${encoded}`;
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard');
    },
    [saved],
  );

  const handleRename = useCallback(
    (id: string, newName: string) => {
      renameSavedShader(id, newName);
      refresh();
    },
    [refresh],
  );

  const sorted = [...saved].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <SidebarSection title="Saved" defaultCollapsed>
      <button
        className="btn"
        style={{ width: '100%', marginBottom: 8 }}
        onClick={handleSave}
      >
        Save Current
      </button>

      {sorted.length === 0 && (
        <div className="empty-state">No saved shaders yet</div>
      )}

      <div className="saved-list">
        <AnimatePresence initial={false}>
          {sorted.map((shader) => (
            <SavedItem
              key={shader.id}
              shader={shader}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onShare={handleShare}
              onRename={handleRename}
            />
          ))}
        </AnimatePresence>
      </div>
    </SidebarSection>
  );
}

// --- Saved Item ---

function SavedItem({
  shader,
  onLoad,
  onDelete,
  onShare,
  onRename,
}: {
  shader: SavedShader;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gradient swatch from shader colors
  const swatchBg =
    shader.colors && shader.colors.length > 0
      ? shader.colors.length === 1
        ? shader.colors[0]
        : `linear-gradient(135deg, ${shader.colors.join(', ')})`
      : undefined;

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenaming(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const finishRename = () => {
    const newName = inputRef.current?.value.trim();
    if (newName && newName !== shader.name) {
      onRename(shader.id, newName);
    }
    setRenaming(false);
  };

  return (
    <motion.div
      className="saved-item"
      tabIndex={0}
      onClick={() => onLoad(shader.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onLoad(shader.id);
        }
        if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          onDelete(shader.id);
        }
      }}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.05 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      {/* Color swatch */}
      <div className="saved-item-swatch" style={swatchBg ? { background: swatchBg } : undefined} />

      <div className="saved-item-info">
        {renaming ? (
          <input
            ref={inputRef}
            type="text"
            className="saved-item-rename-input"
            defaultValue={shader.name}
            onClick={(e) => e.stopPropagation()}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === 'Escape') {
                setRenaming(false);
              }
            }}
          />
        ) : (
          <div className="saved-item-name">{shader.name}</div>
        )}
        <div className="saved-item-date">{formatDate(shader.savedAt)}</div>
      </div>

      {/* Actions */}
      <div className="saved-item-actions">
        {confirming ? (
          <div className="inline-confirm">
            <span className="inline-confirm-label">Delete?</span>
            <motion.button
              className="btn btn-ghost btn-icon inline-confirm-yes"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(shader.id);
              }}
              whileTap={{ scale: 0.85 }}
              dangerouslySetInnerHTML={{ __html: CHECK_SVG }}
            />
            <motion.button
              className="btn btn-ghost btn-icon inline-confirm-no"
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(false);
              }}
              whileTap={{ scale: 0.85 }}
              dangerouslySetInnerHTML={{ __html: CLOSE_SVG }}
            />
          </div>
        ) : (
          <>
            <motion.button
              className="btn btn-ghost btn-icon"
              title="Rename"
              aria-label="Rename"
              onClick={startRename}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              dangerouslySetInnerHTML={{ __html: RENAME_SVG }}
            />
            <motion.button
              className="btn btn-ghost btn-icon"
              title="Copy share link"
              aria-label="Copy share link"
              onClick={(e) => {
                e.stopPropagation();
                onShare(shader.id);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              dangerouslySetInnerHTML={{ __html: COPY_SVG }}
            />
            <motion.button
              className="btn btn-ghost btn-icon"
              title="Delete"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(true);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              dangerouslySetInnerHTML={{ __html: DELETE_SVG }}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}
