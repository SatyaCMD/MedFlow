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
  const { logout, user, loading } = useAuth();
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

  // Interactive Login & Logout Popup States
  const [showLoginWelcomeModal, setShowLoginWelcomeModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user && sessionStorage.getItem('medflow_just_logged_in') === 'true') {
      sessionStorage.removeItem('medflow_just_logged_in');
      setShowLoginWelcomeModal(true);
    }
  }, [user]);

  // Trigger KYC modal ONLY on first visit for non-super-admins after auth loading completes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (loading) return; // Do NOT trigger while auth is loading
    if (!user) return; // Do NOT trigger if unauthenticated

    const userEmail = user.email;
    const userId = user.id;

    const emailDone = userEmail ? localStorage.getItem(`medflow_kyc_completed_${userEmail}`) === 'true' : false;
    const idDone = userId ? localStorage.getItem(`medflow_kyc_completed_${userId}`) === 'true' : false;
    const isAlreadyCompleted = emailDone || idDone;

    if (!isSuperAdmin && !isAlreadyCompleted && !kycSubmitted && !isApproved) {
      const timer = setTimeout(() => setIsKycModalOpen(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setIsKycModalOpen(false);
    }
  }, [user, loading, isSuperAdmin, kycSubmitted, isApproved]);

  const handleKycSubmitted = () => {
    setKycSubmitted(true);
    setIsApproved(true);
    setIsKycModalOpen(false);
    if (typeof window !== 'undefined' && user) {
      if (user.email) localStorage.setItem(`medflow_kyc_completed_${user.email}`, 'true');
      if (user.id) localStorage.setItem(`medflow_kyc_completed_${user.id}`, 'true');
    }
  };

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

  // Session timeout countdown timer with persistent sessionStorage timestamp
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const activeUserId = user?.id || user?.email || 'guest';
    const sessionKey = `medflow_session_expiry_${activeUserId}`;
    let expiryStr = sessionStorage.getItem(sessionKey);

    if (!expiryStr) {
      const newExpiry = Date.now() + 1800 * 1000; // 30 minutes (1800s)
      sessionStorage.setItem(sessionKey, newExpiry.toString());
      expiryStr = newExpiry.toString();
    }

    const expiryTime = parseInt(expiryStr, 10);

    const updateTimer = () => {
      const now = Date.now();
      const remainingSecs = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSessionTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        sessionStorage.removeItem(sessionKey);
        if (logoutRef.current) logoutRef.current();
        if (showToastRef.current) {
          showToastRef.current({ title: 'Session Expired', message: '30-minute security window elapsed.', type: 'warning' });
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

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
            { label: 'OPD Consultations & Prescribe Workstation', href: '/', icon: Stethoscope },
            { label: 'My Patient Roster', href: '/patients', icon: Users },
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
      case 'BLOOD_BANK':
        return {
          badge: 'BLOOD BANK CONTROL NAV',
          badgeBg: 'bg-red-100 text-red-800 border-red-300',
          items: [
            { label: 'Blood Reserve Inventory', href: '/', icon: Droplet, onClick: () => setIsBloodBankOpen(true) },
            { label: 'Donor Directory', href: '/patients', icon: Users },
            { label: 'Transfusion Orders', href: '/appointments', icon: Calendar },
            { label: 'Cross-Match Reports', href: '/emr', icon: FileText },
            { label: 'Emergency Billing', href: '/billing', icon: CreditCard },
            { label: 'Blood Bank Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'AMBULANCE_ADMIN':
        return {
          badge: 'AMBULANCE FLEET COMMAND NAV',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          items: [
            { label: 'Ambulance Fleet Dashboard', href: '/', icon: Siren },
            { label: 'Live GPS Dispatch Tracker', href: '/ambulance', icon: Siren },
            { label: 'Emergency Patients', href: '/patients', icon: Users },
            { label: 'Fleet Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'HOSPITAL_ADMIN':
        return {
          badge: 'HOSPITAL OPERATIONS NAV',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          items: [
            { label: 'Hospital Command Dashboard', href: '/', icon: Building2 },
            { label: 'Staff Roster Directory', href: '/patients', icon: Users },
            { label: 'Department Consultations', href: '/appointments', icon: Calendar },
            { label: 'Emergency & Ambulance GPS', href: '/ambulance', icon: Siren },
            { label: 'EMR Audit Vault', href: '/emr', icon: FileText },
            { label: 'Financial Claims & GST', href: '/billing', icon: CreditCard },
            { label: 'Hospital Settings', href: '/settings', icon: Settings },
          ],
        };
      case 'SUPER_ADMIN':
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
    <div className="h-screen bg-slate-50 flex overflow-hidden">
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
        onClose={() => {
          setIsKycModalOpen(false);
          if (typeof window !== 'undefined' && user) {
            if (user.email) localStorage.setItem(`medflow_kyc_completed_${user.email}`, 'true');
            if (user.id) localStorage.setItem(`medflow_kyc_completed_${user.id}`, 'true');
          }
        }}
        userRole={currentRole}
        userName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Patient User'}
        userId={user?.id}
        userEmail={user?.email}
        onKycSubmitted={handleKycSubmitted}
      />

      {/* SUCCESSFUL LOGIN WELCOME POPUP MODAL (LIGHT THEME) */}
      <AnimatePresence>
        {showLoginWelcomeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 text-center space-y-5 text-slate-900 relative"
            >
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/10 animate-pulse">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-emerald-200 inline-block">
                  Authentication Verified
                </span>
                <h3 className="text-xl font-black tracking-tight text-slate-900">
                  Welcome Back, {user?.firstName || 'User'} {user?.lastName || ''}!
                </h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Your <span className="text-blue-600 uppercase font-extrabold">{currentRole}</span> workstation session is active. 256-bit HIPAA KMS Encryption & RBAC Scope Enforced.
                </p>
              </div>
              <button
                onClick={() => setShowLoginWelcomeModal(false)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
              >
                Launch Workstation →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL (LIGHT THEME) */}
      <AnimatePresence>
        {showLogoutConfirmModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 sm:p-8 text-center space-y-6 text-slate-900 relative"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-md shadow-rose-500/10">
                <LogOut className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Confirm Workstation Logout</h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  Are you sure you want to end your active workstation session? All active telemetry logs and prescript records have been synchronized.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirmModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel & Stay Logged In
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirmModal(false);
                    logout();
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        className={`fixed lg:sticky top-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between overflow-y-auto h-screen shrink-0 select-none transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="space-y-3 p-3 sm:p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between shrink-0 pb-2 border-b border-slate-100/80 min-w-0">
            <Logo size={28} textVisible={!isCollapsed} showTagline={false} />
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 text-slate-500 hover:text-white border border-slate-200/90 shadow-2xs transition-all duration-200 cursor-pointer shrink-0 ml-1 group"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180 text-blue-600 group-hover:text-white' : ''}`} />
            </button>
          </div>

          {/* Role-Specific Side Panel Badge */}
          {!isCollapsed && (
            <div className="px-1 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase border tracking-wider block text-center ${navConfig.badgeBg}`}>
                {navConfig.badge}
              </span>
            </div>
          )}

          <nav className="space-y-1 overflow-hidden flex-1 justify-start">
            {navConfig.items.map((item) => {
              const isActive = pathname === item.href && !item.onClick;
              const Icon = item.icon;

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-blue-600" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Card */}
        <div className="p-3 sm:p-4 border-t border-slate-100 space-y-2.5 shrink-0">
          {!isCollapsed && (() => {
            const rawName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'User';
            const displayName = currentRole === 'DOCTOR' && !rawName.toLowerCase().startsWith('dr') ? `Dr. ${rawName}` : rawName;
            const roleLabel = currentRole.replace(/_/g, ' ');

            return (
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1" title={user?.email || ''}>
                  <span className="font-black text-xs text-slate-900 block truncate leading-tight">{displayName}</span>
                  <span className="text-[10px] font-extrabold uppercase text-blue-600 block truncate leading-tight tracking-wider mt-0.5">{roleLabel}</span>
                </div>
                <button
                  onClick={() => setShowLogoutConfirmModal(true)}
                  title="Logout Workstation"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            );
          })()}

          {/* Session Expiry Ribbon */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Session
            </span>
            <span className="font-mono font-bold text-slate-700 tabular-nums">{formatTimer(sessionTimeLeft)}</span>
          </div>
        </div>
      </aside>

      {/* Main Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Command Center Module Launcher (Admin Only) */}
            {isSuperAdmin && (
              <button
                onClick={() => setIs44ModulesOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">44 Modules</span>
              </button>
            )}
          </div>

          {/* INTERACTIVE ANIMATED SCROLLABLE TICKER IN NAVBAR (RIGHT TO LEFT MARQUEE) */}
          <div className="flex-1 overflow-hidden relative mx-2 sm:mx-4 h-9 flex items-center bg-slate-50 border border-slate-200/80 rounded-full px-3 shadow-2xs max-w-2xl">
            {/* Left & Right Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            {(() => {
              const rawName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'User';
              const displayName = currentRole === 'DOCTOR' && !rawName.toLowerCase().startsWith('dr') ? `Dr. ${rawName}` : rawName;
              const roleLabel = currentRole.replace(/_/g, ' ');
              const hour = new Date().getHours();
              const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

              return (
                <motion.div
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="whitespace-nowrap flex items-center gap-6 text-xs font-bold text-slate-700 select-none"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">👋</span>
                    <span>{greeting}, <strong className="text-blue-600 font-black">{displayName}</strong>! Welcome to your workstation.</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {roleLabel} SESSION ACTIVE
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-semibold">MediCore 360 Enterprise Healthcare System</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-extrabold text-[11px]">Secured Workstation</span>
                </motion.div>
              );
            })()}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* User Profile Info (No S Logo Avatar Icon) */}
            {(() => {
              const rawName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'User';
              const displayName = currentRole === 'DOCTOR' && !rawName.toLowerCase().startsWith('dr') ? `Dr. ${rawName}` : rawName;
              const roleLabel = currentRole.replace(/_/g, ' ');

              return (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200" title={user?.email || ''}>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                        {displayName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Session Active" />
                    </div>
                    <span className="text-[9.5px] font-extrabold uppercase text-blue-600 block leading-tight tracking-wider mt-0.5">
                      {roleLabel}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Pharmacy Purchase Modal */}
        <PharmacyPurchaseModal
          isOpen={isPharmacyOpen}
          onClose={() => setIsPharmacyOpen(false)}
          patientName={user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Patient'}
          userRole={currentRole}
          patientEmail={user?.email || 'patient@medflow.com'}
        />
      </div>
    </div>
  );
};
