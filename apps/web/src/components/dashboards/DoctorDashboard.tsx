'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { DoctorPrescribeStudioModal } from '../shared/DoctorPrescribeStudioModal';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/axios';
import {
  getSharedAppointments,
  updateSharedAppointmentStatus,
  updateSharedAppointmentVitals,
  SharedAppointment
} from '../../data/appointmentStore';
import {
  getClinicalRecords,
  getLabOrders,
  ClinicalRecord,
  LabOrderRecord
} from '../../data/medicalHistoryStore';
import {
  User,
  Users,
  Calendar,
  Clock,
  Check,
  Stethoscope,
  Pill,
  X,
  History,
  FlaskConical,
  RefreshCw,
  FileCheck2,
  Activity,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Download,
  Printer,
  Lock,
  LockKeyhole,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic doctor name resolution
  const doctorDisplayName = user
    ? user.firstName.startsWith('Dr.')
      ? `${user.firstName} ${user.lastName}`
      : `Dr. ${user.firstName} ${user.lastName}`
    : 'Dr. Anup Singh';

  // Appointments State from Shared Store
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

  // Clinical Records & Lab Orders State
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>([]);

  // Modal States
  const [isPrescribeStudioOpen, setIsPrescribeStudioOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLabReportsModalOpen, setIsLabReportsModalOpen] = useState(false);
  const [vitalsModalAppointment, setVitalsModalAppointment] = useState<SharedAppointment | null>(null);

  // Vitals form state
  const [bpInput, setBpInput] = useState('120/80');
  const [hrInput, setHrInput] = useState('74 bpm');
  const [tempInput, setTempInput] = useState('98.6 °F');
  const [spo2Input, setSpo2Input] = useState('99 %');

  // Selected Patient & Search Queries
  const [activePatient, setActivePatient] = useState<any>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [labReportSearchQuery, setLabReportSearchQuery] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('Tomorrow 03:30 PM');

  useEffect(() => {
    setClinicalRecords(getClinicalRecords());
    setLabOrders(getLabOrders());
  }, [isPrescribeStudioOpen, isHistoryModalOpen, isLabReportsModalOpen]);

  const handleApprove = async (row: SharedAppointment) => {
    updateSharedAppointmentStatus(row.id, 'PENDING NURSE VITALS');
    refreshAppointments();

    // Call API to send Vitals Notice Email
    try {
      await api.post('/appointments/send-vitals-mail', {
        patientEmail: row.patientEmail || 'patient@medflow.com',
        patientName: row.patientName,
        doctorName: doctorDisplayName,
        appointmentTime: `${row.date} at ${row.timeSlot}`,
        roomNumber: 'OPD Room 204 — Pre-Consultation Triage Station',
      });
    } catch {
      // Non-blocking mail fallback
    }

    showToast({
      title: 'Appointment Approved & Patient Email Sent! 🩺',
      message: `Confirmed for ${row.patientName}. Vitals notice email sent (Room 204). Consultation action tabs are temporarily locked until Nurse Vitals are recorded.`,
      type: 'success',
    });
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalsModalAppointment) return;

    updateSharedAppointmentVitals(vitalsModalAppointment.id, {
      bp: bpInput,
      hr: hrInput,
      temp: tempInput,
      spo2: spo2Input,
      recordedAt: new Date().toLocaleTimeString(),
      nurseName: 'Nurse Clara Barton (Room 204)',
    });

    refreshAppointments();
    setVitalsModalAppointment(null);

    showToast({
      title: 'Nurse Vitals Recorded! 🩺',
      message: `Vitals logged for ${vitalsModalAppointment.patientName}. Consultation action tabs (Prescribe Rx, Reports, History, Reschedule) are now UNLOCKED 🔓!`,
      type: 'success',
    });
  };

  const handleLockedClick = (patientName: string) => {
    showToast({
      title: '🔒 Action Tabs Temporarily Locked!',
      message: `Patient ${patientName} must complete mandatory Pre-Consultation Nurse Vitals Checkup in OPD Room 204 before doctor consultation tabs unlock.`,
      type: 'warning',
    });
  };

  const openReschedule = (appt: SharedAppointment) => {
    if (isTabLocked(appt)) {
      handleLockedClick(appt.patientName);
      return;
    }
    setActivePatient(appt);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === activePatient.id ? { ...a, timeSlot: newTimeSlot, status: 'Rescheduled' } : a
      )
    );
    setIsRescheduleModalOpen(false);
    showToast({
      title: 'Appointment Rescheduled!',
      message: `Moved ${activePatient.patientName}'s visit to ${newTimeSlot}.`,
      type: 'info',
    });
  };

  const isTabLocked = (row: SharedAppointment) => {
    return (row.status === 'PENDING NURSE VITALS' || row.status === 'PENDING DOCTOR APPROVAL') && !row.vitals;
  };

  const openPrescribeStudio = (row: SharedAppointment) => {
    if (isTabLocked(row)) {
      handleLockedClick(row.patientName);
      return;
    }
    setActivePatient({ name: row.patientName, mrn: row.mrn, id: row.id });
    setIsPrescribeStudioOpen(true);
  };

  const openPatientHistory = (row: SharedAppointment) => {
    if (isTabLocked(row)) {
      handleLockedClick(row.patientName);
      return;
    }
    setActivePatient({ name: row.patientName, mrn: row.mrn });
    setHistorySearchQuery(row.mrn);
    setIsHistoryModalOpen(true);
  };

  const openLabReportsModal = (row: SharedAppointment) => {
    if (isTabLocked(row)) {
      handleLockedClick(row.patientName);
      return;
    }
    setActivePatient({ name: row.patientName, mrn: row.mrn });
    setLabReportSearchQuery(row.mrn);
    setIsLabReportsModalOpen(true);
  };

  // Filter Clinical Records by Search / Patient
  const filteredHistoryRecords = clinicalRecords.filter((r) => {
    if (!historySearchQuery) return true;
    const q = historySearchQuery.toLowerCase();
    return (
      r.patientName.toLowerCase().includes(q) ||
      r.mrn.toLowerCase().includes(q) ||
      r.diagnosis.toLowerCase().includes(q) ||
      r.rxNumber.toLowerCase().includes(q)
    );
  });

  // Filter Lab Orders / Reports for Doctor Review
  const filteredLabReports = labOrders.filter((l) => {
    if (!labReportSearchQuery) return true;
    const q = labReportSearchQuery.toLowerCase();
    return (
      l.patientName.toLowerCase().includes(q) ||
      l.mrn.toLowerCase().includes(q) ||
      l.testName.toLowerCase().includes(q) ||
      l.doctorName.toLowerCase().includes(q) ||
      l.date.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Time Slot',
      accessor: (row: SharedAppointment) => (
        <span className="font-bold text-blue-600 flex items-center gap-1.5 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-blue-500" /> {row.timeSlot || row.date}
        </span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: SharedAppointment) => (
        <button
          onClick={() => openPrescribeStudio(row)}
          className="font-black text-slate-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.patientName}</span>
        </button>
      ),
    },
    { header: 'MRN Code', accessor: (row: SharedAppointment) => <span className="text-blue-600 font-bold">{row.mrn}</span> },
    { header: 'Consultation Purpose', accessor: (row: SharedAppointment) => <span className="text-slate-700 font-semibold">{row.purpose || row.department}</span> },
    {
      header: 'Approval & Vitals Status',
      accessor: (row: SharedAppointment) => {
        const locked = isTabLocked(row);
        return (
          <div className="flex flex-col gap-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase w-fit ${
                row.status === 'VITALS RECORDED & READY FOR DOCTOR' || row.status.includes('Completed')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : row.status === 'PENDING NURSE VITALS'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {row.status}
            </span>
            {locked && (
              <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" /> Awaiting Vitals Check (Room 204)
              </span>
            )}
            {row.vitals && (
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-emerald-600" /> BP: {row.vitals.bp} • HR: {row.vitals.hr}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Doctor Actions',
      accessor: (row: SharedAppointment) => {
        const locked = isTabLocked(row);

        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.status === 'PENDING DOCTOR APPROVAL' && (
              <button
                onClick={() => handleApprove(row)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Send Vitals Notice</span>
              </button>
            )}

            {/* Record Vitals Action Button */}
            {locked && (
              <button
                onClick={() => setVitalsModalAppointment(row)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 text-[11px] font-black rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-all animate-pulse"
                title="Record Pre-Consultation Nurse Vitals (Room 204)"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Record Vitals (Room 204)</span>
              </button>
            )}

            {/* Tab 1: Prescribe Rx */}
            <button
              onClick={() => openPrescribeStudio(row)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer ${
                locked
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/60'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
              title={locked ? '🔒 Locked: Awaiting Nurse Vitals Check (Room 204)' : 'Prescribe E-Prescription'}
            >
              {locked ? <Lock className="w-3 h-3 text-slate-400" /> : <Pill className="w-3.5 h-3.5" />}
              <span>Prescribe Rx</span>
            </button>

            {/* Tab 2: View Reports */}
            <button
              onClick={() => openLabReportsModal(row)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 transition-all cursor-pointer ${
                locked
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/60'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
              title={locked ? '🔒 Locked: Awaiting Nurse Vitals Check (Room 204)' : 'View Lab Diagnostic Reports'}
            >
              {locked ? <Lock className="w-3 h-3 text-slate-400" /> : <FlaskConical className="w-3.5 h-3.5" />}
              <span>View Reports</span>
            </button>

            {/* Tab 3: History */}
            <button
              onClick={() => openPatientHistory(row)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                locked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/60'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title={locked ? '🔒 Locked: Awaiting Nurse Vitals Check (Room 204)' : 'View Patient Medical History'}
            >
              {locked ? <Lock className="w-3 h-3 text-slate-400" /> : <History className="w-3.5 h-3.5 text-indigo-600" />}
              <span>History</span>
            </button>

            {/* Tab 4: Reschedule */}
            <button
              onClick={() => openReschedule(row)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                locked
                  ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/60'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={locked ? '🔒 Locked: Awaiting Nurse Vitals Check (Room 204)' : 'Reschedule Appointment Slot'}
            >
              {locked ? <Lock className="w-3 h-3 text-slate-400" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
              <span>Reschedule</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 relative pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs font-bold">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              Physician Consultation Workstation Active
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Welcome, {doctorDisplayName}</h1>
            <p className="text-xs md:text-sm text-blue-100/80 font-medium max-w-2xl">
              OPD consultation schedule, EMR prescriptions, lab report verification, and pre-consultation vitals checkup lock workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl text-xs font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              OPD Triage Station: Room 204 Active
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Consultation Schedule" value={`${appointments.length} Visits`} change={2.1} changeLabel="active OPD slots" icon={Calendar} />
        <StatCard title="Pending Nurse Vitals Check" value={`${appointments.filter(a => isTabLocked(a)).length} Patients`} change={0.0} changeLabel="Room 204 queue" icon={Lock} />
        <StatCard title="Ready for Prescription" value={`${appointments.filter(a => !isTabLocked(a)).length} Unlocked`} change={5.4} changeLabel="vitals recorded" icon={CheckCircle2} />
        <StatCard title="Diagnostic Reports Reviewed" value={`${labOrders.length} Reports`} change={12.0} changeLabel="verified pathology" icon={FlaskConical} />
      </div>

      {/* Appointments Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Active OPD Consultation Appointments ({appointments.length})
          </h2>
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Vitals-Locked Consultation Safeguard Active
          </span>
        </div>

        <DataTable
          columns={columns}
          data={appointments}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Record Nurse Vitals Modal */}
      {vitalsModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-2xl">
                  <Activity className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="text-base font-black">Record Pre-Consultation Nurse Vitals</h3>
                  <p className="text-xs text-amber-100">OPD Room 204 Triage Station</p>
                </div>
              </div>
              <button
                onClick={() => setVitalsModalAppointment(null)}
                className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                Patient: <strong>{vitalsModalAppointment.patientName}</strong> ({vitalsModalAppointment.mrn})<br />
                Logging vitals will unlock consultation action tabs for the attending physician.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Blood Pressure (mmHg)</label>
                  <input
                    type="text"
                    value={bpInput}
                    onChange={(e) => setBpInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Heart Rate / Pulse</label>
                  <input
                    type="text"
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Body Temperature</label>
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Oxygen Saturation (SpO2)</label>
                  <input
                    type="text"
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVitalsModalAppointment(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Unlock Consultation Action Tabs 🔓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Prescribe Studio Modal */}
      {activePatient && (
        <DoctorPrescribeStudioModal
          isOpen={isPrescribeStudioOpen}
          onClose={() => setIsPrescribeStudioOpen(false)}
          patientName={activePatient.name}
          patientMrn={activePatient.mrn}
          doctorName={doctorDisplayName}
        />
      )}

      {/* Patient History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Patient Medical History Vault</h3>
                <p className="text-xs text-indigo-200">MRN: {activePatient?.mrn} • {activePatient?.name}</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {filteredHistoryRecords.length > 0 ? (
                filteredHistoryRecords.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Rx #{r.rxNumber} • {r.diagnosis}</span>
                      <span className="text-blue-600">{r.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Attending: {r.doctorName}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">No prior clinical history records found for this patient.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lab Reports Modal */}
      {isLabReportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-cyan-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Pathology & Diagnostic Lab Reports</h3>
                <p className="text-xs text-cyan-200">MRN: {activePatient?.mrn} • {activePatient?.name}</p>
              </div>
              <button onClick={() => setIsLabReportsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {filteredLabReports.length > 0 ? (
                filteredLabReports.map((l) => (
                  <div key={l.id} className="p-4 bg-cyan-50/50 border border-cyan-200 rounded-2xl space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{l.testName}</span>
                      <span className="text-emerald-700">{l.status}</span>
                    </div>
                    {l.report && (
                      <div className="p-2.5 bg-white rounded-xl text-[11px] text-slate-700 mt-2 space-y-1">
                        <div><strong>Findings:</strong> {l.report.findings}</div>
                        <div className="text-slate-500"><strong>Notes:</strong> {l.report.notes}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">No diagnostic lab reports uploaded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">Reschedule Consultation Slot</h3>
              <button onClick={() => setIsRescheduleModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-800">
              <div>
                <label className="block text-slate-600 mb-1">New Consultation Date & Time</label>
                <input
                  type="text"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-black rounded-xl">Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
