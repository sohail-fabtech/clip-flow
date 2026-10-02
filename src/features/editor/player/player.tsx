import { useEffect, useRef } from 'react';
import { Player as RemotionPlayer, type PlayerRef } from '@remotion/player';
import Composition from '@/features/editor/player/composition';
import useStore from '@/features/editor/stores/use-store';

const Player = () => {
  const playerRef = useRef<PlayerRef>(null);
  const { setPlayerRef, duration, fps, size, background } = useStore();

  useEffect(() => {
    setPlayerRef(playerRef);
  }, [setPlayerRef]);

  return (
    <RemotionPlayer
      ref={playerRef}
      component={Composition}
      durationInFrames={Math.round((duration / 1000) * fps) || 1}
      compositionWidth={size.width}
      compositionHeight={size.height}
      className='h-full w-full'
      style={{ backgroundColor: background.value }}
      fps={fps}
      overflowVisible
    />
  );
};

export default Player;
