import { Crop as CropIcon, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEditableTrackItem } from '@/features/editor/hooks/use-editable-track-item';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { LabeledSlider } from '@/features/editor/control-item/properties/media/labeled-slider';
import { cn } from '@/lib/utils';

const ZOOM = { min: 50, max: 200, step: 10 };

const Crop = () => {
  const { trackItem, properties, updateDetails } = useEditableTrackItem();
  const setCropTarget = useLayoutStore(state => state.setCropTarget);
  if (!trackItem || !properties) return null;

  const zoom = properties.details.zoom ?? 100;
  const rotation = properties.details.rotation ?? 0;
  const { flipHorizontal = false, flipVertical = false } = properties.details;

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2'>
        <Label className='text-sm font-medium'>Crop Tools</Label>
        <Button variant='outline' size='sm' onClick={() => setCropTarget(trackItem)} className='rounded-[8px] text-xs'>
          <CropIcon className='mr-1 h-4 w-4' />
          Open Crop Tool
        </Button>
      </div>

      <LabeledSlider
        label='Zoom'
        unit='%'
        min={ZOOM.min}
        max={ZOOM.max}
        step={5}
        value={zoom}
        onCommit={value => updateDetails({ zoom: value })}
        before={
          <Button
            variant='outline'
            size='sm'
            aria-label='Zoom out'
            onClick={() => updateDetails({ zoom: Math.max(ZOOM.min, zoom - ZOOM.step) })}
          >
            <ZoomOut className='h-4 w-4' />
          </Button>
        }
        after={
          <Button
            variant='outline'
            size='sm'
            aria-label='Zoom in'
            onClick={() => updateDetails({ zoom: Math.min(ZOOM.max, zoom + ZOOM.step) })}
          >
            <ZoomIn className='h-4 w-4' />
          </Button>
        }
      />

      <LabeledSlider
        label='Rotation'
        unit='°'
        min={0}
        max={360}
        value={rotation}
        onCommit={value => updateDetails({ rotation: value })}
        before={
          <Button variant='outline' size='sm' onClick={() => updateDetails({ rotation: (rotation + 270) % 360 })}>
            <RotateCcw className='mr-1 h-4 w-4' />
            Left
          </Button>
        }
        after={
          <Button variant='outline' size='sm' onClick={() => updateDetails({ rotation: (rotation + 90) % 360 })}>
            <RotateCw className='mr-1 h-4 w-4' />
            Right
          </Button>
        }
      />

      <div className='space-y-2'>
        <Label className='text-sm font-medium'>Flip</Label>
        <div className='flex gap-2'>
          {[
            { label: '↔️ Horizontal', active: flipHorizontal, toggle: { flipHorizontal: !flipHorizontal } },
            { label: '↕️ Vertical', active: flipVertical, toggle: { flipVertical: !flipVertical } },
          ].map(({ label, active, toggle }) => (
            <Button
              key={label}
              variant='outline'
              size='sm'
              aria-pressed={active}
              onClick={() => updateDetails(toggle)}
              className={cn('flex-1 rounded-[8px]', active && 'border-white/60 bg-white/10')}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Crop;
