import { applyPatches, enablePatches, produce, produceWithPatches, type Patch } from 'immer';
import { create } from 'zustand';
import type { Project } from '@/features/editor/model/types';

enablePatches();

const HISTORY_LIMIT = 200;

interface Entry {
  label: string;
  redo: Patch[];
  undo: Patch[];
}

interface ProjectStore {
  project: Project;
  past: Entry[];
  future: Entry[];
  pending: Entry | null;
  revision: number;
  load: (project: Project) => void;
  commit: (label: string, recipe: (draft: Project) => void) => void;
  begin: (label: string) => void;
  update: (recipe: (draft: Project) => void) => void;
  end: () => void;
  cancel: () => void;
  undo: () => void;
  redo: () => void;
}

const push = (past: Entry[], entry: Entry) => [...past.slice(-(HISTORY_LIMIT - 1)), entry];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null as unknown as Project,
  past: [],
  future: [],
  pending: null,
  revision: 0,

  load: project => set({ project, past: [], future: [], pending: null, revision: 0 }),

  commit: (label, recipe) => {
    const [project, redo, undo] = produceWithPatches(get().project, draft => {
      recipe(draft);
      draft.updatedAt = Date.now();
    });
    if (redo.length === 0) return;
    set(state => ({
      project,
      past: push(state.past, { label, redo, undo }),
      future: [],
      revision: state.revision + 1,
    }));
  },

  begin: label => set({ pending: { label, redo: [], undo: [] } }),

  update: recipe => {
    const { pending, project } = get();
    if (!pending) return;
    const [next, redo, undo] = produceWithPatches(project, recipe);
    if (redo.length === 0) return;
    set({ project: next, pending: { ...pending, redo: [...pending.redo, ...redo], undo: [...undo, ...pending.undo] } });
  },

  end: () => {
    const { pending } = get();
    if (!pending) return;
    if (pending.redo.length === 0) return set({ pending: null });
    set(state => ({
      project: produce(state.project, draft => {
        draft.updatedAt = Date.now();
      }),
      past: push(state.past, pending),
      future: [],
      pending: null,
      revision: state.revision + 1,
    }));
  },

  cancel: () => {
    const { pending, project } = get();
    if (!pending) return;
    set({ project: applyPatches(project, pending.undo), pending: null });
  },

  undo: () => {
    const { past, project } = get();
    const entry = past.at(-1);
    if (!entry) return;
    set(state => ({
      project: applyPatches(project, entry.undo),
      past: past.slice(0, -1),
      future: [entry, ...state.future],
      revision: state.revision + 1,
    }));
  },

  redo: () => {
    const { future, project } = get();
    const entry = future[0];
    if (!entry) return;
    set(state => ({
      project: applyPatches(project, entry.redo),
      past: push(state.past, entry),
      future: future.slice(1),
      revision: state.revision + 1,
    }));
  },
}));

export const getProject = () => useProjectStore.getState().project;
export const commit = (label: string, recipe: (draft: Project) => void) =>
  useProjectStore.getState().commit(label, recipe);
