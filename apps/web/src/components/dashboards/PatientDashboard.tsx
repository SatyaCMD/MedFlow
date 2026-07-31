'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../shared/PaymentModal';
import { PrescriptionPdfModal } from '../shared/PrescriptionPdfModal';
import { PharmacyPurchaseModal } from '../shared/PharmacyPurchaseModal';
import { AmbulanceTrackerModal } from '../shared/AmbulanceTrackerModal';
import { BookDoctorVisitModal } from '../shared/BookDoctorVisitModal';
import {
  getSharedAppointments,
  updateSharedAppointmentPaid,
  SharedAppointment
} from '../../data/appointmentStore';
import {
  getClinicalRecords,
  getLabOrders,
  ClinicalRecord,
  LabOrderRecord
} from '../../data/medicalHistoryStore';
import { getPatientInvoices } from '../../data/patientBillingStore';
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
  RefreshCw
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

const generateUniqueAbhaId = () => {
  const p1 = Math.floor(10 + Math.random() * 90);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  return `91-${p1}-${p2}-${p3}`;
};

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Patient';
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic ABHA ID State
  const [abhaId, setAbhaId] = useState(() => generateUniqueAbhaId());

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isAmbulanceTrackerOpen, setIsAmbulanceTrackerOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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

    // Generate brand new unique ABHA ID on new booking!
    const newAbha = generateUniqueAbhaId();
    setAbhaId(newAbha);

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

  const appointmentColumns = [
    { header: 'Date & Time', accessor: (row: SharedAppointment) => <span className="font-bold">{row.date} {row.timeSlot}</span> },
    { header: 'Attending Doctor', accessor: (row: SharedAppointment) => <span className="font-bold text-slate-900">{row.doctorName}</span> },
    { header: 'Department', accessor: (row: SharedAppointment) => <span className="font-semibold text-blue-600">{row.department}</span> },
    { header: 'Clinic Location', accessor: (row: SharedAppointment) => <span className="text-slate-600">{row.location}</span> },
    {
      header: 'Status',
      accessor: (row: SharedAppointment) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: SharedAppointment) => (
        row.isPaid ? (
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
        )
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Prescription PDF Modal */}
      <PrescriptionPdfModal isOpen={isRxPdfOpen} onClose={() => setIsRxPdfOpen(false)} />

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
        onClose={() => setIsBookModalOpen(false)}
        onProceedToPayment={handleProceedToPaymentFromBookModal}
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

      {/* Patient Header Greeting & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-xs rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Patient Health Portal Active</span>
            </span>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <span className="text-xs font-mono font-bold text-blue-300">ABHA ID: {abhaId}</span>
              <button
                onClick={() => setAbhaId(generateUniqueAbhaId())}
                title="Generate New Unique ABHA ID"
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, {displayName} 👋</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Manage your doctor consultations, digital prescriptions, lab results, pharmacy orders, and live emergency support.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <History className="w-4 h-4 text-indigo-200" /> View History (Last 1 Year)
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Book Doctor Visit
          </button>
        </div>
      </div>

      {/* Patient Key Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Appointments" value={`${appointments.length} Visits`} change={appointments.length > 0 ? 1.0 : 0.0} changeLabel="active bookings" icon={Calendar} />
        <StatCard title="EMR Vault Records" value={`${myRecords.length} Records`} change={myRecords.length > 0 ? 2.0 : 0.0} changeLabel="1-year window" icon={FileText} />
        <StatCard title="Prescribed Lab Tests" value={`${myLabOrders.length} Tests`} change={0.0} changeLabel="diagnostic queue" icon={FlaskConical} />
        <StatCard title="Outstanding Balance" value="₹0.00" change={0.0} changeLabel="all invoices paid" icon={CheckCircle2} />
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

      {/* My EMR Prescriptions & Diagnostic Reports (Last 1 Year) */}
      {myRecords.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> My Medical & Prescription History (Last 1 Year Window)
            </h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Strict 365-Day Patient Vault
            </span>
          </div>

          <div className="space-y-4">
            {myRecords.map((rec) => (
              <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-black text-slate-900 text-sm block">Rx #{rec.rxNumber} • {rec.diagnosis}</span>
                    <span className="text-xs font-semibold text-slate-500 block">Attending: {rec.doctorName} ({rec.department})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-lg border border-blue-200">
                      Date: {rec.date}
                    </span>
                    <button
                      onClick={() => setIsRxPdfOpen(true)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" /> Print PDF
                    </button>
                  </div>
                </div>

                {/* Medications List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Prescribed Dosing Schedule</span>
                  {rec.medications?.map((m, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span className="text-blue-950 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-blue-600" /> {m.name}</span>
                      <span className="text-[11px] text-slate-600">{m.dosage}</span>
                    </div>
                  ))}
                </div>

                {/* Lab Tests */}
                {rec.labTests && rec.labTests.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black uppercase text-indigo-700 block">Ordered Diagnostic Tests</span>
                    {rec.labTests.map((t, idx) => {
                      const labOrder = myLabOrders.find((lo) => lo.testName.includes(t.name));
                      return (
                        <div key={idx} className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs font-bold">
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-950 flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-indigo-600" /> {t.name}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              labOrder?.status === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {labOrder?.status === 'REPORT_SUBMITTED' ? '✓ Report Submitted' : 'Pending Sample'}
                            </span>
                          </div>
                          {labOrder?.report && (
                            <div className="p-2 bg-white rounded-lg text-[11px] text-slate-700 font-semibold mt-1">
                              <div>Findings: {labOrder.report.findings}</div>
                              <div className="text-slate-500 italic">Notes: {labOrder.report.notes}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Personal Itemized Billing & GST Tax Invoices */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> My Individual Billing & Itemized GST Invoices
          </h2>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Official Tax Invoices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getPatientInvoices()
            .filter((inv) => inv.patientName.toLowerCase().includes(displayName.toLowerCase()) || displayName === 'Patient' || inv.patientName.includes('Jane Patient') || inv.patientName.includes('Sarah Connor'))
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
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" /> Print Detailed GST Invoice PDF
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

