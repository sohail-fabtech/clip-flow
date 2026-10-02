import React, { useState, useEffect, useCallback, useRef } from 'react';

export function usePointerDrag(options) {
  const [dragState, setDragState] = useState(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const infoRef = useRef({
    x: 0,
    y: 0,
    startedAt: 0,
    dragging: false,
    initialEvent: undefined,
  });
  const optionsRef = useRef(options);
  const dragStateRef = useRef(dragState);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    if (!isStarted) {
      return;
    }

    const {
      stopPropagation = true,
      preventDefault = true,
      onClick,
      onStart,
      onMove,
      onEnd,
      dragPredicate,
    } = optionsRef.current;

    const getData = e => {
      const { x: startX, y: startY, startedAt, initialEvent } = infoRef.current;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      return {
        x: e.clientX,
        y: e.clientY,
        state: dragStateRef.current,
        setState: setDragState,
        deltaX,
        deltaY,
        startX,
        startY,
        startedAt,
        initialEvent,
        distance: Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)),
        event: e,
      };
    };

    const handleEvent = e => {
      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();
    };

    const handleMove = e => {
      const data = getData(e);

      if (!infoRef.current.dragging) {
        if (!dragPredicate || dragPredicate(data)) {
          handleEvent(e);
          infoRef.current.dragging = true;
          if (onStart) onStart(data);
        }
      } else {
        handleEvent(e);
        if (onMove) onMove(data);
      }
    };

    const handleUp = e => {
      const data = getData(e);
      if (infoRef.current.dragging) {
        handleEvent(e);
        if (onEnd) onEnd(data);
      } else {
        if (onClick) onClick(data);
      }

      infoRef.current.dragging = false;
      setDragState(undefined);
      setIsDragging(false);
      setIsStarted(false);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);

    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, [isStarted]);

  const startDragging = useCallback(
    state => {
      setDragState(state);
      setIsStarted(true);
      setIsDragging(true);
      infoRef.current.dragging = true;
    },
    [setDragState, setIsStarted, setIsDragging],
  );

  const dragProps = useCallback(
    state => {
      return {
        onPointerDown: e => {
          setDragState(state);
          setIsStarted(true);
          setIsDragging(true);
          const now = Date.now();
          infoRef.current = {
            x: e.clientX,
            y: e.clientY,
            startedAt: now,
            dragging: false,
            initialEvent: e.nativeEvent,
          };

          if (optionsRef.current.pointerDownPreventDefault) {
            e.preventDefault();
          }

          if (optionsRef.current.pointerDownStopPropagation) {
            e.stopPropagation();
          }

          const onBeforeStart = optionsRef.current.onBeforeStart;
          if (onBeforeStart) {
            onBeforeStart({
              x: e.clientX,
              y: e.clientY,
              state: state,
              setState: setDragState,
              deltaX: 0,
              deltaY: 0,
              startX: e.clientX,
              startY: e.clientY,
              startedAt: now,
              initialEvent: e.nativeEvent,
              distance: 0,
              event: e.nativeEvent,
            });
          }
        },
      };
    },
    [setDragState, setIsStarted],
  );

  return {
    startDragging,
    dragState,
    isDragging,
    dragProps,
  };
}
