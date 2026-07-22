'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000 }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start justify-between gap-3 ${
                  isSuccess
                    ? 'bg-slate-900 border-emerald-500/40 text-white'
                    : isError
                      ? 'bg-slate-900 border-rose-500/40 text-white'
                      : isWarning
                        ? 'bg-slate-900 border-amber-500/40 text-white'
                        : 'bg-slate-900 border-blue-500/40 text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isError
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                    {isError && <AlertCircle className="w-4 h-4" />}
                    {isWarning && <AlertTriangle className="w-4 h-4" />}
                    {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black tracking-wide text-slate-100">{toast.title}</h4>
                    {toast.message && (
                      <p className="text-[11px] font-medium text-slate-300 leading-relaxed">{toast.message}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
