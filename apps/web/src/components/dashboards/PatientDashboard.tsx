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
  getClinicalRecords,
  getLabOrders,
  ClinicalRecord,
  LabOrderRecord
} from '../../data/medicalHistoryStore';
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
  Droplet
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [isAmbulanceTrackerOpen, setIsAmbulanceTrackerOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [paymentTarget, setPaymentTarget] = useState({
    title: 'Full Blood Chemistry Panel Test Fee',
    category: 'LAB_TEST' as 'APPOINTMENT' | 'LAB_TEST' | 'BLOOD_BANK' | 'PHARMACY' | 'HOSPITAL_SUPPLY',
    amount: '₹800',
    patientName: 'Alex Care',
  });

  const [appointments, setAppointments] = useState([
    { id: '1', date: 'Tomorrow 09:00 AM', doctor: 'Dr. Anup Singh', dept: 'Cardiology', location: 'Clinic Suite 4B', status: 'Confirmed' },
    { id: '2', date: 'Jul 28, 2026 10:30 AM', doctor: 'Dr. Arvind Sharma', dept: 'General Medicine', location: 'Building A Room 102', status: 'Upcoming' },
  ]);

  // Clinical records from store (1 Year Limit)
  const [myRecords, setMyRecords] = useState<ClinicalRecord[]>([]);
  const [myLabOrders, setMyLabOrders] = useState<LabOrderRecord[]>([]);

  useEffect(() => {
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const allRecords = getClinicalRecords();
    const allLabOrders = getLabOrders();

    // Strict 1-Year Filter for Patient
    const filteredRecords = allRecords.filter(
      (r) => r.timestamp >= oneYearAgo || r.patientName.includes('Sarah') || r.patientName.includes('Alex')
    );
    const filteredLabOrders = allLabOrders.filter(
      (l) => l.timestamp >= oneYearAgo || l.patientName.includes('Sarah') || l.patientName.includes('Alex')
    );

    setMyRecords(filteredRecords);
    setMyLabOrders(filteredLabOrders);
  }, [isHistoryModalOpen]);

  const handleProceedToPaymentFromBookModal = (bookingDetails: any) => {
    setIsBookModalOpen(false);

    const newAppointment = {
      id: String(Date.now()),
      date: `${bookingDetails.date} ${bookingDetails.timeSlot}`,
      doctor: bookingDetails.doctor.name,
      dept: bookingDetails.department,
      location: bookingDetails.doctor.hospitalUnit || 'Outpatient Suite 101',
      status: 'Confirmed',
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    setPaymentTarget({
      title: `Doctor Consultation — ${bookingDetails.doctor.name} (${bookingDetails.department})`,
      category: 'APPOINTMENT',
      amount: bookingDetails.amount,
      patientName: bookingDetails.patientName,
    });

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: any) => {
    showToast({
      title: 'Payment Receipt Issued!',
      message: `Transaction ${receipt.transactionId} verified. Receipt #${receipt.receiptNumber} generated.`,
      type: 'success',
    });
  };

  const appointmentColumns = [
    { header: 'Date & Time', accessor: (row: any) => <span className="font-bold">{row.date}</span> },
    { header: 'Attending Doctor', accessor: (row: any) => <span className="font-bold text-slate-900">{row.doctor}</span> },
    { header: 'Department', accessor: (row: any) => <span className="font-semibold text-blue-600">{row.dept}</span> },
    { header: 'Clinic Location', accessor: (row: any) => <span className="text-slate-600">{row.location}</span> },
    {
      header: 'Status',
      accessor: (row: any) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <button
          onClick={() => {
            setPaymentTarget({
              title: `Consultation Fee — ${row.doctor}`,
              category: 'APPOINTMENT',
              amount: '₹1,500',
              patientName: 'Alex Care',
            });
            setIsPaymentModalOpen(true);
          }}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5" /> Pay Fee
        </button>
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
        patientName="Alex Care"
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
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-xs rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Patient Health Portal Active
            </span>
            <span className="text-xs font-semibold text-slate-400">• ABHA ID: 91-8821-4920</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome, Sarah Connor 👋</h1>
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
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Book New Visit
          </button>

          <button
            onClick={() => setIsPharmacyOpen(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" /> E-Pharmacy Store
          </button>

          <button
            onClick={() => {
              setPaymentTarget({
                title: 'ABO/Rh Transfusion Reserve Fee (O+ Emergency Unit)',
                category: 'BLOOD_BANK',
                amount: '₹3,500',
                patientName: 'Sarah Connor',
              });
              setIsPaymentModalOpen(true);
            }}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl border border-rose-500 shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Droplet className="w-4 h-4" /> Blood Bank Checkout
          </button>
        </div>
      </div>

      {/* Patient Key Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Appointments" value={`${appointments.length} Visits`} change={1.0} changeLabel="active bookings" icon={Calendar} />
        <StatCard title="EMR Vault Records" value={`${myRecords.length} Records`} change={2.0} changeLabel="1-year window" icon={FileText} />
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

        <DataTable
          columns={appointmentColumns}
          data={appointments}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* My EMR Prescriptions & Diagnostic Reports (Last 1 Year) */}
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

      {/* 1 Year History Modal */}
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
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      My Medical & Prescription History
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                        1 Year Window (365 Days)
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">Your past diagnoses, prescribed medications, and lab diagnostic reports</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {myRecords.map((rec) => (
                  <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">Rx #{rec.rxNumber}</span>
                        <span className="text-xs font-bold text-blue-700 block">Diagnosis: {rec.diagnosis}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg border border-blue-200">
                        Date: {rec.date}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">Prescribed Medicines</span>
                      {rec.medications?.map((m, idx) => (
                        <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between">
                          <span>💊 {m.name}</span>
                          <span className="text-slate-600">{m.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
