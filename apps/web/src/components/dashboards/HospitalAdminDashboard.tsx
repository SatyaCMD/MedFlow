'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Activity,
  CreditCard,
  CheckCircle2,
  Plus,
  Bed,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  Phone,
  FileText,
  PieChart,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';

export interface HospitalStaffMember {
  id: string;
  name: string;
  department: string;
  role: 'Senior Consultant Doctor' | 'Chief ICU Nurse' | 'Surgical Specialist' | 'Resident Medical Officer' | 'Department Head';
  phone: string;
  shift: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)' | '24/7 On-Call';
  status: 'ON_DUTY' | 'ON_CALL' | 'OFF_DUTY' | 'ON_LEAVE';
  patientsAssigned: number;
}

const INITIAL_STAFF: HospitalStaffMember[] = [
  { id: 'EMP-1001', name: 'Dr. Gregory House, M.D.', department: 'Diagnostic Medicine & Cardiology', role: 'Department Head', phone: '+91 98765 11001', shift: 'Morning (08:00 - 16:00)', status: 'ON_DUTY', patientsAssigned: 18 },
  { id: 'EMP-1002', name: 'Dr. Anup Singh', department: 'Cardiology', role: 'Senior Consultant Doctor', phone: '+91 98765 11002', shift: 'Morning (08:00 - 16:00)', status: 'ON_DUTY', patientsAssigned: 14 },
  { id: 'EMP-1003', name: 'Nurse Clara, R.N.', department: 'ICU & Critical Care', role: 'Chief ICU Nurse', phone: '+91 98765 11003', shift: 'Night (00:00 - 08:00)', status: 'ON_DUTY', patientsAssigned: 8 },
  { id: 'EMP-1004', name: 'Dr. Devendra Roy', department: 'Cardiology', role: 'Senior Consultant Doctor', phone: '+91 98765 11004', shift: '24/7 On-Call', status: 'ON_CALL', patientsAssigned: 12 },
  { id: 'EMP-1005', name: 'Dr. Priya Sharma', department: 'Pediatrics & NICU', role: 'Department Head', phone: '+91 98765 11005', shift: 'Evening (16:00 - 00:00)', status: 'ON_DUTY', patientsAssigned: 15 },
  { id: 'EMP-1006', name: 'Nurse Anita Sharma', department: 'Emergency & Triage', role: 'Chief ICU Nurse', phone: '+91 98765 11006', shift: 'Morning (08:00 - 16:00)', status: 'ON_DUTY', patientsAssigned: 22 },
];

export const HospitalAdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<HospitalStaffMember[]>(INITIAL_STAFF);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modals state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isBedManagerOpen, setIsBedManagerOpen] = useState(false);

  // Add Staff Form
  const [staffId, setStaffId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffDept, setStaffDept] = useState('Cardiology');
  const [staffRole, setStaffRole] = useState<HospitalStaffMember['role']>('Senior Consultant Doctor');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffShift, setStaffShift] = useState<HospitalStaffMember['shift']>('Morning (08:00 - 16:00)');

  // Bed Allocation Form
  const [bedWard, setBedWard] = useState('ICU Critical Care');
  const [bedNumber, setBedNumber] = useState('ICU-BED-108');
  const [bedPatient, setBedPatient] = useState('John Doe');
  const [bedDoctor, setBedDoctor] = useState('Dr. Gregory House, M.D.');

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmpId = staffId.trim().toUpperCase() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmpName = staffName.trim() || 'Dr. Medical Officer';
    const newEmpPhone = staffPhone.trim() || '+91 98765 00000';

    const newMember: HospitalStaffMember = {
      id: newEmpId,
      name: newEmpName,
      department: staffDept,
      role: staffRole,
      phone: newEmpPhone,
      shift: staffShift,
      status: 'ON_DUTY',
      patientsAssigned: 0,
    };

    setStaffList([newMember, ...staffList]);
    setIsAddStaffOpen(false);

    // Reset
    setStaffId('');
    setStaffName('');
    setStaffPhone('');

    showToast({
      title: 'Hospital Staff Member Registered! 👨‍⚕️',
      message: `${newEmpName} (${newEmpId}) added to ${staffDept} department roster.`,
      type: 'success',
    });
  };

  const handleAssignBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBedManagerOpen(false);

    showToast({
      title: 'Inpatient Bed Allocated! 🛏️',
      message: `Bed ${bedNumber} in ${bedWard} assigned to patient ${bedPatient}.`,
      type: 'success',
    });
  };

  const handleExportFinancials = () => {
    showToast({
      title: 'Generating Executive Financial Report',
      message: 'Compiling 30-day hospital billing, GST collections, and bed revenue PDF...',
      type: 'info',
    });
  };

  const filteredStaff = staffList.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || st.department.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  const totalStaffCount = staffList.length;
  const onDutyCount = staffList.filter((s) => s.status === 'ON_DUTY').length;

  const staffColumns = [
    {
      header: 'Employee ID & Staff Name',
      accessor: (row: HospitalStaffMember) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-xs shadow-xs">
            {row.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{row.name}</span>
              <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {row.id}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">{row.role}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row: HospitalStaffMember) => (
        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-600" /> {row.department}
        </span>
      ),
    },
    {
      header: 'Shift & Contact',
      accessor: (row: HospitalStaffMember) => (
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {row.shift}
          </span>
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Active Patients',
      accessor: (row: HospitalStaffMember) => (
        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-black text-slate-800">
          {row.patientsAssigned} Patients
        </span>
      ),
    },
    {
      header: 'Roster Status',
      accessor: (row: HospitalStaffMember) => {
        const stMap: Record<string, { bg: string; label: string }> = {
          ON_DUTY: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: '● On Duty' },
          ON_CALL: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: '📞 24/7 On-Call' },
          OFF_DUTY: { bg: 'bg-slate-100 text-slate-800 border-slate-300', label: 'Off Duty' },
          ON_LEAVE: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'On Leave' },
        };
        const st = stMap[row.status] || stMap.ON_DUTY;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border tracking-wider ${st.bg}`}>
            {st.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Register New Hospital Staff</h3>
                    <p className="text-xs font-semibold text-slate-500">HospitalAdmin Operations & Roster Control</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Employee ID Code
                    </label>
                    <input
                      type="text"
                      required
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. EMP-1007"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Full Name & Credentials
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Dr. Meera Verma, M.D."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Department Assignment
                    </label>
                    <select
                      value={staffDept}
                      onChange={(e) => setStaffDept(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cardiology">Cardiology & Cardiac Surgery</option>
                      <option value="ICU & Critical Care">ICU & Critical Care Unit</option>
                      <option value="Emergency & Triage">Emergency & Trauma Triage</option>
                      <option value="Pediatrics & NICU">Pediatrics & Neonatal Care</option>
                      <option value="Neurology">Neurology & Neuro-Surgery</option>
                      <option value="Orthopedics">Orthopedics & Joint Replacement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Clinical Role Designation
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Senior Consultant Doctor">Senior Consultant Doctor</option>
                      <option value="Chief ICU Nurse">Chief ICU Nurse</option>
                      <option value="Surgical Specialist">Surgical Specialist</option>
                      <option value="Resident Medical Officer">Resident Medical Officer</option>
                      <option value="Department Head">Department Head</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Mobile Contact Number
                    </label>
                    <input
                      type="text"
                      required
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="e.g. +91 98765 44321"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Roster Shift Schedule
                    </label>
                    <select
                      value={staffShift}
                      onChange={(e) => setStaffShift(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                      <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                      <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                      <option value="24/7 On-Call">24/7 On-Call</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Authorize & Add Staff to Roster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
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

      {/* Bed Allocation Modal */}
      <AnimatePresence>
        {isBedManagerOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">Bed Allocation & Ward Transfer</h3>
                    <p className="text-xs font-semibold text-slate-500">Assign Inpatient Beds Across Wards</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBedManagerOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignBedSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                    Select Target Ward
                  </label>
                  <select
                    value={bedWard}
                    onChange={(e) => setBedWard(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ICU Critical Care">ICU Critical Care Ward (38/40 Occupied)</option>
                    <option value="Emergency Triage">Emergency & Trauma Center (45/50 Occupied)</option>
                    <option value="Surgical Ward">Surgical Operating Ward (14/17 Active)</option>
                    <option value="Deluxe Private Ward">Deluxe Private Ward (18/20 Occupied)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Bed Identifier Code
                    </label>
                    <input
                      type="text"
                      required
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      placeholder="e.g. ICU-BED-108"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={bedPatient}
                      onChange={(e) => setBedPatient(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    required
                    value={bedDoctor}
                    onChange={(e) => setBedDoctor(e.target.value)}
                    placeholder="e.g. Dr. Gregory House, M.D."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Bed Assignment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBedManagerOpen(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP EXECUTIVE BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-extrabold text-xs rounded-full border border-blue-400/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hospital Operations Telemetry Active</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">• Live Bed Census: 412/468 Beds Occupied (88%)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400 animate-pulse" />
            <span>MediFlow Central Hospital Executive Control Portal</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time facility bed occupancy, department census, clinical staff roster scheduling, and financial telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" /> Register New Staff
          </button>

          <button
            onClick={() => setIsBedManagerOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Bed className="w-4 h-4" /> Bed Allocation Manager
          </button>

          <button
            onClick={handleExportFinancials}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Financials
          </button>
        </div>
      </div>

      {/* EXECUTIVE KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bed Occupancy Rate" value="88.0%" change={2.4} changeLabel="412 / 468 beds occupied" icon={Bed} />
        <StatCard title="Daily Patient Census" value="1,248 Visits" change={12.5} changeLabel="IPD & OPD patients" icon={Users} />
        <StatCard title="Daily Financial Collections" value="₹45,80,000" change={8.1} changeLabel="revenue & claims" icon={CreditCard} />
        <StatCard title="Clinical Roster On-Duty" value={`${onDutyCount} On Duty`} change={0.0} changeLabel="doctors & nurses active" icon={Stethoscope} />
      </div>

      {/* DEPARTMENT BED UTILIZATION GRID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" /> Hospital Department Census & Critical Utilization
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900">ICU & Critical Care</span>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-black text-[10px]">95% High</span>
            </div>
            <div className="text-xl font-black text-slate-900">38 / 40 Beds</div>
            <p className="text-[11px] text-slate-500 font-semibold">12 Ventilator Units Active • Lead: Dr. House</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '95%' }} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900">Emergency & Triage</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-black text-[10px]">90% Busy</span>
            </div>
            <div className="text-xl font-black text-slate-900">45 / 50 Beds</div>
            <p className="text-[11px] text-slate-500 font-semibold">Avg Triage Wait: 8 mins • Lead: Nurse Anita</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '90%' }} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900">Surgical Operating OT</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-black text-[10px]">82% Active</span>
            </div>
            <div className="text-xl font-black text-slate-900">14 / 17 OTs</div>
            <p className="text-[11px] text-slate-500 font-semibold">6 Cardiac Surgeries En Route Today</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900">General & Deluxe Wards</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">86% Optimal</span>
            </div>
            <div className="text-xl font-black text-slate-900">315 / 366 Beds</div>
            <p className="text-[11px] text-slate-500 font-semibold">51 Available Beds for Inpatient Admission</p>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* STAFF & ROSTER DIRECTORY TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Hospital Staff Roster & Clinical Personnel Directory
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Filter employee directory, view shift assignments, and manage hospital staff access.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none w-full sm:w-48 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="ICU">ICU & Critical Care</option>
              <option value="Emergency">Emergency & Triage</option>
              <option value="Pediatrics">Pediatrics & NICU</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={staffColumns}
          data={filteredStaff}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
};
