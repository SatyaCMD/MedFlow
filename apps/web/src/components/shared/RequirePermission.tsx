'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Permission } from '@medicore360/shared';

interface RequirePermissionProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-8 bg-slate-800 rounded animate-pulse w-full max-w-[120px]" />
    );
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
