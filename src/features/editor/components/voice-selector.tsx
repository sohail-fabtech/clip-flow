import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check, ChevronDown, Pause, Play } from 'lucide-react';
import { VOICE_DATA } from '@/features/editor/data/voice-data';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
}

export function VoiceSelector({ selectedVoice, onVoiceSelect }: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selected = VOICE_DATA.find(voice => voice.id === selectedVoice) ?? VOICE_DATA[0];

  const select = (voiceId: string) => {
    onVoiceSelect(voiceId);
    setIsOpen(false);
    setHighlighted(0);
  };

  useEffect(() => {
    const audio = new Audio();
    const onEnded = () => setPlayingUrl(null);
    audio.addEventListener('ended', onEnded);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const count = VOICE_DATA.length;
      if (event.key === 'ArrowDown') setHighlighted(i => (i + 1) % count);
      else if (event.key === 'ArrowUp') setHighlighted(i => (i - 1 + count) % count);
      else if (event.key === 'Enter') select(VOICE_DATA[highlighted].id);
      else if (event.key === 'Escape') setIsOpen(false);
      else return;
      event.preventDefault();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, highlighted]);

  const preview = async (url: string, event: MouseEvent) => {
    event.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playingUrl === url) {
      audio.pause();
      setPlayingUrl(null);
      return;
    }
    audio.src = url;
    setPlayingUrl(url);
    await audio.play().catch(() => setPlayingUrl(null));
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <div className='mb-3 flex flex-col gap-2'>
        <p className='text-sm text-white'>Speaker voice</p>
        <button
          type='button'
          onClick={() => setIsOpen(open => !open)}
          className='flex w-full items-center justify-between rounded-md bg-[#3F3F46] px-3 py-2 transition-colors hover:bg-[#52525B]'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          <span className='flex items-center gap-2'>
            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-white/20'>
              <Play className='ml-0.5 h-3 w-3 text-white' />
            </span>
            <span className='text-sm font-medium text-white'>{selected.name}</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          role='listbox'
          aria-activedescendant={VOICE_DATA[highlighted]?.id}
          className='absolute left-0 right-0 top-full z-[9999] mt-1 min-w-[250px] overflow-hidden rounded-md border border-[#3F3F46] bg-[#27272A] shadow-lg'
        >
          <div className='scrollbar-hide max-h-48 overflow-y-auto'>
            {VOICE_DATA.map((voice, index) => (
              <div
                key={voice.id}
                id={voice.id}
                role='option'
                aria-selected={selectedVoice === voice.id}
                onClick={() => select(voice.id)}
                onMouseEnter={() => setHighlighted(index)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-[#3F3F46] ${
                  highlighted === index ? 'bg-[#3F3F46]' : ''
                }`}
              >
                <button
                  type='button'
                  aria-label={`Preview ${voice.name}`}
                  onClick={event => preview(voice.previewUrl, event)}
                  className='flex items-center justify-center rounded-full bg-white/20 p-1.5'
                >
                  {playingUrl === voice.previewUrl ? (
                    <Pause className='ml-0.5 h-3 w-3 text-white' />
                  ) : (
                    <Play className='ml-0.5 h-3 w-3 text-white' />
                  )}
                </button>
                <div className='min-w-0 flex-1'>
                  <div className='text-sm font-medium text-white'>{voice.name}</div>
                  <div className='text-xs text-gray-300'>{voice.description}</div>
                </div>
                {selectedVoice === voice.id && <Check className='h-4 w-4 flex-shrink-0 text-white' />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
