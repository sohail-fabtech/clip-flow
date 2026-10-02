import type { Clip, MediaClip } from '@/features/editor/model/types';
import { hasMedia } from '@/features/editor/model/types';
import { changeSpeed } from '@/features/editor/actions';
import { useProjectStore } from '@/features/editor/store/project-store';
import { Group } from '@/features/editor/ui/common';
import { editClips } from '@/features/editor/ui/inspector/edit';
import { AnimRow, NumberRow } from '@/features/editor/ui/inspector/fields';

export function AudioTab({ clips }: { clips: Clip[] }) {
  const fps = useProjectStore(s => s.project.settings.fps);
  const media = clips.filter(hasMedia) as MediaClip[];
  if (!media.length) return null;
  const primary = media[0];
  const ids = media.map(c => c.id);
  const setFade = (key: 'fadeIn' | 'fadeOut', seconds: number, phase: 'live' | 'commit') =>
    editClips(
      ids,
      key === 'fadeIn' ? 'Fade in' : 'Fade out',
      clip => {
        if (hasMedia(clip)) clip.audio[key] = Math.min(clip.duration, Math.round(seconds * fps));
      },
      phase,
    );

  return (
    <>
      <Group title='Levels'>
        <AnimRow label='Volume' prop='volume' clips={media} min={-60} max={12} step={0.5} precision={1} unit='dB' />
        <NumberRow
          label='Fade In'
          value={primary.audio.fadeIn / fps}
          min={0}
          max={primary.duration / fps}
          step={0.05}
          precision={2}
          unit='s'
          onChange={(v, p) => setFade('fadeIn', v, p)}
        />
        <NumberRow
          label='Fade Out'
          value={primary.audio.fadeOut / fps}
          min={0}
          max={primary.duration / fps}
          step={0.05}
          precision={2}
          unit='s'
          onChange={(v, p) => setFade('fadeOut', v, p)}
        />
      </Group>
      <Group title='Playback'>
        <NumberRow
          label='Speed'
          value={primary.speed}
          min={0.1}
          max={16}
          step={0.05}
          precision={2}
          unit='×'
          onChange={(v, phase) => phase === 'commit' && changeSpeed(v)}
        />
      </Group>
    </>
  );
}
