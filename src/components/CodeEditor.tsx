import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useStore } from '../store';

/* ─────────────────────────────────────────────────────────
 * CODE EDITOR
 *
 * Read-only CodeMirror 6 viewer for the composed GLSL source.
 * - Lifecycle managed via useEffect (create/destroy)
 * - Source updates via EditorView.dispatch (no remount)
 * - Resizable via drag handle (mousedown → mousemove)
 * - Error overlay when compile errors exist
 * ───────────────────────────────────────────────────────── */

export function CodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const compiledSource = useStore((s) => s.compiledFragmentSource);
  const compileErrors = useStore((s) => s.compileErrors);
  const editorHeight = useStore((s) => s.editorHeight);
  const set = useStore((s) => s.set);

  // --- Create / destroy CodeMirror ---
  useEffect(() => {
    const parent = editorContentRef.current;
    if (!parent) return;

    const state = EditorState.create({
      doc: useStore.getState().compiledFragmentSource,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        bracketMatching(),
        javascript(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        oneDark,
        keymap.of([...defaultKeymap]),
        EditorState.readOnly.of(true),
        EditorView.theme({
          '&': { height: '100%', fontSize: '12px' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)' },
          '.cm-content': { padding: '8px 0' },
          '.cm-gutters': { background: 'var(--bg-surface)', border: 'none' },
          '.cm-activeLineGutter': { background: 'var(--bg-hover)' },
        }),
      ],
    });

    const view = new EditorView({ state, parent });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // --- Sync source into CodeMirror when it changes ---
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === compiledSource) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: compiledSource },
    });
  }, [compiledSource]);

  // --- Drag handle for resizing ---
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = containerRef.current?.getBoundingClientRect().height ?? editorHeight;

      const onMouseMove = (me: MouseEvent) => {
        const delta = startY - me.clientY;
        const newHeight = Math.max(100, Math.min(600, startHeight + delta));
        if (containerRef.current) {
          containerRef.current.style.height = newHeight + 'px';
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        // Persist final height
        if (containerRef.current) {
          set({ editorHeight: containerRef.current.getBoundingClientRect().height });
        }
      };

      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [editorHeight, set],
  );

  return (
    <div
      ref={containerRef}
      className="editor-container"
      style={{ height: editorHeight }}
    >
      {/* Drag handle */}
      <div className="editor-drag-handle" onMouseDown={handleMouseDown} />

      {/* Header */}
      <div className="editor-header">
        <span className="editor-header-label">Composed GLSL (Read-only)</span>
      </div>

      {/* Error overlay */}
      {compileErrors.length > 0 && (
        <div
          className="preview-error"
          style={{ position: 'relative', inset: 'auto', margin: 0, borderRadius: 0 }}
        >
          {compileErrors.map((e, i) => (
            <div key={i}>{e.line ? `Line ${e.line}: ${e.message}` : e.message}</div>
          ))}
        </div>
      )}

      {/* CodeMirror mount point */}
      <div className="editor-content" ref={editorContentRef} />
    </div>
  );
}
