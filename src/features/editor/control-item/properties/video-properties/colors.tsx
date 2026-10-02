import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Colors = () => {
  const { trackItem } = useLayoutStore();
  const [properties, setProperties] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blendMode: 'normal',
    grayscale: 0,
    sepia: 0,
    blur: 0,
    sharpen: 0,
  });

  useEffect(() => {
    if (trackItem?.details) {
      setProperties({
        brightness: trackItem.details.brightness ?? 100,
        contrast: trackItem.details.contrast ?? 100,
        saturation: trackItem.details.saturation ?? 100,
        hue: trackItem.details.hue ?? 0,
        blendMode: trackItem.details.blendMode ?? 'normal',
        grayscale: trackItem.details.grayscale ?? 0,
        sepia: trackItem.details.sepia ?? 0,
        blur: trackItem.details.blur ?? 0,
        sharpen: trackItem.details.sharpen ?? 0,
      });
    }
  }, [trackItem]);

  const updateProperty = (property, value) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            [property]: value,
          },
        },
      },
    });
    setProperties(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='space-y-4'>
          <Label className='text-sm font-medium text-gray-700'>Color Adjustments</Label>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Brightness</span>
              <span className='text-sm text-gray-500'>{properties.brightness}%</span>
            </div>
            <Slider
              value={[properties.brightness]}
              onValueChange={([value]) => updateProperty('brightness', value)}
              min={0}
              max={200}
              step={1}
              trackColor='bg-gray-100'
              rangeColor='bg-black'
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Contrast</span>
              <span className='text-sm text-gray-500'>{properties.contrast}%</span>
            </div>
            <Slider
              value={[properties.contrast]}
              onValueChange={([value]) => updateProperty('contrast', value)}
              min={0}
              max={200}
              step={1}
              trackColor='bg-gray-100'
              rangeColor='bg-black'
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Saturation</span>
              <span className='text-sm text-gray-500'>{properties.saturation}%</span>
            </div>
            <Slider
              value={[properties.saturation]}
              onValueChange={([value]) => updateProperty('saturation', value)}
              min={0}
              max={200}
              step={1}
              trackColor='bg-gray-100'
              rangeColor='bg-black'
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Hue</span>
              <span className='text-sm text-gray-500'>{properties.hue}°</span>
            </div>
            <Slider
              value={[properties.hue]}
              onValueChange={([value]) => updateProperty('hue', value)}
              min={0}
              max={360}
              step={1}
              trackColor='bg-gray-100'
              rangeColor='bg-black'
              className='w-full'
            />
          </div>
        </div>

        <div className='space-y-3'>
          <Label className='text-sm font-medium text-gray-700'>Blend Mode</Label>
          <div className='space-y-2'>
            <Select value={properties.blendMode} onValueChange={value => updateProperty('blendMode', value)}>
              <SelectTrigger className='w-full border-gray-200 rounded-[8px]'>
                <SelectValue placeholder='Select blend mode' />
              </SelectTrigger>
              <SelectContent className='z-[1000] bg-white text-black border-gray-200 rounded-[8px]'>
                <SelectItem value='normal'>Normal</SelectItem>
                <SelectItem value='multiply'>Multiply</SelectItem>
                <SelectItem value='screen'>Screen</SelectItem>
                <SelectItem value='overlay'>Overlay</SelectItem>
                <SelectItem value='add'>Add</SelectItem>
                <SelectItem value='darken'>Darken</SelectItem>
                <SelectItem value='lighten'>Lighten</SelectItem>
                <SelectItem value='difference'>Difference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Colors;
