'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { CreditCard, FileText, Download, ShieldCheck } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNo: string;
  patient: string;
  amount: string;
  date: string;
  insurance: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function BillingPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const mockInvoices: Invoice[] = [
    { id: '1', invoiceNo: 'INV-2026-081', patient: 'John Doe', amount: '$1,450.00', date: '2026-07-21', insurance: 'BlueCross (80%)', status: 'paid' },
    { id: '2', invoiceNo: 'INV-2026-082', patient: 'Jane Smith', amount: '$320.00', date: '2026-07-22', insurance: 'Medicare', status: 'pending' },
    { id: '3', invoiceNo: 'INV-2026-083', patient: 'Robert Lee', amount: '$4,890.00', date: '2026-07-15', insurance: 'Aetna Select', status: 'overdue' },
    { id: '4', invoiceNo: 'INV-2026-084', patient: 'Emily Davis', amount: '$680.00', date: '2026-07-20', insurance: 'UnitedHealth', status: 'paid' },
  ];

  const columns = [
    { header: 'Invoice Number', accessor: (row: Invoice) => <span className="font-bold text-blue-600">{row.invoiceNo}</span> },
    { header: 'Patient Name', accessor: (row: Invoice) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Billing Amount', accessor: (row: Invoice) => <span className="font-black text-slate-900 tabular-nums">{row.amount}</span> },
    { header: 'Insurance Provider', accessor: (row: Invoice) => <span className="text-slate-700 font-medium">{row.insurance}</span> },
    { header: 'Issue Date', accessor: (row: Invoice) => <span className="text-slate-600 tabular-nums">{row.date}</span> },
    {
      header: 'Payment Status',
      accessor: (row: Invoice) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            row.status === 'paid'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Financial & Billing Operations
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Insurance claims processing, patient invoice ledgers, and payment collection telemetry.
            </p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>Generate New Invoice</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Monthly Revenue" value="$128,450" change={16.8} changeLabel="vs last month" />
          <StatCard title="Pending Claims" value="$24,300" change={-3.2} changeLabel="12 claims processing" />
          <StatCard title="Collection Rate" value="94.2%" change={2.1} changeLabel="target 95%" />
        </div>

        {/* Invoices Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Recent Billing Invoices
            </h2>
            <button className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export Financial Summary
            </button>
          </div>

          <DataTable
            columns={columns}
            data={mockInvoices}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </div>
    </AppShell>
  );
}
