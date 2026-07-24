'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  Truck,
  UserCheck,
  MapPin,
  Clock,
  Activity,
  Plus,
  ShieldCheck,
  Wrench,
  Fuel,
  Navigation,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StatCard } from './StatCard';
import { DataTable } from './DataTable';
import { AmbulanceTrackerModal } from './AmbulanceTrackerModal';

interface AmbulanceVehicle {
  id: string;
  vehiclePlate: string;
  unitType: 'ALS' | 'BLS' | 'NEONATAL' | 'CARDIAC_CRITICAL';
  model: string;
  status: 'Available' | 'Assigned' | 'On Route to Patient' | 'Arrived at Patient' | 'Patient On Board' | 'On Route to Hospital' | 'Reached Hospital' | 'Maintenance';
  driverName: string;
  driverPhone: string;
  currentSpeed: number; // km/h
  lastLocation: string;
  odometerKm: number;
}

const INITIAL_FLEET: AmbulanceVehicle[] = [
  {
    id: 'amb-1',
    vehiclePlate: 'MH-02-EQ-9912',
    unitType: 'ALS',
    model: 'Force Traveler ALS ICU',
    status: 'On Route to Patient',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    currentSpeed: 48,
    lastLocation: '2.1 km from Green Park Avenue',
    odometerKm: 42150,
  },
  {
    id: 'amb-2',
    vehiclePlate: 'DL-01-AM-4421',
    unitType: 'CARDIAC_CRITICAL',
    model: 'Tata Winger Critical Care',
    status: 'Available',
    driverName: 'Amit Sharma',
    driverPhone: '+91 98123 77410',
    currentSpeed: 0,
    lastLocation: 'MediCore Main ER Base Station',
    odometerKm: 31800,
  },
  {
    id: 'amb-3',
    vehiclePlate: 'KA-03-ER-8820',
    unitType: 'ALS',
    model: 'Force Traveler Advanced ICU',
    status: 'Available',
    driverName: 'Suresh Patil',
    driverPhone: '+91 99401 22849',
    currentSpeed: 0,
    lastLocation: 'MediCore Main ER Base Station',
    odometerKm: 18900,
  },
  {
    id: 'amb-4',
    vehiclePlate: 'WB-04-AB-1109',
    unitType: 'NEONATAL',
    model: 'Mahindra Supro Neonatal ICU',
    status: 'Maintenance',
    driverName: 'Dharmendra Roy',
    driverPhone: '+91 97321 00582',
    currentSpeed: 0,
    lastLocation: 'MediCore Central Workshop Bay 2',
    odometerKm: 54200,
  },
  {
    id: 'amb-5',
    vehiclePlate: 'HR-26-EM-9034',
    unitType: 'BLS',
    model: 'Force Traveler BLS Unit',
    status: 'Available',
    driverName: 'Vikram Malhotra',
    driverPhone: '+91 98992 34110',
    currentSpeed: 0,
    lastLocation: 'MediCore Sector 4 Outpost',
    odometerKm: 27400,
  },
];

interface MaintenanceRecord {
  id: string;
  vehiclePlate: string;
  serviceDate: string;
  description: string;
  cost: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm-1', vehiclePlate: 'WB-04-AB-1109', serviceDate: '2026-07-22', description: 'Oxygen Flow Regulator Calibration & Brakes Check', cost: '₹14,500', status: 'IN_PROGRESS' },
  { id: 'm-2', vehiclePlate: 'MH-02-EQ-9912', serviceDate: '2026-07-15', description: 'Engine Synthetic Oil Change & Defibrillator Battery Replacement', cost: '₹22,000', status: 'COMPLETED' },
  { id: 'm-3', vehiclePlate: 'DL-01-AM-4421', serviceDate: '2026-07-10', description: 'Tire Rotation & Suspension Alignment', cost: '₹9,800', status: 'COMPLETED' },
];

interface FuelRecord {
  id: string;
  vehiclePlate: string;
  date: string;
  liters: number;
  cost: string;
  odometer: number;
}

const INITIAL_FUEL: FuelRecord[] = [
  { id: 'f-1', vehiclePlate: 'MH-02-EQ-9912', date: '2026-07-22', liters: 45, cost: '₹4,320', odometer: 42150 },
  { id: 'f-2', vehiclePlate: 'DL-01-AM-4421', date: '2026-07-21', liters: 50, cost: '₹4,800', odometer: 31800 },
  { id: 'f-3', vehiclePlate: 'KA-03-ER-8820', date: '2026-07-20', liters: 40, cost: '₹3,840', odometer: 18900 },
];

export const AmbulanceManagementModule: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'FLEET' | 'DRIVER' | 'MAINTENANCE'>('DISPATCH');
  const [fleet, setFleet] = useState<AmbulanceVehicle[]>(INITIAL_FLEET);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [fuelLogs, setFuelLogs] = useState<FuelRecord[]>(INITIAL_FUEL);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedPickupAddress, setSelectedPickupAddress] = useState('Building 4B, Green Park Avenue, Flat 302');
  const [isRegisterAmbulanceOpen, setIsRegisterAmbulanceOpen] = useState(false);
  const [isLogMaintenanceOpen, setIsLogMaintenanceOpen] = useState(false);

  // New Ambulance Form
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newUnitType, setNewUnitType] = useState<'ALS' | 'BLS' | 'NEONATAL'>('ALS');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');

  // New Maintenance Form
  const [maintPlate, setMaintPlate] = useState('WB-04-AB-1109');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintCost, setMaintCost] = useState('');

  // Stats calculation
  const totalFleet = fleet.length;
  const availableCount = fleet.filter((v) => v.status === 'Available').length;
  const activeDispatchesCount = fleet.filter((v) => v.status !== 'Available' && v.status !== 'Maintenance').length;
  const maintenanceCount = fleet.filter((v) => v.status === 'Maintenance').length;

  const filteredFleet = fleet.filter((v) => {
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesQuery =
      v.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleRegisterAmbulanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel || !newDriverName) {
      showToast({ title: 'Validation Error', message: 'Please fill all required vehicle fields.', type: 'warning' });
      return;
    }

    const newVehicle: AmbulanceVehicle = {
      id: `amb-${Date.now()}`,
      vehiclePlate: newPlate,
      unitType: newUnitType,
      model: newModel,
      status: 'Available',
      driverName: newDriverName,
      driverPhone: newDriverPhone || '+91 98000 11223',
      currentSpeed: 0,
      lastLocation: 'MediCore Main ER Base',
      odometerKm: 1200,
    };

    setFleet([newVehicle, ...fleet]);
    setIsRegisterAmbulanceOpen(false);
    showToast({
      title: 'Ambulance Vehicle Registered',
      message: `Vehicle ${newPlate} assigned to Driver ${newDriverName}.`,
      type: 'success',
    });

    // Reset Form
    setNewPlate('');
    setNewModel('');
    setNewDriverName('');
    setNewDriverPhone('');
  };

  const handleLogMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintDesc || !maintCost) {
      showToast({ title: 'Validation Error', message: 'Please enter service description and cost.', type: 'warning' });
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      vehiclePlate: maintPlate,
      serviceDate: new Date().toISOString().split('T')[0],
      description: maintDesc,
      cost: maintCost.startsWith('₹') ? maintCost : `₹${maintCost}`,
      status: 'IN_PROGRESS',
    };

    setMaintenance([newRecord, ...maintenance]);

    // Update vehicle status in fleet to Maintenance
    setFleet((prev) =>
      prev.map((item) => (item.vehiclePlate === maintPlate ? { ...item, status: 'Maintenance' } : item))
    );

    setIsLogMaintenanceOpen(false);
    showToast({
      title: 'Maintenance Record Logged',
      message: `Vehicle ${maintPlate} moved to Workshop Maintenance.`,
      type: 'success',
    });

    setMaintDesc('');
    setMaintCost('');
  };

  // DataTable columns for Fleet Overview
  const fleetColumns = [
    {
      header: 'Vehicle & Plate',
      accessor: (row: AmbulanceVehicle) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block text-xs">{row.vehiclePlate}</span>
            <span className="text-[10px] text-slate-500 font-medium">{row.model}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Unit Type',
      accessor: (row: AmbulanceVehicle) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
          {row.unitType} ICU
        </span>
      ),
    },
    {
      header: 'Driver & Contact',
      accessor: (row: AmbulanceVehicle) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{row.driverName}</span>
          <span className="text-[10px] text-slate-500 font-mono">{row.driverPhone}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: AmbulanceVehicle) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
            row.status === 'Available'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : row.status === 'Maintenance'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Live Speed & Location',
      accessor: (row: AmbulanceVehicle) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800 block">{row.currentSpeed} km/h</span>
          <span className="text-[10px] text-slate-500 truncate max-w-[140px] block">{row.lastLocation}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: AmbulanceVehicle) => (
        <button
          onClick={() => {
            setSelectedPickupAddress(row.lastLocation);
            setIsTrackerOpen(true);
          }}
          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
        >
          <Radio className="w-3.5 h-3.5 text-rose-400" /> Track Live
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Live GPS Tracker Modal */}
      <AmbulanceTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        defaultPickupLocation={selectedPickupAddress}
      />

      {/* Register Ambulance Modal */}
      <AnimatePresence>
        {isRegisterAmbulanceOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Register New Ambulance</h3>
                    <p className="text-xs font-semibold text-slate-500">Add vehicle plate & assign certified driver</p>
                  </div>
                </div>
                <button onClick={() => setIsRegisterAmbulanceOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterAmbulanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Vehicle Registration Plate
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-02-EQ-8812"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                      Unit Category
                    </label>
                    <select
                      value={newUnitType}
                      onChange={(e: any) => setNewUnitType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    >
                      <option value="ALS">ALS ICU</option>
                      <option value="BLS">BLS Unit</option>
                      <option value="NEONATAL">Neonatal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Force Traveler"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Assigned Certified Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Varma"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Driver Phone Contact
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00112"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRegisterAmbulanceOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md"
                  >
                    Register & Assign Driver
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Maintenance Modal */}
      <AnimatePresence>
        {isLogMaintenanceOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Log Vehicle Maintenance</h3>
                    <p className="text-xs font-semibold text-slate-500">Record workshop service & parts replacement</p>
                  </div>
                </div>
                <button onClick={() => setIsLogMaintenanceOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogMaintenanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Select Vehicle Plate
                  </label>
                  <select
                    value={maintPlate}
                    onChange={(e) => setMaintPlate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {fleet.map((v) => (
                      <option key={v.id} value={v.vehiclePlate}>
                        {v.vehiclePlate} — {v.model} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Service Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brake Pad Replacement & Oxygen Tank Inspection"
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                    Maintenance Cost (₹ INR)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹18,500"
                    value={maintCost}
                    onChange={(e) => setMaintCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLogMaintenanceOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-md"
                  >
                    Save Maintenance Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Module Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-extrabold text-xs rounded-full border border-rose-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Emergency Response Dispatch Active
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
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsTrackerOpen(true)}
            className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Radio className="w-4 h-4" /> Open Dispatch Tracker Map
          </button>

          <button
            onClick={() => setIsRegisterAmbulanceOpen(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-400" /> Register Vehicle
          </button>
        </div>
      </div>

      {/* KPI Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Fleet Vehicles" value={`${totalFleet} Units`} change={100.0} changeLabel="registered fleet" icon={Truck} />
        <StatCard title="Available Response Units" value={`${availableCount} Available`} change={0.0} changeLabel="ready for dispatch" icon={CheckCircle2} />
        <StatCard title="Active Emergency Dispatches" value={`${activeDispatchesCount} Active`} change={1.0} changeLabel="en route / transport" icon={Siren} />
        <StatCard title="Workshop Maintenance" value={`${maintenanceCount} In Service`} change={0.0} changeLabel="scheduled maintenance" icon={Wrench} />
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'DISPATCH'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Siren className="w-4 h-4" />
          <span>Dispatcher Emergency Center</span>
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'FLEET'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fleet Overview & Driver Assignments</span>
        </button>

        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'MAINTENANCE'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Maintenance & Fuel Telemetry Logs</span>
        </button>
      </div>

      {/* TAB 1: DISPATCHER EMERGENCY CENTER */}
      {activeTab === 'DISPATCH' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                  <span>Active Emergency Dispatch Queue & Map Monitor</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Automated nearest-vehicle assignment engine with 2dsphere GPS spatial indexing.
                </p>
              </div>

              <button
                onClick={() => setIsTrackerOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Launch Interactive Live Map
              </button>
            </div>

            {/* Active Trips Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fleet
                .filter((v) => v.status !== 'Available' && v.status !== 'Maintenance')
                .map((trip) => (
                  <div key={trip.id} className="p-5 bg-white border border-rose-200 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-rose-100 text-rose-900 font-black text-xs rounded-full border border-rose-300">
                        {trip.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">Plate: {trip.vehiclePlate}</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Driver: {trip.driverName}</h4>
                      <p className="text-xs font-semibold text-slate-500">Contact: {trip.driverPhone}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Telemetry Speed:</span>
                        <span className="font-bold text-slate-900 font-mono">{trip.currentSpeed} km/h</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-bold text-rose-600 truncate max-w-[200px]">{trip.lastLocation}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPickupAddress(trip.lastLocation);
                        setIsTrackerOpen(true);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      View Real-Time Live Route Map
                    </button>
                  </div>
                ))}

              {fleet.filter((v) => v.status !== 'Available' && v.status !== 'Maintenance').length === 0 && (
                <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="font-extrabold text-sm text-slate-900">All Emergency Dispatch Queues Clear</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    All response units are currently staged at MediCore ER Base Station ready for new dispatch requests.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET OVERVIEW & DRIVER ASSIGNMENTS */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-3xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by plate number, driver, model..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Status Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Route to Patient">On Route to Patient</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={fleetColumns}
            data={filteredFleet}
            currentPage={1}
            totalPages={1}
          />
        </div>
      )}

      {/* TAB 3: MAINTENANCE & FUEL TELEMETRY LOGS */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-8">
          {/* Workshop Maintenance Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" /> Workshop Maintenance Records
              </h3>
              <button
                onClick={() => setIsLogMaintenanceOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Maintenance
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Vehicle Plate</th>
                    <th className="p-3">Service Date</th>
                    <th className="p-3">Work Description</th>
                    <th className="p-3">Cost (₹)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {maintenance.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{m.vehiclePlate}</td>
                      <td className="p-3 text-slate-600">{m.serviceDate}</td>
                      <td className="p-3 font-medium">{m.description}</td>
                      <td className="p-3 font-bold text-rose-600">{m.cost}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            m.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fuel Telemetry Table */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Fuel className="w-4 h-4 text-blue-600" /> Fuel Refueling Logs
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Vehicle Plate</th>
                    <th className="p-3">Refill Date</th>
                    <th className="p-3">Fuel (Liters)</th>
                    <th className="p-3">Total Cost</th>
                    <th className="p-3">Odometer (KM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {fuelLogs.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{f.vehiclePlate}</td>
                      <td className="p-3 text-slate-600">{f.date}</td>
                      <td className="p-3 font-mono font-bold">{f.liters} L</td>
                      <td className="p-3 font-bold text-blue-600">{f.cost}</td>
                      <td className="p-3 font-mono text-slate-700">{f.odometer.toLocaleString()} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
