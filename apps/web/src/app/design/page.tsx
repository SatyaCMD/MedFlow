'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Shield, Sparkles, Calendar, Activity } from 'lucide-react';

interface MockRow {
  id: string;
  name: string;
  department: string;
  status: 'active' | 'scheduled' | 'discharged';
  date: string;
}

export default function DesignStyleGuide() {
  const [currentPage, setCurrentPage] = useState(1);

  const mockData: MockRow[] = [
    { id: '1', name: 'John Doe', department: 'Cardiology', status: 'active', date: '2026-07-21' },
    { id: '2', name: 'Jane Smith', department: 'Pediatrics', status: 'scheduled', date: '2026-07-22' },
    { id: '3', name: 'Robert Lee', department: 'Orthopedics', status: 'discharged', date: '2026-07-20' },
  ];

  const columns = [
    { header: 'MRN ID', accessor: (row: MockRow) => <span className="font-semibold text-blue-400">MC-000{row.id}</span> },
    { header: 'Patient Name', accessor: (row: MockRow) => <span>{row.name}</span> },
    { header: 'Department', accessor: (row: MockRow) => <span className="text-slate-400">{row.department}</span> },
    {
      header: 'Status',
      accessor: (row: MockRow) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            row.status === 'active'
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
              : row.status === 'scheduled'
                ? 'bg-amber-950/40 text-amber-400 border border-amber-900/20'
                : 'bg-slate-800/40 text-slate-400 border border-slate-700/20'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { header: 'Admission Date', accessor: (row: MockRow) => <span className="tabular-nums">{row.date}</span> },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-10">
        {/* Header segment */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent">
            Design Token & Component System
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Living style guide containing the custom tailwind variables, component libraries, and unified status indicators.
          </p>
        </div>

        {/* Theme and brand colors */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> Color Palette & Theme Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-blue-600 rounded-lg mb-3" />
              <span className="text-xs font-semibold">Primary Blue</span>
              <span className="text-[10px] text-slate-500">#2563eb</span>
            </div>
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-slate-950 rounded-lg mb-3 border border-slate-800" />
              <span className="text-xs font-semibold">Background</span>
              <span className="text-[10px] text-slate-500">#0b0f19</span>
            </div>
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-slate-900 rounded-lg mb-3 border border-slate-800" />
              <span className="text-xs font-semibold">Surface Card</span>
              <span className="text-[10px] text-slate-500">#0f172a</span>
            </div>
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-emerald-600 rounded-lg mb-3" />
              <span className="text-xs font-semibold">Success State</span>
              <span className="text-[10px] text-slate-500">#059669</span>
            </div>
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-amber-600 rounded-lg mb-3" />
              <span className="text-xs font-semibold">Warning State</span>
              <span className="text-[10px] text-slate-500">#d97706</span>
            </div>
            <div className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="h-12 bg-rose-600 rounded-lg mb-3" />
              <span className="text-xs font-semibold">Danger State</span>
              <span className="text-[10px] text-slate-500">#e11d48</span>
            </div>
          </div>
        </section>

        {/* Buttons library */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300">Buttons & Actions</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all">
              Primary Action
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
              Secondary Button
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600/20 text-red-400 border border-red-900/30 hover:bg-red-600/30 transition-all">
              Destructive Button
            </button>
            <button disabled className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50">
              Disabled State
            </button>
          </div>
        </section>

        {/* KPI stats blocks */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300">Composite Stats Layout (StatCards)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Consultations" value="1,482" icon={Activity} change={12.4} />
            <StatCard title="Active Ward Admissions" value="142" icon={Shield} change={-2.1} />
            <StatCard title="Pending Appointments" value="82" icon={Calendar} change={8.5} />
          </div>
        </section>

        {/* Data list view table */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300">DataTable Interface</h2>
          <DataTable
            columns={columns}
            data={mockData}
            currentPage={currentPage}
            totalPages={3}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </section>
      </div>
    </AppShell>
  );
}
