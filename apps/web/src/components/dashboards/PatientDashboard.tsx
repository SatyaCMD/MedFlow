'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../shared/PaymentModal';
import { PrescriptionPdfModal, PrescriptionData } from '../shared/PrescriptionPdfModal';
import { LabReportPdfModal, LabReportModalData } from '../shared/LabReportPdfModal';
import { PharmacyPurchaseModal } from '../shared/PharmacyPurchaseModal';
import { AmbulanceTrackerModal } from '../shared/AmbulanceTrackerModal';
import { BookDoctorVisitModal, FollowUpContext } from '../shared/BookDoctorVisitModal';
import {
  getSharedAppointments,
  updateSharedAppointmentPaid,
  simulateThreeDayRefundForDemo,
  SharedAppointment,
} from '../../data/appointmentStore';
import {
  getClinicalRecords,
  getLabOrders,
  ClinicalRecord,
  LabOrderRecord,
} from '../../data/medicalHistoryStore';
import { getPatientInvoices } from '../../data/patientBillingStore';
import {
  getPatientWallet,
  PatientWallet,
} from '../../data/patientWalletStore';
import {
  User,
  Calendar,
  FileText,
  Clock,
  Download,
  CheckCircle2,
  HeartPulse,
  Pill,
  Plus,
  X,
  Sparkles,
  CreditCard,
  FileSignature,
  ShoppingBag,
  Siren,
  History,
  FlaskConical,
  ShieldCheck,
  Search,
  Droplet,
  Copy,
  Check,
  Wallet,
  ArrowUpRight,
  Zap,
  Activity,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

import { useAuth, getResolvedPatientProfile } from '../../hooks/useAuth';

const getOrGeneratePermanentAbhaId = (userIdOrEmail?: string) => {
  const storageKey = `medflow_permanent_abha_id_${userIdOrEmail || 'patient'}`;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
  }

  // Generate random permanent 14-digit ABHA ID (format: 91-XX-XXXX-XXXX)
  const p1 = Math.floor(10 + Math.random() * 90);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  const newAbha = `91-${p1}-${p2}-${p3}`;

  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, newAbha);
  }
  return newAbha;
};

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const activeProfile = getResolvedPatientProfile(user);
  const displayName = activeProfile.displayName;
  const userIdentifier = user?.id || user?.email || 'patient';

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'ongoing' | 'history' | 'billing'>('overview');
  const [copiedAbha, setCopiedAbha] = useState(false);

  // Permanent ABHA ID per user (persisted in localStorage)
  const [abhaId, setAbhaId] = useState<string>('91-41-5761-4199');

  useEffect(() => {
    const permanentAbha = getOrGeneratePermanentAbhaId(userIdentifier);
    setAbhaId(permanentAbha);
  }, [userIdentifier]);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);
  const [activePrescriptionData, setActivePrescriptionData] = useState<PrescriptionData | undefined>(undefined);

  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState(false);
  const [activeLabReportData, setActiveLabReportData] = useState<LabReportModalData | undefined>(undefined);

  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isAmbulanceTrackerOpen, setIsAmbulanceTrackerOpen] = useState(false);

  // Wallet & Transactions state
  const [patientWallet, setPatientWallet] = useState<PatientWallet>(() => getPatientWallet());
  const [isWalletLogOpen, setIsWalletLogOpen] = useState(false);

  const refreshWallet = () => {
    setPatientWallet(getPatientWallet());
  };

  useEffect(() => {
    refreshWallet();
    if (typeof window !== 'undefined') {
      window.addEventListener('medflow-wallet-updated', refreshWallet);
      window.addEventListener('storage', refreshWallet);
      return () => {
        window.removeEventListener('medflow-wallet-updated', refreshWallet);
        window.removeEventListener('storage', refreshWallet);
      };
    }
  }, []);

  // Follow-up consultation booking context
  const [followUpContext, setFollowUpContext] = useState<FollowUpContext | null>(null);

  const [paymentTarget, setPaymentTarget] = useState({
    appointmentId: '',
    title: 'Full Blood Chemistry Panel Test Fee',
    category: 'LAB_TEST' as 'APPOINTMENT' | 'LAB_TEST' | 'BLOOD_BANK' | 'PHARMACY' | 'HOSPITAL_SUPPLY',
    amount: '₹800',
    patientName: displayName,
  });

  // Real Appointments State from Shared Store
  const [appointments, setAppointments] = useState<SharedAppointment[]>(() => getSharedAppointments());

  const refreshAppointments = () => {
    setAppointments(getSharedAppointments());
  };

  useEffect(() => {
    refreshAppointments();
    if (typeof window !== 'undefined') {
      window.addEventListener('medflow-appointment-updated', refreshAppointments);
      window.addEventListener('storage', refreshAppointments);
      window.addEventListener('focus', refreshAppointments);
      return () => {
        window.removeEventListener('medflow-appointment-updated', refreshAppointments);
        window.removeEventListener('storage', refreshAppointments);
        window.removeEventListener('focus', refreshAppointments);
      };
    }
  }, []);

  // Clinical records from store
  const [myRecords, setMyRecords] = useState<ClinicalRecord[]>([]);
  const [myLabOrders, setMyLabOrders] = useState<LabOrderRecord[]>([]);

  const refreshClinicalRecords = () => {
    const allRecords = getClinicalRecords();
    const allLabOrders = getLabOrders();
    setMyRecords(allRecords);
    setMyLabOrders(allLabOrders);
  };

  useEffect(() => {
    refreshClinicalRecords();
    if (typeof window !== 'undefined') {
      window.addEventListener('medflow-clinical-records-updated', refreshClinicalRecords);
      window.addEventListener('medflow-appointment-updated', refreshClinicalRecords);
      window.addEventListener('storage', refreshClinicalRecords);
      window.addEventListener('focus', refreshClinicalRecords);
      return () => {
        window.removeEventListener('medflow-clinical-records-updated', refreshClinicalRecords);
        window.removeEventListener('medflow-appointment-updated', refreshClinicalRecords);
        window.removeEventListener('storage', refreshClinicalRecords);
        window.removeEventListener('focus', refreshClinicalRecords);
      };
    }
  }, []);

  const handleProceedToPaymentFromBookModal = (bookingDetails: any) => {
    setIsBookModalOpen(false);
    refreshAppointments();

    const recentApps = getSharedAppointments();
    const targetApp = recentApps[0];

    if (targetApp) {
      setPaymentTarget({
        appointmentId: targetApp.id,
        title: `Doctor Consultation — ${bookingDetails.doctor.name} (${bookingDetails.department})`,
        category: 'APPOINTMENT',
        amount: bookingDetails.amount || '₹1,500',
        patientName: bookingDetails.patientName || displayName,
      });

      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = (receipt: any) => {
    if (paymentTarget.appointmentId) {
      updateSharedAppointmentPaid(paymentTarget.appointmentId, true);
    }
    refreshAppointments();

    showToast({
      title: 'Payment Confirmed! 💳',
      message: `Transaction ${receipt.transactionId} verified. Consultation fee marked as PAID.`,
      type: 'success',
    });
  };

  const handleCopyAbha = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(abhaId);
      setCopiedAbha(true);
      showToast({
        title: 'ABHA ID Copied! 📋',
        message: `Permanent Health ID ${abhaId} copied to clipboard.`,
        type: 'info',
      });
      setTimeout(() => setCopiedAbha(false), 2000);
    }
  };

  // Demo 3-day Auto-Refund Trigger Handler
  const handleTestAutoRefund = () => {
    const res = simulateThreeDayRefundForDemo();
    if (res.success && res.refundedApp) {
      refreshAppointments();
      refreshWallet();
      showToast({
        title: '💰 Wallet Auto-Refund Processed!',
        message: `₹${res.amount} refunded to your Patient Wallet for unapproved Appointment #${res.refundedApp.id} (3-Day Expiry Guarantee).`,
        type: 'success',
      });
    } else {
      showToast({
        title: 'Refund Engine Check Completed',
        message: 'All unapproved appointments are within the 3-day window.',
        type: 'info',
      });
    }
  };

  // Handler to open prescription PDF modal
  const handleOpenRxPdf = (prescriptionData?: any) => {
    setActivePrescriptionData(prescriptionData);
    setIsRxPdfOpen(true);
  };

  // Handler to open lab report PDF modal
  const handleOpenLabReportPdf = (testName?: string, doctorName?: string, dept?: string) => {
    setActiveLabReportData({
      reportId: `LAB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: displayName,
      mrn: 'MC-1001',
      age: '19 Yrs',
      gender: 'Male',
      doctorName: doctorName || 'Dr. Devendra Roy, M.D.',
      department: dept || 'Cardiology & Diagnostic Pathology',
      testName: testName || 'Comprehensive Pathology & Lipid Audit',
      category: 'Blood Pathology & Cardiac Markers',
      specimen: 'Venous Blood Serum',
      sampleCollectedAt: 'Jul 21, 2026 • 08:30 AM',
      reportDate: 'Jul 21, 2026 • 04:30 PM',
      technicianName: 'Rajesh Kumar, Chief Pathology Specialist',
      findings: [
        { parameter: 'Total Cholesterol', result: '215', unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'ELEVATED' },
        { parameter: 'HDL (High-Density Lipoprotein)', result: '46', unit: 'mg/dL', referenceRange: '> 40 mg/dL', status: 'NORMAL' },
        { parameter: 'LDL (Low-Density Lipoprotein)', result: '138', unit: 'mg/dL', referenceRange: '< 100 mg/dL', status: 'ELEVATED' },
        { parameter: 'Triglycerides', result: '160', unit: 'mg/dL', referenceRange: '< 150 mg/dL', status: 'ELEVATED' },
      ],
      overallInterpretation: 'Mild hyperlipidemia noted. Diagnostic report verified and signed off by laboratory pathologist.',
      signatureHash: 'SHA256: 9e0011a45bb921c44fae8901239ab',
    });
    setIsLabReportModalOpen(true);
  };

  // Handler to trigger follow-up booking
  const handleBookFollowUp = (rxNumber?: string, doctorName?: string, department?: string, diagnosis?: string) => {
    setFollowUpContext({
      isFollowUp: true,
      rxNumber: rxNumber || 'RX-2026-9901',
      doctorName: doctorName || 'Dr. Devendra Roy',
      department: department || 'Cardiology',
      diagnosis: diagnosis || 'Essential Hypertension',
      discountPercent: 60, // 60% discount on follow-up visit for same diagnosis!
    });
    setIsBookModalOpen(true);
  };

  const appointmentColumns = [
    {
      header: 'Date & Time',
      accessor: (row: SharedAppointment) => <span className="font-bold">{row.date} {row.timeSlot}</span>,
    },
    {
      header: 'Attending Doctor',
      accessor: (row: SharedAppointment) => <span className="font-bold text-slate-900">{row.doctorName}</span>,
    },
    {
      header: 'Department',
      accessor: (row: SharedAppointment) => <span className="font-semibold text-blue-600">{row.department}</span>,
    },
    {
      header: 'Clinic Location',
      accessor: (row: SharedAppointment) => <span className="text-slate-600">{row.location}</span>,
    },
    {
      header: 'Status',
      accessor: (row: SharedAppointment) => {
        if (row.status === 'EXPIRED & REFUNDED') {
          return (
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 w-fit">
                <Wallet className="w-3 h-3 text-purple-600" /> AUTO-REFUNDED TO WALLET
              </span>
              <span className="text-[10px] text-purple-700 font-bold block">
                3-Day Doctor Approval Expiry
              </span>
            </div>
          );
        }
        if (row.status === 'PENDING DOCTOR APPROVAL') {
          return (
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 w-fit">
                <Clock className="w-3 h-3 text-amber-600 animate-spin" /> PENDING DOCTOR APPROVAL
              </span>
              <span className="text-[10px] text-amber-800 font-extrabold flex items-center gap-1">
                ⏱ Auto-refunds in 2d 18h if unapproved
              </span>
            </div>
          );
        }
        if (row.status === 'Completed & Prescribed' || row.hasPrescription) {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> COMPLETED & PRESCRIBED
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: SharedAppointment) => {
        if (row.status === 'EXPIRED & REFUNDED') {
          return (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-50 text-purple-900 font-black text-xs rounded-xl border border-purple-300 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-purple-600" /> {row.amount} Credited ✓
              </span>
            </div>
          );
        }

        if (row.hasPrescription || row.status === 'Completed & Prescribed') {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenRxPdf(row.prescriptionData)}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                title="Download Official Prescription PDF"
              >
                <Download className="w-3.5 h-3.5" /> Download Rx 📥
              </button>
              <button
                onClick={() => {
                  setPaymentTarget({
                    appointmentId: row.id,
                    title: `Consultation Fee — ${row.doctorName}`,
                    category: 'APPOINTMENT',
                    amount: row.amount || '₹1,500',
                    patientName: displayName,
                  });
                  setIsPaymentModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                title="View Tax Receipt Slip"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" /> Receipt
              </button>
            </div>
          );
        }

        return row.isPaid ? (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid ✓
            </span>
            <button
              onClick={() => {
                setPaymentTarget({
                  appointmentId: row.id,
                  title: `Consultation Fee — ${row.doctorName}`,
                  category: 'APPOINTMENT',
                  amount: row.amount || '₹1,500',
                  patientName: displayName,
                });
                setIsPaymentModalOpen(true);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              title="View Tax Receipt Slip"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" /> Receipt
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setPaymentTarget({
                appointmentId: row.id,
                title: `Consultation Fee — ${row.doctorName}`,
                category: 'APPOINTMENT',
                amount: row.amount || '₹1,500',
                patientName: displayName,
              });
              setIsPaymentModalOpen(true);
            }}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
          >
            <CreditCard className="w-3.5 h-3.5" /> Pay Fee
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Interactive Prescription PDF Modal */}
      <PrescriptionPdfModal
        isOpen={isRxPdfOpen}
        onClose={() => setIsRxPdfOpen(false)}
        prescriptionData={activePrescriptionData}
      />

      {/* Interactive Diagnostic Lab Report PDF Modal */}
      <LabReportPdfModal
        isOpen={isLabReportModalOpen}
        onClose={() => setIsLabReportModalOpen(false)}
        reportData={activeLabReportData}
      />

      {/* Interactive Pharmacy Digital Store Modal */}
      <PharmacyPurchaseModal
        isOpen={isPharmacyOpen}
        onClose={() => setIsPharmacyOpen(false)}
        patientName={displayName}
      />

      {/* Interactive Live Ambulance Tracker Modal */}
      <AmbulanceTrackerModal isOpen={isAmbulanceTrackerOpen} onClose={() => setIsAmbulanceTrackerOpen(false)} />

      {/* Book Doctor Visit Modal */}
      <BookDoctorVisitModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setFollowUpContext(null);
        }}
        onProceedToPayment={handleProceedToPaymentFromBookModal}
        followUpContext={followUpContext}
      />

      {/* Payment Gateway Sandbox Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        itemTitle={paymentTarget.title}
        itemCategory={paymentTarget.category}
        amount={paymentTarget.amount}
        patientName={paymentTarget.patientName}
        userRole="PATIENT"
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* PATIENT WALLET TRANSACTION HISTORY MODAL */}
      <AnimatePresence>
        {isWalletLogOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Patient Digital Wallet</h3>
                    <p className="text-xs font-semibold text-slate-500">Available Balance: ₹{patientWallet.balance.toLocaleString('en-IN')}.00</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWalletLogOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {patientWallet.transactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{tx.description}</span>
                      <span className="text-[10px] text-slate-500 font-bold block">{tx.date} • Ref #{tx.id}</span>
                    </div>
                    <span className={`font-black text-xs px-2.5 py-1 rounded-xl ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setIsWalletLogOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Wallet Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Header Greeting & Permanent ABHA ID */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-xs rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Patient Health Portal Active</span>
            </span>

            {/* Permanent ABHA ID Pill */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-full border border-slate-700 shadow-xs">
              <span className="text-xs font-mono font-bold text-blue-300">ABHA ID: {abhaId}</span>
              <button
                onClick={handleCopyAbha}
                title="Copy Permanent ABHA Health ID"
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
              >
                {copiedAbha ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, {displayName} 👋</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage your doctor consultations, digital prescriptions, lab results, pharmacy orders, and live emergency support.
          </p>
        </div>

        {/* Patient Wallet Card & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Digital Wallet Pill Widget */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl flex items-center justify-between gap-4 w-full sm:w-auto shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Wallet</span>
                <span className="text-sm font-black text-white">₹{patientWallet.balance.toLocaleString('en-IN')}.00</span>
              </div>
            </div>
            <button
              onClick={() => setIsWalletLogOpen(true)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] rounded-xl cursor-pointer transition-all flex items-center gap-1"
            >
              Log <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => {
              setActiveTab('history');
              showToast({ title: 'Viewing 1-Year History 📜', message: 'Switched to Medical & Prescription Vault.', type: 'info' });
            }}
            className={`px-4 py-3 font-extrabold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] ${
              activeTab === 'history'
                ? 'bg-indigo-500 text-white shadow-indigo-500/40 ring-2 ring-indigo-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <History className="w-4 h-4 text-indigo-200" /> History Vault
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Book Doctor Visit
          </button>
        </div>
      </div>

      {/* Main Tabbed Navigation Bar */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Overview & OPD Visits</span>
          </button>

          {/* DEDICATED TAB: ONGOING DIAGNOSIS */}
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ongoing'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-950" />
            <span>Ongoing Diagnosis ({myLabOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Medical & Prescription History ({myRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-white text-slate-900 shadow-md border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>My Billing & GST Invoices</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SCHEDULED VISITS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Patient Key Metrics Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Upcoming Appointments" value={`${appointments.length} Visits`} change={appointments.length > 0 ? 1.0 : 0.0} changeLabel="active bookings" icon={Calendar} />
            <StatCard title="Patient Wallet Balance" value={`₹${patientWallet.balance.toLocaleString('en-IN')}`} change={0.0} changeLabel="3-day refund protected" icon={Wallet} />
            <StatCard title="Ongoing Diagnoses" value={`${myLabOrders.length} Cases`} change={0.0} changeLabel="diagnostic queue" icon={FlaskConical} />
            <StatCard title="EMR Vault Records" value={`${myRecords.length} Records`} change={myRecords.length > 0 ? 2.0 : 0.0} changeLabel="1-year window" icon={FileText} />
          </div>

          {/* My Upcoming Appointments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> My Scheduled Appointments
              </h2>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Book Another Visit
              </button>
            </div>

            {appointments.length > 0 ? (
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                currentPage={currentPage}
                totalPages={1}
                onPageChange={(page) => setCurrentPage(page)}
              />
            ) : (
              <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">No Appointments Booked Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You currently have no scheduled OPD appointments. Click "Book Doctor Visit" above to consult with our specialist doctors.
                </p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Book Doctor Visit Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEDICATED TAB 2: ONGOING DIAGNOSIS & PENDING LAB TESTS */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" /> ACTIVE ONGOING DIAGNOSIS & PENDING TESTS
            </h2>
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              Active Evaluation Workstation
            </span>
          </div>

          {/* Ongoing Diagnosis Cards */}
          <div className="grid grid-cols-1 gap-4">
            {myRecords.map((rec) => (
              <div key={rec.id} className="p-6 bg-amber-50/40 border border-amber-200 rounded-3xl space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-950 border border-amber-400">
                        DIAGNOSIS ONGOING
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600">Rx #{rec.rxNumber}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base mt-1">{rec.diagnosis}</h3>
                    <span className="text-xs font-semibold text-slate-600">Attending Doctor: {rec.doctorName} ({rec.department})</span>
                  </div>

                  {/* 50% - 75% Follow-Up Visit Discount Action */}
                  <button
                    onClick={() => handleBookFollowUp(rec.rxNumber, rec.doctorName, rec.department, rec.diagnosis)}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Book Follow-Up Visit (50% - 75% Off) 🩺</span>
                  </button>
                </div>

                {/* Ordered Diagnostic Tests Queue */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider block">
                    PRESCRIBED DIAGNOSTIC LAB INVESTIGATIONS REQUIRED:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rec.labTests?.map((test, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-amber-200 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                            <FlaskConical className="w-4 h-4 text-amber-600" /> {test.name}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md border border-amber-300">
                            AWAITING REPORT
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium space-y-0.5">
                          <div>Category: {test.category || 'Diagnostic Pathology'} • Specimen: {test.specimen || 'Serum'}</div>
                          <div className="text-amber-800 font-semibold">{test.instructions || 'Standard Protocol'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/80 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Next Step:</strong> Complete the prescribed lab investigations above. Once your reports are generated, use the button above to book your 2nd follow-up visit at <strong>50% to 75% discount</strong>.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEDICAL & PRESCRIPTION HISTORY (COMPLETED VAULT) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> MY MEDICAL & PRESCRIPTION HISTORY (LAST 1 YEAR WINDOW)
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Strict 365-Day Patient Vault
            </span>
          </div>

          {myRecords.length > 0 ? (
            <div className="space-y-4">
              {myRecords.map((rec) => (
                <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="font-black text-slate-900 text-sm block">Rx #{rec.rxNumber} • {rec.diagnosis}</span>
                      <span className="text-xs font-semibold text-slate-500 block">Attending: {rec.doctorName} ({rec.department})</span>
                    </div>
                    
                    {/* DUAL DOWNLOAD BUTTONS: PRESCRIPTION PDF & LAB REPORT PDF */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-lg border border-emerald-300">
                        ✓ COMPLETED
                      </span>
                      <button
                        onClick={() => handleOpenRxPdf(rec)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-200" /> Download Prescription PDF 📜
                      </button>
                      <button
                        onClick={() => handleOpenLabReportPdf('Lipid Profile & Pathology Audit', rec.doctorName, rec.department)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-200" /> Download Lab Report PDF 🧪
                      </button>
                    </div>
                  </div>

                  {/* Medications List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">PRESCRIBED DOSING SCHEDULE</span>
                    {rec.medications?.map((m, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between">
                        <span className="text-blue-950 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-blue-600" /> {m.name}</span>
                        <span className="text-[11px] text-slate-600">{m.dosage}</span>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostic Lab Tests - Marked Completed */}
                  {rec.labTests && rec.labTests.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black uppercase text-indigo-700 block">COMPLETED DIAGNOSTIC TESTS</span>
                      {rec.labTests.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs font-bold">
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-950 flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-indigo-600" /> {t.name}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                              ✓ REPORT SUBMITTED & COMPLETED
                            </span>
                          </div>
                          <div className="p-2 bg-white rounded-lg text-[11px] text-slate-700 font-semibold mt-1">
                            <div>Findings: Total Cholesterol: 215 mg/dL, HDL: 46 mg/dL, LDL: 138 mg/dL</div>
                            <div className="text-slate-500 italic">Notes: Laboratory controls verified. Signed off by Pathologist.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
              <History className="w-8 h-8 text-indigo-500 mx-auto" />
              <h3 className="font-black text-slate-900 text-sm">No Prior EMR Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Consultation prescriptions and diagnostic reports will automatically archive here in your 365-day vault once issued by your doctor.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MY INDIVIDUAL BILLING & ITEMIZED GST INVOICES */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" /> MY INDIVIDUAL BILLING & ITEMIZED GST INVOICES
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Official Tax Invoices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getPatientInvoices()
              .filter(
                (inv) =>
                  inv.patientName.toLowerCase().includes(displayName.toLowerCase()) ||
                  displayName === 'Patient' ||
                  inv.patientName.includes('Jane Patient') ||
                  inv.patientName.includes('Sarah Connor')
              )
              .map((inv) => (
                <div key={inv.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-black text-blue-600 text-sm block">{inv.invoiceCode}</span>
                      <span className="text-xs font-semibold text-slate-500 block">Date: {inv.date} • {inv.department}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                      {inv.paymentStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-600">
                      <span>Itemized Line Charges:</span>
                      <span>{inv.lineItems.length} Items</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-600">
                      <span>Medical GST (5%):</span>
                      <span>₹{inv.gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 text-sm border-t border-slate-100 pt-2">
                      <span>Total Bill:</span>
                      <span className="text-emerald-700">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast({
                        title: 'Viewing Itemized Invoice 📄',
                        message: `Opening GST Invoice #${inv.invoiceCode}...`,
                        type: 'info',
                      });
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Print Detailed GST Invoice PDF
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
