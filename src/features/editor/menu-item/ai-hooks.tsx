import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ADD_AUDIO } from '@designcombo/state';
import { dispatch } from '@designcombo/events';
import { generateId } from '@designcombo/timeline';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';
import { VoiceSelector } from '@/features/editor/components/voice-selector';
import { createVoiceOver } from '@/features/editor/services/voice-over';

export function AIHooks() {
  const [voiceId, setVoiceId] = useState('adam');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const src = await createVoiceOver(voiceId, script.trim());
      dispatch(ADD_AUDIO, {
        payload: { id: generateId(), type: 'audio', details: { src }, metadata: {} },
        options: {},
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice-over failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col bg-[#27272A] rounded-[5px] text-white'>
      <h1 className='text-sm p-3'>AI Hooks</h1>
      <Separator className='w-full bg-white/60' />

      <div className='p-3'>
        <ScrollArea>
          <div className='flex flex-1 flex-col'>
            <div className='flex h-12 flex-none items-center text-sm font-medium'>AI hook script</div>
            <Textarea
              placeholder='type your script here'
              className='h-24 resize-none rounded border-white/10 bg-[#333] p-2 text-xs text-white break-words whitespace-pre-wrap focus-visible:ring-0'
              value={script}
              onChange={event => setScript(event.target.value)}
            />
          </div>
        </ScrollArea>

        <div className='mt-4'>
          <VoiceSelector selectedVoice={voiceId} onVoiceSelect={setVoiceId} />
        </div>

        {error && <p className='mt-3 text-xs text-red-400'>{error}</p>}

        <div className='flex items-center justify-center mt-4'>
          <Button
            className='w-full cursor-pointer border bg-white hover:bg-white/90 text-black rounded h-12'
            onClick={generate}
            disabled={loading || !script.trim()}
          >
            {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Icons.AI className='w-4 h-4' />}
            <span className='ml-1'>Generate Hooks</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
