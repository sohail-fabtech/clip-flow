import { generateId } from '@designcombo/timeline';
import { DEFAULT_FONT } from '@/features/editor/constants/font';

export const TEXT_ADD_PAYLOAD = {
  id: generateId(),
  display: {
    from: 0,
    to: 5000,
  },
  type: 'text',
  details: {
    text: 'Heading text',
    fontSize: 120,
    width: 600,
    fontUrl: DEFAULT_FONT.url,
    fontFamily: DEFAULT_FONT.postScriptName,
    color: '#ffffff',
    wordWrap: 'break-word',
    textAlign: 'center',
    borderWidth: 0,
    borderColor: '#000000',
    boxShadow: {
      color: '#ffffff',
      x: 0,
      y: 0,
      blur: 0,
    },
  },
};

export const TEXT_BODY_ADD_PAYLOAD = {
  id: generateId(),
  display: {
    from: 0,
    to: 5000,
  },
  type: 'text',
  details: {
    text: 'Body text',
    fontSize: 48,
    width: 800,
    fontUrl: DEFAULT_FONT.url,
    fontFamily: DEFAULT_FONT.postScriptName,
    color: '#ffffff',
    wordWrap: 'break-word',
    textAlign: 'left',
    borderWidth: 0,
    borderColor: '#000000',
    boxShadow: {
      color: '#ffffff',
      x: 0,
      y: 0,
      blur: 0,
    },
  },
};
