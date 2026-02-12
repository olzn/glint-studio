import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { getEffect, getEffectsByCategory } from '../effects/index';
import { generateInstanceId } from '../composer';
import { SidebarSection } from './SidebarSection';
import { ParamControls } from './ParamControls';
import type { ActiveEffect, ShaderParam, UniformValue } from '../types';

/* ─────────────────────────────────────────────────────────
 * EFFECTS SECTION
 *
 * Active effects list with:
 * - Category grouping (UV Transform, Generators, Post)
 * - Per-effect expand/collapse with param controls
 * - Enable/disable toggle, remove button
 * - Drag-and-drop reorder within category
 * - "Add Effect" catalog overlay
 * ───────────────────────────────────────────────────────── */

const DRAG_HANDLE_SVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/></svg>`;

const REMOVE_SVG = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

const PLUS_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v8M2 6h8"/></svg>`;

const CLOSE_SVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

const CATEGORY_ORDER = [
  { key: 'uv-transform', label: 'UV Transform' },
  { key: 'generator', label: 'Generators' },
  { key: 'post', label: 'Post-Processing' },
] as const;

const CATEGORY_NAMES: Record<string, string> = {
  'uv-transform': 'UV Transform',
  generator: 'Generators',
  post: 'Post-Processing',
};

const ITEM_SPRING = {
  type: 'spring' as const,
  visualDuration: 0.2,
  bounce: 0.1,
};

export function EffectsSection() {
  const activeEffects = useStore((s) => s.activeEffects);
  const setWithHistory = useStore((s) => s.setWithHistory);
  const setParamChange = useStore((s) => s.setParamChange);
  const set = useStore((s) => s.set);

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [expandedEffects, setExpandedEffects] = useState<Set<string>>(new Set());

  // Track previous effects to auto-expand newly added ones
  const prevEffectIdsRef = useRef(new Set(activeEffects.map((ae) => ae.instanceId)));

  useEffect(() => {
    const prevIds = prevEffectIdsRef.current;
    const newIds = new Set<string>();
    for (const ae of activeEffects) {
      if (!prevIds.has(ae.instanceId)) {
        newIds.add(ae.instanceId);
      }
    }
    if (newIds.size > 0) {
      setExpandedEffects((prev) => {
        const next = new Set(prev);
        for (const id of newIds) next.add(id);
        return next;
      });
    }
    prevEffectIdsRef.current = new Set(activeEffects.map((ae) => ae.instanceId));
  }, [activeEffects]);

  // Extract scoped params from effect blocks (lightweight — no GLSL assembly)
  const scopedParams = useMemo(() => {
    const map = new Map<string, ShaderParam[]>();
    for (const ae of activeEffects) {
      const block = getEffect(ae.blockId);
      if (!block) continue;
      map.set(
        ae.instanceId,
        block.params.map((p) => ({
          ...p,
          id: `${ae.instanceId}_${p.id}`,
          uniformName: `u_${ae.instanceId}_${p.id}`,
        })),
      );
    }
    return map;
  }, [activeEffects]);

  // DnD state
  const [dragFrom, setDragFrom] = useState(-1);
  const [dragFromCategory, setDragFromCategory] = useState('');

  // --- Actions ---

  const handleAddEffect = useCallback(
    (blockId: string) => {
      const block = getEffect(blockId);
      if (!block) return;

      const state = useStore.getState();
      const instanceId = generateInstanceId();
      const newEffect: ActiveEffect = { instanceId, blockId, enabled: true };

      const categoryPriority: Record<string, number> = {
        'uv-transform': 0,
        generator: 1,
        post: 2,
      };
      const newPriority = categoryPriority[block.category] ?? 1;

      let insertIndex = -1;
      for (let i = state.activeEffects.length - 1; i >= 0; i--) {
        const existing = getEffect(state.activeEffects[i].blockId);
        if (existing && existing.category === block.category) {
          insertIndex = i + 1;
          break;
        }
      }
      if (insertIndex === -1) {
        insertIndex = state.activeEffects.length;
        for (let i = 0; i < state.activeEffects.length; i++) {
          const existing = getEffect(state.activeEffects[i].blockId);
          if (existing && (categoryPriority[existing.category] ?? 1) > newPriority) {
            insertIndex = i;
            break;
          }
        }
      }

      const effects = [...state.activeEffects];
      effects.splice(insertIndex, 0, newEffect);

      const pv = { ...state.paramValues };
      for (const p of block.params) {
        pv[`${instanceId}_${p.id}`] = p.defaultValue;
      }

      setWithHistory({ activeEffects: effects, paramValues: pv, activePresetId: null });
      setCatalogOpen(false);
    },
    [setWithHistory],
  );

  const handleRemoveEffect = useCallback(
    (instanceId: string) => {
      const state = useStore.getState();
      const effects = state.activeEffects.filter((ae) => ae.instanceId !== instanceId);
      const pv = { ...state.paramValues };
      for (const key of Object.keys(pv)) {
        if (key.startsWith(instanceId + '_')) delete pv[key];
      }
      setWithHistory({ activeEffects: effects, paramValues: pv, activePresetId: null });
      setExpandedEffects((prev) => {
        const next = new Set(prev);
        next.delete(instanceId);
        return next;
      });
    },
    [setWithHistory],
  );

  const handleToggleEffect = useCallback(
    (instanceId: string, enabled: boolean) => {
      const state = useStore.getState();
      const effects = state.activeEffects.map((ae) =>
        ae.instanceId === instanceId ? { ...ae, enabled } : ae,
      );
      setWithHistory({ activeEffects: effects, activePresetId: null });
    },
    [setWithHistory],
  );

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const state = useStore.getState();
      const effects = [...state.activeEffects];
      const [moved] = effects.splice(fromIndex, 1);
      const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;
      effects.splice(insertAt, 0, moved);
      setWithHistory({ activeEffects: effects, activePresetId: null });
    },
    [setWithHistory],
  );

  const handleParamChange = useCallback(
    (paramId: string, value: UniformValue) => {
      const state = useStore.getState();
      setParamChange({
        paramValues: { ...state.paramValues, [paramId]: value },
        activePresetId: null,
      });
    },
    [setParamChange],
  );

  const toggleExpanded = useCallback((instanceId: string) => {
    setExpandedEffects((prev) => {
      const next = new Set(prev);
      if (next.has(instanceId)) next.delete(instanceId);
      else next.add(instanceId);
      return next;
    });
  }, []);

  // --- Group effects by category ---
  const grouped = useMemo(() => {
    const result: Array<{
      catKey: string;
      label: string;
      effects: Array<{ ae: ActiveEffect; block: ReturnType<typeof getEffect>; flatIndex: number }>;
    }> = [];

    for (const { key, label } of CATEGORY_ORDER) {
      const items: typeof result[0]['effects'] = [];
      for (let i = 0; i < activeEffects.length; i++) {
        const block = getEffect(activeEffects[i].blockId);
        if (block && block.category === key) {
          items.push({ ae: activeEffects[i], block, flatIndex: i });
        }
      }
      if (items.length > 0) result.push({ catKey: key, label, effects: items });
    }
    return result;
  }, [activeEffects]);

  return (
    <SidebarSection title="Effects">
      <button className="btn add-effect-btn" onClick={() => setCatalogOpen((o) => !o)}>
        <span dangerouslySetInnerHTML={{ __html: PLUS_SVG }} /> Add Effect
      </button>

      {/* Effect catalog overlay */}
      <AnimatePresence>
        {catalogOpen && (
          <EffectCatalog onSelect={handleAddEffect} onClose={() => setCatalogOpen(false)} />
        )}
      </AnimatePresence>

      {/* Effects list */}
      <div className="effects-list">
        {activeEffects.length === 0 && (
          <div className="empty-state">No effects added yet</div>
        )}

        {grouped.map(({ catKey, label, effects }) => (
          <div key={catKey}>
            <div className="effect-category-header">{label}</div>

            <AnimatePresence initial={false}>
              {effects.map(({ ae, block, flatIndex }) => {
                if (!block) return null;
                const isExpanded = expandedEffects.has(ae.instanceId);

                const instanceParams = scopedParams.get(ae.instanceId) ?? [];

                return (
                  <motion.div
                    key={ae.instanceId}
                    className={`effect-item${ae.enabled ? '' : ' disabled'}`}
                    data-instance-id={ae.instanceId}
                    data-index={flatIndex}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12, height: 0 }}
                    transition={ITEM_SPRING}
                    onDragOver={(e) => {
                      e.preventDefault();
                      const itemBlock = getEffect(ae.blockId);
                      if (itemBlock && itemBlock.category !== dragFromCategory) {
                        (e as any).dataTransfer.dropEffect = 'none';
                        return;
                      }
                      (e as any).dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const itemBlock = getEffect(ae.blockId);
                      if (!itemBlock || itemBlock.category !== dragFromCategory) return;
                      const rect = (e.target as HTMLElement)
                        .closest('.effect-item')
                        ?.getBoundingClientRect();
                      let toIndex = flatIndex;
                      if (rect && (e as any).clientY >= rect.top + rect.height / 2) toIndex++;
                      if (dragFrom !== -1 && dragFrom !== toIndex) handleReorder(dragFrom, toIndex);
                      setDragFrom(-1);
                    }}
                  >
                    {/* Header */}
                    <div
                      className="effect-item-header"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.closest('.effect-toggle') ||
                          target.closest('.effect-drag-handle') ||
                          target.closest('.effect-remove-btn')
                        )
                          return;
                        toggleExpanded(ae.instanceId);
                      }}
                    >
                      <div className="effect-item-left">
                        <div
                          className="effect-drag-handle"
                          draggable
                          onDragStart={(e) => {
                            setDragFrom(flatIndex);
                            setDragFromCategory(catKey);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(flatIndex));
                          }}
                          onDragEnd={() => setDragFrom(-1)}
                          dangerouslySetInnerHTML={{ __html: DRAG_HANDLE_SVG }}
                        />
                        <input
                          type="checkbox"
                          className="effect-toggle"
                          checked={ae.enabled}
                          onChange={(e) => handleToggleEffect(ae.instanceId, e.target.checked)}
                        />
                        <span className="effect-item-name">{block.name}</span>
                      </div>
                      <div className="effect-item-right">
                        <motion.span
                          className={`effect-chevron${isExpanded ? '' : ' collapsed'}`}
                          animate={{ rotate: isExpanded ? 0 : -90 }}
                          transition={{ type: 'spring', visualDuration: 0.15, bounce: 0 }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path d="M3 4.5L6 7.5L9 4.5" />
                          </svg>
                        </motion.span>
                        <motion.button
                          className="btn btn-ghost btn-icon effect-remove-btn"
                          title="Remove effect"
                          aria-label="Remove effect"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEffect(ae.instanceId);
                          }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          dangerouslySetInnerHTML={{ __html: REMOVE_SVG }}
                        />
                      </div>
                    </div>

                    {/* Collapsible controls */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          className="effect-item-controls"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={ITEM_SPRING}
                          style={{ overflow: 'hidden' }}
                        >
                          <ParamControls
                            params={instanceParams}
                            onChange={handleParamChange}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </SidebarSection>
  );
}

// --- Effect Catalog (Add Effect overlay) ---

function EffectCatalog({
  onSelect,
  onClose,
}: {
  onSelect: (blockId: string) => void;
  onClose: () => void;
}) {
  const categories = useMemo(() => getEffectsByCategory(), []);

  return (
    <motion.div
      className="effect-catalog"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.05 }}
    >
      <div className="effect-catalog-header">
        <span>Add Effect</span>
        <button
          className="btn btn-ghost btn-icon"
          aria-label="Close catalog"
          onClick={onClose}
          dangerouslySetInnerHTML={{ __html: CLOSE_SVG }}
        />
      </div>

      {(Object.entries(categories) as [string, any[]][]).map(([cat, effects]) => {
        if (effects.length === 0) return null;
        return (
          <div key={cat}>
            <div className="effect-catalog-category">{CATEGORY_NAMES[cat] || cat}</div>
            {effects.map((effect: any) => (
              <motion.div
                key={effect.id}
                className="effect-catalog-item"
                onClick={() => onSelect(effect.id)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="effect-catalog-item-name">{effect.name}</div>
                <div className="effect-catalog-item-desc">{effect.description}</div>
              </motion.div>
            ))}
          </div>
        );
      })}
    </motion.div>
  );
}
