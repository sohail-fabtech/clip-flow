export interface TextMeasureStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  lineHeight: string;
  textShadow: string;
  webkitTextStroke: string;
  textTransform: string;
}

export function calculateTextHeight(style: TextMeasureStyle, text: string, width: string) {
  const div = document.createElement('div');
  Object.assign(div.style, style, {
    visibility: 'hidden',
    position: 'absolute',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    height: 'fit-content',
    minWidth: '1ch',
    width,
  });
  div.innerHTML = text || 'a';
  document.body.appendChild(div);
  const height = div.clientHeight;
  div.remove();
  return height;
}
