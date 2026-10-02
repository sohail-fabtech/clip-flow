export type StockKind = 'image' | 'video';

export interface StockItem {
  id: string;
  type: StockKind;
  preview: string;
  details: { src: string; width: number; height: number; duration?: number };
}

export interface StockPage {
  items: StockItem[];
  page: number;
  hasNextPage: boolean;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  src: { large2x: string; medium: string };
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  image: string;
  video_files: { link: string; quality: string }[];
  video_pictures: { picture: string }[];
}

const ENDPOINTS: Record<StockKind, { search: string; featured: string; perPage: number }> = {
  image: { search: 'v1/search', featured: 'v1/curated', perPage: 20 },
  video: { search: 'videos/search', featured: 'videos/popular', perPage: 15 },
};

const fromPhoto = (photo: PexelsPhoto): StockItem => ({
  id: `pexels_${photo.id}`,
  type: 'image',
  preview: photo.src.medium,
  details: { src: photo.src.large2x, width: photo.width, height: photo.height },
});

const fromVideo = (video: PexelsVideo): StockItem => {
  const file = video.video_files.find(f => f.quality === 'hd' || f.quality === 'sd') ?? video.video_files[0];
  return {
    id: `pexels_video_${video.id}`,
    type: 'video',
    preview: video.video_pictures[0]?.picture ?? video.image,
    details: { src: file?.link ?? '', width: video.width, height: video.height, duration: video.duration },
  };
};

export async function fetchStock(kind: StockKind, query: string, page: number): Promise<StockPage> {
  const endpoint = ENDPOINTS[kind];
  const params = new URLSearchParams({ page: String(page), per_page: String(endpoint.perPage) });
  if (query) params.set('query', query);

  const response = await fetch(`/api/pexels/${query ? endpoint.search : endpoint.featured}?${params}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Failed to load stock media');

  return {
    items: kind === 'image' ? body.photos.map(fromPhoto) : body.videos.map(fromVideo),
    page: body.page,
    hasNextPage: Boolean(body.next_page),
  };
}
