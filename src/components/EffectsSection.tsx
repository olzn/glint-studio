import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { useStore } from '../store';
import { getMotionValues } from '../hooks/useMotionTuning';
import { getEffect, getEffectsByCategory } from '../effects/index';
import { generateInstanceId } from '../composer';
import { SidebarSection } from './SidebarSection';
import { ParamControls } from './ParamControls';
import type { ActiveEffect, EffectBlock, ShaderParam, UniformValue } from '../types';

/* ─────────────────────────────────────────────────────────
 * EFFECTS SECTION
 *
 * Active effects list with:
 * - Category grouping (UV Transform, Generators, Post)
 * - Per-category "+" dropdown to add effects
 * - Per-effect expand/collapse with param controls
 * - Enable/disable toggle, remove button
 * - Physical drag-and-drop reorder within category (Motion Reorder)
 * ───────────────────────────────────────────────────────── */

const DRAG_HANDLE_SVG = `<svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="7" r="1.2"/><circle cx="6" cy="7" r="1.2"/><circle cx="2" cy="12" r="1.2"/><circle cx="6" cy="12" r="1.2"/></svg>`;

const REMOVE_SVG = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;

const CATEGORY_ORDER = [
  { key: 'uv-transform', label: 'UV Transform' },
  { key: 'generator', label: 'Generators' },
  { key: 'post', label: 'Post-Processing' },
] as const;

const ITEM_SPRING = {
  type: 'spring' as const,
  visualDuration: 0.2,
  bounce: 0.1,
};

export function EffectsSection() {
  const activeEffects = useStore((s) => s.activeEffects);
  const setWithHistory = useStore((s) => s.setWithHistory);
  const setParamChange = useStore((s) => s.setParamChange);

  const [openCatalogCat, setOpenCatalogCat] = useState<string | null>(null);
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

  // All available effects by category (for dropdowns)
  const allByCategory = useMemo(() => getEffectsByCategory(), []);

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
      setOpenCatalogCat(null);
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

  const handleCategoryReorder = useCallback(
    (catKey: string, newInstanceIds: string[]) => {
      const state = useStore.getState();
      const catEffects = state.activeEffects.filter((ae) => {
        const block = getEffect(ae.blockId);
        return block && block.category === catKey;
      });
      const idToEffect = new Map(catEffects.map((ae) => [ae.instanceId, ae]));
      const reorderedCat = newInstanceIds.map((id) => idToEffect.get(id)!);

      // Rebuild full array, replacing this category's slice with the new order
      const result: ActiveEffect[] = [];
      let catIdx = 0;
      for (const ae of state.activeEffects) {
        const block = getEffect(ae.blockId);
        if (block && block.category === catKey) {
          result.push(reorderedCat[catIdx++]);
        } else {
          result.push(ae);
        }
      }
      setWithHistory({ activeEffects: result, activePresetId: null });
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

  // --- Group active effects by category ---
  const activeByCategory = useMemo(() => {
    const map: Record<string, Array<{ ae: ActiveEffect; block: EffectBlock }>> = {};
    for (const { key } of CATEGORY_ORDER) map[key] = [];
    for (const ae of activeEffects) {
      const block = getEffect(ae.blockId);
      if (block && map[block.category]) {
        map[block.category].push({ ae, block });
      }
    }
    return map;
  }, [activeEffects]);

  return (
    <SidebarSection title="Effects">
      <div className="effects-list">
        {CATEGORY_ORDER.map(({ key: catKey, label }) => {
          const effects = activeByCategory[catKey] ?? [];
          const catInstanceIds = effects.map((e) => e.ae.instanceId);
          const isDropdownOpen = openCatalogCat === catKey;
          const availableEffects = allByCategory[catKey as keyof typeof allByCategory] ?? [];

          return (
            <div key={catKey}>
              <div className="effect-category-header">
                <span>{label}</span>
                <button
                  className={`category-add-btn${isDropdownOpen ? ' open' : ''}`}
                  title={`Add ${label} effect`}
                  aria-label={`Add ${label} effect`}
                  onClick={() => setOpenCatalogCat(isDropdownOpen ? null : catKey)}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 2v8M2 6h8"/></svg>
                  Add
                </button>
              </div>

              {/* Per-category dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    className="category-dropdown"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.05 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="category-dropdown-inner">
                      {availableEffects.map((effect: EffectBlock) => (
                        <motion.div
                          key={effect.id}
                          className="effect-catalog-item"
                          onClick={() => handleAddEffect(effect.id)}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                          whileTap={{ scale: getMotionValues().tapScale }}
                        >
                          <div className="effect-catalog-item-name">{effect.name}</div>
                          <div className="effect-catalog-item-desc">{effect.description}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active effects in this category */}
              {effects.length > 0 && (
                <Reorder.Group
                  axis="y"
                  values={catInstanceIds}
                  onReorder={(newIds) => handleCategoryReorder(catKey, newIds)}
                  as="div"
                  style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <AnimatePresence initial={false}>
                    {effects.map(({ ae, block }) => (
                      <EffectItem
                        key={ae.instanceId}
                        ae={ae}
                        block={block}
                        isExpanded={expandedEffects.has(ae.instanceId)}
                        instanceParams={scopedParams.get(ae.instanceId) ?? []}
                        onToggle={handleToggleEffect}
                        onRemove={handleRemoveEffect}
                        onToggleExpand={toggleExpanded}
                        onParamChange={handleParamChange}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          );
        })}
      </div>
    </SidebarSection>
  );
}

// --- Effect Item (uses Reorder.Item + useDragControls) ---

function EffectItem({
  ae,
  block,
  isExpanded,
  instanceParams,
  onToggle,
  onRemove,
  onToggleExpand,
  onParamChange,
}: {
  ae: ActiveEffect;
  block: EffectBlock;
  isExpanded: boolean;
  instanceParams: ShaderParam[];
  onToggle: (instanceId: string, enabled: boolean) => void;
  onRemove: (instanceId: string) => void;
  onToggleExpand: (instanceId: string) => void;
  onParamChange: (paramId: string, value: UniformValue) => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={ae.instanceId}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      layout="position"
      className={`effect-item${ae.enabled ? '' : ' disabled'}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      transition={ITEM_SPRING}
      whileDrag={{
        scale: 1.03,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        zIndex: 10,
      }}
      style={{ position: 'relative' }}
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
          onToggleExpand(ae.instanceId);
        }}
      >
        <div className="effect-item-left">
          <div
            className="effect-drag-handle"
            onPointerDown={(e) => dragControls.start(e)}
            dangerouslySetInnerHTML={{ __html: DRAG_HANDLE_SVG }}
          />
          <input
            type="checkbox"
            className="effect-toggle"
            checked={ae.enabled}
            onChange={(e) => onToggle(ae.instanceId, e.target.checked)}
          />
          <span className="effect-item-name">{block.name}</span>
        </div>
        <div className="effect-item-right">
          <motion.span
            className={`effect-chevron${isExpanded ? '' : ' collapsed'}`}
            layout={false}
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
            layout={false}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(ae.instanceId);
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
            initial={{ height: 0, opacity: 0, overflow: 'hidden' as const }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' as const }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' as const }}
            transition={ITEM_SPRING}
          >
            <ParamControls
              params={instanceParams}
              onChange={onParamChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
