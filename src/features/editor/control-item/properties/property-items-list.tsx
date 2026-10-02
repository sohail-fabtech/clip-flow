import type { ComponentType } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import BasicText from '@/features/editor/control-item/properties/text-properties/basic';
import PresetsText from '@/features/editor/control-item/properties/text-properties/presets';
import SmartToolsText from '@/features/editor/control-item/properties/text-properties/smart-tools';
import BasicAudio from '@/features/editor/control-item/properties/audio-properties/basic';
import BasicImage from '@/features/editor/control-item/properties/image-properties/basic';
import ColorsImage from '@/features/editor/control-item/properties/image-properties/colors';
import CropImage from '@/features/editor/control-item/properties/image-properties/crop';
import FiltersImage from '@/features/editor/control-item/properties/image-properties/filters';
import BasicVideo from '@/features/editor/control-item/properties/video-properties/basic';
import ColorsVideo from '@/features/editor/control-item/properties/video-properties/colors';
import CropVideo from '@/features/editor/control-item/properties/video-properties/crop';
import FiltersVideo from '@/features/editor/control-item/properties/video-properties/filters';

const PROPERTY_COMPONENTS: Record<string, ComponentType> = {
  'text-basic': BasicText,
  'text-presets': PresetsText,
  'text-smart': SmartToolsText,
  'audio-basic': BasicAudio,
  'image-basic': BasicImage,
  'image-color': ColorsImage,
  'image-crop': CropImage,
  'image-filter': FiltersImage,
  'video-basic': BasicVideo,
  'video-color': ColorsVideo,
  'video-crop': CropVideo,
  'video-filter': FiltersVideo,
};

export default function PropertiesItemsList() {
  const { activePropertyItem, showPropertyItem } = usePropertiesStore();
  const Active = PROPERTY_COMPONENTS[activePropertyItem];
  if (!showPropertyItem || !Active) return null;

  return (
    <div className='absolute right-24 top-4 z-[999] w-[300px] rounded-2xl border border-white/10 bg-[#0E0E11] text-white shadow-lg'>
      <ScrollArea className='h-86'>
        <div className='p-4'>
          <Active />
        </div>
      </ScrollArea>
    </div>
  );
}
