'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { PaymentModal } from '../../components/shared/PaymentModal';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Building2,
  Download,
  CheckCircle2,
  FileText,
  DollarSign,
  Plus,
  ShieldCheck,
  Receipt,
  PieChart
} from 'lucide-react';

export default function BillingPage() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({ title: 'IPD Hospital Stay & Surgery Package', amount: '₹45,800' });

  const [invoices] = useState([
    { id: 'INV-9901', date: 'Jul 22, 2026', patient: 'Sarah Connor', dept: 'IPD Cardiology Ward', total: '₹45,800', tpaStatus: 'TPA Cashless Pre-Approved', gst: '₹2,290 (5%)', status: 'Paid' },
    { id: 'INV-9902', date: 'Jul 21, 2026', patient: 'John Doe', dept: 'OPD Neurology', total: '₹2,500', tpaStatus: 'Direct Patient Payment', gst: '₹125 (5%)', status: 'Paid' },
    { id: 'INV-9903', date: 'Jul 20, 2026', patient: 'Bruce Wayne', dept: 'Pharmacy & Surgical Consumables', total: '₹12,400', tpaStatus: 'Star Health TPA Claim Pending', gst: '₹620 (5%)', status: 'Pending TPA Settlement' },
  ]);

  const handleDownloadInvoice = (invId: string) => {
    showToast({
      title: 'Downloading GST Tax Invoice',
      message: `Generating printable GST tax invoice #${invId}...`,
      type: 'info',
    });
  };

  const columns = [
    { header: 'Invoice Code', accessor: (row: typeof invoices[0]) => <span className="font-mono font-black text-blue-600">{row.id}</span> },
    { header: 'Billing Date', accessor: (row: typeof invoices[0]) => <span className="text-slate-600 font-semibold">{row.date}</span> },
    { header: 'Patient Name', accessor: (row: typeof invoices[0]) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Department', accessor: (row: typeof invoices[0]) => <span className="text-slate-700 font-medium">{row.dept}</span> },
    { header: 'GST Tax (5%)', accessor: (row: typeof invoices[0]) => <span className="text-slate-500 font-semibold">{row.gst}</span> },
    { header: 'Total (₹ INR)', accessor: (row: typeof invoices[0]) => <span className="font-black text-slate-900">{row.total}</span> },
    {
      header: 'Insurance TPA Status',
      accessor: (row: typeof invoices[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status.includes('Paid')
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}
        >
          {row.tpaStatus}
        </span>
      ),
    },
    {
      header: 'Invoice Actions',
      accessor: (row: typeof invoices[0]) => (
        <button
          onClick={() => handleDownloadInvoice(row.id)}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>GST Invoice PDF</span>
        </button>
      ),
    },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-6xl mx-auto">
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          itemTitle={paymentTarget.title}
          itemCategory="APPOINTMENT"
          amount={paymentTarget.amount}
          patientName="Staff / Patient"
          userRole="SUPER_ADMIN"
          onPaymentSuccess={() => {}}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Hospital Billing, Finance & Insurance TPA Claims (₹ INR)
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              OPD/IPD billing, Pharmacy & Lab charges, Cashless TPA claims, GST tax invoices, and financial reports.
            </p>
          </div>
        </div>

        {/* KPI Cards in ₹ */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <StatCard title="Total Monthly Revenue" value="₹1,24,50,000" change={14.2} changeLabel="all branches" icon={Receipt} />
          <StatCard title="Cashless TPA Claims" value="₹42,80,000" change={8.5} changeLabel="approved claims" icon={ShieldCheck} />
          <StatCard title="GST Taxes Collected" value="₹6,22,500" change={0.0} changeLabel="5% medical GST" icon={PieChart} />
          <StatCard title="Pending Receivables" value="₹12,40,000" change={-3.0} changeLabel="due collections" icon={CheckCircle2} />
        </div>

        {/* Invoices Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" /> Billing Master Ledger & GST Invoices
          </h2>

          <DataTable
            columns={columns}
            data={invoices}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </AppShell>
  );
}
