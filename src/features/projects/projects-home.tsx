'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clapperboard, FolderOpen, Plus, Search, Trash2 } from 'lucide-react';
import { createProject } from '@/features/editor/model/defaults';
import type { Project } from '@/features/editor/model/types';
import { deleteProject, listProjects, saveProject } from '@/features/editor/store/persistence';
import { projectDuration } from '@/features/editor/engine/edits';
import { shortTime } from '@/features/editor/model/time';
import { ASPECTS, sizeFor } from '@/features/editor/ui/inspector/project-settings';
import { cn } from '@/lib/utils';

const ago = (time: number) => {
  const minutes = Math.round((Date.now() - time) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return new Date(time).toLocaleDateString();
};

const PRESETS = ASPECTS.slice(0, 4);

export function ProjectsHome() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [query, setQuery] = useState('');
  const [aspect, setAspect] = useState<string>('16:9');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listProjects().then(setProjects);
  }, []);

  const open = async (project: Project) => {
    await saveProject(project);
    router.push(`/editor/${project.id}`);
  };

  const create = () => {
    const project = createProject();
    const preset = ASPECTS.find(a => a.value === aspect)!;
    Object.assign(project.settings, sizeFor(preset, 1080));
    open(project);
  };

  const visible = (projects ?? []).filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className='min-h-dvh bg-base'>
      <input
        ref={fileRef}
        type='file'
        accept='.vproj,application/json'
        hidden
        onChange={async e => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const project = JSON.parse(await file.text()) as Project;
            if (project.tracks && project.clips && project.settings) open({ ...project, updatedAt: Date.now() });
          } catch {
            return;
          }
        }}
      />
      <div className='mx-auto max-w-5xl px-6 py-10'>
        <header className='mb-8 flex items-center gap-3'>
          <div className='flex size-8 items-center justify-center rounded-lg bg-white/10'>
            <Clapperboard className='size-4' />
          </div>
          <h1 className='text-lg font-semibold'>Video Editor</h1>
        </header>

        <section className='mb-10 rounded-xl border border-line bg-surface p-5'>
          <div className='mb-4 text-sm font-medium'>New project</div>
          <div className='flex flex-wrap items-end gap-3'>
            {PRESETS.map(preset => (
              <button
                key={preset.value}
                type='button'
                onClick={() => setAspect(preset.value)}
                className={cn(
                  'flex w-28 flex-col items-center gap-2 rounded-lg border border-line p-3 text-xs text-ink-3 hover:border-line-strong',
                  aspect === preset.value && 'border-selection bg-selection/10 text-ink',
                )}
              >
                <span className='flex h-12 items-center'>
                  <span className='rounded-sm border border-current' style={{ width: (preset.w / Math.max(preset.w, preset.h)) * 44, height: (preset.h / Math.max(preset.w, preset.h)) * 44 }} />
                </span>
                {preset.label}
              </button>
            ))}
            <div className='ml-auto flex gap-2'>
              <button type='button' onClick={() => fileRef.current?.click()} className='flex h-9 items-center gap-2 rounded-md border border-line px-3 text-xs text-ink-2 hover:bg-white/5'>
                <FolderOpen className='size-4' /> Open file
              </button>
              <button type='button' onClick={create} className='flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-white'>
                <Plus className='size-4' /> Create
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-sm font-medium'>My projects</h2>
            <div className='flex w-64 items-center gap-2 rounded-md border border-line bg-surface px-2'>
              <Search className='size-3.5 text-ink-4' />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder='Search projects' aria-label='Search projects' className='h-8 flex-1 bg-transparent text-xs outline-none' />
            </div>
          </div>
          {projects === null ? null : visible.length === 0 ? (
            <div className='rounded-xl border border-dashed border-line py-16 text-center text-xs text-ink-4'>
              {projects.length ? 'No matching projects' : 'No projects yet — create one above.'}
            </div>
          ) : (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3'>
              {visible.map(project => (
                <div key={project.id} className='group relative rounded-lg border border-line bg-surface transition-colors hover:border-line-strong'>
                  <button type='button' onClick={() => router.push(`/editor/${project.id}`)} className='block w-full text-left'>
                    <div className='flex aspect-video items-center justify-center rounded-t-lg bg-raised'>
                      <span className='font-mono text-[11px] text-ink-4'>
                        {project.settings.width}×{project.settings.height}
                      </span>
                    </div>
                    <div className='p-2.5'>
                      <div className='truncate text-xs font-medium text-ink-2'>{project.name}</div>
                      <div className='mt-0.5 text-[11px] text-ink-4'>
                        {ago(project.updatedAt)} · {shortTime(projectDuration(project), project.settings.fps)}
                      </div>
                    </div>
                  </button>
                  <button
                    type='button'
                    aria-label={`Delete ${project.name}`}
                    onClick={async () => {
                      if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
                      await deleteProject(project.id);
                      setProjects(list => list?.filter(p => p.id !== project.id) ?? null);
                    }}
                    className='absolute top-1.5 right-1.5 hidden size-6 items-center justify-center rounded bg-black/60 text-ink-3 group-hover:flex hover:text-danger'
                  >
                    <Trash2 className='size-3.5' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
