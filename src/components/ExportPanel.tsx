import { useCallback, useRef } from 'react';
import { useStore } from '../store';
import { compose, VERTEX_SOURCE } from '../composer';
import { bakeShader } from '../export/bake';
import { hexToVec3, formatFloat } from '../compiler';
import { generateTS } from '../export/generate-ts';
import { generateHTML } from '../export/generate-html';
import { SidebarSection } from './SidebarSection';

export function ExportPanel() {
  const set = useStore((s) => s.set);
  const fnInputRef = useRef<HTMLInputElement>(null);

  const doExport = useCallback((format: 'ts' | 'html') => {
    const state = useStore.getState();
    const result = compose(state.activeEffects, state.colors.length);

    let bakedFragment = bakeShader(result.glsl, result.params, state.paramValues);

    // Bake color uniforms into literal vec3 values
    for (let i = 0; i < state.colors.length; i++) {
      bakedFragment = bakedFragment.replace(
        new RegExp(`^\\s*uniform\\s+vec3\\s+u_color${i}\\s*;\\n?`, 'gm'),
        '',
      );
    }
    for (let i = 0; i < state.colors.length; i++) {
      const [r, g, b] = hexToVec3(state.colors[i]);
      const literal = `vec3(${formatFloat(r)}, ${formatFloat(g)}, ${formatFloat(b)})`;
      bakedFragment = bakedFragment.replace(new RegExp(`\\bu_color${i}\\b`, 'g'), literal);
    }

    if (format === 'ts') {
      const content = generateTS({
        functionName: state.exportFunctionName,
        vertexSource: VERTEX_SOURCE,
        fragmentSource: bakedFragment,
        usesTexture: state.usesTexture,
        exportAsync: state.exportAsync,
      });
      downloadFile(content, `${state.exportFunctionName}.ts`, 'text/typescript');
    } else {
      const content = generateHTML({
        functionName: state.exportFunctionName,
        vertexSource: VERTEX_SOURCE,
        fragmentSource: bakedFragment,
        usesTexture: state.usesTexture,
        exportAsync: state.exportAsync,
        title: state.shaderName,
      });
      downloadFile(content, `${state.shaderName || 'shader'}.html`, 'text/html');
    }
  }, []);

  return (
    <SidebarSection title="Export" defaultCollapsed>
      <div className="export-panel">
        <div className="control">
          <div className="control-label">
            <span className="control-label-text">Function Name</span>
          </div>
          <input
            ref={fnInputRef}
            type="text"
            className="export-fn-input"
            defaultValue="renderShader"
            placeholder="renderShader"
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => {
              set({ exportFunctionName: e.target.value.trim() || 'renderShader' });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>

        <div className="export-buttons">
          <button className="btn" onClick={() => doExport('ts')}>
            Export .ts
          </button>
          <button className="btn" onClick={() => doExport('html')}>
            Export .html
          </button>
        </div>
      </div>
    </SidebarSection>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
