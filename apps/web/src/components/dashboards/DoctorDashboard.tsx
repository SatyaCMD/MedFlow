'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import { DoctorPrescribeStudioModal } from '../shared/DoctorPrescribeStudioModal';
import { useAuth } from '../../hooks/useAuth';
import {
  getClinicalRecords,
  saveClinicalRecord,
  getLabOrders,
  ClinicalRecord,
  LabOrderRecord,
} from '../../data/medicalHistoryStore';
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
  Activity,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Download,
  Printer
} from 'lucide-react';

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

  // Appointments State
  const [appointments, setAppointments] = useState([
    { id: '1', time: '09:00 AM', patient: 'Sarah Connor', type: 'Hypertension Follow-Up', mrn: 'MC-1001', status: 'Pending Doctor Approval' },
    { id: '2', time: '10:30 AM', patient: 'John Doe', type: 'ECG Report Review', mrn: 'MC-1002', status: 'Approved' },
    { id: '3', time: '11:15 AM', patient: 'Bruce Wayne', type: 'Post-Op Knee Eval', mrn: 'MC-1003', status: 'Completed' },
    { id: '4', time: '02:00 PM', patient: 'Diana Prince', type: 'Cardiology Assessment', mrn: 'MC-1004', status: 'Pending Doctor Approval' },
  ]);

  // Clinical Records & Lab Orders State
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrderRecord[]>([]);

  // Modal States
  const [isPrescribeStudioOpen, setIsPrescribeStudioOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLabReportsModalOpen, setIsLabReportsModalOpen] = useState(false);

  // Selected Patient & Search Queries
  const [activePatient, setActivePatient] = useState<any>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [labReportSearchQuery, setLabReportSearchQuery] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('Tomorrow 03:30 PM');

  useEffect(() => {
    setClinicalRecords(getClinicalRecords());
    setLabOrders(getLabOrders());
  }, [isPrescribeStudioOpen, isHistoryModalOpen, isLabReportsModalOpen]);

  const handleApprove = (apptId: string, patientName: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'Approved & Confirmed' } : a))
    );
    showToast({
      title: 'Appointment Approved!',
      message: `Confirmed consultation for ${patientName}. Routed to Nurse Pre-Consultation Vitals Queue.`,
      type: 'success',
    });
  };

  const openReschedule = (appt: any) => {
    setActivePatient(appt);
    setIsRescheduleModalOpen(true);
  };

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
      message: `Moved ${activePatient.patient}'s visit to ${newTimeSlot}.`,
      type: 'info',
    });
  };

  const openPrescribeStudio = (patientName: string, mrn: string) => {
    setActivePatient({ name: patientName, mrn });
    setIsPrescribeStudioOpen(true);
  };

  const openPatientHistory = (patientName: string, mrn: string) => {
    setActivePatient({ name: patientName, mrn });
    setHistorySearchQuery(mrn);
    setIsHistoryModalOpen(true);
  };

  const openLabReportsModal = (patientName: string, mrn: string) => {
    setActivePatient({ name: patientName, mrn });
    setLabReportSearchQuery(mrn);
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
          onClick={() => openPrescribeStudio(row.patient, row.mrn)}
          className="font-black text-slate-900 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
        >
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.patient}</span>
        </button>
      ),
    },
    { header: 'MRN Code', accessor: (row: typeof appointments[0]) => <span className="text-blue-600 font-bold">{row.mrn}</span> },
    { header: 'Consultation Purpose', accessor: (row: typeof appointments[0]) => <span className="text-slate-700 font-semibold">{row.type}</span> },
    {
      header: 'Approval Status',
      accessor: (row: typeof appointments[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status.includes('Completed')
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status.includes('Approved')
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : row.status === 'Rescheduled'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
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
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.status.includes('Pending') && (
            <button
              onClick={() => handleApprove(row.id, row.patient)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}

          <button
            onClick={() => openPrescribeStudio(row.patient, row.mrn)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescribe Rx</span>
          </button>

          <button
            onClick={() => openLabReportsModal(row.patient, row.mrn)}
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>View Reports</span>
          </button>

          <button
            onClick={() => openPatientHistory(row.patient, row.mrn)}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>History</span>
          </button>

          <button
            onClick={() => openReschedule(row)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 flex items-center gap-1 cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Reschedule</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Doctor E-Prescribing Studio Modal */}
      {activePatient && (
        <DoctorPrescribeStudioModal
          isOpen={isPrescribeStudioOpen}
          onClose={() => setIsPrescribeStudioOpen(false)}
          patientName={activePatient.name}
          patientMrn={activePatient.mrn}
          doctorName={doctorDisplayName}
          doctorSpecialty="Department of Cardiology & Internal Medicine"
          onPrescriptionIssued={() => {
            if (activePatient) {
              setAppointments((prev) =>
                prev.map((a) =>
                  a.mrn === activePatient.mrn ? { ...a, status: 'Completed & Prescribed' } : a
                )
              );
            }
          }}
        />
      )}

      {/* Patient Diagnostic Lab & Pathology Reports Review Modal */}
      <AnimatePresence>
        {isLabReportsModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                      Patient Diagnostic Lab Reports & Pathology Findings
                      {activePatient && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                          {activePatient.name} ({activePatient.mrn})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">Review lab technician findings, diagnostic parameter values, and pathologist notes</p>
                  </div>
                </div>
                <button onClick={() => setIsLabReportsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search filter for lab reports */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={labReportSearchQuery}
                  onChange={(e) => setLabReportSearchQuery(e.target.value)}
                  placeholder="Filter lab reports by Patient Name, MRN Code, Test Name or Date..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* List of Diagnostic Reports */}
              <div className="space-y-4">
                {filteredLabReports.map((report) => (
                  <div key={report.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="font-black text-slate-900 text-base block">{report.testName}</span>
                        <span className="text-xs font-bold text-cyan-700 block">
                          Category: {report.category} • Specimen: {report.specimen}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                            report.status === 'REPORT_SUBMITTED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          }`}
                        >
                          {report.status === 'REPORT_SUBMITTED' ? '✓ REPORT VERIFIED & DISPATCHED' : 'Sample Processing in Lab'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-1">Prescribed: {report.date}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-slate-700 font-semibold bg-white p-3 border border-slate-200 rounded-xl">
                      <div><span className="text-slate-400 block text-[10px] font-bold">PATIENT NAME & MRN</span><strong className="text-slate-900">{report.patientName} ({report.mrn})</strong></div>
                      <div><span className="text-slate-400 block text-[10px] font-bold">ORDERING PHYSICIAN</span><strong className="text-slate-900">{report.doctorName} ({report.department})</strong></div>
                      <div><span className="text-slate-400 block text-[10px] font-bold">FASTING REQUIREMENT</span><strong>{report.fastingRequirement}</strong></div>
                      <div><span className="text-slate-400 block text-[10px] font-bold">SAMPLE SPECIMEN</span><strong>{report.specimen}</strong></div>
                    </div>

                    {/* Submitted Lab Findings & Pathologist Impressions */}
                    {report.report ? (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-slate-900">
                        <div className="flex items-center justify-between text-emerald-950 font-black text-xs">
                          <span className="flex items-center gap-1.5"><FileCheck2 className="w-4 h-4 text-emerald-600" /> LAB TECHNICIAN FINDINGS & PARAMETER VALUES</span>
                          <span className="text-[10px] font-mono text-emerald-800">ISO-15189 Verified</span>
                        </div>

                        <div className="p-3 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-slate-900">
                          {report.report.findings}
                        </div>

                        <div className="text-xs font-semibold text-slate-700 italic">
                          <strong>Pathologist Remarks:</strong> {report.report.notes}
                        </div>

                        <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between pt-1 border-t border-emerald-200/60">
                          <span>Report Generated By: {report.report.technicianName}</span>
                          <span>Dispatched At: {report.report.submittedAt}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center justify-between">
                        <span>⏳ Specimen collected and undergoing pathology diagnostic evaluation in lab...</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">Pending Report</span>
                      </div>
                    )}
                  </div>
                ))}

                {filteredLabReports.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
                    No lab test reports found matching "{labReportSearchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient History Modal */}
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
                    <h3 className="font-black text-base text-slate-900">Patient EMR Vault & Clinical History</h3>
                    <p className="text-xs font-semibold text-slate-500">Query previous diagnoses, prescribed medications, and diagnostic lab reports by MRN or Name</p>
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
                  placeholder="Search EMR Vault by Patient Name, MRN Code, Diagnosis, or Rx #..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-4">
                {filteredHistoryRecords.map((rec) => (
                  <div key={rec.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="font-black text-slate-900 text-base block">{rec.patientName} ({rec.mrn})</span>
                        <span className="text-xs font-bold text-indigo-700 block">Rx #{rec.rxNumber} • Attending: {rec.doctorName}</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-lg border border-blue-200">
                        Date: {rec.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">CLINICAL DIAGNOSIS</span>
                      <span className="font-bold text-xs text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 block">
                        {rec.diagnosis}
                      </span>
                    </div>

                    {/* Prescribed Medications */}
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">PRESCRIBED MEDICATIONS</span>
                      <div className="space-y-1.5">
                        {rec.medications?.map((m, idx) => (
                          <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span className="text-blue-950 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-blue-600" /> {m.name}</span>
                            <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{m.dosage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diagnostic Lab Tests & Submitted Reports */}
                    {rec.labTests && rec.labTests.length > 0 && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block mb-1">DIAGNOSTIC LAB TESTS & PATHOLOGY REPORTS</span>
                        <div className="space-y-2">
                          {rec.labTests.map((t, idx) => {
                            const matchingOrder = labOrders.find((lo) => lo.mrn === rec.mrn && lo.testName.includes(t.name));
                            return (
                              <div key={idx} className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1.5 text-xs">
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-indigo-950 flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5 text-indigo-600" /> {t.name}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                    matchingOrder?.status === 'REPORT_SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {matchingOrder?.status === 'REPORT_SUBMITTED' ? '✓ Report Submitted' : 'Pending Lab Report'}
                                  </span>
                                </div>

                                {matchingOrder?.report && (
                                  <div className="p-2.5 bg-white border border-indigo-200 rounded-lg space-y-1 text-[11px]">
                                    <div className="font-bold text-slate-900">Lab Findings: {matchingOrder.report.findings}</div>
                                    <div className="text-slate-600 italic">Pathologist Notes: {matchingOrder.report.notes}</div>
                                    <div className="text-[10px] text-slate-400 pt-0.5">Submitted by {matchingOrder.report.technicianName} on {matchingOrder.report.submittedAt}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredHistoryRecords.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
                    No clinical history records found matching "{historySearchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified Doctor Workstation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              KYC Approved
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Welcome, {doctorDisplayName}
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Clinical Workstation & E-Prescribing Studio • Multi-tenant EMR & Patient OPD Queue
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLabReportSearchQuery('');
              setIsLabReportsModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <FlaskConical className="w-4 h-4 text-cyan-200" />
            <span>Diagnostic Lab Reports Hub</span>
          </button>

          <button
            onClick={() => {
              setHistorySearchQuery('');
              setIsHistoryModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer transition-all"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Patient EMR Vault & History</span>
          </button>

          <button
            onClick={() => openPrescribeStudio('Sarah Connor', 'MC-1001')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Open E-Prescribe Studio (Rx & Lab Tests)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Consultations" value={`${appointments.length} Visits`} change={12.0} changeLabel="OPD active" icon={Calendar} />
        <StatCard title="Pending Lab Diagnostics" value={`${labOrders.filter(l => l.status !== 'REPORT_SUBMITTED').length} Test Orders`} change={-1.0} changeLabel="assigned to lab tech" icon={FlaskConical} />
        <StatCard title="Nurse Vitals Synced" value="100% Complete" change={0.0} changeLabel="BP, HR & Temp logged" icon={UserCheck} />
        <StatCard title="Signed EMR Rx Notes" value={`${clinicalRecords.length} Issued`} change={8.5} changeLabel="SHA-256 verified" icon={FileText} />
      </div>

      {/* OPD Consultations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            OUTPATIENT CONSULTATION QUEUE & APPROVAL MANAGER
          </h2>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> E-Prescriber & Nurse Vitals Sync Active
          </span>
        </div>

        <DataTable columns={columns} data={appointments} />
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" /> Reschedule Consultation
                </h3>
                <button onClick={() => setIsRescheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Patient</label>
                  <input type="text" readOnly value={`${activePatient?.patient} (${activePatient?.mrn})`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">New Consultation Time Slot</label>
                  <select value={newTimeSlot} onChange={(e) => setNewTimeSlot(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Today 04:30 PM">Today 04:30 PM</option>
                    <option value="Tomorrow 10:00 AM">Tomorrow 10:00 AM</option>
                    <option value="Tomorrow 02:30 PM">Tomorrow 02:30 PM</option>
                    <option value="Day After 11:00 AM">Day After 11:00 AM</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer">Confirm Reschedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
