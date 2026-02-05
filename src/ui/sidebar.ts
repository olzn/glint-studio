import type { ActiveEffect, EffectBlock, ShaderParam, UniformValue, Preset, SavedShader } from '../types';
import { createControls } from './controls';
import { getAllEffects, getEffect, getEffectsByCategory } from '../effects/index';

interface SidebarOptions {
  presets: Preset[];
  activePresetId: string | null;
  activeEffects: ActiveEffect[];
  params: ShaderParam[];
  paramValues: Record<string, UniformValue>;
  colorA: string;
  colorB: string;
  savedShaders: SavedShader[];
  onPresetSelect: (id: string) => void;
  onColorChange: (which: 'colorA' | 'colorB', value: string) => void;
  onParamChange: (paramId: string, value: UniformValue) => void;
  onAddEffect: (blockId: string) => void;
  onRemoveEffect: (instanceId: string) => void;
  onToggleEffect: (instanceId: string, enabled: boolean) => void;
  onSave: () => void;
  onLoadSaved: (id: string) => void;
  onDeleteSaved: (id: string) => void;
}

export function createSidebar(
  container: HTMLElement,
  options: SidebarOptions
): {
  updateEffects: (effects: ActiveEffect[], params: ShaderParam[], values: Record<string, UniformValue>) => void;
  updateColors: (colorA: string, colorB: string) => void;
  updatePreset: (id: string | null) => void;
  updateSaved: (saved: SavedShader[]) => void;
  destroy: () => void;
} {
  container.innerHTML = '';

  // --- Presets section ---
  const presetsSection = createSection('Presets', false);
  const presetGrid = document.createElement('div');
  presetGrid.className = 'template-grid';

  for (const preset of options.presets) {
    const card = document.createElement('div');
    card.className = 'template-card' + (preset.id === options.activePresetId ? ' active' : '');
    card.dataset.presetId = preset.id;
    card.innerHTML = `
      <div class="template-card-name">${preset.name}</div>
      <div class="template-card-desc">${preset.description}</div>
    `;
    card.addEventListener('click', () => options.onPresetSelect(preset.id));
    presetGrid.appendChild(card);
  }

  presetsSection.content.appendChild(presetGrid);
  container.appendChild(presetsSection.element);

  // --- Colors section ---
  const colorsSection = createSection('Colors', false);
  const colorsContainer = document.createElement('div');
  colorsContainer.className = 'control-group';

  const colorAControl = createColorPicker('Color A', options.colorA, (v) => options.onColorChange('colorA', v));
  const colorBControl = createColorPicker('Color B', options.colorB, (v) => options.onColorChange('colorB', v));
  colorsContainer.append(colorAControl.element, colorBControl.element);
  colorsSection.content.appendChild(colorsContainer);
  container.appendChild(colorsSection.element);

  // --- Active Effects section ---
  const effectsSection = createSection('Effects', false);
  const effectsContainer = document.createElement('div');
  effectsContainer.className = 'effects-list';

  const addEffectBtn = document.createElement('button');
  addEffectBtn.className = 'btn add-effect-btn';
  addEffectBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2v8M2 6h8"/></svg> Add Effect`;
  addEffectBtn.addEventListener('click', () => showCatalog());

  effectsSection.content.appendChild(addEffectBtn);
  effectsSection.content.appendChild(effectsContainer);
  container.appendChild(effectsSection.element);

  // --- Saved section ---
  const savedSection = createSection('Saved', true);
  const savedContainer = document.createElement('div');

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn';
  saveBtn.style.width = '100%';
  saveBtn.style.marginBottom = '8px';
  saveBtn.textContent = 'Save Current';
  saveBtn.addEventListener('click', options.onSave);
  savedSection.content.appendChild(saveBtn);
  savedSection.content.appendChild(savedContainer);

  renderSavedList(savedContainer, options.savedShaders, options.onLoadSaved, options.onDeleteSaved);
  container.appendChild(savedSection.element);

  // --- Effect catalog overlay ---
  let catalogEl: HTMLElement | null = null;

  function showCatalog() {
    if (catalogEl) {
      catalogEl.remove();
      catalogEl = null;
      return;
    }

    catalogEl = document.createElement('div');
    catalogEl.className = 'effect-catalog';

    const catalogHeader = document.createElement('div');
    catalogHeader.className = 'effect-catalog-header';
    catalogHeader.innerHTML = `<span>Add Effect</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-ghost btn-icon';
    closeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;
    closeBtn.addEventListener('click', () => {
      catalogEl?.remove();
      catalogEl = null;
    });
    catalogHeader.appendChild(closeBtn);
    catalogEl.appendChild(catalogHeader);

    const categories = getEffectsByCategory();
    const categoryNames: Record<string, string> = {
      'uv-transform': 'UV Transform',
      'generator': 'Generators',
      'post': 'Post-Processing',
    };

    for (const [cat, effects] of Object.entries(categories)) {
      if (effects.length === 0) continue;
      const catLabel = document.createElement('div');
      catLabel.className = 'effect-catalog-category';
      catLabel.textContent = categoryNames[cat] || cat;
      catalogEl.appendChild(catLabel);

      for (const effect of effects) {
        const item = document.createElement('div');
        item.className = 'effect-catalog-item';
        item.innerHTML = `
          <div class="effect-catalog-item-name">${effect.name}</div>
          <div class="effect-catalog-item-desc">${effect.description}</div>
        `;
        item.addEventListener('click', () => {
          options.onAddEffect(effect.id);
          catalogEl?.remove();
          catalogEl = null;
        });
        catalogEl.appendChild(item);
      }
    }

    effectsSection.content.insertBefore(catalogEl, effectsContainer);
  }

  // Track per-effect controls for cleanup
  const effectControls: Map<string, ReturnType<typeof createControls>> = new Map();

  function renderEffects(effects: ActiveEffect[], params: ShaderParam[], values: Record<string, UniformValue>) {
    effectsContainer.innerHTML = '';
    for (const ctrl of effectControls.values()) ctrl.destroy();
    effectControls.clear();

    if (effects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No effects added yet';
      effectsContainer.appendChild(empty);
      return;
    }

    for (const ae of effects) {
      const block = getEffect(ae.blockId);
      if (!block) continue;

      const item = document.createElement('div');
      item.className = 'effect-item' + (ae.enabled ? '' : ' disabled');
      item.dataset.instanceId = ae.instanceId;

      // Header row
      const header = document.createElement('div');
      header.className = 'effect-item-header';

      const leftSide = document.createElement('div');
      leftSide.className = 'effect-item-left';

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = ae.enabled;
      toggle.className = 'effect-toggle';
      toggle.addEventListener('change', () => {
        options.onToggleEffect(ae.instanceId, toggle.checked);
      });

      const nameSpan = document.createElement('span');
      nameSpan.className = 'effect-item-name';
      nameSpan.textContent = block.name;

      leftSide.append(toggle, nameSpan);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-ghost btn-icon effect-remove-btn';
      removeBtn.title = 'Remove effect';
      removeBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l6 6M9 3l-6 6"/></svg>`;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.onRemoveEffect(ae.instanceId);
      });

      header.append(leftSide, removeBtn);

      // Controls container (collapsible)
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'effect-item-controls';

      // Get this instance's params (scoped by instanceId)
      const instanceParams = params.filter(p => p.id.startsWith(ae.instanceId + '_'));
      const instanceValues: Record<string, UniformValue> = {};
      for (const p of instanceParams) {
        instanceValues[p.id] = values[p.id] ?? p.defaultValue;
      }

      const ctrl = createControls(controlsContainer, {
        params: instanceParams,
        values: instanceValues,
        onChange: options.onParamChange,
      });
      effectControls.set(ae.instanceId, ctrl);

      // Toggle expand/collapse on name click
      let expanded = true;
      nameSpan.style.cursor = 'pointer';
      nameSpan.addEventListener('click', () => {
        expanded = !expanded;
        controlsContainer.style.display = expanded ? '' : 'none';
      });

      item.append(header, controlsContainer);
      effectsContainer.appendChild(item);
    }
  }

  // Initial render
  renderEffects(options.activeEffects, options.params, options.paramValues);

  return {
    updateEffects(effects, params, values) {
      renderEffects(effects, params, values);
    },
    updateColors(colorA, colorB) {
      colorAControl.setValue(colorA);
      colorBControl.setValue(colorB);
    },
    updatePreset(id) {
      container.querySelectorAll('.template-card').forEach(card => {
        card.classList.toggle('active', (card as HTMLElement).dataset.presetId === id);
      });
    },
    updateSaved(saved) {
      renderSavedList(savedContainer, saved, options.onLoadSaved, options.onDeleteSaved);
    },
    destroy() {
      for (const ctrl of effectControls.values()) ctrl.destroy();
      effectControls.clear();
      catalogEl?.remove();
      container.innerHTML = '';
    },
  };
}

// --- Helpers ---

function createSection(title: string, collapsed: boolean): {
  element: HTMLElement;
  content: HTMLElement;
} {
  const section = document.createElement('div');
  section.className = 'sidebar-section' + (collapsed ? ' collapsed' : '');

  const header = document.createElement('div');
  header.className = 'sidebar-section-header';
  header.innerHTML = `
    <span class="sidebar-section-title">${title}</span>
    <svg class="sidebar-section-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M3 4.5L6 7.5L9 4.5"/>
    </svg>
  `;
  header.addEventListener('click', () => section.classList.toggle('collapsed'));

  const content = document.createElement('div');
  content.className = 'sidebar-section-content';

  section.append(header, content);
  return { element: section, content };
}

function createColorPicker(
  label: string,
  initialValue: string,
  onChange: (value: string) => void
): { element: HTMLElement; setValue: (v: string) => void } {
  const wrap = document.createElement('div');
  wrap.className = 'control';

  wrap.innerHTML = `
    <div class="control-label">
      <span class="control-label-text">${label}</span>
    </div>
    <div class="color-control">
      <div class="color-swatch" data-swatch>
        <input type="color" value="${initialValue}" data-color-picker />
      </div>
      <input type="text" class="color-hex-input" value="${initialValue}" maxlength="7" data-hex-input />
    </div>
  `;

  const swatch = wrap.querySelector<HTMLElement>('[data-swatch]')!;
  const picker = wrap.querySelector<HTMLInputElement>('[data-color-picker]')!;
  const hexInput = wrap.querySelector<HTMLInputElement>('[data-hex-input]')!;

  swatch.style.backgroundColor = initialValue;

  picker.addEventListener('input', () => {
    const v = picker.value;
    hexInput.value = v;
    swatch.style.backgroundColor = v;
    onChange(v);
  });

  hexInput.addEventListener('change', () => {
    let v = hexInput.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      picker.value = v;
      swatch.style.backgroundColor = v;
      onChange(v);
    }
  });

  return {
    element: wrap,
    setValue(v: string) {
      picker.value = v;
      hexInput.value = v;
      swatch.style.backgroundColor = v;
    },
  };
}

function renderSavedList(
  container: HTMLElement,
  saved: SavedShader[],
  onLoad: (id: string) => void,
  onDelete: (id: string) => void
): void {
  container.innerHTML = '';
  if (saved.length === 0) {
    container.innerHTML = '<div class="empty-state">No saved shaders yet</div>';
    return;
  }

  const list = document.createElement('div');
  list.className = 'saved-list';

  for (const shader of saved.sort((a, b) => b.savedAt - a.savedAt)) {
    const item = document.createElement('div');
    item.className = 'saved-item';

    const info = document.createElement('div');
    info.innerHTML = `
      <div class="saved-item-name">${shader.name}</div>
      <div class="saved-item-date">${formatDate(shader.savedAt)}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'saved-item-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-ghost btn-icon';
    deleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h8M4.5 3V2h3v1M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3"/></svg>`;
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onDelete(shader.id);
    });

    actions.appendChild(deleteBtn);
    item.append(info, actions);
    item.addEventListener('click', () => onLoad(shader.id));
    list.appendChild(item);
  }

  container.appendChild(list);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}
