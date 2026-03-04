import { useStore } from '../store';
import type { Renderer } from '../renderer';

interface PlayPauseButtonProps {
  rendererRef: React.RefObject<Renderer | null>;
}

export function PlayPauseButton({ rendererRef }: PlayPauseButtonProps) {
  const playing = useStore((s) => s.playing);
  const set = useStore((s) => s.set);

  function handlePlayPause() {
    const renderer = rendererRef.current;
    if (!renderer) return;
    if (playing) {
      renderer.pause();
      set({ playing: false });
    } else {
      renderer.play();
      set({ playing: true });
    }
  }

  return (
    <button
      className="btn btn-ghost btn-icon"
      title="Play/Pause (Space)"
      aria-label="Play/Pause"
      onClick={handlePlayPause}
      dangerouslySetInnerHTML={{
        __html: playing
          ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1.5" width="3" height="9" rx="0.5"/><rect x="7" y="1.5" width="3" height="9" rx="0.5"/></svg>'
          : '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1.5l7 4.5-7 4.5z"/></svg>',
      }}
    />
  );
}
