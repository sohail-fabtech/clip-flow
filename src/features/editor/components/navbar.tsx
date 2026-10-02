import { useState } from 'react';
import { Check } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import type StateManager from '@designcombo/state';
import { HISTORY_REDO, HISTORY_UNDO } from '@designcombo/state';
import { generateId } from '@designcombo/timeline';
import type { IDesign } from '@designcombo/types';
import { LogoIcons } from '@/components/shared/logos';
import { Icons } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import AutosizeInput from '@/components/ui/autosize-input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DownloadProgressModal from '@/features/editor/components/download-progress-modal';
import { useIsLargeScreen, useIsSmallScreen } from '@/features/editor/hooks/use-media-query';
import { useDownloadState, type ExportType } from '@/features/editor/stores/use-download-state';
import { saveProject } from '@/features/editor/services/project';

interface NavbarProps {
  stateManager: StateManager;
  projectName: string;
  setProjectName: (name: string) => void;
}

const designOf = (stateManager: StateManager): IDesign => ({ id: generateId(), ...stateManager.getState() });

function Navbar({ stateManager, projectName, setProjectName }: NavbarProps) {
  const [saved, setSaved] = useState(false);
  const isLargeScreen = useIsLargeScreen();
  const isSmallScreen = useIsSmallScreen();

  const save = () => {
    saveProject(projectName, designOf(stateManager));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div
      style={{ gridTemplateColumns: isLargeScreen ? '320px 1fr 320px' : '1fr 1fr 1fr' }}
      className='pointer-events-none grid h-18 items-center border-b border-border/80 p-2'
    >
      <DownloadProgressModal />

      <div className='pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md text-zinc-200'>
        <LogoIcons.rethread />
      </div>

      <div className='flex h-11 items-center justify-center gap-2'>
        {!isSmallScreen && (
          <div className='pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5 text-muted-foreground'>
            <AutosizeInput
              name='title'
              aria-label='Project name'
              value={projectName}
              onChange={event => setProjectName(event.target.value)}
              inputClassName='min-w-20 border-none px-1 text-sm font-medium text-zinc-200 outline-none'
            />
          </div>
        )}
      </div>

      <div className='flex h-11 items-center justify-end gap-2'>
        <div className='pointer-events-auto flex h-10 items-center gap-2 rounded-md px-2.5'>
          {!isSmallScreen && (
            <>
              <div className='glass-bg ml-6 flex h-9 items-center rounded-[6px] px-1.5'>
                <Button
                  onClick={() => dispatch(HISTORY_UNDO)}
                  className='cursor-pointer text-muted-foreground hover:text-white'
                  variant='ghost'
                  size='icon'
                  aria-label='Undo'
                >
                  <Icons.undo width={20} />
                </Button>
                <Button
                  onClick={() => dispatch(HISTORY_REDO)}
                  className='cursor-pointer text-muted-foreground hover:text-white'
                  variant='ghost'
                  size='icon'
                  aria-label='Redo'
                >
                  <Icons.redo width={20} />
                </Button>
              </div>
              <Button onClick={save} className='cursor-pointer rounded bg-white/20 font-normal text-white hover:bg-white/30'>
                {saved ? <Check className='h-4 w-4' /> : null}
                {saved ? 'Saved' : 'Save Changes'}
              </Button>
            </>
          )}
          <ExportPopover stateManager={stateManager} />
        </div>
      </div>
    </div>
  );
}

const EXPORT_TYPES: ExportType[] = ['mp4', 'json'];

const ExportPopover = ({ stateManager }: { stateManager: StateManager }) => {
  const { actions, exportType } = useDownloadState();
  const [open, setOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const handleExport = () => {
    actions.setPayload(designOf(stateManager));
    actions.startExport();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className='cursor-pointer rounded bg-white font-normal text-black hover:bg-white/90'>Export</Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='z-[250] flex w-60 flex-col gap-4 rounded-[10px] border border-white/10 bg-primary text-white'
      >
        <Label>Export settings</Label>
        <Popover open={typeOpen} onOpenChange={setTypeOpen}>
          <PopoverTrigger asChild>
            <Button className='w-full justify-between rounded border-white/10' variant='outline'>
              {exportType.toUpperCase()}
              <Icons.arrowDown width={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='z-[251] w-(--radix-popover-trigger-width) rounded-[10px] border border-white/30 bg-primary px-2 py-2 text-white'>
            {EXPORT_TYPES.map(type => (
              <button
                type='button'
                key={type}
                className='flex h-7 w-full items-center rounded-sm px-3 text-sm hover:bg-zinc-800'
                onClick={() => {
                  actions.setExportType(type);
                  setTypeOpen(false);
                }}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Button onClick={handleExport} className='w-full cursor-pointer rounded bg-white font-normal text-black hover:bg-white/90'>
          Export
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default Navbar;
