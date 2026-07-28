'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Award,
  FileCheck
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function HIPAASecurityAuditPage() {
  const complianceItems = [
    { title: 'HIPAA Title II Administrative Safeguards', desc: 'Strict role-based access controls (RBAC) and automated session timeout protection.', status: 'VERIFIED COMPLIANT' },
    { title: 'Cryptographic Storage at Rest (AES-256)', desc: 'All database volumes and file storage buckets are encrypted using AWS KMS managed AES-256 keys.', status: 'VERIFIED COMPLIANT' },
    { title: 'In-Transit Encryption (TLS 1.3)', desc: 'Strict HTTPS/TLS 1.3 transport security with RSA 4096-bit certificate signatures.', status: 'VERIFIED COMPLIANT' },
    { title: 'Tamper-Evident SHA-256 EMR Audit Trail', desc: 'Immutable, timestamped audit log capturing every clinical EMR record read/write operation.', status: 'VERIFIED COMPLIANT' },
  ];

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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-full mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HIPAA Title II Security Audit Verified</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                HIPAA Security & Trust Center
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore MediCore 360&apos;s HIPAA Title II technical safeguards, business associate agreements (BAA), and cryptographic audit compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {complianceItems.map((item, idx) => (
            <div key={idx} className="p-6 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {item.desc}
                </p>
              </div>

              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-full uppercase tracking-wider shrink-0 self-start sm:self-center">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
