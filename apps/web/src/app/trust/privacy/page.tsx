'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10">
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
                <Globe className="w-3.5 h-3.5" />
                <span>GDPR Article 32 & HIPAA Privacy Statement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Privacy Policy & Compliance Standard
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                MediCore 360 guarantees patient data privacy through strict multi-tenant logical partitioning, cryptographic hashing, and automated data erasure rights.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">1. Data Ownership & Tenant Scoping</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Every healthcare institution retains 100% ownership of its clinical records. Records are strictly partitioned by cryptographic tenant identifiers, guaranteeing zero cross-hospital data leakage.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-lg font-black text-slate-900">2. Encryption Standards</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              All stored clinical notes, prescriptions, and EMR records are encrypted at rest using AES-256 and in transit using TLS 1.3 encryption. Passwords are salted per-user and peppered using memory-hard Argon2id.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <h3 className="text-lg font-black text-slate-900">3. Compliance Contact</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              For questions regarding HIPAA Title II compliance, BAA execution, or GDPR data officer queries, contact our Security Desk at <strong className="text-blue-600 font-bold">privacy@medicore360.com</strong>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
