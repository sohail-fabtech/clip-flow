import { memo, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import {
  ArrowDownUp,
  AudioLines,
  ChevronLeft,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  LayoutGrid,
  Link,
  List,
  Loader2,
  Plus,
  Search,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import type { Asset } from '@/features/editor/model/types';
import { addAsset } from '@/features/editor/actions';
import { importFiles, importUrl, useImportStore } from '@/features/editor/media/import';
import { getThumbs } from '@/features/editor/media/analysis';
import { commit, useProjectStore } from '@/features/editor/store/project-store';
import { shortTime } from '@/features/editor/model/time';
import { EmptyState, IconButton, mod } from '@/features/editor/ui/common';
import { openMenu } from '@/features/editor/ui/context-menu';
import { ASSET_MIME } from '@/features/editor/ui/timeline/geometry';
import { toast } from '@/features/editor/ui/toasts';
import { cn } from '@/lib/utils';

type Sort = 'date' | 'name' | 'type' | 'duration';
const SORTS: Record<Sort, (a: Asset, b: Asset) => number> = {
  date: (a, b) => b.createdAt - a.createdAt,
  name: (a, b) => a.name.localeCompare(b.name),
  type: (a, b) => a.kind.localeCompare(b.kind),
  duration: (a, b) => b.durationSec - a.durationSec,
};

const Thumb = memo(function Thumb({ asset }: { asset: Asset }) {
  const [src, setSrc] = useState<string | null>(asset.kind === 'image' ? asset.src : null);
  useEffect(() => {
    if (asset.kind !== 'video') return;
    let alive = true;
    getThumbs(asset.src, asset.durationSec).then(t => alive && setSrc(t?.frames[Math.floor(t.frames.length / 3)] ?? null));
    return () => {
      alive = false;
    };
  }, [asset]);
  if (asset.kind === 'audio')
    return (
      <div className='flex size-full items-center justify-center bg-[var(--clip-audio)]/40 text-white/80'>
        <AudioLines className='size-6' />
      </div>
    );
  return src ? <img src={src} alt='' draggable={false} className='size-full object-cover' /> : <div className='size-full bg-raised' />;
});

function JobList() {
  const jobs = useImportStore(s => s.jobs);
  const remove = useImportStore(s => s.remove);
  if (!jobs.length) return null;
  return (
    <div className='space-y-1 border-b border-line-subtle p-2'>
      {jobs.map(job => (
        <div key={job.id} className='flex items-center gap-2 rounded-md bg-base px-2 py-1.5 text-[11px]'>
          {job.error ? <TriangleAlert className='size-3.5 shrink-0 text-danger' /> : <Loader2 className='size-3.5 shrink-0 animate-spin text-ink-3' />}
          <div className='min-w-0 flex-1'>
            <div className='truncate text-ink-2'>{job.name}</div>
            {job.error ? (
              <div className='truncate text-danger'>{job.error}</div>
            ) : (
              <div className='mt-1 h-0.5 overflow-hidden rounded bg-white/10'>
                <div className='h-full bg-selection transition-[width]' style={{ width: `${Math.max(5, job.progress * 100)}%` }} />
              </div>
            )}
          </div>
          {job.error && (
            <button type='button' aria-label='Dismiss' onClick={() => remove(job.id)} className='text-ink-4 hover:text-ink'>
              <X className='size-3' />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function MediaTab() {
  const assets = useProjectStore(s => s.project.assets);
  const folders = useProjectStore(s => s.project.folders);
  const clips = useProjectStore(s => s.project.clips);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('date');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const usage = (id: string) => Object.values(clips).filter(c => 'assetId' in c && c.assetId === id).length;
  const list = Object.values(assets)
    .filter(a => (query ? a.name.toLowerCase().includes(query.toLowerCase()) : a.folderId === folderId))
    .sort(SORTS[sort]);
  const folder = folders.find(f => f.id === folderId);

  const importUrlNow = async () => {
    const value = url.trim();
    if (!value) return;
    setUrl('');
    const asset = await importUrl(value);
    if (asset) toast(`Imported ${asset.name}`);
  };

  const assetMenu = (e: React.MouseEvent, asset: Asset) => {
    const count = usage(asset.id);
    openMenu(e, [
      { label: 'Add to timeline', onSelect: () => addAsset(asset.id) },
      { label: 'Insert at playhead (ripple)', onSelect: () => addAsset(asset.id, undefined, true) },
      'separator',
      {
        label: 'Rename',
        onSelect: () => {
          const name = window.prompt('Rename media', asset.name)?.trim();
          if (name) commit('Rename media', d => void (d.assets[asset.id].name = name));
        },
      },
      ...folders
        .filter(f => f.id !== asset.folderId)
        .map(f => ({ label: `Move to ${f.name}`, onSelect: () => commit('Move media', d => void (d.assets[asset.id].folderId = f.id)) })),
      ...(asset.folderId ? [{ label: 'Move out of folder', onSelect: () => commit('Move media', d => void (d.assets[asset.id].folderId = null)) }] : []),
      'separator',
      {
        label: count ? `Delete (removes ${count} clip${count > 1 ? 's' : ''})` : 'Delete',
        danger: true,
        onSelect: () =>
          commit('Delete media', d => {
            delete d.assets[asset.id];
            for (const clip of Object.values(d.clips)) if ('assetId' in clip && clip.assetId === asset.id) delete d.clips[clip.id];
          }),
      },
    ]);
  };

  return (
    <div
      className={cn('relative flex min-h-0 flex-1 flex-col', dragging && 'ring-2 ring-selection ring-inset')}
      onDragOver={e => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={e => !e.currentTarget.contains(e.relatedTarget as Node) && setDragging(false)}
      onDrop={e => {
        if (!e.dataTransfer.files.length) return;
        e.preventDefault();
        setDragging(false);
        importFiles([...e.dataTransfer.files]);
      }}
    >
      <input
        ref={inputRef}
        type='file'
        multiple
        hidden
        accept='video/*,audio/*,image/*'
        onChange={e => {
          if (e.target.files) importFiles([...e.target.files]);
          e.target.value = '';
        }}
      />
      <div className='space-y-2 border-b border-line-subtle p-2'>
        <div className='flex gap-1.5'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md bg-white/10 text-xs font-medium text-ink hover:bg-white/15'
            title={`Import media (${mod('I')})`}
            data-import-button
          >
            <Upload className='size-3.5' /> Import
          </button>
          <IconButton
            label='New folder'
            onClick={() => {
              const name = window.prompt('Folder name', 'New folder')?.trim();
              if (name) commit('New folder', d => void d.folders.push({ id: nanoid(), name }));
            }}
          >
            <FolderPlus />
          </IconButton>
          <IconButton label={view === 'grid' ? 'List view' : 'Grid view'} onClick={() => setView(v => (v === 'grid' ? 'list' : 'grid'))}>
            {view === 'grid' ? <List /> : <LayoutGrid />}
          </IconButton>
          <IconButton
            label={`Sort by ${sort}`}
            onClick={() => setSort(s => (['date', 'name', 'type', 'duration'] as Sort[])[(['date', 'name', 'type', 'duration'].indexOf(s) + 1) % 4])}
          >
            <ArrowDownUp />
          </IconButton>
        </div>
        <div className='flex items-center gap-1.5 rounded-md border border-line bg-base px-2'>
          <Search className='size-3.5 text-ink-4' />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            placeholder='Search media'
            aria-label='Search media'
            className='h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-ink-4'
          />
        </div>
        <div className='flex items-center gap-1.5 rounded-md border border-line bg-base px-2'>
          <Link className='size-3.5 text-ink-4' />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation();
              if (e.key === 'Enter') importUrlNow();
            }}
            placeholder='Paste a media URL'
            aria-label='Import from URL'
            className='h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-ink-4'
          />
          {url && (
            <button type='button' onClick={importUrlNow} className='text-[11px] text-selection'>
              Import
            </button>
          )}
        </div>
      </div>

      <JobList />

      <div className='flex h-8 shrink-0 items-center gap-1 px-2 text-[11px] text-ink-4'>
        {folder && !query ? (
          <button type='button' onClick={() => setFolderId(null)} className='flex items-center gap-0.5 text-ink-3 hover:text-ink'>
            <ChevronLeft className='size-3.5' /> Library / {folder.name}
          </button>
        ) : (
          <span>{query ? 'Search results' : 'Library'}</span>
        )}
        <span className='ml-auto'>
          {list.length} item{list.length === 1 ? '' : 's'} · {sort}
        </span>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-2 pb-2'>
        {!query && !folderId && folders.length > 0 && (
          <div className='mb-2 grid grid-cols-3 gap-1.5'>
            {folders.map(f => (
              <button
                key={f.id}
                type='button'
                onDoubleClick={() => setFolderId(f.id)}
                onClick={() => setFolderId(f.id)}
                onContextMenu={e =>
                  openMenu(e, [
                    {
                      label: 'Rename folder',
                      onSelect: () => {
                        const name = window.prompt('Folder name', f.name)?.trim();
                        if (name) commit('Rename folder', d => void (d.folders.find(x => x.id === f.id)!.name = name));
                      },
                    },
                    {
                      label: 'Delete folder',
                      danger: true,
                      onSelect: () =>
                        commit('Delete folder', d => {
                          d.folders = d.folders.filter(x => x.id !== f.id);
                          for (const a of Object.values(d.assets)) if (a.folderId === f.id) a.folderId = null;
                        }),
                    },
                  ])
                }
                className='flex flex-col items-center gap-1 rounded-md p-2 text-[11px] text-ink-3 hover:bg-white/5'
              >
                <Folder className='size-7 fill-white/10 text-ink-4' />
                <span className='w-full truncate'>{f.name}</span>
              </button>
            ))}
          </div>
        )}

        {list.length === 0 ? (
          <EmptyState icon={<ImageIcon />} title={query ? 'No matching media' : 'No media yet'}>
            Import video, audio or images, or drop files here.
          </EmptyState>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1.5' : 'flex flex-col gap-0.5'}>
            {list.map(asset => (
              <div
                key={asset.id}
                role='button'
                tabIndex={0}
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData(ASSET_MIME, asset.id);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => setSelected(asset.id)}
                onDoubleClick={() => addAsset(asset.id)}
                onKeyDown={e => e.key === 'Enter' && addAsset(asset.id)}
                onContextMenu={e => assetMenu(e, asset)}
                className={cn(
                  'group cursor-grab overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-selection',
                  view === 'grid' ? 'flex flex-col' : 'flex items-center gap-2 p-1 hover:bg-white/5',
                  selected === asset.id && 'ring-1 ring-selection',
                )}
                title={`${asset.name} — double-click to add at playhead`}
              >
                <div className={cn('relative overflow-hidden rounded-[5px] bg-raised', view === 'grid' ? 'aspect-video w-full' : 'h-8 w-14 shrink-0')}>
                  <Thumb asset={asset} />
                  {asset.kind !== 'image' && view === 'grid' && (
                    <span className='absolute right-1 bottom-1 rounded bg-black/70 px-1 font-mono text-[9px] text-white/90'>
                      {shortTime(Math.round(asset.durationSec * 30), 30)}
                    </span>
                  )}
                  {usage(asset.id) > 0 && view === 'grid' && <span className='absolute top-1 left-1 size-1.5 rounded-full bg-selection' title='Used in timeline' />}
                  <button
                    type='button'
                    aria-label={`Add ${asset.name}`}
                    onClick={e => {
                      e.stopPropagation();
                      addAsset(asset.id);
                    }}
                    className='absolute top-1 right-1 hidden size-5 items-center justify-center rounded bg-black/70 text-white group-hover:flex'
                  >
                    <Plus className='size-3' />
                  </button>
                </div>
                <span className={cn('truncate text-[11px] text-ink-3', view === 'grid' ? 'px-0.5 pt-1' : 'flex-1')}>{asset.name}</span>
                {view === 'list' && asset.kind !== 'image' && <span className='font-mono text-[10px] text-ink-4'>{shortTime(Math.round(asset.durationSec * 30), 30)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {dragging && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-selection/10 text-xs font-medium text-ink'>
          Drop to import
        </div>
      )}
    </div>
  );
}

export const openImport = () => document.querySelector<HTMLButtonElement>('[data-import-button]')?.click();
