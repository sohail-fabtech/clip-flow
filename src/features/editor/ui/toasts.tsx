import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  tone: 'info' | 'error';
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: string) => void;
}

export const useToasts = create<ToastStore>(set => ({
  toasts: [],
  push: (message, tone = 'info') => {
    const id = nanoid();
    set(state => ({ toasts: [...state.toasts.slice(-3), { id, message, tone }] }));
    setTimeout(() => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })), tone === 'error' ? 6000 : 3000);
  },
  dismiss: id => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));

export const toast = (message: string, tone?: Toast['tone']) => useToasts.getState().push(message, tone);

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div
      className='pointer-events-none fixed right-4 bottom-4 z-[3000] flex flex-col gap-2'
      role='status'
      aria-live='polite'
    >
      {toasts.map(t => (
        <div
          key={t.id}
          className='pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border border-line bg-raised px-3 py-2 text-xs text-ink-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2'
        >
          {t.tone === 'error' ? (
            <CircleAlert className='mt-px size-4 shrink-0 text-danger' />
          ) : (
            <CircleCheck className='mt-px size-4 shrink-0 text-success' />
          )}
          <span className='flex-1'>{t.message}</span>
          <button
            type='button'
            aria-label='Dismiss'
            onClick={() => dismiss(t.id)}
            className='text-ink-4 hover:text-ink'
          >
            <X className='size-3.5' />
          </button>
        </div>
      ))}
    </div>
  );
}
