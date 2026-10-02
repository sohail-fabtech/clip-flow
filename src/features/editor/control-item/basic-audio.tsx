import { ScrollArea } from '@/components/ui/scroll-area';
import Volume from '@/features/editor/control-item/common/volume';
import Speed from '@/features/editor/control-item/common/speed';
import React, { useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';

const BasicAudio = ({ trackItem, type }) => {
  const showAll = !type;
  const [properties, setProperties] = useState(trackItem);

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

  const components = [
    {
      key: 'speed',
      component: <Speed value={properties.playbackRate ?? 1} onChange={handleChangeSpeed} />,
    },
    {
      key: 'volume',
      component: <Volume onChange={v => handleChangeVolume(v)} value={properties.details.volume ?? 100} />,
    },
  ];

  return (
    <div className='flex flex-1 flex-col'>
      <div className='text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium'>Audio</div>
      <ScrollArea className='h-full'>
        <div className='flex flex-col gap-2 px-4 py-4'>
          {components
            .filter(comp => showAll || comp.key === type)
            .map(comp => (
              <React.Fragment key={comp.key}>{comp.component}</React.Fragment>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BasicAudio;
