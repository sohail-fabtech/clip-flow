import * as actions from '@/features/editor/actions';
import { togglePlay, seek } from '@/features/editor/store/playback-store';
import { useUiStore } from '@/features/editor/store/ui-store';
import { getProject } from '@/features/editor/store/project-store';
import { projectDuration } from '@/features/editor/engine/edits';
import { captureStill } from '@/features/editor/ui/dialogs/export-dialog';
import { openImport } from '@/features/editor/ui/media/media-tab';
import { saveProject } from '@/features/editor/store/persistence';
import { toast } from '@/features/editor/ui/toasts';

type Matcher = (e: KeyboardEvent, mod: boolean) => boolean;

const is = (e: KeyboardEvent, ...keys: string[]) => keys.includes(e.key.toLowerCase()) || keys.includes(e.code);
const plain = (...keys: string[]): Matcher => (e, mod) => is(e, ...keys) && !mod && !e.shiftKey && !e.altKey;
const shifted = (k: string): Matcher => (e, mod) => is(e, k) && !mod && e.shiftKey && !e.altKey;
const withMod = (k: string, shift = false): Matcher => (e, mod) => is(e, k) && mod && e.shiftKey === shift && !e.altKey;
const ui = () => useUiStore.getState();
const fps = () => getProject().settings.fps;

export const BINDINGS: [Matcher, (e: KeyboardEvent) => void][] = [
  [(e, m) => is(e, 'Space') && !m && !e.shiftKey, togglePlay],
  [(e, m) => is(e, 'arrowleft') && !m && e.altKey, e => actions.nudge(e.shiftKey ? -10 : -1)],
  [(e, m) => is(e, 'arrowright') && !m && e.altKey, e => actions.nudge(e.shiftKey ? 10 : 1)],
  [(e, m) => is(e, 'arrowleft') && !m && !e.altKey, e => actions.stepFrames(e.shiftKey ? -fps() : -1)],
  [(e, m) => is(e, 'arrowright') && !m && !e.altKey, e => actions.stepFrames(e.shiftKey ? fps() : 1)],
  [plain('arrowup'), () => actions.goToEdit(-1)],
  [plain('arrowdown'), () => actions.goToEdit(1)],
  [plain('home'), () => seek(0)],
  [plain('end'), () => seek(projectDuration(getProject()))],
  [plain('v'), () => ui().setTool('select')],
  [plain('c'), () => ui().setTool('razor')],
  [plain('t'), () => ui().setTool('trim')],
  [plain('a'), () => actions.selectForwardFrom(false)],
  [shifted('a'), () => actions.selectForwardFrom(true)],
  [withMod('k'), actions.split],
  [plain('q', '['), () => actions.trimToPlayhead('start')],
  [plain('w', ']'), () => actions.trimToPlayhead('end')],
  [(e, m) => is(e, 'backspace', 'delete') && !m && !e.shiftKey, () => actions.remove(false)],
  [(e, m) => is(e, 'backspace', 'delete') && !m && e.shiftKey, () => actions.remove(true)],
  [withMod('l'), actions.toggleLink],
  [plain('i'), actions.markIn],
  [plain('o'), actions.markOut],
  [(e, m) => is(e, 'x', 'KeyX') && !m && e.altKey, actions.clearInOut],
  [plain('m'), actions.addMarker],
  [shifted('m'), () => actions.stepMarker(1)],
  [withMod('m', true), () => actions.stepMarker(-1)],
  [plain('s'), () => ui().toggleSnapping()],
  [plain('l'), () => ui().toggleLinkedSelection()],
  [(e, m) => (e.key === '=' || e.key === '+') && !m, () => ui().setZoom(ui().zoom * 1.5)],
  [(e, m) => e.key === '-' && !m, () => ui().setZoom(ui().zoom / 1.5)],
  [withMod('s'), () => saveProject(getProject()).then(() => toast('Project saved'))],
  [withMod('i'), () => {
    ui().setLeftTab('media');
    setTimeout(openImport, 0);
  }],
  [withMod('e'), () => ui().setExportOpen(true)],
  [withMod('e', true), captureStill],
  [withMod('z'), actions.undo],
  [(e, m) => withMod('z', true)(e, m) || withMod('y')(e, m), actions.redo],
  [withMod('x'), actions.cut],
  [withMod('c'), actions.copy],
  [withMod('v'), actions.paste],
  [withMod('d'), actions.duplicate],
  [withMod('a'), actions.selectAll],
  [e => is(e, 'escape'), () => {
    ui().select([]);
    ui().setTool('select');
  }],
  [e => e.key === '?', () => ui().setShortcutsOpen(true)],
];

export const SHORTCUT_DOCS: { group: string; items: [string, string][] }[] = [
  {
    group: 'Playback',
    items: [
      ['Space', 'Play / Pause'],
      ['← / →', 'Step one frame'],
      ['⇧← / ⇧→', 'Step one second'],
      ['↑ / ↓', 'Previous / next edit point'],
      ['Home / End', 'Go to start / end'],
    ],
  },
  {
    group: 'Tools',
    items: [
      ['V', 'Selection tool'],
      ['C', 'Razor tool'],
      ['T', 'Slip tool'],
    ],
  },
  {
    group: 'Editing',
    items: [
      ['A', 'Select forward on track'],
      ['⇧A', 'Select forward on all tracks'],
      ['Mod+K', 'Split at playhead'],
      ['Q or [', 'Trim start to playhead'],
      ['W or ]', 'Trim end to playhead'],
      ['⌫', 'Delete'],
      ['⇧⌫', 'Ripple delete'],
      ['⇧ Drag edge', 'Ripple trim'],
      ['Mod Drag media', 'Ripple insert'],
      ['⌥ Drag', 'Duplicate clip'],
      ['⌥← / ⌥→', 'Nudge selection (⇧ for 10 frames)'],
      ['Mod+L', 'Link / unlink'],
    ],
  },
  {
    group: 'Timeline',
    items: [
      ['I / O', 'Mark in / out'],
      ['⌥X', 'Clear in / out'],
      ['⇧ Drag ruler', 'Select range'],
      ['M', 'Add marker'],
      ['⇧M / Mod+⇧M', 'Next / previous marker'],
      ['S', 'Toggle snapping'],
      ['L', 'Toggle linked selection'],
      ['= / -', 'Zoom in / out'],
      ['⌥ or Mod Scroll', 'Zoom to cursor'],
    ],
  },
  {
    group: 'File',
    items: [
      ['Mod+S', 'Save'],
      ['Mod+I', 'Import media'],
      ['Mod+E', 'Export'],
      ['Mod+⇧E', 'Capture frame'],
    ],
  },
  {
    group: 'Edit',
    items: [
      ['Mod+Z', 'Undo'],
      ['Mod+⇧Z', 'Redo'],
      ['Mod+X / C / V', 'Cut / Copy / Paste'],
      ['Mod+D', 'Duplicate'],
      ['Mod+A', 'Select all'],
      ['Esc', 'Deselect & reset tool'],
      ['?', 'Keyboard shortcuts'],
    ],
  },
];
