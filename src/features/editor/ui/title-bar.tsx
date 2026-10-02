import { useRef } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronLeft,
  CircleAlert,
  Download,
  FolderOpen,
  Keyboard,
  Loader2,
  MoreHorizontal,
  Redo2,
  Undo2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AutosizeInput from '@/components/ui/autosize-input';
import type { Project } from '@/features/editor/model/types';
import * as actions from '@/features/editor/actions';
import { useProjectStore } from '@/features/editor/store/project-store';
import { edit } from '@/features/editor/ui/inspector/edit';
import { useUiStore } from '@/features/editor/store/ui-store';
import type { SaveStatus } from '@/features/editor/store/use-autosave';
import { IconButton, mod } from '@/features/editor/ui/common';
import { toast } from '@/features/editor/ui/toasts';
import { downloadBlob } from '@/lib/download';

const STATUS: Record<SaveStatus, { icon: React.ReactNode; label: string }> = {
  saved: { icon: <Check className='size-3' />, label: 'Saved' },
  saving: { icon: <Loader2 className='size-3 animate-spin' />, label: 'Saving…' },
  error: { icon: <CircleAlert className='size-3 text-danger' />, label: 'Not saved' },
};

export function TitleBar({ status, onOpenProject }: { status: SaveStatus; onOpenProject: (project: Project) => void }) {
  const name = useProjectStore(s => s.project.name);
  const canUndo = useProjectStore(s => s.past.length > 0);
  const canRedo = useProjectStore(s => s.future.length > 0);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportProject = () => {
    const project = useProjectStore.getState().project;
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${project.name}.vproj`);
  };

  return (
    <header className='flex h-10 shrink-0 items-center gap-2 border-b border-[var(--line-panel)] bg-base px-2'>
      <input
        ref={fileRef}
        type='file'
        accept='.vproj,application/json'
        hidden
        onChange={async e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            const project = JSON.parse(await file.text()) as Project;
            if (!project.tracks || !project.clips || !project.settings) throw new Error();
            onOpenProject(project);
          } catch {
            toast('That file is not a valid project', 'error');
          }
        }}
      />
      <Link
        href='/'
        className='flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-3 hover:bg-white/8 hover:text-ink'
        aria-label='All projects'
      >
        <ChevronLeft className='size-4' /> Projects
      </Link>
      <div className='mx-1 h-4 w-px bg-line' />
      <IconButton label='Undo' shortcut={mod('Z')} disabled={!canUndo} onClick={actions.undo}>
        <Undo2 />
      </IconButton>
      <IconButton label='Redo' shortcut={mod('⇧Z')} disabled={!canRedo} onClick={actions.redo}>
        <Redo2 />
      </IconButton>

      <div className='flex flex-1 items-center justify-center gap-2'>
        <AutosizeInput
          aria-label='Project name'
          value={name}
          onChange={e => edit('Rename project', d => void (d.name = e.target.value), 'live')}
          onBlur={e =>
            edit('Rename project', d => void (d.name = e.target.value.trim() || 'Untitled project'), 'commit')
          }
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          inputClassName='rounded px-1.5 py-0.5 text-center text-[13px] font-medium text-ink-2 outline-none hover:bg-white/5 focus:bg-white/8'
        />
        <span className='flex items-center gap-1 text-[11px] text-ink-4' role='status'>
          {STATUS[status].icon}
          {STATUS[status].label}
        </span>
      </div>

      <IconButton label='Keyboard shortcuts' shortcut='?' onClick={() => useUiStore.getState().setShortcutsOpen(true)}>
        <Keyboard />
      </IconButton>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            aria-label='Project menu'
            className='inline-flex size-7 items-center justify-center rounded-md text-ink-3 hover:bg-white/8 hover:text-ink'
          >
            <MoreHorizontal className='size-4' />
          </button>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-56 p-1'>
          {[
            { icon: <Download />, label: 'Export project file (.vproj)', onClick: exportProject },
            { icon: <FolderOpen />, label: 'Open project file…', onClick: () => fileRef.current?.click() },
          ].map(item => (
            <button
              key={item.label}
              type='button'
              onClick={item.onClick}
              className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-ink-2 hover:bg-white/10 [&_svg]:size-3.5'
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      <Button size='sm' onClick={() => useUiStore.getState().setExportOpen(true)} title={`Export (${mod('E')})`}>
        <Upload className='size-3.5' /> Export
      </Button>
    </header>
  );
}
