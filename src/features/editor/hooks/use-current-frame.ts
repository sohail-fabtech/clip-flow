import { useCallback, useSyncExternalStore, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import { getSafeCurrentFrame } from '@/features/editor/utils/time';

export const useCurrentPlayerFrame = (ref: RefObject<PlayerRef | null> | null) => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const player = ref?.current;
      if (!player) return () => undefined;
      player.addEventListener('frameupdate', onStoreChange);
      return () => player.removeEventListener('frameupdate', onStoreChange);
    },
    [ref],
  );
  return useSyncExternalStore(
    subscribe,
    () => getSafeCurrentFrame(ref),
    () => 0,
  );
};
