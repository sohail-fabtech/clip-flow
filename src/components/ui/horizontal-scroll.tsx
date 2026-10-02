import { useEffect, useRef, useState, type ReactNode } from 'react';

export const HorizontalScroll = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const [shadows, setShadows] = useState({ left: false, right: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const update = () =>
      setShadows({
        left: element.scrollLeft > 0,
        right: element.scrollLeft < element.scrollWidth - element.clientWidth - 1,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener('scroll', update);
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {shadows.left && (
        <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-gradient-to-r from-black/50 via-black/30 to-transparent' />
      )}
      {shadows.right && (
        <div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-gradient-to-l from-black/50 via-black/30 to-transparent' />
      )}
      <div ref={scrollRef} className='overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {children}
      </div>
    </div>
  );
};
