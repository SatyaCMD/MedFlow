'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  ArrowRightLeft,
  Droplet,
  Stethoscope,
  X,
  History,
  FileText,
  Pill,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Printer,
  Download,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  PatientCensusRecord,
  getPatientCensus,
  createBloodRequest,
} from '../../data/patientCensusStore';
import {
  getClinicalRecords,
  ClinicalRecord,
  savePharmacySale,
  PharmacySaleRecord,
} from '../../data/medicalHistoryStore';
import { CareTransferModal } from '../../components/shared/CareTransferModal';
import { PrescriptionPdfModal, PrescriptionData } from '../../components/shared/PrescriptionPdfModal';
import { useToast } from '../../context/ToastContext';

export default function PatientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [patients, setPatients] = useState<PatientCensusRecord[]>([]);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('ALL');

  // Modal States
  const [transferModalPatient, setTransferModalPatient] = useState<PatientCensusRecord | null>(null);
  const [detailPatient, setDetailPatient] = useState<PatientCensusRecord | null>(null);

  // Prescription PDF Modal State for Pharmacist View
  const [selectedRxData, setSelectedRxData] = useState<PrescriptionData | undefined>(undefined);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);

  const isPharmacist = user?.role === 'PHARMACIST';
  const currentRole = user?.role || 'DOCTOR';

  const loadCensus = () => {
    setPatients(getPatientCensus());
    setClinicalRecords(getClinicalRecords());
  };

  useEffect(() => {
    loadCensus();

    const handleClinicalUpdate = () => {
      setClinicalRecords(getClinicalRecords());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('medflow-clinical-records-updated', handleClinicalUpdate);
      return () => {
        window.removeEventListener('medflow-clinical-records-updated', handleClinicalUpdate);
      };
    }
  }, []);

  if (!loading && !user) {
    if (typeof window !== 'undefined') {
      router.push('/explore/patients');
    }
    return null;
  }

  // Doctor-specific filtering & search filtering for Census
  const filteredPatients = patients.filter((p) => {
    const matchesDoctor =
      selectedDoctorFilter === 'ALL' || p.doctorName.toLowerCase().includes(selectedDoctorFilter.toLowerCase());

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDoctor && matchesSearch;
  });

  // Pharmacist Filtered Prescriptions
  const filteredClinicalRecords = clinicalRecords.filter((rec) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.patientName.toLowerCase().includes(q) ||
      rec.mrn.toLowerCase().includes(q) ||
      rec.rxNumber.toLowerCase().includes(q) ||
      rec.doctorName.toLowerCase().includes(q) ||
      rec.diagnosis.toLowerCase().includes(q)
    );
  });

  const handleRequestBloodForPatient = (patient: PatientCensusRecord) => {
    createBloodRequest({
      patientName: patient.name,
      mrn: patient.mrn,
      bloodGroup: patient.bloodGroup,
      units: 2,
      priority: 'CRITICAL_STAT',
      requestedBy: user?.role === 'DOCTOR' ? `Dr. ${patient.doctorName}` : `Nurse Clara Barton`,
      doctorName: patient.doctorName,
    });

    showToast({
      title: 'Blood Transfusion Requested 🩸',
      message: `Submitted request for 2 Units of ${patient.bloodGroup} for ${patient.name} (${patient.mrn}). Pending Doctor & Blood Bank Admin Dual Clearance.`,
      type: 'success',
    });
  };

  const handleViewPrescriptionPdf = (rec: ClinicalRecord) => {
    const rxData: PrescriptionData = {
      rxNumber: rec.rxNumber,
      patientName: rec.patientName,
      mrn: rec.mrn,
      age: '32 Yrs',
      gender: 'Female',
      bloodGroup: 'O+',
      doctorName: rec.doctorName,
      department: rec.department,
      date: rec.date,
      diagnosis: rec.diagnosis,
      medications: rec.medications,
      labTests: rec.labTests?.map((t) => ({
        name: t.name,
        category: t.category || 'Pathology',
        specimen: t.specimen || 'Blood Specimen',
        instructions: t.instructions || 'Standard Protocol',
      })),
      signatureHash: rec.signatureHash,
    };

    setSelectedRxData(rxData);
    setIsRxPdfOpen(true);
  };

  const handleDispenseAndBill = (rec: ClinicalRecord) => {
    const newSale: PharmacySaleRecord = {
      id: `ps-${Date.now()}`,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: Date.now(),
      customerName: `${rec.patientName} (${rec.mrn})`,
      mrn: rec.mrn,
      type: 'PATIENT_DISPENSARY',
      items: rec.medications.map((m) => ({
        medicineName: m.name,
        qty: 1,
        unitPrice: 150,
        total: 150,
      })),
      totalAmount: rec.medications.length * 150,
      paymentMethod: 'Pharmacy Credit (Billed)',
      dispensedBy: 'Pharmacist Dispensary',
    };

    savePharmacySale(newSale);
    showToast({
      title: 'Doctor Prescription Dispensed & Billed! 💊',
      message: `Billed Invoice #${newSale.invoiceNo} for ${rec.patientName} (${rec.rxNumber}). Stock deducted from central pharmacy.`,
      type: 'success',
    });
  };

  // DOCTOR / ADMIN CENSUS COLUMNS
  const censusColumns = [
    {
      header: 'MRN NUMBER',
      accessor: (row: PatientCensusRecord) => (
        <button
          onClick={() => setDetailPatient(row)}
          className="font-black text-blue-600 hover:text-blue-800 underline cursor-pointer text-xs"
        >
          {row.mrn}
        </button>
      ),
    },
    {
      header: 'PATIENT NAME',
      accessor: (row: PatientCensusRecord) => (
        <div>
          <button
            onClick={() => setDetailPatient(row)}
            className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left cursor-pointer"
          >
            {row.name}
          </button>
          <div className="text-[10px] text-slate-400 font-semibold">{row.ward} • {row.roomNo}</div>
        </div>
      ),
    },
    {
      header: 'DEMOGRAPHICS',
      accessor: (row: PatientCensusRecord) => (
        <div className="text-slate-700 font-medium">
          {row.age} yrs • {row.gender}
          <span className="ml-1.5 inline-block px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-md font-bold text-[9px]">
            {row.bloodGroup}
          </span>
        </div>
      ),
    },
    {
      header: 'CLINICAL CONDITION',
      accessor: (row: PatientCensusRecord) => (
        <span className="text-slate-800 font-semibold max-w-xs block truncate" title={row.condition}>
          {row.condition}
        </span>
      ),
    },
    {
      header: 'CARE STATUS',
      accessor: (row: PatientCensusRecord) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            row.status === 'admitted'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'outpatient'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'ATTENDING PHYSICIAN',
      accessor: (row: PatientCensusRecord) => (
        <div>
          <span className="text-slate-900 font-bold block">{row.doctorName}</span>
          <span className="text-[10px] text-slate-500 font-medium">Caregiver: {row.nurseName.split(' ')[0]}</span>
        </div>
      ),
    },
    {
      header: 'CLINICAL ACTIONS',
      accessor: (row: PatientCensusRecord) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTransferModalPatient(row)}
            title="Transfer Case (Doctor Leave / Critical Escalation)"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Transfer Case</span>
          </button>

          <button
            onClick={() => handleRequestBloodForPatient(row)}
            title="Submit Dual-Approval Blood Request"
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5 text-rose-600" />
            <span>Request Blood</span>
          </button>
        </div>
      ),
    },
  ];

  // PHARMACIST PRESCRIPTION COLUMNS
  const rxColumns = [
    {
      header: 'RX NUMBER & DATE',
      accessor: (row: ClinicalRecord) => (
        <div>
          <span className="font-mono font-black text-amber-700 block text-xs">{row.rxNumber}</span>
          <span className="text-[10px] font-semibold text-slate-500">{row.date}</span>
        </div>
      ),
    },
    {
      header: 'PATIENT NAME & MRN',
      accessor: (row: ClinicalRecord) => (
        <div className="max-w-[110px]">
          <span className="font-black text-slate-900 block text-xs truncate" title={row.patientName}>{row.patientName}</span>
          <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
        </div>
      ),
    },
    {
      header: 'ATTENDING DOCTOR',
      accessor: (row: ClinicalRecord) => (
        <div className="max-w-[120px]">
          <span className="font-bold text-slate-900 block text-xs truncate" title={row.doctorName}>{row.doctorName}</span>
          <span className="text-[10px] text-blue-600 font-semibold truncate block">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'DIAGNOSIS',
      accessor: (row: ClinicalRecord) => (
        <span className="text-slate-700 font-semibold text-xs truncate max-w-[150px] sm:max-w-[180px] block" title={row.diagnosis}>
          {row.diagnosis}
        </span>
      ),
    },
    {
      header: 'PRESCRIBED MEDICATIONS',
      accessor: (row: ClinicalRecord) => (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-black whitespace-nowrap">
          {row.medications.length} Medicines Prescribed
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      align: 'right' as const,
      accessor: (row: ClinicalRecord) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleViewPrescriptionPdf(row)}
            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shrink-0"
            title="View Official Doctor Prescription Copy"
          >
            <FileText className="w-3 h-3 text-blue-600" />
            <span>View PDF</span>
          </button>

          <button
            onClick={() => handleDispenseAndBill(row)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
            title="Dispense Medications & Deduct Inventory Stock"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Dispense</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell userRole={currentRole}>
      <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {isPharmacist ? (
                <>
                  <Pill className="w-6 h-6 text-amber-600" />
                  Patient Prescriptions Directory & Doctor-Issued Rx Stream
                </>
              ) : (
                <>
                  <Users className="w-6 h-6 text-blue-600" />
                  Patient Master Directory & Medical Census
                </>
              )}
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              {isPharmacist
                ? 'Pharmacy-verified patient prescriptions issued by hospital doctors with live stock deduction & PDF viewing.'
                : 'Doctor-specific medical census, cross-practitioner case handoffs, and dual-approval blood dispatch telemetry.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPharmacist && (
              <button
                onClick={() => showToast({ title: 'Admit Patient Form Opened', message: 'New patient admission protocol initiated.', type: 'info' })}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Admit New Patient</span>
              </button>
            )}

            {isPharmacist && (
              <span className="px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>PHARMACIST DISPENSARY ACTIVE</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {isPharmacist ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Doctor Prescriptions Issued" value={`${clinicalRecords.length} Prescriptions`} change={12.4} changeLabel="active doctor orders" icon={Pill} />
            <StatCard title="Pending Pharmacy Dispense" value={`${clinicalRecords.length} Ready`} change={0.0} changeLabel="ready at counter" icon={Clock} />
            <StatCard title="Dispensary Sales Fulfilled" value="48 Today" change={18.2} changeLabel="verified & billed" icon={CheckCircle2} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Registered Patients" value={`${patients.length} Patients`} change={8.4} changeLabel="active EHR directory" />
            <StatCard title="Currently Admitted Wards" value={`${patients.filter((p) => p.status === 'admitted').length} Admitted`} change={-1.2} changeLabel="bed capacity 86%" />
            <StatCard title="Outpatient & Discharged" value={`${patients.filter((p) => p.status !== 'admitted').length} Consults`} change={14.1} changeLabel="active OPD schedule" />
          </div>
        )}

        {/* Search Bar & Doctor Filter Tabs */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs space-y-4">
          {!isPharmacist && (
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Doctor Census Scope:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedDoctorFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    selectedDoctorFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Hospital Census ({patients.length})
                </button>

                <button
                  onClick={() => setSelectedDoctorFilter('House')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    selectedDoctorFilter === 'House'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dr. House&apos;s Patients ({patients.filter((p) => p.doctorName.includes('House')).length})
                </button>

                <button
                  onClick={() => setSelectedDoctorFilter('Watson')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    selectedDoctorFilter === 'Watson'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dr. Watson&apos;s Patients ({patients.filter((p) => p.doctorName.includes('Watson')).length})
                </button>

                <button
                  onClick={() => setSelectedDoctorFilter('Strange')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    selectedDoctorFilter === 'Strange'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dr. Strange&apos;s Patients ({patients.filter((p) => p.doctorName.includes('Strange')).length})
                </button>
              </div>
            </div>
          )}

          {/* Interactive Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isPharmacist ? 'Search by Patient Name, MRN (MC-1001), Rx #, or Doctor...' : 'Search by Patient Name, MRN (MC-1001), Condition, or Doctor...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-amber-600 font-black">{isPharmacist ? filteredClinicalRecords.length : filteredPatients.length}</span> {isPharmacist ? 'doctor-issued prescriptions' : 'matching patient records'}
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              {isPharmacist ? `DOCTOR-ISSUED PATIENT PRESCRIPTIONS STREAM (${filteredClinicalRecords.length})` : `ACTIVE MEDICAL CENSUS (${filteredPatients.length})`}
            </h2>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> HIPAA Encryption Active
            </span>
          </div>

          <DataTable
            columns={(isPharmacist ? rxColumns : censusColumns) as any}
            data={(isPharmacist ? filteredClinicalRecords : filteredPatients) as any}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Care Transfer Modal */}
        <CareTransferModal
          isOpen={!!transferModalPatient}
          onClose={() => setTransferModalPatient(null)}
          patient={transferModalPatient}
          onTransferSuccess={loadCensus}
        />

        {/* Official Prescription PDF Viewer Modal */}
        <PrescriptionPdfModal
          isOpen={isRxPdfOpen}
          onClose={() => setIsRxPdfOpen(false)}
          prescriptionData={selectedRxData}
        />

        {/* Patient Detail Drawer */}
        {detailPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-200 font-extrabold uppercase">Patient EHR File</div>
                  <h2 className="text-xl font-black">{detailPatient.name} <span className="text-blue-400">({detailPatient.mrn})</span></h2>
                </div>
                <button
                  onClick={() => setDetailPatient(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800">
                {/* Clinical Metadata Box */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Demographics</span>
                      <div className="font-bold text-slate-900">{detailPatient.age} Yrs • {detailPatient.gender}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Blood Group</span>
                      <div className="font-black text-rose-600">{detailPatient.bloodGroup}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Ward & Room</span>
                      <div className="font-bold text-slate-800">{detailPatient.ward} • {detailPatient.roomNo}</div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Care Status</span>
                      <div className="font-extrabold text-emerald-600 uppercase">{detailPatient.status}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Diagnosis</span>
                    <div className="font-bold text-blue-700 text-sm">{detailPatient.condition}</div>
                  </div>
                </div>

                {/* Assigned Care Team */}
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider">Assigned Clinical Care Team</h3>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Attending Physician:</span>
                      <span className="font-black text-blue-800">{detailPatient.doctorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Caregiver Nurse:</span>
                      <span className="font-bold text-slate-800">{detailPatient.nurseName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Assigned Lab Tech:</span>
                      <span className="font-bold text-slate-800">{detailPatient.labTechName}</span>
                    </div>
                  </div>
                </div>

                {/* Case Transfer Audit History */}
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-600" />
                    Case Transfer & Handoff Audit History ({detailPatient.transferHistory.length})
                  </h3>
                  {detailPatient.transferHistory.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 font-medium">
                      No practitioner transfer handoffs recorded yet. Primary physician is active.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {detailPatient.transferHistory.map((tr) => (
                        <div key={tr.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-700">Reassigned to {tr.toStaff}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{tr.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">From: {tr.fromStaff} • Reason: <strong className="text-slate-800">{tr.reasonType.replace(/_/g, ' ')}</strong></div>
                          <div className="text-[11px] text-slate-500 italic">&quot;{tr.notes}&quot;</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions Footer */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setTransferModalPatient(detailPatient);
                      setDetailPatient(null);
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transfer Case to Doctor/Staff</span>
                  </button>

                  <button
                    onClick={() => {
                      handleRequestBloodForPatient(detailPatient);
                      setDetailPatient(null);
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Droplet className="w-4 h-4" />
                    <span>Request Blood Unit</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
