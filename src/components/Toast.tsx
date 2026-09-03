import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}
      className="fixed right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-200 bg-white text-emerald-900 shadow-lg shadow-emerald-500/10',
          error: 'border-rose-200 bg-white text-rose-900 shadow-lg shadow-rose-500/10',
          warning: 'border-amber-200 bg-white text-amber-900 shadow-lg shadow-amber-500/10',
          info: 'border-sky-200 bg-white text-sky-900 shadow-lg shadow-sky-500/10',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all animate-slideUp ${borderColors[t.type]}`}
          >
            <div className="flex items-start gap-2.5 text-xs">
              <div className="mt-0.5">{icons[t.type]}</div>
              <span className="font-semibold text-slate-800 leading-relaxed">{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
