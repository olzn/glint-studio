import { useState, useEffect, useCallback, memo } from 'react';
import type { ShaderParam, UniformValue } from '../types';

/* ─────────────────────────────────────────────────────────
 * PARAMETER CONTROLS
 *
 * Renders the correct control widget for each ShaderParam type.
 * Slider, Color, Vec2, Bool, Select — all with reset buttons.
 * ───────────────────────────────────────────────────────── */

const RESET_SVG = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6a4 4 0 1 1 1.17 2.83"/><path d="M2 9V6h3"/></svg>`;

interface ParamControlsProps {
  params: ShaderParam[];
  values: Record<string, UniformValue>;
  onChange: (paramId: string, value: UniformValue) => void;
}

export function ParamControls({ params, values, onChange }: ParamControlsProps) {
  if (params.length === 0) return null;

  return (
    <div className="control-group">
      {params.map((param) => (
        <ParamControl
          key={param.id}
          param={param}
          value={values[param.id] ?? param.defaultValue}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

// --- Dispatcher ---

interface ParamControlProps {
  param: ShaderParam;
  value: UniformValue;
  onChange: (id: string, value: UniformValue) => void;
}

function ParamControl({ param, value, onChange }: ParamControlProps) {
  switch (param.type) {
    case 'color':
      return <ColorControl param={param} value={value as string} onChange={onChange} />;
    case 'vec2':
      return <Vec2Control param={param} value={value as [number, number]} onChange={onChange} />;
    case 'bool':
      return <BoolControl param={param} value={value as number} onChange={onChange} />;
    case 'select':
      return <SelectControl param={param} value={value as number} onChange={onChange} />;
    default:
      return <SliderControl param={param} value={value as number} onChange={onChange} />;
  }
}

// --- Slider ---

const SliderControl = memo(function SliderControl({
  param,
  value,
  onChange,
}: {
  param: ShaderParam;
  value: number;
  onChange: (id: string, value: UniformValue) => void;
}) {
  const min = param.min ?? 0;
  const max = param.max ?? 1;
  const step = param.step ?? 0.01;

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      onChange(param.id, v);
    },
    [param, onChange],
  );

  const handleReset = useCallback(() => {
    onChange(param.id, param.defaultValue);
  }, [param, onChange]);

  return (
    <div className="control" data-param-id={param.id}>
      <div className="control-label">
        <span className="control-label-text">{param.label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="control-value">
            {formatValue(value, param)}
          </span>
          <ResetButton onClick={handleReset} />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInput}
      />
    </div>
  );
});

// --- Color ---

function ColorControl({
  param,
  value,
  onChange,
}: {
  param: ShaderParam;
  value: string;
  onChange: (id: string, value: UniformValue) => void;
}) {
  const [hexText, setHexText] = useState(value);

  // Sync hex text when value changes from outside (undo, preset)
  useEffect(() => {
    setHexText(value);
  }, [value]);

  const handlePicker = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setHexText(v);
      onChange(param.id, v);
    },
    [param.id, onChange],
  );

  const handleHex = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let v = e.target.value.trim();
      setHexText(e.target.value);
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        onChange(param.id, v);
      }
    },
    [param.id, onChange],
  );

  const handleReset = useCallback(() => {
    onChange(param.id, param.defaultValue);
  }, [param, onChange]);

  return (
    <div className="control" data-param-id={param.id}>
      <div className="control-label">
        <span className="control-label-text">{param.label}</span>
        <ResetButton onClick={handleReset} />
      </div>
      <div className="color-control">
        <div className="color-swatch" style={{ backgroundColor: value }}>
          <input type="color" value={value} onChange={handlePicker} />
        </div>
        <input
          type="text"
          className="color-hex-input"
          value={hexText}
          maxLength={7}
          spellCheck={false}
          onChange={handleHex}
        />
      </div>
    </div>
  );
}

// --- Vec2 ---

function Vec2Control({
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(param.id, [parseFloat(e.target.value), value[1]]);
    },
    [param.id, value, onChange],
  );

  const handleY = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(param.id, [value[0], parseFloat(e.target.value)]);
    },
    [param.id, value, onChange],
  );

  const handleReset = useCallback(() => {
    onChange(param.id, param.defaultValue);
  }, [param, onChange]);

  return (
    <div className="control" data-param-id={param.id}>
      <div className="control-label">
        <span className="control-label-text">{param.label}</span>
        <ResetButton onClick={handleReset} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="control-row">
          <span className="control-value" style={{ width: 12 }}>X</span>
          <input type="range" min={min} max={max} step={step} value={value[0]} onChange={handleX} />
          <span className="control-value">{value[0].toFixed(2)}</span>
        </div>
        <div className="control-row">
          <span className="control-value" style={{ width: 12 }}>Y</span>
          <input type="range" min={min} max={max} step={step} value={value[1]} onChange={handleY} />
          <span className="control-value">{value[1].toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// --- Bool ---

function BoolControl({
  param,
  value,
  onChange,
}: {
  param: ShaderParam;
  value: number;
  onChange: (id: string, value: UniformValue) => void;
}) {
  return (
    <div className="control" data-param-id={param.id}>
      <div className="control-label">
        <span className="control-label-text">{param.label}</span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value > 0.5}
            onChange={(e) => onChange(param.id, e.target.checked ? 1 : 0)}
            style={{ margin: 0 }}
          />
        </label>
      </div>
    </div>
  );
}

// --- Select ---

function SelectControl({
  param,
  value,
  onChange,
}: {
  param: ShaderParam;
  value: number;
  onChange: (id: string, value: UniformValue) => void;
}) {
  const options = param.options ?? [];

  const handleReset = useCallback(() => {
    onChange(param.id, param.defaultValue);
  }, [param, onChange]);

  return (
    <div className="control" data-param-id={param.id}>
      <div className="control-label">
        <span className="control-label-text">{param.label}</span>
        <ResetButton onClick={handleReset} />
      </div>
      <select
        className="control-select"
        value={value}
        onChange={(e) => onChange(param.id, parseFloat(e.target.value))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- Shared ---

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="control-reset"
      title="Reset to default"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      dangerouslySetInnerHTML={{ __html: RESET_SVG }}
    />
  );
}

// --- Formatting ---

function formatValue(v: number, param: ShaderParam): string {
  const step = param.step ?? 0.01;
  const suffix = param.displayUnit === 'deg' ? '\u00B0' : '';
  if (step >= 1) return String(Math.round(v)) + suffix;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return v.toFixed(Math.min(decimals, 4)) + suffix;
}
