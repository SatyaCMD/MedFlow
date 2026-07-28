'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ArrowLeft,
  DollarSign,
  FileCheck,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';

export default function BillingExplorationPage() {
  const [selectedItem, setSelectedItem] = useState('Consultation');

  const invoiceItems = [
    { title: 'OPD Doctor Consultation Fee', category: 'Professional Services', cost: 1500, coveredByInsurance: true },
    { title: 'Pathology Blood Panel (CBC + KFT)', category: 'Laboratory Diagnostics', cost: 1200, coveredByInsurance: true },
    { title: 'Pharmaceutical Dispensary Prescriptions', category: 'Medications', cost: 650, coveredByInsurance: false },
  ];

  const total = invoiceItems.reduce((acc, curr) => acc + curr.cost, 0);

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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold rounded-full mb-3">
                <Receipt className="w-3.5 h-3.5" />
                <span>Hospital Billing & Claims Suite</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Billing & Claims Explorer
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-1 max-w-2xl">
                Explore itemized hospital invoice generation, TPA insurance clearance workflows, and secure PCI-compliant payment gateway integrations.
              </p>
            </div>

            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span>Log In to View Accounts</span>
            </Link>
          </div>
        </div>

        {/* Invoice Calculator Demo */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">Itemized Medical Bill Preview</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Hospital Claim Settlement Sandbox</h3>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PCI-DSS Audit Validated
            </span>
          </div>

          <div className="space-y-3">
            {invoiceItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <span className="text-slate-500">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block text-sm">₹{item.cost.toLocaleString('en-IN')}</span>
                  {item.coveredByInsurance && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      TPA Covered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <span className="font-black text-sm text-slate-900 uppercase tracking-wider">Total Settlement Due</span>
            <span className="font-black text-2xl text-blue-600">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
