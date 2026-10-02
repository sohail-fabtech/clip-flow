import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { cn } from '@/lib/utils';

export type MenuItem =
  | { label: string; shortcut?: string; onSelect: () => void; disabled?: boolean; danger?: boolean }
  | 'separator';

interface MenuStore {
  menu: { x: number; y: number; items: MenuItem[] } | null;
  open: (x: number, y: number, items: MenuItem[]) => void;
  close: () => void;
}

export const useContextMenu = create<MenuStore>(set => ({
  menu: null,
  open: (x, y, items) => set({ menu: { x, y, items } }),
  close: () => set({ menu: null }),
}));

export const openMenu = (event: React.MouseEvent, items: MenuItem[]) => {
  event.preventDefault();
  event.stopPropagation();
  useContextMenu.getState().open(event.clientX, event.clientY, items);
};

export function ContextMenuHost() {
  const { menu, close } = useContextMenu();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('blur', close);
    return () => {
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('blur', close);
    };
  }, [menu, close]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !menu) return;
    const rect = el.getBoundingClientRect();
    el.style.left = `${Math.min(menu.x, window.innerWidth - rect.width - 8)}px`;
    el.style.top = `${Math.min(menu.y, window.innerHeight - rect.height - 8)}px`;
  }, [menu]);

  if (!menu) return null;
  return (
    <div
      ref={ref}
      role='menu'
      className='fixed z-[2000] min-w-48 rounded-lg border border-line bg-raised p-1 text-xs shadow-2xl'
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.items.map((item, i) =>
        item === 'separator' ? (
          <div key={i} className='my-1 h-px bg-line' />
        ) : (
          <button
            key={i}
            type='button'
            role='menuitem'
            disabled={item.disabled}
            onClick={() => {
              close();
              item.onSelect();
            }}
            className={cn(
              'flex w-full items-center justify-between gap-6 rounded-md px-2 py-1.5 text-left text-ink-2 hover:bg-white/10 hover:text-ink disabled:pointer-events-none disabled:opacity-35',
              item.danger && 'text-danger hover:text-danger',
            )}
          >
            {item.label}
            {item.shortcut && <span className='font-mono text-[10px] text-ink-4'>{item.shortcut}</span>}
          </button>
        ),
      )}
    </div>
  );
}
