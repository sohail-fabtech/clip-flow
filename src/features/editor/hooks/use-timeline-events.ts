import { useEffect } from 'react';
import { filter, subject } from '@designcombo/events';
import { LAYER_PREFIX, LAYER_SELECTION } from '@designcombo/state';
import { TIMELINE_SEEK } from '@designcombo/timeline';
import useStore from '@/features/editor/stores/use-store';
import {
  PLAYER_PAUSE,
  PLAYER_PLAY,
  PLAYER_PREFIX,
  PLAYER_SEEK,
  PLAYER_SEEK_BY,
  PLAYER_TOGGLE_PLAY,
} from '@/features/editor/constants/events';
import { getSafeCurrentFrame } from '@/features/editor/utils/time';

const useTimelineEvents = () => {
  const playerRef = useStore(state => state.playerRef);
  const fps = useStore(state => state.fps);
  const setState = useStore(state => state.setState);

  useEffect(() => {
    const seek = (time?: number) => {
      if (typeof time === 'number') playerRef?.current?.seekTo((time / 1000) * fps);
    };

    const subscription = subject
      .pipe(filter(({ key }) => key.startsWith(PLAYER_PREFIX) || key === TIMELINE_SEEK))
      .subscribe(({ key, value }) => {
        const player = playerRef?.current;
        if (!player) return;
        const payload = value?.payload;
        if (key === TIMELINE_SEEK || key === PLAYER_SEEK) seek(payload?.time);
        else if (key === PLAYER_PLAY) player.play();
        else if (key === PLAYER_PAUSE) player.pause();
        else if (key === PLAYER_TOGGLE_PLAY) player.toggle();
        else if (key === PLAYER_SEEK_BY && typeof payload?.frames === 'number') {
          player.seekTo(Math.round(getSafeCurrentFrame(playerRef)) + payload.frames);
        }
      });
    return () => subscription.unsubscribe();
  }, [playerRef, fps]);

  useEffect(() => {
    const subscription = subject
      .pipe(filter(({ key }) => key.startsWith(LAYER_PREFIX)))
      .subscribe(({ key, value }) => {
        if (key === LAYER_SELECTION) setState({ activeIds: value?.payload?.activeIds ?? [] });
      });
    return () => subscription.unsubscribe();
  }, [setState]);
};

export default useTimelineEvents;
