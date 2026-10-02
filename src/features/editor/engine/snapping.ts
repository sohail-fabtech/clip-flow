import type { Project } from '@/features/editor/model/types';
import { clipEnd } from '@/features/editor/engine/edits';

export function snapPoints(project: Project, exclude: Set<string>, playhead: number) {
  const points = new Set<number>([0, playhead]);
  for (const clip of Object.values(project.clips)) {
    if (exclude.has(clip.id)) continue;
    points.add(clip.start);
    points.add(clipEnd(clip));
  }
  for (const marker of project.markers) points.add(marker.frame);
  if (project.inPoint !== null) points.add(project.inPoint);
  if (project.outPoint !== null) points.add(project.outPoint);
  return [...points];
}

export function snap(values: number[], points: number[], threshold: number) {
  let best: { delta: number; at: number } | null = null;
  for (const value of values) {
    for (const point of points) {
      const delta = point - value;
      if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta)))
        best = { delta, at: point };
    }
  }
  return best;
}
