'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Palette,
  Type,
  Layers,
  Component,
  Sliders,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  Code2
} from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';

export default function DesignStyleGuide() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'buttons' | 'badges' | 'cards'>('colors');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colors = [
    { name: 'Primary Blue 600', hex: '#2563eb', bg: 'bg-blue-600', text: 'text-white', class: 'bg-blue-600', desc: 'Main action buttons & primary branding' },
    { name: 'Indigo 600', hex: '#4f46e5', bg: 'bg-indigo-600', text: 'text-white', class: 'bg-indigo-600', desc: 'Secondary accent & gradient fills' },
    { name: 'Slate Dark 950', hex: '#020617', bg: 'bg-slate-950', text: 'text-white', class: 'bg-slate-950', desc: 'Dark mode canvas & sidebar backgrounds' },
    { name: 'Emerald 600', hex: '#059669', bg: 'bg-emerald-600', text: 'text-white', class: 'bg-emerald-600', desc: 'Success indicators & verified badges' },
    { name: 'Amber 600', hex: '#d97706', bg: 'bg-amber-600', text: 'text-white', class: 'bg-amber-600', desc: 'Warning alerts & scheduled statuses' },
    { name: 'Rose 600', hex: '#e11d48', bg: 'bg-rose-600', text: 'text-white', class: 'bg-rose-600', desc: 'Critical alerts & destructive actions' },
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold rounded-full mb-3">
                <Palette className="w-3.5 h-3.5" />
                <span>MediCore 360 Design System v1.0</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Design Tokens & Component Gallery
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore the public design system, custom Tailwind CSS variables, HSL color tokens, typography scales, and component specifications powering MediCore 360.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to Workstation</span>
            </Link>
          </div>
        </div>

        {/* Tab Controller */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-2xl overflow-x-auto">
          {[
            { id: 'colors', label: 'Color Tokens', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'buttons', label: 'Buttons', icon: Component },
            { id: 'badges', label: 'Status Badges', icon: ShieldCheck },
            { id: 'cards', label: 'UI Cards', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Display Content per Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'colors' && (
            <motion.section
              key="colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">Color Palette & Hex Swatches</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Click any color swatch to copy its Hex code to your clipboard.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {colors.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(c.hex)}
                    className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer group space-y-4"
                  >
                    <div className={`h-24 ${c.class} rounded-2xl flex items-end justify-between p-3 text-white shadow-inner`}>
                      <span className="text-xs font-mono font-black">{c.hex}</span>
                      {copiedToken === c.hex ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Copy className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'typography' && (
            <motion.section
              key="typography"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">Typography Scale</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Built using Inter font family with strict tracking and leading hierarchy.</p>
              </div>

              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600">Heading 1 — 7XL (72px / Black)</span>
                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900">
                    Enterprise Healthcare
                  </h1>
                </div>

                <div className="border-b border-slate-100 pb-4 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600">Heading 2 — 3XL (30px / Black)</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Clinical Decision Support System
                  </h2>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600">Body Medium — 14px / Regular</span>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    A secure multi-tenant Electronic Health Management System engineered with clean domain boundaries, argon2 salted authentication, and live telemetry.
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'buttons' && (
            <motion.section
              key="buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">Button Components</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Standardized button states for clinical workstations.</p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
                  Primary Action Button
                </button>
                <button className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                  Dark Neutral Button
                </button>
                <button className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer">
                  Secondary Outlined
                </button>
                <button className="px-5 py-3 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all cursor-pointer">
                  Destructive Action
                </button>
              </div>
            </motion.section>
          )}

          {activeTab === 'badges' && (
            <motion.section
              key="badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">Status Badges & Indicators</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Pill badges used in tables, EMR timelines, and audit logs.</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Admitted
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Outpatient Consult
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Allergy Alert On File
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Multi-Tenant Scoped
                </span>
              </div>
            </motion.section>
          )}

          {activeTab === 'cards' && (
            <motion.section
              key="cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-slate-900">Composite Card Containers</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Standardized glassmorphic and high-contrast card structures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm space-y-3">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Stat Card Preview</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-bold block">Active Consultations</span>
                      <span className="text-3xl font-black text-slate-900">1,482</span>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-950 text-white rounded-3xl shadow-xl space-y-3 border border-slate-800">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Dark Telemetry Card</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">System SLA Uptime</span>
                      <span className="text-3xl font-black text-emerald-400">99.98%</span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
