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
  Stethoscope,
  FlaskConical,
  Pill,
  HeartPulse,
  Building2,
  ShoppingBag,
  Home
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
import { PharmacyPurchaseModal } from './PharmacyPurchaseModal';

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

  // Modals state
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [is44ModulesOpen, setIs44ModulesOpen] = useState(false);
  const [isBloodBankOpen, setIsBloodBankOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isBookVisitOpen, setIsBookVisitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);

  const [paymentTarget, setPaymentTarget] = useState({
    title: '',
    category: 'APPOINTMENT' as 'APPOINTMENT' | 'LAB_TEST' | 'BLOOD_BANK' | 'PHARMACY' | 'HOSPITAL_SUPPLY',
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

  // Session timeout countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          if (logoutRef.current) logoutRef.current();
          if (showToastRef.current) {
            showToastRef.current({ title: 'Session Expired', message: '30-minute security window elapsed.', type: 'warning' });
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

  // Dynamic Role-Specific Side Panel Navigation Config
  const getNavConfigForRole = (role: string) => {
    switch (role) {
      case 'PATIENT':
        return {
          badge: 'PATIENT PORTAL NAV',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          items: [
            { label: 'My Health Portal', href: '/', icon: Home },
            { label: 'My Consultations', href: '/appointments', icon: Calendar },
            { label: 'My Medical Records & Rx', href: '/emr', icon: FileText },
            { label: 'E-Pharmacy Store', href: '#pharmacy', icon: Pill, onClick: () => setIsPharmacyOpen(true) },
            { label: 'Blood Bank Reserve', href: '#bloodbank', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Live Ambulance GPS', href: '/ambulance', icon: Siren },
            { label: 'My Billing & Invoices', href: '/billing', icon: CreditCard },
            { label: 'Account Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'DOCTOR':
        return {
          badge: 'PHYSICIAN WORKSTATION NAV',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          items: [
            { label: 'OPD Clinical Workstation', href: '/', icon: Stethoscope },
            { label: 'My Patient Roster', href: '/patients', icon: Users },
            { label: 'Appointment Schedule', href: '/appointments', icon: Calendar },
            { label: 'Signed EMR Vault', href: '/emr', icon: FileText },
            { label: 'Blood Bank Transfusions', href: '#bloodbank', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Emergency Alerts', href: '/ambulance', icon: Siren },
            { label: 'Clinical Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'NURSE':
        return {
          badge: 'NURSING & VITALS NAV',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          items: [
            { label: 'Inpatient Nursing Station', href: '/', icon: HeartPulse },
            { label: 'Inpatient Ward Patients', href: '/patients', icon: Users },
            { label: 'Ward Consultations', href: '/appointments', icon: Calendar },
            { label: 'Ward Supplies E-Store', href: '#pharmacy', icon: ShoppingBag, onClick: () => setIsPharmacyOpen(true) },
            { label: 'Blood Bank Reserve', href: '#bloodbank', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Emergency Response', href: '/ambulance', icon: Siren },
            { label: 'Ward Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'LAB_TECHNICIAN':
        return {
          badge: 'PATHOLOGY LAB NAV',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          items: [
            { label: 'Diagnostic Lab Queue', href: '/', icon: FlaskConical },
            { label: 'Patient Specimen Search', href: '/patients', icon: Users },
            { label: 'Diagnostic Orders', href: '/appointments', icon: Calendar },
            { label: 'Pathology Reports Vault', href: '/emr', icon: FileText },
            { label: 'Blood Bank Screening', href: '#bloodbank', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Lab Supplies E-Store', href: '#pharmacy', icon: Building2, onClick: () => setIsPharmacyOpen(true) },
            { label: 'Lab Workstation Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'PHARMACIST':
        return {
          badge: 'PHARMACY DISPENSARY NAV',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          items: [
            { label: 'Pharmacy Stock Master', href: '/', icon: Pill },
            { label: 'Patient Prescriptions', href: '/patients', icon: Users },
            { label: 'Dispensary Orders', href: '/appointments', icon: Calendar },
            { label: 'Prescription Audit Vault', href: '/emr', icon: FileText },
            { label: 'Dispensary Billing & GST', href: '/billing', icon: CreditCard },
            { label: 'Pharmacy Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'SUPER_ADMIN':
      case 'HOSPITAL_ADMIN':
      default:
        return {
          badge: 'COMMAND CENTER NAV',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          items: [
            { label: 'Enterprise Command Center', href: '/', icon: LayoutGrid },
            { label: 'Hospital Staff & Users', href: '/patients', icon: Users },
            { label: 'Global Consultations', href: '/appointments', icon: Calendar },
            { label: 'Ambulance GPS Fleet', href: '/ambulance', icon: Siren },
            { label: 'Blood Bank Operations', href: '#bloodbank', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Global EMR Audit Vault', href: '/emr', icon: FileText },
            { label: 'Billing & Financial Claims', href: '/billing', icon: CreditCard },
            { label: 'System Security & Settings', href: '/settings', icon: Settings },
          ],
        };
    }
  };

  const navConfig = getNavConfigForRole(currentRole);

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

      {/* E-Pharmacy & Medical Supplies Purchase Modal */}
      <PharmacyPurchaseModal
        isOpen={isPharmacyOpen}
        onClose={() => setIsPharmacyOpen(false)}
        patientName={user ? `${user.firstName} ${user.lastName}` : 'Alex Care'}
        userRole={currentRole}
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
        userRole={currentRole}
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
        <div className="space-y-5 p-4">
          <div className="flex items-center justify-between">
            <Logo textVisible={!isCollapsed} />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Role-Specific Side Panel Badge */}
          {!isCollapsed && (
            <div className="px-1">
              <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase border tracking-wider block text-center ${navConfig.badgeBg}`}>
                {navConfig.badge}
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {navConfig.items.map((item) => {
              const isActive = pathname === item.href && !item.onClick;
              const Icon = item.icon;

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-blue-600" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href + item.label}
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

          {/* Session Expiry Ribbon */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Session
            </span>
            <span className="font-mono font-bold text-slate-700">{formatTimer(sessionTimeLeft)}</span>
          </div>
        </div>
      </aside>

      {/* Main Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Command Center Module Launcher */}
            <button
              onClick={() => setIs44ModulesOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">44 Enterprise Modules</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-xs">
                {user?.firstName ? user.firstName[0] : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-black text-xs text-slate-900 block leading-tight">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-500 block leading-tight">
                  {currentRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
