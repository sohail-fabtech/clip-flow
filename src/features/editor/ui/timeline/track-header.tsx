import { memo, useState } from 'react';
import { Eye, EyeOff, Lock, LockOpen, Trash2, Volume2, VolumeX } from 'lucide-react';
import type { Track } from '@/features/editor/model/types';
import { deleteTrack, updateTrack } from '@/features/editor/actions';
import { IconButton } from '@/features/editor/ui/common';
import { HEADER_WIDTH, trackHeight } from '@/features/editor/ui/timeline/geometry';
import { cn } from '@/lib/utils';

export const TrackHeader = memo(function TrackHeader({ track, canDelete }: { track: Track; canDelete: boolean }) {
  const [editing, setEditing] = useState(false);
  return (
    <div
      className={cn(
        'group/track sticky left-0 z-20 flex shrink-0 items-center gap-1 border-r border-b border-line bg-surface px-2',
        track.kind === 'video' ? 'border-l-2 border-l-[var(--clip-video)]' : 'border-l-2 border-l-[var(--clip-audio)]',
      )}
      style={{ width: HEADER_WIDTH, height: trackHeight(track.kind) }}
    >
      {editing ? (
        <input
          autoFocus
          defaultValue={track.name}
          aria-label='Track name'
          className='h-6 w-14 rounded border border-selection/60 bg-base px-1 text-xs outline-none'
          onBlur={e => {
            setEditing(false);
            if (e.target.value.trim()) updateTrack(track.id, { name: e.target.value.trim() });
          }}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <button type='button' onDoubleClick={() => setEditing(true)} className='w-14 truncate text-left text-xs font-semibold text-ink-2' title='Double-click to rename'>
          {track.name}
        </button>
      )}
      <div className='ml-auto flex items-center'>
        {canDelete && (
          <IconButton label='Delete track' onClick={() => deleteTrack(track.id)} className='size-6 opacity-0 group-hover/track:opacity-100 [&_svg]:size-3.5'>
            <Trash2 />
          </IconButton>
        )}
        <IconButton label={track.locked ? 'Unlock track' : 'Lock track'} active={track.locked} onClick={() => updateTrack(track.id, { locked: !track.locked })} className='size-6 [&_svg]:size-3.5'>
          {track.locked ? <Lock /> : <LockOpen />}
        </IconButton>
        {track.kind === 'video' ? (
          <IconButton label={track.hidden ? 'Show track' : 'Hide track'} active={track.hidden} onClick={() => updateTrack(track.id, { hidden: !track.hidden })} className='size-6 [&_svg]:size-3.5'>
            {track.hidden ? <EyeOff /> : <Eye />}
          </IconButton>
        ) : (
          <IconButton label={track.muted ? 'Unmute track' : 'Mute track'} active={track.muted} onClick={() => updateTrack(track.id, { muted: !track.muted })} className='size-6 [&_svg]:size-3.5'>
            {track.muted ? <VolumeX /> : <Volume2 />}
          </IconButton>
        )}
      </div>
    </div>
  );
});
