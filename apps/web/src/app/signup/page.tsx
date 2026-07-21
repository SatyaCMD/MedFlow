'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { api } from '../../lib/axios';
import { Logo } from '../../components/shared/Logo';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
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

  const roles = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Doctor / Physician' },
    { value: 'NURSE', label: 'Nurse / Clinical Staff' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
    { value: 'HOSPITAL_ADMIN', label: 'Hospital Administrator' },
    { value: 'SUPER_ADMIN', label: 'Super Administrator' },
  ];

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
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed. Please check the inputs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Deep Gradient Info Sidebar (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-800 relative items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]" />

        <div className="max-w-md w-full relative z-10 space-y-12">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
              <Logo size={44} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white">MEDICORE 360</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">EHMS ENTERPRISE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Create Your Clinical Workstation
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Register an account with your hospital mapping to access secure EMR data entries and scheduling boards.
            </p>
          </div>

          {/* Feature List */}
          <ul className="space-y-4 pt-4">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex items-center gap-3 text-sm font-semibold text-blue-50"
              >
                <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            <span>© {new Date().getFullYear()} MediCore 360 Inc.</span>
            <span>v1.0.0 (SHA-256)</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm relative z-10"
        >
          {/* Mobile Brand Title */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Logo size={48} className="mb-3" />
            <h2 className="text-xl font-black text-slate-800 tracking-wider">MediCore 360</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-850 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your details to register as a hospital workstation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Gregory"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="House"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@medicore360.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password (min 10 chars)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-650 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Account Role / Scope
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
              >
                {roles.map((r, idx) => (
                  <option key={idx} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {role === 'SUPER_ADMIN' && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex gap-2 text-xs text-blue-700 font-semibold items-start leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Note: System rules dictate that only one Super Admin account can exist globally in the database.</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 font-semibold"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600 font-semibold text-center"
                >
                  Registration Successful! Directing to Login...
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering workstation...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
