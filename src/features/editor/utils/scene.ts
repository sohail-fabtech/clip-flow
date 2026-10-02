export const getIdFromClassName = (input: string) => input.match(/designcombo-scene-item id-([^ ]+)/)?.[1] ?? '';
