import { useEffect } from 'react';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import usePropertiesStore from '@/features/editor/stores/use-property-store';
import { PROPERTY_MENUS, PropertyMenu } from '@/features/editor/control-item/properties/property-menu';
import PropertiesItemsList from '@/features/editor/control-item/properties/property-items-list';

function Properties() {
  const trackItem = useLayoutStore(state => state.trackItem);
  const resetProperties = usePropertiesStore(state => state.resetProperties);

  useEffect(() => {
    if (!trackItem) resetProperties();
  }, [trackItem, resetProperties]);

  const items = trackItem && PROPERTY_MENUS[trackItem.type];
  if (!items) return null;

  return (
    <>
      <PropertyMenu items={items} />
      <PropertiesItemsList />
    </>
  );
}

export default Properties;
