import { useRef, useEffect, useCallback } from 'react';
import 'dialkit/styles.css';
import { Agentation } from 'agentation';
import { useStore } from './store';
import { useRenderer } from './hooks/useRenderer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutosave } from './hooks/useAutosave';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Preview } from './components/Preview';

export function App() {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { rendererRef } = useRenderer(previewContainerRef);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useKeyboardShortcuts(rendererRef);
  useAutosave();

  // Close sidebar when switching to mobile if it's open
  useEffect(() => {
    if (isMobile) {
      useStore.getState().set({ sidebarOpen: false });
    }
  }, [isMobile]);

  // Sync layout classes on #app
  useEffect(() => {
    const el = document.getElementById('app');
    if (!el) return;
    el.classList.toggle('sidebar-closed', !sidebarOpen);
    el.classList.toggle('mobile', isMobile);
  }, [sidebarOpen, isMobile]);

  // Close sidebar on backdrop click (mobile overlay)
  const handleBackdropClick = useCallback(() => {
    useStore.getState().set({ sidebarOpen: false });
  }, []);

  return (
    <>
      <Header rendererRef={rendererRef} isMobile={isMobile} />
      <Sidebar rendererRef={rendererRef} isMobile={isMobile} />
      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={handleBackdropClick} />
      )}
      <Preview containerRef={previewContainerRef} />
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}
