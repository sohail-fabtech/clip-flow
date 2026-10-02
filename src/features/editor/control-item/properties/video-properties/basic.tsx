import React, { useEffect, useState } from 'react';
import SliderControl from '@/features/editor/control-item/common/slider-control';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Label } from '@/components/ui/label';

// Common controls used across properties panes
import AspectRatio from '@/features/editor/control-item/common/aspect-ratio';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import Speed from '@/features/editor/control-item/common/speed';

const Basic = () => {
  const { trackItem, setCropTarget } = useLayoutStore();
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

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <Label className='font-sans text-xs font-semibold text-primary'>Basic</Label>
          {/* <AspectRatio /> */}
          <SliderControl label='Volume' onChange={v => handleChangeVolume(v)} value={properties.details.volume ?? 100} />
          <SliderControl label='Opacity' onChange={v => handleChangeOpacity(v)} value={properties.details.opacity ?? 100} />
          <Speed value={properties.playbackRate ?? 1} onChange={handleChangeSpeed} />
          <SliderControl label='Round' max={50} onChange={v => onChangeBorderRadius(v)} value={properties.details.borderRadius} />
        </div>

        <Outline
          onChageBorderWidth={v => onChangeBorderWidth(v)}
          onChangeBorderColor={v => onChangeBorderColor(v)}
          valueBorderWidth={properties.details.borderWidth}
          valueBorderColor={properties.details.borderColor}
          label='Outline'
        />

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
      </div>
    </div>
  );
};

export default Basic;
