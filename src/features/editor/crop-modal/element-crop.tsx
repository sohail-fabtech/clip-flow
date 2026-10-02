import { useEffect, useRef } from 'react';
import { usePointerDrag } from '@/features/editor/hooks/use-pointer-drag';
import useCropStore from '@/features/editor/stores/use-crop-store';
import { clamp } from '@/features/editor/utils/math';
import type { ItemDetails } from '@/features/editor/types';

const MIN_CROP_SIZE = 100;
const FRAME_TIME = 1000 / 30;
const HANDLE_DIRECTIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

type Area = [number, number, number, number];

interface ElementCropProps {
  element: HTMLImageElement | HTMLVideoElement;
  size: { width: number; height: number };
  targetDetails: ItemDetails;
}

export const ElementCrop = ({ element, size, targetDetails }: ElementCropProps) => {
  const { area, setArea, scale } = useCropStore();
  const canvasPreviewRef = useRef<HTMLCanvasElement>(null);

  const { dragProps, isDragging } = usePointerDrag<{ dirX: number; dirY: number; area: Area }>(
    ({ x, y, deltaX, deltaY, state: { dirX, dirY, area } }) => {
      const rect = canvasPreviewRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newArea: Area = [...area];

      if (dirX === 0 && dirY === 0) {
        newArea[0] = clamp(area[0] + deltaX / (rect.width / (size.width * scale)), 0, size.width * scale - area[2]);
        newArea[1] = clamp(area[1] + deltaY / (rect.height / (size.height * scale)), 0, size.height * scale - area[3]);
      } else {
        const relativeX = clamp((x - rect.left) / (rect.width / (size.width * scale)), 0, size.width * scale);
        const relativeY = clamp((y - rect.top) / (rect.height / (size.height * scale)), 0, size.height * scale);

        const endX = area[0] + area[2];
        const endY = area[1] + area[3];

        if (dirY === -1) {
          newArea[1] = Math.min(relativeY, Math.max(endY - MIN_CROP_SIZE, 0));
          newArea[3] = endY - newArea[1];
        } else if (dirY === 1) {
          newArea[3] = Math.max(relativeY - newArea[1], Math.min(MIN_CROP_SIZE, size.height * scale));
        }

        if (dirX === -1) {
          newArea[0] = Math.min(relativeX, Math.max(endX - MIN_CROP_SIZE, 0));
          newArea[2] = endX - newArea[0];
        } else if (dirX === 1) {
          newArea[2] = Math.max(relativeX - newArea[0], Math.min(MIN_CROP_SIZE, size.width * scale));
        }
      }

      setArea(newArea);
    },
  );

  useEffect(() => {
    let frame = 0;
    const canvas = canvasPreviewRef.current;
    const context = canvas?.getContext('2d');
    let time = Date.now();

    const update = () => {
      const now = Date.now();
      const shouldDraw =
        !(element instanceof HTMLVideoElement) || (now - time > FRAME_TIME && element.readyState === 4);

      if (canvas && context && shouldDraw) {
        time = now;
        context.reset();
        const { area } = useCropStore.getState();
        context.filter = 'brightness(0.25)';
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        const x = area[0] * ((size.width * scale) / canvas.width);
        const y = area[1] * ((size.height * scale) / canvas.height);
        const w = area[2] * ((size.width * scale) / canvas.width);
        const h = area[3] * ((size.height * scale) / canvas.height);
        context.filter = 'none';
        context.drawImage(element, x / scale, y / scale, w / scale, h / scale, x, y, w, h);
      }
      frame = requestAnimationFrame(update);
    };

    const width = targetDetails.width ?? 0;
    const ratio = width / area[2];
    const crop = targetDetails.crop;
    setArea([
      (crop?.x ?? 0) / ratio,
      (crop?.y ?? 0) / ratio,
      (crop?.width ?? width) / ratio,
      (crop?.height ?? targetDetails.height ?? 0) / ratio,
    ]);

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [element]);

  return (
    <div className='flex'>
      <div className='crop'>
        <canvas width={size.width * scale} height={size.height * scale} ref={canvasPreviewRef} />
        <div
          className='box'
          style={{
            left: `${(area[0] / (size.width * scale)) * 100}%`,
            top: `${(area[1] / (size.height * scale)) * 100}%`,
            width: `${(area[2] / (size.width * scale)) * 100}%`,
            height: `${(area[3] / (size.height * scale)) * 100}%`,
          }}
        >
          <svg
            viewBox='0 0 90 90'
            xmlns='http://www.w3.org/2000/svg'
            preserveAspectRatio='none'
            {...dragProps({ dirX: 0, dirY: 0, area })}
          >
            <line
              x1='30'
              y1='0'
              x2='30'
              y2='90'
              vectorEffect='non-scaling-stroke'
              style={{
                opacity: isDragging ? 0.5 : 0,
              }}
            />
            <line
              x1='60'
              y1='0'
              x2='60'
              y2='90'
              vectorEffect='non-scaling-stroke'
              style={{
                opacity: isDragging ? 0.5 : 0,
              }}
            />
            <line
              x1='0'
              y1='30'
              x2='90'
              y2='30'
              vectorEffect='non-scaling-stroke'
              style={{
                opacity: isDragging ? 0.5 : 0,
              }}
            />
          </svg>
          <div className='handles'>
            {HANDLE_DIRECTIONS.map(direction => (
              <div
                key={direction}
                className={`handle-${direction}`}
                style={{ cursor: `${direction}-resize` }}
                {...dragProps({
                  dirX: direction.includes('e') ? 1 : direction.includes('w') ? -1 : 0,
                  dirY: direction.includes('s') ? 1 : direction.includes('n') ? -1 : 0,
                  area,
                })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
