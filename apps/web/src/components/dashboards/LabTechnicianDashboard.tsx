'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import {
  getLabOrders,
  submitLabReport,
  LabOrderRecord,
} from '../../data/medicalHistoryStore';
import { getLabEquipmentInvoices } from '../../data/patientBillingStore';
import { PaymentModal } from '../shared/PaymentModal';
import { PharmacyPurchaseModal } from '../shared/PharmacyPurchaseModal';
import { printVendorEquipmentInvoicePdf } from '../../lib/singlePageReceiptPdf';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  User,
  Search,
  History,
  FileText,
  X,
  Sparkles,
  ShieldCheck,
  Activity,
  Check,
  Send,
  FileCheck2,
  Calendar,
  Building2,
  ShoppingBag
} from 'lucide-react';

export const LabTechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const techDisplayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Rajesh Kumar, Chief Lab Technician';

  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<LabOrderRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Search Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Form State for Report Submission
  const [findings, setFindings] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setLabOrders(getLabOrders());
  }, []);

  const openReportModal = (order: LabOrderRecord) => {
    setSelectedOrder(order);
    if (order.testName.includes('CBC')) {
      setFindings('Hemoglobin: 14.2 g/dL (Normal) • RBC: 4.8 M/uL • WBC: 6,800 /uL • Platelets: 260,000 /uL');
      setNotes('Normal hemogram parameters. No acute infection or anemia.');
    } else if (order.testName.includes('Lipid')) {
      setFindings('Total Cholesterol: 215 mg/dL • HDL: 46 mg/dL • LDL: 138 mg/dL • Triglycerides: 155 mg/dL');
      setNotes('Mild elevation in LDL cholesterol. Clinical correlation advised.');
    } else if (order.testName.includes('ECG')) {
      setFindings('Heart Rate: 72 bpm • PR Interval: 0.16s • QRS: 0.08s • QT/QTc: 390ms');
      setNotes('Normal sinus rhythm. No ischemic ST-T wave abnormalities.');
    } else {
      setFindings('Target parameter evaluated. Values within standard biological reference interval.');
      setNotes('Diagnostic evaluation completed and verified by pathology head.');
    }
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const reportData = {
      findings,
      notes,
      technicianName: techDisplayName,
      submittedAt: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      doctorName: selectedOrder.doctorName,
    };

    const updated = submitLabReport(selectedOrder.id, reportData);
    setLabOrders(updated);
    setIsReportModalOpen(false);

    showToast({
      title: 'Lab Report Submitted & Dispatched!',
      message: `Diagnostic report for ${selectedOrder.patientName} (${selectedOrder.testName}) sent to ${selectedOrder.doctorName}.`,
      type: 'success',
    });
  };

  // Filtered Pending Lab Orders
  const pendingOrders = labOrders.filter((o) => {
    const isPending = o.status !== 'REPORT_SUBMITTED';
    const matchesSearch =
      !searchQuery ||
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase());
    return isPending && matchesSearch;
  });

  // Filtered Diagnostic History
  const historyOrders = labOrders.filter((o) => {
    const isCompleted = o.status === 'REPORT_SUBMITTED';
    const matchesSearch =
      !historySearchQuery ||
      o.patientName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      o.mrn.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      o.testName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      o.date.toLowerCase().includes(historySearchQuery.toLowerCase());
    return isCompleted && matchesSearch;
  });

  const columns = [
    {
      header: 'Prescribed Date',
      accessor: (row: LabOrderRecord) => (
        <span className="font-bold text-slate-900 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {row.date}
        </span>
      ),
    },
    {
      header: 'Patient Name & MRN',
      accessor: (row: LabOrderRecord) => (
        <div>
          <span className="font-black text-slate-900 block">{row.patientName}</span>
          <span className="text-xs font-bold text-indigo-600 block">{row.mrn}</span>
        </div>
      ),
    },
    {
      header: 'Prescribed Test',
      accessor: (row: LabOrderRecord) => (
        <div>
          <span className="font-black text-indigo-950 text-xs block">{row.testName}</span>
          <span className="text-[10px] text-slate-500 font-bold block">{row.category} • {row.specimen}</span>
        </div>
      ),
    },
    {
      header: 'Ordering Doctor',
      accessor: (row: LabOrderRecord) => (
        <span className="font-bold text-slate-700">{row.doctorName}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: LabOrderRecord) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status === 'REPORT_SUBMITTED'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
          }`}
        >
          {row.status === 'REPORT_SUBMITTED' ? '✓ Report Submitted' : 'Sample Processing'}
        </span>
      ),
    },
    {
      header: 'Lab Action',
      accessor: (row: LabOrderRecord) => (
        <button
          onClick={() => openReportModal(row)}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Make & Submit Report</span>
        </button>
      ),
    },
  ];

  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);

  return (
    <div className="space-y-8 relative">
      {/* Pharmacy & Reagents Purchase Modal */}
      <PharmacyPurchaseModal
        isOpen={isPharmacyModalOpen}
        onClose={() => setIsPharmacyModalOpen(false)}
        patientName={techDisplayName}
        userRole="LAB_ASSISTANT"
      />

      {/* Payment Gateway Sandbox Modal (Staff Procurement Gateway) */}
      <PaymentModal
        isOpen={isProcurementModalOpen}
        onClose={() => setIsProcurementModalOpen(false)}
        itemTitle="Hematology & Pathology Reagents Kit (500 Tests)"
        itemCategory="HOSPITAL_SUPPLY"
        amount="₹18,500"
        patientName={techDisplayName}
        userRole="LAB_TECH"
        onPaymentSuccess={() => {
          showToast({ title: 'Lab PO Cleared!', message: 'Reagent supply order dispatched to Central Pharmacy Stock.', type: 'success' });
        }}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Pathology & Diagnostics Station
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              ISO-15189 Certified
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-indigo-600" />
            Welcome, {techDisplayName}
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Pathology Laboratory Workstation • Diagnostic Report Generation & Physician Dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPharmacyModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-purple-200" />
            <span>Order Lab Reagents & Pharmacy Supplies</span>
          </button>

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Pathology & Diagnostic History Vault</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Diagnostic Tests Done" value={`${historyOrders.length + 42} Conducted`} change={18.4} changeLabel="total tests done" icon={FlaskConical} />
        <StatCard title="Pending Diagnostic Orders" value={`${pendingOrders.length} Sample Orders`} change={-2.0} changeLabel="active queue" icon={Clock} />
        <StatCard title="Lab Equipment Assets" value={`₹${getLabEquipmentInvoices().reduce((a, b) => a + b.totalCost, 0).toLocaleString('en-IN')}`} change={12.5} changeLabel="analyzers & centrifuges" icon={Building2} />
        <StatCard title="Specimen Quality Assurance" value="100% Verified" change={0.0} changeLabel="zero errors" icon={CheckCircle2} />
      </div>

      {/* Lab Equipment & Reagents Purchase Invoices */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Lab Equipment & Reagent Purchase Ledger
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Itemized equipment purchases, model numbers, vendor invoices, cost telemetry, and warranty maintenance logs.
            </p>
          </div>

          <button
            onClick={() => {
              showToast({
                title: 'Log New Equipment Purchase 🔬',
                message: 'Opening equipment procurement invoice entry studio...',
                type: 'info',
              });
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
          >
            + Log Equipment Purchase Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getLabEquipmentInvoices().map((eqp) => (
            <div key={eqp.id} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <div>
                  <span className="font-mono font-black text-indigo-600 text-xs block">{eqp.invoiceNo}</span>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">{eqp.equipmentName}</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-full uppercase border border-indigo-300">
                  {eqp.maintenanceStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Vendor: <strong className="text-slate-800">{eqp.vendorName}</strong></span>
                  <span>Date: <strong className="text-slate-800">{eqp.purchaseDate}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>Model/Serial: <strong className="text-indigo-900">{eqp.modelNumber} ({eqp.serialNumber})</strong></span>
                  <span>Warranty: <strong className="text-emerald-700">{eqp.warrantyPeriod}</strong></span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Equipment Cost:</span>
                  <span className="text-indigo-700">₹{eqp.totalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast({
                    title: 'Downloading Equipment Invoice 📄',
                    message: `Exporting equipment purchase invoice #${eqp.invoiceNo}...`,
                    type: 'info',
                  });
                  printVendorEquipmentInvoicePdf({
                    equipmentCode: eqp.invoiceNo,
                    equipmentName: eqp.equipmentName,
                    vendorName: eqp.vendorName,
                    modelSerial: `${eqp.modelNumber} (${eqp.serialNumber})`,
                    warranty: eqp.warrantyPeriod,
                    date: eqp.purchaseDate,
                    cost: `₹${eqp.cost.toLocaleString('en-IN')}`,
                    status: eqp.maintenanceStatus,
                  });
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Print Vendor Equipment Invoice PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Diagnostic Queue */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            PENDING DIAGNOSTIC LAB ORDERS QUEUE ({pendingOrders.length} ORDERS)
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Patient Name, MRN or Test..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {pendingOrders.length > 0 ? (
          <DataTable columns={columns} data={pendingOrders} />
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Pathology & Diagnostic Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no pending lab diagnostic orders. When attending physicians prescribe lab tests for OPD or ward patients, orders will populate here in real-time.
            </p>
          </div>
        )}
      </div>

      {/* Lab Report Submission Modal */}
      <AnimatePresence>
        {isReportModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Generate & Submit Diagnostic Report</h3>
                    <p className="text-xs font-semibold text-slate-500">Order #{selectedOrder.rxNumber} • Dispatches to {selectedOrder.doctorName}</p>
                  </div>
                </div>
                <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info Summary */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl grid grid-cols-2 gap-2 text-xs font-semibold">
                <div><span className="text-slate-500 block text-[10px] font-bold uppercase">PATIENT NAME & MRN</span><strong>{selectedOrder.patientName} ({selectedOrder.mrn})</strong></div>
                <div><span className="text-slate-500 block text-[10px] font-bold uppercase">PRESCRIBED DIAGNOSTIC TEST</span><strong className="text-indigo-900">{selectedOrder.testName}</strong></div>
                <div><span className="text-slate-500 block text-[10px] font-bold uppercase">PRESCRIBING DOCTOR</span><strong>{selectedOrder.doctorName}</strong></div>
                <div><span className="text-slate-500 block text-[10px] font-bold uppercase">SPECIMEN / FASTING</span><strong>{selectedOrder.specimen} ({selectedOrder.fastingRequirement})</strong></div>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label htmlFor="labFindings" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    LAB FINDINGS & TEST VALUES
                  </label>
                  <textarea
                    id="labFindings"
                    required
                    rows={3}
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Enter test result numbers, reference intervals, or pathology findings..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label htmlFor="pathologistNotes" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    PATHOLOGIST CLINICAL IMPRESSION & REMARKS
                  </label>
                  <input
                    id="pathologistNotes"
                    type="text"
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Normal parameters. No signs of infection..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer">
                    <Send className="w-4 h-4" />
                    <span>Submit & Dispatch Report to Doctor</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pathology & Diagnostic History Vault Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Pathology & Diagnostic Test History Vault</h3>
                    <p className="text-xs font-semibold text-slate-500">View complete audit trail of which patient performed which test on which date</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter diagnostic history by Patient Name, MRN Code, Test Name or Date..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-3">
                {historyOrders.map((ho) => (
                  <div key={ho.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{ho.patientName} ({ho.mrn})</span>
                        <span className="text-xs font-bold text-indigo-700 block">🔬 {ho.testName} ({ho.category})</span>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg border border-emerald-200 block">✓ Report Submitted</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1">Date: {ho.date}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-slate-800">
                      <div className="font-bold">Doctor: {ho.doctorName} ({ho.department})</div>
                      <div className="font-semibold text-slate-700">Findings: {ho.report?.findings || 'Standard Values'}</div>
                      <div className="text-slate-600 italic">Notes: {ho.report?.notes || 'Completed'}</div>
                      <div className="text-[10px] text-slate-400 pt-0.5">Report generated by {ho.report?.technicianName || 'Pathology Staff'} at {ho.report?.submittedAt || ho.date}</div>
                    </div>
                  </div>
                ))}

                {historyOrders.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
                    No submitted lab test history records found matching "{historySearchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
