'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { NurseVitalsModal } from '../shared/NurseVitalsModal';
import { PharmacyPurchaseModal } from '../shared/PharmacyPurchaseModal';
import { useToast } from '../../context/ToastContext';
import {
  Heart,
  Activity,
  Bed,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Pill,
  Sparkles,
  Stethoscope,
  Building2,
  ShoppingBag,
  Box
} from 'lucide-react';

export const NurseDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isBuySuppliesOpen, setIsBuySuppliesOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Ward Consumable Inventory Data
  const [wardInventory] = useState([
    { name: 'Sterile Syringes 5ml', stock: '18 Packs', status: 'Low Stock (<20)', unitPrice: '₹450/pack' },
    { name: 'IV Saline Normal 0.9%', stock: '25 Boxes', status: 'In Stock', unitPrice: '₹650/box' },
    { name: 'Surgical Gloves (Latex)', stock: '12 Boxes', status: 'Low Stock (<20)', unitPrice: '₹850/box' },
    { name: 'Sterile Gauze Bandages', stock: '65 Kits', status: 'In Stock', unitPrice: '₹320/kit' },
  ]);

  // Inpatient & Approved Outpatient Queue
  const [nurseQueue, setNurseQueue] = useState([
    {
      id: '1',
      room: 'Bed 4A',
      patient: 'Sarah Connor',
      mrn: 'MC-1001',
      doctor: 'Dr. Anup Singh',
      vitalsStatus: 'Pending Nurse Check',
      lastVitals: 'Not Recorded',
      dueMed: 'Enalapril 10mg — 09:00 AM',
    },
    {
      id: '2',
      room: 'Bed 12B',
      patient: 'John Doe',
      mrn: 'MC-1002',
      doctor: 'Dr. Arvind Sharma',
      vitalsStatus: 'Vitals Recorded & Synced',
      lastVitals: 'BP: 120/80 • HR: 72 • Temp: 98.6°F',
      dueMed: 'Metformin 500mg — 10:30 AM',
    },
    {
      id: '3',
      room: 'Bed 8C',
      patient: 'Bruce Wayne',
      mrn: 'MC-1003',
      doctor: 'Dr. Siddharth Joshi',
      vitalsStatus: 'Vitals Recorded & Synced',
      lastVitals: 'BP: 135/88 • HR: 80 • Temp: 99.1°F',
      dueMed: 'Cefazolin 1g IV — 11:15 AM',
    },
  ]);

  const handleOpenVitalsModal = (patientRow: any) => {
    setSelectedPatient(patientRow);
    setIsVitalsModalOpen(true);
  };

  const handleVitalsSubmitted = (vitals: any) => {
    setNurseQueue((prev) =>
      prev.map((item) =>
        item.id === selectedPatient?.id
          ? {
              ...item,
              vitalsStatus: 'Vitals Recorded & Synced',
              lastVitals: `BP: ${vitals.bp} • HR: ${vitals.pulse} • Temp: ${vitals.temp}`,
            }
          : item
      )
    );
  };

  const columns = [
    {
      header: 'Location / Bed',
      accessor: (row: typeof nurseQueue[0]) => (
        <span className="font-bold text-rose-600 flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-rose-500" /> {row.room}
        </span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: typeof nurseQueue[0]) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.patient}</span>
          <span className="text-[10px] font-bold text-blue-600">MRN: {row.mrn}</span>
        </div>
      ),
    },
    {
      header: 'Attending Doctor',
      accessor: (row: typeof nurseQueue[0]) => (
        <span className="text-slate-700 font-semibold flex items-center gap-1">
          <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> {row.doctor}
        </span>
      ),
    },
    {
      header: 'Vitals Telemetry Status',
      accessor: (row: typeof nurseQueue[0]) => (
        <div className="flex flex-col gap-1">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase w-fit ${
              row.vitalsStatus.includes('Synced')
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
            }`}
          >
            {row.vitalsStatus}
          </span>
          <span className="text-[11px] font-bold text-slate-600">{row.lastVitals}</span>
        </div>
      ),
    },
    {
      header: 'Nurse Actions',
      accessor: (row: typeof nurseQueue[0]) => (
        <button
          onClick={() => handleOpenVitalsModal(row)}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{row.vitalsStatus.includes('Synced') ? 'Update Vitals' : 'Record Vitals'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Nurse Vitals Recording Modal */}
      {selectedPatient && (
        <NurseVitalsModal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          patientName={selectedPatient.patient}
          doctorName={selectedPatient.doctor}
          onVitalsSubmitted={handleVitalsSubmitted}
        />
      )}

      {/* Buy Hospital Supplies E-Pharmacy Modal */}
      <PharmacyPurchaseModal
        isOpen={isBuySuppliesOpen}
        onClose={() => setIsBuySuppliesOpen(false)}
        patientName="Nurse Clara (Inpatient Ward 4)"
        userRole="NURSE"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600" />
            Inpatient Nursing & Caregiver Workstation
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Pre-consultation vitals recording, live bed occupancy telemetry, and ward hospital supply ordering.
          </p>
        </div>

        <button
          onClick={() => setIsBuySuppliesOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buy Hospital Supplies (Hospital Billing)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ward Census Occupancy" value="48 / 50 Beds" change={96.0} changeLabel="high occupancy" icon={Bed} />
        <StatCard title="Pending Vitals Checks" value="1 Ward Patient" change={-2.0} changeLabel="needs recording" icon={Activity} />
        <StatCard title="Medications Due (1hr)" value="8 Doses" change={0.0} changeLabel="on schedule" icon={Pill} />
        <StatCard title="Telemetry Monitors" value="100% Live" change={0.0} changeLabel="all sensors active" icon={Thermometer} />
      </div>

      {/* Ward Inventory Stock Tracker */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Box className="w-4 h-4 text-rose-600" /> Inpatient Ward Supply & Consumables Inventory
          </h3>

          <button
            onClick={() => setIsBuySuppliesOpen(true)}
            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
          >
            + Order More Supplies
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
          {wardInventory.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 block truncate">{item.name}</span>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Stock: <strong className="text-slate-800">{item.stock}</strong></span>
                <span className="text-blue-600 font-black">{item.unitPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ward Vitals Recording Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" /> Pre-Consultation Vitals & Inpatient Queue
          </h2>
          <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Doctor Auto-Sync Active
          </span>
        </div>

        <DataTable
          columns={columns}
          data={nurseQueue}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};
