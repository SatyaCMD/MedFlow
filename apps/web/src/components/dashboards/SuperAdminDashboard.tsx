'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { EnterpriseCommandCenterModal } from '../shared/EnterpriseCommandCenterModal';
import { AmbulanceTrackerModal } from '../shared/AmbulanceTrackerModal';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Bed,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  LayoutGrid,
  Siren,
  HeartPulse,
  Receipt
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [is44ModulesOpen, setIs44ModulesOpen] = useState(false);
  const [isAmbulanceTrackerOpen, setIsAmbulanceTrackerOpen] = useState(false);

  const [branches] = useState([
    { id: 'b1', name: 'MediCore Central Super-Specialty Hospital', location: 'Metropolitan Core', census: '480 / 500 Beds', rev: '₹68,50,000', status: 'Operational' },
    { id: 'b2', name: 'MediCore North Cardiac & Neuro Institute', location: 'North City District', census: '240 / 250 Beds', rev: '₹34,20,000', status: 'Operational' },
    { id: 'b3', name: 'MediCore East Trauma & Surgical Center', location: 'East Suburb Hub', census: '190 / 200 Beds', rev: '₹21,80,000', status: 'Operational' },
  ]);

  const columns = [
    { header: 'Hospital Unit / Branch', accessor: (row: typeof branches[0]) => <span className="font-black text-slate-900">{row.name}</span> },
    { header: 'Geographic District', accessor: (row: typeof branches[0]) => <span className="text-slate-600 font-semibold">{row.location}</span> },
    { header: 'Bed Census Matrix', accessor: (row: typeof branches[0]) => <span className="font-bold text-rose-600">{row.census}</span> },
    { header: 'Monthly Gross Revenue', accessor: (row: typeof branches[0]) => <span className="font-black text-emerald-600">{row.rev}</span> },
    {
      header: 'Operational Health',
      accessor: (row: typeof branches[0]) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* 44 Enterprise Modules Master Command Center Modal */}
      <EnterpriseCommandCenterModal
        isOpen={is44ModulesOpen}
        onClose={() => setIs44ModulesOpen(false)}
      />

      {/* Real-Time Live GPS Ambulance Tracker Modal */}
      <AmbulanceTrackerModal
        isOpen={isAmbulanceTrackerOpen}
        onClose={() => setIsAmbulanceTrackerOpen(false)}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Super Admin Enterprise Control Center & Multi-Hospital Operations
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Global healthcare telemetry, multi-branch management, RBAC access control, and 44 enterprise modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAmbulanceTrackerOpen(true)}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Siren className="w-4 h-4 animate-pulse" />
            <span>Live GPS Ambulance Tracker</span>
          </button>

          <button
            onClick={() => setIs44ModulesOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-blue-400" />
            <span>Open 44 Enterprise Modules Hub</span>
          </button>
        </div>
      </div>

      {/* KPI Cards in ₹ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Multi-Hospital Branches" value="3 Campuses" change={100.0} changeLabel="all operational" icon={Building2} />
        <StatCard title="Total Enterprise Revenue" value="₹1,24,50,000" change={14.2} changeLabel="monthly gross" icon={Receipt} />
        <StatCard title="Active Bed Census" value="910 / 950 Beds" change={95.7} changeLabel="high occupancy" icon={Bed} />
        <StatCard title="Enterprise Modules" value="44 / 44 Active" change={0.0} changeLabel="full coverage" icon={LayoutGrid} />
      </div>

      {/* Multi Hospital Branches Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Multi-Hospital Branch Telemetry & Performance
          </h2>
          <button
            onClick={() => setIs44ModulesOpen(true)}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> View All 44 Modules
          </button>
        </div>

        <DataTable
          columns={columns}
          data={branches}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
