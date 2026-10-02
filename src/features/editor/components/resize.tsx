import { InspectionPanel } from 'lucide-react';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProportionsIcon } from 'lucide-react';
import { dispatch } from '@designcombo/events';
import { DESIGN_RESIZE } from '@designcombo/state';
import { Icons } from '@/components/shared/icons';
import { Hint } from '@/components/ui/hint';

const RESIZE_OPTIONS = [
  {
    label: '16:9',
    icon: 'landscape',
    description: 'YouTube ads',
    value: {
      width: 1920,
      height: 1080,
      name: '16:9',
    },
  },
  {
    label: '9:16',
    icon: 'portrait',
    description: 'TikTok, YouTube Shorts',
    value: {
      width: 1080,
      height: 1920,
      name: '9:16',
    },
  },
  {
    label: '1:1',
    icon: 'square',
    description: 'Instagram, Facebook posts',
    value: {
      width: 1080,
      height: 1080,
      name: '1:1',
    },
  },
];

function Resize() {
  return (
    <div className='absolute top-4 left-4 h-12 w-12 z-[900] bg-white rounded-[10px] shadow-[0_0_20px_rgba(0,0,0,0.2)]'>
      <div className='w-full h-full flex items-center justify-center cursor-pointer'>
        <Hint label='Resize' side='bottom' sideOffset={5}>
          <ResizeVideo />
        </Hint>
      </div>
    </div>
  );
}

const ResizeVideo = () => {
  const handleResize = options => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        ...options,
      },
    });
  };

  return (
    <Popover>
      <PopoverTrigger className='w-full h-full flex items-center justify-center cursor-pointer'>
        <InspectionPanel />
        {/* <GlassicButton
            title='Resize'
            className='cursor-pointer glass-btn font-light w-full sm:w-auto !p-5 text-sm sm:text-base transition-all flex items-center'
            icon={<ProportionsIcon className='h-4 w-4' />}
            // onClick={() => }
          /> */}
        {/* <Button className='z-10 h-7 gap-2 cursor-pointer' variant='outline' size={'sm'}>
            <ProportionsIcon className='h-4 w-4' />
            <div>Resize</div>
          </Button> */}
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='z-[999] w-60 px-2.5 py-3 border border-black/10 rounded-[10px] text-black bg-white'
      >
        <div className='text-sm'>
          {RESIZE_OPTIONS.map((option, index) => (
            <ResizeOption
              key={`${option.label}-${index}`}
              label={option.label}
              icon={option.icon}
              value={option.value}
              handleResize={handleResize}
              description={option.description}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ResizeOption = ({ label, icon, value, description, handleResize }) => {
  const Icon = Icons[icon];
  console.log(value);
  return (
    <div onClick={() => handleResize(value)} className='flex cursor-pointer items-center p-2 hover:bg-zinc-50 rounded'>
      <div className='w-8 text-muted-foreground'>
        <Icon size={20} />
      </div>
      <div>
        <div>{label}</div>
        <div className='text-xs text-muted-foreground'>{description}</div>
      </div>
    </div>
  );
};

export default Resize;
