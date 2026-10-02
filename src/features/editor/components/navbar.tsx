import React, { useState, useEffect } from 'react';
import { useIsLargeScreen, useIsMediumScreen, useIsSmallScreen } from '@/features/editor/hooks/use-media-query';
import DownloadProgressModal from '@/features/editor/components/download-progress-modal';
import { LogoIcons } from '@/components/shared/logos';
import { Icons } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { dispatch } from '@designcombo/events';
import { HISTORY_UNDO, HISTORY_REDO } from '@designcombo/state';
import AutosizeInput from '@/components/ui/autosize-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { generateId } from '@designcombo/timeline';
import { useDownloadState } from '@/features/editor/stores/use-download-state';
import { GlassicButton } from '@/components/shared/glassic-button';

function Navbar({ user, stateManager, setProjectName, projectName = 'Untitled' }) {
  const [title, setTitle] = useState(projectName);
  const isLargeScreen = useIsLargeScreen();
  const isMediumScreen = useIsMediumScreen();
  const isSmallScreen = useIsSmallScreen();

  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const handleTitleChange = e => {
    setTitle(e.target.value);
  };
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isLargeScreen ? '320px 1fr 320px' : '1fr 1fr 1fr',
      }}
      className='pointer-events-none flex h-18 items-center border-b border-border/80 p-2'
    >
      <DownloadProgressModal />

      <div className='flex items-center gap-2'>
        <div className='pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md text-zinc-200'>
          <LogoIcons.rethread />
        </div>
      </div>

      <div className='flex h-11 items-center justify-center gap-2'>
        {!isSmallScreen && (
          <div className='pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5 text-muted-foreground'>
            <AutosizeInput
              name='title'
              value={title}
              onChange={handleTitleChange}
              width={400}
              inputClassName='border-none  outline-none px-1 min-w-20 text-sm font-medium text-zinc-200'
            />
          </div>
        )}
      </div>

      <div className='flex h-11 items-center justify-end gap-2'>
        <div className=' pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5'>
          {!isSmallScreen && (
            <>
              {/* <GlassicButton
                title='Save Changes'
                className='cursor-pointer glass-btn font-light w-full sm:w-auto !p-5 text-sm sm:text-base transition-all flex items-center'
                icon={<Icons.save width={16} />}
                // onClick={() => }
              />
              <GlassicButton
                title='Share'
                className='cursor-pointer glass-btn font-light w-full sm:w-auto !p-5 text-sm sm:text-base transition-all flex items-center'
                icon={<Icons.share width={16} />}
                // onClick={() => }
              /> */}
              <div className='glass-bg rounded-[6px] pointer-events-auto flex h-9 items-center px-1.5 ml-6'>
                <Button
                  onClick={handleUndo}
                  className='text-muted-foreground hover:text-white cursor-pointer'
                  variant='ghost'
                  size='icon'
                >
                  <Icons.undo width={20} />
                </Button>
                <Button
                  onClick={handleRedo}
                  className='text-muted-foreground hover:text-white cursor-pointer'
                  variant='ghost'
                  size='icon'
                >
                  <Icons.redo width={20} />
                </Button>
              </div>
              <Button className='bg-white/20 hover:bg-white/20 text-white rounded font-normal cursor-pointer'>
                Save Changes
              </Button>
            </>
          )}

          <DownloadPopover stateManager={stateManager} />
        </div>
      </div>
    </div>
  );
}

const DownloadPopover = ({ stateManager }) => {
  const isMediumScreen = useIsMediumScreen();
  const { actions, exportType } = useDownloadState();
  const [isExportTypeOpen, setIsExportTypeOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const data = {
      id: generateId(),
      ...stateManager.getState(),
    };

    actions.setState({ payload: data });
    actions.startExport();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {/* <GlassicButton
          title='Export'
          className='cursor-pointer glass-btn font-light w-full sm:w-auto !p-5 text-sm sm:text-base transition-all flex items-center'
          icon={<Icons.download width={16} />}
          // onClick={() => setOpen(!open)}
        /> */}
        <Button className='bg-white hover:bg-white text-black rounded font-normal cursor-pointer'>Export</Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='z-[250] flex w-60 flex-col gap-4 bg-primary border border-white/10 rounded-[10px] text-white'
      >
        <Label>Export settings</Label>

        <Popover open={isExportTypeOpen} onOpenChange={setIsExportTypeOpen}>
          <PopoverTrigger>
            <Button className='w-full justify-between border-white/10 rounded' variant='outline'>
              <div>{exportType.toUpperCase()}</div>
              <Icons.arrowDown width={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className=' z-[251] w-[--radix-popover-trigger-width] px-2 py-2 bg-primary border border-white/30 rounded-[10px] text-white'>
            <div
              className='flex h-7 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800'
              onClick={() => {
                actions.setExportType('mp4');
                setIsExportTypeOpen(false);
              }}
            >
              MP4
            </div>
            <div
              className='flex h-7 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800'
              onClick={() => {
                actions.setExportType('json');
                setIsExportTypeOpen(false);
              }}
            >
              JSON
            </div>
          </PopoverContent>
        </Popover>

        <div>
          {/* <GlassicButton
            title='Export'
            className='cursor-pointer glass-btn font-light w-full !p-5 text-sm sm:text-base transition-all flex items-center'
            icon={<Icons.download width={16} />}
            onClick={handleExport}
          /> */}
          <Button
            onClick={handleExport}
            className='bg-white hover:bg-white w-full text-black rounded font-normal cursor-pointer'
          >
            Export
          </Button>
          {/* <Button onClick={handleExport} className='w-full'>
            Export
          </Button> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Navbar;
