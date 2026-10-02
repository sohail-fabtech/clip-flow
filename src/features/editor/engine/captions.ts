export interface Cue {
  start: number;
  end: number;
  text: string;
}

const TIME = /(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;

function parseTime(value: string) {
  const match = value.match(TIME);
  if (!match) return null;
  const [, h = '0', m, s, ms] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms.padEnd(3, '0')) / 1000;
}

export function parseSubtitles(source: string): Cue[] {
  const blocks = source
    .replace(/\r/g, '')
    .replace(/^WEBVTT[^\n]*\n/, '')
    .split(/\n{2,}/);
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    const timingIndex = lines.findIndex(line => line.includes('-->'));
    if (timingIndex === -1) continue;
    const [from, to] = lines[timingIndex].split('-->');
    const start = parseTime(from);
    const end = parseTime(to);
    const text = lines
      .slice(timingIndex + 1)
      .join('\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (start !== null && end !== null && end > start && text) cues.push({ start, end, text });
  }
  return cues;
}

function formatTime(seconds: number, separator: ',' | '.') {
  const ms = Math.round(seconds * 1000);
  const pad = (value: number, length = 2) => String(value).padStart(length, '0');
  return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${separator}${pad(ms % 1000, 3)}`;
}

export function formatSrt(cues: Cue[]) {
  return cues
    .map((cue, i) => `${i + 1}\n${formatTime(cue.start, ',')} --> ${formatTime(cue.end, ',')}\n${cue.text}\n`)
    .join('\n');
}

export function formatVtt(cues: Cue[]) {
  return `WEBVTT\n\n${cues.map(cue => `${formatTime(cue.start, '.')} --> ${formatTime(cue.end, '.')}\n${cue.text}\n`).join('\n')}`;
}
