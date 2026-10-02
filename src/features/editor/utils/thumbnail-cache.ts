type Key = number | 'fallback';

const MAX_SIZE = 500;

export default class ThumbnailCache {
  private cache = new Map<Key, HTMLImageElement>();

  setThumbnail(key: Key, img: HTMLImageElement) {
    this.cache.delete(key);
    this.cache.set(key, img);
    if (this.cache.size > MAX_SIZE) this.cache.delete(this.cache.keys().next().value!);
  }

  getThumbnail(key: Key) {
    const img = this.cache.get(key);
    if (img) this.setThumbnail(key, img);
    return img;
  }

  clearCacheButFallback() {
    const fallback = this.cache.get('fallback');
    this.cache.clear();
    if (fallback) this.cache.set('fallback', fallback);
  }
}
