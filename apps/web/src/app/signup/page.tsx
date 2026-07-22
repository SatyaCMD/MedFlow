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
  Building2,
  Pill,
  TestTube,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Logo } from '../../components/shared/Logo';
import { AuthSidebar } from '../../components/shared/AuthSidebar';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const features = [
    'Strict Multi-Tenant Database Isolation',
    'Role-Based Cryptographic JWT Tokens',
    'Real-time EHR & EMR Audited Storage',
    'Secure Multi-Factor OTP Verification'
  ];

  const roleOptions = [
    { value: 'DOCTOR', label: 'Physician / Doctor', icon: Stethoscope, desc: 'EHR, Prescriptions & Consults' },
    { value: 'PATIENT', label: 'Patient / Client', icon: UserCheck, desc: 'Personal Records & Bookings' },
    { value: 'NURSE', label: 'Nurse / Caregiver', icon: ShieldCheck, desc: 'Vitals & Ward Monitoring' },
    { value: 'PHARMACIST', label: 'Pharmacist', icon: Pill, desc: 'Dispensary & Inventory' },
    { value: 'LAB_TECHNICIAN', label: 'Lab Technician', icon: TestTube, desc: 'Diagnostic Audits & Tests' },
    { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', icon: Building2, desc: 'Tenant Configuration' },
  ];

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
    setFirstName('Gregory');
    setLastName('House');
    setEmail(`house_${Math.floor(1000 + Math.random() * 9000)}@medicore360.com`);
    setPassword('SecurePassword123!');
    setRole('DOCTOR');
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
      
      {/* LEFT COLUMN: Deep Gradient Info Sidebar */}
      <AuthSidebar
        title="Create Your Workstation Account"
        subtitle="Register an account mapped to your tenant workspace to access EMR directories, scheduling boards, and clinical diagnostic tools."
      />

      {/* RIGHT COLUMN: Interactive Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-slate-50 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl relative z-10 space-y-6 my-auto"
        >
          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center mb-4 lg:hidden" onClick={() => router.push('/')}>
            <Logo size={48} className="mb-2" />
            <h2 className="text-xl font-black text-slate-900 tracking-wider">MediCore 360</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Workstation Account</h2>
              <p className="text-xs text-slate-500 mt-0.5">Register your details for clinical access</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Gregory"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="House"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Work Email Address
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
                  placeholder="doctor@medicore360.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password & Live Strength Meter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Password Strength</span>
                    <span className={strengthScore >= 4 ? 'text-emerald-600' : strengthScore >= 2 ? 'text-amber-600' : 'text-rose-500'}>
                      {strengthScore >= 4 ? 'Strong Password' : strengthScore >= 2 ? 'Moderate' : 'Weak'}
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

            {/* Interactive Visual Role Selection Grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Account Role / Workstation Scope
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roleOptions.map((r) => {
                  const isSelected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-500/30'
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <r.icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <div className="mt-2">
                        <span className="block text-xs font-bold leading-tight">{r.label}</span>
                        <span className="block text-[9px] text-slate-500 truncate mt-0.5">{r.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {role === 'SUPER_ADMIN' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2 text-xs text-blue-800 font-medium items-start">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Super Admin privileges grant system-wide multi-tenant control across all medical modules.</span>
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
                  <span>Registration Successful! Redirecting to Sign In...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating workstation account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
