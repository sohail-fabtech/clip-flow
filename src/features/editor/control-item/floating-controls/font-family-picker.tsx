import { useRef, useState } from 'react';
import useDataState from '@/features/editor/stores/use-data-state';
import { SearchIcon, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useClickOutside from '@/features/editor/hooks/use-click-outside';
import { loadFonts } from '@/features/editor/utils/fonts';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { Separator } from '@/components/ui/separator';
// import Draggable from 'react-draggable';

export const onChangeFontFamily = async (font, trackItem) => {
  const fontName = font.default.postScriptName;
  const fontUrl = font.default.url;

  await loadFonts([
    {
      name: fontName,
      url: fontUrl,
    },
  ]);

  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem.id]: {
        details: {
          fontFamily: fontName,
          fontUrl: fontUrl,
        },
      },
    },
  });
};

export default function FontFamilyPicker() {
  const { compactFonts } = useDataState();
  const [search, setSearch] = useState('');
  const { setFloatingControl, trackItem } = useLayoutStore();

  const filteredFonts = compactFonts.filter(font => font.family.toLowerCase().includes(search.toLowerCase()));

  const floatingRef = useRef(null);
  useClickOutside(floatingRef, () => setFloatingControl(''));

  return (
    <div ref={floatingRef} className='absolute right-2 top-2 z-[200] w-56  bg-[#27272A] text-white rounded p-0'>
      <div className='handle flex cursor-grab justify-between px-2 py-4'>
        <p className='text-sm font-bold'>Fonts</p>
        <div className='h-4 w-4' onClick={() => setFloatingControl('')}>
          <X className='h-4 w-4 cursor-pointer font-extrabold text-muted-foreground' />
        </div>
      </div>
      <Separator className='w-full bg-white/60' />
      <div className='flex items-center p-1 border border-white/60 rounded-[6px] m-2'>
        <SearchIcon className='mr-2 h-4 w-4 shrink-0 opacity-50' />
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search font...'
          className='w-full rounded-md bg-transparent p-1 text-sm text-muted-foreground outline-none'
        />
      </div>
      <ScrollArea className='h-[400px] w-full py-2'>
        {filteredFonts.length > 0 ? (
          filteredFonts.map((font, index) => (
            <div
              key={index}
              onClick={() => {
                if (trackItem) {
                  onChangeFontFamily(font, trackItem);
                }
              }}
              className='cursor-pointer px-2 py-1 hover:bg-zinc-800/50'
            >
              <img style={{ filter: 'invert(100%)' }} src={font.default.preview} alt={font.family} />
            </div>
          ))
        ) : (
          <p className='py-2 text-center text-sm text-muted-foreground'>No font found</p>
        )}
      </ScrollArea>
    </div>
  );
}
