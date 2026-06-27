import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface ToastContextValue {
  toast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm
              animate-in slide-in-from-right-full duration-200
              ${t.type === 'success'
                ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-900 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900 text-slate-900 dark:text-white'
              }`}
          >
            {t.type === 'success'
              ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              : <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            }
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
