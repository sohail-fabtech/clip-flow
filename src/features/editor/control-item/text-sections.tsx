import Outline from '@/features/editor/control-item/common/outline';
import Shadow from '@/features/editor/control-item/common/shadow';
import { TextControls } from '@/features/editor/control-item/common/text';
import { PresetText } from '@/features/editor/control-item/common/preset-text';
import type { Section } from '@/features/editor/control-item/media-sections';
import { useEditableTrackItem } from '@/features/editor/hooks/use-editable-track-item';
import useDataState from '@/features/editor/stores/use-data-state';
import { DEFAULT_FONT } from '@/features/editor/constants/font';
import { applyFont } from '@/features/editor/utils/fonts';
import type { TrackItem } from '@/features/editor/types';

export function useTextSections(source?: TrackItem | null): Section[] {
  const { trackItem, properties, updateDetails } = useEditableTrackItem(source);
  const { compactFonts, fonts } = useDataState();
  if (!trackItem || !properties) return [];

  const { details } = properties;
  const postScriptName = details.fontFamily || DEFAULT_FONT.postScriptName;
  const family = fonts.find(font => font.postScriptName === postScriptName)?.family;
  const selectedFont = compactFonts.find(font => font.family === family) ?? null;

  return [
    { key: 'textPreset', node: <PresetText trackItem={trackItem} /> },
    {
      key: 'textControls',
      node: (
        <TextControls
          details={details}
          selectedFont={selectedFont}
          onSelectFont={font => applyFont(trackItem.id, font)}
          updateDetails={updateDetails}
        />
      ),
    },
    {
      key: 'fontStroke',
      node: (
        <Outline
          label='Font stroke'
          valueBorderWidth={details.borderWidth}
          valueBorderColor={details.borderColor}
          onChangeBorderWidth={borderWidth => updateDetails({ borderWidth })}
          onChangeBorderColor={borderColor => updateDetails({ borderColor })}
        />
      ),
    },
    {
      key: 'fontShadow',
      node: <Shadow label='Font shadow' value={details.boxShadow} onChange={boxShadow => updateDetails({ boxShadow })} />,
    },
  ];
}
