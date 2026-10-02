import { Music } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { ADD_AUDIO } from '@designcombo/state';
import { generateId } from '@designcombo/timeline';
import Draggable from '@/components/shared/draggable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsDraggingOverTimeline } from '@/features/editor/hooks/use-is-dragging-over-timeline';
import { AUDIOS } from '@/features/editor/data/audio';

type AudioTrack = (typeof AUDIOS)[number];

export const Audios = () => {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();

  const handleAddAudio = (audio: AudioTrack) =>
    dispatch(ADD_AUDIO, { payload: { ...audio, id: generateId() }, options: {} });

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
                key={audio.id ?? index}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

interface AudioItemProps {
  audio: AudioTrack;
  shouldDisplayPreview: boolean;
  handleAddAudio: (audio: AudioTrack) => void;
}

const AudioItem = ({ handleAddAudio, audio, shouldDisplayPreview }: AudioItemProps) => {
  return (
    <Draggable
      data={audio}
      renderCustomPreview={
        <div className='flex h-[70px] w-[70px] items-center justify-center rounded bg-[#27272A] text-white'>
          <Music width={24} />
        </div>
      }
      shouldDisplayPreview={shouldDisplayPreview}
    >
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
        </div>
      </div>
    </Draggable>
  );
};
