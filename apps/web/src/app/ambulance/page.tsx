'use client';

import React from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { AmbulanceManagementModule } from '../../components/shared/AmbulanceManagementModule';
import { AmbulanceAdminDashboard } from '../../components/dashboards/AmbulanceAdminDashboard';
import { useAuth } from '../../hooks/useAuth';

export default function AmbulancePage() {
  const { user } = useAuth();
  const role = (user?.role as string) || 'PATIENT';

  return (
    <AppShell userRole={role}>
      <div className="py-2">
        {role === 'AMBULANCE_ADMIN' ? (
          <AmbulanceAdminDashboard />
        ) : (
          <AmbulanceManagementModule />
        )}
      </div>
    </AppShell>
  );
}
