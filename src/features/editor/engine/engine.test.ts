import { test } from 'node:test';
import assert from 'node:assert/strict';
import { produceWithPatches, applyPatches, enablePatches } from 'immer';
import { createProject, clipFromAsset } from '@/features/editor/model/defaults';
import type { Asset, Project } from '@/features/editor/model/types';
import {
  clipEnd,
  deleteClips,
  detachAudio,
  moveClips,
  placeClip,
  rippleInsert,
  splitClip,
  trackClips,
  trimEnd,
  trimStart,
} from '@/features/editor/engine/edits';
import { interpolate } from '@/features/editor/engine/keyframes';
import { snap } from '@/features/editor/engine/snapping';
import { formatSrt, formatVtt, parseSubtitles } from '@/features/editor/engine/captions';

enablePatches();

const asset: Asset = {
  id: 'a1',
  kind: 'video',
  name: 'clip.mp4',
  src: '/clip.mp4',
  folderId: null,
  durationSec: 10,
  width: 1920,
  height: 1080,
  hasAudio: true,
  size: 1,
  createdAt: 0,
};

function setup() {
  const project = createProject();
  project.assets[asset.id] = asset;
  const v1 = project.tracks.find(t => t.name === 'V1')!;
  const clip = clipFromAsset(asset, v1.id, 0, 30);
  placeClip(project, clip);
  return { project, v1, clip: project.clips[clip.id] };
}

test('split keeps total duration and advances source in', () => {
  const { project, clip } = setup();
  const [rightId] = splitClip(project, clip.id, 100);
  const right = project.clips[rightId];
  assert.equal(clip.duration, 100);
  assert.equal(right.start, 100);
  assert.equal(right.duration, 200);
  assert.equal(right.kind === 'video' && right.sourceIn, 100);
});

test('trim respects source bounds', () => {
  const { project, clip } = setup();
  trimEnd(project, clip.id, 1000);
  assert.equal(clip.duration, 300);
  trimStart(project, clip.id, 30);
  assert.equal(clip.start, 30);
  assert.equal(clip.duration, 270);
  trimStart(project, clip.id, -50);
  assert.equal(clip.start, 0);
});

test('placing over an existing clip overwrites the range', () => {
  const { project, v1, clip } = setup();
  const other = clipFromAsset(asset, v1.id, 100, 30);
  other.duration = 50;
  placeClip(project, other);
  const clips = trackClips(project, v1.id);
  assert.deepEqual(
    clips.map(c => [c.start, clipEnd(c)]),
    [
      [0, 100],
      [100, 150],
      [150, 300],
    ],
  );
  assert.equal(clip.duration, 100);
});

test('ripple delete closes the gap on the track', () => {
  const { project, v1, clip } = setup();
  const [rightId] = splitClip(project, clip.id, 100);
  deleteClips(project, [clip.id], true);
  assert.equal(project.clips[rightId].start, 0);
  assert.equal(trackClips(project, v1.id).length, 1);
});

test('ripple insert pushes later clips', () => {
  const { project, v1, clip } = setup();
  const insert = clipFromAsset(asset, v1.id, 0, 30);
  insert.duration = 60;
  rippleInsert(project, insert);
  assert.equal(clip.start, 60);
});

test('move to another track and detach audio links clips', () => {
  const { project, clip } = setup();
  const v2 = project.tracks.find(t => t.name === 'V2')!;
  moveClips(project, [{ id: clip.id, start: 15, trackId: v2.id }]);
  assert.equal(clip.trackId, v2.id);
  const audioId = detachAudio(project, clip.id)!;
  assert.equal(project.clips[audioId].linkId, clip.linkId);
  assert.equal(clip.kind === 'video' && clip.muted, true);
});

test('undo through immer patches restores the project', () => {
  const { project, clip } = setup();
  const [next, , inverse] = produceWithPatches(project, (draft: Project) => {
    splitClip(draft, clip.id, 50);
  });
  assert.equal(Object.keys(next.clips).length, 2);
  const restored = applyPatches(next, inverse);
  assert.deepEqual(restored, project);
});

test('keyframe interpolation and snapping', () => {
  const frames = [
    { frame: 0, value: 0, easing: 'linear' as const },
    { frame: 10, value: 100, easing: 'linear' as const },
  ];
  assert.equal(interpolate(frames, 5, 0), 50);
  assert.equal(interpolate(frames, 20, 0), 100);
  assert.equal(interpolate(undefined, 5, 7), 7);
  assert.deepEqual(snap([98], [0, 100], 5), { delta: 2, at: 100 });
  assert.equal(snap([50], [0, 100], 5), null);
});

test('subtitles round trip', () => {
  const srt = '1\n00:00:01,000 --> 00:00:02,500\nHello <b>world</b>\n\n2\n00:00:03,000 --> 00:00:04,000\nBye\n';
  const cues = parseSubtitles(srt);
  assert.deepEqual(cues, [
    { start: 1, end: 2.5, text: 'Hello world' },
    { start: 3, end: 4, text: 'Bye' },
  ]);
  assert.deepEqual(parseSubtitles(formatVtt(cues)), cues);
  assert.deepEqual(parseSubtitles(formatSrt(cues)), cues);
});
