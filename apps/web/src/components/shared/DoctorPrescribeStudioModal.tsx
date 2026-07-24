'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Search,
  Plus,
  Trash2,
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  FlaskConical,
  Activity,
  Check,
  Utensils,
  ChevronDown,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { MASTER_PHARMACY_CATALOG, PharmacyItem } from '../../data/pharmacyCatalog';

export interface PrescribedItem {
  id: string;
  medicineName: string;
  category: string;
  frequency: string; // e.g. "Thrice Daily (TID - Every 8 Hours)"
  duration: string;  // e.g. "5 Days"
  timing: string;    // e.g. "After Food (PC - Post Meal)"
  instructions: string;
}

export interface PrescribedLabTest {
  id: string;
  testName: string;
  category: string;
  specimen: string;
  fastingRequirement: string;
  turnaroundTime: string;
  price: number;
}

export interface LabTestCatalogItem {
  id: string;
  name: string;
  category: 'BLOOD_PATHOLOGY' | 'RADIOLOGY_SCANS' | 'CARDIAC_ECG' | 'METABOLIC_HORMONAL' | 'URINE_STOOL';
  categoryLabel: string;
  specimen: string;
  fastingRequirement: string;
  turnaroundTime: string;
  price: number;
}

export const MASTER_LAB_TESTS_CATALOG: LabTestCatalogItem[] = [
  { id: 'lt-1', name: 'CBC (Complete Blood Count & Differential)', category: 'BLOOD_PATHOLOGY', categoryLabel: 'Blood & Pathology', specimen: 'Venous Blood (EDTA)', fastingRequirement: 'Fasting Not Required', turnaroundTime: '4 Hours', price: 350 },
  { id: 'lt-2', name: 'Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)', category: 'METABOLIC_HORMONAL', categoryLabel: 'Metabolic & Hormonal', specimen: 'Serum (Yellow Top)', fastingRequirement: '12-Hour Fasting Required', turnaroundTime: '6 Hours', price: 850 },
  { id: 'lt-3', name: 'HbA1c Glycated Hemoglobin (Diabetes Check)', category: 'METABOLIC_HORMONAL', categoryLabel: 'Metabolic & Hormonal', specimen: 'Whole Blood', fastingRequirement: 'Fasting Not Required', turnaroundTime: '4 Hours', price: 550 },
  { id: 'lt-4', name: 'ECG / EKG 12-Lead Cardiac Diagnostic Tracing', category: 'CARDIAC_ECG', categoryLabel: 'Cardiac & ECG', specimen: 'Non-Invasive Diagnostic', fastingRequirement: 'Fasting Not Required', turnaroundTime: 'Immediate', price: 450 },
  { id: 'lt-5', name: 'Chest X-Ray PA View (Digital Radiology)', category: 'RADIOLOGY_SCANS', categoryLabel: 'Radiology & Scans', specimen: 'Digital Imaging Scan', fastingRequirement: 'Fasting Not Required', turnaroundTime: '1 Hour', price: 600 },
  { id: 'lt-6', name: 'Liver Function Test (LFT - Bilirubin, SGOT, SGPT, ALP)', category: 'BLOOD_PATHOLOGY', categoryLabel: 'Blood & Pathology', specimen: 'Serum', fastingRequirement: '8-Hour Fasting Recommended', turnaroundTime: '6 Hours', price: 750 },
  { id: 'lt-7', name: 'Kidney Function Test (KFT - Urea, Creatinine, Uric Acid)', category: 'BLOOD_PATHOLOGY', categoryLabel: 'Blood & Pathology', specimen: 'Serum', fastingRequirement: 'Fasting Not Required', turnaroundTime: '6 Hours', price: 700 },
  { id: 'lt-8', name: 'Thyroid Profile (T3, T4, TSH Ultrasensitive)', category: 'METABOLIC_HORMONAL', categoryLabel: 'Metabolic & Hormonal', specimen: 'Serum', fastingRequirement: 'Overnight Fasting Recommended', turnaroundTime: '8 Hours', price: 800 },
  { id: 'lt-9', name: 'Ultrasound Abdomen & Pelvis (USG Scan)', category: 'RADIOLOGY_SCANS', categoryLabel: 'Radiology & Scans', specimen: 'Ultrasound Imaging', fastingRequirement: 'Full Bladder / 6-Hour Fasting', turnaroundTime: '2 Hours', price: 1200 },
  { id: 'lt-10', name: 'CT Brain Non-Contrast (NCCT Computed Tomography)', category: 'RADIOLOGY_SCANS', categoryLabel: 'Radiology & Scans', specimen: 'CT Imaging Scan', fastingRequirement: 'Fasting Not Required', turnaroundTime: '2 Hours', price: 2500 },
  { id: 'lt-11', name: 'MRI Lumbar Spine / Brain High-Resolution Scan', category: 'RADIOLOGY_SCANS', categoryLabel: 'Radiology & Scans', specimen: 'MRI Imaging Scan', fastingRequirement: 'Fasting Not Required', turnaroundTime: '4 Hours', price: 4500 },
  { id: 'lt-12', name: 'Urine Routine & Microscopy Analysis', category: 'URINE_STOOL', categoryLabel: 'Urine & Stool', specimen: 'Midstream Urine', fastingRequirement: 'Morning First Void Sample', turnaroundTime: '3 Hours', price: 250 },
  { id: 'lt-13', name: 'Vitamin D3 & B12 Quantitative Serum Panel', category: 'METABOLIC_HORMONAL', categoryLabel: 'Metabolic & Hormonal', specimen: 'Serum', fastingRequirement: 'Fasting Not Required', turnaroundTime: '12 Hours', price: 1400 },
  { id: 'lt-14', name: 'D-Dimer & Troponin-I High-Sensitivity Cardiac Panel', category: 'CARDIAC_ECG', categoryLabel: 'Cardiac & ECG', specimen: 'Plasma (Citrate)', fastingRequirement: 'STAT Emergency', turnaroundTime: '1 Hour', price: 1800 },
  { id: 'lt-15', name: 'Serum Electrolytes Panel (Na, K, Cl)', category: 'BLOOD_PATHOLOGY', categoryLabel: 'Blood & Pathology', specimen: 'Serum', fastingRequirement: 'Fasting Not Required', turnaroundTime: '4 Hours', price: 500 },
];

// Prescribing Frequency Dropdown Options
const FREQUENCY_LIST = [
  { value: 'Once Daily (QD - Morning)', label: 'Once Daily (QD - Morning)' },
  { value: 'Twice Daily (BID - Every 12 Hours)', label: 'Twice Daily (BID - Every 12 Hours)' },
  { value: 'Thrice Daily (TID - Every 8 Hours)', label: 'Thrice Daily (TID - Every 8 Hours)' },
  { value: 'Four Times Daily (QID - Every 6 Hours)', label: 'Four Times Daily (QID - Every 6 Hours)' },
  { value: 'As Needed (PRN - Symptomatic)', label: 'As Needed (PRN - Symptomatic)' },
  { value: 'At Bedtime (HS - Night)', label: 'At Bedtime (HS - Night)' },
  { value: 'Stat / Immediate Single Dose', label: 'Stat / Immediate Single Dose' },
];

// Treatment Duration Dropdown Options
const DURATION_LIST = [
  { value: '3 Days', label: '3 Days (Short Course)' },
  { value: '5 Days', label: '5 Days (Standard Course)' },
  { value: '7 Days', label: '7 Days (Full Week)' },
  { value: '10 Days', label: '10 Days (Extended)' },
  { value: '14 Days', label: '14 Days (2 Weeks)' },
  { value: '30 Days', label: '30 Days (1 Month Maintenance)' },
  { value: '90 Days', label: '90 Days (3 Months Maintenance)' },
];

// Food Timing Dropdown Options
const TIMING_LIST = [
  { value: 'After Food (PC - Post Meal)', label: 'After Food (PC - Post Meal)' },
  { value: 'Before Food (AC - Empty Stomach)', label: 'Before Food (AC - Empty Stomach)' },
  { value: 'With Food (Co-ingested)', label: 'With Food (Co-ingested)' },
  { value: 'Bedtime (HS - Night)', label: 'Bedtime (HS - Night)' },
  { value: 'Irrespective of Food (Anytime)', label: 'Irrespective of Food (Anytime)' },
];

interface DoctorPrescribeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientMrn: string;
  doctorName: string;
  doctorSpecialty: string;
  onPrescriptionIssued: (rxData: any) => void;
}

// Custom Interactive Dropdown Component
const CustomInteractiveDropdown: React.FC<{
  title: string;
  icon: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  pills: { label: string; value: string }[];
}> = ({ title, icon, value, options, onChange, pills }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value || value.startsWith(o.value));
  const displayLabel = selectedOption ? selectedOption.label : value;

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
        {icon}
        {title}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border text-left rounded-xl font-bold text-xs flex items-center justify-between shadow-2xs transition-all cursor-pointer ${
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20 text-blue-950 bg-blue-50/20'
            : 'border-blue-300 hover:border-blue-500 text-slate-900 hover:bg-slate-50'
        }`}
      >
        <span className="truncate pr-2">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-blue-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Animated Dropdown Menu Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-[200] bg-white border border-blue-200 rounded-2xl shadow-2xl py-1.5 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = value === opt.value || value.startsWith(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black'
                      : 'text-slate-800 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synchronized Quick Pills */}
      <div className="flex flex-wrap gap-1 text-[10px] font-bold pt-0.5">
        {pills.map((pill) => {
          const isPillActive = value === pill.value || value.startsWith(pill.value);
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onChange(pill.value)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isPillActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DoctorPrescribeStudioModal: React.FC<DoctorPrescribeStudioModalProps> = ({
  isOpen,
  onClose,
  patientName,
  patientMrn,
  doctorName,
  doctorSpecialty,
  onPrescriptionIssued,
}) => {
  const { showToast } = useToast();

  // Category & Search State
  const [medCategory, setMedCategory] = useState('ALL');
  const [searchDrugQuery, setSearchDrugQuery] = useState('');

  const [labCategory, setLabCategory] = useState('ALL');
  const [searchLabQuery, setSearchLabQuery] = useState('');

  // Interactive Dosing Control States
  const [frequency, setFrequency] = useState('At Bedtime (HS - Night)');
  const [duration, setDuration] = useState('30 Days');
  const [timing, setTiming] = useState('After Food (PC - Post Meal)');
  const [diagnosis, setDiagnosis] = useState('Acute Neurological Headache & Acid Reflux');

  // Prescribed Medications List
  const [prescribedMedsList, setPrescribedMedsList] = useState<PrescribedItem[]>([
    {
      id: 'pre-1',
      medicineName: 'Levetiracetam 500mg Tablets',
      category: 'Specialty Neurological Medicine',
      frequency: 'At Bedtime (HS - Night)',
      duration: '30 Days',
      timing: 'After Food (PC - Post Meal)',
      instructions: 'Take 1 tablet at bedtime after meals with water',
    },
    {
      id: 'pre-2',
      medicineName: 'Pantoprazole 40mg Tablets',
      category: 'General Common Medicine',
      frequency: 'Once Daily (QD - Morning)',
      duration: '7 Days',
      timing: 'Before Food (AC - Empty Stomach)',
      instructions: 'Take 30 minutes before breakfast on empty stomach',
    },
  ]);

  // Prescribed Diagnostic Lab Tests List
  const [prescribedTestsList, setPrescribedTestsList] = useState<PrescribedLabTest[]>([
    {
      id: 'test-1',
      testName: 'CBC (Complete Blood Count & Differential)',
      category: 'Blood & Pathology',
      specimen: 'Venous Blood (EDTA)',
      fastingRequirement: 'Fasting Not Required',
      turnaroundTime: '4 Hours',
      price: 350,
    },
    {
      id: 'test-2',
      testName: 'ECG / EKG 12-Lead Cardiac Diagnostic Tracing',
      category: 'Cardiac & ECG',
      specimen: 'Non-Invasive Diagnostic',
      fastingRequirement: 'Fasting Not Required',
      turnaroundTime: 'Immediate',
      price: 450,
    },
  ]);

  if (!isOpen) return null;

  // Filter Pharmacy Catalog
  const filteredMedsCatalog = MASTER_PHARMACY_CATALOG.filter((item) => {
    const matchesCat = medCategory === 'ALL' || item.category === medCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchDrugQuery.toLowerCase()) || item.description.toLowerCase().includes(searchDrugQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Filter Diagnostic Lab Tests Catalog
  const filteredLabCatalog = MASTER_LAB_TESTS_CATALOG.filter((item) => {
    const matchesCat = labCategory === 'ALL' || item.category === labCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchLabQuery.toLowerCase()) || item.categoryLabel.toLowerCase().includes(searchLabQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddDrugToRx = (med: PharmacyItem) => {
    const newRxItem: PrescribedItem = {
      id: Date.now().toString(),
      medicineName: med.name,
      category: med.category === 'SPECIALTY_MEDICINE' ? 'Specialty Medicine' : 'General Common Medicine',
      frequency,
      duration,
      timing,
      instructions: `${frequency} for ${duration} (${timing})`,
    };
    setPrescribedMedsList([...prescribedMedsList, newRxItem]);
    showToast({
      title: 'Medication Prescribed',
      message: `Added ${med.name} (${frequency}, ${duration})`,
      type: 'success',
    });
  };

  const handleAddLabTestToRx = (test: LabTestCatalogItem) => {
    if (prescribedTestsList.some(t => t.testName === test.name)) {
      showToast({ title: 'Test Already Prescribed', message: `${test.name} is already in the prescription order.`, type: 'info' });
      return;
    }

    const newTestItem: PrescribedLabTest = {
      id: Date.now().toString(),
      testName: test.name,
      category: test.categoryLabel,
      specimen: test.specimen,
      fastingRequirement: test.fastingRequirement,
      turnaroundTime: test.turnaroundTime,
      price: test.price,
    };
    setPrescribedTestsList([...prescribedTestsList, newTestItem]);
    showToast({
      title: 'Diagnostic Test Prescribed',
      message: `Added ${test.name} to patient prescription`,
      type: 'success',
    });
  };

  const handleRemoveMedItem = (id: string) => {
    setPrescribedMedsList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleRemoveTestItem = (id: string) => {
    setPrescribedTestsList((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFinalSignRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (prescribedMedsList.length === 0 && prescribedTestsList.length === 0) {
      showToast({ title: 'Rx Order Empty', message: 'Please add at least one medication or diagnostic lab test.', type: 'error' });
      return;
    }

    const rxData = {
      rxNumber: `RX-STUDIO-${Math.floor(100000 + Math.random() * 900000)}`,
      patientName,
      mrn: patientMrn,
      doctorName,
      department: doctorSpecialty,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      diagnosis,
      medications: prescribedMedsList.map((p) => ({
        name: p.medicineName,
        dosage: `${p.frequency} • ${p.duration}`,
        instructions: `${p.timing} — ${p.instructions}`,
      })),
      labTests: prescribedTestsList.map((t) => ({
        name: t.testName,
        category: t.category,
        specimen: t.specimen,
        instructions: `${t.fastingRequirement} • Turnaround: ${t.turnaroundTime}`,
        price: t.price,
      })),
      signatureHash: `SHA256: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    };

    onPrescriptionIssued(rxData);
    showToast({
      title: 'Electronic Prescription & Lab Orders Signed!',
      message: `Rx #${rxData.rxNumber} issued to Patient Vault & Lab Diagnostics Queue.`,
      type: 'success',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Topbar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                Physician E-Prescribing Studio
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Verified EHR Sync
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Prescribe Specialty & General Common Medicines with Dosing Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient & Doctor Context Header */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">PATIENT NAME & MRN</span>
            <span className="font-black text-slate-900">{patientName} ({patientMrn})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">PRESCRIBING PHYSICIAN</span>
            <span className="font-black text-blue-600">{doctorName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">SPECIALTY UNIT</span>
            <span className="font-bold text-slate-800 truncate block">{doctorSpecialty}</span>
          </div>
        </div>

        {/* Clinical Diagnosis Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            CLINICAL DIAGNOSIS & DOCTOR NOTES
          </label>
          <input
            type="text"
            required
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Neurological Headache & Acid Reflux..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
          />
        </div>

        {/* HIGH INDUSTRY STANDARD CUSTOM INTERACTIVE DROPDOWNS & PILLS */}
        <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              DOSING FREQUENCY, TREATMENT DURATION & FOOD TIMING CONTROLS
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
              Interactive Prescribing Controls
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* DOSES PER DAY CUSTOM INTERACTIVE DROPDOWN */}
            <CustomInteractiveDropdown
              title="DOSES PER DAY"
              icon={<Clock className="w-3 h-3 text-blue-600" />}
              value={frequency}
              options={FREQUENCY_LIST}
              onChange={(val) => setFrequency(val)}
              pills={[
                { label: 'QD', value: 'Once Daily (QD - Morning)' },
                { label: 'BID', value: 'Twice Daily (BID - Every 12 Hours)' },
                { label: 'TID', value: 'Thrice Daily (TID - Every 8 Hours)' },
                { label: 'QID', value: 'Four Times Daily (QID - Every 6 Hours)' },
                { label: 'PRN', value: 'As Needed (PRN - Symptomatic)' },
                { label: 'HS', value: 'At Bedtime (HS - Night)' },
              ]}
            />

            {/* DURATION CUSTOM INTERACTIVE DROPDOWN */}
            <CustomInteractiveDropdown
              title="DURATION"
              icon={<Calendar className="w-3 h-3 text-blue-600" />}
              value={duration}
              options={DURATION_LIST}
              onChange={(val) => setDuration(val)}
              pills={[
                { label: '3 Days', value: '3 Days' },
                { label: '5 Days', value: '5 Days' },
                { label: '7 Days', value: '7 Days' },
                { label: '10 Days', value: '10 Days' },
                { label: '14 Days', value: '14 Days' },
                { label: '30 Days', value: '30 Days' },
              ]}
            />

            {/* FOOD TIMING CUSTOM INTERACTIVE DROPDOWN */}
            <CustomInteractiveDropdown
              title="FOOD TIMING"
              icon={<Utensils className="w-3 h-3 text-blue-600" />}
              value={timing}
              options={TIMING_LIST}
              onChange={(val) => setTiming(val)}
              pills={[
                { label: 'After Food', value: 'After Food (PC - Post Meal)' },
                { label: 'Before Food', value: 'Before Food (AC - Empty Stomach)' },
                { label: 'With Food', value: 'With Food (Co-ingested)' },
                { label: 'Bedtime', value: 'Bedtime (HS - Night)' },
                { label: 'Anytime', value: 'Irrespective of Food (Anytime)' },
              ]}
            />
          </div>
        </div>

        {/* SECTION 1: SELECT MEDICATIONS (SPECIALTY & GENERAL COMMON DRUGS) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-600" />
              SELECT MEDICATIONS (SPECIALTY & GENERAL COMMON DRUGS)
            </span>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMedCategory('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  medCategory === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Drugs
              </button>
              <button
                type="button"
                onClick={() => setMedCategory('SPECIALTY_MEDICINE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  medCategory === 'SPECIALTY_MEDICINE' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Specialty
              </button>
              <button
                type="button"
                onClick={() => setMedCategory('GENERAL_MEDICINE')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  medCategory === 'GENERAL_MEDICINE' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                General Common
              </button>
            </div>
          </div>

          {/* Search Bar for Drugs */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchDrugQuery}
              onChange={(e) => setSearchDrugQuery(e.target.value)}
              placeholder="Search drug by generic name, brand or specialty..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Medicine Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
            {filteredMedsCatalog.map((med) => (
              <div
                key={med.id}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <span className="font-bold text-xs text-slate-900 block truncate">{med.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block truncate">{med.description}</span>
                  <span className="text-[10px] font-black text-blue-600">₹{med.price} • Stock: {med.stock}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddDrugToRx(med)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: SELECT DIAGNOSTIC LAB TESTS & INVESTIGATIONS */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              SELECT DIAGNOSTIC LAB TESTS & PATHOLOGY / RADIOLOGY INVESTIGATIONS
            </span>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setLabCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  labCategory === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Tests
              </button>
              <button
                type="button"
                onClick={() => setLabCategory('BLOOD_PATHOLOGY')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  labCategory === 'BLOOD_PATHOLOGY' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Blood & Pathology
              </button>
              <button
                type="button"
                onClick={() => setLabCategory('RADIOLOGY_SCANS')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  labCategory === 'RADIOLOGY_SCANS' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Radiology & Scans
              </button>
              <button
                type="button"
                onClick={() => setLabCategory('CARDIAC_ECG')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  labCategory === 'CARDIAC_ECG' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cardiac & ECG
              </button>
            </div>
          </div>

          {/* Search Bar for Lab Tests */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchLabQuery}
              onChange={(e) => setSearchLabQuery(e.target.value)}
              placeholder="Search diagnostic test (CBC, Lipid, ECG, X-Ray, CT, MRI, LFT, KFT)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Lab Test Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
            {filteredLabCatalog.map((test) => {
              const isAdded = prescribedTestsList.some((t) => t.testName === test.name);
              return (
                <div
                  key={test.id}
                  className={`p-3 bg-white border rounded-xl flex items-center justify-between shadow-2xs transition-colors ${
                    isAdded ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-xs text-slate-900 block truncate">{test.name}</span>
                    <span className="text-[10px] text-indigo-700 font-semibold block">{test.categoryLabel} • {test.specimen}</span>
                    <span className="text-[10px] text-slate-500 font-medium block">{test.fastingRequirement} • Turnaround: {test.turnaroundTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddLabTestToRx(test)}
                    disabled={isAdded}
                    className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 transition-all ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Prescribed</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Test</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: ACTIVE PATIENT PRESCRIPTION & DIAGNOSTIC ORDERS LIST */}
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              ACTIVE PATIENT PRESCRIPTION ORDERS ({prescribedMedsList.length + prescribedTestsList.length} ITEMS TOTAL)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Prescribed Medications */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-blue-700 font-black">
                  <Pill className="w-3.5 h-3.5" /> Prescribed Medications ({prescribedMedsList.length})
                </span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {prescribedMedsList.map((item) => (
                  <div key={item.id} className="p-3 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-black text-blue-950 text-xs block truncate">{item.medicineName}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{item.category}</span>
                      <span className="text-[11px] text-slate-700 font-semibold mt-0.5 block truncate">
                        {item.frequency} • {item.duration} ({item.timing})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 cursor-pointer shrink-0 transition-colors"
                      title="Remove Medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {prescribedMedsList.length === 0 && (
                  <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                    No medications added to Rx yet.
                  </div>
                )}
              </div>
            </div>

            {/* Prescribed Diagnostic Lab Tests List */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1 text-indigo-700 font-black">
                  <FlaskConical className="w-3.5 h-3.5" /> Prescribed Diagnostic Lab Tests ({prescribedTestsList.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {prescribedTestsList.map((test) => (
                  <div key={test.id} className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="font-black text-indigo-950 block truncate">{test.testName}</span>
                      <span className="text-[10px] text-indigo-800 font-semibold block">{test.category} • {test.specimen}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{test.fastingRequirement}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTestItem(test.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0 transition-colors"
                      title="Remove Lab Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {prescribedTestsList.length === 0 && (
                  <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 col-span-2">
                    No diagnostic lab tests prescribed in Rx yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted E-Prescribing & Diagnostic Sync</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalSignRx}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sign & Issue Official Prescription</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
