import { useEffect } from 'react';
import { AudioWaveform, Diamond, SlidersHorizontal, Type, Video } from 'lucide-react';
import type { Clip, ClipKind } from '@/features/editor/model/types';
import { useProjectStore } from '@/features/editor/store/project-store';
import { useUiStore, type InspectorTab } from '@/features/editor/store/ui-store';
import { PanelHeader } from '@/features/editor/ui/common';
import { ProjectSettings } from '@/features/editor/ui/inspector/project-settings';
import { VideoTab } from '@/features/editor/ui/inspector/video-tab';
import { AdjustTab } from '@/features/editor/ui/inspector/adjust-tab';
import { AudioTab } from '@/features/editor/ui/inspector/audio-tab';
import { AnimateTab, TextTab } from '@/features/editor/ui/inspector/text-tab';
import { cn } from '@/lib/utils';

const TABS: Record<InspectorTab, { label: string; icon: typeof Video }> = {
  video: { label: 'Video', icon: Video },
  adjust: { label: 'Adjust', icon: SlidersHorizontal },
  audio: { label: 'Audio', icon: AudioWaveform },
  text: { label: 'Text', icon: Type },
  animate: { label: 'Animate', icon: Diamond },
};

const TABS_FOR: Record<ClipKind, InspectorTab[]> = {
  video: ['video', 'adjust'],
  image: ['video', 'adjust'],
  shape: ['video'],
  audio: ['audio'],
  text: ['text', 'animate', 'video'],
};

const TAB_CONTENT: Record<InspectorTab, (props: { clips: Clip[] }) => React.ReactNode> = {
  video: VideoTab,
  adjust: AdjustTab,
  audio: AudioTab,
  text: TextTab,
  animate: AnimateTab,
};

export function InspectorPanel() {
  const clipsMap = useProjectStore(s => s.project.clips);
  const selection = useUiStore(s => s.selection);
  const tab = useUiStore(s => s.inspectorTab);
  const setTab = useUiStore(s => s.setInspectorTab);
  const clips = selection.map(id => clipsMap[id]).filter(Boolean);
  const primary = clips[0];
  const sameKind = primary ? clips.filter(c => c.kind === primary.kind) : [];
  const tabs = primary ? TABS_FOR[primary.kind] : [];
  const active = tabs.includes(tab) ? tab : tabs[0];

  useEffect(() => {
    if (active && active !== tab) setTab(active);
  }, [active, tab, setTab]);

  if (!primary) {
    return (
      <div className='flex h-full flex-col bg-surface' role='region' aria-label='Inspector'>
        <PanelHeader title='Inspector' />
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <ProjectSettings />
        </div>
      </div>
    );
  }

  const Content = TAB_CONTENT[active];
  return (
    <div className='flex h-full flex-col bg-surface' role='region' aria-label='Inspector'>
      <PanelHeader
        title={
          sameKind.length > 1 ? `${sameKind.length} clips selected` : primary.kind === 'text' ? 'Text' : primary.name
        }
      />
      <div className='flex shrink-0 gap-0.5 border-b border-line-subtle px-2 py-1.5' role='tablist'>
        {tabs.map(key => {
          const { label, icon: Icon } = TABS[key];
          return (
            <button
              key={key}
              type='button'
              role='tab'
              aria-selected={active === key}
              onClick={() => setTab(key)}
              className={cn(
                'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs text-ink-3 transition-colors hover:bg-white/8 hover:text-ink',
                active === key && 'bg-white/12 text-ink',
              )}
            >
              <Icon className='size-3.5' />
              {label}
            </button>
          );
        })}
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <Content clips={sameKind} />
      </div>
    </div>
  );
}
