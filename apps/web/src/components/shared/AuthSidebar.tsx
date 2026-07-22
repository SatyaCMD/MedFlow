'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Activity,
  Award,
  Lock,
  Zap,
  Server,
  Database,
  CheckCircle2,
  Cpu,
  Globe,
  Radio,
  FileCheck
} from 'lucide-react';
import { Logo } from './Logo';
import Link from 'next/link';

interface AuthSidebarProps {
  title: string;
  subtitle: string;
}

export const AuthSidebar: React.FC<AuthSidebarProps> = ({ title, subtitle }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'telemetry' | 'compliance'>('security');

  const securityFeatures = [
    { title: 'Strict Multi-Tenant DB Isolation', desc: 'Separate logical schema per hospital workspace', icon: Database },
    { title: 'Role-Based Cryptographic JWTs', desc: 'Argon2id salted + peppered password verification', icon: Lock },
    { title: 'Real-Time EMR Audit Logging', desc: 'SHA-256 tamper-evident clinical progression notes', icon: ShieldCheck },
    { title: 'Secure Multi-Factor OTP Mailer', desc: 'SMTP 6-digit pin verification with 5-min TTL', icon: Zap },
  ];

  const telemetryMetrics = [
    { label: 'System SLA Uptime', value: '99.99%', sub: 'Multi-Region HA', color: 'text-emerald-400' },
    { label: 'API Query Latency', value: '14ms', sub: 'Redis Cached', color: 'text-blue-400' },
    { label: 'Active Encrypted Sessions', value: '14,280', sub: 'HIPAA Audited', color: 'text-indigo-300' },
    { label: 'Cluster Data Nodes', value: '12 / 12', sub: 'Operational', color: 'text-emerald-400' },
  ];

  const complianceBadges = [
    { name: 'HIPAA Title II', desc: 'Protected Health Information Enforcement', icon: FileCheck },
    { name: 'SOC 2 Type II', desc: 'Independent Security Audit Certified', icon: Award },
    { name: 'GDPR Article 32', desc: 'Automated Encryption & Data Erasure', icon: Globe },
    { name: 'ISO 27001', desc: 'International InfoSec Standards', icon: Cpu },
  ];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative flex-col justify-between p-12 text-white overflow-hidden border-r border-blue-900/30">
      
      {/* Ambient Glowing Background Orbs */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-28 -left-28 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute -bottom-28 -right-28 w-[450px] h-[450px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

      {/* TOP HEADER: Brand Identity */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3.5 group cursor-pointer">
          <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-xl group-hover:border-blue-400/50 transition-all">
            <Logo size={38} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">MEDICORE 360</h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[9px] font-extrabold tracking-wider text-blue-300">
                v1.0 ENTERPRISE
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300/80">
              Enterprise Hospital Management System
            </span>
          </div>
        </Link>
      </div>

      {/* MIDDLE SECTION: Hero Copy & Interactive Telemetry Dashboard */}
      <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
        
        {/* Main Title Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-bold text-blue-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Secure Medical Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.15]">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-300/90 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Interactive Tab Controller */}
        <div className="space-y-4">
          <div className="flex items-center p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Compliance</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-2.5"
              >
                {securityFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 rounded-xl transition-all flex items-start gap-3 group"
                  >
                    <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors flex items-center gap-1.5">
                        {item.title}
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                    </div>
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
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {telemetryMetrics.map((m, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</span>
                    <div className={`text-2xl font-black ${m.color} tracking-tight tabular-nums`}>{m.value}</div>
                    <span className="text-[10px] font-semibold text-slate-400 block">{m.sub}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'compliance' && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-2.5"
              >
                {complianceBadges.map((b, idx) => (
                  <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg shrink-0">
                      <b.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{b.name}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* FOOTER: Live Infrastructure Telemetry Node */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
          <span className="text-slate-300 text-[11px]">System Status: <strong className="text-emerald-400">Operational</strong></span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">12 / 12 Nodes Online</span>
      </div>

    </div>
  );
};
