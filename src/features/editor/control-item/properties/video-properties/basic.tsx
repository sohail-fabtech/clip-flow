import { DesktopSections, useMediaSections } from '@/features/editor/control-item/media-sections';

const Basic = () => <DesktopSections sections={useMediaSections('video').filter(s => s.key !== 'crop')} />;

export default Basic;
