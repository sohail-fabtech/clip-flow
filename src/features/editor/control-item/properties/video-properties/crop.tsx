import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Crop as CropIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Crop = () => {
  const { trackItem, setCropTarget } = useLayoutStore();
  const [properties, setProperties] = useState({
    aspectRatio: 'original',
    zoom: 100,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  useEffect(() => {
    if (trackItem?.details) {
      setProperties({
        aspectRatio: trackItem.details.aspectRatio ?? 'original',
        zoom: trackItem.details.zoom ?? 100,
        rotation: trackItem.details.rotation ?? 0,
        flipHorizontal: trackItem.details.flipHorizontal ?? false,
        flipVertical: trackItem.details.flipVertical ?? false,
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
        {/* Crop Tools */}
        <div className='space-y-3'>
          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-700'>Crop Tools</Label>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCropTarget(trackItem)}
              className='text-xs bg-transparent cursor-pointer border-gray-200 rounded-[8px]'
            >
              <CropIcon className='w-4 h-4 mr-1' />
              Open Crop Tool
            </Button>
          </div>
        </div>

        {/* Aspect Ratio */}
        {/* <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700'>Aspect Ratio</Label>
          <Select value={properties.aspectRatio} onValueChange={value => updateProperty('aspectRatio', value)}>
            <SelectTrigger className='w-full border-gray-200 rounded-[8px]'>
              <SelectValue placeholder='Select aspect ratio' />
            </SelectTrigger>
            <SelectContent className='z-[1000] bg-white text-black border-gray-200 rounded-[8px]'>
              <SelectItem value='original'>Original</SelectItem>
              <SelectItem value='1:1'>1:1 (Square)</SelectItem>
              <SelectItem value='16:9'>16:9 (Widescreen)</SelectItem>
              <SelectItem value='4:3'>4:3 (Standard)</SelectItem>
              <SelectItem value='3:2'>3:2 (Photo)</SelectItem>
              <SelectItem value='9:16'>9:16 (Vertical)</SelectItem>
              <SelectItem value='21:9'>21:9 (Ultrawide)</SelectItem>
              <SelectItem value='2:3'>2:3 (Portrait)</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Zoom */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium text-gray-700'>Zoom</Label>
            <span className='text-sm text-gray-500'>{properties.zoom}%</span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => updateProperty('zoom', Math.max(50, properties.zoom - 10))}
              className='p-1 bg-transparent cursor-pointer border-gray-200 rounded-[8px]'
            >
              <ZoomOut className='w-4 h-4' />
            </Button>
            <Slider
              value={[properties.zoom]}
              onValueChange={([value]) => updateProperty('zoom', value)}
              min={50}
              max={200}
              step={5}
              className='flex-1'
              trackColor='bg-gray-100'
              rangeColor='bg-black'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => updateProperty('zoom', Math.min(200, properties.zoom + 10))}
              className='p-1 bg-transparent cursor-pointer border-gray-200 rounded-[8px]'
            >
              <ZoomIn className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* Rotation */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-sm font-medium text-gray-700'>Rotation</Label>
            <span className='text-sm text-gray-500'>{properties.rotation}°</span>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => updateProperty('rotation', (properties.rotation - 90 + 360) % 360)}
              className='flex-1 bg-transparent cursor-pointer border-gray-200 rounded-[8px]'
            >
              <RotateCcw className='w-4 h-4 mr-1' />
              Left
            </Button>
            <Slider
              value={[properties.rotation]}
              onValueChange={([value]) => updateProperty('rotation', value)}
              min={0}
              max={360}
              step={1}
              className='flex-1'
              trackColor='bg-gray-100'
              rangeColor='bg-black'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => updateProperty('rotation', (properties.rotation + 90) % 360)}
              className='flex-1 bg-transparent cursor-pointer border-gray-200 rounded-[8px]'
            >
              <RotateCw className='w-4 h-4 mr-1' />
              Right
            </Button>
          </div>
        </div>

        {/* Flip */}
        <div className='space-y-2'>
          <Label className='text-sm font-medium text-gray-700'>Flip</Label>
          <div className='flex gap-2'>
            <Button
              variant={properties.flipHorizontal ? 'default' : 'outline'}
              size='sm'
              onClick={() => updateProperty('flipHorizontal', !properties.flipHorizontal)}
              className={cn(
                'flex-1 bg-transparent border    rounded-[8px] hover:bg-transparent cursor-pointer',
                properties.flipHorizontal ? 'border-gray-500' : 'border-gray-200',
              )}
            >
              ↔️ Horizontal
            </Button>
            <Button
              variant={properties.flipVertical ? 'default' : 'outline'}
              size='sm'
              onClick={() => updateProperty('flipVertical', !properties.flipVertical)}
              className={cn(
                'flex-1 bg-transparent border    rounded-[8px] hover:bg-transparent cursor-pointer',
                properties.flipVertical ? 'border-gray-500' : 'border-gray-200',
              )}
            >
              ↕️ Vertical
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crop;
