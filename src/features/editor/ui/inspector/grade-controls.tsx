import { useMemo, useRef, useState } from 'react';
import type { CurvePoint, Wheel } from '@/features/editor/model/types';
import { sampleCurve } from '@/features/editor/render/gl/luts';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const SIZE = 236;
const HEIGHT = 180;

interface CurveEditorProps {
  channels: { key: string; label: string; color: string }[];
  curves: Record<string, CurvePoint[]>;
  onChange: (key: string, points: CurvePoint[], phase: 'live' | 'commit') => void;
  background?: string;
  hue?: boolean;
}

export function CurveEditor({ channels, curves, onChange, background, hue }: CurveEditorProps) {
  const [active, setActive] = useState(channels[0].key);
  const svgRef = useRef<SVGSVGElement>(null);
  const points = curves[active];
  const color = channels.find(c => c.key === active)!.color;
  const path = useMemo(() => {
    const samples = sampleCurve(points, 64);
    return Array.from(samples, (y, i) => `${i ? 'L' : 'M'}${(i / 63) * SIZE},${(1 - y) * HEIGHT}`).join(' ');
  }, [points]);

  const toPoint = (e: { clientX: number; clientY: number }) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height)),
    };
  };

  const drag = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    const isEnd = !hue && (index === 0 || index === points.length - 1);
    let latest = points;
    const move = (ev: PointerEvent) => {
      const p = toPoint(ev);
      latest = points.map((pt, i) => (i === index ? { x: isEnd ? pt.x : p.x, y: p.y } : pt)).sort((a, b) => a.x - b.x);
      onChange(active, latest, 'live');
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      onChange(active, latest, 'commit');
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex gap-1'>
        {channels.map(channel => (
          <button
            key={channel.key}
            type='button'
            onClick={() => setActive(channel.key)}
            className={cn('h-6 flex-1 rounded text-[11px] text-ink-3 hover:bg-white/8', active === channel.key && 'bg-white/12 text-ink')}
          >
            <span className='mr-1 inline-block size-2 rounded-full' style={{ background: channel.color }} />
            {channel.label}
          </button>
        ))}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${HEIGHT}`}
        className='w-full cursor-crosshair rounded-md border border-line'
        style={{ background: background ?? '#111214', height: HEIGHT }}
        onDoubleClick={e => {
          const p = toPoint(e);
          onChange(active, [...points, p].sort((a, b) => a.x - b.x), 'commit');
        }}
      >
        {[0.25, 0.5, 0.75].map(v => (
          <g key={v} stroke='rgba(255,255,255,0.08)'>
            <line x1={v * SIZE} y1={0} x2={v * SIZE} y2={HEIGHT} />
            <line x1={0} y1={v * HEIGHT} x2={SIZE} y2={v * HEIGHT} />
          </g>
        ))}
        {!hue && <line x1={0} y1={HEIGHT} x2={SIZE} y2={0} stroke='rgba(255,255,255,0.12)' strokeDasharray='3 3' />}
        <path d={path} fill='none' stroke={color} strokeWidth={1.5} />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x * SIZE}
            cy={(1 - p.y) * HEIGHT}
            r={4.5}
            fill='#18191c'
            stroke={color}
            strokeWidth={1.5}
            className='cursor-grab'
            onPointerDown={e => drag(i, e)}
            onContextMenu={e => {
              e.preventDefault();
              if (points.length > 2) onChange(active, points.filter((_, j) => j !== i), 'commit');
            }}
          />
        ))}
      </svg>
      <div className='text-[10px] text-ink-4'>Double-click to add a point, right-click a point to remove it.</div>
    </div>
  );
}

const PAD = 96;

export function WheelPad({ label, value, onChange }: { label: string; value: Wheel; onChange: (wheel: Wheel, phase: 'live' | 'commit') => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: { clientX: number; clientY: number }) => {
    const rect = ref.current!.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    let y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { ...value, x, y };
  };
  return (
    <div className='flex flex-col items-center gap-1.5'>
      <div
        ref={ref}
        role='slider'
        aria-label={`${label} color`}
        aria-valuenow={Math.round(Math.hypot(value.x, value.y) * 100)}
        className='relative cursor-crosshair rounded-full border border-line'
        style={{
          width: PAD,
          height: PAD,
          background:
            'radial-gradient(circle, rgba(128,128,128,1) 0%, rgba(128,128,128,0) 70%), conic-gradient(from 90deg, #ff4d4d, #ff4dff, #4d4dff, #4dffff, #4dff4d, #ffff4d, #ff4d4d)',
        }}
        onPointerDown={e => {
          e.currentTarget.setPointerCapture(e.pointerId);
          onChange(move(e), 'live');
        }}
        onPointerMove={e => e.buttons === 1 && onChange(move(e), 'live')}
        onPointerUp={e => onChange(move(e), 'commit')}
        onDoubleClick={() => onChange({ x: 0, y: 0, master: value.master }, 'commit')}
      >
        <div className='absolute top-1/2 left-0 h-px w-full bg-white/20' />
        <div className='absolute top-0 left-1/2 h-full w-px bg-white/20' />
        <div
          className='absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow'
          style={{ left: `${(value.x + 1) * 50}%`, top: `${(1 - value.y) * 50}%` }}
        />
      </div>
      <Slider
        className='w-24'
        min={-1}
        max={1}
        step={0.01}
        value={[value.master]}
        trackStyle={{ background: 'linear-gradient(90deg, #0d0d0d, #f2f2f2)' }}
        onValueChange={([master]) => onChange({ ...value, master }, 'live')}
        onValueCommit={([master]) => onChange({ ...value, master }, 'commit')}
        aria-label={`${label} master`}
      />
      <div className='text-[11px] text-ink-3'>{label}</div>
    </div>
  );
}
