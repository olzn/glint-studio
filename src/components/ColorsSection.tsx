import { useState, useEffect, useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, Reorder, useDragControls } from 'motion/react';
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
  const colorStops = useStore((s) => s.colorStops);
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
    const state = useStore.getState();
    const updatedStops = [...state.colorStops];
    colorIds.current.push(nextColorId.current++);

    // New color always appears on the far right of the gradient bar.
    // If an existing stop is already at the far right, nudge it left
    // to the midpoint between its left neighbor and 1.0.
    for (let i = 0; i < updatedStops.length; i++) {
      if (updatedStops[i] >= 0.99) {
        let leftNeighbor = 0;
        for (let j = 0; j < updatedStops.length; j++) {
          if (j !== i && updatedStops[j] < updatedStops[i]) {
            leftNeighbor = Math.max(leftNeighbor, updatedStops[j]);
          }
        }
        updatedStops[i] = Math.round(((leftNeighbor + 1.0) / 2) * 100) / 100;
      }
    }

    setWithHistory({
      colors: [...state.colors, '#808080'],
      colorStops: [...updatedStops, 1.0],
      activePresetId: null,
    });
  }, [setWithHistory]);

  const handleRemoveColor = useCallback(
    (index: number) => {
      const state = useStore.getState();
      colorIds.current.splice(index, 1);
      setWithHistory({
        colors: state.colors.filter((_, i) => i !== index),
        colorStops: state.colorStops.filter((_, i) => i !== index),
        activePresetId: null,
      });
    },
    [setWithHistory],
  );

  const handleReorder = useCallback(
    (newIds: number[]) => {
      const state = useStore.getState();
      const oldIds = colorIds.current;

      // Map old ID -> index so we can rebuild arrays in the new order
      const idToIndex = new Map(oldIds.map((id, i) => [id, i]));
      const newColors = newIds.map((id) => state.colors[idToIndex.get(id)!]);

      // Keep stops in place — only colors move. The gradient bar always
      // renders left-to-right in list order, so stops stay positional.
      colorIds.current = newIds;
      setWithHistory({ colors: newColors, colorStops: state.colorStops, activePresetId: null });
    },
    [setWithHistory],
  );

  const handleStopChange = useCallback(
    (index: number, value: number) => {
      const cur = useStore.getState().colorStops;
      const newStops = [...cur];
      newStops[index] = value;
      setParamChange({ colorStops: newStops, activePresetId: null });
    },
    [setParamChange],
  );

  return (
    <SidebarSection title="Colors">
      {colors.length < MAX_COLORS && (
        <button className="btn add-effect-btn" onClick={handleAddColor}>
          <span dangerouslySetInnerHTML={{ __html: PLUS_SVG }} /> Add Color
        </button>
      )}

      {colors.length >= 2 && (
        <GradientBar
          colors={colors}
          stops={colorStops}
          onStopChange={handleStopChange}
        />
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

// --- Gradient Bar with draggable stop handles ---

function GradientBar({
  colors,
  stops,
  onStopChange,
}: {
  colors: string[];
  stops: number[];
  onStopChange: (index: number, value: number) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Clean up window listeners on unmount
  useEffect(() => () => cleanupRef.current?.(), []);

  // Build CSS linear-gradient from colors + stops
  const gradientCSS = colors
    .map((c, i) => `${c} ${(stops[i] * 100).toFixed(1)}%`)
    .join(', ');

  const handlePointerDown = useCallback(
    (index: number, e: ReactPointerEvent) => {
      e.preventDefault();

      setActiveIndex(index);

      const onMove = (ev: PointerEvent) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        let t = (ev.clientX - rect.left) / rect.width;

        // Constrain between neighbors (stops are kept sorted by index)
        const curStops = useStore.getState().colorStops;
        const min = index > 0 ? curStops[index - 1] + 0.01 : 0;
        const max = index < curStops.length - 1 ? curStops[index + 1] - 0.01 : 1;
        t = Math.max(min, Math.min(max, t));

        onStopChange(index, Math.round(t * 100) / 100);
      };

      const onUp = () => {
        setActiveIndex(null);
        cleanupRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      // Tear down any previous drag (shouldn't happen, but be safe)
      cleanupRef.current?.();
      cleanupRef.current = onUp;

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [onStopChange],
  );

  return (
    <div className="gradient-bar-container">
      <div
        ref={barRef}
        className="gradient-bar"
        style={{ background: `linear-gradient(to right, ${gradientCSS})` }}
      />
      <div className="gradient-handles">
        {stops.map((stop, i) => (
          <div
            key={i}
            className={`gradient-handle${activeIndex === i ? ' active' : ''}`}
            style={{
              left: `${stop * 100}%`,
              backgroundColor: colors[i],
            }}
            onPointerDown={(e) => handlePointerDown(i, e)}
          />
        ))}
      </div>
    </div>
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

      <button
        className="btn btn-ghost btn-icon color-remove-btn"
        title="Remove color"
        aria-label="Remove color"
        onClick={() => onRemove(index)}
        dangerouslySetInnerHTML={{ __html: REMOVE_SVG }}
      />
    </Reorder.Item>
  );
}
