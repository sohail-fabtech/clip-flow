import TimelineBase from '@designcombo/timeline';
import { throttle } from 'lodash';
import Video from '@/features/editor/timeline/items/video';
import Audio from '@/features/editor/timeline/items/audio';

class Timeline extends TimelineBase {
  calcBounding() {
    if (this.getTrackItems().length > 0) super.calcBounding();
  }

  setViewportPos(posX: number, posY: number) {
    const limitedPos = this.getViewportPos(posX, posY);
    const vt = this.viewportTransform;
    vt[4] = limitedPos.x;
    vt[5] = limitedPos.y;
    this.requestRenderAll();
    this.setActiveTrackItemCoords();
    this.onScrollChange();
    this.onScroll?.({ scrollTop: limitedPos.y, scrollLeft: limitedPos.x - this.spacing.left });
  }

  onScrollChange = throttle(() => {
    const scrollLeft = this.viewportTransform[4];
    for (const object of this.getObjects()) {
      if (object instanceof Video || object instanceof Audio) object.onScrollChange({ scrollLeft });
    }
  }, 250);

  scrollTo({ scrollLeft, scrollTop }: { scrollLeft?: number; scrollTop?: number }) {
    if (typeof scrollLeft !== 'number' && typeof scrollTop !== 'number') return;
    const vt = this.viewportTransform;
    if (typeof scrollLeft === 'number') vt[4] = -scrollLeft + this.spacing.left;
    if (typeof scrollTop === 'number') vt[5] = -scrollTop;
    this.viewportTransform = vt;
    this.getActiveObject()?.setCoords();
    this.onScrollChange();
    this.requestRenderAll();
  }
}

export default Timeline;
