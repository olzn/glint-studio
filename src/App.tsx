import { useRef } from 'react';
import { useRenderer } from './hooks/useRenderer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutosave } from './hooks/useAutosave';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';

export function App() {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { rendererRef } = useRenderer(previewContainerRef);

  useKeyboardShortcuts(rendererRef);
  useAutosave();

  return (
    <>
      <Header rendererRef={rendererRef} />
      <Sidebar />
      <Preview containerRef={previewContainerRef} />
    </>
  );
}
