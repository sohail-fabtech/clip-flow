import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SHORTCUT_DOCS } from '@/features/editor/shortcuts/keymap';
import { useUiStore } from '@/features/editor/store/ui-store';
import { isMac } from '@/features/editor/ui/common';

export function ShortcutsDialog() {
  const open = useUiStore(s => s.shortcutsOpen);
  const setOpen = useUiStore(s => s.setShortcutsOpen);
  const mod = isMac() ? '⌘' : 'Ctrl+';
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Shortcuts are disabled while typing in a field.</DialogDescription>
        </DialogHeader>
        <div className='grid max-h-[65vh] grid-cols-2 gap-x-8 gap-y-5 overflow-y-auto pr-1'>
          {SHORTCUT_DOCS.map(group => (
            <div key={group.group}>
              <div className='mb-2 text-xs font-medium text-ink'>{group.group}</div>
              <div className='space-y-1.5'>
                {group.items.map(([keys, label]) => (
                  <div key={label} className='flex items-baseline gap-3'>
                    <kbd className='min-w-24 shrink-0 font-mono text-[11px] text-ink-2'>
                      {keys.replace(/Mod\+?/g, mod)}
                    </kbd>
                    <span className='text-xs text-ink-3'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
