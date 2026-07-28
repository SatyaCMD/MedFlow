'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  ArrowLeft,
  Search,
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck,
  Building2
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function PatientsExplorationPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const samplePatients = [
    { mrn: 'MC-1001', name: 'John Doe', age: 45, gender: 'Male', ward: 'Cardiology Ward B', status: 'Admitted' },
    { mrn: 'MC-1002', name: 'Jane Smith', age: 32, gender: 'Female', ward: 'Outpatient Clinic', status: 'Outpatient' },
    { mrn: 'MC-1003', name: 'Robert Lee', age: 58, gender: 'Male', ward: 'Surgical ICU', status: 'In Recovery' },
    { mrn: 'MC-1004', name: 'Emily Davis', age: 27, gender: 'Female', ward: 'Endocrinology Ward A', status: 'Admitted' },
  ];

  const filtered = samplePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-full mb-3">
                <Users className="w-3.5 h-3.5" />
                <span>Patient Master Index (PMI) Module</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Patient Directory Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore how MediCore 360 manages encrypted patient demographics, MRN generation, hospital census tracking, and HIPAA data isolation.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to View Active Census</span>
            </Link>
          </div>
        </div>

        {/* Interactive Directory Search Demo */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Encrypted Patient Index Preview</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Patient Master Registry Sandbox</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Encrypted
            </span>
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by MRN Number or Patient Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="p-3">MRN Number</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Demographics</th>
                  <th className="p-3">Assigned Ward</th>
                  <th className="p-3">Care Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filtered.map((patient, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3 font-mono font-black text-blue-600">{patient.mrn}</td>
                    <td className="p-3 font-bold text-slate-900">{patient.name}</td>
                    <td className="p-3 text-slate-500">{patient.age} yrs • {patient.gender}</td>
                    <td className="p-3 text-slate-700">{patient.ward}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Cryptographic MRN Key</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Every registered patient is assigned a unique, immutable Medical Record Number (MRN) linked across all clinical departments.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <FileCheck className="w-6 h-6 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Demographic Protection</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Strict access controls ensure demographic data is accessible only by authorized healthcare practitioners with assigned care duties.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">Multi-Tenant Scoping</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Patient records are strictly scoped by hospital tenant ID headers, preventing cross-workspace data contamination.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
