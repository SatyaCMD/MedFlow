'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { PrescriptionPdfModal } from '../../components/shared/PrescriptionPdfModal';
import { TelemedicineConsultationModal } from '../../components/shared/TelemedicineConsultationModal';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  ShieldCheck,
  Download,
  Search,
  Plus,
  AlertTriangle,
  Sparkles,
  Activity,
  HeartPulse,
  Video,
  Clock,
  CheckCircle2,
  FileSignature
} from 'lucide-react';

export default function EmrPage() {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);

  const [emrRecords] = useState([
    {
      id: 'emr-101',
      date: 'Jul 21, 2026',
      patient: 'Jane Patient (MC-1001)',
      doctor: 'Dr. Devendra Roy, M.D.',
      dept: 'Cardiology',
      diagnosis: 'Essential Hypertension',
      cdssAlert: 'No Drug Allergies Detected',
      hash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
    },
    {
      id: 'emr-102',
      date: 'Jul 15, 2026',
      patient: 'John Doe (MC-1002)',
      doctor: 'Dr. Siddharth Joshi',
      dept: 'Neurology',
      diagnosis: 'Acute Migraine Aura',
      cdssAlert: '⚠️ Penicillin Allergy On File',
      hash: 'SHA256: 4e91b20a11fc78d099be20194ab99',
    },
  ]);

  const handleLaunchVideoConsult = () => {
    setIsVideoConsultOpen(true);
    showToast({
      title: 'Telemedicine Video Room Connected',
      message: 'Secure 256-bit encrypted WebRTC video consult room active.',
      type: 'success',
    });
  };

  const columns = [
    { header: 'Visit Date', accessor: (row: typeof emrRecords[0]) => <span className="font-bold text-slate-900">{row.date}</span> },
    { header: 'Patient & MRN', accessor: (row: typeof emrRecords[0]) => <span className="font-bold text-blue-600">{row.patient}</span> },
    { header: 'Attending Doctor', accessor: (row: typeof emrRecords[0]) => <span className="text-slate-800 font-semibold">{row.doctor}</span> },
    { header: 'Clinical Diagnosis', accessor: (row: typeof emrRecords[0]) => <span className="text-slate-700 font-medium">{row.diagnosis}</span> },
    {
      header: 'CDSS AI Safety Alert',
      accessor: (row: typeof emrRecords[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.cdssAlert.includes('⚠️')
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
          {row.cdssAlert}
        </span>
      ),
    },
    {
      header: 'EMR Vault Actions',
      accessor: (row: typeof emrRecords[0]) => (
        <button
          onClick={() => setIsRxPdfOpen(true)}
          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1 transition-all cursor-pointer"
        >
          <FileSignature className="w-3.5 h-3.5" />
          <span>View Signed EMR</span>
        </button>
      ),
    },
  ];

  return (
    <AppShell userRole="DOCTOR">
      <div className="space-y-8 max-w-6xl mx-auto">
        <PrescriptionPdfModal isOpen={isRxPdfOpen} onClose={() => setIsRxPdfOpen(false)} />

        {/* High-Industry Standard WebRTC Telemedicine Suite Modal with Live Doctor Webcam Access */}
        <TelemedicineConsultationModal
          isOpen={isVideoConsultOpen}
          onClose={() => setIsVideoConsultOpen(false)}
          patientName="Jane Patient"
          patientMrn="MC-1001"
          doctorName="Dr. Anup Singh"
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Electronic Medical & Health Records (EMR / EHR Vault)
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Clinical Decision Support System (CDSS), lifetime longitudinal health history, and Telemedicine video consults.
            </p>
          </div>

          <button
            onClick={handleLaunchVideoConsult}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Video className="w-4 h-4 text-emerald-200" />
            <span>Launch Live Telemedicine Consult</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total EMR Archives" value="14,820 Records" change={100.0} changeLabel="SHA-256 encrypted" icon={FileText} />
          <StatCard title="CDSS AI Safety Index" value="99.9% Clean" change={0.0} changeLabel="drug interaction engine" icon={Sparkles} />
          <StatCard title="Telemedicine Consults" value="48 Today" change={14.0} changeLabel="HD Video WebRTC" icon={Video} />
        </div>

        {/* CDSS Safety Banner */}
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-indigo-950">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>CDSS Active: Automatic Drug-Drug Interaction & Cross-Allergy Screen Active</span>
          </div>
          <span className="px-2.5 py-0.5 bg-indigo-200 text-indigo-900 font-extrabold rounded-md text-[10px]">
            AI ENGINE OPERATIONAL
          </span>
        </div>

        {/* EMR Records Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" /> Lifetime Patient EMR Archives
          </h2>

          <DataTable
            columns={columns}
            data={emrRecords}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </AppShell>
  );
}
