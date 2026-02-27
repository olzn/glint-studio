# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Glint Studio is a browser-based WebGL shader composer with a modular effect system, real-time preview, and export to standalone TypeScript or HTML.

- **Repo:** https://github.com/olzn/glint-studio
- **Live:** https://olzn.github.io/glint-studio/
- **Stack:** React 19 + Zustand + Motion + Vite + TypeScript + WebGL
- **Styling:** Single `global.css` with CSS custom properties (no CSS modules, no Tailwind)
- **Fonts:** Geist Sans (`--font-ui`) + Geist Mono (`--font-mono`), self-hosted variable woff2. Minimum font size 12px.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # tsc && vite build (typecheck + production build)
npm run preview  # Serve production build locally
```

No test runner. Verify changes with `npm run build` and browser testing.

## Git Workflow

- `main` is always deployable (auto-deploys to GitHub Pages)
- **Always use feature branches** (`feat/*`). Never commit directly to `main`.
- Do NOT commit or push without Oscar's explicit go-ahead.

## Architecture

### Two-layer design

The app splits into a **framework-agnostic core** (~70%) and a **React UI layer**:

- **Core:** `types.ts`, `composer.ts` (GLSL assembly), `compiler.ts` (GLSL preprocessing), `renderer.ts` (WebGL), `uniforms.ts`, `persistence.ts` (localStorage + URL encode/decode), `presets.ts`, `effects/` (24 effect blocks), `export/` (bake + generate TS/HTML)
- **UI:** `store.ts` (Zustand), `App.tsx` → Header + Sidebar + Preview, 13 components in `components/`, 4 hooks in `hooks/` (`useRenderer`, `useKeyboardShortcuts`, `useAutosave`, `useMotionTuning`)

### Data flow

1. Sidebar controls → Zustand store update
2. `useRenderer` subscribes → recomposes GLSL → recompiles shader
3. Renderer RAF loop pushes uniforms to GPU each frame
4. Time display updates at 60fps via ref (not state)

### Key patterns

- **Scoped uniforms:** `u_${instanceId}_paramId` so multiple effect instances don't collide
- **Undo/redo:** `setWithHistory()` snapshots state. `setParamChange()` debounces sliders at 600ms (one drag = one undo entry). `set()` for non-undoable updates.
- **DnD:** Motion `Reorder.Group` / `Reorder.Item` + `useDragControls` for physical drag-and-drop. Effects reorder within category (one group per category). Color rows use stable counter-based IDs.
- **CodeMirror 6:** Lifecycle via `useEffect`, not a React wrapper
- **Animations:** Motion `AnimatePresence` for section collapse and toast
- **Preset thumbnails:** Generated in `useEffect` after first paint (not blocking render)
- **localStorage keys:** `glint-studio-library` (saves), `glint-studio-autosave` (autosave)

### Adding a new effect

1. Create `src/effects/{category}/{name}.ts` exporting an `EffectBlock`
2. Register it in `src/effects/index.ts`
3. Composer, UI, and export pick it up automatically

### Adding app state

1. Add field to `AppState` in `types.ts`
2. Initialize in `buildInitialState()` in `store.ts`
3. Read: `useStore(s => s.field)` — Update: `useStore.getState().set({ field: value })`

## Key Decisions

- App opens with Glow preset (not blank canvas)
- Save names auto-generated from effects + nearest color names
- Shared URLs validated field-by-field in `decodeShaderUrl()` — invalid links fall back to default state
