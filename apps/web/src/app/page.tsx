'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '../components/shared/AppShell';
import { StatCard } from '../components/shared/StatCard';
import { DataTable } from '../components/shared/DataTable';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const landingCards = [
    { icon: Activity, title: 'Clean Architecture', desc: 'Strict controllers, services, repositories boundary model.' },
    { icon: Database, title: 'Multi-Tenant Scope', desc: 'Dynamically isolated records based on host mappings.' },
    { icon: Key, title: 'Role-Based Access', desc: 'Secure custom matrix checks at compile and runtime.' },
    { icon: Users, title: '8 Dashboards', desc: 'Custom workspace views tailored for specialized staff.' },
    { icon: Shield, title: 'Hardened Posture', desc: 'OWASP standards verified, parameterized query checks.' },
    { icon: Layers, title: 'Observability Stack', desc: 'Structured logs, performance metrics, and alert triggers.' },
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
        <span className="text-blue-400 font-semibold">{row.time}</span>
      ),
    },
    {
      header: 'Patient Name',
      accessor: (row: typeof recentAppointments[0]) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300">
            {row.patient.split(' ').map(n => n[0]).join('')}
          </div>
          <span>{row.patient}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Doctor',
      accessor: (row: typeof recentAppointments[0]) => <span>{row.doctor}</span>,
    },
    {
      header: 'Department',
      accessor: (row: typeof recentAppointments[0]) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">
          {row.dept}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: typeof recentAppointments[0]) => {
        const colors: Record<string, string> = {
          'In Progress': 'bg-blue-950/60 text-blue-400 border-blue-900/40',
          'Scheduled': 'bg-amber-950/60 text-amber-400 border-amber-900/40',
          'Completed': 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[row.status] || 'bg-slate-900 text-slate-400'}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080b11] text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-10 h-10 animate-pulse text-blue-500" />
          <span className="text-sm font-semibold tracking-wider text-slate-400">Loading MediCore 360...</span>
        </div>
      </div>
    );
  }

  // Render Medical Dashboard if user is logged in
  if (user) {
    return (
      <AppShell userRole={user.role}>
        <div className="space-y-8">
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">Welcome Back, {user.firstName}!</h1>
              <p className="text-slate-400 mt-1 text-sm">
                Here is a summary of today&apos;s activity at {user.role === 'SUPER_ADMIN' ? 'All Tenants' : 'Your Medical Clinic'}.
              </p>
            </div>
            <button
              onClick={logout}
              className="self-start md:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Patients"
              value="1,248"
              description="Total registered patient files"
              icon={Users}
              change={12.4}
            />
            <StatCard
              title="Appointments"
              value="42"
              description="Scheduled for today"
              icon={Calendar}
              change={5.2}
            />
            <StatCard
              title="Pending Invoices"
              value="$14,830"
              description="Outstanding billing receipts"
              icon={DollarSign}
              change={-2.1}
            />
            <StatCard
              title="Lab Audits"
              value="18"
              description="Pending reports and verification"
              icon={ClipboardList}
              change={8.7}
            />
          </div>

          {/* Activity Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Appointments Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-200">Recent Appointments</h3>
                <span className="text-xs text-blue-400 hover:underline cursor-pointer">View all appointments</span>
              </div>
              <DataTable columns={appointmentColumns} data={recentAppointments} />
            </div>

            {/* Right: Telemetry & Activity Feed */}
            <div className="space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                <h3 className="text-md font-bold text-slate-200">System Telemetry</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200 font-semibold">MongoDB Database Synced</span>
                    <span className="text-[10px] text-slate-500">Connected successfully to replica sets</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200 font-semibold">Redis Session Cache</span>
                    <span className="text-[10px] text-slate-500">Cluster healthy. 0.2ms latency</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200 font-semibold">Auth Service PEPPER Check</span>
                    <span className="text-[10px] text-slate-500">Salt keys verified successfully</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-200 font-semibold">Jenkins CI Pipeline Integration</span>
                    <span className="text-[10px] text-slate-500">Connected to Jenkins webhook on port 8080</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // Render Marketing Landing page if not authenticated
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-[#0b0f19] text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      <header className="z-10 text-center max-w-3xl mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 text-xs font-semibold text-blue-400 bg-blue-950/50 border border-blue-900/50 rounded-full">
            MediCore 360 v1.0
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-blue-400 bg-clip-text text-transparent">
            Enterprise Healthcare Platform
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            A secure, multi-tenant EHMS platform designed for modern hospital systems.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-950/50 hover:shadow-blue-500/20 transition-all cursor-pointer group"
            >
              <span>Sign In to Platform</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </header>

      <main className="z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full">
        {landingCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="flex flex-col p-6 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-950/80 border border-blue-900/40 text-blue-400 rounded-xl mb-6">
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{card.desc}</p>
          </motion.div>
        ))}
      </main>

      <footer className="z-10 mt-20 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} MediCore 360 Inc. All rights reserved.
      </footer>
    </div>
  );
}
