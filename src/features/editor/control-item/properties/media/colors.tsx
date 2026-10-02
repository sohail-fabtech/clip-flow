import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditableTrackItem } from '@/features/editor/hooks/use-editable-track-item';
import { LabeledSlider } from '@/features/editor/control-item/properties/media/labeled-slider';

const ADJUSTMENTS = [
  { key: 'brightness', label: 'Brightness', unit: '%', max: 200, fallback: 100 },
  { key: 'contrast', label: 'Contrast', unit: '%', max: 200, fallback: 100 },
  { key: 'saturation', label: 'Saturation', unit: '%', max: 200, fallback: 100 },
  { key: 'hue', label: 'Hue', unit: '°', max: 360, fallback: 0 },
] as const;

const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'plus-lighter', label: 'Add' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'difference', label: 'Difference' },
];

const Colors = () => {
  const { properties, updateDetails } = useEditableTrackItem();
  if (!properties) return null;
  const { details } = properties;

  return (
    <div className='space-y-4'>
      <Label className='text-sm font-medium'>Color Adjustments</Label>
      {ADJUSTMENTS.map(({ key, label, unit, max, fallback }) => (
        <LabeledSlider
          key={key}
          label={label}
          unit={unit}
          min={0}
          max={max}
          value={details[key] ?? fallback}
          onCommit={value => updateDetails({ [key]: value })}
        />
      ))}
      <Label className='text-sm font-medium'>Blend Mode</Label>
      <Select value={details.blendMode ?? 'normal'} onValueChange={blendMode => updateDetails({ blendMode })}>
        <SelectTrigger className='w-full rounded-[8px]'>
          <SelectValue placeholder='Select blend mode' />
        </SelectTrigger>
        <SelectContent className='z-[1000] rounded-[8px]'>
          {BLEND_MODES.map(mode => (
            <SelectItem key={mode.value} value={mode.value}>
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default Colors;
