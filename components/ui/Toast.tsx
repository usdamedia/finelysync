import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (message: string, tone?: ToastTone, duration?: number, action?: ToastAction) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  /** Toast with an action button, e.g. Undo. Longer default duration. */
  action: (message: string, action: ToastAction, tone?: ToastTone, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircle2 className="w-5 h-5" />, color: 'var(--color-success)' },
  error: { icon: <XCircle className="w-5 h-5" />, color: 'var(--color-error)' },
  warning: { icon: <AlertTriangle className="w-5 h-5" />, color: 'var(--color-warning)' },
  info: { icon: <Info className="w-5 h-5" />, color: 'var(--color-info)' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info', duration = 3200, action?: ToastAction) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, tone, message, duration, action }]);
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m, d) => show(m, 'success', d),
      error: (m, d) => show(m, 'error', d),
      info: (m, d) => show(m, 'info', d),
      warning: (m, d) => show(m, 'warning', d),
      action: (m, a, tone = 'info', d = 6000) => show(m, tone, d, a),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[2000] top-0 inset-x-0 flex flex-col items-center gap-2 p-4 pointer-events-none safe-top">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto w-full max-w-sm material-thick material-edge rounded-2xl shadow-[var(--shadow-3)] p-3.5 flex items-start gap-3 animate-slide-up"
          >
            <span className="shrink-0 mt-0.5" style={{ color: TONE_STYLE[t.tone].color }}>
              {TONE_STYLE[t.tone].icon}
            </span>
            <p className="type-subheadline text-onSurface flex-1 min-w-0">{t.message}</p>
            {t.action ? (
              <button
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 type-subheadline font-semibold text-primary px-2 py-0.5 rounded-lg hover:bg-primary/10"
              >
                {t.action.label}
              </button>
            ) : null}
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Tutup"
              className="shrink-0 p-1 rounded-lg text-onSurfaceVariant hover:bg-surfaceVariant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
