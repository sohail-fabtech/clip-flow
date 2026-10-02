import type { ReactNode } from 'react';
import { Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AspectRatio from '@/features/editor/control-item/common/aspect-ratio';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import SliderControl from '@/features/editor/control-item/common/slider-control';
import Speed from '@/features/editor/control-item/common/speed';
import { useEditableTrackItem } from '@/features/editor/hooks/use-editable-track-item';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import type { TrackItem } from '@/features/editor/types';

export interface Section {
  key: string;
  node: ReactNode;
}

type MediaKind = 'image' | 'video';

export function useMediaSections(kind: MediaKind, source?: TrackItem | null, compact = false): Section[] {
  const { trackItem, properties, update, updateDetails } = useEditableTrackItem(source);
  const setCropTarget = useLayoutStore(state => state.setCropTarget);
  if (!trackItem || !properties) return [];
  const { details } = properties;

  return [
    {
      key: 'crop',
      node: (
        <div className='mb-4'>
          <Button variant='outline' size='icon' onClick={() => setCropTarget(trackItem)} aria-label='Crop'>
            <Crop size={18} />
          </Button>
        </div>
      ),
    },
    {
      key: 'basic',
      node: (
        <div className='flex flex-col gap-2'>
          <Label className='font-sans text-xs font-semibold'>Basic</Label>
          {compact && <AspectRatio />}
          {kind === 'video' && (
            <SliderControl label='Volume' value={details.volume ?? 100} onChange={volume => updateDetails({ volume })} />
          )}
          {kind === 'image' && (
            <SliderControl
              label='Round'
              max={50}
              value={details.borderRadius ?? 0}
              onChange={borderRadius => updateDetails({ borderRadius })}
            />
          )}
          <SliderControl label='Opacity' value={details.opacity ?? 100} onChange={opacity => updateDetails({ opacity })} />
          {kind === 'video' && (
            <>
              <Speed value={properties.playbackRate ?? 1} onChange={playbackRate => update({ playbackRate })} />
              <SliderControl
                label='Round'
                max={50}
                value={details.borderRadius ?? 0}
                onChange={borderRadius => updateDetails({ borderRadius })}
              />
            </>
          )}
          {kind === 'image' && (
            <>
              <SliderControl label='Blur' value={details.blur ?? 0} onChange={blur => updateDetails({ blur })} />
              <SliderControl
                label='Brightness'
                value={details.brightness ?? 100}
                onChange={brightness => updateDetails({ brightness })}
              />
            </>
          )}
        </div>
      ),
    },
    {
      key: 'outline',
      node: (
        <Outline
          label='Outline'
          valueBorderWidth={details.borderWidth}
          valueBorderColor={details.borderColor}
          onChangeBorderWidth={borderWidth => updateDetails({ borderWidth })}
          onChangeBorderColor={borderColor => updateDetails({ borderColor })}
        />
      ),
    },
    {
      key: 'shadow',
      node: <Shadow label='Shadow' value={details.boxShadow} onChange={boxShadow => updateDetails({ boxShadow })} />,
    },
  ];
}

export function useAudioSections(source?: TrackItem | null): Section[] {
  const { properties, update, updateDetails } = useEditableTrackItem(source);
  if (!properties) return [];
  return [
    { key: 'speed', node: <Speed value={properties.playbackRate ?? 1} onChange={playbackRate => update({ playbackRate })} /> },
    {
      key: 'volume',
      node: (
        <SliderControl
          label='Volume'
          value={properties.details.volume ?? 100}
          onChange={volume => updateDetails({ volume })}
        />
      ),
    },
  ];
}

export const DesktopSections = ({ sections, title }: { sections: Section[]; title?: string }) => (
  <div className='space-y-4'>
    {title && <Label className='font-sans text-xs font-semibold'>{title}</Label>}
    {sections.map(({ key, node }) => (
      <div key={key}>{node}</div>
    ))}
  </div>
);
