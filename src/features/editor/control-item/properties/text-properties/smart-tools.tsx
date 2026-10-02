function SmartTools() {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Smart Tools</h3>
      <div className='space-y-3'>
        <div className='p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center'>
              <span className='text-blue-300 text-sm'>AI</span>
            </div>
            <div>
              <div className='font-medium'>Auto-format Text</div>
              <div className='text-sm text-muted-foreground'>AI-powered text formatting</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center'>
              <span className='text-green-300 text-sm'>✓</span>
            </div>
            <div>
              <div className='font-medium'>Grammar Check</div>
              <div className='text-sm text-muted-foreground'>Check and fix grammar</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center'>
              <span className='text-purple-300 text-sm'>T</span>
            </div>
            <div>
              <div className='font-medium'>Text Enhancement</div>
              <div className='text-sm text-muted-foreground'>Improve text readability</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center'>
              <span className='text-orange-300 text-sm'>S</span>
            </div>
            <div>
              <div className='font-medium'>Style Suggestions</div>
              <div className='text-sm text-muted-foreground'>Get style recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartTools;
