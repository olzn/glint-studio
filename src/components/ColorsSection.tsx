import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { useStore } from '../store';
import { SidebarSection } from './SidebarSection';

const MAX_COLORS = 5;

const DRAG_HANDLE_SVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/></svg>`;

const REMOVE_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

const PLUS_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v8M2 6h8"/></svg>`;

const ITEM_SPRING = {
  type: 'spring' as const,
  visualDuration: 0.2,
  bounce: 0.1,
};

export function ColorsSection() {
  const colors = useStore((s) => s.colors);
  const setParamChange = useStore((s) => s.setParamChange);
  const setWithHistory = useStore((s) => s.setWithHistory);

  // Stable IDs for color rows (so Reorder tracks items across reorders)
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
    (newIds: number[]) => {
      const cur = useStore.getState().colors;
      const oldIds = colorIds.current;

      // Map old ID -> index so we can rebuild the colors array in the new order
      const idToIndex = new Map(oldIds.map((id, i) => [id, i]));
      const newColors = newIds.map((id) => cur[idToIndex.get(id)!]);

      colorIds.current = newIds;
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

        <Reorder.Group
          axis="y"
          values={colorIds.current}
          onReorder={handleReorder}
          as="div"
          style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <AnimatePresence initial={false}>
            {colors.map((color, i) => (
              <ColorRow
                key={colorIds.current[i]}
                stableId={colorIds.current[i]}
                index={i}
                color={color}
                onColorChange={handleColorChange}
                onRemove={handleRemoveColor}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </div>
    </SidebarSection>
  );
}

// --- Color Row ---

function ColorRow({
  stableId,
  index,
  color,
  onColorChange,
  onRemove,
}: {
  stableId: number;
  index: number;
  color: string;
  onColorChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  const dragControls = useDragControls();
  const [hexText, setHexText] = useState(color);

  // Sync hex text when color changes from outside (undo, preset, DnD)
  useEffect(() => {
    setHexText(color);
  }, [color]);

  return (
    <Reorder.Item
      value={stableId}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      layout="position"
      className="control color-row"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={ITEM_SPRING}
      whileDrag={{
        scale: 1.03,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        zIndex: 10,
      }}
      style={{ position: 'relative' }}
    >
      {/* Drag handle */}
      <div
        className="color-drag-handle"
        onPointerDown={(e) => dragControls.start(e)}
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

      <motion.button
        className="btn btn-ghost btn-icon color-remove-btn"
        title="Remove color"
        aria-label="Remove color"
        layout={false}
        onClick={() => onRemove(index)}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        dangerouslySetInnerHTML={{ __html: REMOVE_SVG }}
      />
    </Reorder.Item>
  );
}
