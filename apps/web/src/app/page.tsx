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
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Code2,
  Terminal,
  Server,
  ShieldCheck
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
import { BloodBankDashboard } from '../components/dashboards/BloodBankDashboard';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'emr' | 'patients' | 'telemetry' | 'security'>('emr');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [modalCard, setModalCard] = useState<any | null>(null);

  const landingCards = [
    {
      icon: Activity,
      title: 'Clean Architecture',
      desc: 'Strict controllers, services, repositories boundary model enforcing separation of concerns.',
      tag: 'Clean Code',
      detailedExplanation: 'Enforces strict modular multi-tier separation dividing the backend API into decoupled Controllers, Services, and Data Repositories. Controllers manage HTTP request/response validation contracts, Services execute pure business rules, and Models manage database schemas.',
      highlights: [
        'Decoupled Controller-Service Boundary (Zero HTTP leak into domain logic)',
        'Centralized Middleware Pipeline (Zod validation, rate limiting & auth guards)',
        'Workspace Package Isolation (@medicore360/shared DTO contracts)'
      ],
      specs: ['Node.js 20 ESM', 'TypeScript 5.3', 'Express REST API', 'Zod Validation'],
      codeSnippet: `// Clean Architecture Controller Handler\nexport class AuthController {\n  async login(req: Request, res: Response) {\n    const dto = loginSchema.parse(req.body);\n    const result = await this.authService.login(dto.identifier, dto.password);\n    return res.json({ success: true, data: result });\n  }\n}`
    },
    {
      icon: Database,
      title: 'Multi-Tenant Scope',
      desc: 'Dynamically isolated records based on host mappings and tenant ID cryptographic headers.',
      tag: 'Isolated Data',
      detailedExplanation: 'Guarantees logical and cryptographic multi-tenancy across independent hospital units. Every incoming HTTP request inspects host headers and tenant context, automatically injecting tenant ID scoping into Mongo and Redis queries.',
      highlights: [
        'Host Header Tenant Resolver (Dynamic subdomain to hospital unit mapping)',
        'Scoped Mongoose Queries (Automatic tenant context injection on all operations)',
        'Isolated S3 Document Buckets (Tenant-keyed document vaults for HIPAA safety)'
      ],
      specs: ['Tenant Context Middleware', 'Host Header Resolution', 'Isolated Storage Paths', 'Redis Session Partitioning'],
      codeSnippet: `// Scoped Tenant Query Guard\nconst tenantFilter = { hospitalId: req.tenantId, deletedAt: null };\nconst records = await PatientModel.find({ ...tenantFilter, ...query });`
    },
    {
      icon: Key,
      title: 'Role-Based Access',
      desc: 'Secure custom matrix checks at compile and runtime for 8 granular clinical roles.',
      tag: 'RBAC Security',
      detailedExplanation: 'Granular permission enforcement across 8 specialized clinical and administrative roles. Ensures users can only access features and records explicitly authorized for their workstation assignment.',
      highlights: [
        '8 Dedicated Role Portals (Doctor, Nurse, Lab Tech, Pharmacist, Blood Bank, Patient, Admin, Super Admin)',
        'Dual Token Flow (15-min Access Token + 7-day Rotating Refresh Token)',
        'Compile-Time Type Guards (Strict TypeScript enum checks for permissions)'
      ],
      specs: ['RS256/HS256 Signed JWTs', 'Argon2id Salt + Pepper', 'Redis Session Revocation', 'RequirePermission Guard'],
      codeSnippet: `// Granular RBAC Permission Middleware Guard\nrouter.post('/prescribe', \n  requirePermission('WRITE_PRESCRIPTION'), \n  doctorController.createPrescription\n);`
    },
    {
      icon: Users,
      title: '8 Dashboards',
      desc: 'Custom workspace views tailored for Physicians, Nurses, Pharmacists, Admins & Patients.',
      tag: 'Tailored Views',
      detailedExplanation: 'Purpose-built workstation interfaces tailored for clinical workflows. Includes OPD queues for doctors, bedside vitals loggers for nurses, pharmacy stock fulfillment, blood bank matching, and personal patient vaults.',
      highlights: [
        'Physician Studio (ICD-10 prescription generator, OPD queues & EMR history)',
        'Caregiver Station (ICU triage alerts, vitals logger & bedside round checklists)',
        'Dispensary & Inventory (Prescription fulfillment & real-time stock audits)'
      ],
      specs: ['Next.js 14 App Router', 'Framer Motion', 'Tailwind CSS', 'Recharts Analytics'],
      codeSnippet: `// Dynamic Workstation View Dispatcher\n<AppShell userRole={user.role}>\n  {role === 'DOCTOR' ? <DoctorDashboard /> : <NurseDashboard />}\n</AppShell>`
    },
    {
      icon: Shield,
      title: 'Hardened Posture',
      desc: 'OWASP standards verified, salt/pepper password hashing, parameterized query checks.',
      tag: 'OWASP Verified',
      detailedExplanation: 'Architected strictly adhering to OWASP Top 10 security standards. Passwords use memory-hard Argon2id hashing with unique per-user salts and a global environment pepper key.',
      highlights: [
        'Argon2id Salt & Pepper Hashing (Resistant to GPU/ASIC rainbow table attacks)',
        'MFA OTP Verification (6-digit one-time passcode with 5-minute TTL)',
        'Account Lockout Protocol (3 failed attempts triggers automated Redis lockout)'
      ],
      specs: ['OWASP Top 10 Hardened', 'Argon2id + Salt + Pepper', 'MFA OTP Verification', 'Redis Rate Limiter'],
      codeSnippet: `// Cryptographic Salt & Pepper Password Hashing\nconst hash = await argon2.hash(password, {\n  salt: userSaltBuffer,\n  secret: appPepperBuffer,\n});`
    },
    {
      icon: Layers,
      title: 'Observability Stack',
      desc: 'Structured Pino logs, Prometheus performance metrics, and automated alert triggers.',
      tag: 'Live Metrics',
      detailedExplanation: 'Comprehensive production monitoring, structured JSON logging, and real-time performance telemetry tracking HTTP request durations, database query latencies, and cache hit ratios.',
      highlights: [
        'Structured Pino Logger (JSON logs with request correlation IDs)',
        'OpenTelemetry API Metrics (Prometheus-compatible HTTP latency tracking)',
        'Tamper-Evident Audit Trails (Immutable log of clinical data modifications)'
      ],
      specs: ['Pino JSON Logger', 'OpenTelemetry API', 'Prometheus Exporter', 'Health Probes'],
      codeSnippet: `// High-Performance Structured Pino Telemetry Log\nlogger.info({ requestId, durationMs, tenantId }, 'HTTP request completed');`
    },
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
        case 'BLOOD_BANK':
          return { label: '🩸 BLOOD BANK & TRANSFUSION', bg: 'bg-red-100 text-red-800 border-red-200' };
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
          ) : role === 'BLOOD_BANK' ? (
            <BloodBankDashboard />
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
                      {' CONNECTED'}
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
            <p className="text-xs text-slate-500 font-medium mt-1">Click any card below to expand its technical specifications & architectural breakdown</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full items-start">
            {landingCards.map((card, idx) => {
              const isExpanded = expandedCard === idx;
              const IconComp = card.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => setExpandedCard(isExpanded ? null : idx)}
                  className={`flex flex-col p-6 bg-white border rounded-3xl transition-all duration-300 relative cursor-pointer group ${
                    isExpanded
                      ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 scale-[1.01]'
                      : 'border-slate-200/90 shadow-sm hover:shadow-lg hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-colors duration-300 ${
                      isExpanded
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-full border border-slate-200/60">
                        {card.tag}
                      </span>
                      <div className="p-1 rounded-full text-slate-400 group-hover:text-blue-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 flex items-center justify-between">
                    <span>{card.title}</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-medium">{card.desc}</p>

                  {/* EXPANDED DETAILS SECTION */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden pt-4 mt-4 border-t border-slate-100 space-y-4"
                      >
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed bg-blue-50/50 p-3 rounded-2xl border border-blue-100/70">
                          {card.detailedExplanation}
                        </p>

                        <div className="space-y-2">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                            Key System Highlights:
                          </span>
                          <div className="space-y-1.5">
                            {card.highlights.map((h, hIdx) => (
                              <div key={hIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <span className="leading-snug">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {card.specs.map((spec, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200/80">
                              {spec}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalCard(card);
                          }}
                          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer mt-2"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Inspect Code Blueprint</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FULL ARCHITECTURE BLUEPRINT MODAL */}
        <AnimatePresence>
          {modalCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                      <modalCard.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 leading-tight">{modalCard.title} Architecture Blueprint</h3>
                      <span className="text-xs text-blue-600 font-bold">{modalCard.tag} Specification</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalCard(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-4 pr-1">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Executive Summary</h4>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      {modalCard.detailedExplanation}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Technical Implementation Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {modalCard.specs.map((s: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {modalCard.codeSnippet && (
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        Code & Contract Implementation Blueprint
                      </h4>
                      <pre className="p-4 bg-slate-950 text-blue-300 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                        <code>{modalCard.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalCard(null)}
                    className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-slate-800 transition-all"
                  >
                    Close Spec Inspector
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
