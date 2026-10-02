import { CircleOff } from 'lucide-react';
import { useEditableTrackItem } from '@/features/editor/hooks/use-editable-track-item';

const DEFAULTS = { brightness: 100, contrast: 100, saturation: 100, hue: 0, grayscale: 0, sepia: 0, blur: 0 };
type FilterValues = typeof DEFAULTS;

const FILTERS: { key: string; label: string; values: FilterValues }[] = [
  { key: 'none', label: 'None', values: DEFAULTS },
  { key: 'vivid', label: 'Vivid', values: { ...DEFAULTS, brightness: 105, contrast: 115, saturation: 130 } },
  { key: 'warm', label: 'Warm', values: { ...DEFAULTS, brightness: 102, contrast: 105, saturation: 115, hue: -10, sepia: 10 } },
  { key: 'cool', label: 'Cool', values: { ...DEFAULTS, brightness: 102, contrast: 108, saturation: 110, hue: 15 } },
  { key: 'vintage', label: 'Vintage', values: { ...DEFAULTS, brightness: 98, contrast: 95, saturation: 80, sepia: 35 } },
  { key: 'bw', label: 'B&W', values: { ...DEFAULTS, contrast: 110, saturation: 0, grayscale: 100 } },
  { key: 'soft', label: 'Soft', values: { ...DEFAULTS, brightness: 108, contrast: 90, saturation: 95 } },
  { key: 'dramatic', label: 'Dramatic', values: { ...DEFAULTS, brightness: 95, contrast: 120, saturation: 90 } },
  { key: 'blur', label: 'Blur', values: { ...DEFAULTS, blur: 2 } },
];

const cssFilter = (v: FilterValues) =>
  `brightness(${v.brightness}%) contrast(${v.contrast}%) saturate(${v.saturation}%) hue-rotate(${v.hue}deg) grayscale(${v.grayscale}%) sepia(${v.sepia}%) blur(${v.blur}px)`;

const Filters = () => {
  const { trackItem, updateDetails } = useEditableTrackItem();
  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Filters</h3>
      <div className='grid grid-cols-3 gap-3'>
        {FILTERS.map(filter => (
          <button
            type='button'
            key={filter.key}
            onClick={() => updateDetails(filter.values)}
            className='flex h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/5 transition-colors hover:bg-white/10'
          >
            {filter.key === 'none' ? (
              <CircleOff className='h-6 w-6 text-muted-foreground' />
            ) : (
              <span
                className='h-6 w-10 rounded'
                style={{
                  background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
                  filter: cssFilter(filter.values),
                }}
              />
            )}
            <span className='text-sm text-muted-foreground'>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filters;
