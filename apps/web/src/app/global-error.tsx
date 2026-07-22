'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">System Error</h2>
          <p className="text-xs text-slate-500">
            A critical error occurred in the root layout.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            Refresh Workstation
          </button>
        </div>
      </body>
    </html>
  );
}
