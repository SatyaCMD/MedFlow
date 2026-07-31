'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { PaymentModal } from '../../components/shared/PaymentModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  getPatientInvoices,
  PatientInvoice,
  BillingLineItem,
} from '../../data/patientBillingStore';
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
  PieChart,
  Search,
  User,
  X,
  Printer,
  Sparkles,
  Filter,
  Check,
  Stethoscope,
  Pill,
  FlaskConical,
  Bed,
  Heart
} from 'lucide-react';

export default function BillingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Invoices & Search State
  const [patientInvoices, setPatientInvoices] = useState<PatientInvoice[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PatientInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({ title: 'IPD Hospital Stay & Surgery Package', amount: '₹45,800' });

  useEffect(() => {
    setPatientInvoices(getPatientInvoices());
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/explore/billing');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <AppShell userRole="SUPER_ADMIN">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </AppShell>
    );
  }

  const filteredInvoices = patientInvoices.filter((inv) => {
    const term = patientSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      inv.patientName.toLowerCase().includes(term) ||
      inv.mrn.toLowerCase().includes(term) ||
      inv.invoiceCode.toLowerCase().includes(term) ||
      inv.department.toLowerCase().includes(term) ||
      inv.attendingDoctor.toLowerCase().includes(term)
    );
  });

  const handleOpenInvoiceModal = (inv: PatientInvoice) => {
    setSelectedInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;
    showToast({
      title: 'Generating GST Tax Invoice PDF 🖨️',
      message: `Exporting official tax invoice #${selectedInvoice.invoiceCode} for ${selectedInvoice.patientName}...`,
      type: 'success',
    });
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const columns = [
    {
      header: 'Invoice Code',
      accessor: (row: PatientInvoice) => (
        <button
          onClick={() => handleOpenInvoiceModal(row)}
          className="font-mono font-black text-blue-600 hover:text-blue-800 underline text-xs cursor-pointer"
        >
          {row.invoiceCode}
        </button>
      ),
    },
    {
      header: 'Billing Date',
      accessor: (row: PatientInvoice) => (
        <span className="text-slate-600 font-semibold text-xs">{row.date}</span>
      ),
    },
    {
      header: 'Patient Name & MRN',
      accessor: (row: PatientInvoice) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{row.patientName}</span>
          <span className="text-[10px] font-bold text-blue-600">MRN: {row.mrn}</span>
        </div>
      ),
    },
    {
      header: 'Department & Doctor',
      accessor: (row: PatientInvoice) => (
        <div>
          <span className="text-slate-800 font-semibold text-xs block">{row.department}</span>
          <span className="text-[10px] font-bold text-slate-500">{row.attendingDoctor}</span>
        </div>
      ),
    },
    {
      header: 'Line Items',
      accessor: (row: PatientInvoice) => (
        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-full text-[10px]">
          {row.lineItems.length} Itemized Charges
        </span>
      ),
    },
    {
      header: 'GST Tax (5%)',
      accessor: (row: PatientInvoice) => (
        <span className="text-slate-500 font-semibold text-xs">₹{row.gstAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Total Invoice (₹)',
      accessor: (row: PatientInvoice) => (
        <span className="font-black text-slate-900 text-xs">₹{row.totalAmount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      header: 'Insurance TPA Status',
      accessor: (row: PatientInvoice) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.tpaStatus.includes('Approved') || row.tpaStatus.includes('Settled')
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.tpaStatus.includes('Direct')
              ? 'bg-blue-100 text-blue-800 border border-blue-300'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}
        >
          {row.tpaStatus}
        </span>
      ),
    },
    {
      header: 'Invoice Actions',
      accessor: (row: PatientInvoice) => (
        <button
          onClick={() => handleOpenInvoiceModal(row)}
          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Invoice</span>
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
              Hospital Billing, Finance & Individual Patient Invoices (₹ INR)
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Itemized patient OPD/IPD invoices, Pharmacy & Lab line items, Cashless TPA insurance claims, 5% GST tax breakdown, and financial ledgers.
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

        {/* Individual Patient Invoices Directory */}
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Individual Patient Invoices & Itemized Ledger
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Search individual patients by Name or MRN to inspect complete itemized charges, GST tax details, and TPA settlements.
              </p>
            </div>

            {/* Patient Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, MRN, invoice code..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredInvoices}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Itemized Patient GST Tax Invoice Detail Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Official GST Tax Invoice</span>
                  </div>
                  <h3 className="text-xl font-black mt-1">Invoice #{selectedInvoice.invoiceCode}</h3>
                </div>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Printable Invoice Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-sans">
                {/* Patient & Hospital Info Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-slate-200 pb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Patient Details</span>
                    <h4 className="text-lg font-black text-slate-900 mt-1">{selectedInvoice.patientName}</h4>
                    <p className="text-xs font-bold text-blue-600">MRN: {selectedInvoice.mrn}</p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">{selectedInvoice.email || 'N/A'}</p>
                    <p className="text-xs text-slate-600 font-semibold">{selectedInvoice.phone || 'N/A'}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Billing Telemetry</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">Date: <span className="text-slate-900 font-black">{selectedInvoice.date}</span></p>
                    <p className="text-xs font-bold text-slate-800">Dept: <span className="text-slate-900 font-bold">{selectedInvoice.department}</span></p>
                    <p className="text-xs font-bold text-slate-800">Doctor: <span className="text-blue-700 font-bold">{selectedInvoice.attendingDoctor}</span></p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {selectedInvoice.tpaStatus}
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Itemized Charges Breakdown</h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-[10px] font-black">
                        <tr>
                          <th className="p-3">Category</th>
                          <th className="p-3">Line Item Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price (₹)</th>
                          <th className="p-3 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {selectedInvoice.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px]">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-900">
                              {item.description}
                              {item.tpaCovered && (
                                <span className="ml-2 text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  TPA COVERED
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center font-bold">{item.qty}</td>
                            <td className="p-3 text-right font-semibold text-slate-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tax & Financial Settlement Summary */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Subtotal Line Charges:</span>
                    <span className="font-bold text-slate-900">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Medical GST (5% Standard Tax):</span>
                    <span className="font-bold text-slate-900">₹{selectedInvoice.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-3">
                    <span>Grand Total Invoice Amount:</span>
                    <span className="text-base text-blue-700">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoice.tpaApprovedAmount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-100/50 p-2 rounded-xl border border-emerald-200">
                      <span>Cashless TPA Insurance Covered:</span>
                      <span>- ₹{selectedInvoice.tpaApprovedAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                    <span>Net Patient Out-of-Pocket Payable:</span>
                    <span>₹{selectedInvoice.netPatientPayable.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Digital Stamp Audit Verified • PCI-DSS Validated
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handlePrintInvoice}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print GST Tax Invoice</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
