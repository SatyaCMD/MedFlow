'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Database,
  ShieldCheck,
  Server
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function CleanArchitectureGuidePage() {
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
                <Layers className="w-3.5 h-3.5" />
                <span>Domain-Driven Clean Architecture Spec</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Clean Architecture Guide
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore the 3-tier boundary model separating HTTP Controllers, Service Business Logic, and Database Repository layers.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Tier Layer Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm">
              01
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Controller Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Processes incoming HTTP requests, validates request payload DTOs using Zod schemas, and returns standardized JSON responses.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm">
              02
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Service Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Houses pure clinical business rules, argon2 password hashing, OTP generator dispatchers, and permission checks.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
              03
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Repository & Model Layer</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Encapsulates Mongoose database connections, tenant ID scope filters, Redis cache hits, and S3 file operations.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
