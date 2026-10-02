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
              <div className='font-medium'>Auto Stabilize</div>
              <div className='text-sm text-gray-500'>AI-powered video stabilization</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
              <span className='text-green-600 text-sm'>🎯</span>
            </div>
            <div>
              <div className='font-medium'>Auto Crop</div>
              <div className='text-sm text-gray-500'>Smart cropping for different ratios</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
              <span className='text-purple-600 text-sm'>🎨</span>
            </div>
            <div>
              <div className='font-medium'>Color Correction</div>
              <div className='text-sm text-gray-500'>Automatic color adjustment</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
              <span className='text-orange-600 text-sm'>🔍</span>
            </div>
            <div>
              <div className='font-medium'>Background Removal</div>
              <div className='text-sm text-gray-500'>Remove background automatically</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
              <span className='text-red-600 text-sm'>✨</span>
            </div>
            <div>
              <div className='font-medium'>Noise Reduction</div>
              <div className='text-sm text-gray-500'>Reduce video noise</div>
            </div>
          </div>
        </div>

        <div className='p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
              <span className='text-indigo-600 text-sm'>⚡</span>
            </div>
            <div>
              <div className='font-medium'>Motion Blur</div>
              <div className='text-sm text-gray-500'>Add motion blur effects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartTools;
