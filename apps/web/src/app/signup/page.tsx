'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
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
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Logo } from '../../components/shared/Logo';
import { AuthSidebar } from '../../components/shared/AuthSidebar';

type PublicRole = 'DOCTOR' | 'PATIENT' | 'NURSE' | 'LAB_TECHNICIAN';

interface RoleConfig {
  value: PublicRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: any;
  accentGradient: string;
  features: string[];
}

const PUBLIC_ROLES: RoleConfig[] = [
  {
    value: 'DOCTOR',
    title: 'Physician / Doctor Portal',
    subtitle: 'Register your clinical workstation profile for OPD consults & prescriptions',
    badge: 'Clinical Workstation',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Stethoscope,
    accentGradient: 'from-blue-600 to-indigo-600',
    features: ['EHR/EMR Prescriptions', 'Tele-Consultation Queue', 'Patient History Access'],
  },
  {
    value: 'PATIENT',
    title: 'Patient & Family Portal',
    subtitle: 'Create your personal digital health vault and book specialist appointments',
    badge: 'Personal Health Vault',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: UserCheck,
    accentGradient: 'from-emerald-600 to-teal-600',
    features: ['Instant Appointment Booking', 'AWS S3 Document Vault', 'Lab & Billing History'],
  },
  {
    value: 'NURSE',
    title: 'Nurse & Caregiver Station',
    subtitle: 'Register for ward triage, bedside vitals logging, and nursing workflows',
    badge: 'Ward Monitoring Scope',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: ShieldCheck,
    accentGradient: 'from-purple-600 to-indigo-600',
    features: ['Vitals & Bedside Logging', 'Ward Round Checklist', 'ICU Triage Alerts'],
  },
  {
    value: 'LAB_TECHNICIAN',
    title: 'Lab & Diagnostics Portal',
    subtitle: 'Register for specimen testing, pathology audits, and radiology reporting',
    badge: 'Diagnostic Audit Scope',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: TestTube,
    accentGradient: 'from-amber-600 to-orange-600',
    features: ['Diagnostic Report Uploads', 'Sample Tracking System', 'Pathology Verification'],
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<PublicRole>('DOCTOR');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Role-specific fields
  const [medicalLicense, setMedicalLicense] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [assignedWard, setAssignedWard] = useState('ICU Ward');
  const [labAccreditation, setLabAccreditation] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeRoleConfig = PUBLIC_ROLES.find((r) => r.value === role)!;

  // Dynamic Password Strength Meter
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(password);

  const handleFillSample = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    if (role === 'DOCTOR') {
      setFirstName('Gregory');
      setLastName('House');
      setEmail(`dr_house_${randomNum}@medflow.com`);
      setPassword('Doctor@321');
      setMedicalLicense('MCI-2026-9812');
      setSpecialty('Cardiology');
    } else if (role === 'PATIENT') {
      setFirstName('Alexander');
      setLastName('Smith');
      setEmail(`patient_${randomNum}@medflow.com`);
      setPassword('Patient@123');
      setBloodGroup('O+');
      setEmergencyPhone('+91 9876543210');
    } else if (role === 'NURSE') {
      setFirstName('Florence');
      setLastName('Nightingale');
      setEmail(`nurse_${randomNum}@medflow.com`);
      setPassword('Caregiver@321');
      setMedicalLicense('INC-NURSE-4421');
      setAssignedWard('ICU Ward');
    } else if (role === 'LAB_TECHNICIAN') {
      setFirstName('Alex');
      setLastName('Mercer');
      setEmail(`labtech_${randomNum}@medflow.com`);
      setPassword('Technician@321');
      setLabAccreditation('NABL-LAB-8812');
      setSpecialty('Hematology');
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role,
        medicalLicenseNumber: medicalLicense || labAccreditation || undefined,
        specialty,
        department: assignedWard || specialty,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed. Please check your inputs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Telemetry Sidebar */}
      <AuthSidebar
        title="Role-Dedicated Workstation Registration"
        subtitle="Register your account mapped to your specific medical workstation scope. Public signup supports Doctors, Patients, Caregivers, and Lab Technicians."
      />

      {/* RIGHT COLUMN: Interactive Dedicated Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-slate-50 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 space-y-5 my-auto"
        >
          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center mb-3 lg:hidden" onClick={() => router.push('/')}>
            <Logo size={44} className="mb-1" />
            <h2 className="text-xl font-black text-slate-900 tracking-wider">MediCore 360</h2>
          </div>

          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Create Workstation Account</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your specific workstation role to launch registration
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillSample}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl border border-blue-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Fill Sample</span>
            </button>
          </div>

          {/* ROLE SELECTOR GRID (Strictly 4 Allowed Public Roles - No Admin / No Pharmacist) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Select Registration Scope (Hospital Admin & Pharmacist Restricted)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PUBLIC_ROLES.map((r) => {
                const isSelected = role === r.value;
                const IconComp = r.icon;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setRole(r.value);
                      if (error) setError(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-200/70 text-slate-700'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="block text-xs font-black leading-tight">{r.title.split(' ')[0]} {r.title.split(' ')[1]}</span>
                      <span className={`block text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300 font-semibold' : 'text-slate-500 font-medium'}`}>
                        {r.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROLE-DEDICATED HEADER BANNER */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${activeRoleConfig.accentGradient} text-white flex items-center justify-center shadow-xs`}>
                <activeRoleConfig.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900">{activeRoleConfig.title}</h4>
                <p className="text-[10px] text-slate-500 font-semibold">{activeRoleConfig.subtitle}</p>
              </div>
            </div>
            <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full ${activeRoleConfig.badgeColor}`}>
              {activeRoleConfig.badge}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={role === 'DOCTOR' ? 'Devendra' : role === 'NURSE' ? 'Sunita' : role === 'LAB_TECHNICIAN' ? 'Rajesh' : 'Ananya'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={role === 'DOCTOR' ? 'Roy' : role === 'NURSE' ? 'Patel' : role === 'LAB_TECHNICIAN' ? 'Kumar' : 'Sharma'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role.toLowerCase()}@medflow.com`}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Account Password <span className="text-rose-500">*</span>
              </label>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Password Strength</span>
                    <span className={strengthScore >= 4 ? 'text-emerald-600' : strengthScore >= 2 ? 'text-amber-600' : 'text-rose-500'}>
                      {strengthScore >= 4 ? 'Strong' : strengthScore >= 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          step <= strengthScore
                            ? strengthScore >= 4
                              ? 'bg-emerald-500'
                              : strengthScore >= 2
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ROLE-SPECIFIC DEDICATED FIELDS */}
            {role === 'DOCTOR' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Medical Council License #
                  </label>
                  <input
                    type="text"
                    value={medicalLicense}
                    onChange={(e) => setMedicalLicense(e.target.value)}
                    placeholder="MCI-2026-9812"
                    className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Clinical Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Oncology">Oncology</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'NURSE' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                    Nursing Council Reg #
                  </label>
                  <input
                    type="text"
                    value={medicalLicense}
                    onChange={(e) => setMedicalLicense(e.target.value)}
                    placeholder="INC-NURSE-4421"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                    Assigned Hospital Ward
                  </label>
                  <select
                    value={assignedWard}
                    onChange={(e) => setAssignedWard(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="ICU Ward">ICU Ward</option>
                    <option value="Pediatric Ward">Pediatric Ward</option>
                    <option value="Post-Op Ward">Post-Op Ward</option>
                    <option value="Emergency Ward">Emergency Ward</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'LAB_TECHNICIAN' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Lab Accreditation License #
                  </label>
                  <input
                    type="text"
                    value={labAccreditation}
                    onChange={(e) => setLabAccreditation(e.target.value)}
                    placeholder="NABL-LAB-8812"
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Lab Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Genomics">Genomics</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'PATIENT' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="O+">O positive (O+)</option>
                    <option value="A+">A positive (A+)</option>
                    <option value="B+">B positive (B+)</option>
                    <option value="AB+">AB positive (AB+)</option>
                    <option value="O-">O negative (O-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            )}

            {/* KYC Verification Onboarding Banner for Staff Roles */}
            {role !== 'PATIENT' && (
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex gap-2 text-xs text-amber-800 font-medium items-start">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>KYC Onboarding Active:</strong> Staff profiles are submitted with status <span className="font-bold text-amber-950 underline">PENDING</span>. System access is enabled following admin credential verification.
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-600 font-semibold text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Workstation Registration Successful! Redirecting to Sign In...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 px-4 bg-gradient-to-r ${activeRoleConfig.accentGradient} text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all duration-300 disabled:opacity-50 cursor-pointer`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering {activeRoleConfig.badge}...</span>
                </>
              ) : (
                <>
                  <span>Create {activeRoleConfig.title.split(' ')[0]} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Sign In to Workstation
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
