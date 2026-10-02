import { Label } from '@/components/ui/label';
import { ColorField } from '@/features/editor/control-item/common/color-field';
import { NumberField } from '@/features/editor/control-item/common/number-field';

interface OutlineProps {
  label: string;
  valueBorderWidth?: number;
  valueBorderColor?: string;
  onChangeBorderWidth: (width: number) => void;
  onChangeBorderColor: (color: string) => void;
}

function Outline({
  label,
  valueBorderWidth = 0,
  valueBorderColor = '#000000',
  onChangeBorderWidth,
  onChangeBorderColor,
}: OutlineProps) {
  return (
    <div className='flex flex-col gap-2 py-4'>
      <Label className='font-sans text-xs font-semibold'>{label}</Label>
      <div className='flex gap-2'>
        <div className='flex flex-1 items-center text-sm text-muted-foreground'>Color</div>
        <ColorField
          title='Color'
          value={valueBorderColor}
          onChange={onChangeBorderColor}
          mobileControl={{ type: 'strokeColor', label: 'Stroke Color' }}
        />
      </div>
      <NumberField label='Size' value={valueBorderWidth} min={0} max={100} onChange={onChangeBorderWidth} />
    </div>
  );
}

export default Outline;
