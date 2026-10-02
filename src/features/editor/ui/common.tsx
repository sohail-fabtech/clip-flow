import { useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { ChevronRight, Diamond, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const mod = (key: string) => (isMac() ? `⌘${key}` : `Ctrl+${key}`);

export function Hint({ label, shortcut, children, side = 'bottom' }: { label: string; shortcut?: string; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {label}
        {shortcut && <span className='ml-2 font-mono text-ink-4'>{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

type IconButtonProps = ComponentProps<'button'> & { label: string; shortcut?: string; active?: boolean; side?: 'top' | 'bottom' | 'left' | 'right' };

export function IconButton({ label, shortcut, active, className, children, side, ...props }: IconButtonProps) {
  return (
    <Hint label={label} shortcut={shortcut} side={side}>
      <button
        type='button'
        aria-label={label}
        aria-pressed={active}
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-white/8 hover:text-ink disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-4',
          active && 'bg-white/12 text-ink',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </Hint>
  );
}

export function PanelHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <div className='flex h-9 shrink-0 items-center justify-between gap-2 border-b border-line-subtle px-3'>
      <span className='truncate text-xs font-medium text-ink-2'>{title}</span>
      <div className='flex items-center gap-0.5'>{children}</div>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className='px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-wider text-ink-4 uppercase'>{children}</div>;
}

interface GroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  onReset?: () => void;
}

export function Group({ title, children, defaultOpen = true, enabled, onEnabledChange, onReset }: GroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className='border-b border-line-subtle'>
      <div className='flex h-9 items-center gap-1.5 px-2'>
        <button
          type='button'
          onClick={() => setOpen(o => !o)}
          className='flex flex-1 items-center gap-1 text-left text-xs font-medium text-ink-2 hover:text-ink'
          aria-expanded={open}
        >
          <ChevronRight className={cn('size-3.5 text-ink-4 transition-transform', open && 'rotate-90')} />
          {title}
        </button>
        {onReset && (
          <IconButton label={`Reset ${title}`} onClick={onReset} className='size-6 [&_svg]:size-3.5'>
            <RotateCcw />
          </IconButton>
        )}
        {onEnabledChange && <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={`Enable ${title}`} />}
      </div>
      {open && <div className={cn('space-y-1 px-3 pb-3', enabled === false && 'pointer-events-none opacity-40')}>{children}</div>}
    </section>
  );
}

export function Row({ label, children, actions }: { label: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className='group/row flex min-h-7 items-center gap-2'>
      <div className='w-[92px] shrink-0 truncate text-xs text-ink-3'>{label}</div>
      <div className='flex min-w-0 flex-1 items-center gap-1.5'>{children}</div>
      {actions && <div className='flex w-11 shrink-0 items-center justify-end gap-0.5'>{actions}</div>}
    </div>
  );
}

interface ScrubProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  className?: string;
  label?: string;
}

export function ScrubNumber({ value, onChange, onCommit, min = -Infinity, max = Infinity, step = 1, precision = 0, unit, className, label }: ScrubProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const drag = useRef<{ x: number; start: number; moved: boolean; last: number } | null>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const display = value.toFixed(precision);

  if (editing !== null) {
    const finish = () => {
      const parsed = Number(editing);
      if (Number.isFinite(parsed)) (onCommit ?? onChange)(clamp(parsed));
      setEditing(null);
    };
    return (
      <input
        autoFocus
        aria-label={label}
        className={cn('h-6 w-16 rounded border border-selection/60 bg-base px-1.5 text-right font-mono text-xs text-ink outline-none', className)}
        value={editing}
        onChange={e => setEditing(e.target.value)}
        onBlur={finish}
        onKeyDown={e => {
          if (e.key === 'Enter') finish();
          if (e.key === 'Escape') setEditing(null);
          e.stopPropagation();
        }}
      />
    );
  }

  return (
    <button
      type='button'
      aria-label={label}
      className={cn(
        'h-6 min-w-12 cursor-ew-resize rounded px-1.5 text-right font-mono text-xs text-ink-2 tabular-nums hover:bg-white/8 hover:text-ink',
        className,
      )}
      onPointerDown={e => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, start: value, moved: false, last: value };
      }}
      onPointerMove={e => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (!d.moved && Math.abs(dx) < 3) return;
        d.moved = true;
        const next = clamp(Number((d.start + Math.round(dx / 2) * step * (e.shiftKey ? 10 : 1)).toFixed(6)));
        d.last = next;
        onChange(next);
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        if (!d.moved) setEditing(display);
        else onCommit?.(d.last);
      }}
    >
      {display}
      {unit && <span className='ml-0.5 text-ink-4'>{unit}</span>}
    </button>
  );
}

export function KeyframeToggle({ active, has, onToggle }: { active: boolean; has: boolean; onToggle: () => void }) {
  return (
    <IconButton
      label={active ? 'Remove keyframe' : 'Add keyframe'}
      onClick={onToggle}
      className={cn('size-5 [&_svg]:size-3', has ? 'text-timecode' : 'text-ink-4 opacity-0 group-hover/row:opacity-100')}
    >
      <Diamond fill={active ? 'currentColor' : 'none'} />
    </IconButton>
  );
}

export function SelectRow<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; label: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className='h-7 w-full rounded-md border border-line bg-base px-2 text-xs text-ink outline-none focus:border-selection/60'
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center'>
      <div className='text-ink-4 [&_svg]:size-7'>{icon}</div>
      <div className='text-xs font-medium text-ink-2'>{title}</div>
      {children && <div className='max-w-56 text-[11px] text-ink-4'>{children}</div>}
    </div>
  );
}
