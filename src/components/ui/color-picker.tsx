'use client';

import { ChromaPanel } from 'chroma-panel';

type ColorPickerProps = {
  value?: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value = '#ffffff', onChange }: ColorPickerProps) {
  return (
    <ChromaPanel
      theme="dark"
      value={value}
      format="hex"
      showAlpha
      showTitleBar={false}
      onChangeComplete={color => onChange(color.hexa)}
    />
  );
}
