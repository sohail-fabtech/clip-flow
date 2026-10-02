import { Icons } from '@/components/shared/icons';
import React from 'react';
import PropertieItem from '@/features/editor/control-item/properties/property-item';

const MENU_ITEMS = [
  {
    id: 'image-basic',
    icon: Icons.camera,
    label: 'Basic',
    ariaLabel: 'Add and manage basic',
  },
  {
    id: 'image-color',
    icon: Icons.color,
    label: 'Colors',
    ariaLabel: 'Add and manage color',
  },
  {
    id: 'image-crop',
    icon: Icons.background,
    label: 'Crop',
    ariaLabel: 'Add and manage crop',
  },
  {
    id: 'image-filter',
    icon: Icons.filters,
    label: 'Filter',
    ariaLabel: 'Add and manage filter',
  },
  // {
  //   id: 'image-smart',
  //   icon: Icons.AI,
  //   label: 'Smart Tools',
  //   ariaLabel: 'Add and manage smart tools',
  // },
];

function ImagePropertieItems() {
  return <PropertieItem MENU_ITEMS={MENU_ITEMS} />;
}

export default ImagePropertieItems;
