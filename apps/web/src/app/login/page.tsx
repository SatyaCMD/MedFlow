'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  TestTube,
  Pill,
  Key,
  Sparkles,
  User,
  ShieldAlert,
  ChevronDown,
  Building2,
  HelpCircle,
  Award,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Logo } from '../../components/shared/Logo';
import { AuthSidebar } from '../../components/shared/AuthSidebar';
import { REAL_DOCTORS_DATASET, DoctorProfile } from '../../data/medicalCatalog';

type LoginRole = 'DOCTOR' | 'LAB_TECHNICIAN' | 'NURSE' | 'PHARMACIST' | 'PATIENT' | 'SUPER_ADMIN';

interface RolePortalConfig {
  id: LoginRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeStyle: string;
  icon: any;
  accentGradient: string;
  inputLabel: string;
  inputPlaceholder: string;
  defaultPasswordHint: string;
  sampleProfiles: Array<{ name: string; idStr: string; passStr: string; subtext: string }>;
}

const ROLE_PORTALS: RolePortalConfig[] = [
  {
    id: 'DOCTOR',
    title: 'Physician / Doctor Workstation',
    subtitle: 'Access patient EMRs, prescription studio, and scheduled OPD queues',
    badge: 'Clinical OPD Workstation',
    badgeStyle: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Stethoscope,
    accentGradient: 'from-blue-600 to-indigo-600',
    inputLabel: 'Doctor Name or Email Address',
    inputPlaceholder: 'e.g. Dr. Anup Singh, Dr. Devendra Roy, or anup.singh@medflow.com',
    defaultPasswordHint: 'Doctor@321',
    sampleProfiles: [], // Dynamically driven by REAL_DOCTORS_DATASET
  },
  {
    id: 'LAB_TECHNICIAN',
    title: 'Lab & Diagnostics Portal',
    subtitle: 'Manage specimen audits, pathology results, and diagnostic uploads',
    badge: 'Diagnostic Audit Portal',
    badgeStyle: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: TestTube,
    accentGradient: 'from-amber-600 to-orange-600',
    inputLabel: 'Technician Name or Email',
    inputPlaceholder: 'e.g. Rajesh Kumar, Aman Gupta, or rajesh.kumar@medflow.com',
    defaultPasswordHint: 'Technician@321',
    sampleProfiles: [
      { name: 'Rajesh Kumar', idStr: 'Rajesh Kumar', passStr: 'Technician@321', subtext: 'Hematology & Blood Audits' },
      { name: 'Aman Gupta', idStr: 'Aman Gupta', passStr: 'Technician@321', subtext: 'Microbiology & Pathology' },
      { name: 'Sunil Verma', idStr: 'Sunil Verma', passStr: 'Technician@321', subtext: 'Radiology & Imaging' },
      { name: 'Ritu Deshmukh', idStr: 'Ritu Deshmukh', passStr: 'Technician@321', subtext: 'Genomics & DNA Audits' },
    ],
  },
  {
    id: 'NURSE',
    title: 'Nurse & Caregiver Station',
    subtitle: 'Log bedside vitals, triage ward rounds, and monitor inpatient care',
    badge: 'Inpatient Ward Station',
    badgeStyle: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: ShieldCheck,
    accentGradient: 'from-purple-600 to-indigo-600',
    inputLabel: 'Nurse / Caregiver Name or Email',
    inputPlaceholder: 'e.g. Sunita Patel, Anita Sharma, or sunita.patel@medflow.com',
    defaultPasswordHint: 'Caregiver@321',
    sampleProfiles: [
      { name: 'Sunita Patel', idStr: 'Sunita Patel', passStr: 'Caregiver@321', subtext: 'ICU Ward Chief Nurse' },
      { name: 'Anita Sharma', idStr: 'Anita Sharma', passStr: 'Caregiver@321', subtext: 'Pediatric Ward Lead' },
      { name: 'Priya Nambiar', idStr: 'Priya Nambiar', passStr: 'Caregiver@321', subtext: 'Post-Op Rehabilitation Caregiver' },
      { name: 'Rohan Mukherjee', idStr: 'Rohan Mukherjee', passStr: 'Caregiver@321', subtext: 'Emergency Triage Caregiver' },
    ],
  },
  {
    id: 'PHARMACIST',
    title: 'Pharmacist Dispensary Portal',
    subtitle: 'Manage prescription fulfillment, inventory stock, and drug dispensing',
    badge: 'Dispensary & Inventory Scope',
    badgeStyle: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: Pill,
    accentGradient: 'from-teal-600 to-emerald-600',
    inputLabel: 'Pharmacist Login ID / Username',
    inputPlaceholder: 'Type Pharmacist or pharmacist@medflow.com',
    defaultPasswordHint: 'Pharmacist@321',
    sampleProfiles: [
      { name: 'Pharmacist Dispensary', idStr: 'Pharmacist', passStr: 'Pharmacist@321', subtext: 'Master Dispensary Account' },
    ],
  },
  {
    id: 'PATIENT',
    title: 'Patient & Family Health Vault',
    subtitle: 'View consultation history, lab test reports, and upcoming appointments',
    badge: 'Personal Health Portal',
    badgeStyle: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: UserCheck,
    accentGradient: 'from-emerald-600 to-teal-600',
    inputLabel: 'Patient Email Address',
    inputPlaceholder: 'Enter your registered email address (e.g. patient@medicore360.com)',
    defaultPasswordHint: 'Patient@123',
    sampleProfiles: [], // No 1-click login for patient per user requirement
  },
  {
    id: 'SUPER_ADMIN',
    title: 'Super Admin Command Center',
    subtitle: 'System-wide multi-tenant configuration, security audits, and tenant control',
    badge: 'Enterprise Super Admin',
    badgeStyle: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: Key,
    accentGradient: 'from-slate-900 to-rose-900',
    inputLabel: 'Super Admin Email Address',
    inputPlaceholder: 'superadmin54@gmail.com',
    defaultPasswordHint: 'Saisatya@772',
    sampleProfiles: [
      { name: 'Super Admin Command', idStr: 'superadmin54@gmail.com', passStr: 'Saisatya@772', subtext: 'Full Enterprise Privileges' },
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoginRole>('DOCTOR');

  const [identifier, setIdentifier] = useState('Dr. Anup Singh');
  const [password, setPassword] = useState('Doctor@321');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Doctor selection state for 25+ doctors per department
  const [selectedDept, setSelectedDept] = useState<string>('Cardiology');
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [showAllDoctorsModal, setShowAllDoctorsModal] = useState<boolean>(false);

  // Sliding Refs for department tab carousels
  const mainDeptScrollRef = useRef<HTMLDivElement>(null);
  const modalDeptScrollRef = useRef<HTMLDivElement>(null);

  const scrollDeptBar = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activePortal = ROLE_PORTALS.find((p) => p.id === activeTab)!;

  // Extract unique departments from catalog
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    REAL_DOCTORS_DATASET.forEach((d) => set.add(d.department));
    return Array.from(set);
  }, []);

  // Filter doctors based on selected department and search term
  const filteredDoctors = useMemo(() => {
    return REAL_DOCTORS_DATASET.filter((doc) => {
      const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept;
      const term = doctorSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        doc.name.toLowerCase().includes(term) ||
        doc.specialty.toLowerCase().includes(term) ||
        doc.qualification.toLowerCase().includes(term) ||
        doc.department.toLowerCase().includes(term);
      return matchesDept && matchesSearch;
    });
  }, [selectedDept, doctorSearch]);

  const handleTabChange = (roleId: LoginRole) => {
    setActiveTab(roleId);
    setError(null);
    const targetPortal = ROLE_PORTALS.find((p) => p.id === roleId)!;
    
    if (roleId === 'DOCTOR') {
      const firstCardiology = REAL_DOCTORS_DATASET.find(d => d.department === 'Cardiology') || REAL_DOCTORS_DATASET[0];
      setIdentifier(firstCardiology.name);
      setPassword('Doctor@321');
    } else if (roleId === 'PATIENT') {
      setIdentifier('');
      setPassword('');
    } else if (targetPortal.sampleProfiles.length > 0) {
      const defaultSample = targetPortal.sampleProfiles[0];
      setIdentifier(defaultSample.idStr);
      setPassword(defaultSample.passStr);
    } else {
      setIdentifier('');
      setPassword('');
    }
  };

  const handleSelectDoctor = (doc: DoctorProfile) => {
    setIdentifier(doc.name);
    setPassword('Doctor@321');
    if (error) setError(null);
  };

  const handleSelectProfile = (prof: { idStr: string; passStr: string }) => {
    setIdentifier(prof.idStr);
    setPassword(prof.passStr);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email: identifier, password });
      const { data } = response.data;

      if (data.requiresOtp && data.tempToken) {
        sessionStorage.setItem('tempToken', data.tempToken);
        router.push(`/verify?tempToken=${data.tempToken}`);
      } else {
        setError('Unexpected authentication response structure.');
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Telemetry Sidebar */}
      <AuthSidebar
        title="Role-Dedicated Workstation Access"
        subtitle="Select your specific workstation portal tab below to launch doctor, lab, nurse, pharmacist, patient, or super admin login."
      />

      {/* RIGHT COLUMN: Role-Dedicated Interactive Portal */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative bg-slate-50 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 space-y-5 my-auto"
        >
          {/* Mobile Brand Title */}
          <div className="flex flex-col items-center mb-2 lg:hidden" onClick={() => router.push('/')}>
            <Logo size={44} className="mb-1" />
            <h2 className="text-xl font-black text-slate-900 tracking-wider">MediCore 360</h2>
          </div>

          {/* DEDICATED ROLE PORTAL TAB SELECTOR BAR */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Select Workstation Portal View
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              {ROLE_PORTALS.map((portal) => {
                const isActive = activeTab === portal.id;
                const IconComp = portal.icon;
                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => handleTabChange(portal.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-md border border-slate-200/80 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{portal.id.replace('_', ' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE ROLE BANNER */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${activePortal.accentGradient} text-white flex items-center justify-center shadow-md`}>
                  <activePortal.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 tracking-tight">{activePortal.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{activePortal.subtitle}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-full ${activePortal.badgeStyle}`}>
                {activePortal.badge}
              </span>
            </div>

            {/* DOCTOR SPECIFIC: 25+ DOCTORS PER DEPARTMENT PICKER */}
            {activeTab === 'DOCTOR' && (
              <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    25+ Doctors Per Department (Quick Fill):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllDoctorsModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer hover:underline"
                  >
                    <span>Browse All 400+</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Search Bar for Doctors */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name, specialty or dept..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {doctorSearch && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* SLIDING DEPARTMENT FILTER CAROUSEL */}
                <div className="relative flex items-center group my-1">
                  <button
                    type="button"
                    onClick={() => scrollDeptBar(mainDeptScrollRef, 'left')}
                    className="absolute -left-2.5 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
                    title="Slide left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div
                    ref={mainDeptScrollRef}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth py-1 px-4 w-full text-[10px] font-bold"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDept('ALL')}
                      className={`px-3 py-1 rounded-xl border shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                        selectedDept === 'ALL'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All ({REAL_DOCTORS_DATASET.length})
                    </button>
                    {departmentsList.map((dept) => {
                      const count = REAL_DOCTORS_DATASET.filter((d) => d.department === dept).length;
                      const isSel = selectedDept === dept;
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setSelectedDept(dept)}
                          className={`px-3 py-1 rounded-xl border shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {dept} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollDeptBar(mainDeptScrollRef, 'right')}
                    className="absolute -right-2.5 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
                    title="Slide right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Doctors Quick Chips (Animated Grid) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedDept + doctorSearch}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 gap-1.5"
                  >
                    {filteredDoctors.slice(0, 6).map((doc) => {
                      const isSelected = identifier.toLowerCase() === doc.name.toLowerCase() || identifier.toLowerCase() === doc.name.replace('Dr. ', '').toLowerCase();
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => handleSelectDoctor(doc)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                              : 'bg-white text-slate-700 hover:bg-blue-50/80 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {doc.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold truncate leading-tight flex items-center gap-1">
                              <span>{doc.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                            </div>
                            <div className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                              {doc.specialty}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {filteredDoctors.length > 6 && (
                  <div className="text-center pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowAllDoctorsModal(true)}
                      className="text-[10px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer"
                    >
                      + {filteredDoctors.length - 6} more doctors in {selectedDept === 'ALL' ? 'catalog' : selectedDept}...
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OTHER NON-PATIENT ROLES (Lab, Nurse, Pharmacist, Super Admin) */}
            {activeTab !== 'DOCTOR' && activeTab !== 'PATIENT' && activePortal.sampleProfiles.length > 0 && (
              <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  Select {activePortal.title.split(' ')[0]} Profile (1-Click Fill):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activePortal.sampleProfiles.map((prof, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectProfile(prof)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        identifier === prof.idStr
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-blue-50 border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <span>{prof.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dynamic Identifier Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                {activePortal.inputLabel} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activePortal.inputPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {activeTab !== 'PATIENT' && (
                <p className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Default Preset Password: <strong className="text-slate-800 font-mono">{activePortal.defaultPasswordHint}</strong>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember this workstation session</span>
              </label>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3.5 px-4 bg-gradient-to-r ${activePortal.accentGradient} text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying {activePortal.badge}...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {activePortal.title.split(' ')[0]} Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Need a new workstation account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </motion.div>
      </div>

      {/* ALL DOCTORS BROWSER MODAL (25+ Doctors Per Dept) */}
      <AnimatePresence>
        {showAllDoctorsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Hospital Physician Directory (400+ Doctors)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    25+ Verified Specialist Physicians available in every clinical department
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllDoctorsModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Search & Department Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name, qualification, department, or specialty..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="relative flex items-center group">
                  <button
                    type="button"
                    onClick={() => scrollDeptBar(modalDeptScrollRef, 'left')}
                    className="absolute -left-2 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
                    title="Slide left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div
                    ref={modalDeptScrollRef}
                    className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth py-1 px-4 w-full text-xs font-bold"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDept('ALL')}
                      className={`px-3 py-1 rounded-xl border shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                        selectedDept === 'ALL'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      All Departments ({REAL_DOCTORS_DATASET.length})
                    </button>
                    {departmentsList.map((dept) => {
                      const count = REAL_DOCTORS_DATASET.filter((d) => d.department === dept).length;
                      const isSel = selectedDept === dept;
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => setSelectedDept(dept)}
                          className={`px-3 py-1 rounded-xl border shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                            isSel
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {dept} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollDeptBar(modalDeptScrollRef, 'right')}
                    className="absolute -right-2 z-20 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:scale-110 flex items-center justify-center transition-all cursor-pointer"
                    title="Slide right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Doctor Cards List */}
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-h-[300px]">
                {filteredDoctors.map((doc) => {
                  const isSelected = identifier.toLowerCase() === doc.name.toLowerCase() || identifier.toLowerCase() === doc.name.replace('Dr. ', '').toLowerCase();
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        handleSelectDoctor(doc);
                        setShowAllDoctorsModal(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {doc.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{doc.name}</h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">
                            {doc.qualification}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-blue-600 truncate mt-0.5">{doc.specialty}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
                          <span className="truncate">{doc.department}</span>
                          <span>•</span>
                          <span className="truncate">{doc.hospitalUnit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredDoctors.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-400 space-y-2">
                    <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">No doctors found matching "{doctorSearch}"</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {filteredDoctors.length} physicians</span>
                <button
                  type="button"
                  onClick={() => setShowAllDoctorsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Directory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Password Recovery Assistant
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Default workstation passwords are configured per role scope:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono text-slate-800">
                <p>Doctor: <strong className="text-blue-600">Doctor@321</strong></p>
                <p>Lab Tech: <strong className="text-amber-600">Technician@321</strong></p>
                <p>Caregiver: <strong className="text-purple-600">Caregiver@321</strong></p>
                <p>Pharmacist: <strong className="text-teal-600">Pharmacist@321</strong></p>
                <p>Super Admin: <strong className="text-rose-600">Saisatya@772</strong></p>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
