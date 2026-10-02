import React, { useMemo } from 'react';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import property UI components
import BasicText from '@/features/editor/control-item/properties/text-properties/basic';
import PresetsText from '@/features/editor/control-item/properties/text-properties/presets';
import SmartToolsText from '@/features/editor/control-item/properties/text-properties/smart-tools';

import BasicAudio from '@/features/editor/control-item/properties/audio-properties/basic';

import BasicImage from '@/features/editor/control-item/properties/image-properties/basic';
import ColorsImage from '@/features/editor/control-item/properties/image-properties/colors';
import CropImage from '@/features/editor/control-item/properties/image-properties/crop';
import FiltersImage from '@/features/editor/control-item/properties/image-properties/filters';
import SmartToolsImage from '@/features/editor/control-item/properties/image-properties/smart-tools';

import BasicVideo from '@/features/editor/control-item/properties/video-properties/basic';
import ColorsVideo from '@/features/editor/control-item/properties/video-properties/colors';
import CropVideo from '@/features/editor/control-item/properties/video-properties/crop';
import SmartToolsVideo from '@/features/editor/control-item/properties/video-properties/smart-tools';
import FiltersVideo from '@/features/editor/control-item/properties/video-properties/filters';

// Define property components mapping
const PROPERTY_COMPONENTS = {
  // Text properties
  'text-basic': BasicText,
  'text-presets': PresetsText,
  'text-smart': SmartToolsText,

  // Audio properties
  'audio-basic': BasicAudio,

  // Image properties
  'image-basic': BasicImage,
  'image-color': ColorsImage,
  'image-crop': CropImage,
  'image-filter': FiltersImage,
  'image-smart': SmartToolsImage,

  // Video properties
  'video-basic': BasicVideo,
  'video-color': ColorsVideo,
  'video-crop': CropVideo,
  'video-smart': SmartToolsVideo,
  'video-filter': FiltersVideo,
};

export const PropertiesItemsList = React.memo(function PropertiesItemsList() {
  const { activePropertyItem, showPropertyItem } = usePropertiesStore();

  const ActiveComponent = PROPERTY_COMPONENTS[activePropertyItem] ?? null;

  // Memoize the rendered component instance
  const activePropertyContent = useMemo(() => {
    return ActiveComponent ? <ActiveComponent /> : null;
  }, [ActiveComponent]);

  if (!showPropertyItem || !activePropertyContent) return null;

  return (
    <div className='absolute top-4 right-24 z-[999] w-[300px] rounded-2xl bg-white border border-gray-200 shadow-lg'>
      <ScrollArea className='h-86'>
        <div className='p-4'>{activePropertyContent}</div>
      </ScrollArea>
    </div>
  );
});

export default PropertiesItemsList;
