# ShaderTool

A browser-based WebGL fragment shader editor with real-time preview, parameterized controls, and export to standalone TypeScript or HTML.

## Features

- **Real-time preview** — WebGL canvas with play/pause, reset, and adjustable time scale
- **Code editor** — CodeMirror 6 with GLSL syntax highlighting and inline error reporting
- **Parameterized shaders** — Annotate values in GLSL to generate UI controls (sliders, color pickers, toggles)
- **Built-in templates** — Swirl, Glow, Sunflare, and Blank starter shaders
- **Export** — Generate self-contained TypeScript functions or standalone HTML files with baked parameter values
- **Save/Load** — Persist shader projects to localStorage with autosave

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (default `http://localhost:5173`).

## Usage

### Templates

Select a template from the sidebar to load a pre-built shader with adjustable parameters. Tweak values in the sidebar controls to see changes in real time.

### Code Editor

Toggle the code editor with the **Code** button or `Ctrl+E`. Edit the fragment shader directly — compilation happens on every change with errors shown inline.

### Annotations

Annotate values in your GLSL to auto-generate UI controls:

```glsl
vec3 color = /*@color:tint*/ vec3(0.2, 0.5, 1.0) /*@*/;
float speed = /*@float:speed*/ 1.0 /*@*/;
```

Supported types: `float`, `color`, `vec2`, `int`, `bool`.

### Export

The export panel generates production-ready code with all parameter values baked in:

- **TypeScript** — A single function that mounts a WebGL canvas on a target `<div>` and returns a cleanup function
- **HTML** — A standalone page for quick testing

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + E` | Toggle code editor |
| `Ctrl/Cmd + S` | Save shader |
| `Space` | Play / Pause |

## Tech Stack

- [Vite](https://vite.dev) — Dev server and build
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [CodeMirror 6](https://codemirror.net) — Code editor
- WebGL — Shader rendering

## License

MIT
