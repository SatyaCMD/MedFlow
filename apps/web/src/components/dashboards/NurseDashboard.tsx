'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import {
  Heart,
  Activity,
  Bed,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Syringe
} from 'lucide-react';

export const NurseDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const wardPatients = [
    { id: '1', bed: 'Bed 401-A', patient: 'John Doe', vitals: '120/80 mmHg • 72 bpm', status: 'Stable', temp: '98.6 °F', nurse: 'Nurse Clara' },
    { id: '2', bed: 'Bed 401-B', patient: 'Emily Davis', vitals: '145/95 mmHg • 88 bpm', status: 'Priority Monitor', temp: '101.2 °F', nurse: 'Nurse Clara' },
    { id: '3', bed: 'Bed 402-A', patient: 'Michael Brown', vitals: '118/75 mmHg • 68 bpm', status: 'Post-Op Day 1', temp: '98.4 °F', nurse: 'Nurse James' },
    { id: '4', bed: 'Bed 402-B', patient: 'Robert Lee', vitals: '130/82 mmHg • 76 bpm', status: 'Stable', temp: '99.0 °F', nurse: 'Nurse James' },
  ];

  const columns = [
    { header: 'Bed Number', accessor: (row: typeof wardPatients[0]) => <span className="font-bold text-blue-600 flex items-center gap-1.5"><Bed className="w-3.5 h-3.5" /> {row.bed}</span> },
    { header: 'Admitted Patient', accessor: (row: typeof wardPatients[0]) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Vitals (BP • HR)', accessor: (row: typeof wardPatients[0]) => <span className="text-slate-800 font-semibold tabular-nums">{row.vitals}</span> },
    { header: 'Body Temp', accessor: (row: typeof wardPatients[0]) => <span className="text-slate-700 font-bold tabular-nums flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-rose-500" /> {row.temp}</span> },
    {
      header: 'Clinical Status',
      accessor: (row: typeof wardPatients[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status === 'Priority Monitor'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : row.status === 'Post-Op Day 1'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
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
            <Heart className="w-6 h-6 text-rose-600" />
            Inpatient Nursing & Ward Monitor Station
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Real-time telemetry, bed allocation matrix, medication administration schedules, and shift notes.
          </p>
        </div>
        <button className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer">
          <Syringe className="w-4 h-4" />
          <span>Record Vitals & Dose</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Occupied Ward Beds" value="48 / 50" change={96.0} changeLabel="capacity 96%" icon={Bed} />
        <StatCard title="Vitals Priority Alerts" value="2" change={-1.0} changeLabel="bed 401-B monitored" icon={AlertTriangle} />
        <StatCard title="Med Doses Due (1h)" value="12" change={4.0} changeLabel="on schedule" icon={Clock} />
        <StatCard title="Shift Discharges" value="5" change={2.0} changeLabel="approved by doctor" icon={CheckCircle2} />
      </div>

      {/* Main Ward Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" /> Active Inpatient Ward Census & Telemetry
          </h2>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Live Vitals Telemetry Streaming
          </span>
        </div>

        <DataTable
          columns={columns}
          data={wardPatients}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
