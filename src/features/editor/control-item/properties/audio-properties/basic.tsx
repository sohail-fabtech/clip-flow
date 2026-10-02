import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import Volume from '@/features/editor/control-item/common/volume';
import SpeedControl from '@/features/editor/control-item/common/speed';

const Basic = () => {
  const { trackItem } = useLayoutStore();
  const [properties, setProperties] = useState(trackItem);

  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  if (!trackItem) return null;

  const handleChangeVolume = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            volume: v,
          },
        },
      },
    });

    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          volume: v,
        },
      };
    });
  };

  const handleChangeSpeed = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          playbackRate: v,
        },
      },
    });

    setProperties(prev => {
      return {
        ...prev,
        playbackRate: v,
      };
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2'>
        <Label className='font-sans text-xs font-semibold text-primary'>Basic</Label>
        <Volume onChange={v => handleChangeVolume(v)} value={properties.details?.volume ?? 100} />
        <SpeedControl value={properties.playbackRate ?? 1} onChange={handleChangeSpeed} />
      </div>
    </div>
  );
};

export default Basic;
