import { Icons } from '@/components/shared/icons';
import React from 'react';
import PropertieItem from '@/features/editor/control-item/properties/property-item';

const MENU_ITEMS = [
  {
    id: 'audio-basic',
    icon: Icons.music,
    label: 'Basic',
    ariaLabel: 'Add and manage basic',
  },
];

function AudioPropertieItems() {
  return <PropertieItem MENU_ITEMS={MENU_ITEMS} />;
}

export default AudioPropertieItems;
