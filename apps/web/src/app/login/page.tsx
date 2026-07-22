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
  Shield,
  Key,
  UserCheck,
  Stethoscope,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Logo } from '../../components/shared/Logo';
import { AuthSidebar } from '../../components/shared/AuthSidebar';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const demoAccounts = [
    { role: 'Doctor', email: 'doctor@medicore360.com', pass: 'SecurePassword123!', icon: Stethoscope },
    { role: 'Super Admin', email: 'test_admin@medicore360.com', pass: 'SecurePassword123!', icon: Key },
    { role: 'Patient', email: 'patient@medicore360.com', pass: 'SecurePassword123!', icon: UserCheck }
  ];

  const features = [
    'Strict Multi-Tenant Database Isolation',
    'Role-Based Cryptographic JWT Tokens',
    'Real-time EHR & EMR Audited Storage',
    'Secure Multi-Factor OTP Verification'
  ];

  const handleFillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
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
      
      {/* LEFT COLUMN: Deep Gradient Info & Telemetry Sidebar */}
      <AuthSidebar
        title="Clinical Workstation Portal"
        subtitle="Verify your credentials to launch multi-tenant EMR records, patient appointment queues, and prescription tools."
      />

      {/* RIGHT COLUMN: Interactive Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10 space-y-6"
        >
          {/* Mobile Brand Title */}
          <div className="flex flex-col items-center mb-6 lg:hidden" onClick={() => router.push('/')}>
            <Logo size={48} className="mb-2" />
            <h2 className="text-xl font-black text-slate-900 tracking-wider">MediCore 360</h2>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">EHMS Enterprise</span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Platform</h2>
              <span className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-full border border-blue-100">
                v1.0 Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Enter credentials to verify your medical workstation</p>
          </div>

          {/* Quick Demo Accounts Helper Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Fill:
            </span>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFillDemo(acc)}
                  className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                >
                  <acc.icon className="w-3 h-3 text-blue-500" />
                  <span>{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
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
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                <span>Remember this workstation</span>
              </label>
            </div>

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
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Create Workstation Account
            </button>
          </div>
        </motion.div>
      </div>

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
                  Password Recovery
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For security reasons, password resets are processed via your hospital System Administrator or multi-factor verification token.
              </p>
              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-700 font-medium">
                Demo Tip: Use the 1-click demo fill buttons to test authentication instantly.
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
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
