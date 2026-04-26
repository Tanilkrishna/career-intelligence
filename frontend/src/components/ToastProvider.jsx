import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: <CheckCircle size={20} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={20} className="text-red-400 shrink-0" />,
  loading: <Loader2 size={20} className="text-blue-400 animate-spin shrink-0" />,
  info: <Info size={20} className="text-indigo-400 shrink-0" />,
};

const TOAST_STYLES = {
  success: 'border-emerald-500/30 bg-emerald-950/80',
  error: 'border-red-500/30 bg-red-950/80',
  loading: 'border-blue-500/30 bg-blue-950/80',
  info: 'border-indigo-500/30 bg-indigo-950/80',
};

const TOAST_BARS = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  loading: 'bg-blue-500',
  info: 'bg-indigo-500',
};

let toastId = 0;

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (toast.type === 'loading') return;

    const duration = toast.duration || 4000;
    startRef.current = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(progressInterval);
    }, 50);

    timerRef.current = setTimeout(dismiss, duration);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressInterval);
    };
  }, [toast.type, toast.duration, dismiss]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl shadow-black/30 min-w-[320px] max-w-[420px] transition-all duration-300 ease-out overflow-hidden
        ${TOAST_STYLES[toast.type]}
        ${isExiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}
      `}
      style={{ animation: isExiting ? 'none' : 'toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {TOAST_ICONS[toast.type]}
      <p className="text-sm text-white font-medium flex-1 leading-relaxed">{toast.message}</p>
      {toast.type !== 'loading' && (
        <button
          onClick={dismiss}
          className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      )}
      {/* Progress bar */}
      {toast.type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            className={`h-full transition-none ${TOAST_BARS[toast.type]}`}
            style={{ width: `${progress}%`, opacity: 0.6 }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration) => {
    const id = ++toastId;
    setToasts((prev) => {
      const next = [...prev, { id, type, message, duration }];
      // Keep max 3 visible
      return next.length > 3 ? next.slice(-3) : next;
    });
    return id;
  }, []);

  const toast = useCallback({
    success: (msg, duration) => addToast('success', msg, duration),
    error: (msg, duration) => addToast('error', msg, duration),
    loading: (msg) => addToast('loading', msg),
    info: (msg, duration) => addToast('info', msg, duration),
    dismiss: (id) => removeToast(id),
  }, [addToast, removeToast]);

  // Fix: useCallback can't be used with an object literal, use useMemo pattern
  const toastApi = useRef(null);
  if (!toastApi.current) {
    toastApi.current = {};
  }
  toastApi.current.success = (msg, duration) => addToast('success', msg, duration);
  toastApi.current.error = (msg, duration) => addToast('error', msg, duration);
  toastApi.current.loading = (msg) => addToast('loading', msg);
  toastApi.current.info = (msg, duration) => addToast('info', msg, duration);
  toastApi.current.dismiss = (id) => removeToast(id);

  return (
    <ToastContext.Provider value={toastApi.current}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export default ToastProvider;
