'use client';

import React, { useState } from 'react';
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

interface AppShellProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, userRole = 'DOCTOR' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const menuItems = [
    { icon: Activity, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: CreditCard, label: 'Billing & Invoices', path: '/billing' },
    { icon: FileText, label: 'EMR Records', path: '/emr' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <div className={`min-h-screen flex bg-slate-950 text-slate-100 font-sans`}>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold">
              M
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-slate-100 to-blue-400 bg-clip-text text-transparent">
                MediCore360
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <a
              key={idx}
              href={item.path}
              className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-all duration-150 group"
            >
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                DR
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">Dr. House</span>
                <span className="text-[10px] text-slate-500">{userRole}</span>
              </div>
            </div>
          )}
          <button className="text-slate-400 hover:text-red-400 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-800">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar navigation header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/40 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global search component */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl max-w-xs w-64 text-slate-500 hover:border-slate-700 transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
              <span className="text-xs flex-1">Search dashboard (⌘K)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 relative transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
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
