# Video Editor

Browser-based video editor (Next.js 16, React 19, TypeScript) built on designcombo state/timeline and Remotion.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev                  # http://localhost:3000
```

| Variable             | Used for                          |
| -------------------- | --------------------------------- |
| `PEXELS_API_KEY`     | Stock Library (images and videos) |
| `ELEVENLABS_API_KEY` | AI Hook voice-over (optional)     |

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm run typecheck`
- `npm run format`

## How it works

- **Editing**: `src/features/editor` — player (Remotion), scene interactions, canvas timeline, side panels, property panels.
- **Uploads**: files are stored on local disk in `./storage` and served by `/api/files/*` (supports Range requests).
- **Export**: MP4 is rendered server-side with Remotion (`/api/render`). The first render downloads a headless Chrome
  and bundles the composition, so it takes longer. JSON export downloads the design directly.
- **Save**: "Save Changes" stores the project in `localStorage` and it is restored on the next visit.

Rendering needs a long-running Node server (`npm start`); it does not run on serverless hosts.
