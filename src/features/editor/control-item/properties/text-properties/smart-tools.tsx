import React from 'react';

function SmartTools() {
  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-800'>Smart Tools</h3>
      <div className='space-y-3'>
        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-blue-600 text-sm'>AI</span>
            </div>
            <div>
              <div className='font-medium'>Auto-format Text</div>
              <div className='text-sm text-gray-500'>AI-powered text formatting</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
              <span className='text-green-600 text-sm'>✓</span>
            </div>
            <div>
              <div className='font-medium'>Grammar Check</div>
              <div className='text-sm text-gray-500'>Check and fix grammar</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
              <span className='text-purple-600 text-sm'>T</span>
            </div>
            <div>
              <div className='font-medium'>Text Enhancement</div>
              <div className='text-sm text-gray-500'>Improve text readability</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
              <span className='text-orange-600 text-sm'>S</span>
            </div>
            <div>
              <div className='font-medium'>Style Suggestions</div>
              <div className='text-sm text-gray-500'>Get style recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartTools;
