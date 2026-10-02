# Video Editor

Desktop-browser NLE (Next.js 16, React 19, TypeScript, Remotion) with a Premiere-style workflow: multi-track timeline,
keyframes, WebGL color grading, text animations, captions, transitions and H.264 / H.265 / ProRes export.

## Setup

```bash
npm install
npm run dev   # http://localhost:3000
```

No environment variables are needed.

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck`
- `npm test` (engine tests with `node:test`)
- `npm run format`

## Features

- **Projects**: home page with aspect presets, autosave to IndexedDB, `.vproj` export/import.
- **Media**: import by button, drop, or URL; folders, search, sort; filmstrips and waveforms cached in IndexedDB.
- **Timeline**: V/A tracks (lock, hide, mute), select / razor / slip tools, split, trim to playhead, ripple
  delete/trim/insert, duplicate, copy/paste, linked audio, select forward, In/Out range, markers, snapping,
  zoom to cursor, keyframe diamonds.
- **Inspector**: project settings, transform with keyframes, crop, flip, 16 blend modes, speed, audio levels and fades,
  text styling and 8 text animations.
- **Color**: tone, white balance, curves, color wheels, hue curves, `.cube` LUTs, chroma key, blur, sharpen, denoise,
  glow, vignette, grain. Preview and export use the same WebGL2 code.
- **Captions**: SRT/VTT import and export, style presets, gap closing.
- **Transitions**: fade, dip to black/white, slide, wipe, flip, clock wipe, iris, zoom.
- **Shortcuts**: press `?` in the editor for the full list (⌘ on macOS, Ctrl elsewhere).

## How it works

- `src/features/editor/model` holds the types. `engine` has pure edit functions over a `Project` (integer frames).
  `store` adds undo/redo with immer patches.
- `render` is the Remotion composition shared by the preview player and the export.
- Uploads go to `./storage` and are served by `/api/files/*` (supports Range requests).
- Export renders server-side with Remotion (`/api/render`). The first render downloads a headless Chrome and bundles
  the composition, so it takes longer. Rendering needs a long-running Node server (`npm start`); it won't run on
  serverless hosts.
- Remotion requires a company license for some commercial uses; see remotion.dev/license.
