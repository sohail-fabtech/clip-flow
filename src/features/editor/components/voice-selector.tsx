import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { ChevronDown, Play, Pause, Check } from 'lucide-react';
import { VOICE_DATA } from '@/features/editor/data/voice-data';

export function VoiceSelector({ selectedVoice, onVoiceSelect }) {
  // Configurable UI values to avoid hardcoding
  const DROPDOWN_Z_INDEX = 9999;
  const DROPDOWN_MAX_HEIGHT_PX = 256; // Tailwind max-h-64
  const DROPDOWN_SCROLL_MAX_HEIGHT_PX = 192; // Tailwind max-h-48
  const DROPDOWN_MIN_WIDTH_PX = 250; // Tailwind min-w-[250px]

  // Reused className fragments (keeping existing CSS intact)
  const DROPDOWN_CONTAINER_CLS = `absolute top-full left-0 right-0 z-[${DROPDOWN_Z_INDEX}] bg-[#27272A] border border-[#3F3F46] rounded-md shadow-lg max-h-64 overflow-hidden min-w-[${DROPDOWN_MIN_WIDTH_PX}px] mt-1`;
  const DROPDOWN_SCROLL_CLS = 'max-h-48 overflow-y-auto scrollbar-hide';
  const ITEM_BASE_CLS = 'flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#3F3F46] transition-colors';
  const ITEM_ACTIVE_BG_CLS = 'bg-[#3F3F46]';

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingUrl, setPlayingUrl] = useState(null);

  const voices = VOICE_DATA; // alias for readability
  const voicesLength = voices.length;

  const handleVoiceSelect = useCallback(
    voiceId => {
      onVoiceSelect(voiceId);
      setIsOpen(false);
      setHighlightedIndex(0);
    },
    [onVoiceSelect],
  );

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = event => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => (prev < voicesLength - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : voicesLength - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < voicesLength) {
            handleVoiceSelect(voices[highlightedIndex].id);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, voices, voicesLength, handleVoiceSelect]);

  const selectedVoiceData = useMemo(() => {
    return voices.find(v => v.id === selectedVoice) || voices[0];
  }, [voices, selectedVoice]);

  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayingUrl(null);
  }, []);

  useEffect(() => {
    // Create a single reusable Audio instance
    audioRef.current = new Audio();
    const handleEnded = () => {
      setIsPlaying(false);
      setPlayingUrl(null);
    };
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.src = '';
      audioRef.current = null;
    };
  }, []);

  const handlePreview = useCallback(
    async (voiceUrl, event) => {
      if (event) event.stopPropagation();
      try {
        const audio = audioRef.current;
        if (!audio) return;

        if (playingUrl === voiceUrl) {
          if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
          } else {
            await audio.play();
            setIsPlaying(true);
          }
          return;
        }

        stopCurrentAudio();
        audio.src = voiceUrl;
        setPlayingUrl(voiceUrl);
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        // Fail gracefully on preview errors
        stopCurrentAudio();
      }
    },
    [isPlaying, playingUrl, stopCurrentAudio],
  );

  const handleMouseEnter = useCallback(index => setHighlightedIndex(index), []);
  const handleMouseLeave = useCallback(() => setHighlightedIndex(0), []);

  // List Item component
  const ListItem = memo(
    ({
      voice,
      index,
      isHighlighted,
      isSelected,
      isPlaying,
      playingUrl,
      onSelect,
      onHover,
      onMouseLeave,
      onPreview,
    }) => {
      const activeCls = isHighlighted ? ITEM_ACTIVE_BG_CLS : '';
      return (
        <div
          key={voice.id}
          onClick={() => onSelect(voice.id)}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={onMouseLeave}
          className={`${ITEM_BASE_CLS} ${activeCls}`}
          role='option'
          aria-selected={isSelected}
        >
          <div className='rounded-full flex items-center justify-center cursor-pointer bg:white/20 bg-white/20 p-1.5'>
            {playingUrl === voice.previewUrl && isPlaying ? (
              <Pause className='w-3 h-3 text-white ml-0.5' onClick={e => onPreview(voice.previewUrl, e)} />
            ) : (
              <Play className='w-3 h-3 text-white ml-0.5' onClick={e => onPreview(voice.previewUrl, e)} />
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='text-sm font-medium text-white'>{voice.name}</div>
            <div className='text-xs text-gray-300'>{voice.description}</div>
          </div>

          <div className='flex items-center gap-2'>
            {isSelected && <Check className='w-4 h-4 text-white flex-shrink-0' />}
          </div>
        </div>
      );
    },
  );

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Voice Selection Header */}
      <div className='flex flex-col gap-2 mb-3'>
        <p className='text-sm text-white'>Speaker voice</p>

        {/* Current Selection Button */}
        <button
          onClick={toggleDropdown}
          className='flex items-center justify-between w-full px-3 py-2 bg-[#3F3F46] hover:bg-[#52525B] rounded-md transition-colors'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center'>
              <Play className='w-3 h-3 text-white ml-0.5' />
            </div>
            <span className='text-white text-sm font-medium'>{selectedVoiceData.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Voice Library */}
      {isOpen && (
        <div
          className={DROPDOWN_CONTAINER_CLS}
          role='listbox'
          aria-activedescendant={voices[highlightedIndex]?.id}
          style={{ maxHeight: DROPDOWN_MAX_HEIGHT_PX, minWidth: DROPDOWN_MIN_WIDTH_PX }}
        >
          <div className={DROPDOWN_SCROLL_CLS} style={{ maxHeight: DROPDOWN_SCROLL_MAX_HEIGHT_PX }}>
            {voices.map((voice, index) => (
              <ListItem
                key={voice.id}
                voice={voice}
                index={index}
                isHighlighted={highlightedIndex === index}
                isSelected={selectedVoice === voice.id}
                isPlaying={isPlaying}
                playingUrl={playingUrl}
                onSelect={handleVoiceSelect}
                onHover={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onPreview={handlePreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
