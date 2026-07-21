'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-[#080b11] text-slate-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <button
          onClick={() => router.push('/login')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 text-slate-100 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Security Check</h2>
          <p className="mt-2 text-sm text-slate-400 text-center px-4">
            We sent a 6-digit one-time code to your registered email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0 0 0 0 0 0"
              className="w-full tracking-[1.5em] text-center pl-6 py-4 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-800 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/80 transition-all duration-300"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-red-950/30 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium text-center"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-xs text-emerald-400 font-medium flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-5 h-5 animate-pulse text-emerald-400" />
                <span>Verification Successful! Access Granted.</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || success || !tempToken}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-950/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Security Code...</span>
              </>
            ) : (
              <span>Confirm Identity</span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-800/60 pt-6">
          Didn&apos;t get a code? Ensure host SMTP settings are running, or inspect development mail capture interface.
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#080b11] text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
