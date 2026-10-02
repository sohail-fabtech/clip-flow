import { useCallback, useSyncExternalStore } from 'react';

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useIsLargeScreen = () => useMediaQuery('(min-width: 1024px)');

export const useIsSmallScreen = () => useMediaQuery('(max-width: 767px)');
