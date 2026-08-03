'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  ArrowRightLeft,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Clock,
  Activity,
  ShieldCheck,
  Stethoscope,
  Building2,
  Check,
  X,
  FileCheck2
} from 'lucide-react';
import { BloodBankModal } from '../shared/BloodBankModal';
import { useToast } from '../../context/ToastContext';
import { printOfficialGstInvoicePdf } from '../../lib/singlePageReceiptPdf';
import {
  BloodTransfusionRequest,
  getBloodRequests,
  doctorApproveBloodRequest,
  bloodBankDispatchBloodRequest
} from '../../data/patientCensusStore';

interface BloodStock {
  group: string;
  units: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  shelfLifeDays: number;
}

export const BloodBankDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfusions' | 'donors'>('transfusions');
  const [searchTerm, setSearchTerm] = useState('');

  const [bloodRequests, setBloodRequests] = useState<BloodTransfusionRequest[]>([]);

  const [stocks, setStocks] = useState<BloodStock[]>([
    { group: 'A+', units: 28, status: 'OPTIMAL', shelfLifeDays: 35 },
    { group: 'A-', units: 6, status: 'CRITICAL', shelfLifeDays: 22 },
    { group: 'B+', units: 34, status: 'OPTIMAL', shelfLifeDays: 40 },
    { group: 'B-', units: 9, status: 'MODERATE', shelfLifeDays: 18 },
    { group: 'AB+', units: 15, status: 'OPTIMAL', shelfLifeDays: 29 },
    { group: 'AB-', units: 4, status: 'CRITICAL', shelfLifeDays: 14 },
    { group: 'O+', units: 48, status: 'OPTIMAL', shelfLifeDays: 42 },
    { group: 'O-', units: 12, status: 'MODERATE', shelfLifeDays: 25 },
  ]);

  const donors = [
    { id: 'DN-301', name: 'Amitabh Sen', group: 'O+', contact: '+91 98765 xxxxx', lastDonated: '2026-07-20', status: 'ELIGIBLE' },
    { id: 'DN-302', name: 'Kavita Reddy', group: 'A-', contact: '+91 91234 xxxxx', lastDonated: '2026-06-15', status: 'ELIGIBLE' },
    { id: 'DN-303', name: 'Suresh Menon', group: 'B+', contact: '+91 99887 xxxxx', lastDonated: '2026-07-26', status: 'DONATED_TODAY' },
    { id: 'DN-304', name: 'Pooja Hegde', group: 'O-', contact: '+91 94433 xxxxx', lastDonated: '2026-05-10', status: 'ELIGIBLE' },
  ];

  const loadRequests = () => {
    setBloodRequests(getBloodRequests());
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDoctorApprove = (reqId: string, doctorName: string) => {
    const updated = doctorApproveBloodRequest(reqId, doctorName);
    setBloodRequests(updated);
    showToast({
      title: 'Doctor Approved Blood Request 🩺',
      message: `Request #${reqId} approved by ${doctorName}. Now pending Blood Bank Admin dispatch clearance.`,
      type: 'success',
    });
  };

  const handleBloodBankDispatch = (reqId: string) => {
    const updated = bloodBankDispatchBloodRequest(reqId);
    setBloodRequests(updated);
    showToast({
      title: 'Blood Unit Dispatched & Released! 🩸',
      message: `Request #${reqId} cleared by Blood Bank Admin. Blood bag dispatched to ward.`,
      type: 'success',
    });
  };

  const handleAddUnit = (group: string) => {
    setStocks(prev =>
      prev.map(s => s.group === group ? { ...s, units: s.units + 1, status: s.units + 1 > 10 ? 'OPTIMAL' : 'MODERATE' } : s)
    );
    showToast({ title: 'Reserve Stock Updated', message: `Added +1 Unit to ${group} Blood Reserve Stock`, type: 'success' });
  };

  const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
  const criticalGroups = stocks.filter(s => s.status === 'CRITICAL').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Droplets className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-200 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Dual-Approval Blood Transfusion & Dispatch Pipeline
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Blood Bank Admin Portal</h1>
            <p className="text-xs md:text-sm text-red-100/80 font-medium max-w-2xl">
              Strict 2-step verification protocol: Patient/Nurse Request ➔ Doctor Approval ➔ Blood Bank Admin Final Clearance & Dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                showToast({
                  title: 'Transfusion Invoice Issued 🩸',
                  message: 'Generated itemized Blood Transfusion Invoice #BT-2026-9901 for John Doe (2 Units O- @ ₹1,800/unit + Crossmatch ₹450 = ₹4,252 incl. GST).',
                  type: 'success',
                });
                printOfficialGstInvoicePdf({
                  invoiceId: 'BT-2026-9901',
                  patientName: 'John Doe',
                  mrn: 'MC-1092',
                  email: 'johndoe@medflow.com',
                  phone: '+91 98765 11223',
                  date: new Date().toISOString().split('T')[0],
                  department: 'Emergency & Blood Bank',
                  doctorName: 'Dr. Gregory House',
                  tpaApproved: true,
                  lineItems: [
                    { category: 'BLOOD_BANK', description: 'O- Negative Emergency PRBC Transfusion (2 Units)', qty: 2, unitPrice: 1800, total: 3600, tpaCovered: true },
                    { category: 'LAB_TEST', description: 'Serological Crossmatch & Antibody Screening Panel', qty: 1, unitPrice: 450, total: 450, tpaCovered: true },
                  ],
                  subtotal: 4050,
                  gstTax: 202.5,
                  grandTotal: 4252.5,
                  tpaCoverage: 3600,
                  netPayable: 652.5,
                });
              }}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Droplets className="w-4 h-4" />
              Issue Blood & Bill Patient
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Rapid Donor Exchange
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reserve Units</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalUnits}</span>
            <span className="text-xs text-emerald-600 font-bold">Units in Vault</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Ready for emergency dispatch</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Doctor Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">
              {bloodRequests.filter(r => r.doctorStatus === 'PENDING').length}
            </span>
            <span className="text-xs text-amber-600 font-bold">Awaiting Doctor</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Phase 1 Verification Queue</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Dispatch Clearance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {bloodRequests.filter(r => r.doctorStatus === 'APPROVED' && r.bloodBankAdminStatus === 'PENDING').length}
            </span>
            <span className="text-xs text-blue-600 font-bold">Ready for Dispatch</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Phase 2 Blood Bank Admin Queue</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Dispatched Blood Units</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">
              {bloodRequests.filter(r => r.bloodBankAdminStatus === 'DISPATCHED').length}
            </span>
            <span className="text-xs text-emerald-600 font-bold">Released to Wards</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Fully dual-approved & released</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('transfusions')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'transfusions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual-Approval Transfusions ({bloodRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Blood Reserves
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeTab === 'donors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donor Registry ({donors.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blood group, donor, or patient..."
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        {/* Tab 1: Dual-Approval Transfusions Queue */}
        {activeTab === 'transfusions' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span><strong>Dual-Approval Workflow Enforced:</strong> Blood units are held in vault until <strong>Attending Doctor</strong> signs clinical approval AND <strong>Blood Bank Admin</strong> releases dispatch code.</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Request Ref</th>
                    <th className="pb-3">Patient Name & MRN</th>
                    <th className="pb-3">Group & Units</th>
                    <th className="pb-3">Requested By & Physician</th>
                    <th className="pb-3">Step 1: Doctor Approval</th>
                    <th className="pb-3">Step 2: Blood Bank Admin Dispatch</th>
                    <th className="pb-3 text-right">Action Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {bloodRequests
                    .filter((r) => !searchTerm || r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || r.mrn.toLowerCase().includes(searchTerm.toLowerCase()) || r.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-black text-blue-700">{r.id}</td>
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{r.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{r.mrn}</div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded-md">
                            {r.bloodGroup} • {r.units} Unit(s)
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-800 font-bold">{r.requestedBy}</div>
                          <div className="text-[10px] text-slate-500">Doctor: {r.doctorName}</div>
                        </td>

                        {/* Step 1: Doctor Status */}
                        <td className="py-3">
                          {r.doctorStatus === 'APPROVED' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                                <Check className="w-3 h-3" /> Doctor Approved
                              </span>
                              <div className="text-[9px] text-slate-400 mt-0.5">{r.doctorApprovedAt}</div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <Clock className="w-3 h-3 animate-spin" /> Pending Doctor Sign-Off
                            </span>
                          )}
                        </td>

                        {/* Step 2: Blood Bank Status */}
                        <td className="py-3">
                          {r.bloodBankAdminStatus === 'DISPATCHED' ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                <Droplets className="w-3 h-3 text-rose-600" /> Dispatched ({r.dispatchCode})
                              </span>
                              <div className="text-[9px] text-slate-400 mt-0.5">{r.bloodBankDispatchedAt}</div>
                            </div>
                          ) : r.doctorStatus === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              <Building2 className="w-3 h-3" /> Ready for Admin Dispatch
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] italic">Awaiting Step 1 Approval</span>
                          )}
                        </td>

                        {/* Dual Approval Trigger Buttons */}
                        <td className="py-3 text-right space-y-1">
                          {r.doctorStatus === 'PENDING' && (
                            <button
                              onClick={() => handleDoctorApprove(r.id, r.doctorName)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                            >
                              <Stethoscope className="w-3.5 h-3.5" /> Doctor Approve
                            </button>
                          )}

                          {r.doctorStatus === 'APPROVED' && r.bloodBankAdminStatus === 'PENDING' && (
                            <button
                              onClick={() => handleBloodBankDispatch(r.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                            >
                              <Droplets className="w-3.5 h-3.5" /> Approve & Dispatch Blood Unit
                            </button>
                          )}

                          {r.bloodBankAdminStatus === 'DISPATCHED' && (
                            <span className="text-[10px] text-slate-400 font-bold block">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Blood Reserves Grid */}
        {activeTab === 'inventory' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stocks
                .filter((s) => !searchTerm || s.group.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((stock) => (
                  <motion.div
                    key={stock.group}
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl relative overflow-hidden space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-lg shadow-2xs">
                        {stock.group}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          stock.status === 'OPTIMAL'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : stock.status === 'MODERATE'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                        }`}
                      >
                        {stock.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{stock.units}</span>
                        <span className="text-xs font-bold text-slate-500">units</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Avg shelf life: {stock.shelfLifeDays} days
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleAddUnit(stock.group)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus className="w-3 h-3" /> Add Unit
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Exchange
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Donor Registry */}
        {activeTab === 'donors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Donor ID</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Blood Group</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Last Donation Date</th>
                  <th className="pb-3">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {donors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{d.id}</td>
                    <td className="py-3 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-md">
                        {d.group}
                      </span>
                    </td>
                    <td className="py-3">{d.contact}</td>
                    <td className="py-3">{d.lastDonated}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <BloodBankModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
