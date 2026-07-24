'use client';

import React from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { AmbulanceManagementModule } from '../../components/shared/AmbulanceManagementModule';

export default function AmbulancePage() {
  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="py-2">
        <AmbulanceManagementModule />
      </div>
    </AppShell>
  );
}
