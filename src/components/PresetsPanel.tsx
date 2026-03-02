import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { presets, getPreset } from '../presets';
import { getEffect, getEffectsByCategory } from '../effects/index';
import { generateInstanceId, equalStops } from '../composer';
import { renderPresetThumbnail } from '../ui/preset-thumbnail';
import { getMotionValues } from '../hooks/useMotionTuning';
import { SidebarSection } from './SidebarSection';
import type { ActiveEffect, EffectBlock, UniformValue } from '../types';

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

  const handleRandom = useCallback(() => {
    const cats = getEffectsByCategory();

    const pick = <T,>(arr: T[], n: number): T[] => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n);
    };

    const snap = (val: number, step: number) =>
      Math.round(val / step) * step;

    // Pick 1–3 generators, 0–1 post, 0–1 UV transform
    const generators = pick(cats.generator, 1 + Math.floor(Math.random() * 3));
    const post = Math.random() < 0.5 ? pick(cats.post, 1) : [];
    const uv = Math.random() < 0.3 ? pick(cats['uv-transform'], 1) : [];

    const selected: EffectBlock[] = [...uv, ...generators, ...post];
    const activeEffects: ActiveEffect[] = [];
    const paramValues: Record<string, UniformValue> = {};

    for (const block of selected) {
      const instanceId = generateInstanceId();
      activeEffects.push({ instanceId, blockId: block.id, enabled: true });
      for (const p of block.params) {
        const key = `${instanceId}_${p.id}`;
        if (p.type === 'float' && p.min != null && p.max != null && p.step != null) {
          paramValues[key] = snap(p.min + Math.random() * (p.max - p.min), p.step);
        } else if (p.type === 'select' && p.options) {
          const opt = p.options[Math.floor(Math.random() * p.options.length)];
          paramValues[key] = opt.value;
        } else if (p.type === 'bool') {
          paramValues[key] = Math.random() < 0.5 ? 1 : 0;
        } else if (p.type === 'color') {
          const h = Math.floor(Math.random() * 360);
          const s = 50 + Math.floor(Math.random() * 40);
          const l = 40 + Math.floor(Math.random() * 30);
          paramValues[key] = `hsl(${h}, ${s}%, ${l}%)`;
        } else {
          paramValues[key] = p.defaultValue;
        }
      }
    }

    // Generate 2–4 random colors (dark-to-light)
    const colorCount = 2 + Math.floor(Math.random() * 3);
    const baseHue = Math.floor(Math.random() * 360);
    const colors: string[] = [];
    for (let i = 0; i < colorCount; i++) {
      const t = i / (colorCount - 1);
      const h = (baseHue + Math.floor(Math.random() * 60) - 30 + 360) % 360;
      const s = Math.floor(60 + Math.random() * 30);
      const l = Math.floor(5 + t * 80 + Math.random() * 10);
      colors.push(`hsl(${h}, ${s}%, ${l}%)`);
    }

    setWithHistory({
      activePresetId: null,
      shaderName: 'Random',
      activeEffects,
      paramValues,
      colors,
      colorStops: equalStops(colorCount),
    });
  }, [setWithHistory]);

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

      const colors = preset.colors ?? [];
      setWithHistory({
        activePresetId: preset.id,
        shaderName: preset.name,
        activeEffects,
        paramValues,
        colors,
        colorStops: preset.colorStops ?? equalStops(colors.length),
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
            whileTap={{ scale: getMotionValues().tapScale }}
            transition={{ type: 'spring', visualDuration: getMotionValues().effectVisualDuration, bounce: getMotionValues().effectBounce }}
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
      <motion.button
        className="btn random-shader-btn"
        onClick={handleRandom}
        whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: getMotionValues().tapScale }}
      >
        Random
      </motion.button>
    </SidebarSection>
  );
}
