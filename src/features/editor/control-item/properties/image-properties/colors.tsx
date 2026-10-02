import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { X } from 'lucide-react';

const Colors = () => {
  const { trackItem } = useLayoutStore();
  const [properties, setProperties] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    colorOverlay: '#000000',
    colorOverlayOpacity: 0,
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
        colorOverlay: trackItem.details.colorOverlay ?? '#000000',
        colorOverlayOpacity: trackItem.details.colorOverlayOpacity ?? 0,
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

  const applyFilter = filterType => {
    const filterValues = {
      grayscale: properties.grayscale > 0 ? 0 : 100,
      sepia: properties.sepia > 0 ? 0 : 100,
      blur: properties.blur > 0 ? 0 : 5,
      sharpen: properties.sharpen > 0 ? 0 : 100,
    };

    updateProperty(filterType, filterValues[filterType]);
  };

  const resetAllFilters = () => {
    const resetValues = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      colorOverlayOpacity: 0,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      sharpen: 0,
    };

    Object.entries(resetValues).forEach(([key, value]) => {
      updateProperty(key, value);
    });
  };

  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      {/* <h3 className='text-lg font-semibold text-gray-800'>Image Colors & Filters</h3> */}

      <div className='space-y-4'>
        {/* Basic Color Adjustments */}
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

        {/* Color Overlay */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium text-gray-700'>Blend Mode</Label>

          <div className='space-y-3'>
            {/* <div className='flex items-center gap-2'>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-gray-600'>Color</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' className='w-12 h-8 p-0'>
                        <div className='w-full h-full rounded' style={{ backgroundColor: properties.colorOverlay }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-80 p-4'>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium'>Color Overlay</h4>
                          <X className='w-4 h-4' />
                        </div>
                        <ColorPicker
                          value={properties.colorOverlay}
                          onChange={value => updateProperty('colorOverlay', value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-gray-600'>Opacity</span>
                  <span className='text-sm text-gray-500'>{properties.colorOverlayOpacity}%</span>
                </div>
                <Slider
                  value={[properties.colorOverlayOpacity]}
                  onValueChange={([value]) => updateProperty('colorOverlayOpacity', value)}
                  min={0}
                  max={100}
                  step={1}
                  className='w-full'
                />
              </div>
            </div> */}

            <div className='space-y-2'>
              {/* <Label className='text-sm text-gray-600'>Blend Mode</Label> */}
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
    </div>
  );
};

export default Colors;
