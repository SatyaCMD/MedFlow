'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Database,
  Key
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function EMRExplorationPage() {
  const auditLogs = [
    { time: '10:42:15 AM', action: 'PHYSICIAN_CONSULT_NOTE_CREATE', user: 'Dr. Gregory House', hash: '0x8f2a...39b1' },
    { time: '11:05:30 AM', action: 'PATHOLOGY_REPORT_ATTACH', user: 'Tech. Sarah Connor', hash: '0x4c9e...11a4' },
    { time: '11:45:00 AM', action: 'DISPENSARY_FULFILLMENT', user: 'Pharm. John Watson', hash: '0x7e3d...90f2' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-4 border-b border-slate-200 pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Platform Overview</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-full mb-3">
                <FileText className="w-3.5 h-3.5" />
                <span>Electronic Health Record (EHR) Storage Module</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                EMR Audit Storage Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore tamper-evident cryptographic SHA-256 EMR audit logging, longitudinal medical timelines, and encrypted storage vaults.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to View EMR Vault</span>
            </Link>
          </div>
        </div>

        {/* SHA-256 Chain Verification Demo */}
        <section className="bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-400">Cryptographic Audit Chain Ledger</span>
              <h3 className="text-xl font-black text-white mt-0.5">SHA-256 EMR Immutable Log Sandbox</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Tamper-Evident Active
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-blue-400 font-bold">[{log.time}]</span>{' '}
                  <span className="text-emerald-400">{log.action}</span>
                  <span className="block text-[11px] text-slate-400 font-sans mt-0.5">Executed by: {log.user}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">SHA-256 Hash</span>
                  <span className="text-slate-200 font-bold">{log.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
