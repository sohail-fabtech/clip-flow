import type { IDesign } from '@designcombo/types';

const KEY = 'video-editor:project';

interface SavedProject {
  name: string;
  design: IDesign;
  savedAt: number;
}

export function saveProject(name: string, design: IDesign) {
  localStorage.setItem(KEY, JSON.stringify({ name, design, savedAt: Date.now() } satisfies SavedProject));
}

export function loadProject(): SavedProject | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedProject) : null;
  } catch {
    return null;
  }
}
