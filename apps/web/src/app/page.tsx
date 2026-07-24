'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Layers,
  Activity,
  Database,
  Key,
  ArrowRight,
  Calendar,
  DollarSign,
  ClipboardList,
  Heart,
  Sparkles,
  Lock,
  Cpu,
  CheckCircle2,
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '../components/shared/AppShell';
import { StatCard } from '../components/shared/StatCard';
import { DataTable } from '../components/shared/DataTable';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { Logo } from '../components/shared/Logo';
import { SuperAdminDashboard } from '../components/dashboards/SuperAdminDashboard';
import { DoctorDashboard } from '../components/dashboards/DoctorDashboard';
import { NurseDashboard } from '../components/dashboards/NurseDashboard';
import { PharmacistDashboard } from '../components/dashboards/PharmacistDashboard';
import { PatientDashboard } from '../components/dashboards/PatientDashboard';
import { LabTechnicianDashboard } from '../components/dashboards/LabTechnicianDashboard';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'emr' | 'patients' | 'telemetry' | 'security'>('emr');

  const landingCards = [
    { icon: Activity, title: 'Clean Architecture', desc: 'Strict controllers, services, repositories boundary model enforcing separation of concerns.', tag: 'Clean Code' },
    { icon: Database, title: 'Multi-Tenant Scope', desc: 'Dynamically isolated records based on host mappings and tenant ID cryptographic headers.', tag: 'Isolated Data' },
    { icon: Key, title: 'Role-Based Access', desc: 'Secure custom matrix checks at compile and runtime for 8 granular clinical roles.', tag: 'RBAC Security' },
    { icon: Users, title: '8 Dashboards', desc: 'Custom workspace views tailored for Physicians, Nurses, Pharmacists, Admins & Patients.', tag: 'Tailored Views' },
    { icon: Shield, title: 'Hardened Posture', desc: 'OWASP standards verified, salt/pepper password hashing, parameterized query checks.', tag: 'OWASP Verified' },
    { icon: Layers, title: 'Observability Stack', desc: 'Structured Pino logs, Prometheus performance metrics, and automated alert triggers.', tag: 'Live Metrics' },
  ];

  const recentAppointments = [
    { id: '1', time: '09:00 AM', patient: 'Sarah Connor', doctor: 'Dr. Gregory House', dept: 'Diagnostics', status: 'In Progress' },
    { id: '2', time: '10:30 AM', patient: 'John Doe', doctor: 'Dr. Allison Cameron', dept: 'Immunology', status: 'Scheduled' },
    { id: '3', time: '11:15 AM', patient: 'Bruce Wayne', doctor: 'Dr. James Wilson', dept: 'Oncology', status: 'Completed' },
    { id: '4', time: '01:45 PM', patient: 'Clark Kent', doctor: 'Dr. Eric Foreman', dept: 'Neurology', status: 'Scheduled' },
    { id: '5', time: '03:00 PM', patient: 'Diana Prince', doctor: 'Dr. Robert Chase', dept: 'Cardiology', status: 'Scheduled' },
  ];

  const appointmentColumns = [
    {
      header: 'Time',
      accessor: (row: typeof recentAppointments[0]) => (
        <span className="text-blue-600 font-semibold">{row.time}</span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: typeof recentAppointments[0]) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 border border-slate-200/50">
            {row.patient.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-slate-700 font-semibold">{row.patient}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Doctor',
      accessor: (row: typeof recentAppointments[0]) => <span className="text-slate-600">{row.doctor}</span>,
    },
    {
      header: 'Department',
      accessor: (row: typeof recentAppointments[0]) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-xs text-slate-500 border border-slate-100">
          {row.dept}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: typeof recentAppointments[0]) => {
        const colors: Record<string, string> = {
          'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
          'Scheduled': 'bg-amber-50 text-amber-600 border-amber-100',
          'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.status] || 'bg-slate-50 text-slate-500'}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-10 h-10 animate-pulse text-blue-600" />
          <span className="text-sm font-semibold tracking-wider text-slate-500">Loading MediCore 360...</span>
        </div>
      </div>
    );
  }

  // Render Medical Dashboard if user is logged in
  if (user) {
    const role = user.role || 'DOCTOR';

    const getRoleBadge = () => {
      switch (role) {
        case 'SUPER_ADMIN':
        case 'HOSPITAL_ADMIN':
          return { label: '👑 ENTERPRISE SUPER ADMIN', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'DOCTOR':
          return { label: '🩺 PHYSICIAN WORKSTATION', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
        case 'NURSE':
          return { label: '❤️ INPATIENT NURSING STATION', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
        case 'PHARMACIST':
          return { label: '💊 DISPENSARY & PHARMACY', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
        case 'PATIENT':
        default:
          return { label: '👤 PATIENT PERSONAL PORTAL', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      }
    };

    const badge = getRoleBadge();

    return (
      <AppShell userRole={role}>
        <div className="space-y-6">
          {/* User Role Banner */}
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-sm">
                {user.firstName ? user.firstName[0] : 'U'}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Welcome, {user.firstName || 'User'} {user.lastName || ''}!
                </h3>
                <p className="text-[11px] font-semibold text-slate-500">
                  Authenticated session active • Strict RBAC Scope Enforced
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          {/* Render assigned role dashboard */}
          {role === 'SUPER_ADMIN' || role === 'HOSPITAL_ADMIN' ? (
            <SuperAdminDashboard />
          ) : role === 'DOCTOR' ? (
            <DoctorDashboard />
          ) : role === 'NURSE' ? (
            <NurseDashboard />
          ) : role === 'PHARMACIST' ? (
            <PharmacistDashboard />
          ) : role === 'LAB_TECHNICIAN' ? (
            <LabTechnicianDashboard />
          ) : (
            <PatientDashboard />
          )}
        </div>
      </AppShell>
    );
  }

  // Render High-End Marketing Landing Page if not authenticated
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 relative overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 z-10 max-w-7xl mx-auto w-full">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-400/20 via-indigo-400/15 to-sky-300/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Next-Gen Enterprise <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Healthcare Management
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              A secure, multi-tenant EHMS platform designed with strict clean architecture boundaries, argon2 salted authentication, and live observability telemetry.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer group active:scale-98"
              >
                <span>Access Clinical Workstation</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/design"
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-100/80 text-slate-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-slate-200 shadow-sm transition-all cursor-pointer"
              >
                <span>Explore Design System</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </motion.div>

          {/* Quick Metrics Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/60 border border-slate-200/60 rounded-2xl backdrop-blur-md shadow-sm"
          >
            <div className="p-3 text-center">
              <span className="block text-2xl font-black text-slate-900">99.98%</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Uptime SLA</span>
            </div>
            <div className="p-3 text-center border-l border-slate-200/50">
              <span className="block text-2xl font-black text-blue-600">&lt; 0.2ms</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cache Latency</span>
            </div>
            <div className="p-3 text-center border-l border-slate-200/50">
              <span className="block text-2xl font-black text-slate-900">8 Roles</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Granular RBAC</span>
            </div>
            <div className="p-3 text-center border-l border-slate-200/50">
              <span className="block text-2xl font-black text-emerald-600">256-bit</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Argon2 + Salt</span>
            </div>
          </motion.div>
        </div>

        {/* Interactive Workspace Previewer Component */}
        <section id="preview" className="mt-16 w-full max-w-5xl">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Interactive Live Preview</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">Explore Platform Workspaces</h3>
              </div>

              {/* Interactive Tabs */}
              <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'emr', label: 'EHR/EMR Records', icon: FileText },
                  { id: 'patients', label: 'Patient Directory', icon: Users },
                  { id: 'telemetry', label: 'System Health', icon: Cpu },
                  { id: 'security', label: 'Security & Auth', icon: Lock }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'emr' | 'patients' | 'telemetry' | 'security')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Content Display per Active Tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'emr' && (
                <motion.div
                  key="emr"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        EMR
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Electronic Health Record #EHR-9942</h4>
                        <span className="text-xs text-slate-500">Encrypted AES-256 Audit Log Enabled</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                      Verified Active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
                      <span className="text-slate-400 font-semibold">Diagnosis</span>
                      <p className="font-bold text-slate-800 mt-1">Acute Cardiac Arrhythmia</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
                      <span className="text-slate-400 font-semibold">Attending Physician</span>
                      <p className="font-bold text-slate-800 mt-1">Dr. Gregory House, MD</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs">
                      <span className="text-slate-400 font-semibold">Audit Hash</span>
                      <p className="font-mono font-bold text-blue-600 mt-1">0x8f2a...39b1</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'patients' && (
                <motion.div
                  key="patients"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {[
                    { mrn: 'MC-1049', name: 'Sarah Connor', status: 'Inpatient Ward B', doctor: 'Dr. House' },
                    { mrn: 'MC-1050', name: 'Bruce Wayne', status: 'Outpatient Clinic', doctor: 'Dr. Wilson' }
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-600">{p.mrn}</span>
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                      <span className="text-slate-500">{p.status}</span>
                      <span className="font-semibold text-slate-700">{p.doctor}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'telemetry' && (
                <motion.div
                  key="telemetry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-slate-950 text-slate-100 rounded-2xl font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span>LIVE SYSTEM MONITOR</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      CONNECTED
                    </span>
                  </div>
                  <p className="text-blue-400">[INFO] MongoDB cluster replica set health OK (0ms delay)</p>
                  <p className="text-emerald-400">[INFO] Redis session cache hit ratio: 99.4%</p>
                  <p className="text-amber-400">[INFO] Rate Limiter Bucket: 0 throttling events recorded</p>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                >
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                    <span className="font-bold text-blue-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Argon2 Salt & Pepper Protection
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Passwords are cryptographically salted per-user and peppered globally with secret keys.
                    </p>
                  </div>
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                    <span className="font-bold text-indigo-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Host Header Multi-Tenant Scoping
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Every database query is strictly filtered by host header mapping and tenant isolation guards.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="mt-20 w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">Enterprise Architecture</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Built for Modern Hospital Scale</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
            {landingCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-350 relative group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
