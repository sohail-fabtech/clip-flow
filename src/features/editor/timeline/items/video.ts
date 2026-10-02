import { Control, Pattern, Trimmable, timeMsToUnits, unitsToTimeMs } from '@designcombo/timeline';
import ThumbnailCache from '@/features/editor/utils/thumbnail-cache';
import { calculateOffscreenSegments, calculateThumbnailSegmentLayout } from '@/features/editor/utils/filmstrip';
import { getFileFromUrl } from '@/features/editor/utils/file';
import { SECONDARY_FONT } from '@/features/editor/constants/constants';

const EMPTY_FILMSTRIP = {
  offset: 0,
  startTime: 0,
  thumbnailsCount: 0,
  widthOnScreen: 0,
};

class Video extends Trimmable {
  static type = 'Video';
  clip;
  resourceId = '';
  isSelected = false;
  hasSrc = true;
  prevDuration;
  itemType = 'video';

  aspectRatio = 1;
  scrollLeft = 0;
  thumbnailsPerSegment = 0;
  segmentSize = 0;

  offscreenSegments = 0;
  thumbnailWidth = 0;
  thumbnailHeight = 40;
  thumbnailsList = [];
  isFetchingThumbnails = false;
  thumbnailCache = new ThumbnailCache();

  currentFilmstrip = EMPTY_FILMSTRIP;
  nextFilmstrip = { ...EMPTY_FILMSTRIP, segmentIndex: 0 };
  loadingFilmstrip = EMPTY_FILMSTRIP;

  offscreenCanvas = null;
  offscreenCtx = null;
  isDirty = true;
  fallbackSegmentIndex = 0;
  fallbackSegmentsCount = 0;
  previewUrl = '';

  constructor(props) {
    super(props);
    this.id = props.id;
    this.tScale = props.tScale;
    this.objectCaching = false;
    this.rx = 4;
    this.ry = 4;
    this.display = props.display;
    this.trim = props.trim;
    this.duration = props.duration;
    this.prevDuration = props.duration;
    this.fill = '#27272a';
    this.borderOpacityWhenMoving = 1;
    this.metadata = props.metadata;
    this.aspectRatio = props.aspectRatio;
    this.src = props.src;
    this.strokeWidth = 0;
    this.transparentCorners = false;
    this.hasBorders = false;
    this.previewUrl = props.metadata.previewUrl;
    this.initOffscreenCanvas();
    this.initialize();
  }

  initOffscreenCanvas() {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }
    if (this.offscreenCanvas.width !== this.width || this.offscreenCanvas.height !== this.height) {
      this.offscreenCanvas.width = this.width;
      this.offscreenCanvas.height = this.height;
      this.isDirty = true;
    }
  }

  initDimensions() {
    this.thumbnailWidth = this.thumbnailHeight * this.aspectRatio;
    const segmentOptions = calculateThumbnailSegmentLayout(this.thumbnailWidth);
    this.thumbnailsPerSegment = segmentOptions.thumbnailsPerSegment;
    this.segmentSize = segmentOptions.segmentSize;
  }

  async initialize() {
    await this.loadFallbackThumbnail();
    this.initDimensions();
    this.onScrollChange({ scrollLeft: 0 });
    this.canvas?.requestRenderAll();
    this.createFallbackPattern();
    await this.prepareAssets();
    this.onScrollChange({ scrollLeft: 0 });
  }

  async prepareAssets() {
    const file = await getFileFromUrl(this.src);
    const stream = file.stream();
    if (typeof window !== 'undefined') {
      try {
        const { MP4Clip } = await import('@designcombo/frames');
        this.clip = new MP4Clip(stream);
      } catch (error) {
        console.warn('Failed to load MP4Clip:', error);
        this.clip = null;
      }
    } else {
      this.clip = null;
    }
  }

  calculateFilmstripDimensions({ segmentIndex, widthOnScreen }) {
    const filmstripOffset = segmentIndex * this.segmentSize;
    const shouldUseLeftBacklog = segmentIndex > 0;
    const leftBacklogSize = shouldUseLeftBacklog ? this.segmentSize : 0;
    const totalWidth = timeMsToUnits(this.duration, this.tScale, this.playbackRate);
    const rightRemainingSize = totalWidth - widthOnScreen - leftBacklogSize - filmstripOffset;
    const rightBacklogSize = Math.min(this.segmentSize, rightRemainingSize);
    const filmstripStartTime = unitsToTimeMs(filmstripOffset, this.tScale);
    const filmstrimpThumbnailsCount =
      1 + Math.round((widthOnScreen + leftBacklogSize + rightBacklogSize) / this.thumbnailWidth);
    return {
      filmstripOffset,
      leftBacklogSize,
      rightBacklogSize,
      filmstripStartTime,
      filmstrimpThumbnailsCount,
    };
  }

  async loadFallbackThumbnail() {
    const fallbackThumbnail = this.previewUrl;
    if (!fallbackThumbnail) return;
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `${fallbackThumbnail}?t=${Date.now()}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const aspectRatio = img.width / img.height;
        const targetHeight = 40;
        const targetWidth = Math.round(targetHeight * aspectRatio);
        canvas.height = targetHeight;
        canvas.width = targetWidth;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const resizedImg = new Image();
        resizedImg.src = canvas.toDataURL();
        this.aspectRatio = aspectRatio;
        this.thumbnailWidth = targetWidth;
        this.thumbnailCache.setThumbnail('fallback', resizedImg);
        resolve();
      };
    });
  }

  generateTimestamps(startTime, count) {
    const timePerThumbnail = unitsToTimeMs(this.thumbnailWidth, this.tScale, this.playbackRate);
    return Array.from({ length: count }, (_, i) => {
      const timeInFilmstripe = startTime + i * timePerThumbnail;
      return Math.ceil(timeInFilmstripe / 1000);
    });
  }

  createFallbackPattern() {
    const canvas = this.canvas;
    if (!canvas) return;
    const canvasWidth = canvas.width;
    const maxPatternSize = 12000;
    const fallbackSource = this.thumbnailCache.getThumbnail('fallback');
    if (!fallbackSource) return;
    const totalWidthNeeded = Math.min(canvasWidth * 20, maxPatternSize);
    const segmentsRequired = Math.ceil(totalWidthNeeded / this.segmentSize);
    this.fallbackSegmentsCount = segmentsRequired;
    const patternWidth = segmentsRequired * this.segmentSize;
    const offCanvas = document.createElement('canvas');
    offCanvas.height = this.thumbnailHeight;
    offCanvas.width = patternWidth;
    const context = offCanvas.getContext('2d');
    if (!context) return;
    const thumbnailsTotal = segmentsRequired * this.thumbnailsPerSegment;
    for (let i = 0; i < thumbnailsTotal; i++) {
      const x = i * this.thumbnailWidth;
      context.drawImage(fallbackSource, x, 0, this.thumbnailWidth, this.thumbnailHeight);
    }
    const fillPattern = new Pattern({
      source: offCanvas,
      repeat: 'no-repeat',
      offsetX: 0,
    });
    this.set('fill', fillPattern);
    this.canvas?.requestRenderAll();
  }

  async loadAndRenderThumbnails() {
    if (this.isFetchingThumbnails || !this.clip) return;
    this.loadingFilmstrip = { ...this.nextFilmstrip };
    this.isFetchingThumbnails = true;
    const { startTime, thumbnailsCount } = this.loadingFilmstrip;
    const timestamps = this.generateTimestamps(startTime, thumbnailsCount);
    const thumbnailsArr = await this.clip.thumbnailsList(this.thumbnailWidth, {
      timestamps: timestamps.map(timestamp => timestamp * 1e6),
    });
    const updatedThumbnails = thumbnailsArr.map(thumbnail => ({
      ts: Math.round(thumbnail.ts / 1e6),
      img: thumbnail.img,
    }));
    await this.loadThumbnailBatch(updatedThumbnails);
    this.isDirty = true;
    this.isFetchingThumbnails = false;
    this.currentFilmstrip = { ...this.loadingFilmstrip };
    requestAnimationFrame(() => {
      this.canvas?.requestRenderAll();
    });
  }

  async loadThumbnailBatch(thumbnails) {
    const loadPromises = thumbnails.map(async thumbnail => {
      if (this.thumbnailCache.getThumbnail(thumbnail.ts)) return;
      return new Promise(resolve => {
        const img = new Image();
        img.src = URL.createObjectURL(thumbnail.img);
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          this.thumbnailCache.setThumbnail(thumbnail.ts, img);
          resolve();
        };
      });
    });
    await Promise.all(loadPromises);
  }

  _render(ctx) {
    super._render(ctx);
    ctx.save();
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.clip();
    this.renderToOffscreen();
    if (Math.floor(this.width) === 0) return;
    if (!this.offscreenCanvas) return;
    ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();
    this.updateSelected(ctx);
  }

  setDuration(duration) {
    this.duration = duration;
    this.prevDuration = duration;
  }

  async setSrc(src) {
    super.setSrc(src);
    this.clip = null;
    await this.initialize();
    await this.prepareAssets();
    this.thumbnailCache.clearCacheButFallback();
    this.onScale();
  }

  onResizeSnap() {
    this.renderToOffscreen(true);
  }

  onResize() {
    this.renderToOffscreen(true);
  }

  renderToOffscreen(force) {
    if (!this.offscreenCtx) return;
    if (!this.isDirty && !force) return;
    if (!this.offscreenCanvas) return;
    this.offscreenCanvas.width = this.width;
    const ctx = this.offscreenCtx;
    const { startTime, offset, thumbnailsCount } = this.currentFilmstrip;
    const thumbnailWidth = this.thumbnailWidth;
    const thumbnailHeight = this.thumbnailHeight;
    const trimFromSize = timeMsToUnits(this.trim.from, this.tScale, this.playbackRate);
    let timeInFilmstripe = startTime;
    const timePerThumbnail = unitsToTimeMs(thumbnailWidth, this.tScale, this.playbackRate || 1);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.beginPath();
    ctx.roundRect(0, 0, this.width, this.height, this.rx);
    ctx.clip();
    for (let i = 0; i < thumbnailsCount; i++) {
      let img = this.thumbnailCache.getThumbnail(Math.ceil(timeInFilmstripe / 1000));
      if (!img) {
        img = this.thumbnailCache.getThumbnail('fallback');
      }
      if (img?.complete) {
        const xPosition = i * thumbnailWidth + offset - trimFromSize;
        ctx.drawImage(img, xPosition, 0, thumbnailWidth, thumbnailHeight);
        timeInFilmstripe += timePerThumbnail;
      }
    }
    this.isDirty = false;
  }

  drawTextIdentity(ctx) {
    const iconPath = new Path2D(
      'M16.5625 0.925L12.5 3.275V0.625L11.875 0H0.625L0 0.625V9.375L0.625 10H11.875L12.5 9.375V6.875L16.5625 9.2125L17.5 8.625V1.475L16.5625 0.925ZM11.25 8.75H1.25V1.25H11.25V8.75ZM16.25 7.5L12.5 5.375V4.725L16.25 2.5V7.5Z',
    );
    ctx.save();
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.translate(0, 14);
    ctx.font = `400 12px ${SECONDARY_FONT}`;
    ctx.fillStyle = '#f4f4f5';
    ctx.textAlign = 'left';
    ctx.clip();
    ctx.fillText('Video', 36, 10);
    ctx.translate(8, 1);
    ctx.fillStyle = '#f4f4f5';
    ctx.fill(iconPath);
    ctx.restore();
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.set({ dirty: true });
  }

  calulateWidthOnScreen() {
    const canvasEl = document.getElementById('designcombo-timeline-canvas');
    const canvasWidth = canvasEl?.clientWidth;
    const scrollLeft = this.scrollLeft;
    if (!canvasWidth) return 0;
    const timelineWidth = canvasWidth;
    const cutFromBottomEdge = Math.max(timelineWidth - (this.width + this.left + scrollLeft), 0);
    const visibleHeight = Math.min(timelineWidth - this.left - scrollLeft, timelineWidth);
    return Math.max(visibleHeight - cutFromBottomEdge, 0);
  }

  calculateOffscreenWidth({ scrollLeft }) {
    const offscreenWidth = Math.min(this.left + scrollLeft, 0);
    return Math.abs(offscreenWidth);
  }

  onScrollChange({ scrollLeft, force }) {
    const offscreenWidth = this.calculateOffscreenWidth({ scrollLeft });
    const trimFromSize = timeMsToUnits(this.trim.from, this.tScale, this.playbackRate);
    const offscreenSegments = calculateOffscreenSegments(offscreenWidth, trimFromSize, this.segmentSize);
    this.offscreenSegments = offscreenSegments;
    const segmentToDraw = offscreenSegments;
    if (this.currentFilmstrip.segmentIndex === segmentToDraw) {
      return false;
    }
    if (segmentToDraw !== this.fallbackSegmentIndex) {
      const fillPattern = this.fill;
      if (fillPattern instanceof Pattern) {
        fillPattern.offsetX = this.segmentSize * (segmentToDraw - Math.floor(this.fallbackSegmentsCount / 2));
      }
      this.fallbackSegmentIndex = segmentToDraw;
    }
    if (!this.isFetchingThumbnails || force) {
      this.scrollLeft = scrollLeft;
      const widthOnScreen = this.calulateWidthOnScreen();
      const { filmstripOffset, filmstripStartTime, filmstrimpThumbnailsCount } = this.calculateFilmstripDimensions({
        widthOnScreen: this.calulateWidthOnScreen(),
        segmentIndex: segmentToDraw,
      });
      this.nextFilmstrip = {
        segmentIndex: segmentToDraw,
        offset: filmstripOffset,
        startTime: filmstripStartTime,
        thumbnailsCount: filmstrimpThumbnailsCount,
        widthOnScreen,
      };
      this.loadAndRenderThumbnails();
    }
  }

  onScale() {
    this.currentFilmstrip = { ...EMPTY_FILMSTRIP };
    this.nextFilmstrip = { ...EMPTY_FILMSTRIP, segmentIndex: 0 };
    this.loadingFilmstrip = { ...EMPTY_FILMSTRIP };
    this.onScrollChange({ scrollLeft: this.scrollLeft, force: true });
  }
}

export default Video;
