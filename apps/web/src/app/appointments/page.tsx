'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { PaymentModal } from '../../components/shared/PaymentModal';
import { BookDoctorVisitModal } from '../../components/shared/BookDoctorVisitModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MEDICAL_DEPARTMENTS_CATALOG, REAL_DOCTORS_DATASET, DoctorProfile } from '../../data/medicalCatalog';
import {
  getDispensaryOrdersStore,
  updateDispensaryOrderStatus,
  DispensaryOrder,
  getDiagnosticOrdersStore,
  updateDiagnosticOrderStatus,
  DiagnosticOrder,
  getWardConsultationsStore,
  updateWardConsultationStatus,
  WardConsultation,
  getTransfusionOrdersStore,
  updateTransfusionOrderStatus,
  TransfusionOrder,
  getDeptConsultationsStore,
  updateDeptConsultationStatus,
  DepartmentConsultation,
} from '../../data/ordersStore';
import {
  Calendar,
  Clock,
  Stethoscope,
  Star,
  Sparkles,
  Search,
  ShieldCheck,
  Building2,
  Filter,
  Award,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Pill,
  FlaskConical,
  Activity,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Send,
  UserCheck,
  Check,
  Building,
} from 'lucide-react';

export default function AppointmentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Patient Booking Hub State
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeDepartment, setActiveDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Orders Workstation Stores State
  const [dispensaryOrders, setDispensaryOrders] = useState<DispensaryOrder[]>([]);
  const [diagnosticOrders, setDiagnosticOrders] = useState<DiagnosticOrder[]>([]);
  const [wardConsultations, setWardConsultations] = useState<WardConsultation[]>([]);
  const [transfusionOrders, setTransfusionOrders] = useState<TransfusionOrder[]>([]);
  const [deptConsultations, setDeptConsultations] = useState<DepartmentConsultation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isBookVisitOpen, setIsBookVisitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({
    title: '',
    category: 'APPOINTMENT' as 'APPOINTMENT' | 'LAB_TEST' | 'HOSPITAL_SUPPLY',
    amount: '₹1,500',
    patientName: 'Alex Care',
  });

  const currentRole = user?.role || 'PATIENT';

  const loadAllStores = () => {
    setDispensaryOrders(getDispensaryOrdersStore());
    setDiagnosticOrders(getDiagnosticOrdersStore());
    setWardConsultations(getWardConsultationsStore());
    setTransfusionOrders(getTransfusionOrdersStore());
    setDeptConsultations(getDeptConsultationsStore());
  };

  useEffect(() => {
    loadAllStores();

    const handleUpdate = () => {
      loadAllStores();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('medflow_orders_updated', handleUpdate);
      return () => {
        window.removeEventListener('medflow_orders_updated', handleUpdate);
      };
    }
  }, []);

  if (loading) return null;

  // Patient Filtering Engine
  const currentCategory = MEDICAL_DEPARTMENTS_CATALOG[activeCategoryIndex];
  const categoryDeptNames = currentCategory.departments.map((d) => d.name.toUpperCase());

  const filteredDoctors = REAL_DOCTORS_DATASET.filter((doc) => {
    const docDeptUpper = doc.department.toUpperCase();
    const matchesCategory = categoryDeptNames.some(
      (cDept) => docDeptUpper === cDept || docDeptUpper.includes(cDept) || cDept.includes(docDeptUpper)
    );
    const matchesDept = activeDepartment === 'ALL' || docDeptUpper === activeDepartment.toUpperCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.subSpecialty.toLowerCase().includes(q) ||
      doc.department.toLowerCase().includes(q);

    return matchesCategory && matchesDept && matchesQuery;
  });

  const scrollCategoriesLeft = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollCategoriesRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  // 1. PHARMACIST DISPENSARY ORDERS WORKSTATION
  if (currentRole === 'PHARMACIST') {
    const dispensaryColumns = [
      {
        header: 'ORDER # & DATE',
        accessor: (row: DispensaryOrder) => (
          <div>
            <span className="font-mono font-black text-amber-700 block text-xs">{row.orderNo}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.date}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: DispensaryOrder) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'ATTENDING DOCTOR',
        accessor: (row: DispensaryOrder) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{row.doctorName}</span>
            <span className="text-[10px] text-blue-600 font-semibold">{row.department}</span>
          </div>
        ),
      },
      {
        header: 'PRESCRIBED MEDICATIONS',
        accessor: (row: DispensaryOrder) => (
          <div className="space-y-1">
            {row.medications.map((m, idx) => (
              <span key={idx} className="block text-[11px] font-bold text-slate-700">
                💊 {m.name} <strong className="text-amber-800">x{m.qty}</strong>
              </span>
            ))}
          </div>
        ),
      },
      {
        header: 'FULFILLMENT STATUS',
        accessor: (row: DispensaryOrder) => (
          <span
            className={`whitespace-nowrap inline-flex items-center text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              row.status === 'DISPENSED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : row.status === 'READY_FOR_PICKUP'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'DISPENSARY ACTIONS',
        accessor: (row: DispensaryOrder) => (
          <button
            onClick={() => {
              updateDispensaryOrderStatus(row.id, 'DISPENSED');
              showToast({
                title: 'Order Fulfilled & Billed! 💊',
                message: `Prescription #${row.orderNo} for ${row.patientName} dispensed. Stock deducted.`,
                type: 'success',
              });
            }}
            disabled={row.status === 'DISPENSED'}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              row.status === 'DISPENSED'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{row.status === 'DISPENSED' ? 'Dispensed' : 'Fulfill & Dispense'}</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="PHARMACIST">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-6 h-6 text-amber-600" />
                Central Dispensary Orders & Prescription Fulfillment Workstation
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Live doctor-issued prescription dispensary queue for outpatient counter and ward stock fulfillment.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>DISPENSARY WORKSTATION ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Active Dispensary Orders" value={`${dispensaryOrders.length} Orders`} change={12.5} changeLabel="today queue" icon={Pill} />
            <StatCard title="Pending Fulfillment" value={`${dispensaryOrders.filter((o) => o.status === 'PENDING_FULFILLMENT').length} Ready`} change={0.0} changeLabel="at counter" icon={Clock} />
            <StatCard title="Fulfilled & Dispensed" value={`${dispensaryOrders.filter((o) => o.status === 'DISPENSED').length} Billed`} change={18.0} changeLabel="inventory deducted" icon={CheckCircle2} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              LIVE DISPENSARY ORDERS QUEUE ({dispensaryOrders.length})
            </h2>
            <DataTable
              columns={dispensaryColumns as any}
              data={dispensaryOrders as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 2. LAB TECHNICIAN DIAGNOSTIC ORDERS WORKSTATION
  if (currentRole === 'LAB_TECHNICIAN') {
    const diagnosticColumns = [
      {
        header: 'ORDER # & DATE',
        accessor: (row: DiagnosticOrder) => (
          <div>
            <span className="font-mono font-black text-indigo-700 block text-xs">{row.orderNo}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.date}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: DiagnosticOrder) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'TEST NAME & SPECIMEN',
        accessor: (row: DiagnosticOrder) => (
          <div>
            <span className="font-black text-indigo-950 block text-xs">{row.testName}</span>
            <span className="text-[10px] text-slate-500 font-bold">{row.category} • Specimen: <strong className="text-slate-800">{row.specimen}</strong></span>
          </div>
        ),
      },
      {
        header: 'REQUESTING DOCTOR',
        accessor: (row: DiagnosticOrder) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{row.doctorName}</span>
            <span className="text-[10px] text-blue-600 font-semibold">{row.department}</span>
          </div>
        ),
      },
      {
        header: 'TEST STATUS',
        accessor: (row: DiagnosticOrder) => (
          <span
            className={`whitespace-nowrap inline-flex items-center text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              row.status === 'REPORT_COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : row.status === 'IN_PROCESSING'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-300 animate-pulse'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'LAB ACTIONS',
        accessor: (row: DiagnosticOrder) => (
          <button
            onClick={() => {
              updateDiagnosticOrderStatus(row.id, 'REPORT_COMPLETED');
              showToast({
                title: 'Diagnostic Report Uploaded! 🧪',
                message: `Lab report for ${row.patientName} (${row.testName}) certified & synced to doctor EMR.`,
                type: 'success',
              });
            }}
            disabled={row.status === 'REPORT_COMPLETED'}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              row.status === 'REPORT_COMPLETED'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{row.status === 'REPORT_COMPLETED' ? 'Report Certified' : 'Enter Results'}</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="LAB_TECHNICIAN">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-indigo-600" />
                Pathology & Diagnostic Test Orders Workstation
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Real-time pathology lab test order processing, specimen analysis, and diagnostic report certification.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>PATHOLOGY LAB ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Diagnostic Orders" value={`${diagnosticOrders.length} Orders`} change={10.0} changeLabel="active specimen queue" icon={FlaskConical} />
            <StatCard title="In Lab Processing" value={`${diagnosticOrders.filter((o) => o.status === 'IN_PROCESSING').length} Testing`} change={0.0} changeLabel="analyzing" icon={Clock} />
            <StatCard title="Certified Reports" value={`${diagnosticOrders.filter((o) => o.status === 'REPORT_COMPLETED').length} Complete`} change={15.0} changeLabel="synced to EMR" icon={CheckCircle2} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              PATHOLOGY DIAGNOSTIC TEST ORDERS QUEUE ({diagnosticOrders.length})
            </h2>
            <DataTable
              columns={diagnosticColumns as any}
              data={diagnosticOrders as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 3. NURSE WARD CONSULTATIONS WORKSTATION
  if (currentRole === 'NURSE') {
    const wardColumns = [
      {
        header: 'CONSULT # & ROOM',
        accessor: (row: WardConsultation) => (
          <div>
            <span className="font-mono font-black text-purple-700 block text-xs">{row.consultNo}</span>
            <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded font-black">{row.roomBed}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: WardConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'SPECIALTY & REASON',
        accessor: (row: WardConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.specialty}</span>
            <span className="text-[10px] text-slate-500 font-semibold truncate max-w-xs block" title={row.reason}>{row.reason}</span>
          </div>
        ),
      },
      {
        header: 'PHYSICIANS',
        accessor: (row: WardConsultation) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">Attending: {row.attendingDoctor}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Consultant: {row.consultingDoctor}</span>
          </div>
        ),
      },
      {
        header: 'ROUND STATUS',
        accessor: (row: WardConsultation) => (
          <span
            className={`whitespace-nowrap inline-flex items-center text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              row.status === 'CONSULTATION_COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : row.status === 'ROUND_IN_PROGRESS'
                ? 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'NURSING ACTIONS',
        accessor: (row: WardConsultation) => (
          <button
            onClick={() => {
              updateWardConsultationStatus(row.id, 'CONSULTATION_COMPLETED');
              showToast({
                title: 'Doctor Round Acknowledged! 👩‍⚕️',
                message: `Confirmed physician round for ${row.patientName} (${row.roomBed}). Vitals logged.`,
                type: 'success',
              });
            }}
            disabled={row.status === 'CONSULTATION_COMPLETED'}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              row.status === 'CONSULTATION_COMPLETED'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs cursor-pointer'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{row.status === 'CONSULTATION_COMPLETED' ? 'Round Completed' : 'Acknowledge Round'}</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="NURSE">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-600" />
                Inpatient Ward Doctor Consultations & Rounding Telemetry
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Nursing ward consultation tracking, doctor rounding acknowledgments, and inpatient bed telemetry.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>NURSING STATION ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Ward Consultations" value={`${wardConsultations.length} Consults`} change={8.4} changeLabel="active bed rounding" icon={Activity} />
            <StatCard title="Rounds In Progress" value={`${wardConsultations.filter((c) => c.status === 'ROUND_IN_PROGRESS').length} Active`} change={0.0} changeLabel="physician on ward" icon={Clock} />
            <StatCard title="Rounds Completed" value={`${wardConsultations.filter((c) => c.status === 'CONSULTATION_COMPLETED').length} Complete`} change={12.0} changeLabel="vitals recorded" icon={CheckCircle2} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              INPATIENT WARD CONSULTATIONS & DOCTOR ROUNDS QUEUE ({wardConsultations.length})
            </h2>
            <DataTable
              columns={wardColumns as any}
              data={wardConsultations as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 4. BLOOD BANK TRANSFUSION ORDERS WORKSTATION
  if (currentRole === 'BLOOD_BANK' || (currentRole as string) === 'BLOODBANK_ADMIN') {
    const transfusionColumns = [
      {
        header: 'ORDER # & DATE',
        accessor: (row: TransfusionOrder) => (
          <div>
            <span className="font-mono font-black text-rose-700 block text-xs">{row.orderNo}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.date}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: TransfusionOrder) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'BLOOD GROUP & UNITS',
        accessor: (row: TransfusionOrder) => (
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 bg-rose-100 border border-rose-300 text-rose-900 font-black text-xs rounded-full">
              {row.bloodGroup}
            </span>
            <strong className="text-xs font-black text-slate-900">{row.units} Units</strong>
          </div>
        ),
      },
      {
        header: 'REQUESTING DOCTOR',
        accessor: (row: TransfusionOrder) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{row.requestingDoctor}</span>
            <span className="text-[10px] text-blue-600 font-semibold">{row.department}</span>
          </div>
        ),
      },
      {
        header: 'TRANSFUSION STATUS',
        accessor: (row: TransfusionOrder) => (
          <span
            className={`whitespace-nowrap inline-flex items-center text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              row.status === 'APPROVED_DISPATCHED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'BLOOD BANK ACTIONS',
        accessor: (row: TransfusionOrder) => (
          <button
            onClick={() => {
              updateTransfusionOrderStatus(row.id, 'APPROVED_DISPATCHED');
              showToast({
                title: 'Blood Unit Dispatched! 🩸',
                message: `Dispatched ${row.units} Units of ${row.bloodGroup} for ${row.patientName}. Cross-match verified.`,
                type: 'success',
              });
            }}
            disabled={row.status === 'APPROVED_DISPATCHED'}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              row.status === 'APPROVED_DISPATCHED'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>{row.status === 'APPROVED_DISPATCHED' ? 'Dispatched' : 'Approve & Dispatch'}</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="BLOOD_BANK">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Droplet className="w-6 h-6 text-rose-600" />
                Emergency Transfusion & Blood Cross-Match Orders Workstation
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Real-time blood bank transfusion requests, cross-matching clearance, and emergency blood unit dispatch.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-rose-600" />
              <span>BLOOD BANK CONTROL ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Transfusion Orders" value={`${transfusionOrders.length} Requests`} change={14.0} changeLabel="active blood orders" icon={Droplet} />
            <StatCard title="Pending Clearance" value={`${transfusionOrders.filter((o) => o.status === 'PENDING_CLEARANCE').length} STAT`} change={0.0} changeLabel="cross-matching" icon={Clock} />
            <StatCard title="Approved & Dispatched" value={`${transfusionOrders.filter((o) => o.status === 'APPROVED_DISPATCHED').length} Units`} change={20.0} changeLabel="released to ER/ICU" icon={CheckCircle2} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              BLOOD TRANSFUSION & CROSS-MATCH ORDERS QUEUE ({transfusionOrders.length})
            </h2>
            <DataTable
              columns={transfusionColumns as any}
              data={transfusionOrders as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 5. SUPER ADMIN GLOBAL CONSULTATIONS COMMAND CENTER
  if ((currentRole as string) === 'SUPER_ADMIN') {
    const superAdminConsultColumns = [
      {
        header: 'CONSULT # & DATE',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-mono font-black text-purple-700 block text-xs">{row.consultNo}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.date}</span>
          </div>
        ),
      },
      {
        header: 'HOSPITAL BRANCH & SPECIALTY',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">MediCore Central ➔ {row.targetDept}</span>
            <span className="text-[10px] text-purple-600 font-bold">Requesting: {row.requestingDept}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'CLINICAL HANDOFF',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{row.attendingDoctor}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Consultant: {row.consultantDoctor}</span>
          </div>
        ),
      },
      {
        header: 'SLA STATUS',
        accessor: (row: DepartmentConsultation) => (
          <span
            className={`whitespace-nowrap inline-flex items-center text-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              row.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse'
            }`}
          >
            {row.status.replace(/_/g, ' ')} • {row.turnaroundTime}
          </span>
        ),
      },
      {
        header: 'ENTERPRISE AUDIT',
        accessor: (row: DepartmentConsultation) => (
          <button
            onClick={() => {
              showToast({
                title: 'Enterprise Consultation Audited 🌐',
                message: `Global SLA & compliance record for Consultation #${row.consultNo} verified.`,
                type: 'success',
              });
            }}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Audit SLA</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="SUPER_ADMIN">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Enterprise Super Admin Global Consultations & Telemedicine Operations Command Center
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Multi-hospital cross-specialty clinical consultations, telemedicine SLA compliance, and enterprise doctor availability.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-purple-100 border border-purple-300 text-purple-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>SUPER ADMIN CONTROL ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Global Consultations" value="1,250+ Monthly" change={24.5} changeLabel="all enterprise branches" icon={Building} />
            <StatCard title="Active Global Consults" value={`${deptConsultations.length} Live`} change={0.0} changeLabel="in progress" icon={Clock} />
            <StatCard title="Turnaround SLA Compliance" value="98.6%" change={2.1} changeLabel="sub-20 min response" icon={ShieldCheck} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              GLOBAL ENTERPRISE CLINICAL CONSULTATIONS QUEUE ({deptConsultations.length})
            </h2>
            <DataTable
              columns={superAdminConsultColumns as any}
              data={deptConsultations as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 6. HOSPITAL ADMIN DEPARTMENT CONSULTATIONS HUB
  if ((currentRole as string) === 'HOSPITAL_ADMIN' || (currentRole as string) === 'ADMIN') {
    const adminConsultColumns = [
      {
        header: 'CONSULT # & DATE',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-mono font-black text-blue-700 block text-xs">{row.consultNo}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{row.date}</span>
          </div>
        ),
      },
      {
        header: 'DEPARTMENTS',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.requestingDept} ➔ {row.targetDept}</span>
            <span className="text-[10px] text-slate-500 font-bold">Turnaround: {row.turnaroundTime}</span>
          </div>
        ),
      },
      {
        header: 'PATIENT NAME & MRN',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-black text-slate-900 block text-xs">{row.patientName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-500">MRN: {row.mrn}</span>
          </div>
        ),
      },
      {
        header: 'DOCTOR HANDOFF',
        accessor: (row: DepartmentConsultation) => (
          <div>
            <span className="font-bold text-slate-900 block text-xs">{row.attendingDoctor}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Consultant: {row.consultantDoctor}</span>
          </div>
        ),
      },
      {
        header: 'STATUS',
        accessor: (row: DepartmentConsultation) => (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
              row.status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse'
            }`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'ADMIN METRICS',
        accessor: (row: DepartmentConsultation) => (
          <button
            onClick={() => {
              showToast({
                title: 'Department Metrics Audited 📊',
                message: `Consultation #${row.consultNo} between ${row.requestingDept} and ${row.targetDept} validated.`,
                type: 'info',
              });
            }}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Audit Metrics</span>
          </button>
        ),
      },
    ];

    return (
      <AppShell userRole="HOSPITAL_ADMIN">
        <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                Cross-Department Clinical Consultations & Specialty Operations Hub
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Hospital-wide cross-specialty doctor consultation monitoring, response turnaround telemetry, and departmental handoffs.
              </p>
            </div>
            <span className="px-3.5 py-1.5 bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>HOSPITAL OPERATIONS ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Department Consultations" value={`${deptConsultations.length} Consults`} change={16.2} changeLabel="cross-specialty handoffs" icon={Building} />
            <StatCard title="Active Consultations" value={`${deptConsultations.filter((c) => c.status !== 'COMPLETED').length} Active`} change={0.0} changeLabel="in progress" icon={Clock} />
            <StatCard title="Avg Turnaround Time" value="18 Mins" change={-12.0} changeLabel="response velocity" icon={CheckCircle2} />
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              CROSS-DEPARTMENT DOCTOR CONSULTATIONS TELEMETRY ({deptConsultations.length})
            </h2>
            <DataTable
              columns={adminConsultColumns as any}
              data={deptConsultations as any}
              currentPage={currentPage}
              totalPages={1}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  // 6. PATIENT SPECIALIST BOOKING HUB (PATIENT ROLE ONLY)
  return (
    <AppShell userRole="PATIENT">
      <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
        {/* Book Doctor Visit Modal */}
        <BookDoctorVisitModal
          isOpen={isBookVisitOpen}
          onClose={() => setIsBookVisitOpen(false)}
          onProceedToPayment={(details) => {
            setIsBookVisitOpen(false);
            setPaymentTarget({
              title: `Doctor Consultation — ${details.doctor.name} (${details.department})`,
              category: 'APPOINTMENT',
              amount: details.amount,
              patientName: details.patientName,
            });
            setIsPaymentOpen(true);
          }}
        />

        {/* Payment Gateway Sandbox Checkout Modal */}
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          itemTitle={paymentTarget.title}
          itemCategory={paymentTarget.category}
          amount={paymentTarget.amount}
          patientName={paymentTarget.patientName}
          onPaymentSuccess={(receipt) => {
            showToast({
              title: 'Appointment Booked!',
              message: `Confirmed consultation. Receipt #${receipt.receiptNumber} generated.`,
              type: 'success',
            });
          }}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Comprehensive Hospital Specialist Directory & Booking Hub
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              50+ Medical Departments, Super-Specialties, Emergency Services, and 25+ verified doctors per department.
            </p>
          </div>

          <button
            onClick={() => setIsBookVisitOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Book New Visit
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Active Specialties" value="50+ Departments" change={100.0} changeLabel="all medical branches" icon={Building2} />
          <StatCard title="Verified Specialists" value="25+ Per Dept" change={0.0} changeLabel="MD, DM, MCh degrees" icon={Award} />
          <StatCard title="Instant Slot Booking" value="Real-time" change={0.0} changeLabel="5-7 slots per doctor" icon={Clock} />
        </div>

        {/* Category Navigation Bar with Smooth Scroll Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Select Medical Category
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={scrollCategoriesLeft}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 shadow-2xs transition-colors cursor-pointer"
                title="Scroll Categories Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollCategoriesRight}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 shadow-2xs transition-colors cursor-pointer"
                title="Scroll Categories Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Category Pills */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-blue-400 scroll-smooth flex-nowrap"
          >
            {MEDICAL_DEPARTMENTS_CATALOG.map((cat, idx) => {
              const isSelected = activeCategoryIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCategoryIndex(idx);
                    setActiveDepartment('ALL');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Department Filters & Search Bar */}
        <div className="space-y-4 bg-slate-50 border border-slate-200 p-5 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search physician by name, sub-specialty..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-2xs"
              />
            </div>

            {/* Department Pills for Active Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveDepartment('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDepartment === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All {currentCategory.category}
              </button>

              {currentCategory.departments.map((dept, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDepartment(dept.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeDepartment === dept.name
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Department Header Summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            {activeDepartment === 'ALL' ? currentCategory.category : activeDepartment} Specialists ({filteredDoctors.length})
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-blue-600">{filteredDoctors.length}</strong> verified doctors
          </span>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-2">
            <p className="text-xs font-bold text-slate-500">No doctors match your query in this category.</p>
            <button
              onClick={() => {
                setActiveDepartment('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Doctor Topbar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                        {doc.avatar}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-[11px] font-bold text-blue-600">{doc.specialty}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-500">{doc.qualification}</p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 font-semibold block text-[9px] uppercase">Experience</span>
                      <span className="font-bold text-slate-800">{doc.experience}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block text-[9px] uppercase">Consult Fee</span>
                      <span className="font-black text-blue-600">{doc.fee}</span>
                    </div>
                  </div>
                </div>

                {/* Slot & Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span className="truncate max-w-[120px]">{doc.nextSlot}</span>
                  </div>

                  <button
                    onClick={() => setIsBookVisitOpen(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Book ({doc.fee})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
