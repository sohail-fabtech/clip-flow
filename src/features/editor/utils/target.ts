type Direction = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

interface Ables {
  rotatable: boolean;
  resizable: boolean;
  scalable: boolean;
  keepRatio: boolean;
  draggable: boolean;
  snappable: boolean;
}

interface SelectionInfo {
  targets: HTMLElement[];
  layerType: string | null;
  ables: Ables;
  controls: Direction[];
}

const CORNERS: Direction[] = ['nw', 'ne', 'sw', 'se'];
const SCALE_ONLY: Ables = {
  rotatable: true,
  resizable: false,
  scalable: true,
  keepRatio: true,
  draggable: true,
  snappable: true,
};

const getTargetControls = (type: string | null): Direction[] => {
  if (type === 'text') return ['e', 'se'];
  if (type === 'svg') return ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
  return CORNERS;
};

const getTargetAbles = (type: string | null): Ables => {
  if (type === 'text') return { ...SCALE_ONLY, resizable: true, scalable: false, keepRatio: false };
  if (type === 'group') return { ...SCALE_ONLY, rotatable: false };
  return SCALE_ONLY;
};

export const getTypeFromClassName = (input: string) => input.match(/designcombo-scene-item-type-([^ ]+)/)?.[1] ?? null;

export const isAudioElement = (element: Element) => getTypeFromClassName(element.className) === 'audio';

export const emptySelection: SelectionInfo = {
  targets: [],
  layerType: null,
  ables: { ...SCALE_ONLY, rotatable: false, scalable: false, keepRatio: false },
  controls: [],
};

export const getTargetById = (id: string) => document.querySelector<HTMLElement>(`.designcombo-scene-item.id-${id}`);

export const getSelectionByIds = (ids: string[]): SelectionInfo => {
  const targets = ids
    .map(getTargetById)
    .filter((target): target is HTMLElement => target !== null && !isAudioElement(target));

  if (targets.length === 0) return emptySelection;
  if (targets.length > 1) return { targets, layerType: 'group', ables: getTargetAbles('group'), controls: [] };

  const layerType = getTypeFromClassName(targets[0].className);
  return { targets, layerType, ables: getTargetAbles(layerType), controls: getTargetControls(layerType) };
};
