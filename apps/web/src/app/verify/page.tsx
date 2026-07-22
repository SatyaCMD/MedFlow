'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Inbox,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/shared/Logo';
import { AuthSidebar } from '../../components/shared/AuthSidebar';

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [tempToken, setTempToken] = useState('');
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Debug OTP state
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [fetchingDebug, setFetchingDebug] = useState(false);

  // Resend timer state
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Mailpit Dev Inbox Peek state
  const [showMailpitModal, setShowMailpitModal] = useState(false);
  const [mailpitOtp, setMailpitOtp] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Fetch active debug OTP code from backend API
  const fetchBackendDebugOtp = async (token: string) => {
    if (!token) return;
    setFetchingDebug(true);
    try {
      const res = await api.get(`/auth/debug-otp?tempToken=${token}`);
      if (res.data?.data?.code) {
        setDebugOtp(res.data.data.code);
      }
    } catch {
      // Fallback
    } finally {
      setFetchingDebug(false);
    }
  };

  useEffect(() => {
    const tokenFromUrl = searchParams.get('tempToken');
    const tokenFromSession = sessionStorage.getItem('tempToken');
    const activeToken = tokenFromUrl || tokenFromSession;

    if (activeToken) {
      setTempToken(activeToken);
      fetchBackendDebugOtp(activeToken);
    } else {
      setError('Session token missing. Please log in again.');
    }
  }, [searchParams]);

  // Resend Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle individual PIN box change
  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (error) setError(null);

    // Auto-focus next input box
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Handle Paste event (splits 6 digits across boxes)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setPin(digits);
      inputRefs[5].current?.focus();
      if (error) setError(null);
    }
  };

  const handleAutoFill = (code: string) => {
    if (code.length === 6) {
      setPin(code.split(''));
      if (error) setError(null);
    }
  };

  const handleResendOtp = () => {
    setResendTimer(60);
    setCanResend(false);
    setError(null);
    if (tempToken) {
      fetchBackendDebugOtp(tempToken);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = pin.join('');

    if (!tempToken) {
      setError('Invalid session token. Please restart your login.');
      return;
    }
    if (code.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/verify-otp', { tempToken, code });
      const { data } = response.data;

      setSuccess(true);
      login(data.accessToken, data.user);
      sessionStorage.removeItem('tempToken');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Verification failed. Please check the OTP code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* LEFT COLUMN: World-Class Interactive Telemetry Sidebar */}
      <AuthSidebar
        title="Multi-Factor Security Checkpoint"
        subtitle="To safeguard patient EMR records and multi-tenant access, verify the 6-digit one-time code generated for your workstation session."
      />

      {/* RIGHT COLUMN: Interactive Pin Verification Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl relative z-10 space-y-6"
        >
          <button
            onClick={() => router.push('/login')}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>

          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center mb-4 lg:hidden" onClick={() => router.push('/')}>
            <Logo size={48} className="mb-2" />
            <h2 className="text-xl font-black text-slate-900 tracking-wider">MediCore 360</h2>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Check</h2>
              <span className="px-2.5 py-1 text-[10px] font-black text-blue-700 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-wider">
                OTP Auth
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Enter the 6-digit one-time code sent to your registered email address.
            </p>
          </div>

          {/* PROMINENT 1-CLICK DEBUG OTP BANNER */}
          <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border border-blue-200/80 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                  DEV DEBUG OTP ASSISTANT
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                1-CLICK FILLS
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Session Code</span>
                <span className="block text-2xl font-black text-blue-600 tracking-widest tabular-nums">
                  {debugOtp || '123456'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAutoFill(debugOtp || '123456')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Auto-Fill Code</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => handleAutoFill('123456')}
                className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
              >
                Use Master Test PIN (123456)
              </button>
              <button
                type="button"
                onClick={() => setShowMailpitModal(true)}
                className="text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5 text-blue-600" />
                <span>Inspect Mailpit</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 Individual PIN Digit Input Boxes */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-3 text-center">
                Enter 6-Digit Code Below
              </label>
              <div className="flex justify-between items-center gap-2">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-14 text-center font-black text-xl bg-white border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs transition-all ${
                      digit ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-slate-200 text-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Resend Code Control */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                disabled={!canResend}
                onClick={handleResendOtp}
                className={`font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  canResend ? 'text-blue-600 hover:underline' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin' : ''}`} />
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold text-center flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span>MFA Verification Passed! Accessing Workstation...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success || !tempToken}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating session token...</span>
                </>
              ) : (
                <span>Confirm Workstation Session</span>
              )}
            </motion.button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium leading-relaxed">
            Need help? Make sure your local Mailpit service is active on port 8026 in development.
          </div>
        </motion.div>
      </div>

      {/* Local Mailpit Peek Modal Drawer */}
      <AnimatePresence>
        {showMailpitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  Local Mailpit Inbox Inspector
                </h3>
                <button
                  onClick={() => setShowMailpitModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {mailpitOtp ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <span className="block text-xs font-bold text-emerald-800">OTP Code Found in Inbox</span>
                    <span className="block text-2xl font-black text-emerald-600 tracking-widest my-1">{mailpitOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleAutoFill(mailpitOtp);
                      setShowMailpitModal(false);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill {mailpitOtp}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    Mailpit inbox inspector active. You can also click the Debug OTP auto-fill button directly above!
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowMailpitModal(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
