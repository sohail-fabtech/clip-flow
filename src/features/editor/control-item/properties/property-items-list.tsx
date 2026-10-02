import type { ComponentType } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import BasicText from '@/features/editor/control-item/properties/text-properties/basic';
import PresetsText from '@/features/editor/control-item/properties/text-properties/presets';
import SmartToolsText from '@/features/editor/control-item/properties/text-properties/smart-tools';
import { DesktopSections, useAudioSections, useMediaSections } from '@/features/editor/control-item/media-sections';
import Colors from '@/features/editor/control-item/properties/media/colors';
import Crop from '@/features/editor/control-item/properties/media/crop';
import Filters from '@/features/editor/control-item/properties/media/filters';

const BasicImage = () => <DesktopSections sections={useMediaSections('image').filter(s => s.key !== 'crop')} />;
const BasicAudio = () => <DesktopSections title='Basic' sections={useAudioSections().reverse()} />;
const BasicVideo = () => <DesktopSections sections={useMediaSections('video').filter(s => s.key !== 'crop')} />;

const PROPERTY_COMPONENTS: Record<string, ComponentType> = {
  'text-basic': BasicText,
  'text-presets': PresetsText,
  'text-smart': SmartToolsText,
  'audio-basic': BasicAudio,
  'image-basic': BasicImage,
  'image-color': Colors,
  'image-crop': Crop,
  'image-filter': Filters,
  'video-basic': BasicVideo,
  'video-color': Colors,
  'video-crop': Crop,
  'video-filter': Filters,
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
