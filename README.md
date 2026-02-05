# ShaderTool

A browser-based WebGL shader composer with a modular effect system, real-time preview, and export to standalone TypeScript or HTML.

## Features

- **Modular effects** — Build shaders by combining self-contained effect blocks (generators, post-processing, UV transforms)
- **Real-time preview** — WebGL canvas with play/pause, reset, and adjustable time scale
- **Presets** — Blank, Swirl, and Glow presets as starting points (pre-configured effect combinations)
- **Generator layering** — Multiple generator effects blend together using contrast-based compositing
- **Code viewer** — Read-only CodeMirror 6 editor showing the composed GLSL output
- **Export** — Generate self-contained TypeScript functions or standalone HTML files with baked parameter values
- **Save/Load** — Persist shader projects to localStorage with autosave

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

## Usage

### Presets

Select a preset from the sidebar to load a pre-configured combination of effects. Presets are starting points — you can add, remove, or tweak effects after loading one.

### Effects

Click **Add Effect** to open the effect catalog. Effects are grouped by category:

- **UV Transform** — Pixelate
- **Generators** — Gradient, Noise, Domain Warp, Wave, Glow Waves
- **Post-Processing** — Brightness, Vignette, Film Grain, CRT Scanlines, Chromatic Aberration

Each effect has its own parameter controls (sliders, color pickers). Effects can be toggled on/off or removed individually.

When multiple generators are active, they layer on top of each other — each subsequent generator blends into the existing color based on its pattern contrast.

### Colors

Two base colors (Color A and Color B) are always available. Generators use these to produce the color gradient via `mix(colorA, colorB, mixFactor)`.

### Code Viewer

Toggle the code viewer with the **Code** button or `Ctrl+E` to inspect the composed GLSL fragment shader. The output updates live as you add effects and adjust parameters.

### Export

The export panel generates production-ready code with all parameter values baked in:

- **TypeScript** — A single function that mounts a WebGL canvas on a target `<div>` and returns a cleanup function
- **HTML** — A standalone page for quick testing

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + E` | Toggle code viewer |
| `Ctrl/Cmd + S` | Save shader |
| `Space` | Play / Pause |

## Architecture

Shaders are composed at runtime from effect blocks. Each effect is a self-contained GLSL module with `$param` placeholders that get replaced with instance-scoped uniform names. The composer (`src/composer.ts`) assembles the final fragment shader by sorting effects by category and order, deduplicating shared utility functions (hash, noise, fbm), and emitting the combined GLSL.

## Tech Stack

- [Vite](https://vite.dev) — Dev server and build
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [CodeMirror 6](https://codemirror.net) — Code viewer
- WebGL — Shader rendering

## License

MIT
