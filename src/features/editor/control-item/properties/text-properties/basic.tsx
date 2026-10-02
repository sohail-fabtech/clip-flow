import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import useDataState from '@/features/editor/stores/use-data-state';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { ChevronDown, Search, Strikethrough, Underline, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { onChangeFontFamily } from '@/features/editor/control-item/floating-controls/font-family-picker';
import { Slider } from '@/components/ui/slider';
import { loadFonts } from '@/features/editor/utils/fonts';
import { DEFAULT_FONT } from '@/features/editor/constants/font';

const getStyleNameFromFontName = fontName => {
  const fontFamilyEnd = fontName.lastIndexOf('-');
  const styleName = fontName.substring(fontFamilyEnd + 1).replace('Italic', ' Italic');
  return styleName;
};

const Basic = () => {
  const { trackItem } = useLayoutStore();
  const { compactFonts, fonts } = useDataState();

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

  useEffect(() => {
    if (!trackItem) return;

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
  }, [trackItem?.id, compactFonts, fonts]);

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
    });
  };

  if (!trackItem) return null;

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Basic</h3>
      <div className='space-y-4'>
        <FontFamily handleChangeFont={onChangeFontFamily} fontFamilyDisplay={properties.fontFamilyDisplay} />
        <FontStyle selectedFont={selectedFont} handleChangeFontStyle={handleChangeFontStyle} />
        <FontSize value={properties.fontSize} onChange={onChangeFontSize} />
        <FontColor value={properties.color} handleColorChange={handleColorChange} />
        <FontBackground value={properties.backgroundColor} handleColorChange={handleBackgroundChange} />
        <Alignment value={properties.textAlign} onChange={onChangeTextAlign} />
        <TextDecoration value={properties.textDecoration} onChange={onChangeTextDecoration} />
        <FontCase id={trackItem.id} />
        <Opacity onChange={v => handleChangeOpacity(v)} value={properties.opacity ?? 100} />
      </div>
    </div>
  );
};

const FontBackground = ({ value, handleColorChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen, setTypeControlItem, setLabelControlItem } = useLayoutStore();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleColorClick = () => {
    if (!isLargeScreen) {
      setControItemDrawerOpen(true);
      setTypeControlItem('backgroundColor');
      setLabelControlItem('Background Color');
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Fill</div>
      {isLargeScreen ? (
        <div className='relative w-32'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <div className='relative'>
                <div
                  style={{ background: localValue || '#ffffff' }}
                  className='absolute left-0.5 top-0.5 h-7 w-7 flex-none cursor-pointer border border-gray-100 rounded'
                />

                <Input
                  className='pointer-events-none h-8 pl-10 border-gray-200 focus-visible:ring-0 outline-none rounded'
                  value={localValue}
                  onChange={() => {}}
                />
              </div>
            </PopoverTrigger>

            <PopoverContent
              side='bottom'
              align='end'
              className='z-[1000] w-[280px] p-4 bg-[#27272A] text-white border-none rounded  '
            >
              <div className='drag-handle flex w-[266px] cursor-grab justify-between rounded-t-lg bg-popover pr-4 mb-4'>
                <p className='text-sm font-bold'>Fill</p>
                <div
                  className='h-4 w-4'
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X className='h-4 w-4 cursor-pointer font-extrabold text-white' />
                </div>
              </div>
              <ColorPicker
                value={localValue}
                onChange={v => {
                  setLocalValue(v);
                  handleColorChange(v);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className='relative w-32'>
          <div className='relative cursor-pointer' onClick={handleColorClick}>
            <div
              style={{ background: localValue || '#ffffff' }}
              className='absolute left-0.5 top-0.5 h-7 w-7 flex-none rounded-md border border-border'
            />

            <Input className='pointer-events-none h-8 pl-10' value={localValue} onChange={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

const FontColor = ({ value, handleColorChange }) => {
  const [localValue, setLocalValue] = useState(value);
  const [open, setOpen] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const { setControItemDrawerOpen, setTypeControlItem, setLabelControlItem } = useLayoutStore();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleColorClick = () => {
    if (!isLargeScreen) {
      setControItemDrawerOpen(true);
      setTypeControlItem('color');
      setLabelControlItem('Color');
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Color</div>
      {isLargeScreen ? (
        <div className='relative w-32'>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className='border-gray-200'>
              <div className='relative'>
                <div
                  style={{ background: localValue || '#ffffff' }}
                  className='absolute left-0.5 top-0.5 h-7 w-7 flex-none cursor-pointer border border-gray-100 rounded'
                />

                <Input
                  className='pointer-events-none h-8 pl-10 border-gray-200 focus-visible:ring-0 outline-none rounded'
                  value={localValue}
                  onChange={() => {}}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              side='bottom'
              align='end'
              className='z-[1000] w-[280px] bg-[#27272A] text-white border-none p-4 rounded'
            >
              <div className='drag-handle flex w-[266px] cursor-grab justify-between rounded-t-lg bg-popover pr-4 mb-4'>
                <p className='text-sm font-bold'>Color</p>
                <div
                  className='h-4 w-4'
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <X className='h-4 w-4 cursor-pointer font-extrabold text-white' />
                </div>
              </div>
              <ColorPicker
                value={localValue}
                onChange={v => {
                  setLocalValue(v);
                  handleColorChange(v);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className='relative w-32'>
          <div className='relative cursor-pointer' onClick={handleColorClick}>
            <div
              style={{ background: localValue || '#ffffff' }}
              className='absolute left-0.5 top-0.5 h-7 w-7 flex-none rounded-md border border-border'
            />

            <Input className='pointer-events-none h-8 pl-10' value={localValue} onChange={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

const FontSize = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== '') {
      onChange(Number(localValue)); // Propagate as a number
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (localValue !== '') {
        onChange(Number(localValue)); // Propagate as a number
      }
    }
  };

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Size</div>
      <div className='relative w-32'>
        <Input
          className='h-8 rounded border-gray-200 focus-visible:ring-0 outline-none'
          value={localValue}
          onChange={e => {
            const newValue = e.target.value;

            // Allow empty string or validate as a number
            if (newValue === '' || (!Number.isNaN(Number(newValue)) && Number(newValue) >= 0)) {
              setLocalValue(newValue); // Update local state
            }
          }}
          onBlur={handleBlur} // Trigger onBlur event
          onKeyDown={handleKeyDown} // Trigger onKeyDown event
        />
      </div>
    </div>
  );
};

const FontFamily = ({ handleChangeFont, fontFamilyDisplay }) => {
  const isLargeScreen = useIsLargeScreen();
  const { setFloatingControl, trackItem } = useLayoutStore();
  const { compactFonts } = useDataState();
  const [value, setValue] = useState('');
  const [fonts, setFonts] = useState(compactFonts);
  useEffect(() => {
    const filteredFonts = compactFonts.filter(font => font.family.toLowerCase().includes(value.toLowerCase()));
    setFonts(filteredFonts);
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Font</div>
      {/* {isLargeScreen ? (
          <div className='relative w-32'>
            <Button
              className='flex h-8 w-32 items-center justify-between text-sm bg-transparent border-gray-200'
              variant='outline'
              onClick={() => setFloatingControl('font-family-picker')}
            >
              <div className='w-full overflow-hidden text-left'>
                <p className='truncate'>{fontFamilyDisplay}</p>
              </div>
              <ChevronDown className='text-black' size={14} />
            </Button>
          </div>
        ) : ( */}
      <div>
        <Popover>
          <PopoverTrigger>
            <Button
              className='flex h-8 w-32 items-center justify-between rounded text-sm bg-transparent border-gray-200'
              variant='outline'
            >
              <div className='w-full overflow-hidden text-left'>
                <p className='truncate'> {fontFamilyDisplay}</p>
              </div>
              <ChevronDown className='text-muted-foreground' size={14} />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align='end'
            className='z-[1000] bg-white text-black border-gray-200 rounded-[10px] overflow-hidden w-full p-0 -ml-4'
          >
            <div className='relative flex items-center rounded-md focus-within:ring-1 focus-within:ring-ring pl-2'>
              <Search className='h-5 w-5 text-muted-foreground' />
              <Input
                type='email'
                placeholder='Search font...'
                className='border-0 focus-visible:ring-0 shadow-none !bg-transparent'
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
            <ScrollArea className='h-[300px] w-full py-2'>
              {fonts.length > 0 ? (
                fonts.map((font, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (trackItem) {
                        onChangeFontFamily(font, trackItem);
                      }
                    }}
                    className='cursor-pointer px-2 py-1 hover:bg-black/10'
                  >
                    <img style={{ filter: 'black' }} src={font.default.preview} alt={font.family} />
                  </div>
                ))
              ) : (
                <p className='py-2 text-center text-sm text-muted-foreground'>No font found</p>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      {/* )} */}
    </div>
  );
};

const FontStyle = ({ selectedFont, handleChangeFontStyle }) => {
  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Weight</div>
      <div className='relative w-32'>
        <Popover>
          <PopoverTrigger>
            <Button
              className='flex h-8 w-32 items-center justify-between rounded text-sm bg-transparent border-gray-200'
              variant='outline'
            >
              <div className='w-full overflow-hidden text-left'>
                <p className='truncate'> {selectedFont.name}</p>
              </div>
              <ChevronDown className='text-black' size={14} />
            </Button>
          </PopoverTrigger>

          <PopoverContent className='z-[1000] w-32 p-0 bg-white text-black border-none shadow-[0_0_10px_0_rgba(0,0,0,0.1)] rounded'>
            {selectedFont.styles.map((style, index) => {
              const fontFamilyEnd = style.postScriptName.lastIndexOf('-');
              const styleName = style.postScriptName.substring(fontFamilyEnd + 1).replace('Italic', ' Italic');
              return (
                <div
                  className='flex h-6 cursor-pointer items-center px-2 py-3.5 text-sm text-black hover:bg-black/10'
                  key={index}
                  onClick={() => handleChangeFontStyle(style)}
                >
                  {styleName}
                </div>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const TextDecoration = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Decoration</div>
      <div className='flex gap-2'>
        <div className='relative w-32'>
          <ToggleGroup
            value={localValue.split(' ')}
            size='sm'
            className='grid grid-cols-3'
            type='multiple'
            onValueChange={v => onChange(v.filter(v => v !== 'none').join(' '))}
          >
            <ToggleGroupItem size='sm' value='underline' aria-label='Toggle left'>
              <Underline size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem value='line-through' aria-label='Toggle italic'>
              <Strikethrough size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem value='overline' aria-label='Toggle strikethrough'>
              <div>
                <svg width={18} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M5.59996 1.75977C5.43022 1.75977 5.26744 1.82719 5.14741 1.94722C5.02739 2.06724 4.95996 2.23003 4.95996 2.39977C4.95996 2.5695 5.02739 2.73229 5.14741 2.85231C5.26744 2.97234 5.43022 3.03977 5.59996 3.03977H18.4C18.5697 3.03977 18.7325 2.97234 18.8525 2.85231C18.9725 2.73229 19.04 2.5695 19.04 2.39977C19.04 2.23003 18.9725 2.06724 18.8525 1.94722C18.7325 1.82719 18.5697 1.75977 18.4 1.75977H5.59996ZM7.99996 6.79977C7.99996 6.58759 7.91568 6.38411 7.76565 6.23408C7.61562 6.08405 7.41213 5.99977 7.19996 5.99977C6.98779 5.99977 6.7843 6.08405 6.63428 6.23408C6.48425 6.38411 6.39996 6.58759 6.39996 6.79977V15.2798C6.39996 16.765 6.98996 18.1894 8.04016 19.2396C9.09037 20.2898 10.5147 20.8798 12 20.8798C13.4852 20.8798 14.9096 20.2898 15.9598 19.2396C17.01 18.1894 17.6 16.765 17.6 15.2798V6.79977C17.6 6.58759 17.5157 6.38411 17.3656 6.23408C17.2156 6.08405 17.0121 5.99977 16.8 5.99977C16.5878 5.99977 16.3843 6.08405 16.2343 6.23408C16.0842 6.38411 16 6.58759 16 6.79977V15.2798C16 16.3406 15.5785 17.358 14.8284 18.1082C14.0782 18.8583 13.0608 19.2798 12 19.2798C10.9391 19.2798 9.92168 18.8583 9.17153 18.1082C8.42139 17.358 7.99996 16.3406 7.99996 15.2798V6.79977Z'
                    fill='currentColor'
                  />
                </svg>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

const fontAlignmentOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const Alignment = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Align</div>
      <div className='flex gap-2'>
        <div className='relative w-32'>
          <Popover>
            <PopoverTrigger>
              <Button
                className='flex h-8 w-32 items-center justify-between rounded text-sm bg-transparent border-gray-200'
                variant='outline'
              >
                <div className='w-full overflow-hidden text-left'>
                  <p className='truncate'>{localValue}</p>
                </div>
                <ChevronDown className='text-white' size={14} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className='z-[1000] w-32 p-0 py-1 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] text-black border-none rounded'>
              {fontAlignmentOptions.map((option, index) => {
                return (
                  <div
                    onClick={() => {
                      setLocalValue(option.value);
                      onChange(option.value);
                    }}
                    className='flex h-8 cursor-pointer items-center px-4 text-sm text-black hover:bg-black/10'
                    key={index}
                  >
                    {option.label}
                  </div>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

const fontCaseOptions = [
  { value: 'none', label: 'As typed' },
  { value: 'uppercase', label: 'Uppercase' },
  { value: 'lowercase', label: 'Lowercase' },
];

const FontCase = ({ id }) => {
  const [value, setValue] = useState('none');
  const onChangeFontCase = value => {
    setValue(value);
    dispatch(EDIT_OBJECT, {
      payload: {
        [id]: {
          details: {
            textTransform: value,
          },
        },
      },
    });
  };
  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-center text-sm text-muted-foreground'>Case</div>
      <div className='relative w-32'>
        <div className='relative w-32'>
          <Popover>
            <PopoverTrigger>
              <Button
                className='flex h-8 w-32 items-center justify-between rounded text-sm bg-transparent border-gray-200'
                variant='outline'
              >
                <div className='w-full overflow-hidden text-left'>
                  <p className='truncate'>{value}</p>
                </div>
                <ChevronDown className='text-black' size={14} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className='z-[1000] w-32 p-0 py-1 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] text-black border-none rounded'>
              {fontCaseOptions.map((option, index) => {
                return (
                  <div
                    onClick={() => onChangeFontCase(option.value)}
                    className='flex h-8 cursor-pointer items-center px-4 text-sm text-black hover:bg-black/10'
                    key={index}
                  >
                    {option.label}
                  </div>
                );
              })}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

const Opacity = ({ value, onChange }) => {
  // Create local state to manage opacity
  const [localValue, setLocalValue] = useState(value);

  // Update local state when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className='flex gap-2'>
      <div className='flex flex-1 items-start text-sm text-muted-foreground'>Opacity</div>
      <div
        className='w-32 flex items-center gap-2'
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
        }}
      >
        <Slider
          id='opacity'
          value={[localValue]} // Use local state for slider value
          trackColor='bg-gray-100'
          rangeColor='bg-black'
          onValueChange={e => {
            setLocalValue(e[0]); // Update local state
          }}
          onValueCommit={() => {
            onChange(localValue); // Propagate value to parent when user commits change
          }}
          min={0}
          max={100}
          step={1}
          aria-label='Opacity'
          className=''
        />
        <Input
          max={100}
          className='h-8 w-11 px-2 text-center text-sm rounded-[8px] border-gray-100 focus-visible:border-gray-200 focus-visible:ring-0 outline-none'
          onChange={e => {
            const newValue = Number(e.target.value);
            if (newValue >= 0 && newValue <= 100) {
              setLocalValue(newValue); // Update local state
              onChange(newValue); // Optionally propagate immediately, or adjust as needed
            }
          }}
          value={localValue} // Use local state for input value
        />
      </div>
    </div>
  );
};

export default Basic;
