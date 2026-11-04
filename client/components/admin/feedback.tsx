'use client';

import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/format';
import { Button } from './ui';

// ---------- Toasts ----------

type Toast = { id: number; kind: 'success' | 'error'; message: string };
type ConfirmOptions = { title: string; message?: string; confirmLabel?: string; danger?: boolean };

interface FeedbackApi {
  toast: (kind: Toast['kind'], message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

export function useFeedback(): FeedbackApi {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used inside <FeedbackProvider>');
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const nextId = useRef(1);

  const toast = useCallback((kind: Toast['kind'], message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 7000 : 3500);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border bg-card px-4 py-3 text-sm shadow-lg',
              t.kind === 'error' ? 'border-rose-500/50 text-rose-700 dark:text-rose-300' : 'border-emerald-500/40 text-text',
            )}
          >
            {t.kind === 'error' ? (
              <CircleAlert size={17} className="mt-0.5 shrink-0" aria-hidden />
            ) : (
              <CircleCheck size={17} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            )}
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} className="text-muted hover:text-text">
              <X size={15} aria-hidden />
            </button>
          </div>
        ))}
      </div>
      {pending && <ConfirmDialog options={pending} onClose={close} />}
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose(false);
      }}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-0 text-text shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      aria-labelledby="confirm-title"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-lg font-semibold">
          {options.title}
        </h2>
        {options.message && <p className="mt-2 text-sm text-muted">{options.message}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onClose(false)} autoFocus>
            Cancel
          </Button>
          <Button variant={options.danger ? 'danger' : 'primary'} onClick={() => onClose(true)}>
            {options.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ---------- Slide-over panel ----------

export function Drawer({
  title,
  open,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="drawer-title"
      className={cn(
        'fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-full border-l border-border bg-bg p-0 text-text shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]',
        wide ? 'sm:w-[min(860px,100vw)]' : 'sm:w-[min(560px,100vw)]',
      )}
    >
      {open && (
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 id="drawer-title" className="text-lg font-semibold">
              {title}
            </h2>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
              <X size={18} aria-hidden />
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer && <footer className="flex justify-end gap-2 border-t border-border bg-card px-5 py-4">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
