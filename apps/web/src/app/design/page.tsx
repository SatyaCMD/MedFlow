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
    { header: 'MRN ID', accessor: (row: MockRow) => <span className="font-bold text-blue-600">MC-000{row.id}</span> },
    { header: 'Patient Name', accessor: (row: MockRow) => <span className="font-semibold text-slate-900">{row.name}</span> },
    { header: 'Department', accessor: (row: MockRow) => <span className="text-slate-600 font-medium">{row.department}</span> },
    {
      header: 'Status',
      accessor: (row: MockRow) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            row.status === 'active'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'scheduled'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { header: 'Admission Date', accessor: (row: MockRow) => <span className="tabular-nums text-slate-700 font-medium">{row.date}</span> },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-10 max-w-6xl mx-auto">
        {/* Header segment */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Design Token & Component System
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
            Living style guide containing custom Tailwind variables, component libraries, and unified status indicators.
          </p>
        </div>

        {/* Theme and brand colors */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" /> Color Palette & Theme Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-blue-600 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Primary Blue</span>
              <span className="text-[10px] font-semibold text-slate-500">#2563eb</span>
            </div>
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-slate-950 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Background</span>
              <span className="text-[10px] font-semibold text-slate-500">#0b0f19</span>
            </div>
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-slate-900 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Surface Card</span>
              <span className="text-[10px] font-semibold text-slate-500">#0f172a</span>
            </div>
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-emerald-600 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Success State</span>
              <span className="text-[10px] font-semibold text-slate-500">#059669</span>
            </div>
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-amber-600 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Warning State</span>
              <span className="text-[10px] font-semibold text-slate-500">#d97706</span>
            </div>
            <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="h-12 bg-rose-600 rounded-lg mb-3 shadow-inner" />
              <span className="text-xs font-bold text-slate-900">Danger State</span>
              <span className="text-[10px] font-semibold text-slate-500">#e11d48</span>
            </div>
          </div>
        </section>

        {/* Buttons library */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Buttons & Actions</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <button className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer">
              Primary Action
            </button>
            <button className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer">
              Secondary Button
            </button>
            <button className="px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer">
              Destructive Button
            </button>
            <button disabled className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60">
              Disabled State
            </button>
          </div>
        </section>

        {/* KPI stats blocks */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Composite Stats Layout (StatCards)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Consultations" value="1,482" icon={Activity} change={12.4} />
            <StatCard title="Active Ward Admissions" value="142" icon={Shield} change={-2.1} />
            <StatCard title="Pending Appointments" value="82" icon={Calendar} change={8.5} />
          </div>
        </section>

        {/* Data list view table */}
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">DataTable Interface</h2>
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
