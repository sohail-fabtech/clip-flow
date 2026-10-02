import { forwardRef, useImperativeHandle, useRef } from 'react';
import type StateManager from '@designcombo/state';
import useStore from '@/features/editor/stores/use-store';
import { Player } from '@/features/editor/player';
import SceneEmpty from '@/features/editor/scene/empty';
import Board from '@/features/editor/scene/board';
import useZoom from '@/features/editor/hooks/use-zoom';
import { SceneInteractions } from '@/features/editor/scene/interactions';

export interface SceneHandle {
  recalculateZoom: () => void;
}

const STAGE_BACKGROUND = '#18181b';

const Scene = forwardRef<SceneHandle, { stateManager: StateManager }>(({ stateManager }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { size, trackItemIds } = useStore();
  const { zoom, recalculateZoom } = useZoom(containerRef, size);

  useImperativeHandle(ref, () => ({ recalculateZoom }), [recalculateZoom]);

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full flex-1 items-center justify-center overflow-hidden'
      style={{ background: STAGE_BACKGROUND }}
    >
      {trackItemIds.length === 0 && <SceneEmpty />}
      <div
        style={{ width: size.width, height: size.height, transform: `scale(${zoom})` }}
        className='player-container absolute bg-black'
      >
        <div
          className='pointer-events-none absolute z-[100] bg-transparent'
          style={{ width: size.width, height: size.height, boxShadow: `0 0 0 5000px ${STAGE_BACKGROUND}` }}
        />
        <Board size={size}>
          <Player />
          <SceneInteractions stateManager={stateManager} containerRef={containerRef} zoom={zoom} />
        </Board>
      </div>
    </div>
  );
});

Scene.displayName = 'Scene';

export default Scene;
