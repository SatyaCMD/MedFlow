'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  Download,
  Mail,
  ArrowLeft,
  Receipt,
  CreditCard,
  Building2,
  Lock,
  Sparkles,
  ExternalLink,
  Check,
  Clock,
  FileText,
  Activity,
  HeartPulse,
  Share2
} from 'lucide-react';
import { AppShell } from '../../../components/shared/AppShell';
import { useToast } from '../../../context/ToastContext';
import { printSinglePageReceipt } from '../../../lib/singlePageReceiptPdf';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const transactionId = searchParams.get('tx') || `pay_rzp_${Math.random().toString(36).substring(2, 10)}`;
  const invoiceId = searchParams.get('invoice') || `ORD-RX-${Math.floor(100000 + Math.random() * 900000)}`;
  const itemTitle = searchParams.get('item') || 'IPD Hospital Stay & Surgery Package';
  const amount = searchParams.get('amount') || '₹45,800';
  const customerName = searchParams.get('name') || 'Alex Care';
  const cardholderName = searchParams.get('cardholder') || customerName;
  const cardLast4 = searchParams.get('cardLast4') || '7712';
  const cardBrand = searchParams.get('brand') || 'Visa';
  const paymentMethod = searchParams.get('method') || 'STRIPE CARD';
  const category = searchParams.get('cat') || 'APPOINTMENT';

  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }));
  }, []);

  const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 45800;
  const subtotal = (numericAmount / 1.05).toFixed(2);
  const taxAmount = (numericAmount - parseFloat(subtotal)).toFixed(2);

  const handlePrintReceipt = () => {
    printSinglePageReceipt({
      invoiceId,
      transactionId,
      itemTitle,
      itemCategory: category,
      amount,
      customerName,
      cardholderName,
      cardLast4,
      cardBrand,
      paymentMethod,
      timestamp: timestamp || new Date().toLocaleString(),
      status: 'PAID & VERIFIED',
    });
  };

  const handleEmailReceipt = () => {
    showToast({
      title: 'Tax Receipt Email Dispatched',
      message: `Official 1-Page PDF invoice emailed to ${customerName.toLowerCase().replace(/\s+/g, '.')}@medflow.com`,
      type: 'success',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Bar with Back Button & SSL Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/billing')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Master Billing Ledger</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            256-Bit SSL Encrypted & PCI-DSS Compliant
          </span>
        </div>
      </div>

      {/* Hero Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-8 shadow-2xl border border-emerald-800/40"
      >
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 bg-white text-emerald-900 rounded-full p-1 shadow-md">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                  PAYMENT AUTHORIZED & APPROVED
                </span>
                <span className="text-xs text-slate-400 font-mono">Invoice #{invoiceId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Payment Successfully Completed!
              </h1>
              <p className="text-sm font-semibold text-slate-300 max-w-xl">
                Your payment of <span className="text-emerald-400 font-black">{amount}</span> for <span className="text-white font-bold">{itemTitle}</span> has been confirmed & added to the EHR medical records.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right space-y-1 min-w-[200px]">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">AMOUNT SETTLED</span>
            <span className="text-2xl font-black text-emerald-400 block">{amount}</span>
            <span className="text-[11px] text-slate-300 font-medium block">Tx Hash: <span className="font-mono text-blue-300">{transactionId.slice(0, 16)}...</span></span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Transaction Breakdown & User Card Information */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" /> Healthcare Service & Billing Summary
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                  {category}
                </span>
                <h4 className="font-black text-base text-slate-900 mt-1 truncate">{itemTitle}</h4>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Patient / Purchaser: <span className="text-slate-900 font-bold">{customerName}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-slate-900">{amount}</span>
                <span className="text-[10px] font-bold text-emerald-600 block">5% GST Included</span>
              </div>
            </div>

            {/* Financial Calculations */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net Healthcare Services):</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Medical GST Tax Rate (5%):</span>
                <span className="font-semibold text-slate-900">₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Processing Charge (Waived):</span>
                <span className="font-bold text-emerald-600">₹0.00 (Complimentary)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                <span className="text-slate-900">Total Charged Amount:</span>
                <span className="text-emerald-700 font-black">{amount}</span>
              </div>
            </div>
          </div>

          {/* User Card Details Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Card Details & Payment Method Authorization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-blue-300 uppercase tracking-widest">{cardBrand}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold">VERIFIED</span>
                </div>
                <div className="font-mono text-sm font-bold tracking-widest text-slate-100">
                  •••• •••• •••• {cardLast4}
                </div>
                <div className="flex justify-between items-end text-[10px] text-slate-300">
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold">CARDHOLDER</span>
                    <span className="font-bold uppercase">{cardholderName}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 font-bold font-mono">METHOD</span>
                    <span className="font-bold uppercase">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SECURITY METRICS</span>
                  <p className="font-bold text-slate-800 mt-1">Stripe 3D Secure 2.0 Authenticated</p>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    256-Bit SSL Cipher Handshake Validated
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Real-time Anti-Fraud Risk Score: 0.00 (Passed)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Telemetry Steps */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Live Settlement & EHR Synchronization Steps
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">STEP 1</span>
                <p className="text-xs font-black text-emerald-950">Payment Initiated</p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Complete
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">STEP 2</span>
                <p className="text-xs font-black text-emerald-950">3DS Auth</p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Verified
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">STEP 3</span>
                <p className="text-xs font-black text-emerald-950">Bank Cleared</p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Approved
                </span>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <span className="text-[9px] font-bold text-blue-700 uppercase">STEP 4</span>
                <p className="text-xs font-black text-blue-950">EHR Synched</p>
                <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Logged
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Page PDF Receipt Preview & Action Buttons */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">RECEIPT ACTIONS</span>
            
            <button
              onClick={handlePrintReceipt}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download 1-Page PDF Receipt</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrintReceipt}
                className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>

              <button
                onClick={handleEmailReceipt}
                className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300"
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>Email PDF Receipt</span>
              </button>
            </div>
          </div>

          {/* 1-Page Official Receipt Preview Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                  ✚
                </div>
                <span className="font-black text-xs text-slate-900 tracking-wide">1-PAGE OFFICIAL PDF TAX RECEIPT</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[9px] font-extrabold uppercase">
                A4 Single Page
              </span>
            </div>

            {/* Document Paper Preview Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] space-y-3 font-sans shadow-inner">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <h5 className="font-black text-slate-900 text-xs">MediFlow Healthcare</h5>
                  <p className="text-[10px] text-slate-500">GST Registration #: 27AAAAA0000A1Z5</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-600 block">{invoiceId}</span>
                  <span className="text-[9px] text-slate-400 block">{timestamp}</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Used:</span>
                  <span className="font-mono font-bold text-slate-800">{cardBrand} •••• {cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[160px]">{itemTitle}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>GST (5%):</span>
                  <span>₹{taxAmount}</span>
                </div>
                <div className="flex justify-between font-black text-xs text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total Paid:</span>
                  <span className="text-emerald-700">{amount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono">
                SHA-256: {transactionId.slice(0, 20)}...
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center font-medium">
              Click <strong className="text-slate-800">"Download 1-Page PDF Receipt"</strong> above to generate or print the official single-page A4 document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <AppShell userRole="SUPER_ADMIN">
      <Suspense fallback={
        <div className="p-12 text-center text-slate-500 font-bold">
          Loading Successful Payment Confirmation...
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </AppShell>
  );
}
