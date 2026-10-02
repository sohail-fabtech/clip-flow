import { create } from 'zustand';

type Area = [number, number, number, number];

interface CropStore {
  area: Area;
  src: string;
  step: number;
  fileLoading: boolean;
  scale: number;
  element: HTMLImageElement | HTMLVideoElement | undefined;
  size: { width: number; height: number };
  reset: () => void;
  clear: () => void;
  setArea: (area: Area) => void;
  setStep: (step: number) => void;
  loadImage: (src: string) => void;
  loadVideo: (src: string) => void;
}

const fitScale = (width: number, height: number, maxWidth: number, maxHeight: number) =>
  Math.min(maxWidth / width, maxHeight / height);

const useCropStore = create<CropStore>(set => ({
  area: [0, 0, 0, 0],
  src: '',
  step: 0,
  fileLoading: false,
  scale: 1,
  element: undefined,
  size: { width: 0, height: 0 },
  reset: () =>
    set(({ element, size, scale }) => {
      if (element instanceof HTMLVideoElement) {
        element.currentTime = 0;
        element.pause();
      }
      return { area: [0, 0, size.width * scale, size.height * scale] };
    }),
  clear: () =>
    set({
      area: [0, 0, 0, 0],
      src: '',
      size: { width: 0, height: 0 },
      fileLoading: false,
      element: undefined,
    }),
  setArea: area => set({ area }),
  setStep: step => set({ step }),
  loadImage: src => {
    const image = document.createElement('img');
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => {
      const { naturalWidth: width, naturalHeight: height } = image;
      const scale = fitScale(width, height, 700, 520);
      set({
        area: [0, 0, width * scale, height * scale],
        src,
        size: { width, height },
        element: image,
        scale,
      });
    });
    image.src = src;
  },
  loadVideo: src => {
    set({ area: [0, 0, 0, 0], src });
    const video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'metadata';
    video.autoplay = false;
    video.crossOrigin = 'anonymous';
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = 0.01;
      const { videoWidth: width, videoHeight: height } = video;
      const scale = fitScale(width, height, 520, 400);
      set({
        element: video,
        scale,
        size: { width, height },
        area: [0, 0, width * scale, height * scale],
      });
    });
    video.addEventListener('canplay', () => set({ fileLoading: false, step: 1 }));
    video.addEventListener('ended', () => {
      video.currentTime = 0;
    });
    video.src = src;
  },
}));

export default useCropStore;
