import { useIsSmallScreen } from '@/features/editor/hooks/use-media-query';
import { TIMELINE_OFFSET_X_SMALL, TIMELINE_OFFSET_X_LARGE } from '@/features/editor/constants/constants';

export function useTimelineOffsetX() {
  const isSmallScreen = useIsSmallScreen();
  return isSmallScreen ? TIMELINE_OFFSET_X_SMALL : TIMELINE_OFFSET_X_LARGE;
}
