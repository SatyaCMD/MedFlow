'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Mail, Lock, CheckCircle2, Sparkles, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/axios';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

function resolveValidEmail(input: string): string {
  if (!input) return 'anup.singh@medflow.com';
  const clean = input.trim();
  if (clean.includes('@')) return clean;

  const nameLower = clean.replace(/^(dr\.|dr|nurse)\s+/i, '').trim().toLowerCase();

  if (nameLower.includes('anup')) return 'anup.singh@medflow.com';
  if (nameLower.includes('devendra')) return 'devendra.roy@medflow.com';
  if (nameLower.includes('priya')) return 'priya.sharma@medflow.com';
  if (nameLower.includes('rajesh')) return 'rajesh.patel@medflow.com';
  if (nameLower.includes('siddharth')) return 'siddharth.joshi@medflow.com';
  if (nameLower.includes('vikram')) return 'vikram.malhotra@medflow.com';
  if (nameLower.includes('sunita')) return 'sunita.rao@medflow.com';
  if (nameLower.includes('tarun')) return 'tarun.gupta@medflow.com';
  if (nameLower.includes('pharmacist')) return 'pharmacist@medflow.com';
  if (nameLower.includes('blood')) return 'bloodbank@medflow.com';
  if (nameLower.includes('admin') || nameLower.includes('super')) return 'superadmin54@gmail.com';

  return `${nameLower.replace(/\s+/g, '.')}@medflow.com`;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail = '',
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'DIRECT_RESET' | 'OTP_RESET'>('DIRECT_RESET');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState(() => resolveValidEmail(currentUserEmail));
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(resolveValidEmail(currentUserEmail));
    }
  }, [isOpen, currentUserEmail]);

  // Password Visibility Toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handler for Direct Reset using Old Password
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ title: 'Email Required', message: 'Please enter your registered account email.', type: 'error' });
      return;
    }
    if (!oldPassword) {
      showToast({ title: 'Old Password Required', message: 'Please enter your current/old password.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ title: 'Password Too Short', message: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: 'Password Mismatch', message: 'Retyped new password does not match.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        oldPassword,
        newPassword,
      });

      if (response.data?.success) {
        showToast({
          title: 'Password Updated Successfully! 🔒',
          message: 'Your password has been updated in the system. A confirmation email has been sent.',
          type: 'success',
        });
        handleClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Incorrect old password or reset failed.';
      showToast({
        title: 'Reset Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for OTP Email Dispatch
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data?.success) {
        showToast({
          title: 'OTP Dispatched to Email! ✉️',
          message: 'Random 6-digit verification code sent to your email address.',
          type: 'success',
        });
        setStep(2);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to dispatch OTP code.';
      showToast({ title: 'Request Failed', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showToast({ title: 'Invalid OTP', message: 'Please enter the 6-digit OTP code received in your email.', type: 'error' });
      return;
    }
    setStep(3);
  };

  const handleOtpResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast({ title: 'Password Too Short', message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ title: 'Password Mismatch', message: 'Retyped passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        code: otpCode,
        newPassword,
      });

      if (response.data?.success) {
        showToast({
          title: 'Password Reset Successfully! 🔒',
          message: 'Account unlocked & password updated. Confirmation email dispatched.',
          type: 'success',
        });
        handleClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Invalid 6-digit OTP code or reset failed.';
      showToast({ title: 'Reset Failed', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 leading-tight">Workstation Password Assistant</h3>
              <p className="text-xs font-semibold text-slate-500">Secure Credential Reset & Verification</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMode('DIRECT_RESET')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'DIRECT_RESET'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Old Password Reset
          </button>
          <button
            type="button"
            onClick={() => setMode('OTP_RESET')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'OTP_RESET'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Email OTP Recovery
          </button>
        </div>

        {/* MODE 1: Direct Reset using Old Password */}
        {mode === 'DIRECT_RESET' && (
          <form onSubmit={handleDirectPasswordReset} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@medicore360.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Field 1: Old Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Current / Old Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 2: New Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: Retype / Confirm New Password */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                Retype New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Updating Password...' : 'Reset Password & Send Email Notice'}</span>
            </button>
          </form>
        )}

        {/* MODE 2: Forgot Password OTP Recovery */}
        {mode === 'OTP_RESET' && (
          <div className="space-y-4">
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Registered Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@medicore360.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Dispatching OTP...' : 'Send 6-Digit Verification OTP Code'}</span>
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Enter 6-Digit Email OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-center tracking-[8px] font-mono text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP Code & Proceed</span>
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleOtpResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                    Retype New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retype new password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Saving New Password...' : 'Save New Password & Dispatch Email'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
