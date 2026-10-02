import type { ComponentType } from 'react';
import { Audio, Image, Text, Video } from '@/features/editor/player/items';
import type { SequenceItemProps } from '@/features/editor/player/base-sequence';

export const SequenceItem: Record<string, ComponentType<SequenceItemProps>> = {
  text: Text,
  video: Video,
  audio: Audio,
  image: Image,
};
