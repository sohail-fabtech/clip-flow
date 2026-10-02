import { ScrollArea } from '@/components/ui/scroll-area';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import Opacity from '@/features/editor/control-item/common/opacity';
import Rounded from '@/features/editor/control-item/common/radius';
import AspectRatio from '@/features/editor/control-item/common/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import Volume from '@/features/editor/control-item/common/volume';
import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import Speed from '@/features/editor/control-item/common/speed';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';

const BasicVideo = ({ trackItem, type }) => {
  const showAll = !type;
  const [properties, setProperties] = useState(trackItem);
  const { setCropTarget } = useLayoutStore();
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

  const onChangeBorderWidth = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderWidth: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderWidth: v,
        },
      };
    });
  };

  const onChangeBorderColor = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderColor: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderColor: v,
        },
      };
    });
  };

  const handleChangeOpacity = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            opacity: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          opacity: v,
        },
      };
    });
  };

  const onChangeBorderRadius = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            borderRadius: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          borderRadius: v,
        },
      };
    });
  };

  const onChangeBoxShadow = boxShadow => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            boxShadow: boxShadow,
          },
        },
      },
    });

    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          boxShadow,
        },
      };
    });
  };
  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

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
      key: 'crop',
      component: (
        <div className='mb-4'>
          <Button
            variant={'secondary'}
            size={'icon'}
            onClick={() => {
              setCropTarget(trackItem);
            }}
          >
            <Crop size={18} />
          </Button>
        </div>
      ),
    },
    {
      key: 'basic',
      component: (
        <div className='flex flex-col gap-2'>
          <Label className='font-sans text-xs font-semibold text-primary'>Basic</Label>
          <AspectRatio />
          <Volume onChange={v => handleChangeVolume(v)} value={properties.details.volume ?? 100} />
          <Opacity onChange={v => handleChangeOpacity(v)} value={properties.details.opacity ?? 100} />
          <Speed value={properties.playbackRate ?? 1} onChange={handleChangeSpeed} />
          <Rounded onChange={v => onChangeBorderRadius(v)} value={properties.details.borderRadius} />
        </div>
      ),
    },

    {
      key: 'outline',
      component: (
        <Outline
          onChageBorderWidth={v => onChangeBorderWidth(v)}
          onChangeBorderColor={v => onChangeBorderColor(v)}
          valueBorderWidth={properties.details.borderWidth}
          valueBorderColor={properties.details.borderColor}
          label='Outline'
        />
      ),
    },
    {
      key: 'shadow',
      component: (
        <Shadow
          onChange={v => onChangeBoxShadow(v)}
          value={
            properties.details.boxShadow ?? {
              color: 'transparent',
              x: 0,
              y: 0,
              blur: 0,
            }
          }
          label='Shadow'
        />
      ),
    },
  ];

  return (
    <div className='flex flex-1 flex-col'>
      <div className='text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium'>Video</div>
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

export default BasicVideo;
