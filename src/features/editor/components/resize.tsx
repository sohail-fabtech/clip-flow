import { InspectionPanel } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { DESIGN_RESIZE } from '@designcombo/state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Hint } from '@/components/ui/hint';
import { Icons } from '@/components/shared/icons';

const RESIZE_OPTIONS = [
  {
    label: '16:9',
    Icon: Icons.landscape,
    description: 'YouTube ads',
    value: { width: 1920, height: 1080, name: '16:9' },
  },
  {
    label: '9:16',
    Icon: Icons.portrait,
    description: 'TikTok, YouTube Shorts',
    value: { width: 1080, height: 1920, name: '9:16' },
  },
  {
    label: '1:1',
    Icon: Icons.square,
    description: 'Instagram, Facebook posts',
    value: { width: 1080, height: 1080, name: '1:1' },
  },
];

function Resize() {
  return (
    <div className='absolute left-4 top-4 z-[900] h-12 w-12 rounded-[10px] border border-white/10 bg-[#27272A] text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'>
      <Popover>
        <Hint label='Resize' side='bottom' sideOffset={5}>
          <PopoverTrigger className='flex h-full w-full cursor-pointer items-center justify-center' aria-label='Resize'>
            <InspectionPanel />
          </PopoverTrigger>
        </Hint>
        <PopoverContent
          align='start'
          className='z-[999] w-60 rounded-[10px] border border-white/10 bg-[#0E0E11] px-2.5 py-3 text-white'
        >
          {RESIZE_OPTIONS.map(({ label, Icon, description, value }) => (
            <button
              type='button'
              key={label}
              onClick={() => dispatch(DESIGN_RESIZE, { payload: value })}
              className='flex w-full cursor-pointer items-center rounded p-2 text-left text-sm hover:bg-white/10'
            >
              <span className='w-8 text-muted-foreground'>
                <Icon width={20} height={20} />
              </span>
              <span>
                <span className='block'>{label}</span>
                <span className='block text-xs text-muted-foreground'>{description}</span>
              </span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default Resize;
