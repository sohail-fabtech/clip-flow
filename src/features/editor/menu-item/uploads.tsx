import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Music, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useUploadStore from '@/features/editor/stores/use-upload-store';
import ModalUpload from '@/features/editor/components/modal-upload';
import { Icons } from '@/components/shared/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadTabs } from '@/features/editor/constants/upload-section';
import { UPLOAD_DATA } from '@/features/editor/data/editor-data';
import { Separator } from '@/components/ui/separator';
import type { UploadRecord } from '@/features/editor/types';
import { addMediaToTimeline, mediaSource } from '@/features/editor/utils/add-media';

const formatBadge = (contentType: string) => contentType.split('/')[1]?.replace('mpeg', 'mp3').toUpperCase() ?? '';

export const Uploads = () => {
  const { setShowUploadModal, uploads, pendingUploads, activeUploads } = useUploadStore();
  const library = [...uploads, ...(UPLOAD_DATA as UploadRecord[])];

  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>Upload</h1>
      <Separator className='w-full bg-white/60 mb-3' />

      <ModalUpload />
      <div className='flex items-center justify-center px-4'>
        <Button
          className='w-full cursor-pointer border bg-white hover:bg-white/90 text-black rounded h-12'
          onClick={() => setShowUploadModal(true)}
        >
          <Icons.upload className='w-4 h-4' />
          <span className='ml-1'>Upload</span>
        </Button>
      </div>

      {(pendingUploads.length > 0 || activeUploads.length > 0) && (
        <div className='p-4'>
          <div className='flex flex-col gap-2'>
            {pendingUploads.map(upload => (
              <div key={upload.id} className='flex items-center gap-2'>
                <span className='truncate text-xs flex-1'>{upload.file?.name || upload.url || 'Unknown'}</span>
                <span className='text-xs text-white'>Pending</span>
              </div>
            ))}
            {activeUploads.map(upload => (
              <div key={upload.id} className='flex items-center gap-2'>
                <span className='truncate text-xs flex-1'>{upload.file?.name || upload.url || 'Unknown'}</span>
                {upload.status === 'failed' ? (
                  <span className='text-xs text-red-400 truncate max-w-40' title={upload.error}>
                    Failed{upload.error ? `: ${upload.error}` : ''}
                  </span>
                ) : (
                  <div className='flex items-center gap-1'>
                    {upload.status === 'uploading' && <Loader2 className='w-3 h-3 animate-spin text-white' />}
                    <span className='text-xs'>{upload.progress ?? 0}%</span>
                    <span className='text-xs text-white ml-2'>{upload.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue={UploadTabs[0].value} className='max-w-xs w-full mt-6'>
        <TabsList className='w-full p-0 bg-transparent text-white justify-start rounded-none'>
          {UploadTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='rounded-none h-full bg-transparent text-white data-[state=active]:shadow-none data-[state=active]:bg-transparent border-0 border-b border-transparent data-[state=active]:border-white cursor-pointer'
            >
              <p className='text-[13px] font-light'>{tab.name}</p>
            </TabsTrigger>
          ))}
        </TabsList>
        {UploadTabs.map(tab => {
          const filtered = tab.value === 'all' ? library : library.filter(u => u.type === tab.value);

          return (
            <TabsContent key={tab.value} value={tab.value} className='p-3'>
              {filtered.length > 0 ? (
                <ScrollArea className='w-full h-full max-h-80 overflow-hidden'>
                  <div className='grid grid-cols-3 gap-3'>
                    {filtered.map((item, idx) => (
                      <div key={item.id || idx} className='flex flex-col items-center gap-1'>
                        <Card
                          className='w-20 h-16 flex items-center justify-center overflow-hidden relative cursor-pointer border-none rounded bg-[#2d2d31] hover:bg-[#3a3a3f] transition group'
                          onClick={() => addMediaToTimeline(item)}
                        >
                          {item.type === 'video' && (
                            <>
                              {item.metadata?.thumbnailUrl ? (
                                <img
                                  src={item.metadata.thumbnailUrl}
                                  alt={item.fileName}
                                  className='absolute inset-0 w-full h-full object-cover rounded'
                                />
                              ) : (
                                <video
                                  src={`${mediaSource(item)}#t=1`}
                                  preload='metadata'
                                  muted
                                  className='absolute inset-0 w-full h-full object-cover rounded'
                                />
                              )}
                              <div className='absolute inset-0 w-full h-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                                  <div className='w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1'></div>
                                </div>
                              </div>
                              <div className='absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded'>
                                {formatBadge(item.contentType)}
                              </div>
                            </>
                          )}
                          {item.type === 'image' && (
                            <>
                              <img
                                src={mediaSource(item)}
                                alt={item.fileName}
                                className='absolute inset-0 w-full h-full object-cover block rounded'
                              />
                              <div className='absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded'>
                                {formatBadge(item.contentType).replace('SVG+XML', 'SVG')}
                              </div>
                            </>
                          )}
                          {item.type === 'audio' && (
                            <>
                              <div className='absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded flex items-center justify-center'>
                                <Music className='w-8 h-8 text-white' />
                              </div>
                              <div className='absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded'>
                                {formatBadge(item.contentType)}
                              </div>
                            </>
                          )}
                        </Card>
                        <span className='text-xs text-white truncate w-full text-center'>{item.fileName}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className='flex items-center justify-center h-20 text-sm text-gray-400'>
                  No {tab.name.toLowerCase()} uploaded
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
