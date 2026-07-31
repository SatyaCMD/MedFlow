import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { NurseVitalsModal } from '../shared/NurseVitalsModal';
import { PharmacyPurchaseModal } from '../shared/PharmacyPurchaseModal';
import { useToast } from '../../context/ToastContext';
import { getSharedAppointments, updateSharedAppointmentVitals, SharedAppointment } from '../../data/appointmentStore';
import { getNurseSupplyInvoices } from '../../data/patientBillingStore';
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

  // Real Appointments from Shared Store
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

  const queueItems = appointments.map((app, index) => ({
    id: app.id,
    room: `Suite ${101 + index}`,
    patient: app.patientName,
    mrn: app.mrn,
    doctor: app.doctorName,
    vitalsStatus: app.vitals ? 'Vitals Recorded & Synced' : 'Pending Nurse Check',
    lastVitals: app.vitals ? `BP: ${app.vitals.bp} • HR: ${app.vitals.hr} • Temp: ${app.vitals.temp}` : 'Not Recorded',
    dueMed: `${app.purpose || 'OPD Checkup'} — ${app.timeSlot}`,
    rawAppointment: app,
  }));

  const handleOpenVitalsModal = (patientRow: any) => {
    setSelectedPatient(patientRow);
    setIsVitalsModalOpen(true);
  };

  const handleVitalsSubmitted = (vitals: any) => {
    if (selectedPatient) {
      updateSharedAppointmentVitals(selectedPatient.id, {
        bp: vitals.bp,
        hr: vitals.pulse,
        temp: vitals.temp,
        spo2: vitals.spo2 || '99%',
        recordedAt: new Date().toLocaleTimeString(),
        nurseName: 'Nurse Ward Chief',
      });

      showToast({
        title: 'Vitals Synced to EMR! 🩺',
        message: `Vitals recorded for ${selectedPatient.patient}. Patient status updated for Doctor review.`,
        type: 'success',
      });
      refreshAppointments();
    }
  };

  const columns = [
    {
      header: 'Location / Bed',
      accessor: (row: any) => (
        <span className="font-bold text-rose-600 flex items-center gap-1.5">
          <Bed className="w-3.5 h-3.5 text-rose-500" /> {row.room}
        </span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.patient}</span>
          <span className="text-[10px] font-bold text-blue-600">MRN: {row.mrn}</span>
        </div>
      ),
    },
    {
      header: 'Attending Doctor',
      accessor: (row: any) => (
        <span className="text-slate-700 font-semibold flex items-center gap-1">
          <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> {row.doctor}
        </span>
      ),
    },
    {
      header: 'Vitals Telemetry Status',
      accessor: (row: any) => (
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
      accessor: (row: any) => (
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
        <StatCard title="Ward Supplies Purchased" value={`₹${getNurseSupplyInvoices().reduce((a, b) => a + b.totalAmount, 0).toLocaleString('en-IN')}`} change={14.0} changeLabel="ward consumable inventory" icon={ShoppingBag} />
        <StatCard title="Telemetry Monitors" value="100% Live" change={0.0} changeLabel="all sensors active" icon={Thermometer} />
      </div>

      {/* Ward Consumable Billing & Supply Invoices */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-600" /> Ward Consumables Purchase Ledger & Invoices
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Itemized billing for ward supplies, syringes, IV fluids, and dressing kits purchased for patient care.
            </p>
          </div>

          <button
            onClick={() => setIsBuySuppliesOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Order & Bill Ward Consumables
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getNurseSupplyInvoices().map((inv) => (
            <div key={inv.id} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <div>
                  <span className="font-mono font-black text-rose-600 text-xs block">{inv.invoiceNo}</span>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">{inv.itemName}</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                  {inv.paymentStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Supplier: <strong className="text-slate-800">{inv.supplierName}</strong></span>
                  <span>Date: <strong className="text-slate-800">{inv.purchaseDate}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>Ward: <strong className="text-rose-700">{inv.allocatedWard}</strong></span>
                  <span>Qty: <strong className="text-slate-800">{inv.quantity} Units</strong></span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Supply Billing:</span>
                  <span className="text-rose-600">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast({
                    title: 'Downloading Supply Invoice 📄',
                    message: `Generating vendor invoice #${inv.invoiceNo}...`,
                    type: 'info',
                  });
                  if (typeof window !== 'undefined') window.print();
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose-400" /> Print Vendor Supply Invoice PDF
              </button>
            </div>
          ))}
        </div>
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

        {queueItems.length > 0 ? (
          <DataTable
            columns={columns}
            data={queueItems}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        ) : (
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-sm">Nursing Vitals Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no patients waiting for pre-consultation vitals checkup. When appointments are approved by attending doctors, they will populate here in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
