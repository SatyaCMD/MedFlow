'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { FileText, ShieldCheck, Lock, Database } from 'lucide-react';

interface EMRRecord {
  id: string;
  recordId: string;
  patient: string;
  diagnosis: string;
  icdCode: string;
  doctor: string;
  lastUpdated: string;
  hash: string;
}

export default function EMRPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const mockEMR: EMRRecord[] = [
    { id: '1', recordId: 'EMR-9041', patient: 'John Doe', diagnosis: 'Essential Hypertension', icdCode: 'I10', doctor: 'Dr. House', lastUpdated: '2026-07-21 14:30', hash: 'e3b0c442...98fc' },
    { id: '2', recordId: 'EMR-9042', patient: 'Jane Smith', diagnosis: 'Acute Bronchitis', icdCode: 'J20.9', doctor: 'Dr. Watson', lastUpdated: '2026-07-22 09:15', hash: '8f4a21b...10ab' },
    { id: '3', recordId: 'EMR-9043', patient: 'Robert Lee', diagnosis: 'Osteoarthritis Right Knee', icdCode: 'M17.11', doctor: 'Dr. Strange', lastUpdated: '2026-07-20 16:45', hash: '7c9e12f...44de' },
  ];

  const columns = [
    { header: 'Record ID', accessor: (row: EMRRecord) => <span className="font-bold text-blue-600">{row.recordId}</span> },
    { header: 'Patient Name', accessor: (row: EMRRecord) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Primary Clinical Diagnosis', accessor: (row: EMRRecord) => <span className="text-slate-800 font-semibold">{row.diagnosis}</span> },
    { header: 'ICD-10 Code', accessor: (row: EMRRecord) => <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded border border-slate-300 text-xs">{row.icdCode}</span> },
    { header: 'Authoring Physician', accessor: (row: EMRRecord) => <span className="text-slate-700 font-medium">{row.doctor}</span> },
    { header: 'Cryptographic Audit Hash', accessor: (row: EMRRecord) => <span className="text-[10px] font-mono text-slate-500">{row.hash}</span> },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Electronic Health Records (EHR/EMR) Vault
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Tamper-evident medical history storage protected by Argon2 encryption and HIPAA compliance checks.
            </p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer">
            <Lock className="w-4 h-4" />
            <span>Create Encrypted Record</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total EMR Archives" value="14,280" change={4.2} changeLabel="encrypted blocks" />
          <StatCard title="Audit Verifications" value="100%" change={0.0} changeLabel="zero tampered entries" />
          <StatCard title="ICD-10 Mappings" value="8,920" change={1.5} changeLabel="standardized codes" />
        </div>

        {/* EMR Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Recent Clinical Progress Notes & Diagnostics
            </h2>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> SHA-256 Audit Sealed
            </span>
          </div>

          <DataTable
            columns={columns}
            data={mockEMR}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </div>
    </AppShell>
  );
}
