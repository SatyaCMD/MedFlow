'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import {
  Pill,
  Package,
  AlertOctagon,
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  FileCheck
} from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const prescriptionsQueue = [
    { id: '1', rxId: 'RX-8901', patient: 'John Doe', medication: 'Amoxicillin 500mg (Cap)', doctor: 'Dr. House', status: 'Ready for Pickup', price: '$24.50' },
    { id: '2', rxId: 'RX-8902', patient: 'Jane Smith', medication: 'Metformin 850mg (Tab)', doctor: 'Dr. Watson', status: 'Dispensing', price: '$18.00' },
    { id: '3', rxId: 'RX-8903', patient: 'Robert Lee', medication: 'Atorvastatin 20mg (Tab)', doctor: 'Dr. Strange', status: 'Pending Verification', price: '$42.00' },
    { id: '4', rxId: 'RX-8904', patient: 'Emily Davis', medication: 'Insulin Glargine (100U)', doctor: 'Dr. House', status: 'Completed', price: '$85.00' },
  ];

  const columns = [
    { header: 'Rx Order ID', accessor: (row: typeof prescriptionsQueue[0]) => <span className="font-bold text-blue-600 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5" /> {row.rxId}</span> },
    { header: 'Patient Name', accessor: (row: typeof prescriptionsQueue[0]) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Prescribed Medication', accessor: (row: typeof prescriptionsQueue[0]) => <span className="text-slate-800 font-semibold">{row.medication}</span> },
    { header: 'Prescribing Physician', accessor: (row: typeof prescriptionsQueue[0]) => <span className="text-slate-700 font-medium">{row.doctor}</span> },
    { header: 'Rx Price', accessor: (row: typeof prescriptionsQueue[0]) => <span className="text-slate-900 font-black tabular-nums">{row.price}</span> },
    {
      header: 'Fulfillment Status',
      accessor: (row: typeof prescriptionsQueue[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status === 'Ready for Pickup'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'Dispensing'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : row.status === 'Completed'
                  ? 'bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
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
            <Pill className="w-6 h-6 text-indigo-600" />
            Hospital Dispensary & Pharmacy Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Electronic prescription fulfillment queue, inventory reorder alerts, and controlled substance verification.
          </p>
        </div>
        <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer">
          <ShoppingCart className="w-4 h-4" />
          <span>Dispense Rx Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pending Rx Orders" value="24" change={6.0} changeLabel="8 ready for pickup" icon={FileCheck} />
        <StatCard title="Low Stock Alerts" value="3" change={-2.0} changeLabel="reorder required" icon={AlertOctagon} />
        <StatCard title="Dispensed Today" value="142" change={14.5} changeLabel="items checked out" icon={Package} />
        <StatCard title="Pharmacy Revenue Today" value="$3,420" change={9.2} changeLabel="claims verified" icon={DollarSign} />
      </div>

      {/* Main Pharmacy Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-indigo-600" /> Electronic Prescription Fulfillment Queue
          </h2>
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Automated Drug Interaction Check Passed
          </span>
        </div>

        <DataTable
          columns={columns}
          data={prescriptionsQueue}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
