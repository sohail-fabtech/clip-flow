import { AlignCenter, AlignLeft, AlignRight, Bold, CaseUpper, Italic, Underline } from 'lucide-react';
import type { Clip, TextClip, TextStyle } from '@/features/editor/model/types';
import { TEXT_ANIMATIONS } from '@/features/editor/model/types';
import { FONT_FAMILIES, fontByPostScript } from '@/features/editor/model/fonts';
import { loadFont } from '@/features/editor/render/text-layer';
import { Group, IconButton, Row, SelectRow } from '@/features/editor/ui/common';
import { editClips } from '@/features/editor/ui/inspector/edit';
import { AnimRow, ColorRow, NumberRow, SliderRow, SubLabel, ToggleRow } from '@/features/editor/ui/inspector/fields';
import { cn } from '@/lib/utils';

const ANIMATION_LABELS: Record<(typeof TEXT_ANIMATIONS)[number], string> = {
  none: 'Off',
  popIn: 'Pop In',
  slideUp: 'Slide Up',
  typewriter: 'Typewriter',
  wordReveal: 'Word Reveal',
  wordSlide: 'Word Slide',
  highlight: 'Highlight',
  highlightBlock: 'Highlight Block',
};

const textClips = (clips: Clip[]) => clips.filter((c): c is TextClip => c.kind === 'text');

function useTextEdit(clips: TextClip[]) {
  const ids = clips.map(c => c.id);
  return (name: string, recipe: (text: TextClip['text']) => void, phase: 'live' | 'commit' = 'commit') =>
    editClips(ids, name, clip => clip.kind === 'text' && recipe(clip.text), phase);
}

export function TextTab({ clips }: { clips: Clip[] }) {
  const texts = textClips(clips);
  const set = useTextEdit(texts);
  if (!texts.length) return null;
  const { content, style, caption } = texts[0].text;
  const font = fontByPostScript(style.fontFamily);
  const family = FONT_FAMILIES.find(f => f.family === font?.family);
  const setStyle = <K extends keyof TextStyle>(key: K, value: TextStyle[K], phase: 'live' | 'commit' = 'commit') =>
    set(`Text ${key}`, text => void (text.style[key] = value), phase);

  const chooseFont = (postScriptName: string) => {
    const next = fontByPostScript(postScriptName);
    if (!next) return;
    loadFont(next.postScriptName, next.url);
    set('Font', text => {
      text.style.fontFamily = next.postScriptName;
      text.style.fontUrl = next.url;
    });
  };

  return (
    <>
      <Group title='Content'>
        <textarea
          aria-label='Text content'
          value={content}
          rows={3}
          onChange={e => set('Edit text', text => void (text.content = e.target.value), 'live')}
          onBlur={e => set('Edit text', text => void (text.content = e.target.value))}
          onKeyDown={e => e.stopPropagation()}
          className='w-full resize-y rounded-md border border-line bg-base px-2 py-1.5 text-xs text-ink outline-none focus:border-selection/60'
        />
        <ToggleRow
          label='Caption'
          checked={caption}
          onChange={on => set('Caption', text => void (text.caption = on))}
        />
      </Group>

      <Group title='Text'>
        <Row label='Font'>
          <SelectRow
            label='Font family'
            value={family?.family ?? ''}
            options={FONT_FAMILIES.map(f => ({ value: f.family, label: f.family }))}
            onChange={name => {
              const target = FONT_FAMILIES.find(f => f.family === name)!;
              chooseFont((target.styles.find(s => s.style === 'Regular') ?? target.styles[0]).postScriptName);
            }}
          />
        </Row>
        <Row label='Style'>
          <SelectRow
            label='Font style'
            value={style.fontFamily}
            options={(family?.styles ?? []).map(s => ({ value: s.postScriptName, label: s.style }))}
            onChange={chooseFont}
          />
        </Row>
        <NumberRow
          label='Size'
          value={style.fontSize}
          min={4}
          max={1000}
          unit='px'
          onChange={(v, p) => setStyle('fontSize', v, p)}
        />
        <Row label='Format'>
          <IconButton
            label='Bold'
            active={style.fontWeight >= 700}
            onClick={() => setStyle('fontWeight', style.fontWeight >= 700 ? 400 : 700)}
          >
            <Bold />
          </IconButton>
          <IconButton label='Italic' active={style.italic} onClick={() => setStyle('italic', !style.italic)}>
            <Italic />
          </IconButton>
          <IconButton
            label='Underline'
            active={style.underline}
            onClick={() => setStyle('underline', !style.underline)}
          >
            <Underline />
          </IconButton>
          <IconButton
            label='Uppercase'
            active={style.uppercase}
            onClick={() => setStyle('uppercase', !style.uppercase)}
          >
            <CaseUpper />
          </IconButton>
        </Row>
        <Row label='Align'>
          {(
            [
              ['left', AlignLeft],
              ['center', AlignCenter],
              ['right', AlignRight],
            ] as const
          ).map(([align, Icon]) => (
            <IconButton
              key={align}
              label={`Align ${align}`}
              active={style.align === align}
              onClick={() => setStyle('align', align)}
            >
              <Icon />
            </IconButton>
          ))}
        </Row>
        <NumberRow
          label='Line height'
          value={style.lineHeight}
          min={0.5}
          max={4}
          step={0.05}
          precision={2}
          onChange={(v, p) => setStyle('lineHeight', v, p)}
        />
        <NumberRow
          label='Letter spacing'
          value={style.letterSpacing}
          min={-50}
          max={200}
          step={0.5}
          precision={1}
          unit='px'
          onChange={(v, p) => setStyle('letterSpacing', v, p)}
        />
        <SliderRow
          label='Box width'
          min={0.1}
          max={1}
          value={style.maxWidth}
          unit='%'
          reset={0.9}
          onChange={(v, p) => setStyle('maxWidth', v, p)}
        />
        <NumberRow
          label='Tilt'
          value={style.tilt}
          min={-80}
          max={80}
          unit='°'
          onChange={(v, p) => setStyle('tilt', v, p)}
        />
      </Group>

      <Group title='Fill & Stroke'>
        <ColorRow label='Fill' value={style.color} onChange={v => setStyle('color', v)} />
        <ColorRow label='Stroke' value={style.strokeColor} onChange={v => setStyle('strokeColor', v)} />
        <NumberRow
          label='Stroke width'
          value={style.strokeWidth}
          min={0}
          max={60}
          step={0.5}
          precision={1}
          unit='px'
          onChange={(v, p) => setStyle('strokeWidth', v, p)}
        />
        <SubLabel>Background</SubLabel>
        <ColorRow label='Color' value={style.backgroundColor} onChange={v => setStyle('backgroundColor', v)} />
        <NumberRow
          label='Padding'
          value={style.backgroundPadding}
          min={0}
          max={200}
          unit='px'
          onChange={(v, p) => setStyle('backgroundPadding', v, p)}
        />
        <NumberRow
          label='Radius'
          value={style.backgroundRadius}
          min={0}
          max={200}
          unit='px'
          onChange={(v, p) => setStyle('backgroundRadius', v, p)}
        />
        <SubLabel>Shadow</SubLabel>
        <ColorRow label='Color' value={style.shadowColor} onChange={v => setStyle('shadowColor', v)} />
        <NumberRow
          label='Offset X'
          value={style.shadowX}
          min={-200}
          max={200}
          unit='px'
          onChange={(v, p) => setStyle('shadowX', v, p)}
        />
        <NumberRow
          label='Offset Y'
          value={style.shadowY}
          min={-200}
          max={200}
          unit='px'
          onChange={(v, p) => setStyle('shadowY', v, p)}
        />
        <NumberRow
          label='Blur'
          value={style.shadowBlur}
          min={0}
          max={200}
          unit='px'
          onChange={(v, p) => setStyle('shadowBlur', v, p)}
        />
      </Group>

      <Group title='Layout'>
        <AnimRow label='Position X' prop='x' clips={texts} unit='px' />
        <AnimRow label='Position Y' prop='y' clips={texts} unit='px' />
        <AnimRow label='Rotation' prop='rotation' clips={texts} precision={1} step={0.5} unit='°' />
        <AnimRow
          label='Opacity'
          prop='opacity'
          clips={texts}
          toDisplay={v => v * 100}
          fromDisplay={v => v / 100}
          min={0}
          max={100}
          unit='%'
        />
      </Group>
    </>
  );
}

export function AnimateTab({ clips }: { clips: Clip[] }) {
  const texts = textClips(clips);
  const set = useTextEdit(texts);
  if (!texts.length) return null;
  const { animation, highlightColor } = texts[0].text;
  return (
    <Group title='Animation'>
      <div className='grid grid-cols-2 gap-1.5'>
        {TEXT_ANIMATIONS.map(preset => (
          <button
            key={preset}
            type='button'
            onClick={() => set('Text animation', text => void (text.animation = preset))}
            className={cn(
              'h-14 rounded-md border border-line bg-base text-[11px] text-ink-3 hover:border-line-strong hover:text-ink',
              animation === preset && 'border-selection bg-selection/10 text-ink',
            )}
          >
            {ANIMATION_LABELS[preset]}
          </button>
        ))}
      </div>
      {(animation === 'highlight' || animation === 'highlightBlock') && (
        <ColorRow
          label='Highlight'
          value={highlightColor}
          onChange={v => set('Highlight color', text => void (text.highlightColor = v))}
        />
      )}
    </Group>
  );
}
