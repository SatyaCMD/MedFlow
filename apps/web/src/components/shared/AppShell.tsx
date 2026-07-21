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
  const [darkMode, setDarkMode] = useState(false);

  const menuItems = [
    { icon: Activity, label: 'Dashboard', path: '/' },
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
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans transition-colors duration-300`}>
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        } border-r lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-colors duration-300`}
      >
        {/* Brand header */}
        <div className={`flex items-center justify-between h-16 px-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              M
            </div>
            {!isCollapsed && (
              <span className={`font-bold text-base tracking-wider ${
                darkMode ? 'bg-gradient-to-r from-slate-100 to-blue-400 text-transparent bg-clip-text' : 'text-slate-800'
              }`}>
                MediCore360
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center w-6 h-6 rounded-md hover:${
              darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-600'
            } text-slate-400`}
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
              className={`flex items-center gap-4 px-3 py-2.5 rounded-xl hover:${
                darkMode ? 'bg-slate-800/60 text-slate-200' : 'bg-slate-50 text-blue-600'
              } ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              } transition-all duration-150 group`}
            >
              <item.icon className={`w-5 h-5 ${
                darkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600'
              } transition-colors`} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${
                darkMode ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-100'
              } border flex items-center justify-center font-bold text-sm`}>
                DR
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Dr. House</span>
                <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{userRole}</span>
              </div>
            </div>
          )}
          <button className={`text-slate-400 hover:text-red-500 w-8 h-8 rounded-xl flex items-center justify-center hover:${
            darkMode ? 'bg-slate-800' : 'bg-red-50'
          } transition-colors`}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar navigation header */}
        <header className={`h-16 flex items-center justify-between px-6 ${
          darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-slate-100'
        } border-b backdrop-blur-md sticky top-0 z-30 transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className={`lg:hidden p-1.5 rounded-lg hover:${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-600'} text-slate-400`}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global search component */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
            } border rounded-xl max-w-xs w-64 text-slate-400 hover:border-slate-300 transition-colors cursor-pointer`}>
              <Search className="w-4 h-4" />
              <span className="text-xs flex-1">Search dashboard (⌘K)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
              } border hover:border-slate-300 text-slate-400 hover:text-slate-600 transition-all`}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
            } border hover:border-slate-300 text-slate-400 hover:text-slate-600 relative transition-all`}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
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
