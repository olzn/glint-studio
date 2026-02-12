import { useRef, useEffect } from 'react';
import { useStore } from '../store';
import type { Renderer } from '../renderer';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

interface TimeControlsProps {
  rendererRef: React.RefObject<Renderer | null>;
}

export function TimeControls({ rendererRef }: TimeControlsProps) {
  const timeRef = useRef<HTMLSpanElement>(null);
  const playing = useStore((s) => s.playing);
  const timeScale = useStore((s) => s.timeScale);
  const set = useStore((s) => s.set);

  // 60fps time display via ref (not state)
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    renderer.onTimeUpdate = (time) => {
      if (timeRef.current) {
        timeRef.current.textContent = time.toFixed(1) + 's';
      }
    };

    return () => {
      if (renderer.onTimeUpdate) renderer.onTimeUpdate = undefined;
    };
  }, [rendererRef]);

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

  function handleReset() {
    rendererRef.current?.reset();
  }

  function handleSpeedChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const scale = parseFloat(e.target.value);
    rendererRef.current?.setTimeScale(scale);
    set({ timeScale: scale });
  }

  return (
    <div className="time-controls">
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
      <button
        className="btn btn-ghost btn-icon"
        title="Reset time"
        aria-label="Reset time"
        onClick={handleReset}
        dangerouslySetInnerHTML={{
          __html: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6a4 4 0 1 1 1.17 2.83"/><path d="M2 9V6h3"/></svg>',
        }}
      />
      <select
        className="select"
        title="Playback speed"
        value={String(timeScale)}
        onChange={handleSpeedChange}
      >
        {SPEED_OPTIONS.map((s) => (
          <option key={s} value={String(s)}>
            {s}x
          </option>
        ))}
      </select>
      <span className="time-display" ref={timeRef}>
        0.0s
      </span>
    </div>
  );
}
