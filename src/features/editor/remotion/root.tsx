import { Composition } from 'remotion';
import { EditorComposition, type CompositionProps } from '@/features/editor/render/composition';
import { projectDuration } from '@/features/editor/engine/edits';
import { createProject } from '@/features/editor/model/defaults';
import { COMPOSITION_ID } from '@/features/editor/remotion/constants';

export const RemotionRoot = () => (
  <Composition
    id={COMPOSITION_ID}
    component={EditorComposition}
    defaultProps={{ project: createProject() } satisfies CompositionProps}
    calculateMetadata={({ props: { project } }) => ({
      fps: project.settings.fps,
      width: project.settings.width,
      height: project.settings.height,
      durationInFrames: Math.max(1, projectDuration(project)),
    })}
  />
);
