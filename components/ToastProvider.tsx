import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const TOAST_LIFETIME_MS = 3200;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message: string, type: ToastType) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      removeToast(id);
    }, TOAST_LIFETIME_MS);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (message: string) => pushToast(message, 'success'),
    error: (message: string) => pushToast(message, 'error'),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-4 sm:right-6 z-[120] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                : 'bg-red-50/95 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm font-bold leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-auto text-current/70 hover:text-current transition-colors"
                aria-label="Close toast"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
