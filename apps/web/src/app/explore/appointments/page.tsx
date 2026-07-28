'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  ArrowLeft,
  Search,
  Clock,
  Star,
  Lock,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function AppointmentsExplorationPage() {
  const [selectedCategory, setSelectedCategory] = useState('Cardiology');

  const doctors = [
    { name: 'Dr. Gregory House, MD', specialty: 'Diagnostic Cardiology', fee: '₹1,500', rating: 4.9, slots: '09:30 AM Today' },
    { name: 'Dr. Allison Cameron, MD', specialty: 'Immunology Specialist', fee: '₹1,200', rating: 4.8, slots: '11:15 AM Tomorrow' },
    { name: 'Dr. James Wilson, MD', specialty: 'Oncology Specialist', fee: '₹1,800', rating: 4.95, slots: '02:00 PM Today' },
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
                <Calendar className="w-3.5 h-3.5" />
                <span>Appointment Board & Dispatch Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Appointment Booking Hub Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore real-time specialist department indexing, OPD consultation slot reservations, and automated doctor dispatch workflows.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to Book Consultation</span>
            </Link>
          </div>
        </div>

        {/* Doctor Catalog Sandbox */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Specialist Department Catalog</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Doctor Scheduling & Slot Reservation Sandbox</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live Availability Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doc, idx) => (
              <div key={idx} className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-blue-600 font-bold">{doc.specialty}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {doc.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200/70">
                    <span>Consultation Fee</span>
                    <span className="font-black text-slate-900">{doc.fee}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {doc.slots}
                  </span>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition-all"
                  >
                    Reserve Slot
                  </Link>
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
