import { useEffect, useState } from 'react';
import { useCurrentFrame } from 'remotion';
import { dispatch, filter, subject } from '@designcombo/events';
import { EDIT_OBJECT, EDIT_TEMPLATE_ITEM, ENTER_EDIT_MODE } from '@designcombo/state';
import type { ITrackItem } from '@designcombo/types';
import { SequenceItem } from '@/features/editor/player/sequence-item';
import { groupTrackItems } from '@/features/editor/utils/track-items';
import { calculateTextHeight } from '@/features/editor/utils/text';
import useStore from '@/features/editor/stores/use-store';

const measureTextElement = (id: string) => {
  const element = document.querySelector<HTMLElement>(`.id-${id}`);
  const textDiv = element?.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement | null | undefined;
  if (!element || !textDiv || !element.innerText) return null;
  const { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textShadow, webkitTextStroke, textTransform } =
    textDiv.style;
  const height = calculateTextHeight(
    { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textShadow, webkitTextStroke, textTransform },
    element.innerText,
    element.style.width,
  );
  return { element, height };
};

const Composition = () => {
  const [editableTextId, setEditableTextId] = useState<string | null>(null);
  const { trackItemIds, trackItemsMap, fps, sceneMoveableRef, size, transitionsMap } = useStore();
  const frame = useCurrentFrame();

  const handleTextChange = (id: string) => {
    const measured = measureTextElement(id);
    if (!measured) return;
    measured.element.style.height = `${measured.height}px`;
    sceneMoveableRef?.current?.moveable.updateRect();
    sceneMoveableRef?.current?.moveable.forceUpdate();
  };

  const onTextBlur = (id: string) => {
    const measured = measureTextElement(id);
    if (!measured) return;
    dispatch(EDIT_OBJECT, { payload: { [id]: { details: { height: measured.height } } } });
  };

  useEffect(() => {
    const subscription = subject
      .pipe(filter(({ key }) => key === ENTER_EDIT_MODE))
      .subscribe(event => {
        if (editableTextId) {
          const element = document.querySelector(`[data-text-id="${editableTextId}"]`);
          if (trackItemIds.includes(editableTextId)) {
            dispatch(EDIT_OBJECT, {
              payload: { [editableTextId]: { details: { text: element?.innerHTML ?? '' } } },
            });
          } else {
            dispatch(EDIT_TEMPLATE_ITEM, {
              payload: { [editableTextId]: { details: { text: element?.textContent ?? '' } } },
            });
          }
        }
        setEditableTextId(event.value?.payload?.id ?? null);
      });
    return () => subscription.unsubscribe();
  }, [editableTextId, trackItemIds]);

  const items = groupTrackItems({ trackItemIds, transitionsMap, trackItemsMap })
    .flat()
    .filter((entry): entry is ITrackItem => 'display' in entry);

  return (
    <>
      {items.map(item => {
        const Item = SequenceItem[item.type];
        if (!Item) return null;
        return (
          <Item
            key={item.id}
            item={item}
            options={{ fps, frame, size, editableTextId, isTransition: false, handleTextChange, onTextBlur }}
          />
        );
      })}
    </>
  );
};

export default Composition;
