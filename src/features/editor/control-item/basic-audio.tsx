import { MobilePanel } from '@/features/editor/control-item/mobile-panel';
import { useAudioSections } from '@/features/editor/control-item/media-sections';
import type { TrackItem } from '@/features/editor/types';

const BasicAudio = ({ trackItem, type }: { trackItem: TrackItem; type?: string }) => (
  <MobilePanel title='Audio' type={type} sections={useAudioSections(trackItem)} />
);

export default BasicAudio;
