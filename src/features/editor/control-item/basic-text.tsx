import { MobilePanel } from '@/features/editor/control-item/mobile-panel';
import { useTextSections } from '@/features/editor/control-item/text-sections';
import type { TrackItem } from '@/features/editor/types';

const BasicText = ({ trackItem, type }: { trackItem: TrackItem; type?: string }) => (
  <MobilePanel type={type} sections={useTextSections(trackItem)} />
);

export default BasicText;
