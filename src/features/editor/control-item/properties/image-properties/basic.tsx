import { DesktopSections, useMediaSections } from '@/features/editor/control-item/media-sections';

const Basic = () => <DesktopSections sections={useMediaSections('image').filter(s => s.key !== 'crop')} />;

export default Basic;
