import { DesktopSections, useAudioSections } from '@/features/editor/control-item/media-sections';

const Basic = () => <DesktopSections title='Basic' sections={useAudioSections().reverse()} />;

export default Basic;
