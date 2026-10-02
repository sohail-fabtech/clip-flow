import React from 'react';
import { CircleOff } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';

const DEFAULTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
};

const FILTERS = [
  {
    key: 'none',
    label: 'None',
    values: { ...DEFAULTS },
  },
  {
    key: 'vivid',
    label: 'Vivid',
    values: { brightness: 105, contrast: 115, saturation: 130, hue: 0, grayscale: 0, sepia: 0, blur: 0 },
  },
  {
    key: 'warm',
    label: 'Warm',
    values: { brightness: 102, contrast: 105, saturation: 115, hue: -10, grayscale: 0, sepia: 10, blur: 0 },
  },
  {
    key: 'cool',
    label: 'Cool',
    values: { brightness: 102, contrast: 108, saturation: 110, hue: 15, grayscale: 0, sepia: 0, blur: 0 },
  },
  {
    key: 'vintage',
    label: 'Vintage',
    values: { brightness: 98, contrast: 95, saturation: 80, hue: 0, grayscale: 0, sepia: 35, blur: 0 },
  },
  {
    key: 'bw',
    label: 'B&W',
    values: { brightness: 100, contrast: 110, saturation: 0, hue: 0, grayscale: 100, sepia: 0, blur: 0 },
  },
  {
    key: 'soft',
    label: 'Soft',
    values: { brightness: 108, contrast: 90, saturation: 95, hue: 0, grayscale: 0, sepia: 0, blur: 0 },
  },
  {
    key: 'dramatic',
    label: 'Dramatic',
    values: { brightness: 95, contrast: 120, saturation: 90, hue: 0, grayscale: 0, sepia: 0, blur: 0 },
  },
  {
    key: 'blur',
    label: 'Blur',
    values: { brightness: 100, contrast: 100, saturation: 100, hue: 0, grayscale: 0, sepia: 0, blur: 2 },
  },
];

function getCssFilter(values) {
  const v = { ...DEFAULTS, ...values };
  return [
    `brightness(${v.brightness}%)`,
    `contrast(${v.contrast}%)`,
    `saturate(${v.saturation}%)`,
    `hue-rotate(${v.hue}deg)`,
    `grayscale(${v.grayscale}%)`,
    `sepia(${v.sepia}%)`,
    `blur(${v.blur}px)`,
  ].join(' ');
}

const Filters = () => {
  const { trackItem } = useLayoutStore();

  const applyFilter = values => {
    if (!trackItem) return;

    // Only update known color-adjustment fields to avoid touching other props
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: { ...values },
        },
      },
    });
  };

  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Filters</h3>
      <div className='grid grid-cols-3 gap-3'>
        {FILTERS.map(filter => (
          <div
            key={filter.key}
            onClick={() => applyFilter(filter.values)}
            className='flex h-[80px] cursor-pointer items-center justify-center bg-gray-100 border border-gray-100 hover:bg-gray-200 rounded-[8px] transition-colors'
          >
            <div className='flex flex-col items-center gap-2'>
              {filter.key === 'none' ? (
                <CircleOff className='w-6 h-6 text-gray-500' />
              ) : (
                <div
                  className='w-10 h-6 rounded'
                  style={{
                    background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%)',
                    filter: getCssFilter(filter.values),
                  }}
                />
              )}
              <span className='text-sm text-gray-600'>{filter.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Filters;
