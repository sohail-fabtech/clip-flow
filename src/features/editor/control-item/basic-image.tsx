import { ScrollArea } from '@/components/ui/scroll-area';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import Opacity from '@/features/editor/control-item/common/opacity';
import Rounded from '@/features/editor/control-item/common/radius';
import AspectRatio from '@/features/editor/control-item/common/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import Blur from '@/features/editor/control-item/common/blur';
import Brightness from '@/features/editor/control-item/common/brightness';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';

const BasicImage = ({ trackItem, type }) => {
  const showAll = !type;
  const [properties, setProperties] = useState(trackItem);
  const { setCropTarget } = useLayoutStore();
  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

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

  const onChangeBlur = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            blur: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          blur: v,
        },
      };
    });
  };

  const onChangeBrightness = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            brightness: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        details: {
          ...prev.details,
          brightness: v,
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

  const components = [
    {
      key: 'crop',
      component: (
        <div className='mb-4'>
          <Button
            variant='outline'
            size={'icon'}
            onClick={() => {
              setCropTarget(trackItem);
            }}
            className='border-white/20'
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
          <Label className='font-sans text-xs font-semibold'>Basic</Label>

          <AspectRatio />
          <Rounded onChange={v => onChangeBorderRadius(v)} value={properties.details.borderRadius} />
          <Opacity onChange={v => handleChangeOpacity(v)} value={properties.details.opacity ?? 100} />

          <Blur onChange={v => onChangeBlur(v)} value={properties.details.blur ?? 0} />
          <Brightness onChange={v => onChangeBrightness(v)} value={properties.details.brightness ?? 100} />
        </div>
      ),
    },

    {
      key: 'outline',
      component: (
        <Outline
          label='Outline'
          onChageBorderWidth={v => onChangeBorderWidth(v)}
          onChangeBorderColor={v => onChangeBorderColor(v)}
          valueBorderWidth={properties.details.borderWidth}
          valueBorderColor={properties.details.borderColor}
        />
      ),
    },
    {
      key: 'shadow',
      component: (
        <Shadow
          label='Shadow'
          onChange={v => onChangeBoxShadow(v)}
          value={
            properties.details.boxShadow ?? {
              color: 'transparent',
              x: 0,
              y: 0,
              blur: 0,
            }
          }
        />
      ),
    },
  ];

  return (
    <div className='flex flex-1 flex-col'>
      <div className='text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium'>Image</div>
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

export default BasicImage;
