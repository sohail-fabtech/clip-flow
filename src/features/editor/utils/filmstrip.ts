const SEGMENT_WIDTH = 1200;

export const calculateThumbnailSegmentLayout = (thumbnailWidth: number) => {
  const thumbnailsPerSegment = Math.floor(SEGMENT_WIDTH / thumbnailWidth);
  return { thumbnailsPerSegment, segmentSize: thumbnailsPerSegment * thumbnailWidth };
};

export const calculateOffscreenSegments = (offscreenWidth: number, trimFromSize: number, segmentSize: number) =>
  Math.floor((offscreenWidth + trimFromSize) / segmentSize);
