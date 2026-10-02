import { useRef, useState } from 'react';
import { SearchIcon, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useDataState from '@/features/editor/stores/use-data-state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useClickOutside from '@/features/editor/hooks/use-click-outside';
import { applyFont } from '@/features/editor/utils/fonts';
import type { CompactFont } from '@/features/editor/types';

export const FontList = ({ search, onSelect }: { search: string; onSelect: (font: CompactFont) => void }) => {
  const compactFonts = useDataState(state => state.compactFonts);
  const fonts = compactFonts.filter(font => font.family.toLowerCase().includes(search.toLowerCase()));
  if (fonts.length === 0) return <p className='py-2 text-center text-sm text-muted-foreground'>No font found</p>;
  return fonts.map(font => (
    <button
      type='button'
      key={font.family}
      onClick={() => onSelect(font)}
      className='block w-full cursor-pointer px-2 py-1 hover:bg-zinc-800/50'
    >
      <img className='invert' src={font.default.preview} alt={font.family} />
    </button>
  ));
};

export default function FontFamilyPicker() {
  const [search, setSearch] = useState('');
  const { setFloatingControl, trackItem } = useLayoutStore();
  const floatingRef = useRef<HTMLDivElement>(null);
  useClickOutside(floatingRef, () => setFloatingControl(''));

  return (
    <div ref={floatingRef} className='absolute right-2 top-2 z-[200] w-56 rounded bg-[#27272A] p-0 text-white'>
      <div className='flex justify-between px-2 py-4'>
        <p className='text-sm font-bold'>Fonts</p>
        <button type='button' onClick={() => setFloatingControl('')} aria-label='Close'>
          <X className='h-4 w-4 text-muted-foreground' />
        </button>
      </div>
      <Separator className='w-full bg-white/60' />
      <div className='m-2 flex items-center rounded-[6px] border border-white/60 p-1'>
        <SearchIcon className='mr-2 h-4 w-4 shrink-0 opacity-50' />
        <input
          type='text'
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder='Search font...'
          className='w-full rounded-md bg-transparent p-1 text-sm text-muted-foreground outline-none'
        />
      </div>
      <ScrollArea className='h-[400px] w-full py-2'>
        <FontList search={search} onSelect={font => trackItem && applyFont(trackItem.id, font.default)} />
      </ScrollArea>
    </div>
  );
}
