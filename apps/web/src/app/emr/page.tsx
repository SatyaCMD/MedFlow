'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { PrescriptionPdfModal } from '../../components/shared/PrescriptionPdfModal';
import { TelemedicineConsultationModal } from '../../components/shared/TelemedicineConsultationModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
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
  FileSignature,
  User,
  Heart,
  Pill,
  FlaskConical,
  X,
  Printer,
  Calendar,
  Lock
} from 'lucide-react';

export interface PatientEmrProfile {
  id: string;
  patientName: string;
  mrn: string;
  abhaId: string;
  ageGender: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: string;
  records: Array<{
    id: string;
    visitDate: string;
    attendingDoctor: string;
    department: string;
    diagnosis: string;
    vitals: { bp: string; hr: string; temp: string; spo2: string };
    medications: Array<{ name: string; dosage: string; frequency: string }>;
    labOrders: Array<{ testName: string; status: string; findings: string }>;
    cdssAlert: string;
    sha256Hash: string;
  }>;
}

// Roster database for Clinical Staff (Doctors, Nurses, Lab Techs, Admins)
const CLINICAL_ROSTER_DATABASE: PatientEmrProfile[] = [
  {
    id: 'pemr-105',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    abhaId: '91-55-9900-1122',
    ageGender: '28 Yrs / Male',
    bloodGroup: 'O+',
    allergies: ['No Known Drug Allergies (NKDA)'],
    emergencyContact: '+91 98765 12345 (Family)',
    records: [
      {
        id: 'rec-5',
        visitDate: 'Jul 30, 2026',
        attendingDoctor: 'Dr. Anup Singh, M.D.',
        department: 'Cardiology & Respiratory Medicine',
        diagnosis: 'Acute Bronchitis & Respiratory Tract Infection (ICD-10 J20.9)',
        vitals: { bp: '120/78 mmHg', hr: '72 bpm', temp: '99.1 °F', spo2: '98%' },
        medications: [
          { name: 'Azithromycin 500mg', dosage: '1 Tablet Daily', frequency: 'After breakfast for 5 days' },
          { name: 'Levosalbutamol Inhaler 100mcg', dosage: '2 Puffs PRN', frequency: 'Every 6 hours when coughing' },
          { name: 'Paracetamol 650mg', dosage: '1 Tablet PRN', frequency: 'Every 8 hours if temp > 99°F' },
        ],
        labOrders: [
          { testName: 'Chest X-Ray Digital PA View', status: 'REPORT_SUBMITTED', findings: 'Clear lung fields. Normal broncho-vascular markings. No active parenchymal infiltrates.' },
          { testName: 'CBC & Inflammatory Markers (CRP & ESR)', status: 'REPORT_SUBMITTED', findings: 'WBC: 8,400 /uL, CRP: 4.2 mg/L (Normal Baseline), ESR: 12 mm/hr' },
        ],
        cdssAlert: 'NO DRUG ALLERGIES DETECTED • RESPIRATORY PROFILE CLEAR',
        sha256Hash: 'SHA256: 7f81c90a11de99f220ab40192cc33',
      },
      {
        id: 'rec-5-2',
        visitDate: 'May 14, 2026',
        attendingDoctor: 'Dr. Devendra Roy, M.D.',
        department: 'General Internal Medicine',
        diagnosis: 'Annual Comprehensive Health Audit & Lipid Assessment (ICD-10 Z00.00)',
        vitals: { bp: '118/76 mmHg', hr: '70 bpm', temp: '98.4 °F', spo2: '99%' },
        medications: [
          { name: 'Multivitamin & Mineral Complex', dosage: '1 Tablet Daily', frequency: 'Morning after food' },
          { name: 'Omega-3 Fish Oil 1000mg', dosage: '1 Softgel Daily', frequency: 'Evening after dinner' },
        ],
        labOrders: [
          { testName: 'Comprehensive Metabolic Panel (CMP)', status: 'REPORT_SUBMITTED', findings: 'Fasting Glucose: 92 mg/dL, HbA1c: 5.4% (Normal), Creatinine: 0.9 mg/dL' },
          { testName: 'Serum Lipid Profile', status: 'REPORT_SUBMITTED', findings: 'Total Cholesterol: 175 mg/dL, HDL: 52 mg/dL, Triglycerides: 110 mg/dL' },
        ],
        cdssAlert: 'COMPREHENSIVE HEALTH CHECK VERIFIED',
        sha256Hash: 'SHA256: 2b91c10d77ae33b44109fe294aa11',
      },
    ],
  },
  {
    id: 'pemr-101',
    patientName: 'Jane Patient',
    mrn: 'MC-1001',
    abhaId: '91-44-8891-2041',
    ageGender: '32 Yrs / Female',
    bloodGroup: 'O+',
    allergies: ['No Known Drug Allergies (NKDA)'],
    emergencyContact: '+91 98765 43210 (Spouse)',
    records: [
      {
        id: 'rec-1',
        visitDate: 'Jul 21, 2026',
        attendingDoctor: 'Dr. Devendra Roy, M.D.',
        department: 'Cardiology',
        diagnosis: 'Essential Hypertension (ICD-10 I10)',
        vitals: { bp: '138/88 mmHg', hr: '76 bpm', temp: '98.6 °F', spo2: '99%' },
        medications: [
          { name: 'Amlodipine Besylate 5mg', dosage: '1 Tablet Daily', frequency: 'Morning after breakfast' },
          { name: 'Atorvastatin 10mg', dosage: '1 Tablet Night', frequency: 'Before bed' },
        ],
        labOrders: [
          { testName: 'Lipid Profile Panel', status: 'REPORT_SUBMITTED', findings: 'Total Cholesterol: 215 mg/dL, HDL: 46 mg/dL, LDL: 138 mg/dL' },
          { testName: 'Complete Blood Count (CBC)', status: 'REPORT_SUBMITTED', findings: 'Hemoglobin: 14.2 g/dL, WBC: 6,800 /uL' },
        ],
        cdssAlert: 'NO DRUG ALLERGIES DETECTED',
        sha256Hash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
      },
    ],
  },
  {
    id: 'pemr-102',
    patientName: 'John Doe',
    mrn: 'MC-1002',
    abhaId: '91-12-3344-5566',
    ageGender: '45 Yrs / Male',
    bloodGroup: 'A+',
    allergies: ['Penicillin G', 'Amoxicillin'],
    emergencyContact: '+91 98123 45678 (Brother)',
    records: [
      {
        id: 'rec-2',
        visitDate: 'Jul 15, 2026',
        attendingDoctor: 'Dr. Siddharth Joshi',
        department: 'Neurology',
        diagnosis: 'Acute Migraine Aura (ICD-10 G43.1)',
        vitals: { bp: '122/80 mmHg', hr: '72 bpm', temp: '98.4 °F', spo2: '98%' },
        medications: [
          { name: 'Sumatriptan 50mg', dosage: '1 Tablet PRN', frequency: 'At onset of migraine' },
          { name: 'Propranolol 40mg', dosage: '1 Tablet Twice Daily', frequency: 'Morning and Evening' },
        ],
        labOrders: [
          { testName: 'Brain MRI 1.5T Scan', status: 'REPORT_SUBMITTED', findings: 'Normal brain parenchyma. No acute ischemic focus.' },
        ],
        cdssAlert: '⚠️ PENICILLIN ALLERGY ON FILE',
        sha256Hash: 'SHA256: 4e91b20a11fc78d099be20194ab99',
      },
    ],
  },
  {
    id: 'pemr-103',
    patientName: 'Sarah Connor',
    mrn: 'MC-1003',
    abhaId: '91-99-8877-6655',
    ageGender: '29 Yrs / Female',
    bloodGroup: 'B+',
    allergies: ['Sulfa Drugs'],
    emergencyContact: '+91 99887 76655 (Guardian)',
    records: [
      {
        id: 'rec-3',
        visitDate: 'Jul 28, 2026',
        attendingDoctor: 'Dr. Anup Singh',
        department: 'IPD Cardiology Ward',
        diagnosis: 'Coronary Angiography Post-Op Recovery (ICD-10 Z95.5)',
        vitals: { bp: '128/82 mmHg', hr: '74 bpm', temp: '98.6 °F', spo2: '99%' },
        medications: [
          { name: 'Clopidogrel 75mg', dosage: '1 Tablet Daily', frequency: 'Morning' },
          { name: 'Aspirin 81mg', dosage: '1 Tablet Daily', frequency: 'Afternoon' },
        ],
        labOrders: [
          { testName: 'Cardiac Troponin I Test', status: 'REPORT_SUBMITTED', findings: 'Troponin I: <0.01 ng/mL (Normal Baseline)' },
          { testName: '12-Lead ECG Telemetry', status: 'REPORT_SUBMITTED', findings: 'Normal sinus rhythm. ST-segments stable.' },
        ],
        cdssAlert: 'NO ACTIVE CONTRAINDICATIONS',
        sha256Hash: 'SHA256: 9a88b10c44fd99a221ce30194bc00',
      },
    ],
  },
  {
    id: 'pemr-104',
    patientName: 'Bruce Wayne',
    mrn: 'MC-1004',
    abhaId: '91-77-6655-4433',
    ageGender: '38 Yrs / Male',
    bloodGroup: 'O-',
    allergies: ['Latex Rubber'],
    emergencyContact: '+91 97766 55443 (Alfred)',
    records: [
      {
        id: 'rec-4',
        visitDate: 'Jul 26, 2026',
        attendingDoctor: 'Dr. Rajesh Patel',
        department: 'Orthopedics & Trauma',
        diagnosis: 'Right Knee Meniscal Strain (ICD-10 S83.2)',
        vitals: { bp: '130/84 mmHg', hr: '68 bpm', temp: '98.2 °F', spo2: '99%' },
        medications: [
          { name: 'Etoricoxib 90mg', dosage: '1 Tablet Daily', frequency: 'After meals for 5 days' },
          { name: 'Glucosamine Sulfate 500mg', dosage: '1 Capsule Twice Daily', frequency: 'Morning & Evening' },
        ],
        labOrders: [
          { testName: 'Digital X-Ray Knee Joint', status: 'REPORT_SUBMITTED', findings: 'No cortical fracture line. Joint space preserved.' },
        ],
        cdssAlert: '⚠️ LATEX ALLERGY DETECTED',
        sha256Hash: 'SHA256: 3c11d20e55ab77c109de40192bb88',
      },
    ],
  },
];

// Helper to construct account-specific dynamic EMR profile
function generateAccountEmr(user: any): PatientEmrProfile {
  const name = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient Account';
  const email = user?.email || 'patient@medflow.com';

  // Check if matches preset roster
  const preset = CLINICAL_ROSTER_DATABASE.find(
    (p) => p.patientName.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(p.patientName.toLowerCase())
  );
  if (preset) return preset;

  // Generate dynamic profile for logged in user account
  const hashVal = Math.abs(
    email.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  );
  const mrnCode = `MC-${1000 + (hashVal % 8999)}`;
  const abha = `91-${20 + (hashVal % 70)}-${1000 + (hashVal % 8999)}-${3000 + (hashVal % 6999)}`;

  return {
    id: `pemr-${user?.id || hashVal}`,
    patientName: name,
    mrn: mrnCode,
    abhaId: abha,
    ageGender: '28 Yrs / Patient',
    bloodGroup: 'O+',
    allergies: ['No Known Drug Allergies (NKDA)'],
    emergencyContact: email,
    records: [
      {
        id: `rec-${hashVal}-1`,
        visitDate: 'Jul 30, 2026',
        attendingDoctor: 'Dr. Anup Singh, M.D.',
        department: 'Internal Medicine & Pulmonology',
        diagnosis: 'Acute Respiratory Tract Evaluation & Vital Signs Telemetry (ICD-10 J06.9)',
        vitals: { bp: '120/78 mmHg', hr: '72 bpm', temp: '98.6 °F', spo2: '99%' },
        medications: [
          { name: 'Azithromycin 500mg', dosage: '1 Tablet Daily', frequency: 'After breakfast for 5 days' },
          { name: 'Levosalbutamol Inhaler 100mcg', dosage: '2 Puffs PRN', frequency: 'Every 6 hours when coughing' },
          { name: 'Paracetamol 650mg', dosage: '1 Tablet PRN', frequency: 'Every 8 hours if temp > 99°F' },
        ],
        labOrders: [
          { testName: 'Chest X-Ray Digital PA View', status: 'REPORT_SUBMITTED', findings: 'Clear lung fields. Normal broncho-vascular markings.' },
          { testName: 'CBC & Inflammatory Markers (CRP & ESR)', status: 'REPORT_SUBMITTED', findings: 'WBC: 8,400 /uL, CRP: 4.2 mg/L (Normal Baseline)' },
        ],
        cdssAlert: 'NO DRUG ALLERGIES DETECTED • CLINICAL RECORD VERIFIED',
        sha256Hash: `SHA256: ${hashVal}a88b10c44fd99a221ce30194bc00`,
      },
    ],
  };
}

export default function EmrPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientEmrProfile | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PatientEmrProfile['records'][0] | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isVideoConsultOpen, setIsVideoConsultOpen] = useState(false);

  const isPatientRole = user?.role === 'PATIENT';
  const currentRole = user?.role || 'DOCTOR';
  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient Account';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/explore/emr');
      return;
    }

    if (user) {
      if (isPatientRole) {
        // Patient role gets ONLY their own dynamic account EMR
        setSelectedPatient(generateAccountEmr(user));
      } else {
        // Staff/Doctor default to first patient or matched patient in roster
        const matched = CLINICAL_ROSTER_DATABASE.find((p) =>
          p.patientName.toLowerCase().includes(fullName.toLowerCase())
        );
        setSelectedPatient(matched || CLINICAL_ROSTER_DATABASE[0]);
      }
    }
  }, [loading, user, router, fullName, isPatientRole]);

  if (loading || !user || !selectedPatient) {
    return (
      <AppShell userRole={currentRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </AppShell>
    );
  }

  const filteredPatients = CLINICAL_ROSTER_DATABASE.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.patientName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.abhaId.toLowerCase().includes(q) ||
      p.records.some((r) => r.diagnosis.toLowerCase().includes(q) || r.attendingDoctor.toLowerCase().includes(q))
    );
  });

  const handleOpenRecordModal = (record: PatientEmrProfile['records'][0]) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const handlePrintEmr = () => {
    if (!selectedRecord) return;
    showToast({
      title: 'Generating Signed EMR PDF 🖨️',
      message: `Exporting certified electronic medical record for ${selectedPatient.patientName}...`,
      type: 'success',
    });
    if (typeof window !== 'undefined') window.print();
  };

  const handleLaunchVideoConsult = () => {
    setIsVideoConsultOpen(true);
    showToast({
      title: 'Telemedicine Video Room Connected',
      message: `Secure 256-bit WebRTC video consult active for ${selectedPatient.patientName}.`,
      type: 'success',
    });
  };

  return (
    <AppShell userRole={currentRole}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Telemedicine Video Modal */}
        <TelemedicineConsultationModal
          isOpen={isVideoConsultOpen}
          onClose={() => setIsVideoConsultOpen(false)}
          patientName={selectedPatient.patientName}
          patientMrn={selectedPatient.mrn}
          doctorName="Dr. Anup Singh"
        />

        {/* Dynamic Role-Based Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                {isPatientRole
                  ? `My Personal Lifetime EHR Vault — ${fullName}`
                  : currentRole === 'NURSE'
                  ? 'Nursing Station Ward EMR & Vitals Telemetry'
                  : currentRole === 'LAB_TECHNICIAN'
                  ? 'Pathology & Diagnostic Laboratory EMR Vault'
                  : 'Individual Patient EMR & Lifetime EHR Vault'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-black uppercase">
                {currentRole.replace(/_/g, ' ')} VIEW
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              {isPatientRole
                ? `Official encrypted electronic health record profile for ${fullName}. All diagnoses, prescriptions, and lab test reports are securely stored here.`
                : 'Select or search any patient in your clinical roster to access their longitudinal medical history, CDSS safety alerts, digital prescriptions, and signed EMR files.'}
            </p>
          </div>

          <button
            onClick={handleLaunchVideoConsult}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Video className="w-4 h-4 text-emerald-200" />
            <span>Launch Video Consult ({selectedPatient.patientName})</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total EMR Archives" value="14,820 Records" change={100.0} changeLabel="SHA-256 encrypted" icon={FileText} />
          <StatCard title="CDSS AI Safety Index" value="99.9% Clean" change={0.0} changeLabel="drug interaction engine" icon={Sparkles} />
          <StatCard title="Telemedicine Consults" value="48 Today" change={14.0} changeLabel="HD Video WebRTC" icon={Video} />
        </div>

        {/* EMR Profile Directory */}
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
          {/* STAFF ONLY: Roster Selection Header & Search Bar */}
          {!isPatientRole && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Clinical Roster — Select Patient EMR History
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Search individual patients by Name, MRN, or ABHA ID to access their lifetime medical file.
                  </p>
                </div>

                {/* Patient Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search patient name, MRN, ABHA ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Patient Selection Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {filteredPatients.map((p) => {
                  const isSelected = selectedPatient.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <User className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                      <span>{p.patientName}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                        {p.mrn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* PATIENT ONLY: Secure Vault Indicator Banner */}
          {isPatientRole && (
            <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Personal Longitudinal EHR Vault — {selectedPatient.patientName}</h3>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    Your personal electronic medical history, e-prescriptions, and lab diagnostic reports.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black rounded-full uppercase tracking-wider hidden sm:inline-block">
                🔒 PRIVATE ACCESS ONLY
              </span>
            </div>
          )}

          {/* ACTIVE INDIVIDUAL PATIENT EMR PROFILE FILE */}
          <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-3xl space-y-6">
            {/* Patient Header Details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedPatient.patientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{selectedPatient.patientName}</h3>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black rounded-full uppercase">
                      MRN: {selectedPatient.mrn}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    ABHA ID: <span className="font-mono text-blue-700 font-black">{selectedPatient.abhaId}</span> • {selectedPatient.ageGender} • Blood Group: <strong className="text-rose-600">{selectedPatient.bloodGroup}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black rounded-xl flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Allergies: {selectedPatient.allergies.join(', ')}
                </span>
              </div>
            </div>

            {/* Individual Patient Consultation Records */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Longitudinal Medical History & Digital Prescriptions ({selectedPatient.records.length} Visit File{selectedPatient.records.length > 1 ? 's' : ''})
              </h4>

              {selectedPatient.records.map((rec) => (
                <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                  {/* Record Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-600">Visit Date: {rec.visitDate} • {rec.department}</span>
                      <h5 className="font-black text-slate-900 text-sm mt-0.5">{rec.diagnosis}</h5>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Attending Physician: <strong>{rec.attendingDoctor}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        rec.cdssAlert.includes('⚠️') ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {rec.cdssAlert}
                      </span>
                      <button
                        onClick={() => handleOpenRecordModal(rec)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>View Signed EMR File</span>
                      </button>
                    </div>
                  </div>

                  {/* Recorded Vitals Telemetry */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                    <div><span className="text-[10px] text-slate-400 uppercase font-black block">BLOOD PRESSURE</span><strong className="text-slate-800">{rec.vitals.bp}</strong></div>
                    <div><span className="text-[10px] text-slate-400 uppercase font-black block">HEART RATE</span><strong className="text-slate-800">{rec.vitals.hr}</strong></div>
                    <div><span className="text-[10px] text-slate-400 uppercase font-black block">TEMPERATURE</span><strong className="text-slate-800">{rec.vitals.temp}</strong></div>
                    <div><span className="text-[10px] text-slate-400 uppercase font-black block">OXYGEN SATURATION</span><strong className="text-emerald-700">{rec.vitals.spo2}</strong></div>
                  </div>

                  {/* Prescribed Medications */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-blue-600" /> Prescribed Dosing Schedule
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rec.medications.map((m, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-between">
                          <div>
                            <strong className="text-slate-900 block">{m.name}</strong>
                            <span className="text-[10px] text-slate-500">{m.frequency}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">{m.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lab Test Reports */}
                  {rec.labOrders && rec.labOrders.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-indigo-600" /> Laboratory Diagnostic Reports
                      </span>
                      <div className="space-y-1.5">
                        {rec.labOrders.map((l, idx) => (
                          <div key={idx} className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs font-semibold space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-indigo-950">{l.testName}</strong>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">✓ Completed</span>
                            </div>
                            <p className="text-[11px] text-slate-700">Findings: {l.findings}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>{rec.sha256Hash}</span>
                    <span className="text-emerald-700 font-sans font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Certified SHA-256 SHA-2 Signed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signed EMR Record Detail Modal */}
      <AnimatePresence>
        {isRecordModalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400">Certified Electronic Medical Record</span>
                  </div>
                  <h3 className="text-xl font-black mt-1">EMR File #{selectedRecord.id}</h3>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Printable Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-sans">
                {/* Patient Summary */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PATIENT FILE</span>
                    <h4 className="text-lg font-black text-slate-900 mt-0.5">{selectedPatient.patientName}</h4>
                    <p className="text-xs font-bold text-blue-600">MRN: {selectedPatient.mrn} • ABHA ID: {selectedPatient.abhaId}</p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">{selectedPatient.ageGender} • Blood Group: {selectedPatient.bloodGroup}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CLINICAL TELEMETRY</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Date: <span className="text-slate-900 font-black">{selectedRecord.visitDate}</span></p>
                    <p className="text-xs font-bold text-slate-800">Dept: <span className="text-slate-900 font-bold">{selectedRecord.department}</span></p>
                    <p className="text-xs font-bold text-slate-800">Doctor: <span className="text-blue-700 font-bold">{selectedRecord.attendingDoctor}</span></p>
                  </div>
                </div>

                {/* Clinical Diagnosis */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-500">PRIMARY CLINICAL DIAGNOSIS</span>
                  <h5 className="text-base font-black text-slate-900">{selectedRecord.diagnosis}</h5>
                </div>

                {/* Vitals */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                  <div><span className="text-[10px] text-slate-500 font-black block">BP TELEMETRY</span><strong>{selectedRecord.vitals.bp}</strong></div>
                  <div><span className="text-[10px] text-slate-500 font-black block">PULSE HR</span><strong>{selectedRecord.vitals.hr}</strong></div>
                  <div><span className="text-[10px] text-slate-500 font-black block">TEMP</span><strong>{selectedRecord.vitals.temp}</strong></div>
                  <div><span className="text-[10px] text-slate-500 font-black block">SPO2</span><strong className="text-emerald-700">{selectedRecord.vitals.spo2}</strong></div>
                </div>

                {/* Prescribed Medications */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">Digital E-Prescription Schedule</h5>
                  <div className="space-y-2">
                    {selectedRecord.medications.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold">
                        <div>
                          <span className="text-slate-900 block">{m.name}</span>
                          <span className="text-[11px] text-slate-500 font-normal">{m.frequency}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-black">{m.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CDSS Safety Seal */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> CDSS Safety Engine Verified: {selectedRecord.cdssAlert}</span>
                  <span className="font-mono text-[10px] text-slate-500">{selectedRecord.sha256Hash}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> HIPAA & ISO 27001 Compliant EMR Record
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsRecordModalOpen(false)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl cursor-pointer">
                    Close
                  </button>
                  <button onClick={handlePrintEmr} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer">
                    <Printer className="w-4 h-4" />
                    <span>Print Signed EMR PDF</span>
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
