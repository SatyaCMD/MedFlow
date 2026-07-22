'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole = 'DOCTOR' }) => {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const currentRole = user?.role || userRole;

  const getMenuItems = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return [
          { icon: Activity, label: 'Clinical Dashboard', path: '/' },
          { icon: Users, label: 'My Patients', path: '/patients' },
          { icon: Calendar, label: 'Appointments Matrix', path: '/appointments' },
          { icon: FileText, label: 'EMR Records Vault', path: '/emr' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'PATIENT':
        return [
          { icon: Activity, label: 'Health Portal', path: '/' },
          { icon: Calendar, label: 'Book Visit', path: '/appointments' },
          { icon: FileText, label: 'My Reports & Prescriptions', path: '/emr' },
          { icon: CreditCard, label: 'Billing & Receipts', path: '/billing' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'NURSE':
        return [
          { icon: Activity, label: 'Nursing Dashboard', path: '/' },
          { icon: Users, label: 'Ward Patients', path: '/patients' },
          { icon: Calendar, label: 'Appointments', path: '/appointments' },
          { icon: FileText, label: 'Vitals & Charting', path: '/emr' },
        ];
      case 'PHARMACIST':
        return [
          { icon: Activity, label: 'Dispensary Station', path: '/' },
          { icon: FileText, label: 'Rx Queue', path: '/emr' },
          { icon: CreditCard, label: 'Pharmacy Sales', path: '/billing' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
      case 'SUPER_ADMIN':
      case 'HOSPITAL_ADMIN':
      default:
        return [
          { icon: Activity, label: 'Control Center', path: '/' },
          { icon: Users, label: 'Patients Directory', path: '/patients' },
          { icon: Calendar, label: 'Appointments Matrix', path: '/appointments' },
          { icon: CreditCard, label: 'Billing & Revenue', path: '/billing' },
          { icon: FileText, label: 'EMR Audit Vault', path: '/emr' },
          { icon: Settings, label: 'Hospital Settings', path: '/settings' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans transition-colors duration-300`}>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen sticky top-0 shrink-0 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        } border-r lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-colors duration-300 overflow-hidden`}
      >
        {/* Brand header */}
        <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <Logo size={34} />
            {!isCollapsed && (
              <span className={`font-black text-base tracking-tight ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}>
                MediCore<span className="text-blue-600">360</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:${
              darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
            } text-slate-500 transition-colors`}
          >
            <ChevronLeft className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto min-h-0">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-800 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-white'
                    : darkMode
                      ? 'text-slate-400 group-hover:text-blue-400'
                      : 'text-slate-500 group-hover:text-blue-600'
                } transition-colors`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${
                darkMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'
              } border flex items-center justify-center font-black text-xs`}>
                {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Workstation User'}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user?.role || userRole}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => logout()}
            title="Sign Out of Workstation"
            className={`text-slate-500 hover:text-rose-600 w-8 h-8 rounded-xl flex items-center justify-center hover:${
              darkMode ? 'bg-slate-800' : 'bg-rose-50'
            } transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar navigation header */}
        <header className={`h-16 flex items-center justify-between px-6 ${
          darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        } border-b backdrop-blur-md sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`lg:hidden p-1.5 rounded-lg hover:${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'} text-slate-600`}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global search component */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            } border rounded-xl max-w-xs w-64 hover:border-blue-400 transition-colors cursor-pointer`}>
              <Search className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold flex-1">Search dashboard (⌘K)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              } border hover:border-blue-400 text-slate-600 dark:text-slate-300 transition-all cursor-pointer`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            } border hover:border-blue-400 text-slate-600 dark:text-slate-300 relative transition-all cursor-pointer`}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Content body container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
