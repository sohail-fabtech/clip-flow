import { useEffect } from 'react';
import { BINDINGS } from '@/features/editor/shortcuts/keymap';
import { isMac } from '@/features/editor/ui/common';

const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
};

export function useShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.defaultPrevented) return;
      const mod = isMac() ? e.metaKey : e.ctrlKey;
      const binding = BINDINGS.find(([match]) => match(e, mod));
      if (!binding) return;
      e.preventDefault();
      binding[1](e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
