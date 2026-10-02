import { useEffect, useState } from 'react';
import { useProjectStore } from '@/features/editor/store/project-store';
import { saveProject } from '@/features/editor/store/persistence';

const DELAY_MS = 800;

export type SaveStatus = 'saved' | 'saving' | 'error';

export function useAutosave() {
  const project = useProjectStore(state => state.project);
  const pending = useProjectStore(state => state.pending);
  const [status, setStatus] = useState<SaveStatus>('saved');

  useEffect(() => {
    if (!project || pending) return;
    setStatus('saving');
    const timer = setTimeout(() => {
      saveProject(project)
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [project, pending]);

  return status;
}
