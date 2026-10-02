import { useEffect, useRef, useState, type ComponentRef, type RefObject } from 'react';
import { Moveable, Selection } from '@interactify/toolkit';
import { dispatch } from '@designcombo/events';
import type StateManager from '@designcombo/state';
import { EDIT_OBJECT } from '@designcombo/state';
import useStore from '@/features/editor/stores/use-store';
import { getIdFromClassName } from '@/features/editor/utils/scene';
import { emptySelection, getSelectionByIds, getTargetById, isAudioElement } from '@/features/editor/utils/target';
import { currentTimeMs } from '@/features/editor/utils/time';
import type { MoveableRef } from '@/features/editor/types';

interface SceneInteractionsProps {
  stateManager: StateManager;
  containerRef: RefObject<HTMLDivElement | null>;
  zoom: number;
}

const SCALE_REGEX = /scale\(([^)]+)\)/;

const parseScale = (transform: string) => {
  const match = transform.match(SCALE_REGEX);
  return match ? match[1].split(',').map(value => Number.parseFloat(value.trim())) : null;
};

const sizeChildren = (target: HTMLElement, width: number, height: number, fontScale?: number) => {
  target.style.width = `${width}px`;
  target.style.height = `${height}px`;
  const animationDiv = target.firstElementChild?.firstElementChild as HTMLElement | null | undefined;
  if (!animationDiv) return;
  animationDiv.style.width = `${width}px`;
  animationDiv.style.height = `${height}px`;
  const textDiv = animationDiv.firstElementChild as HTMLElement | null;
  if (!textDiv) return;
  if (fontScale) textDiv.style.fontSize = `${Number.parseFloat(getComputedStyle(textDiv).fontSize) * fontScale}px`;
  textDiv.style.width = `${width}px`;
  textDiv.style.height = `${height}px`;
};

const editDetails = (id: string, details: Record<string, unknown>) =>
  dispatch(EDIT_OBJECT, { payload: { [id]: { details } } });

export function SceneInteractions({ stateManager, containerRef, zoom }: SceneInteractionsProps) {
  const [targets, setTargets] = useState<HTMLElement[]>([]);
  const [selection, setSelection] = useState<Selection>();
  const [selectionInfo, setSelectionInfo] = useState(emptySelection);
  const { activeIds, setState, trackItemsMap, playerRef, setSceneMoveableRef } = useStore();
  const moveableRef = useRef<ComponentRef<typeof Moveable>>(null);
  const targetsRef = useRef<HTMLElement[]>([]);
  const dragEndedRef = useRef(false);
  const groupPositionRef = useRef<Record<string, { left: number; top: number }> | null>(null);

  targetsRef.current = targets;

  useEffect(() => {
    const updateTargets = (time?: number) => {
      const { trackItemsMap: items, fps } = useStore.getState();
      const now = time ?? currentTimeMs(playerRef, fps);
      const visibleIds = activeIds.filter(id => items[id]?.display.from <= now && items[id]?.display.to >= now);
      selection?.setSelectedTargets(
        visibleIds.map(getTargetById).filter((target): target is HTMLElement => target !== null),
      );
      const info = getSelectionByIds(visibleIds);
      setSelectionInfo(info);
      setTargets(info.targets);
    };

    const timer = setTimeout(() => updateTargets());
    const player = playerRef?.current;
    const onSeeked = (event: { detail: { frame: number } }) =>
      setTimeout(() => updateTargets((event.detail.frame / useStore.getState().fps) * 1000));
    player?.addEventListener('seeked', onSeeked);
    return () => {
      player?.removeEventListener('seeked', onSeeked);
      clearTimeout(timer);
    };
  }, [activeIds, playerRef, trackItemsMap, selection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectElements = (selected: (HTMLElement | SVGElement)[]) => {
      const elements = selected.filter(el => !isAudioElement(el)) as HTMLElement[];
      setTargets(elements);
      stateManager.updateState(
        { activeIds: elements.map(el => getIdFromClassName(el.className)) },
        { updateHistory: false, kind: 'layer:selection' },
      );
    };

    const instance = new Selection({
      container,
      boundContainer: true,
      hitRate: 0,
      selectableTargets: ['.designcombo-scene-item'],
      selectFromInside: false,
      selectByClick: true,
      toggleContinueSelect: 'shift',
    })
      .on('select', event => selectElements(event.selected))
      .on('dragStart', event => {
        const target = event.inputEvent.target as HTMLElement;
        dragEndedRef.current = false;
        if (targetsRef.current.includes(target) || moveableRef.current?.moveable.isMoveableElement(target)) {
          event.stop();
        }
      })
      .on('dragEnd', () => {
        dragEndedRef.current = true;
      })
      .on('selectEnd', event => {
        if (!event.isDragStart) {
          selectElements(event.selected);
          return;
        }
        event.inputEvent.preventDefault();
        setTimeout(() => {
          if (!dragEndedRef.current) moveableRef.current?.moveable.dragStart(event.inputEvent);
        });
      });

    setSelection(instance);
    return () => instance.destroy();
  }, [containerRef, stateManager]);

  useEffect(() => {
    const subscription = stateManager.subscribeToActiveIds(setState);
    return () => subscription.unsubscribe();
  }, [stateManager, setState]);

  useEffect(() => {
    moveableRef.current?.moveable.updateRect();
  }, [trackItemsMap]);

  useEffect(() => {
    setSceneMoveableRef(moveableRef as unknown as MoveableRef);
  }, [setSceneMoveableRef]);

  return (
    <Moveable
      ref={moveableRef}
      rotationPosition='bottom'
      renderDirections={selectionInfo.controls}
      {...selectionInfo.ables}
      origin={false}
      target={targets}
      zoom={1 / zoom}
      className='designcombo-scene-moveable'
      onDrag={({ target, top, left }) => {
        target.style.top = `${top}px`;
        target.style.left = `${left}px`;
      }}
      onDragEnd={({ target, isDrag }) => {
        if (!isDrag) return;
        const element = target as HTMLElement;
        editDetails(getIdFromClassName(element.className), { left: element.style.left, top: element.style.top });
      }}
      onScale={({ target, transform, direction }) => {
        const current = parseScale(target.style.transform);
        const next = parseScale(transform);
        if (!current || !next) return;
        const element = target as HTMLElement;
        const diffX = element.clientWidth * (current[0] - next[0]);
        const diffY = element.clientHeight * (current[1] - next[1]);
        target.style.transform = transform;
        const left = Number.parseFloat(target.style.left) - diffX / 2 + (direction[0] === -1 ? diffX : 0);
        const top = Number.parseFloat(target.style.top) - diffY / 2 + (direction[1] === -1 ? diffY : 0);
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
      }}
      onScaleEnd={({ target }) => {
        if (!target.style.transform) return;
        editDetails(getIdFromClassName(target.className as string), {
          transform: target.style.transform,
          left: Number.parseFloat(target.style.left),
          top: Number.parseFloat(target.style.top),
        });
      }}
      onRotate={({ target, transform }) => {
        target.style.transform = transform;
      }}
      onRotateEnd={({ target }) => {
        if (!target.style.transform) return;
        editDetails(getIdFromClassName(target.className as string), { transform: target.style.transform });
      }}
      onDragGroup={({ events }) => {
        const positions: Record<string, { left: number; top: number }> = {};
        for (const event of events) {
          const id = getIdFromClassName(event.target.className as string);
          const details = trackItemsMap[id]?.details;
          const left = Number.parseFloat(details?.left) + event.beforeTranslate[0];
          const top = Number.parseFloat(details?.top) + event.beforeTranslate[1];
          event.target.style.left = `${left}px`;
          event.target.style.top = `${top}px`;
          positions[id] = { left, top };
        }
        groupPositionRef.current = positions;
      }}
      onDragGroupEnd={() => {
        const positions = groupPositionRef.current;
        if (!positions) return;
        dispatch(EDIT_OBJECT, {
          payload: Object.fromEntries(
            Object.entries(positions).map(([id, { left, top }]) => [
              id,
              { details: { top: `${top}px`, left: `${left}px` } },
            ]),
          ),
        });
        groupPositionRef.current = null;
      }}
      onResize={({ target, width, height, direction }) => {
        const element = target as HTMLElement;
        if (direction[1] === 1) {
          const scale = height / element.clientHeight;
          sizeChildren(element, element.clientWidth * scale, element.clientHeight * scale, scale);
        } else {
          sizeChildren(element, width, height);
        }
      }}
      onResizeEnd={({ target }) => {
        const element = target as HTMLElement;
        const textDiv = element.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement | null;
        editDetails(getIdFromClassName(element.className), {
          width: Number.parseFloat(element.style.width),
          height: Number.parseFloat(element.style.height),
          ...(textDiv?.style.fontSize && { fontSize: Number.parseFloat(textDiv.style.fontSize) }),
        });
      }}
    />
  );
}
