import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { presets, getPreset } from '../presets';
import { getEffect } from '../effects/index';
import { generateInstanceId } from '../composer';
import { renderPresetThumbnail } from '../ui/preset-thumbnail';
import { SidebarSection } from './SidebarSection';
import type { ActiveEffect, UniformValue } from '../types';

export function PresetsPanel() {
  const activePresetId = useStore((s) => s.activePresetId);
  const setWithHistory = useStore((s) => s.setWithHistory);

  // Generate thumbnails after first paint so they don't block initial render
  const [thumbnails, setThumbnails] = useState<Record<string, string | null>>({});
  useEffect(() => {
    const map: Record<string, string | null> = {};
    for (const p of presets) {
      map[p.id] = renderPresetThumbnail(p);
    }
    setThumbnails(map);
  }, []);

  const handleSelect = useCallback(
    (presetId: string) => {
      const preset = getPreset(presetId);
      if (!preset) return;

      const activeEffects: ActiveEffect[] = [];
      const paramValues: Record<string, UniformValue> = {};

      for (const { blockId } of preset.effects) {
        const block = getEffect(blockId);
        if (!block) continue;
        const instanceId = generateInstanceId();
        activeEffects.push({ instanceId, blockId, enabled: true });
        for (const param of block.params) {
          const scopedId = `${instanceId}_${param.id}`;
          const overrideKey = `${blockId}.${param.id}`;
          paramValues[scopedId] = preset.paramOverrides[overrideKey] ?? param.defaultValue;
        }
      }

      setWithHistory({
        activePresetId: preset.id,
        shaderName: preset.name,
        activeEffects,
        paramValues,
        colors: preset.colors ?? [],
      });
    },
    [setWithHistory],
  );

  return (
    <SidebarSection title="Presets">
      <div className="preset-list">
        {presets.map((preset) => (
          <motion.div
            key={preset.id}
            className={`preset-row${preset.id === activePresetId ? ' active' : ''}`}
            tabIndex={0}
            onClick={() => handleSelect(preset.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(preset.id);
              }
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', visualDuration: 0.15, bounce: 0 }}
          >
            <div className="preset-row-thumb">
              {thumbnails[preset.id] && (
                <img src={thumbnails[preset.id]!} alt="" />
              )}
            </div>
            <div className="preset-row-info">
              <span className="preset-row-name">{preset.name}</span>
              <span className="preset-row-desc">{preset.description}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </SidebarSection>
  );
}
