import Draggable from '@/components/shared/draggable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HorizontalScroll } from '@/components/ui/horizontal-scroll';
import { dispatch } from '@designcombo/events';
import { ADD_AUDIO, ADD_ITEMS } from '@designcombo/state';
import { Music } from 'lucide-react';
import { useIsDraggingOverTimeline } from '@/features/editor/hooks/use-is-dragging-over-timeline';
import React from 'react';
import { generateId } from '@designcombo/timeline';
import { AUDIOS } from '@/features/editor/data/audio';
import { Separator } from '@/components/ui/separator';

export const Audios = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();

  const handleAddAudio = payload => {
    payload.id = generateId();
    dispatch(ADD_AUDIO, {
      payload,
      options: {},
    });

    console.log('Added audio with payload:', payload);
  };

  // Main view
  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Music</h1>
      <Separator className='w-full bg-white/60' />
      <ScrollArea className='w-full h-full max-h-100 2xl:max-h-120 overflow-hidden p-3'>
        <div className='flex flex-col gap-2'>
          {AUDIOS.map((audio, index) => {
            return (
              <AudioItem
                shouldDisplayPreview={!isDraggingOverTimeline}
                handleAddAudio={handleAddAudio}
                audio={audio}
                key={index}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const AudioItem = ({ handleAddAudio, audio, shouldDisplayPreview }) => {
  const style = React.useMemo(
    () => ({
      backgroundImage: 'url(https://cdn.designcombo.dev/thumbnails/music-preview.png)',
      backgroundSize: 'cover',
      width: '70px',
      height: '70px',
    }),
    [],
  );

  return (
    <Draggable data={audio} renderCustomPreview={<div style={style} />} shouldDisplayPreview={shouldDisplayPreview}>
      <div
        draggable={false}
        onClick={() => handleAddAudio(audio)}
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr',
        }}
        className='flex cursor-pointer gap-4  p-1 rounded-[4px] text-sm hover:bg-black/10 border border-white/5 text-white'
      >
        <div className='flex h-12 items-center justify-center bg-black/30 rounded'>
          <Music width={16} />
        </div>
        <div className='flex flex-col justify-center'>
          <div>{audio.name}</div>
          <div className='text-zinc-400'>{audio.metadata?.author}</div>
          {audio.metadata?.mood && <div className='text-xs text-zinc-500'>{audio.metadata.mood}</div>}
        </div>
      </div>
    </Draggable>
  );
};
