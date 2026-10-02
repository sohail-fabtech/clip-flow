import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, Crop as CropIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Crop = () => {
  const { trackItem, setCropTarget } = useLayoutStore();
  const [properties, setProperties] = useState({
    aspectRatio: 'original',
    cropPosition: 'center',
    zoom: 100,
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  });

  useEffect(() => {
    if (trackItem?.details) {
      setProperties({
        aspectRatio: trackItem.details.aspectRatio ?? 'original',
        cropPosition: trackItem.details.cropPosition ?? 'center',
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

  const resetCrop = () => {
    const resetValues = {
      aspectRatio: 'original',
      cropPosition: 'center',
      zoom: 100,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    };

    Object.entries(resetValues).forEach(([key, value]) => {
      updateProperty(key, value);
    });
  };

  const rotateLeft = () => {
    const newRotation = (properties.rotation - 90 + 360) % 360;
    updateProperty('rotation', newRotation);
  };

  const rotateRight = () => {
    const newRotation = (properties.rotation + 90) % 360;
    updateProperty('rotation', newRotation);
  };

  const flipH = () => {
    updateProperty('flipHorizontal', !properties.flipHorizontal);
  };

  const flipV = () => {
    updateProperty('flipVertical', !properties.flipVertical);
  };

  if (!trackItem) return null;

  const aspectRatioOptions = [
    { value: 'original', label: 'Original' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '16:9', label: '16:9 (Widescreen)' },
    { value: '4:3', label: '4:3 (Standard)' },
    { value: '3:2', label: '3:2 (Photo)' },
    { value: '9:16', label: '9:16 (Vertical)' },
    { value: '21:9', label: '21:9 (Ultrawide)' },
    { value: '2:3', label: '2:3 (Portrait)' },
  ];

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
              onClick={rotateLeft}
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
              onClick={rotateRight}
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
              onClick={flipH}
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
              onClick={flipV}
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
