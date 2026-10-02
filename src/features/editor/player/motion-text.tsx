import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';

interface TextLayerProps {
  id: string;
  content: string;
  editable: boolean;
  style?: CSSProperties;
  onChange?: (id: string, text: string) => void;
  onBlur?: (id: string, text: string) => void;
}

const selectContents = (element: HTMLElement, collapseToEnd: boolean) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  if (collapseToEnd) range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const TextLayer = ({ id, content, editable, style = {}, onChange, onBlur }: TextLayerProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editable && divRef.current) {
      divRef.current.focus();
      selectContents(divRef.current, false);
    } else {
      window.getSelection()?.removeAllRanges();
    }
  }, [editable]);

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    const element = divRef.current;
    const selection = window.getSelection();
    if (!element || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.endOffset - range.startOffset === element.textContent?.length) selectContents(element, true);
  };

  return (
    <div
      data-text-id={id}
      ref={divRef}
      contentEditable={editable}
      onClick={handleClick}
      onInput={event => onChange?.(id, event.currentTarget.innerText)}
      onBlur={event => onBlur?.(id, event.currentTarget.innerText)}
      style={{
        height: '100%',
        boxShadow: 'none',
        outline: 'none',
        ...style,
        pointerEvents: editable ? 'auto' : 'none',
        whiteSpace: 'normal',
        width: '100%',
      }}
      suppressContentEditableWarning
      className='designcombo_textLayer'
    >
      {content}
    </div>
  );
};

export default TextLayer;
