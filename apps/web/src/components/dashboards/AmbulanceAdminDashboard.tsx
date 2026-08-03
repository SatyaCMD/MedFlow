'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  Radio,
  Plus,
  Truck,
  CheckCircle2,
  Wrench,
  Activity,
  MapPin,
  Clock,
  Phone,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Gauge,
  Droplets,
  Search,
  Filter,
  X,
  Navigation,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { AmbulanceTrackerModal } from '../shared/AmbulanceTrackerModal';
import { useToast } from '../../context/ToastContext';
import { printOfficialGstInvoicePdf } from '../../lib/singlePageReceiptPdf';

export interface AmbulanceVehicle {
  id: string;
  plate: string;
  type: 'ALS Advanced Life Support' | 'BLS Basic Life Support' | 'Trauma & ICU Mobile' | 'Neonatal Transport';
  driver: string;
  phone: string;
  station: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE' | 'ON_BREAK';
  oxygen: number; // percentage e.g. 98
  fuel: number;   // percentage e.g. 85
  equipment: string[];
}

const INITIAL_ADMIN_FLEET: AmbulanceVehicle[] = [
  {
    id: 'AMB-901',
    plate: 'MH-02-ER-8812',
    type: 'ALS Advanced Life Support',
    driver: 'Ramesh Kumar',
    phone: '+91 98765 xxxxx',
    station: 'Central Hospital ER Bay #1',
    status: 'DISPATCHED',
    oxygen: 98,
    fuel: 85,
    equipment: ['Ventilator', 'Defibrillator', 'Syringe Pump', 'Oxygen Cylinders'],
  },
  {
    id: 'AMB-902',
    plate: 'MH-02-ER-8813',
    type: 'Trauma & ICU Mobile',
    driver: 'Suresh Patil',
    phone: '+91 98123 xxxxx',
    station: 'North Wing Emergency Bay',
    status: 'AVAILABLE',
    oxygen: 100,
    fuel: 92,
    equipment: ['ECG Monitor', 'Infusion Pump', 'Suction Machine', 'ALS Kit'],
  },
  {
    id: 'AMB-903',
    plate: 'MH-02-ER-8814',
    type: 'BLS Basic Life Support',
    driver: 'Anil Deshmukh',
    phone: '+91 99401 xxxxx',
    station: 'South Substation Outpost',
    status: 'AVAILABLE',
    oxygen: 95,
    fuel: 78,
    equipment: ['AED Defibrillator', 'First Aid Trauma Kit', 'Stretcher'],
  },
  {
    id: 'AMB-904',
    plate: 'MH-02-ER-8815',
    type: 'Neonatal Transport',
    driver: 'Vikas Shinde',
    phone: '+91 97321 xxxxx',
    station: 'Pediatric ICU Bay #3',
    status: 'MAINTENANCE',
    oxygen: 80,
    fuel: 45,
    equipment: ['Incubator', 'Pediatric Ventilator', 'Infusion Warmers'],
  },
];

export const AmbulanceAdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [fleet, setFleet] = useState<AmbulanceVehicle[]>(INITIAL_ADMIN_FLEET);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedAmbulanceForTracker, setSelectedAmbulanceForTracker] = useState<string | undefined>(undefined);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State for New Vehicle Registration
  const [regVehicleId, setRegVehicleId] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regType, setRegType] = useState<AmbulanceVehicle['type']>('ALS Advanced Life Support');
  const [regDriver, setRegDriver] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStation, setRegStation] = useState('Central ER Main Gate');
  const [regOxygen, setRegOxygen] = useState(100);
  const [regFuel, setRegFuel] = useState(100);

  // Active Emergency Calls
  const [emergencyCalls, setEmergencyCalls] = useState([
    { id: 'CALL-8821', patient: 'Sarah Connor', location: 'Sector 14 Metro Gate #2', type: 'Cardiac Arrest (High Priority)', status: 'DISPATCH_PENDING', time: '2 mins ago' },
    { id: 'CALL-8822', patient: 'John Doe', location: 'Highway 44 Junction', type: 'Severe Trauma & Road Accident', status: 'AMB_EN_ROUTE', assignedVehicle: 'AMB-901', time: '7 mins ago' },
  ]);

  // Submit Vehicle Registration
  const handleRegisterAmbulance = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = regVehicleId.trim().toUpperCase() || `AMB-${Math.floor(900 + Math.random() * 99)}`;
    const newPlate = regPlate.trim().toUpperCase() || `MH-02-ER-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDriver = regDriver.trim() || 'Unassigned Duty Driver';
    const newPhone = regPhone.trim() || '+91 98765 xxxxx';

    const newVehicle: AmbulanceVehicle = {
      id: newId,
      plate: newPlate,
      type: regType,
      driver: newDriver,
      phone: newPhone,
      station: regStation,
      status: 'AVAILABLE',
      oxygen: regOxygen,
      fuel: regFuel,
      equipment: ['Ventilator', 'Defibrillator', 'Biphasic Monitor', 'Oxygen Tank'],
    };

    setFleet([newVehicle, ...fleet]);
    setIsRegisterModalOpen(false);

    // Reset Form
    setRegVehicleId('');
    setRegPlate('');
    setRegDriver('');
    setRegPhone('');

    showToast({
      title: 'Ambulance Vehicle Registered! 🚑',
      message: `Unit ${newId} (${newPlate}) registered into active emergency fleet.`,
      type: 'success',
    });
  };

  // Dispatch Emergency Unit
  const handleDispatchCall = (callId: string) => {
    const availableAmb = fleet.find((a) => a.status === 'AVAILABLE');
    if (!availableAmb) {
      showToast({
        title: 'No Available Ambulance Units',
        message: 'All ambulance units are currently dispatched or in maintenance.',
        type: 'error',
      });
      return;
    }

    setFleet(
      fleet.map((a) => (a.id === availableAmb.id ? { ...a, status: 'DISPATCHED' } : a))
    );

    setEmergencyCalls(
      emergencyCalls.map((c) =>
        c.id === callId ? { ...c, status: 'AMB_EN_ROUTE', assignedVehicle: availableAmb.id } : c
      )
    );

    showToast({
      title: 'Emergency Unit Dispatched! 🚨',
      message: `Unit ${availableAmb.id} assigned to emergency call #${callId}.`,
      type: 'success',
    });
  };

  const filteredFleet = fleet.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.station.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFleet = fleet.length;
  const availableCount = fleet.filter((f) => f.status === 'AVAILABLE').length;
  const dispatchedCount = fleet.filter((f) => f.status === 'DISPATCHED').length;
  const maintenanceCount = fleet.filter((f) => f.status === 'MAINTENANCE').length;

  const columns = [
    {
      header: 'Vehicle Unit & Plate',
      accessor: (row: AmbulanceVehicle) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-black shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{row.id}</span>
              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {row.plate}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">{row.type}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Driver & Contact',
      accessor: (row: AmbulanceVehicle) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 text-xs block">{row.driver}</span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Base Station',
      accessor: (row: AmbulanceVehicle) => (
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {row.station}
        </span>
      ),
    },
    {
      header: 'Telemetry Levels',
      accessor: (row: AmbulanceVehicle) => (
        <div className="space-y-1 w-32">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-600" /> O₂ Level:
            </span>
            <span className="font-black text-cyan-700">{row.oxygen}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${row.oxygen}%` }} />
          </div>

          <div className="flex justify-between items-center text-[10px] pt-0.5">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-emerald-600" /> Fuel:
            </span>
            <span className="font-black text-emerald-700">{row.fuel}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${row.fuel}%` }} />
          </div>
        </div>
      ),
    },
    {
      header: 'Fleet Status',
      accessor: (row: AmbulanceVehicle) => {
        const statusMap: Record<string, { bg: string; text: string; border: string; label: string }> = {
          AVAILABLE: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', text: 'text-emerald-700', border: 'border-emerald-300', label: '● Available' },
          DISPATCHED: { bg: 'bg-rose-50 text-rose-800 border-rose-300', text: 'text-rose-700', border: 'border-rose-300', label: '🚨 En Route' },
          MAINTENANCE: { bg: 'bg-amber-50 text-amber-800 border-amber-300', text: 'text-amber-700', border: 'border-amber-300', label: '🛠️ Workshop' },
          ON_BREAK: { bg: 'bg-slate-100 text-slate-800 border-slate-300', text: 'text-slate-700', border: 'border-slate-300', label: '☕ Off Duty' },
        };
        const st = statusMap[row.status] || statusMap.AVAILABLE;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border tracking-wider ${st.bg}`}>
            {st.label}
          </span>
        );
      },
    },
    {
      header: 'Fleet Actions',
      accessor: (row: AmbulanceVehicle) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAmbulanceForTracker(row.id);
              setIsTrackerOpen(true);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Track GPS</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Live GPS Tracker Modal */}
      <AmbulanceTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => {
          setIsTrackerOpen(false);
          setSelectedAmbulanceForTracker(undefined);
        }}
      />

      {/* Register New Ambulance Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Register New Ambulance Unit</h3>
                    <p className="text-xs font-semibold text-slate-500">AmbulanceAdmin Master Registration Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterAmbulance} className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Vehicle Unit ID
                    </label>
                    <input
                      type="text"
                      required
                      value={regVehicleId}
                      onChange={(e) => setRegVehicleId(e.target.value)}
                      placeholder="e.g. AMB-905"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      License Registration Plate
                    </label>
                    <input
                      type="text"
                      required
                      value={regPlate}
                      onChange={(e) => setRegPlate(e.target.value)}
                      placeholder="e.g. MH-02-ER-9052"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                    Ambulance Life Support Classification
                  </label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="ALS Advanced Life Support">ALS Advanced Life Support (Built-in Ventilator & Defibrillator)</option>
                    <option value="BLS Basic Life Support">BLS Basic Life Support (AED & Oxygen Tank)</option>
                    <option value="Trauma & ICU Mobile">Trauma & ICU Mobile (High-Risk Surgical Transfer)</option>
                    <option value="Neonatal Transport">Neonatal Transport (Pediatric Incubator Unit)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Assigned Primary Driver Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regDriver}
                      onChange={(e) => setRegDriver(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Driver Emergency Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. +91 98765 xxxxx"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                    Home Base Station / Hospital Emergency Bay
                  </label>
                  <input
                    type="text"
                    required
                    value={regStation}
                    onChange={(e) => setRegStation(e.target.value)}
                    placeholder="e.g. Central ER Main Gate Bay #2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Initial Oxygen Tank (%)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={regOxygen}
                      onChange={(e) => setRegOxygen(parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Initial Fuel Reserve (%)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={regFuel}
                      onChange={(e) => setRegFuel(parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Authorize & Register Vehicle to Fleet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP BANNER: Exact Screenshot Reproduction */}
      <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-extrabold text-xs rounded-full border border-rose-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Emergency Response Dispatch Active</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">• GPS Server: Redis 2ms Cache</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Siren className="w-8 h-8 text-rose-500 animate-pulse" />
            <span>Ambulance Management & Live Dispatch Portal</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time GPS vehicle tracking, automated emergency dispatching, driver assignments, maintenance logs, and fuel telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              showToast({
                title: 'Ambulance Invoice Issued 🚑',
                message: 'Generated itemized Ambulance Service Invoice #AMB-INV-2026-881 for Sarah Connor (12 KM ALS Transport + Oxygen = ₹3,465 incl. GST).',
                type: 'success',
              });
              printOfficialGstInvoicePdf({
                invoiceId: 'AMB-INV-2026-881',
                patientName: 'Sarah Connor',
                mrn: 'MC-1001',
                email: 'sarahconnor@medflow.com',
                phone: '+91 98765 44321',
                date: new Date().toISOString().split('T')[0],
                department: 'Emergency Ambulance Fleet',
                doctorName: 'Dr. Gregory House',
                tpaApproved: true,
                lineItems: [
                  { category: 'AMBULANCE', description: 'ALS Advanced Life Support Dispatch (12 KM)', qty: 1, unitPrice: 2800, total: 2800, tpaCovered: true },
                  { category: 'OXYGEN', description: 'High-Flow Emergency Oxygen Canister (2 Hours)', qty: 1, unitPrice: 500, total: 500, tpaCovered: true },
                ],
                subtotal: 3300,
                gstTax: 165,
                grandTotal: 3465,
                tpaCoverage: 3000,
                netPayable: 465,
              });
            }}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Siren className="w-4 h-4" /> Bill Emergency Transport
          </button>

          <button
            onClick={() => setIsTrackerOpen(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4" /> Open Dispatch Tracker Map
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-blue-400" /> Register Vehicle
          </button>
        </div>
      </div>

      {/* KPI Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fleet Vehicles" value={`${totalFleet} Units`} change={100.0} changeLabel="registered fleet" icon={Truck} />
        <StatCard title="Available Response Units" value={`${availableCount} Available`} change={0.0} changeLabel="ready for dispatch" icon={CheckCircle2} />
        <StatCard title="Active Emergency Dispatches" value={`${dispatchedCount} Active`} change={1.0} changeLabel="en route / transport" icon={Siren} />
        <StatCard title="Workshop Maintenance" value={`${maintenanceCount} In Service`} change={0.0} changeLabel="scheduled maintenance" icon={Wrench} />
      </div>

      {/* Active Emergency Dispatch Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
              Active Emergency Dispatch Calls Queue
            </h3>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {emergencyCalls.filter((c) => c.status === 'DISPATCH_PENDING').length} Pending Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyCalls.map((call) => (
            <div
              key={call.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                call.status === 'DISPATCH_PENDING'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">{call.id}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white border text-rose-700">
                    {call.type}
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-900">{call.patient}</h4>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> {call.location}
                </p>
              </div>

              <div>
                {call.status === 'DISPATCH_PENDING' ? (
                  <button
                    onClick={() => handleDispatchCall(call.id)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Dispatch Unit
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Dispatched ({call.assignedVehicle})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Transport Service Invoices & Patient Billing */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Siren className="w-5 h-5 text-rose-600" /> Emergency Ambulance Transport Billing Ledger
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Itemized billing for ALS/BLS ambulance dispatches, per-kilometer rates, oxygen therapy, and TPA insurance clearance.
            </p>
          </div>

          <button
            onClick={() => {
              showToast({
                title: 'Ambulance Invoice Issued 🚑',
                message: 'Generated itemized Ambulance Service Invoice #AMB-INV-2026-881 for Sarah Connor (12 KM ALS Transport + Oxygen = ₹3,465 incl. GST).',
                type: 'success',
              });
              printOfficialGstInvoicePdf({
                invoiceId: 'AMB-INV-2026-881',
                patientName: 'Sarah Connor',
                mrn: 'MC-1001',
                email: 'sarahconnor@medflow.com',
                phone: '+91 98765 44321',
                date: new Date().toISOString().split('T')[0],
                department: 'Emergency Ambulance Fleet',
                doctorName: 'Dr. Gregory House',
                tpaApproved: true,
                lineItems: [
                  { category: 'AMBULANCE', description: 'ALS Advanced Life Support Dispatch (12 KM)', qty: 1, unitPrice: 2800, total: 2800, tpaCovered: true },
                  { category: 'OXYGEN', description: 'High-Flow Emergency Oxygen Canister (2 Hours)', qty: 1, unitPrice: 500, total: 500, tpaCovered: true },
                ],
                subtotal: 3300,
                gstTax: 165,
                grandTotal: 3465,
                tpaCoverage: 3000,
                netPayable: 465,
              });
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
          >
            + Bill Emergency Transport
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'AMB-INV-881', date: '2026-07-28', patient: 'Sarah Connor (MC-1001)', type: 'ALS Advanced Life Support', distance: '12 KM', subtotal: 3300, gst: 165, total: 3465, tpa: 'TPA Cashless Pre-Approved' },
            { id: 'AMB-INV-882', date: '2026-07-27', patient: 'John Doe (MC-1002)', type: 'Trauma & ICU Mobile Unit', distance: '18 KM', subtotal: 4800, gst: 240, total: 5040, tpa: 'Direct Patient Payment' },
          ].map((inv) => (
            <div key={inv.id} className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <div>
                  <span className="font-mono font-black text-rose-600 text-xs block">{inv.id}</span>
                  <h4 className="font-black text-slate-900 text-sm mt-0.5">{inv.patient}</h4>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase border border-emerald-300">
                  {inv.tpa}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Transport Type: <strong className="text-slate-800">{inv.type}</strong></span>
                  <span>Distance: <strong className="text-slate-800">{inv.distance}</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal + Oxygen: <strong className="text-slate-800">₹{inv.subtotal}</strong></span>
                  <span>GST (5%): <strong className="text-slate-800">₹{inv.gst}</strong></span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Emergency Transport Bill:</span>
                  <span className="text-rose-600">₹{inv.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast({
                    title: 'Downloading Transport Invoice 📄',
                    message: `Exporting ambulance invoice #${inv.id}...`,
                    type: 'info',
                  });
                  printOfficialGstInvoicePdf({
                    invoiceId: inv.id,
                    patientName: inv.patient,
                    mrn: 'MC-1001',
                    email: 'patient@medflow.com',
                    phone: '+91 98765 44321',
                    date: inv.date,
                    department: 'Emergency Ambulance Fleet',
                    doctorName: 'Dr. Gregory House',
                    tpaApproved: inv.tpa.includes('TPA'),
                    lineItems: [
                      { category: 'AMBULANCE', description: `${inv.type} (${inv.distance})`, qty: 1, unitPrice: inv.subtotal, total: inv.subtotal, tpaCovered: true },
                    ],
                    subtotal: inv.subtotal,
                    gstTax: inv.gst,
                    grandTotal: inv.total,
                    tpaCoverage: inv.tpa.includes('TPA') ? inv.subtotal : 0,
                    netPayable: inv.tpa.includes('TPA') ? inv.gst : inv.total,
                  });
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Siren className="w-3.5 h-3.5 text-rose-400" /> Print Ambulance Service Invoice PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Search & Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-600" /> Ambulance Fleet Master Telemetry & Driver Assignments
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Live status, oxygen levels, fuel telemetry, and driver contact directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search unit, driver, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none w-full sm:w-48 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available Only</option>
              <option value="DISPATCHED">Dispatched En Route</option>
              <option value="MAINTENANCE">In Maintenance</option>
            </select>
          </div>
        </div>

        {/* Fleet Master Table */}
        <DataTable
          columns={columns}
          data={filteredFleet}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
};
