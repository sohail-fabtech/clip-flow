import {
  Bookmark,
  BracketsIcon,
  Link2,
  Magnet,
  MousePointer2,
  MoveHorizontal,
  Redo2,
  Scissors,
  SquareSplitHorizontal,
  Undo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import * as actions from '@/features/editor/actions';
import { projectDuration } from '@/features/editor/engine/edits';
import { useProjectStore } from '@/features/editor/store/project-store';
import { MAX_ZOOM, MIN_ZOOM, useUiStore } from '@/features/editor/store/ui-store';
import { IconButton, mod } from '@/features/editor/ui/common';

const toSlider = (zoom: number) => Math.log(zoom / MIN_ZOOM) / Math.log(MAX_ZOOM / MIN_ZOOM);
const fromSlider = (value: number) => MIN_ZOOM * (MAX_ZOOM / MIN_ZOOM) ** value;

export function fitZoom(viewWidth: number) {
  const duration = projectDuration(useProjectStore.getState().project);
  if (!duration) return;
  useUiStore.getState().setZoom((viewWidth - 80) / duration);
}

export function TimelineToolbar({ viewWidth }: { viewWidth: number }) {
  const canUndo = useProjectStore(s => s.past.length > 0);
  const canRedo = useProjectStore(s => s.future.length > 0);
  const { tool, setTool, snapping, toggleSnapping, linkedSelection, toggleLinkedSelection, zoom, setZoom } =
    useUiStore();

  return (
    <div className='flex h-9 shrink-0 items-center gap-0.5 border-b border-line bg-surface px-2'>
      <IconButton label='Undo' shortcut={mod('Z')} onClick={actions.undo} disabled={!canUndo}>
        <Undo2 />
      </IconButton>
      <IconButton label='Redo' shortcut={mod('⇧Z')} onClick={actions.redo} disabled={!canRedo}>
        <Redo2 />
      </IconButton>
      <div className='mx-1.5 h-4 w-px bg-line' />
      <IconButton label='Selection tool' shortcut='V' active={tool === 'select'} onClick={() => setTool('select')}>
        <MousePointer2 />
      </IconButton>
      <IconButton label='Razor tool' shortcut='C' active={tool === 'razor'} onClick={() => setTool('razor')}>
        <Scissors />
      </IconButton>
      <IconButton label='Slip tool' shortcut='T' active={tool === 'trim'} onClick={() => setTool('trim')}>
        <MoveHorizontal />
      </IconButton>
      <div className='mx-1.5 h-4 w-px bg-line' />
      <IconButton label='Split at playhead' shortcut={mod('K')} onClick={actions.split}>
        <SquareSplitHorizontal />
      </IconButton>
      <IconButton label='Trim start to playhead' shortcut='Q' onClick={() => actions.trimToPlayhead('start')}>
        <span className='font-mono text-sm leading-none'>[</span>
      </IconButton>
      <IconButton label='Trim end to playhead' shortcut='W' onClick={() => actions.trimToPlayhead('end')}>
        <span className='font-mono text-sm leading-none'>]</span>
      </IconButton>
      <div className='mx-1.5 h-4 w-px bg-line' />
      <IconButton label='Snapping' shortcut='S' active={snapping} onClick={toggleSnapping}>
        <Magnet />
      </IconButton>
      <IconButton label='Linked selection' shortcut='L' active={linkedSelection} onClick={toggleLinkedSelection}>
        <Link2 />
      </IconButton>
      <IconButton label='Add marker' shortcut='M' onClick={actions.addMarker}>
        <Bookmark />
      </IconButton>
      <IconButton label='Clear in/out' shortcut='⌥X' onClick={actions.clearInOut}>
        <BracketsIcon />
      </IconButton>

      <div className='ml-auto flex items-center gap-1'>
        <IconButton label='Zoom out' shortcut='-' onClick={() => setZoom(zoom / 1.5)}>
          <ZoomOut />
        </IconButton>
        <Slider
          className='w-28'
          min={0}
          max={1}
          step={0.001}
          value={[toSlider(zoom)]}
          onValueChange={([value]) => setZoom(fromSlider(value))}
          aria-label='Timeline zoom'
        />
        <IconButton label='Zoom in' shortcut='=' onClick={() => setZoom(zoom * 1.5)}>
          <ZoomIn />
        </IconButton>
        <IconButton label='Zoom to fit' shortcut='⇧Z' onClick={() => fitZoom(viewWidth)}>
          <Maximize2 />
        </IconButton>
      </div>
    </div>
  );
}
