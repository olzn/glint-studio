import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { getMotionValues } from '../hooks/useMotionTuning';
import { SidebarSection } from './SidebarSection';

const MAX_COLORS = 5;

const DRAG_HANDLE_SVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/></svg>`;

const REMOVE_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

const PLUS_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v8M2 6h8"/></svg>`;

export function ColorsSection() {
  const colors = useStore((s) => s.colors);
  const setParamChange = useStore((s) => s.setParamChange);
  const setWithHistory = useStore((s) => s.setWithHistory);

  // Stable IDs for color rows (so DnD reorder moves DOM nodes, not remounts)
  const nextColorId = useRef(0);
  const colorIds = useRef<number[]>(colors.map(() => nextColorId.current++));

  // Sync IDs when colors change externally (undo, preset load)
  if (colorIds.current.length < colors.length) {
    while (colorIds.current.length < colors.length) {
      colorIds.current.push(nextColorId.current++);
    }
  } else if (colorIds.current.length > colors.length) {
    colorIds.current.length = colors.length;
  }

  // DnD state
  const [dragFrom, setDragFrom] = useState(-1);
  const [dragOver, setDragOver] = useState<{ index: number; side: 'top' | 'bottom' } | null>(null);

  // Read colors from store inside callbacks to avoid stale closures and
  // unstable callback identities (colors changes on every slider drag).
  const handleColorChange = useCallback(
    (index: number, value: string) => {
      const cur = useStore.getState().colors;
      const newColors = [...cur];
      newColors[index] = value;
      setParamChange({ colors: newColors, activePresetId: null });
    },
    [setParamChange],
  );

  const handleAddColor = useCallback(() => {
    const cur = useStore.getState().colors;
    colorIds.current.push(nextColorId.current++);
    setWithHistory({ colors: [...cur, '#808080'], activePresetId: null });
  }, [setWithHistory]);

  const handleRemoveColor = useCallback(
    (index: number) => {
      const cur = useStore.getState().colors;
      colorIds.current.splice(index, 1);
      setWithHistory({
        colors: cur.filter((_, i) => i !== index),
        activePresetId: null,
      });
    },
    [setWithHistory],
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const cur = useStore.getState().colors;
      const newColors = [...cur];
      const [moved] = newColors.splice(fromIndex, 1);
      const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
      newColors.splice(insertAt, 0, moved);

      // Keep IDs in sync so React moves DOM nodes instead of remounting
      const ids = [...colorIds.current];
      const [movedId] = ids.splice(fromIndex, 1);
      ids.splice(insertAt, 0, movedId);
      colorIds.current = ids;

      setWithHistory({ colors: newColors, activePresetId: null });
    },
    [setWithHistory],
  );

  return (
    <SidebarSection title="Colors">
      {colors.length < MAX_COLORS && (
        <button className="btn add-effect-btn" onClick={handleAddColor}>
          <span dangerouslySetInnerHTML={{ __html: PLUS_SVG }} /> Add Color
        </button>
      )}

      <div className="control-group">
        {colors.length === 0 && (
          <div className="empty-state">No colors added</div>
        )}

        <AnimatePresence initial={false}>
          {colors.map((color, i) => (
            <ColorRow
              key={colorIds.current[i]}
              index={i}
              color={color}
              dragFrom={dragFrom}
              dragOver={dragOver}
              onColorChange={handleColorChange}
              onRemove={handleRemoveColor}
              onDragStart={setDragFrom}
              onDragOver={setDragOver}
              onDragEnd={() => {
                setDragFrom(-1);
                setDragOver(null);
              }}
              onDrop={(toIndex) => {
                if (dragFrom !== -1 && dragFrom !== toIndex) {
                  handleReorder(dragFrom, toIndex);
                }
                setDragFrom(-1);
                setDragOver(null);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </SidebarSection>
  );
}

// --- Color Row ---

interface ColorRowProps {
  index: number;
  color: string;
  dragFrom: number;
  dragOver: { index: number; side: 'top' | 'bottom' } | null;
  onColorChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (state: { index: number; side: 'top' | 'bottom' } | null) => void;
  onDragEnd: () => void;
  onDrop: (toIndex: number) => void;
}

const ColorRow = memo(function ColorRow({
  index,
  color,
  dragFrom,
  dragOver,
  onColorChange,
  onRemove,
  onDragStart,
  onDragOver: setDragOverState,
  onDragEnd,
  onDrop,
}: ColorRowProps) {
  const [hexText, setHexText] = useState(color);

  // Sync hex text when color changes from outside (undo, preset, DnD)
  useEffect(() => {
    setHexText(color);
  }, [color]);

  const isDragging = dragFrom === index;
  const overClass =
    dragOver?.index === index
      ? dragOver.side === 'top'
        ? ' drag-over-top'
        : ' drag-over-bottom'
      : '';

  return (
    <motion.div
      className={`control color-row${isDragging ? ' dragging' : ''}${overClass}`}
      initial={{ opacity: 0, y: getMotionValues().effectInitialX }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: getMotionValues().effectInitialX, height: 0 }}
      transition={{ type: 'spring', visualDuration: getMotionValues().effectVisualDuration, bounce: getMotionValues().effectBounce }}
      onDragOver={(e) => {
        e.preventDefault();
        (e as any).dataTransfer && ((e as any).dataTransfer.dropEffect = 'move');
        const rect = (e.target as HTMLElement).closest('.color-row')?.getBoundingClientRect();
        if (rect) {
          const midY = rect.top + rect.height / 2;
          setDragOverState({
            index,
            side: (e as any).clientY < midY ? 'top' : 'bottom',
          });
        }
      }}
      onDragLeave={() => setDragOverState(null)}
      onDrop={(e) => {
        e.preventDefault();
        const rect = (e.target as HTMLElement).closest('.color-row')?.getBoundingClientRect();
        let toIndex = index;
        if (rect && (e as any).clientY >= rect.top + rect.height / 2) {
          toIndex++;
        }
        onDrop(toIndex);
      }}
    >
      {/* Drag handle */}
      <div
        className="color-drag-handle"
        draggable
        onDragStart={(e) => {
          onDragStart(index);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(index));
        }}
        onDragEnd={onDragEnd}
        dangerouslySetInnerHTML={{ __html: DRAG_HANDLE_SVG }}
      />

      <div className="control-label">
        <span className="control-label-text">Color {index + 1}</span>
      </div>

      <div className="color-control">
        <div className="color-swatch" style={{ backgroundColor: color }}>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setHexText(e.target.value);
              onColorChange(index, e.target.value);
            }}
          />
        </div>
        <input
          type="text"
          className="color-hex-input"
          value={hexText}
          maxLength={7}
          spellCheck={false}
          onChange={(e) => {
            setHexText(e.target.value);
            let v = e.target.value.trim();
            if (!v.startsWith('#')) v = '#' + v;
            if (/^#[0-9a-fA-F]{6}$/.test(v)) {
              onColorChange(index, v);
            }
          }}
        />
      </div>

      <button
        className="btn btn-ghost btn-icon color-remove-btn"
        title="Remove color"
        aria-label="Remove color"
        onClick={() => onRemove(index)}
        dangerouslySetInnerHTML={{ __html: REMOVE_SVG }}
      />
    </motion.div>
  );
});
