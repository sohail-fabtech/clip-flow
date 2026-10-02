import { useEffect, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import { dispatch } from '@designcombo/events';
import { ENTER_EDIT_MODE } from '@designcombo/state';
import useStore from '@/features/editor/stores/use-store';
import { getTargetById, getTypeFromClassName } from '@/features/editor/utils/target';

const disableAncestorPointerEvents = () => {
  document.querySelectorAll('[data-track-item="transition-element"]').forEach(element => {
    let parent = element.parentElement;
    while (parent && parent.className !== '__remotion-player') {
      parent.style.pointerEvents = 'none';
      parent = parent.parentElement;
    }
  });
};

export default function useUpdateAncestors({
  playing,
  playerRef,
}: {
  playing: boolean;
  playerRef: RefObject<PlayerRef | null> | null;
}) {
  const { trackItemIds, activeIds } = useStore();

  useEffect(() => {
    if (!playing) disableAncestorPointerEvents();
  }, [playing, trackItemIds, activeIds]);

  useEffect(() => {
    const player = playerRef?.current;
    player?.addEventListener('seeked', disableAncestorPointerEvents);
    return () => player?.removeEventListener('seeked', disableAncestorPointerEvents);
  }, [playerRef]);

  useEffect(() => {
    if (activeIds.length !== 1) {
      dispatch(ENTER_EDIT_MODE, { payload: { id: null } });
      return;
    }
    const [id] = activeIds;
    const element = getTargetById(id);
    if (!element || getTypeFromClassName(element.className) !== 'text') return;
    const onDoubleClick = (event: MouseEvent) => {
      dispatch(ENTER_EDIT_MODE, { payload: { id } });
      event.stopPropagation();
    };
    element.addEventListener('dblclick', onDoubleClick);
    return () => element.removeEventListener('dblclick', onDoubleClick);
  }, [activeIds]);
}
