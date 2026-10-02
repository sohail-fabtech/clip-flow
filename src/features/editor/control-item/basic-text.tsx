import { ScrollArea } from '@/components/ui/scroll-area';
import useDataState from '@/features/editor/stores/use-data-state';
import { loadFonts } from '@/features/editor/utils/fonts';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import React, { useEffect, useState } from 'react';
import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import { TextControls } from '@/features/editor/control-item/common/text';
import { DEFAULT_FONT } from '@/features/editor/constants/font';
import { PresetText } from '@/features/editor/control-item/common/preset-text';

const getStyleNameFromFontName = fontName => {
  const fontFamilyEnd = fontName.lastIndexOf('-');
  const styleName = fontName.substring(fontFamilyEnd + 1).replace('Italic', ' Italic');
  return styleName;
};

const BasicText = ({ trackItem, type }) => {
  const showAll = !type;
  const [properties, setProperties] = useState({
    color: '#000000',
    colorDisplay: '#000000',
    backgroundColor: 'transparent',
    fontSize: 12,
    fontSizeDisplay: '12px',
    fontFamily: 'Open Sans',
    fontFamilyDisplay: 'Open Sans',
    opacity: 1,
    opacityDisplay: '100%',
    textAlign: 'left',
    textDecoration: 'none',
    borderWidth: 0,
    borderColor: '#000000',
    boxShadow: {
      color: '#000000',
      x: 0,
      y: 0,
      blur: 0,
    },
  });

  const [selectedFont, setSelectedFont] = useState({
    family: 'Open Sans',
    styles: [],
    default: DEFAULT_FONT,
    name: 'Regular',
  });
  const { compactFonts, fonts } = useDataState();

  useEffect(() => {
    const fontFamily = trackItem.details.fontFamily || DEFAULT_FONT.postScriptName;
    const currentFont = fonts.find(font => font.postScriptName === fontFamily);

    if (!currentFont) return;

    const selectedFont = compactFonts.find(font => font.family === currentFont?.family);

    if (!selectedFont) return;

    setSelectedFont({
      ...selectedFont,
      name: getStyleNameFromFontName(currentFont.postScriptName),
    });

    setProperties({
      color: trackItem.details.color || '#ffffff',
      colorDisplay: trackItem.details.color || '#ffffff',
      backgroundColor: trackItem.details.backgroundColor || 'transparent',
      fontSize: trackItem.details.fontSize || 62,
      fontSizeDisplay: `${trackItem.details.fontSize || 62}px`,
      fontFamily: selectedFont?.family || 'Open Sans',
      fontFamilyDisplay: selectedFont?.family || 'Open Sans',
      opacity: trackItem.details.opacity || 1,
      opacityDisplay: `${trackItem.details.opacity.toString() || '100'}%`,
      textAlign: trackItem.details.textAlign || 'left',
      textDecoration: trackItem.details.textDecoration || 'none',
      borderWidth: trackItem.details.borderWidth || 0,
      borderColor: trackItem.details.borderColor || '#000000',
      boxShadow: trackItem.details.boxShadow || {
        color: '#000000',
        x: 0,
        y: 0,
        blur: 0,
      },
    });
  }, [trackItem.id]);

  const handleChangeFontStyle = async font => {
    const fontName = font.postScriptName;
    const fontUrl = font.url;
    const styleName = getStyleNameFromFontName(fontName);
    await loadFonts([
      {
        name: fontName,
        url: fontUrl,
      },
    ]);
    setSelectedFont({ ...selectedFont, name: styleName });
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            fontFamily: fontName,
            fontUrl: fontUrl,
          },
        },
      },
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
        borderWidth: v,
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
        borderColor: v,
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
        opacity: v,
      };
    }); // Update local state
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
        boxShadow,
      };
    });
  };

  const onChangeFontSize = v => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            fontSize: v,
          },
        },
      },
    });
    setProperties(prev => {
      return {
        ...prev,
        fontSize: v,
      };
    });
  };

  const onChangeFontFamily = async font => {
    const fontName = font.default.postScriptName;
    const fontUrl = font.default.url;

    await loadFonts([
      {
        name: fontName,
        url: fontUrl,
      },
    ]);
    setSelectedFont({ ...font, name: getStyleNameFromFontName(fontName) });
    setProperties({
      ...properties,
      fontFamily: font.default.family,
      fontFamilyDisplay: font.default.family,
    });

    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            fontFamily: fontName,
            fontUrl: fontUrl,
          },
        },
      },
    });
  };

  const handleColorChange = color => {
    setProperties(prev => {
      return {
        ...prev,
        color: color,
      };
    });

    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            color: color,
          },
        },
      },
    });
  };

  const handleBackgroundChange = color => {
    setProperties(prev => {
      return {
        ...prev,
        backgroundColor: color,
      };
    });

    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            backgroundColor: color,
          },
        },
      },
    });
  };

  const onChangeTextAlign = v => {
    setProperties(prev => {
      return {
        ...prev,
        textAlign: v,
      };
    });
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            textAlign: v,
          },
        },
      },
    });
  };

  const onChangeTextDecoration = v => {
    setProperties({
      ...properties,
      textDecoration: v,
    });

    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            textDecoration: v,
          },
        },
      },
    });
  };

  const components = [
    {
      key: 'textPreset',
      component: <PresetText trackItem={trackItem} properties={properties} />,
    },
    {
      key: 'textControls',
      component: (
        <TextControls
          trackItem={trackItem}
          properties={properties}
          selectedFont={selectedFont}
          onChangeFontFamily={onChangeFontFamily}
          handleChangeFontStyle={handleChangeFontStyle}
          onChangeFontSize={onChangeFontSize}
          handleColorChange={handleColorChange}
          handleBackgroundChange={handleBackgroundChange}
          onChangeTextAlign={onChangeTextAlign}
          onChangeTextDecoration={onChangeTextDecoration}
          handleChangeOpacity={handleChangeOpacity}
        />
      ),
    },

    {
      key: 'fontStroke',
      component: (
        <Outline
          label='Font stroke'
          onChangeBorderWidth={v => onChangeBorderWidth(v)}
          onChangeBorderColor={v => onChangeBorderColor(v)}
          valueBorderWidth={properties.borderWidth}
          valueBorderColor={properties.borderColor}
        />
      ),
    },
    {
      key: 'fontShadow',
      component: (
        <Shadow
          label='Font shadow'
          onChange={v => onChangeBoxShadow(v)}
          value={
            properties.boxShadow ?? {
              color: '#000000',
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
    <div className='flex lg:h-[calc(100vh-58px)] flex-1 flex-col overflow-hidden min-h-[340px]'>
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

export default BasicText;
