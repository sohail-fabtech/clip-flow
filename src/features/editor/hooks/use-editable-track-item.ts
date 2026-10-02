import { useEffect, useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import type { ItemDetails, TrackItem } from '@/features/editor/types';

export function useEditableTrackItem(source?: TrackItem | null) {
  const selected = useLayoutStore(state => state.trackItem);
  const trackItem = source ?? selected;
  const [properties, setProperties] = useState(trackItem);

  useEffect(() => {
    setProperties(trackItem);
  }, [trackItem]);

  const update = (fields: Partial<Omit<TrackItem, 'details'>>, details: Partial<ItemDetails> = {}) => {
    if (!trackItem) return;
    dispatch(EDIT_OBJECT, { payload: { [trackItem.id]: { ...fields, details } } });
    setProperties(prev => prev && { ...prev, ...fields, details: { ...prev.details, ...details } });
  };

  const updateDetails = (details: Partial<ItemDetails>) => update({}, details);

  return { trackItem, properties, update, updateDetails };
}
