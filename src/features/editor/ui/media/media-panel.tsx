import { Bookmark, Captions, Clapperboard, Music, Shapes, Shuffle, Type } from 'lucide-react';
import { useUiStore, type LeftTab } from '@/features/editor/store/ui-store';
import { Hint, PanelHeader } from '@/features/editor/ui/common';
import { MediaTab } from '@/features/editor/ui/media/media-tab';
import {
  AudioTab,
  CaptionsTab,
  ElementsTab,
  MarkersTab,
  TextPresetsTab,
  TransitionsTab,
} from '@/features/editor/ui/media/library-tabs';
import { cn } from '@/lib/utils';

const TABS: { id: LeftTab; label: string; icon: typeof Music; content: () => React.ReactNode }[] = [
  { id: 'media', label: 'Media', icon: Clapperboard, content: MediaTab },
  { id: 'audio', label: 'Audio', icon: Music, content: AudioTab },
  { id: 'text', label: 'Text', icon: Type, content: TextPresetsTab },
  { id: 'captions', label: 'Captions', icon: Captions, content: CaptionsTab },
  { id: 'transitions', label: 'Transitions', icon: Shuffle, content: TransitionsTab },
  { id: 'elements', label: 'Elements', icon: Shapes, content: ElementsTab },
  { id: 'markers', label: 'Markers', icon: Bookmark, content: MarkersTab },
];

export function MediaPanel() {
  const tab = useUiStore(s => s.leftTab);
  const setTab = useUiStore(s => s.setLeftTab);
  const active = TABS.find(t => t.id === tab) ?? TABS[0];
  const Content = active.content;

  return (
    <div className='flex h-full bg-surface' role='region' aria-label='Media panel'>
      <nav
        className='flex w-11 shrink-0 flex-col items-center gap-1 border-r border-line-subtle py-2'
        role='tablist'
        aria-orientation='vertical'
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <Hint key={id} label={label} side='right'>
            <button
              type='button'
              role='tab'
              aria-selected={tab === id}
              aria-label={label}
              onClick={() => setTab(id)}
              className={cn(
                'flex size-8 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-white/8 hover:text-ink',
                tab === id && 'bg-white/12 text-ink',
              )}
            >
              <Icon className='size-4' />
            </button>
          </Hint>
        ))}
      </nav>
      <div className='flex min-w-0 flex-1 flex-col'>
        <PanelHeader title={active.label} />
        <Content />
      </div>
    </div>
  );
}
