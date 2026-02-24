import { useCallback, memo } from 'react';
import {
  Slider,
  Toggle,
  ColorControl as DKColorControl,
  SelectControl as DKSelectControl,
} from 'dialkit';
import { useStore } from '../store';
import type { ShaderParam, UniformValue } from '../types';

/* ─────────────────────────────────────────────────────────
 * PARAMETER CONTROLS
 *
 * Renders DialKit control widgets for each ShaderParam type.
 * Slider, Color, Vec2, Bool, Select — powered by DialKit.
 * ───────────────────────────────────────────────────────── */

interface ParamControlsProps {
  params: ShaderParam[];
  onChange: (paramId: string, value: UniformValue) => void;
}

export function ParamControls({ params, onChange }: ParamControlsProps) {
  if (params.length === 0) return null;

  return (
    <div className="dialkit-root dialkit-param-controls">
      {params.map((param) => (
        <ParamControl
          key={param.id}
          param={param}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

// --- Dispatcher ---

interface ParamControlProps {
  param: ShaderParam;
  onChange: (id: string, value: UniformValue) => void;
}

function ParamControl({ param, onChange }: ParamControlProps) {
  const value = useStore((s) => s.paramValues[param.id]) ?? param.defaultValue;
  switch (param.type) {
    case 'color':
      return (
        <DKColorControl
          label={param.label}
          value={value as string}
          onChange={(v) => onChange(param.id, v)}
        />
      );
    case 'vec2':
      return <Vec2Control param={param} value={value as [number, number]} onChange={onChange} />;
    case 'bool':
      return (
        <Toggle
          label={param.label}
          checked={(value as number) > 0.5}
          onChange={(checked) => onChange(param.id, checked ? 1 : 0)}
        />
      );
    case 'select': {
      const options = param.options ?? [];
      return (
        <DKSelectControl
          label={param.label}
          value={String(value)}
          options={options.map((o) => ({ value: String(o.value), label: o.label }))}
          onChange={(v) => onChange(param.id, parseFloat(v))}
        />
      );
    }
    default:
      return (
        <Slider
          label={param.label}
          value={value as number}
          onChange={(v) => onChange(param.id, v)}
          min={param.min ?? 0}
          max={param.max ?? 1}
          step={param.step ?? 0.01}
        />
      );
  }
}

// --- Vec2 (no DialKit equivalent — dual inline sliders) ---

const Vec2Control = memo(function Vec2Control({
  param,
  value,
  onChange,
}: {
  param: ShaderParam;
  value: [number, number];
  onChange: (id: string, value: UniformValue) => void;
}) {
  const min = param.min ?? 0;
  const max = param.max ?? 1;
  const step = param.step ?? 0.01;

  const handleX = useCallback(
    (v: number) => onChange(param.id, [v, value[1]]),
    [param.id, value, onChange],
  );

  const handleY = useCallback(
    (v: number) => onChange(param.id, [value[0], v]),
    [param.id, value, onChange],
  );

  return (
    <div className="dialkit-vec2">
      <Slider label={`${param.label} X`} value={value[0]} onChange={handleX} min={min} max={max} step={step} />
      <Slider label={`${param.label} Y`} value={value[1]} onChange={handleY} min={min} max={max} step={step} />
    </div>
  );
});
