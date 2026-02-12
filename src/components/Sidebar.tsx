import { useStore } from '../store';
import { PresetsPanel } from './PresetsPanel';
import { ColorsSection } from './ColorsSection';
import { EffectsSection } from './EffectsSection';
import { SavedSection } from './SavedSection';
import { ExportPanel } from './ExportPanel';

export function Sidebar() {
  const shaderName = useStore((s) => s.shaderName);
  const set = useStore((s) => s.set);

  return (
    <div className="sidebar">
      {/* Shader name field */}
      <div className="sidebar-name-field">
        <label className="sidebar-name-label">Shader Name</label>
        <input
          type="text"
          className="sidebar-shader-name"
          placeholder="Shader name…"
          spellCheck={false}
          autoComplete="off"
          value={shaderName}
          onChange={(e) => set({ shaderName: e.target.value })}
          onBlur={(e) => {
            if (!e.target.value.trim()) set({ shaderName: 'Untitled' });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>

      <PresetsPanel />
      <ColorsSection />
      <EffectsSection />
      <SavedSection />
      <ExportPanel />
    </div>
  );
}
