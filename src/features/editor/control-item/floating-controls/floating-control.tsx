import useLayoutStore from '@/features/editor/stores/use-layout-store';
import FontFamilyPicker from '@/features/editor/control-item/floating-controls/font-family-picker';
import TextPresetPicker from '@/features/editor/control-item/floating-controls/text-preset-picker';

export default function FloatingControl() {
  const { floatingControl, trackItem } = useLayoutStore();
  if (!trackItem) return null;
  if (floatingControl === 'font-family-picker') return <FontFamilyPicker />;
  if (floatingControl === 'text-preset-picker') return <TextPresetPicker trackItem={trackItem} />;
  return null;
}
