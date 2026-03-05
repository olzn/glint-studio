import { useStore } from '../store';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { CodeEditor } from './CodeEditor';

interface PreviewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function Preview({ containerRef }: PreviewProps) {
  const compileErrors = useStore((s) => s.compileErrors);
  const editorOpen = useStore((s) => s.editorOpen);
  const activeEffects = useStore((s) => s.activeEffects);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="main-area">
      <div className="preview-container" ref={containerRef}>
        {compileErrors.length > 0 && (
          <div className="preview-error">
            {compileErrors.map((e, i) => (
              <div key={i}>
                {e.line ? `Line ${e.line}: ${e.message}` : e.message}
              </div>
            ))}
          </div>
        )}
        {activeEffects.length === 0 && (
          <div className="preview-onboarding">
            <span className="preview-onboarding-icon">&#9670;</span>
            <p className="preview-onboarding-heading">Welcome to Glint Studio</p>
            <p className="preview-onboarding-text">
              Pick a preset from the sidebar to get started,
              <br />
              or add effects and colors to build your own.
            </p>
          </div>
        )}
      </div>

      {editorOpen && !isMobile && <CodeEditor />}
    </div>
  );
}
