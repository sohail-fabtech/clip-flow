import type { ITrackItem, ITransition } from '@designcombo/types';

interface GroupInput {
  trackItemIds: string[];
  trackItemsMap: Record<string, ITrackItem>;
  transitionsMap: Record<string, ITransition>;
}

export const groupTrackItems = ({ trackItemIds, trackItemsMap, transitionsMap }: GroupInput) => {
  const transitions = Object.values(transitionsMap).filter(transition => transition.kind !== 'none');
  const processed = new Set<string>();
  const groups: (ITrackItem | ITransition)[][] = [];

  const buildGroup = (startId: string) => {
    const group: (ITrackItem | ITransition)[] = [];
    let currentId: string | undefined = startId;
    while (currentId && !processed.has(currentId)) {
      processed.add(currentId);
      group.push(trackItemsMap[currentId]);
      const transition = transitions.find(t => t.fromId === currentId);
      if (!transition) break;
      group.push(transition);
      currentId = transition.toId;
    }
    return group;
  };

  for (const id of trackItemIds) {
    if (processed.has(id) || transitions.some(t => t.toId === id)) continue;
    const group = buildGroup(id);
    if (group.length > 0) groups.push(group);
  }

  return groups;
};
