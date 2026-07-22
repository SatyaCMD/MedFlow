'use client';

import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../context/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
