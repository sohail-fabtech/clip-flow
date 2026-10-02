import { useEffect, type RefObject } from 'react';

const useClickOutside = (ref: RefObject<HTMLElement | null>, callback: () => void) => {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) callback();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, callback]);
};

export default useClickOutside;
