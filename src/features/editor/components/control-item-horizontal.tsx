import { useEffect, useRef } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ColorPicker } from '@/components/ui/color-picker';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import BasicText from '@/features/editor/control-item/basic-text';
import BasicImage from '@/features/editor/control-item/basic-image';
import BasicVideo from '@/features/editor/control-item/basic-video';
import BasicAudio from '@/features/editor/control-item/basic-audio';
import type { ItemDetails, TrackItem } from '@/features/editor/types';

const MENUS: Record<string, { id: string; label: string }[]> = {
  text: [
    { id: 'textPreset', label: 'Preset' },
    { id: 'textControls', label: 'Styles' },
    { id: 'fontStroke', label: 'Stroke' },
    { id: 'fontShadow', label: 'Shadow' },
  ],
  image: [
    { id: 'crop', label: 'Crop' },
    { id: 'basic', label: 'Basic' },
    { id: 'outline', label: 'Outline' },
    { id: 'shadow', label: 'Shadow' },
  ],
  video: [
    { id: 'crop', label: 'Crop' },
    { id: 'basic', label: 'Basic' },
    { id: 'outline', label: 'Outline' },
    { id: 'shadow', label: 'Shadow' },
  ],
  audio: [
    { id: 'speed', label: 'Speed' },
    { id: 'volume', label: 'Volume' },
  ],
};

const COLOR_CONTROLS: Record<
  string,
  {
    label: string;
    read: (details: ItemDetails) => string | undefined;
    write: (color: string, details: ItemDetails) => Partial<ItemDetails>;
  }
> = {
  color: { label: 'Color', read: d => d.color, write: color => ({ color }) },
  backgroundColor: {
    label: 'Background Color',
    read: d => d.backgroundColor,
    write: backgroundColor => ({ backgroundColor }),
  },
  strokeColor: { label: 'Stroke Color', read: d => d.borderColor, write: borderColor => ({ borderColor }) },
  shadowColor: {
    label: 'Shadow Color',
    read: d => d.boxShadow?.color,
    write: (color, d) => ({ boxShadow: { x: 0, y: 0, blur: 0, ...d.boxShadow, color } }),
  },
};

const PANELS = { text: BasicText, image: BasicImage, video: BasicVideo, audio: BasicAudio };

const ControlItem = ({ trackItem, feature }: { trackItem: TrackItem; feature: string }) => {
  const color = COLOR_CONTROLS[feature];
  if (color) {
    return (
      <div className='flex flex-col gap-4 p-4'>
        <Label className='font-sans text-xs font-semibold'>{color.label}</Label>
        <div className='flex items-center justify-center pb-4'>
          <ColorPicker
            value={color.read(trackItem.details) || '#ffffff'}
            onChange={value =>
              dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { details: color.write(value, trackItem.details) } } })
            }
          />
        </div>
      </div>
    );
  }
  const Panel = PANELS[trackItem.type as keyof typeof PANELS];
  return Panel ? <Panel trackItem={trackItem} type={feature} /> : null;
};

const SPRING = { type: 'spring', damping: 25, stiffness: 300 } as const;

export default function ControlItemHorizontal() {
  const {
    trackItem,
    typeControlItem,
    controItemDrawerOpen,
    setTypeControlItem,
    setControItemDrawerOpen,
    setLabelControlItem,
  } = useLayoutStore();
  const controls = useAnimation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!drawerRef.current?.contains(target) && !barRef.current?.contains(target)) setControItemDrawerOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [setControItemDrawerOpen]);

  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (offset.y > 50 || velocity.y > 500) setControItemDrawerOpen(false);
    else controls.start({ y: 0, transition: SPRING });
  };

  if (!trackItem) return null;

  return (
    <>
      <div ref={barRef} className='flex h-12 items-center border-t border-white/10'>
        <ScrollArea className='w-full px-2'>
          <div className='flex min-w-max items-center justify-center space-x-4 px-4'>
            {(MENUS[trackItem.type] ?? []).map(({ id, label }) => (
              <Button
                key={id}
                onClick={() => {
                  setControItemDrawerOpen(true);
                  setTypeControlItem(id);
                  setLabelControlItem(label);
                }}
                variant={typeControlItem === id ? 'secondary' : 'ghost'}
                size='sm'
                className='text-muted-foreground'
              >
                {label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      </div>
      {controItemDrawerOpen && (
        <motion.div
          className='pointer-events-none fixed inset-0 z-50 flex items-end'
          initial={{ y: '100%' }}
          animate={{ y: 0, transition: SPRING }}
        >
          <motion.div
            ref={drawerRef}
            className='pointer-events-auto mb-12 max-h-[80vh] min-h-[340px] w-full rounded-t-lg border-t bg-background shadow-lg'
            drag='y'
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={onDragEnd}
            animate={controls}
            whileDrag={{ scale: 0.98 }}
            transition={SPRING}
          >
            <div className='flex h-full flex-col'>
              <div className='flex cursor-grab touch-none items-center justify-center p-4 active:cursor-grabbing'>
                <div className='h-1 w-24 rounded-full bg-zinc-700' />
              </div>
              <div className='flex-1 overflow-auto'>
                <ControlItem trackItem={trackItem} feature={typeControlItem} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
