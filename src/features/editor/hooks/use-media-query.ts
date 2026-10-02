import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = event => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Predefined breakpoint hooks
export function useIsLargeScreen() {
  return useMediaQuery('(min-width: 1024px)');
}

export function useIsMediumScreen() {
  return useMediaQuery('(min-width: 768px)');
}

export function useIsSmallScreen() {
  return useMediaQuery('(max-width: 767px)');
}
