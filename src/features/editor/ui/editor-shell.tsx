'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, MonitorSmartphone } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import type { Project } from '@/features/editor/model/types';
import { useProjectStore } from '@/features/editor/store/project-store';
import { loadProject, saveProject } from '@/features/editor/store/persistence';
import { useAutosave } from '@/features/editor/store/use-autosave';
import { usePlaybackStore } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { useShortcuts } from '@/features/editor/shortcuts/use-shortcuts';
import { useMediaQuery } from '@/features/editor/ui/use-media-query';
import { TitleBar } from '@/features/editor/ui/title-bar';
import { MediaPanel } from '@/features/editor/ui/media/media-panel';
import { PreviewPanel } from '@/features/editor/ui/preview/preview-panel';
import { InspectorPanel } from '@/features/editor/ui/inspector/inspector-panel';
import { TimelinePanel } from '@/features/editor/ui/timeline/timeline-panel';
import { ExportDialog } from '@/features/editor/ui/dialogs/export-dialog';
import { ShortcutsDialog } from '@/features/editor/ui/dialogs/shortcuts-dialog';
import { ContextMenuHost } from '@/features/editor/ui/context-menu';
import { Toaster } from '@/features/editor/ui/toasts';

function Workspace() {
  const router = useRouter();
  const status = useAutosave();
  useShortcuts();

  useEffect(() => {
    const block = (e: DragEvent) => e.dataTransfer?.types.includes('Files') && e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  const openProject = async (project: Project) => {
    await saveProject(project);
    router.push(`/editor/${project.id}`);
  };

  return (
    <div className='flex h-dvh flex-col overflow-hidden'>
      <TitleBar status={status} onOpenProject={openProject} />
      <ResizablePanelGroup orientation='vertical' className='min-h-0 flex-1'>
        <ResizablePanel defaultSize='60%' minSize='25%'>
          <ResizablePanelGroup orientation='horizontal'>
            <ResizablePanel defaultSize='22%' minSize={240} maxSize='40%'>
              <MediaPanel />
            </ResizablePanel>
            <ResizableHandle className='bg-[var(--line-panel)]' />
            <ResizablePanel minSize='25%'>
              <PreviewPanel />
            </ResizablePanel>
            <ResizableHandle className='bg-[var(--line-panel)]' />
            <ResizablePanel defaultSize='24%' minSize={260} maxSize='40%'>
              <InspectorPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle className='bg-[var(--line-panel)]' />
        <ResizablePanel defaultSize='40%' minSize={140}>
          <TimelinePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
      <ExportDialog />
      <ShortcutsDialog />
      <ContextMenuHost />
      <Toaster />
    </div>
  );
}

export default function EditorShell({ projectId }: { projectId: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const wideEnough = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    let alive = true;
    loadProject(projectId).then(project => {
      if (!alive) return;
      if (!project) return setState('missing');
      useProjectStore.getState().load(project);
      useUiStore.getState().select([]);
      usePlaybackStore.getState().setFrame(0);
      setState('ready');
    });
    return () => {
      alive = false;
    };
  }, [projectId]);

  if (!wideEnough) {
    return (
      <div className='flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center'>
        <MonitorSmartphone className='size-8 text-ink-4' />
        <div className='text-sm font-medium'>Use a larger screen</div>
        <p className='max-w-xs text-xs text-ink-3'>The editor needs a window at least 1024px wide. Widen the window or open it on a desktop.</p>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className='flex h-dvh items-center justify-center'>
        <Loader2 className='size-5 animate-spin text-ink-4' />
      </div>
    );
  }

  if (state === 'missing') {
    return (
      <div className='flex h-dvh flex-col items-center justify-center gap-3'>
        <div className='text-sm font-medium'>Project not found</div>
        <Link href='/' className='text-xs text-selection hover:underline'>
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Workspace />
    </TooltipProvider>
  );
}
