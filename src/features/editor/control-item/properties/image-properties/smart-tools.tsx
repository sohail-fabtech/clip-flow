import React, { useState } from 'react';
import { dispatch } from '@designcombo/events';
import { EDIT_OBJECT } from '@designcombo/state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Target,
  Palette,
  Eraser,
  Zap,
  Eye,
  Download,
  RotateCcw,
  Wand2,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';

const SmartTools = () => {
  const { trackItem } = useLayoutStore();
  const [processing, setProcessing] = useState(false);
  const [appliedTools, setAppliedTools] = useState(new Set());

  const updateProperty = (property, value) => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: {
          details: {
            [property]: value,
          },
        },
      },
    });
  };

  const applySmartTool = async (toolName, properties = {}) => {
    setProcessing(true);
    setAppliedTools(prev => new Set([...prev, toolName]));

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Apply the tool properties
    Object.entries(properties).forEach(([key, value]) => {
      updateProperty(key, value);
    });

    setProcessing(false);
  };

  const resetAllTools = () => {
    setAppliedTools(new Set());
    // Reset all smart tool properties
    const resetProperties = {
      autoEnhanced: false,
      autoCropped: false,
      colorCorrected: false,
      backgroundRemoved: false,
      noiseReduced: false,
      faceDetected: false,
      objectDetected: false,
    };

    Object.entries(resetProperties).forEach(([key, value]) => {
      updateProperty(key, value);
    });
  };

  if (!trackItem) return null;

  const smartTools = [
    {
      id: 'auto-enhance',
      name: 'Auto Enhance',
      description: 'AI-powered image enhancement',
      icon: Sparkles,
      color: 'bg-blue-100 text-blue-600',
      properties: { autoEnhanced: true, brightness: 110, contrast: 105, saturation: 108 },
    },
    {
      id: 'auto-crop',
      name: 'Auto Crop',
      description: 'Smart cropping suggestions',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      properties: { autoCropped: true, aspectRatio: '16:9' },
    },
    {
      id: 'color-correction',
      name: 'Color Correction',
      description: 'Automatic color adjustment',
      icon: Palette,
      color: 'bg-purple-100 text-purple-600',
      properties: { colorCorrected: true, hue: 5, saturation: 110, contrast: 108 },
    },
    {
      id: 'background-removal',
      name: 'Background Removal',
      description: 'Remove background automatically',
      icon: Eraser,
      color: 'bg-orange-100 text-orange-600',
      properties: { backgroundRemoved: true, backgroundColor: 'transparent' },
    },
    {
      id: 'noise-reduction',
      name: 'Noise Reduction',
      description: 'Reduce image noise',
      icon: Zap,
      color: 'bg-red-100 text-red-600',
      properties: { noiseReduced: true, blur: 0.5, sharpen: 120 },
    },
    {
      id: 'face-detection',
      name: 'Face Detection',
      description: 'Detect and enhance faces',
      icon: Eye,
      color: 'bg-pink-100 text-pink-600',
      properties: { faceDetected: true, faceEnhancement: true },
    },
    {
      id: 'object-detection',
      name: 'Object Detection',
      description: 'Detect and highlight objects',
      icon: ImageIcon,
      color: 'bg-indigo-100 text-indigo-600',
      properties: { objectDetected: true, objectHighlight: true },
    },
    {
      id: 'style-transfer',
      name: 'Style Transfer',
      description: 'Apply artistic styles',
      icon: Wand2,
      color: 'bg-yellow-100 text-yellow-600',
      properties: { styleTransferred: true, artisticStyle: 'vintage' },
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-800'>Smart Tools</h3>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='text-xs'>
            {appliedTools.size} Applied
          </Badge>
          <Button
            variant='outline'
            size='sm'
            onClick={resetAllTools}
            className='text-xs'
            disabled={appliedTools.size === 0}
          >
            <RotateCcw className='w-3 h-3 mr-1' />
            Reset
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        {smartTools.map(tool => {
          const isApplied = appliedTools.has(tool.id);
          const IconComponent = tool.icon;

          return (
            <div
              key={tool.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                isApplied ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => !processing && applySmartTool(tool.id, tool.properties)}
            >
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tool.color}`}>
                  <IconComponent className='w-5 h-5' />
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h4 className='font-medium text-gray-900'>{tool.name}</h4>
                    {isApplied && (
                      <Badge variant='default' className='text-xs'>
                        Applied
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-gray-500'>{tool.description}</p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  {processing && appliedTools.has(tool.id) && (
                    <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                  )}
                  <Button
                    variant={isApplied ? 'default' : 'outline'}
                    size='sm'
                    className='text-xs'
                    disabled={processing}
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Settings */}
      <div className='pt-4 border-t border-gray-200'>
        <div className='flex items-center gap-2 mb-3'>
          <Settings className='w-4 h-4 text-gray-600' />
          <Label className='text-sm font-medium text-gray-700'>Advanced Settings</Label>
        </div>

        <div className='space-y-3'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>AI Processing Strength</span>
              <span className='text-sm text-gray-500'>75%</span>
            </div>
            <Slider value={[75]} onValueChange={() => {}} min={0} max={100} step={5} className='w-full' />
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Quality vs Speed</span>
              <span className='text-sm text-gray-500'>Balanced</span>
            </div>
            <Slider value={[50]} onValueChange={() => {}} min={0} max={100} step={10} className='w-full' />
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processing && (
        <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
            <span className='text-sm text-blue-700'>Processing with AI...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTools;
