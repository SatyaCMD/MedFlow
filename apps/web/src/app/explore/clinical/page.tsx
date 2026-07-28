'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  FileText,
  Building2,
  Users,
  Activity
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function ClinicalExplorationPage() {
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [searchQuery, setSearchQuery] = useState('');

  const sampleDiagnoses = [
    { code: 'I20.9', title: 'Angina Pectoris, Unspecified', dept: 'Cardiology', severity: 'Moderate' },
    { code: 'J45.909', title: 'Unspecified Asthma, Uncomplicated', dept: 'Pulmonology', severity: 'Low' },
    { code: 'E11.9', title: 'Type 2 Diabetes Mellitus without complications', dept: 'Endocrinology', severity: 'Low' },
    { code: 'I10', title: 'Essential (Primary) Hypertension', dept: 'Cardiology', severity: 'Moderate' },
  ];

  const filtered = sampleDiagnoses.filter(
    (d) =>
      (selectedDept === 'ALL' || d.dept === selectedDept) &&
      (d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold rounded-full mb-3">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Physician & OPD Workstation Module</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Clinical Workstation Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore the physician workflow studio designed for OPD queues, ICD-10 diagnostic coding, e-prescribing, and EMR timeline tracking.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to Physician Portal</span>
            </Link>
          </div>
        </div>

        {/* Interactive OPD Queue & Diagnostic Studio Simulation */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Interactive Studio Demo</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">ICD-10 Diagnostic & Prescription Catalog</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Sandbox
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ICD-10 code or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'Cardiology', 'Pulmonology', 'Endocrinology'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-black rounded-md">
                    ICD-10: {item.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.dept}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200/60 text-slate-500">
                  <span>Severity Index: <strong className="text-slate-800">{item.severity}</strong></span>
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Suggest Rx
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">OPD Queue Dispatcher</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Real-time patient check-in notifications, consultation status tracking, and automated triage queue prioritization.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Electronic Prescribing</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Structured drug dosage selection, drug interaction safety checks, and instant dispatch to hospital dispensary.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">EMR Timeline Vault</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Longitudinal patient health records, historical lab diagnostics, and tamper-evident consultation audit notes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
