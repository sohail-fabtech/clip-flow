import { useEffect, useRef, useState } from 'react';
import { dispatch } from '@designcombo/events';
import StateManager, { DESIGN_LOAD } from '@designcombo/state';
import type { TrackItem } from '@/features/editor/types';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Navbar from '@/features/editor/components/navbar';
import MenuList from '@/features/editor/components/menu-list';
import MenuListHorizontal from '@/features/editor/components/menu-list-horizontal';
import ControlItemHorizontal from '@/features/editor/components/control-item-horizontal';
import Properties from '@/features/editor/components/properties';
import Resize from '@/features/editor/components/resize';
import Timeline from '@/features/editor/timeline';
import Scene, { type SceneHandle } from '@/features/editor/scene';
import CropModal from '@/features/editor/crop-modal/crop-modal';
import { MenuItem } from '@/features/editor/menu-item/menu-item';
import FloatingControl from '@/features/editor/control-item/floating-controls/floating-control';
import useStore from '@/features/editor/stores/use-store';
import useDataState from '@/features/editor/stores/use-data-state';
import useLayoutStore from '@/features/editor/stores/use-layout-store';
import useTimelineEvents from '@/features/editor/hooks/use-timeline-events';
import { useIsLargeScreen } from '@/features/editor/hooks/use-media-query';
import { fontsOfDesign, getCompactFontData, loadFonts } from '@/features/editor/utils/fonts';
import { loadProject } from '@/features/editor/services/project';
import { SECONDARY_FONT, SECONDARY_FONT_URL } from '@/features/editor/constants/constants';
import { FONTS } from '@/features/editor/data/fonts';

const stateManager = new StateManager(
  { size: { width: 1080, height: 1920 } },
  { cors: { audio: false, video: false, image: false } },
);

const TIMELINE_CHROME = { height: 90, width: 40 };

function Editor() {
  const [projectName, setProjectName] = useState('Untitled video');
  const [trackItem, setTrackItem] = useState<TrackItem | null>(null);
  const sceneRef = useRef<SceneHandle>(null);
  const { timeline, playerRef, activeIds, trackItemsMap } = useStore();
  const {
    setTrackItem: setLayoutTrackItem,
    setFloatingControl,
    setLabelControlItem,
    setTypeControlItem,
  } = useLayoutStore();
  const { setCompactFonts, setFonts } = useDataState();
  const isLargeScreen = useIsLargeScreen();

  useTimelineEvents();

  useEffect(() => {
    setCompactFonts(getCompactFontData(FONTS));
    setFonts(FONTS);
    loadFonts([{ name: SECONDARY_FONT, url: SECONDARY_FONT_URL }]);
  }, [setCompactFonts, setFonts]);

  useEffect(() => {
    if (!timeline) return;
    const saved = loadProject();
    if (!saved) return;
    setProjectName(saved.name);
    loadFonts(fontsOfDesign(saved.design));
    dispatch(DESIGN_LOAD, { payload: saved.design });
  }, [timeline]);

  useEffect(() => {
    const resizeTimeline = () => {
      const container = document.getElementById('timeline-container');
      if (!container) return;
      timeline?.resize(
        {
          height: container.clientHeight - TIMELINE_CHROME.height,
          width: container.clientWidth - TIMELINE_CHROME.width,
        },
        { force: true },
      );
      sceneRef.current?.recalculateZoom();
    };
    const container = document.getElementById('timeline-container');
    const observer = new ResizeObserver(resizeTimeline);
    if (container) observer.observe(container);
    window.addEventListener('resize', resizeTimeline);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeTimeline);
    };
  }, [timeline]);

  useEffect(() => {
    const selected = activeIds.length === 1 ? ((trackItemsMap[activeIds[0]] as TrackItem | undefined) ?? null) : null;
    setTrackItem(selected);
    setLayoutTrackItem(selected);
  }, [activeIds, trackItemsMap, setLayoutTrackItem]);

  useEffect(() => {
    setFloatingControl('');
    setLabelControlItem('');
    setTypeControlItem('');
  }, [isLargeScreen, setFloatingControl, setLabelControlItem, setTypeControlItem]);

  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden bg-background'>
      <Navbar projectName={projectName} stateManager={stateManager} setProjectName={setProjectName} />

      <div className='relative flex flex-1 overflow-hidden bg-[#0E0E11]'>
        {isLargeScreen && (
          <div className='flex flex-none border-r border-[var(--foreground)] bg-background'>
            <MenuList />
            <MenuItem />
          </div>
        )}

        <div className='flex min-w-0 flex-1 flex-col'>
          <ResizablePanelGroup orientation='vertical' className='flex-1'>
            <ResizablePanel className='relative' defaultSize='70%'>
              <FloatingControl />
              <div className='relative flex h-full flex-1 overflow-hidden'>
                <CropModal />
                <Scene ref={sceneRef} stateManager={stateManager} />
                <Resize />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel minSize={50} defaultSize={300}>
              {playerRef && <Timeline stateManager={stateManager} />}
            </ResizablePanel>
          </ResizablePanelGroup>
          {!isLargeScreen && (trackItem ? <ControlItemHorizontal /> : <MenuListHorizontal />)}
        </div>
        <Properties />
      </div>
    </div>
  );
}

export default Editor;
