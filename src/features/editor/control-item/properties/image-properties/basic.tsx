import React, { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';
import AspectRatio from '@/features/editor/control-item/common/aspect-ratio';
import Rounded from '@/features/editor/control-item/common/radius';
import Opacity from '@/features/editor/control-item/common/opacity';
import Blur from '@/features/editor/control-item/common/blur';
import Brightness from '@/features/editor/control-item/common/brightness';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';

const Basic = () => {
  const { trackItem, setCropTarget } = useLayoutStore();
  const [properties, setProperties] = useState(trackItem);

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

  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      {/* <h3 className='text-lg font-semibold text-gray-800'>Basic Image Properties</h3> */}

      {/* Crop Button */}
      {/* <div className='mb-4'>
        <Button
          variant='outline'
          size={'icon'}
          onClick={() => {
            setCropTarget(trackItem);
          }}
          className='border-gray-200'
        >
          <Crop size={18} />
        </Button>
      </div> */}

      <div className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <Label className='font-sans text-xs font-semibold'>Basic</Label>
          {/* <AspectRatio /> */}
          <Rounded onChange={v => onChangeBorderRadius(v)} value={properties.details.borderRadius} />
          <Opacity onChange={v => handleChangeOpacity(v)} value={properties.details.opacity ?? 100} />
          <Blur onChange={v => onChangeBlur(v)} value={properties.details.blur ?? 0} />
          <Brightness onChange={v => onChangeBrightness(v)} value={properties.details.brightness ?? 100} />
        </div>

        <Outline
          label='Outline'
          onChageBorderWidth={v => onChangeBorderWidth(v)}
          onChangeBorderColor={v => onChangeBorderColor(v)}
          valueBorderWidth={properties.details.borderWidth}
          valueBorderColor={properties.details.borderColor}
        />

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
      </div>
    </div>
  );
};

export default Basic;
