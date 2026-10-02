import { DesktopSections } from '@/features/editor/control-item/media-sections';
import { useTextSections } from '@/features/editor/control-item/text-sections';

const Basic = () => (
  <DesktopSections title='Basic' sections={useTextSections().filter(section => section.key === 'textControls')} />
);

export default Basic;
