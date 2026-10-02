import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, Search, Strikethrough, Underline } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import SliderControl from '@/features/editor/control-item/common/slider-control';
import { ColorField } from '@/features/editor/control-item/common/color-field';
import { FontList } from '@/features/editor/control-item/floating-controls/font-family-picker';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { styleNameOf } from '@/features/editor/utils/fonts';
import type { CompactFont, FontInfo, ItemDetails } from '@/features/editor/types';

interface TextControlsProps {
  details: ItemDetails;
  selectedFont: CompactFont | null;
  onSelectFont: (font: FontInfo) => void;
  updateDetails: (details: Partial<ItemDetails>) => void;
}

const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const CASES = [
  { value: 'none', label: 'As typed' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
];

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className='flex gap-2'>
    <div className='flex flex-1 items-center text-sm text-muted-foreground'>{label}</div>
    <div className='relative w-32'>{children}</div>
  </div>
);

const DropdownButton = ({ children }: { children: ReactNode }) => (
  <Button className='flex h-8 w-32 items-center justify-between text-sm' variant='outline'>
    <span className='w-full truncate text-left'>{children}</span>
    <ChevronDown size={14} />
  </Button>
);

const OptionMenu = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <Row label={label}>
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <DropdownButton>{options.find(option => option.value === value)?.label ?? value}</DropdownButton>
        </div>
      </PopoverTrigger>
      <PopoverContent className='z-[300] w-32 rounded border-none bg-[#27272A] p-0 py-1 text-white'>
        {options.map(option => (
          <button
            type='button'
            key={option.value}
            onClick={() => onChange(option.value)}
            className='flex h-8 w-full cursor-pointer items-center px-4 text-sm text-zinc-200 hover:bg-zinc-800/50'
          >
            {option.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  </Row>
);

const FontSize = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => text !== '' && Number(text) > 0 && onChange(Number(text));

  return (
    <Row label='Size'>
      <Input
        className='h-8'
        inputMode='decimal'
        value={text}
        onChange={event => {
          const next = event.target.value;
          if (next === '' || (!Number.isNaN(Number(next)) && Number(next) >= 0)) setText(next);
        }}
        onBlur={commit}
        onKeyDown={event => event.key === 'Enter' && commit()}
      />
    </Row>
  );
};

const FontFamily = ({ family, onSelect }: { family: string; onSelect: (font: FontInfo) => void }) => {
  const isLargeScreen = useIsLargeScreen();
  const setFloatingControl = useLayoutStore(state => state.setFloatingControl);
  const [search, setSearch] = useState('');

  if (isLargeScreen) {
    return (
      <Row label='Font'>
        <div onClick={() => setFloatingControl('font-family-picker')}>
          <DropdownButton>{family}</DropdownButton>
        </div>
      </Row>
    );
  }

  return (
    <Row label='Font'>
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <DropdownButton>{family}</DropdownButton>
          </div>
        </PopoverTrigger>
        <PopoverContent className='z-[300] -ml-4 w-full p-0'>
          <div className='relative flex items-center rounded-md border pl-2 focus-within:ring-1 focus-within:ring-ring'>
            <Search className='h-5 w-5 text-muted-foreground' />
            <Input
              placeholder='Search font...'
              className='border-0 !bg-transparent shadow-none focus-visible:ring-0'
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <ScrollArea className='h-[300px] w-full py-2'>
            <FontList search={search} onSelect={font => onSelect(font.default)} />
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </Row>
  );
};

const FontStyle = ({
  font,
  current,
  onSelect,
}: {
  font: CompactFont | null;
  current: string;
  onSelect: (font: FontInfo) => void;
}) => (
  <Row label='Weight'>
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <DropdownButton>{styleNameOf(current)}</DropdownButton>
        </div>
      </PopoverTrigger>
      <PopoverContent className='z-[300] w-32 rounded border-none bg-[#27272A] p-0 text-white'>
        {font?.styles.map(style => (
          <button
            type='button'
            key={style.postScriptName}
            onClick={() => onSelect(style)}
            className='flex h-6 w-full cursor-pointer items-center px-2 py-3.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
          >
            {styleNameOf(style.postScriptName)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  </Row>
);

const OverlineIcon = () => (
  <svg width={18} viewBox='0 0 24 24' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
    <path d='M5.6 1.76a.64.64 0 1 0 0 1.28h12.8a.64.64 0 1 0 0-1.28H5.6ZM8 6.8a.8.8 0 0 0-1.6 0v8.48a5.6 5.6 0 0 0 11.2 0V6.8a.8.8 0 0 0-1.6 0v8.48a4 4 0 0 1-8 0V6.8Z' />
  </svg>
);

const TextDecoration = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <Row label='Decoration'>
    <ToggleGroup
      value={value.split(' ')}
      size='sm'
      className='grid grid-cols-3'
      type='multiple'
      onValueChange={values => onChange(values.filter(v => v !== 'none').join(' ') || 'none')}
    >
      <ToggleGroupItem value='underline' aria-label='Underline'>
        <Underline size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value='line-through' aria-label='Strikethrough'>
        <Strikethrough size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value='overline' aria-label='Overline'>
        <OverlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  </Row>
);

export const TextControls = ({ details, selectedFont, onSelectFont, updateDetails }: TextControlsProps) => (
  <div className='flex flex-col gap-2 py-4'>
    <Label className='font-sans text-xs font-semibold'>Styles</Label>
    <FontFamily family={selectedFont?.family ?? details.fontFamily ?? ''} onSelect={onSelectFont} />
    <FontStyle font={selectedFont} current={details.fontFamily ?? ''} onSelect={onSelectFont} />
    <FontSize value={Number(details.fontSize) || 62} onChange={fontSize => updateDetails({ fontSize })} />
    <Row label='Color'>
      <ColorField
        title='Color'
        value={details.color || '#ffffff'}
        onChange={color => updateDetails({ color })}
        mobileControl={{ type: 'color', label: 'Color' }}
      />
    </Row>
    <Row label='Fill'>
      <ColorField
        title='Fill'
        value={details.backgroundColor || 'transparent'}
        onChange={backgroundColor => updateDetails({ backgroundColor })}
        mobileControl={{ type: 'backgroundColor', label: 'Background Color' }}
      />
    </Row>
    <OptionMenu
      label='Align'
      value={details.textAlign || 'left'}
      options={ALIGNMENTS}
      onChange={textAlign => updateDetails({ textAlign })}
    />
    <TextDecoration
      value={details.textDecoration || 'none'}
      onChange={textDecoration => updateDetails({ textDecoration })}
    />
    <OptionMenu
      label='Case'
      value={details.textTransform || 'none'}
      options={CASES}
      onChange={textTransform => updateDetails({ textTransform })}
    />
    <SliderControl label='Opacity' value={details.opacity ?? 100} onChange={opacity => updateDetails({ opacity })} />
  </div>
);
