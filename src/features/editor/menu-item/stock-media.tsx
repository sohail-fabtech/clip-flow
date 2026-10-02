import { useEffect, useState } from 'react';
import { Loader2, PlusIcon, Search } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { ADD_ITEMS, ADD_VIDEO } from '@designcombo/state';
import { generateId } from '@designcombo/timeline';
import Draggable from '@/components/shared/draggable';
import { Button } from '@/components/ui/button';
import { ImageLoading } from '@/components/ui/image-loading';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsDraggingOverTimeline } from '@/features/editor/hooks/use-is-dragging-over-timeline';
import { useStockMedia } from '@/features/editor/hooks/use-stock-media';
import type { StockItem, StockKind } from '@/features/editor/services/pexels';

const LABELS: Record<StockKind, { title: string; plural: string }> = {
  image: { title: 'Stock images', plural: 'images' },
  video: { title: 'Stock Videos', plural: 'videos' },
};

const addToTimeline = (item: StockItem) => {
  if (item.type === 'video') {
    dispatch(ADD_VIDEO, {
      payload: { id: generateId(), details: { src: item.details.src }, metadata: { previewUrl: item.preview } },
      options: { resourceId: 'main', scaleMode: 'fit' },
    });
    return;
  }
  dispatch(ADD_ITEMS, {
    payload: {
      trackItems: [
        {
          id: generateId(),
          type: 'image',
          display: { from: 0, to: 5000 },
          details: { src: item.details.src },
          metadata: {},
        },
      ],
    },
  });
};

export function StockMedia({ kind }: { kind: StockKind }) {
  const isDraggingOverTimeline = useIsDraggingOverTimeline();
  const [query, setQuery] = useState('');
  const { items, page, hasNextPage, loading, error, load } = useStockMedia(kind);
  const { title, plural } = LABELS[kind];

  useEffect(() => {
    load('');
  }, [load]);

  const clear = () => {
    setQuery('');
    load('');
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex h-12 flex-none items-center text-sm text-white'>{title}</div>
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Input
            placeholder={`Search Pexels ${plural}...`}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && load(query)}
            className='pr-10 focus-visible:ring-0 rounded font-light'
          />
          <Button
            size='sm'
            variant='ghost'
            className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0'
            onClick={() => load(query)}
            disabled={loading}
            aria-label='Search'
          >
            {loading ? <Loader2 className='h-3 w-3 animate-spin' /> : <Search className='h-3 w-3' />}
          </Button>
        </div>
        {query && (
          <Button
            size='sm'
            variant='outline'
            onClick={clear}
            disabled={loading}
            className='rounded h-9 border-white/50 font-light'
          >
            Clear
          </Button>
        )}
      </div>

      {error && <div className='mt-2 rounded bg-red-950/20 p-2 text-sm text-red-400'>{error}</div>}

      <ScrollArea className='w-full h-full max-h-[250px] 2xl:max-h-[350px] overflow-y-auto scrollbar-hide mt-4'>
        <div className='masonry-sm w-full bg-transparent'>
          {items.map(item => (
            <Draggable
              key={item.id}
              data={{ ...item, metadata: { previewUrl: item.preview } }}
              renderCustomPreview={
                <div className='h-20 w-20 bg-cover' style={{ backgroundImage: `url(${item.preview})` }} />
              }
              shouldDisplayPreview={!isDraggingOverTimeline}
            >
              <div
                onClick={() => addToTimeline(item)}
                className='group relative mb-2 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded'
              >
                <img
                  draggable={false}
                  src={item.preview}
                  className='h-full w-full rounded-md object-cover'
                  alt={`${kind} preview`}
                />
                {kind === 'video' && (
                  <>
                    <div className='absolute inset-0 flex items-center justify-center rounded-md bg-black/20 opacity-0 transition-opacity group-hover:opacity-100'>
                      <PlusIcon className='h-6 w-6 fill-current text-white' />
                    </div>
                    {item.details.duration ? (
                      <div className='absolute bottom-2 right-2 rounded bg-black/90 px-1 py-0.5 text-xs text-white/60'>
                        {Math.round(item.details.duration)}s
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </Draggable>
          ))}
        </div>
        {loading && <ImageLoading message={`Searching for ${plural}...`} />}
        {hasNextPage && (
          <div className='flex items-center justify-center p-4 text-white'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => load(query, page + 1)}
              disabled={loading}
              className='rounded cursor-pointer font-light'
            >
              Load More
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
