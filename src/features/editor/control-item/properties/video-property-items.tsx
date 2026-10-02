import { Icons } from '@/components/shared/icons';
import React from 'react';
import PropertieItem from '@/features/editor/control-item/properties/property-item';

const MENU_ITEMS = [
  {
    id: 'video-basic',
    icon: Icons.film,
    label: 'Basic',
    ariaLabel: 'Add and manage basic',
  },
  {
    id: 'video-color',
    icon: Icons.color,
    label: 'Colors',
    ariaLabel: 'Add and manage color',
  },
  {
    id: 'video-crop',
    icon: Icons.background,
    label: 'Crop',
    ariaLabel: 'Add and manage crop',
  },
  {
    id: 'video-filter',
    icon: Icons.filters,
    label: 'Filter',
    ariaLabel: 'Add and manage filter',
  },
  // {
  //   id: 'video-smart',
  //   icon: Icons.AI,
  //   label: 'Smart Tools',
  //   ariaLabel: 'Add and manage smart tools',
  // },
];

function VideoPropertieItems() {
  return <PropertieItem MENU_ITEMS={MENU_ITEMS} />;
}

export default VideoPropertieItems;
