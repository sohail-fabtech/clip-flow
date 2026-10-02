import { useEffect } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ElementCrop } from '@/features/editor/crop-modal/element-crop';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useCropStore from '@/features/editor/stores/use-crop-store';

const CropModal = () => {
  const { cropTarget, setCropTarget } = useLayoutStore();
  const { loadVideo, reset, area, scale: scaled, element, loadImage, clear } = useCropStore();

  const apply = () => {
    if (!cropTarget) return;
    const cropTargetDetails = cropTarget.details;

    const scale = 1 / scaled;

    const oldWidth = cropTargetDetails.width ?? 0;
    const oldHeight = cropTargetDetails.height ?? 0;
    const scaleMatch = cropTargetDetails.transform?.match(/scale\(([^)]+)\)/);
    const imageScale = scaleMatch ? Number.parseFloat(scaleMatch[1]) : 1;

    const [cropX, cropY, newWidth, newHeight] = area.map(value => value * scale);
    const prevCropX = cropTargetDetails.crop?.x ?? 0;
    const prevCropY = cropTargetDetails.crop?.y ?? 0;

    const oldCenterX = Number.parseFloat(String(cropTargetDetails.left ?? 0)) + oldWidth / 2;
    const oldCenterY = Number.parseFloat(String(cropTargetDetails.top ?? 0)) + oldHeight / 2;

    const diffWidth = ((oldWidth - newWidth) * imageScale) / 2;
    const diffHeight = ((oldHeight - newHeight) * imageScale) / 2;

    const cropXDiff = (cropX - prevCropX) * imageScale;
    const cropYDiff = (cropY - prevCropY) * imageScale;

    const newCenterX = oldCenterX - diffWidth + cropXDiff;
    const newCenterY = oldCenterY - diffHeight + cropYDiff;

    const adjustedLeft = newCenterX - newWidth / 2;
    const adjustedTop = newCenterY - newHeight / 2;

    dispatch(EDIT_OBJECT, {
      payload: {
        [cropTarget.id]: {
          details: {
            top: adjustedTop,
            left: adjustedLeft,
            crop: {
              x: cropX,
              y: cropY,
              width: newWidth,
              height: newHeight,
            },
          },
        },
      },
    });

    clear();
    setCropTarget(null);
  };

  useEffect(() => {
    if (!cropTarget) return;
    const src = cropTarget.details.src;
    if (!src) return;
    if (cropTarget.type === 'video') loadVideo(src);
    if (cropTarget.type === 'image') loadImage(src);
  }, [cropTarget]);

  if (!cropTarget) return null;
  const details = cropTarget.details;

  return (
    <Dialog
      open
      onOpenChange={() => {
        clear();
        setCropTarget(null);
      }}
    >
      <DialogContent className='z-[300] flex h-[640px] w-[900px] max-w-7xl flex-col bg-zinc-950 px-8 text-white'>
        <DialogTitle>Crop</DialogTitle>
        <DialogDescription>Drag the handles to choose the visible area.</DialogDescription>
        <div className='flex flex-grow items-center justify-center bg-zinc-800'>
          {element && (
            <ElementCrop
              size={{ width: details.width ?? 0, height: details.height ?? 0 }}
              targetDetails={details}
              element={element}
            />
          )}
        </div>
        <div className='flex h-24 items-center justify-end gap-4'>
          <Button variant='secondary' onClick={reset}>
            Reset
          </Button>
          <Button variant='outline' onClick={apply}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CropModal;
