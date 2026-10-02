import { Pattern, Trimmable, timeMsToUnits, unitsToTimeMs, type TrimmableProps } from '@designcombo/timeline';
import type { MP4Clip } from '@designcombo/frames';
import ThumbnailCache from '@/features/editor/utils/thumbnail-cache';
import { calculateOffscreenSegments, calculateThumbnailSegmentLayout } from '@/features/editor/utils/filmstrip';
import { SECONDARY_FONT } from '@/features/editor/constants/constants';

interface Filmstrip {
  offset: number;
  startTime: number;
  thumbnailsCount: number;
  widthOnScreen: number;
  segmentIndex?: number;
}

type VideoProps = TrimmableProps<{
  duration: number;
  src: string;
  aspectRatio: number;
  metadata: { previewUrl?: string };
}>;

const EMPTY_FILMSTRIP: Filmstrip = { offset: 0, startTime: 0, thumbnailsCount: 0, widthOnScreen: 0 };

const withCacheBuster = (url: string) =>
  /^(data|blob):/.test(url) ? url : `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;

const loadImage = (src: string, crossOrigin = false) =>
  new Promise<HTMLImageElement | null>(resolve => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

class Video extends Trimmable {
  static type = 'Video';
  clip: MP4Clip | null = null;
  hasSrc = true;
  prevDuration = 0;
  itemType = 'video';
  playbackRate = 1;
  declare metadata: VideoProps['metadata'];

  aspectRatio = 1;
  scrollLeft = 0;
  thumbnailsPerSegment = 0;
  segmentSize = 0;

  offscreenSegments = 0;
  thumbnailWidth = 0;
  thumbnailHeight = 40;
  isFetchingThumbnails = false;
  thumbnailCache = new ThumbnailCache();

  currentFilmstrip: Filmstrip = EMPTY_FILMSTRIP;
  nextFilmstrip: Filmstrip = { ...EMPTY_FILMSTRIP, segmentIndex: 0 };
  loadingFilmstrip: Filmstrip = EMPTY_FILMSTRIP;

  offscreenCanvas: OffscreenCanvas | null = null;
  offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
  isDirty = true;
  fallbackSegmentIndex = 0;
  fallbackSegmentsCount = 0;
  previewUrl = '';

  constructor(props: VideoProps) {
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
    this.previewUrl = props.metadata.previewUrl ?? '';
    this.initOffscreenCanvas();
    this.initialize();
  }

  initOffscreenCanvas() {
    if (!this.offscreenCanvas) {
      this.offscreenCanvas = new OffscreenCanvas(Math.max(1, this.width), Math.max(1, this.height));
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
    try {
      const response = await fetch(this.src);
      if (!response.ok || !response.body) throw new Error(`Failed to load ${this.src}`);
      const { MP4Clip } = await import('@designcombo/frames');
      this.clip = new MP4Clip(response.body);
    } catch {
      this.clip = null;
    }
  }

  calculateFilmstripDimensions({ segmentIndex, widthOnScreen }: { segmentIndex: number; widthOnScreen: number }) {
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
    if (!this.previewUrl) return;
    const img = await loadImage(withCacheBuster(this.previewUrl), true);
    if (!img) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const aspectRatio = img.width / img.height;
    canvas.height = this.thumbnailHeight;
    canvas.width = Math.round(this.thumbnailHeight * aspectRatio);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const resized = await loadImage(canvas.toDataURL());
    if (!resized) return;
    this.aspectRatio = aspectRatio;
    this.thumbnailWidth = canvas.width;
    this.thumbnailCache.setThumbnail('fallback', resized);
  }

  generateTimestamps(startTime: number, count: number) {
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

  async loadThumbnailBatch(thumbnails: { ts: number; img: Blob }[]) {
    await Promise.all(
      thumbnails.map(async ({ ts, img }) => {
        if (this.thumbnailCache.getThumbnail(ts)) return;
        const url = URL.createObjectURL(img);
        const image = await loadImage(url);
        URL.revokeObjectURL(url);
        if (image) this.thumbnailCache.setThumbnail(ts, image);
      }),
    );
  }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    ctx.save();
    ctx.translate(-this.width / 2, -this.height / 2);
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.clip();
    this.renderToOffscreen();
    if (Math.floor(this.width) > 0 && this.offscreenCanvas) ctx.drawImage(this.offscreenCanvas, 0, 0);
    ctx.restore();
    this.updateSelected(ctx);
  }

  setDuration(duration: number) {
    this.duration = duration;
    this.prevDuration = duration;
  }

  async setSrc(src: string) {
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

  renderToOffscreen(force?: boolean) {
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

  drawTextIdentity(ctx: CanvasRenderingContext2D) {
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

  setSelected(selected: boolean) {
    this.isSelected = selected;
    this.set({ dirty: true });
  }

  calculateWidthOnScreen() {
    const canvasEl = document.getElementById('designcombo-timeline-canvas');
    const canvasWidth = canvasEl?.clientWidth;
    const scrollLeft = this.scrollLeft;
    if (!canvasWidth) return 0;
    const timelineWidth = canvasWidth;
    const cutFromBottomEdge = Math.max(timelineWidth - (this.width + this.left + scrollLeft), 0);
    const visibleHeight = Math.min(timelineWidth - this.left - scrollLeft, timelineWidth);
    return Math.max(visibleHeight - cutFromBottomEdge, 0);
  }

  onScrollChange({ scrollLeft, force }: { scrollLeft: number; force?: boolean }) {
    const offscreenWidth = Math.abs(Math.min(this.left + scrollLeft, 0));
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
      const widthOnScreen = this.calculateWidthOnScreen();
      const { filmstripOffset, filmstripStartTime, filmstrimpThumbnailsCount } = this.calculateFilmstripDimensions({
        widthOnScreen,
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
