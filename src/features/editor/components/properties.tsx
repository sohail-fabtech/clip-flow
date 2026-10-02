import React, { useEffect } from 'react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import TextPropertieItems from '@/features/editor/control-item/properties/text-property-items';
import ImagePropertieItems from '@/features/editor/control-item/properties/image-property-items';
import VideoPropertieItems from '@/features/editor/control-item/properties/video-property-items';
import AudioPropertieItems from '@/features/editor/control-item/properties/audio-property-items';
import PropertiesItemsList from '@/features/editor/control-item/properties/property-items-list';

function Properties() {
  const { trackItem } = useLayoutStore();
  const { resetProperties } = usePropertiesStore();

  // Reset properties when no trackItem is selected
  useEffect(() => {
    if (!trackItem) {
      resetProperties();
    }
  }, [trackItem, resetProperties]);

  if (!trackItem) return null;

  return (
    <>
      {
        {
          text: <TextPropertieItems />,
          image: <ImagePropertieItems />,
          video: <VideoPropertieItems />,
          audio: <AudioPropertieItems />,
        }[trackItem.type]
      }
      <PropertiesItemsList />
    </>
  );
}

export default Properties;
