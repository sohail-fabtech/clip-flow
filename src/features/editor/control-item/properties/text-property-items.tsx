import { Icons } from '@/components/shared/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import PropertieItem from '@/features/editor/control-item/properties/property-item';

const MENU_ITEMS = [
  {
    id: 'text-basic',
    icon: Icons.text,
    label: 'Basic',
    ariaLabel: 'Add and manage basic',
  },
  {
    id: 'text-presets',
    icon: Icons.presets,
    label: 'Presets',
    ariaLabel: 'Add and manage presets',
  },
  {
    id: 'text-smart',
    icon: Icons.AI,
    label: 'Smart Tools',
    ariaLabel: 'Add and manage smart tools',
  },
];

function TextPropertieItems() {
  return <PropertieItem MENU_ITEMS={MENU_ITEMS} />;
}

export default TextPropertieItems;
