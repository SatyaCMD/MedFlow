'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import {
  ShieldCheck,
  Activity,
  Users,
  Database,
  Building2,
  DollarSign,
  TrendingUp,
  Server,
  Lock,
  Download
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const systemAuditLogs = [
    { id: '1', time: '06:14 AM', event: 'OWASP Security Scan Passed', user: 'System Worker', tenant: 'HOSP-001', status: 'Passed' },
    { id: '2', time: '05:48 AM', event: 'New Doctor Workstation Registered', user: 'Dr. House', tenant: 'HOSP-001', status: 'Success' },
    { id: '3', time: '04:30 AM', event: 'MongoDB Replica Set Backup Completed', user: 'DBA Admin', tenant: 'GLOBAL', status: 'Completed' },
    { id: '4', time: '02:15 AM', event: 'SHA-256 EMR Block Hashed', user: 'Crypto Engine', tenant: 'HOSP-002', status: 'Sealed' },
  ];

  const columns = [
    { header: 'Time', accessor: (row: typeof systemAuditLogs[0]) => <span className="font-bold text-blue-600">{row.time}</span> },
    { header: 'System Event Description', accessor: (row: typeof systemAuditLogs[0]) => <span className="font-bold text-slate-900">{row.event}</span> },
    { header: 'Initiated By', accessor: (row: typeof systemAuditLogs[0]) => <span className="text-slate-700 font-semibold">{row.user}</span> },
    { header: 'Tenant Domain', accessor: (row: typeof systemAuditLogs[0]) => <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded border border-slate-300 text-[10px]">{row.tenant}</span> },
    {
      header: 'Audit Status',
      accessor: (row: typeof systemAuditLogs[0]) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Super Admin Enterprise Control Center
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Global hospital network telemetry, multi-tenant database performance, and security compliance logs.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          12 Data Centers Operational
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Hospital Revenue" value="$128,450" change={16.8} changeLabel="vs last month" icon={DollarSign} />
        <StatCard title="Active System Users" value="1,248" change={8.4} changeLabel="workstations live" icon={Users} />
        <StatCard title="EMR Encrypted Storage" value="14,280" change={4.2} changeLabel="SHA-256 blocks" icon={Database} />
        <StatCard title="Security Posture" value="100%" change={0.0} changeLabel="OWASP Level 3" icon={ShieldCheck} />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Audit Logs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> System Security Audit Stream
            </h2>
            <button className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export Compliance Log
            </button>
          </div>

          <DataTable
            columns={columns}
            data={systemAuditLogs}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Right 1 Col: Live Telemetry */}
        <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" /> Infrastructure Cluster Health
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold">MongoDB Cluster Status</span>
                <span className="text-emerald-700 font-bold">HEALTHY</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Multi-Region Replica Sets Synced</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold">Redis Cache Latency</span>
                <span className="text-blue-600 font-bold">0.14 ms</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Session token store operational</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 font-bold">OWASP Hardening Shield</span>
                <span className="text-emerald-700 font-bold">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Argon2id Salt+Pepper Enforced</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
