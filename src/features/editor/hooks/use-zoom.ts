import { useCallback, useEffect, useState, type RefObject } from 'react';

const PADDING = 30;

function useZoom(containerRef: RefObject<HTMLElement | null>, size: { width: number; height: number }) {
  const [zoom, setZoom] = useState(0.01);

  const recalculateZoom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    setZoom(Math.min((container.clientWidth - PADDING) / size.width, (container.clientHeight - PADDING) / size.height));
  }, [containerRef, size]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    recalculateZoom();
    const observer = new ResizeObserver(recalculateZoom);
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalculateZoom]);

  return { zoom, recalculateZoom };
}

export default useZoom;
