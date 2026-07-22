'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Logo } from '../components/shared/Logo';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error silently
    // eslint-disable-next-line no-console
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Logo size={28} />
            <span className="font-bold text-slate-800">MediCore 360</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Application Notice</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected runtime error occurred. You can reset the application state below.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Workstation Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
