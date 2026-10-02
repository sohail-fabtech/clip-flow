import React, { memo, useCallback, useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TextPreset from '@/features/editor/menu-item/captions/text-preset';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { dispatch } from '@designcombo/events';
import { ADD_ITEMS, ADD_TEXT, LAYER_DELETE, LAYER_SELECTION } from '@designcombo/state';
import { nanoid } from 'nanoid';
import { TEXT_BODY_ADD_PAYLOAD } from '@/features/editor/constants/payload';
import useStore from '@/features/editor/stores/use-store';

// Dummy captions data for UI demonstration (milliseconds)
const sampleCaptions = [
  { id: 1, startMs: 0, endMs: 4000, text: 'Welcome to Opus Clip!' },
  { id: 2, startMs: 5000, endMs: 9000, text: 'Effortless video captioning.' },
  { id: 3, startMs: 10000, endMs: 14000, text: 'Edit and style your captions easily.' },
  { id: 3, startMs: 14000, endMs: 20000, text: 'Edit and style your captions easily.' },
];

const msToMMSS = ms => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const Presets = memo(() => {
  const { trackItem } = useLayoutStore();
  return (
    <div>
      <TextPreset trackItem={trackItem} />
    </div>
  );
});
Presets.displayName = 'Presets';

// Opus Clip-style Caption Row
const CaptionRow = ({ startMs, endMs, text }) => (
  <div className='flex items-center bg-[#232326] rounded px-3 py-2 mb-2 group hover:bg-[#34343A] transition-colors'>
    <div className='flex-shrink-0 text-xs text-[#A1A1AA] w-[56px] font-mono'>{`${msToMMSS(startMs)} - ${msToMMSS(
      endMs,
    )}`}</div>
    <div className='flex-1 text-sm ml-4'>{text}</div>
    <Button
      className='ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 !py-0 cursor-pointer rounded border border-[#444] text-[#A1A1AA] bg-[#393944] hover:bg-[#393944]'
      title='Edit Caption'
    >
      Edit
    </Button>
  </div>
);

// Opus Clip-style Captions UI
const Captions = memo(() => {
  const [enabled, setEnabled] = useState(false);
  const [createdIds, setCreatedIds] = useState([]);
  const [batchId, setBatchId] = useState(null);

  const addCaptionsToTimeline = useCallback(() => {
    // Avoid duplicates: check existing karaoke text items by text+range
    const state = useStore.getState();
    const map = state?.trackItemsMap || {};
    const existingKeySet = new Set(
      Object.values(map)
        .filter(item => item?.type === 'text')
        .map(item => `${item?.details?.text}|${item?.display?.from}|${item?.display?.to}`),
    );

    const newBatchId = nanoid();
    const trackItems = sampleCaptions
      .filter(cap => !existingKeySet.has(`${cap.text}|${cap.startMs}|${cap.endMs}`))
      .map(cap => {
        const id = nanoid();
        return {
          ...TEXT_BODY_ADD_PAYLOAD,
          id,
          type: 'text',
          display: { from: cap.startMs, to: cap.endMs },
          details: {
            ...TEXT_BODY_ADD_PAYLOAD.details,
            text: cap.text,
            textAlign: 'center',
          },
          metadata: { ...(TEXT_BODY_ADD_PAYLOAD.metadata || {}), autoCaption: true, captionBatchId: newBatchId },
        };
      });
    if (!trackItems.length) return;
    const ids = trackItems.map(t => t.id);
    dispatch(ADD_ITEMS, { payload: { trackItems } });
    setCreatedIds(prev => [...prev, ...ids]);
    setBatchId(newBatchId);
  }, []);

  const removeCaptionsFromTimeline = useCallback(() => {
    let idsToRemove = createdIds;

    if (!idsToRemove.length) {
      const state = useStore.getState();
      idsToRemove = Object.values(state.trackItemsMap || {})
        .filter(item => item?.type === 'text' && item?.metadata?.autoCaption)
        .filter(item => (batchId ? item.metadata.captionBatchId === batchId : true))
        .map(item => item.id);
    }

    if (!idsToRemove.length) return;

    dispatch(LAYER_SELECTION, { payload: { activeIds: idsToRemove }, options: {} });
    Promise.resolve().then(() => {
      dispatch(LAYER_DELETE, { payload: { trackItemIds: idsToRemove } });
    });

    setCreatedIds([]);
    setBatchId(null);
  }, [createdIds, batchId]);

  const onToggle = useCallback(
    val => {
      if (val) {
        addCaptionsToTimeline();
        setEnabled(true);
      } else {
        removeCaptionsFromTimeline();
        setEnabled(false);
      }
    },
    [addCaptionsToTimeline, removeCaptionsFromTimeline, createdIds.length],
  );

  return (
    <div className='flex flex-col h-[400px]'>
      <div className='flex items-center justify-between mb-2 px-1'>
        <div className='text-xs text-white/80'>Apply captions to timeline</div>
        <Switch className='!bg-[#4F4F51]' checked={enabled} onCheckedChange={onToggle} />
      </div>

      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent pr-1'>
        {sampleCaptions.map(cap => (
          <CaptionRow key={cap.id} {...cap} />
        ))}
      </div>
      <Button className='mt-3 w-full py-2 bg-[#393944] cursor-pointer rounded-md text-xs text-[#E4E4E7] hover:bg-[#45454F] transition-colors font-semibold'>
        + Add Caption
      </Button>
    </div>
  );
});
Captions.displayName = 'Captions';

export function Caption() {
  const CaptionsTabs = [
    {
      name: 'Presets',
      value: 'presets',
      content: <Presets />,
    },
    {
      name: 'Caption',
      value: 'caption',
      content: <Captions />,
    },
  ];

  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Caption</h1>
      <Separator className='w-full bg-white/60' />

      {/* content */}
      <div className='p-2'>
        <Tabs defaultValue={CaptionsTabs[0].value} className='max-w-xs w-full'>
          <TabsList className='w-full p-0 bg-transparent text-white justify-start rounded-none'>
            {CaptionsTabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='rounded-none h-full bg-transparent text-white data-[state=active]:shadow-none data-[state=active]:bg-transparent border-0 border-b border-transparent data-[state=active]:border-white cursor-pointer'
              >
                <p className='text-[13px] font-light'>{tab.name}</p>
              </TabsTrigger>
            ))}
          </TabsList>
          {CaptionsTabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className=''>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
