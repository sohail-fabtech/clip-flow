import { PresetGrid } from '@/features/editor/control-item/floating-controls/text-preset-picker';
import useLayoutStore from '@/features/editor/stores/use-layout-store';

const Presets = () => {
  const trackItem = useLayoutStore(state => state.trackItem);
  if (!trackItem) return null;
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Text Presets</h3>
      <PresetGrid trackItem={trackItem} className='grid grid-cols-3 gap-3' />
    </div>
  );
};

export default Presets;
