import { Label } from '@/components/ui/label';
import { ColorField } from '@/features/editor/control-item/common/color-field';
import { NumberField } from '@/features/editor/control-item/common/number-field';
import type { BoxShadow } from '@/features/editor/types';

export const NO_SHADOW: BoxShadow = { color: 'transparent', x: 0, y: 0, blur: 0 };

interface ShadowProps {
  label: string;
  value?: BoxShadow;
  onChange: (shadow: BoxShadow) => void;
}

function Shadow({ label, value = NO_SHADOW, onChange }: ShadowProps) {
  const set = (patch: Partial<BoxShadow>) => onChange({ ...value, ...patch });

  return (
    <div className='flex flex-col gap-2 py-4'>
      <Label className='font-sans text-xs font-semibold'>{label}</Label>
      <div className='flex gap-2'>
        <div className='flex flex-1 items-center text-sm text-muted-foreground'>Color</div>
        <ColorField
          title='Shadow'
          value={value.color}
          onChange={color => set({ color })}
          mobileControl={{ type: 'shadowColor', label: 'Shadow Color' }}
        />
      </div>
      <NumberField label='X' value={value.x} onChange={x => set({ x })} />
      <NumberField label='Y' value={value.y} onChange={y => set({ y })} />
      <NumberField label='Blur' value={value.blur} min={0} onChange={blur => set({ blur })} />
    </div>
  );
}

export default Shadow;
