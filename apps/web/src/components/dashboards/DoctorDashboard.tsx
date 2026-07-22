'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  Plus,
  CheckCircle2,
  AlertCircle,
  Pill,
  X,
  Sparkles,
  FlaskConical,
  User,
  History,
  Check,
  RefreshCw,
  FileCheck2,
  Activity
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Appointments State
  const [appointments, setAppointments] = useState([
    { id: '1', time: '09:00 AM', patient: 'Sarah Connor', type: 'Hypertension Follow-Up', mrn: 'MC-1001', status: 'Pending Doctor Approval' },
    { id: '2', time: '10:30 AM', patient: 'John Doe', type: 'ECG Report Review', mrn: 'MC-1002', status: 'Approved' },
    { id: '3', time: '11:15 AM', patient: 'Bruce Wayne', type: 'Post-Op Knee Eval', mrn: 'MC-1003', status: 'Completed' },
    { id: '4', time: '02:00 PM', patient: 'Diana Prince', type: 'Cardiology Assessment', mrn: 'MC-1004', status: 'Pending Doctor Approval' },
  ]);

  // Modal States
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Selected Patient for Actions
  const [activePatient, setActivePatient] = useState<any>(null);

  // Reschedule Form State
  const [newTimeSlot, setNewTimeSlot] = useState('Tomorrow 03:30 PM');

  // Test Assignment Form State
  const [selectedTest, setSelectedTest] = useState('Full Blood Chemistry Panel');
  const [assignedStaffRole, setAssignedStaffRole] = useState<'NURSE' | 'PATHOLOGIST'>('PATHOLOGIST');
  const [assignedStaffName, setAssignedStaffName] = useState('Pathologist Dr. Evans');
  const [testInstructions, setTestInstructions] = useState('Fasting 8-hour blood draw required before 9:00 AM.');

  // Rx Form State
  const [rxPatient, setRxPatient] = useState('Sarah Connor');
  const [rxMedication, setRxMedication] = useState('Amoxicillin 500mg (TID)');
  const [rxInstructions, setRxInstructions] = useState('Take 1 capsule every 8 hours after meals for 7 days.');

  // Patient EMR History Mock Data
  const patientHistoryMap: Record<string, any> = {
    'Sarah Connor': {
      mrn: 'MC-1001',
      age: 42,
      bloodType: 'O+',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      pastDiagnoses: ['Essential Hypertension (2023)', 'Hyperlipidemia (2024)'],
      uploadedReports: [
        { date: 'Jul 20, 2026', title: 'Lipid Profile & Cholesterol Panel', status: 'Uploaded by Patient', result: 'Total Chol: 210 mg/dL' },
        { date: 'Jun 12, 2026', title: '24-Hour Ambulatory BP Monitor', status: 'Lab Synced', result: 'Avg BP: 135/88 mmHg' },
      ],
    },
    'John Doe': {
      mrn: 'MC-1002',
      age: 38,
      bloodType: 'A+',
      allergies: ['None Reported'],
      pastDiagnoses: ['Palpitations (2025)'],
      uploadedReports: [
        { date: 'Jul 18, 2026', title: '12-Lead Electrocardiogram (ECG)', status: 'Lab Synced', result: 'Sinus Rhythm, No ST Elevation' },
      ],
    },
    'Bruce Wayne': {
      mrn: 'MC-1003',
      age: 45,
      bloodType: 'AB+',
      allergies: ['Codeine'],
      pastDiagnoses: ['ACL Reconstruction Post-Op (2026)'],
      uploadedReports: [
        { date: 'Jul 10, 2026', title: 'Knee Joint MRI Scan', status: 'Radiology Uploaded', result: 'Graft Intact, Mild Joint Effusion' },
      ],
    },
    'Diana Prince': {
      mrn: 'MC-1004',
      age: 35,
      bloodType: 'B+',
      allergies: ['None Reported'],
      pastDiagnoses: ['Cardiology Assessment (2026)'],
      uploadedReports: [
        { date: 'Jul 21, 2026', title: 'Echocardiogram 2D Echo Report', status: 'Lab Synced', result: 'LVEF 65%, Normal Valves' },
      ],
    },
  };

  // Handle Approve Appointment
  const handleApprove = (apptId: string, patientName: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'Approved & Confirmed' } : a))
    );
    showToast({
      title: 'Appointment Approved!',
      message: `Confirmed consultation session for ${patientName}.`,
      type: 'success',
    });
  };

  // Open Reschedule Modal
  const openReschedule = (appt: any) => {
    setActivePatient(appt);
    setIsRescheduleModalOpen(true);
  };

  // Submit Reschedule
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === activePatient.id ? { ...a, time: newTimeSlot, status: 'Rescheduled' } : a
      )
    );
    setIsRescheduleModalOpen(false);
    showToast({
      title: 'Appointment Rescheduled!',
      message: `Moved ${activePatient.patient}'s appointment to ${newTimeSlot}.`,
      type: 'info',
    });
  };

  // Submit Lab Test Assignment
  const handleTestOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestModalOpen(false);
    showToast({
      title: 'Lab Order Dispatched!',
      message: `Ordered ${selectedTest} for ${rxPatient} assigned to ${assignedStaffName}.`,
      type: 'success',
    });
  };

  // Submit Rx
  const handleRxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRxModalOpen(false);
    showToast({
      title: 'Electronic Rx Dispatched!',
      message: `Prescription for ${rxMedication} dispatched to Hospital Pharmacy for ${rxPatient}.`,
      type: 'success',
    });
  };

  // Open Patient EMR History
  const openHistory = (patientName: string) => {
    const history = patientHistoryMap[patientName] || {
      mrn: 'MC-1099',
      age: 40,
      bloodType: 'O+',
      allergies: ['None'],
      pastDiagnoses: ['General Evaluation'],
      uploadedReports: [{ date: 'Recent', title: 'Standard Clinical Evaluation', status: 'Verified', result: 'Normal' }],
    };
    setActivePatient({ name: patientName, ...history });
    setIsHistoryModalOpen(true);
  };

  const columns = [
    {
      header: 'Time Slot',
      accessor: (row: typeof appointments[0]) => (
        <span className="font-bold text-blue-600 flex items-center gap-1.5 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-blue-500" /> {row.time}
        </span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: typeof appointments[0]) => (
        <button
          onClick={() => openHistory(row.patient)}
          className="font-black text-slate-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.patient}</span>
        </button>
      ),
    },
    { header: 'MRN Number', accessor: (row: typeof appointments[0]) => <span className="text-blue-600 font-bold">{row.mrn}</span> },
    { header: 'Consultation Purpose', accessor: (row: typeof appointments[0]) => <span className="text-slate-700 font-semibold">{row.type}</span> },
    {
      header: 'Approval Status',
      accessor: (row: typeof appointments[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status === 'Approved & Confirmed' || row.status === 'Approved'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'Rescheduled'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : row.status === 'Completed'
                  ? 'bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Doctor Actions',
      accessor: (row: typeof appointments[0]) => (
        <div className="flex items-center gap-2">
          {row.status.includes('Pending') && (
            <button
              onClick={() => handleApprove(row.id, row.patient)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}

          <button
            onClick={() => openReschedule(row)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Reschedule</span>
          </button>

          <button
            onClick={() => openHistory(row.patient)}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <History className="w-3 h-3 text-blue-600" />
            <span>EMR History</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Physician Clinical Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Approve & reschedule appointments, order diagnostic tests for Nurses/Pathologists, and analyze patient EMR reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Order Lab Test & Staff</span>
          </button>

          <button
            onClick={() => setIsRxModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Prescription</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Consultations" value="14" change={12.0} changeLabel="4 remaining" icon={Calendar} />
        <StatCard title="Pending Lab Diagnostics" value="3" change={-1.0} changeLabel="assigned to pathologists" icon={FlaskConical} />
        <StatCard title="Active Ward Admissions" value="6" change={0.0} changeLabel="assigned to nurses" icon={UserCheck} />
        <StatCard title="Signed EMR Progress Notes" value="18" change={8.5} changeLabel="100% verified" icon={FileText} />
      </div>

      {/* Outpatient Appointments Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Outpatient Consultation Queue & Approval Manager
          </h2>
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> E-Prescriber & Lab Sync Active
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

      {/* MODAL 1: RESCHEDULE APPOINTMENT */}
      <AnimatePresence>
        {isRescheduleModalOpen && activePatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Reschedule {activePatient.patient}&apos;s Visit
                </h3>
                <button onClick={() => setIsRescheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Current Time Slot
                  </label>
                  <input type="text" disabled value={activePatient.time} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select New Available Slot
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  >
                    <option value="Tomorrow 02:00 PM">Tomorrow 02:00 PM</option>
                    <option value="Tomorrow 03:30 PM">Tomorrow 03:30 PM</option>
                    <option value="Jul 26, 2026 10:00 AM">Jul 26, 2026 10:00 AM</option>
                    <option value="Jul 27, 2026 11:30 AM">Jul 27, 2026 11:30 AM</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                    Confirm Reschedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ORDER LAB TEST & ASSIGN STAFF (NURSES / PATHOLOGISTS) */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Order Diagnostic Lab Test</h3>
                    <p className="text-xs font-semibold text-slate-500">Assign tests to Nurses or Pathologists</p>
                  </div>
                </div>
                <button onClick={() => setIsTestModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTestOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Target Patient
                  </label>
                  <select
                    value={rxPatient}
                    onChange={(e) => setRxPatient(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  >
                    <option value="Sarah Connor">Sarah Connor (MC-1001)</option>
                    <option value="John Doe">John Doe (MC-1002)</option>
                    <option value="Bruce Wayne">Bruce Wayne (MC-1003)</option>
                    <option value="Diana Prince">Diana Prince (MC-1004)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Diagnostic Panel / Test
                  </label>
                  <select
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  >
                    <option value="Full Blood Chemistry Panel">Full Blood Chemistry Panel</option>
                    <option value="Cardiac Troponin & Lipid Profile">Cardiac Troponin & Lipid Profile</option>
                    <option value="12-Lead Electrocardiogram (ECG)">12-Lead Electrocardiogram (ECG)</option>
                    <option value="Brain & Spine MRI Scan">Brain & Spine MRI Scan</option>
                    <option value="COVID-19 RT-PCR & Inflammatory Markers">COVID-19 RT-PCR & Inflammatory Markers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Staff Role Assignment
                    </label>
                    <select
                      value={assignedStaffRole}
                      onChange={(e) => {
                        const role = e.target.value as any;
                        setAssignedStaffRole(role);
                        if (role === 'NURSE') setAssignedStaffName('Nurse Clara (Ward 4)');
                        else setAssignedStaffName('Pathologist Dr. Evans (Main Lab)');
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                    >
                      <option value="PATHOLOGIST">Pathologist / Lab Tech</option>
                      <option value="NURSE">Inpatient Nurse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Assigned Practitioner
                    </label>
                    <input
                      type="text"
                      disabled
                      value={assignedStaffName}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Clinical Instructions for Staff
                  </label>
                  <textarea
                    rows={2}
                    value={testInstructions}
                    onChange={(e) => setTestInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-4 h-4" />
                    <span>Dispatch Lab Order</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ISSUE PRESCRIPTION */}
      <AnimatePresence>
        {isRxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Issue Electronic Prescription</h3>
                    <p className="text-xs font-semibold text-slate-500">Cryptographically signed E-Prescriber order</p>
                  </div>
                </div>
                <button onClick={() => setIsRxModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRxSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Patient
                  </label>
                  <select
                    value={rxPatient}
                    onChange={(e) => setRxPatient(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  >
                    <option value="Sarah Connor">Sarah Connor (MC-1001)</option>
                    <option value="John Doe">John Doe (MC-1002)</option>
                    <option value="Bruce Wayne">Bruce Wayne (MC-1003)</option>
                    <option value="Diana Prince">Diana Prince (MC-1004)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Rx Medication & Dosage
                  </label>
                  <input
                    type="text"
                    required
                    value={rxMedication}
                    onChange={(e) => setRxMedication(e.target.value)}
                    placeholder="e.g. Amoxicillin 500mg, Metformin 850mg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Dosing Instructions
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={rxInstructions}
                    onChange={(e) => setRxInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsRxModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    <span>Sign & Dispatch Rx</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: PATIENT EMR MEDICAL HISTORY INSPECTOR */}
      <AnimatePresence>
        {isHistoryModalOpen && activePatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-base">
                    {activePatient.name ? activePatient.name[0] : 'P'}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{activePatient.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">MRN: {activePatient.mrn} • Age: {activePatient.age} • Blood Type: {activePatient.bloodType}</p>
                  </div>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Allergies & Diagnoses Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">Drug Allergies</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {activePatient.allergies?.map((a: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-900 font-bold rounded-lg text-xs border border-rose-300">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900">Past Diagnoses</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {activePatient.pastDiagnoses?.map((d: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-900 font-bold rounded-lg text-xs border border-blue-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Uploaded Diagnostic Reports & Lab History */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-blue-600" /> Patient Lab Reports & Diagnostic History
                </h4>

                <div className="space-y-3">
                  {activePatient.uploadedReports?.map((report: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-900">{report.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span>{report.date}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-bold">{report.status}</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-700 pt-1">Clinical Result: {report.result}</p>
                      </div>

                      <button
                        onClick={() => showToast({ title: 'Viewing Report', message: `Opening ${report.title}...`, type: 'info' })}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
                      >
                        Inspect Report
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button onClick={() => setIsHistoryModalOpen(false)} className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
                  Close EMR Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
