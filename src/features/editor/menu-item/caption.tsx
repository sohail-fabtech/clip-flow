import { useState } from 'react';
import { dispatch } from '@designcombo/events';
import { ADD_ITEMS, LAYER_DELETE, LAYER_SELECTION } from '@designcombo/state';
import { nanoid } from 'nanoid';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import TextPreset from '@/features/editor/menu-item/captions/text-preset';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useStore from '@/features/editor/stores/use-store';
import { TEXT_BODY_ADD_PAYLOAD } from '@/features/editor/constants/payload';

const SAMPLE_CAPTIONS = [
  { id: 1, startMs: 0, endMs: 4000, text: 'Welcome to the video editor!' },
  { id: 2, startMs: 5000, endMs: 9000, text: 'Effortless video captioning.' },
  { id: 3, startMs: 10000, endMs: 14000, text: 'Edit and style your captions easily.' },
  { id: 4, startMs: 14000, endMs: 20000, text: 'Export when you are ready.' },
];

const mmss = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

const captionItemIds = () =>
  Object.values(useStore.getState().trackItemsMap)
    .filter(item => item.type === 'text' && item.metadata?.autoCaption)
    .map(item => item.id);

const addCaptions = () => {
  dispatch(ADD_ITEMS, {
    payload: {
      trackItems: SAMPLE_CAPTIONS.map(caption => ({
        ...TEXT_BODY_ADD_PAYLOAD,
        id: nanoid(),
        type: 'text',
        display: { from: caption.startMs, to: caption.endMs },
        details: { ...TEXT_BODY_ADD_PAYLOAD.details, text: caption.text, textAlign: 'center' },
        metadata: { autoCaption: true },
      })),
    },
  });
};

const removeCaptions = () => {
  const ids = captionItemIds();
  if (ids.length === 0) return;
  dispatch(LAYER_SELECTION, { payload: { activeIds: ids }, options: {} });
  queueMicrotask(() => dispatch(LAYER_DELETE, { payload: { trackItemIds: ids } }));
};

const Captions = () => {
  const [enabled, setEnabled] = useState(() => captionItemIds().length > 0);

  return (
    <div className='flex h-[400px] flex-col'>
      <div className='mb-2 flex items-center justify-between px-1'>
        <div className='text-xs text-white/80'>Apply captions to timeline</div>
        <Switch
          className='!bg-[#4F4F51]'
          checked={enabled}
          onCheckedChange={checked => {
            if (checked) addCaptions();
            else removeCaptions();
            setEnabled(checked);
          }}
        />
      </div>
      <div className='flex-1 overflow-y-auto pr-1'>
        {SAMPLE_CAPTIONS.map(({ id, startMs, endMs, text }) => (
          <div
            key={id}
            className='group mb-2 flex items-center rounded bg-[#232326] px-3 py-2 transition-colors hover:bg-[#34343A]'
          >
            <div className='w-[56px] flex-shrink-0 font-mono text-xs text-[#A1A1AA]'>{`${mmss(startMs)} - ${mmss(endMs)}`}</div>
            <div className='ml-4 flex-1 text-sm'>{text}</div>
            <Button
              className='ml-2 cursor-pointer rounded border border-[#444] bg-[#393944] px-2 !py-0 text-xs text-[#A1A1AA] opacity-0 transition-opacity hover:bg-[#393944] group-hover:opacity-100'
              title='Edit Caption'
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
      <Button className='mt-3 w-full cursor-pointer rounded-md bg-[#393944] py-2 text-xs font-semibold text-[#E4E4E7] transition-colors hover:bg-[#45454F]'>
        + Add Caption
      </Button>
    </div>
  );
};

const Presets = () => <TextPreset trackItem={useLayoutStore(state => state.trackItem)} />;

const TABS = [
  { name: 'Presets', value: 'presets', Content: Presets },
  { name: 'Caption', value: 'caption', Content: Captions },
];

export function Caption() {
  return (
    <div className='flex flex-col rounded-[5px] bg-[#27272A] text-white'>
      <h1 className='p-3 text-sm'>Caption</h1>
      <Separator className='w-full bg-white/60' />
      <div className='p-2'>
        <Tabs defaultValue={TABS[0].value} className='w-full max-w-xs'>
          <TabsList className='w-full justify-start rounded-none bg-transparent p-0 text-white'>
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='h-full cursor-pointer rounded-none border-0 border-b border-transparent bg-transparent text-white data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:shadow-none'
              >
                <p className='text-[13px] font-light'>{tab.name}</p>
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map(({ value, Content }) => (
            <TabsContent key={value} value={value}>
              <Content />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
