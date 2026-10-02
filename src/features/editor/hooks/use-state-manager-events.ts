import { useEffect } from 'react';
import type StateManager from '@designcombo/state';
import useStore from '@/features/editor/stores/use-store';

export const useStateManagerEvents = (stateManager: StateManager) => {
  const setState = useStore(state => state.setState);

  useEffect(() => {
    const syncItems = () => {
      const { duration, trackItemsMap, trackItemIds, tracks } = stateManager.getState();
      setState({ duration, trackItemsMap, trackItemIds, tracks });
    };

    const subscriptions = [
      stateManager.subscribeToUpdateStateDetails(setState),
      stateManager.subscribeToScale(setState),
      stateManager.subscribeToState(setState),
      stateManager.subscribeToDuration(setState),
      stateManager.subscribeToUpdateTrackItem(syncItems),
      stateManager.subscribeToAddOrRemoveItems(syncItems),
      stateManager.subscribeToUpdateItemDetails(syncItems),
    ];
    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [stateManager, setState]);
};
