'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/shared/Logo';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const features = [
    'Strict Multi-Tenant Database Isolation',
    'Role-Based Cryptographic JWT Tokens',
    'Real-time EHR & EMR Audited Storage',
    'Secure Multi-Factor OTP Verification'
  ];

  useEffect(() => {
    const tokenFromUrl = searchParams.get('tempToken');
    const tokenFromSession = sessionStorage.getItem('tempToken');
    const activeToken = tokenFromUrl || tokenFromSession;

    if (activeToken) {
      setTempToken(activeToken);
    } else {
      setError('Session token missing. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken) {
      setError('Invalid session token. Please restart your login.');
      return;
    }
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/verify-otp', { tempToken, code });
      const { data } = response.data;

      setSuccess(true);
      
      // Complete login hook state setting
      login(data.accessToken, data.user);
      sessionStorage.removeItem('tempToken');

      // Small delay for success animation
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Verification failed. Please try again.';
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
              Verify Identity to Establish Session
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              MediCore 360 requires Multi-Factor Authentication to block unauthorized intrusions into patient EMR records.
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

      {/* RIGHT COLUMN: Interactive Verify Code Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm relative z-10"
        >
          <button
            onClick={() => router.push('/login')}
            className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>

          {/* Mobile Brand Title */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <Logo size={48} className="mb-3" />
            <h2 className="text-xl font-black text-slate-800 tracking-wider">MediCore 360</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-850 tracking-tight">Security Check</h2>
            <p className="text-sm text-slate-500 mt-1">Enter the 6-digit security code sent to your email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                One-Time Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full tracking-[1.5em] text-center pl-6 py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-300 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 font-semibold text-center"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600 font-semibold flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5 animate-pulse text-emerald-650" />
                  <span>MFA Verification Success! Loading Workspace...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success || !tempToken}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying security key...</span>
                </>
              ) : (
                <span>Confirm Workstation Access</span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-6 leading-relaxed">
            Didn&apos;t receive code? Please verify your local SMTP configuration, or verify network mail capture logs in development.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
