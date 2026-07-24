'use client';

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  ChevronLeft,
  Activity,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  Search,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Droplet,
  KeyRound,
  Siren,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { KycModal } from './KycModal';
import { EnterpriseCommandCenterModal } from './EnterpriseCommandCenterModal';
import { BloodBankModal } from './BloodBankModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { BookDoctorVisitModal } from './BookDoctorVisitModal';
import { PaymentModal } from './PaymentModal';

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole = 'DOCTOR' }) => {
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const currentRole = user?.role || userRole;
  const isSuperAdmin = currentRole === 'SUPER_ADMIN' || currentRole === 'HOSPITAL_ADMIN';

  // 1. 30-Minute Patient Session Timeout State (1800 Seconds)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800);

  // 2. KYC Verification & 5-Minute Hold Queue State (300 Seconds)
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [is44ModulesOpen, setIs44ModulesOpen] = useState(false);
  const [isBloodBankOpen, setIsBloodBankOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isBookVisitOpen, setIsBookVisitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({
    title: '',
    category: 'APPOINTMENT' as 'APPOINTMENT' | 'LAB_TEST' | 'HOSPITAL_SUPPLY',
    amount: '₹1,500',
    patientName: 'Alex Care',
  });
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [holdTimeLeft, setHoldTimeLeft] = useState(300);
  const [isApproved, setIsApproved] = useState(false);

  // Trigger KYC modal on first visit for non-super-admins
  useEffect(() => {
    if (!isSuperAdmin && !kycSubmitted && !isApproved) {
      const timer = setTimeout(() => setIsKycModalOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [isSuperAdmin, kycSubmitted, isApproved]);

  // Hold queue countdown timer
  useEffect(() => {
    if (!kycSubmitted || isApproved) return;
    const interval = setInterval(() => {
      setHoldTimeLeft((prev) => {
        if (prev <= 1) {
          setIsApproved(true);
          showToast({ title: 'KYC Verification Approved!', message: 'Your identity has been auto-verified.', type: 'success' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [kycSubmitted, isApproved, showToast]);

  // Stable refs for callbacks to prevent timer reset
  const logoutRef = useRef(logout);
  const showToastRef = useRef(showToast);

  useEffect(() => {
    logoutRef.current = logout;
    showToastRef.current = showToast;
  }, [logout, showToast]);

  // Session timeout countdown timer (Runs once continuously without reset)
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          if (logoutRef.current) logoutRef.current();
          if (showToastRef.current) {
            showToastRef.current({ title: 'Session Expired', message: '30-minute inactivity security window elapsed.', type: 'warning' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { label: 'Workstation', href: '/', icon: Activity },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Appointments', href: '/appointments', icon: Calendar },
    { label: 'Ambulance & Dispatch', href: '/ambulance', icon: Siren },
    { label: 'Blood Bank', href: '/blood-bank', icon: Droplet },
    { label: 'EMR / EHR Vault', href: '/emr', icon: FileText },
    { label: 'Billing & Finance', href: '/billing', icon: CreditCard },
    { label: 'System Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* 44 Enterprise Modules Command Center Modal */}
      <EnterpriseCommandCenterModal
        isOpen={is44ModulesOpen}
        onClose={() => setIs44ModulesOpen(false)}
      />

      {/* Blood Bank Exchange Command Modal */}
      <BloodBankModal
        isOpen={isBloodBankOpen}
        onClose={() => setIsBloodBankOpen(false)}
      />

      {/* Forgot Password OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {/* Book Doctor Visit Modal */}
      <BookDoctorVisitModal
        isOpen={isBookVisitOpen}
        onClose={() => setIsBookVisitOpen(false)}
        onProceedToPayment={(details) => {
          setIsBookVisitOpen(false);
          setPaymentTarget({
            title: `Doctor Consultation — ${details.doctor.name} (${details.department})`,
            category: 'APPOINTMENT',
            amount: details.amount,
            patientName: details.patientName,
          });
          setIsPaymentOpen(true);
        }}
      />

      {/* Payment Gateway Sandbox Checkout Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        itemTitle={paymentTarget.title}
        itemCategory={paymentTarget.category}
        amount={paymentTarget.amount}
        patientName={paymentTarget.patientName}
        onPaymentSuccess={() => {
          showToast({ title: 'Appointment Booked!', message: 'Consultation session verified & scheduled.', type: 'success' });
        }}
      />

      {/* KYC Document Verification Modal */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        userRole={currentRole}
        onKycSubmitted={() => {
          setKycSubmitted(true);
          setIsKycModalOpen(false);
        }}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-between">
            <Logo textVisible={!isCollapsed} />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Card */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {!isCollapsed && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-black text-xs text-slate-900 block truncate">{user?.email || 'user@medflow.org'}</span>
                <span className="text-[10px] font-extrabold uppercase text-blue-600 block">{currentRole}</span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIs44ModulesOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">44 Enterprise Modules Hub</span>
            </button>
          </div>

          {/* Topbar Right Badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBloodBankOpen(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span className="hidden sm:inline">Blood Bank Exchange</span>
            </button>

            <button
              onClick={() => setIsForgotPasswordOpen(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Reset Password OTP</span>
            </button>

            {/* 30-Minute Patient Countdown Badge */}
            {currentRole === 'PATIENT' && (
              <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Session: {formatTimer(sessionTimeLeft)}</span>
              </div>
            )}

            {/* 5-Minute Hold Queue Badge */}
            {!isSuperAdmin && kycSubmitted && !isApproved && (
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>KYC Review (Hold: {formatTimer(holdTimeLeft)})</span>
              </div>
            )}

            {!isSuperAdmin && isApproved && (
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>KYC Approved</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
};
