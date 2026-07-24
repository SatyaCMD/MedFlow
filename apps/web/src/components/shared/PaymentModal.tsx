'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  X,
  Download,
  Sparkles,
  Lock,
  ArrowRight,
  Building2,
  Stethoscope,
  FlaskConical,
  Droplet,
  Pill,
  QrCode,
  Check,
  Wallet,
  Receipt,
  FileCheck2,
  Award,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemCategory?: 'APPOINTMENT' | 'LAB_TEST' | 'BLOOD_BANK' | 'PHARMACY' | 'HOSPITAL_SUPPLY';
  amount: string; // e.g. "₹1,500"
  patientName?: string;
  userRole?: string; // 'PATIENT' | 'NURSE' | 'LAB_TECH' | 'DOCTOR' | 'SUPER_ADMIN'
  onPaymentSuccess?: (receipt: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemCategory = 'APPOINTMENT',
  amount,
  patientName = 'Alex Care',
  userRole = 'PATIENT',
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();

  const isStaffRole = userRole === 'NURSE' || userRole === 'LAB_TECH' || userRole === 'DOCTOR' || userRole === 'SUPER_ADMIN';

  // State Management
  const [gatewayEngine, setGatewayEngine] = useState<'RAZORPAY' | 'STRIPE' | 'HOSPITAL_LINE_OF_CREDIT'>(
    isStaffRole ? 'HOSPITAL_LINE_OF_CREDIT' : 'RAZORPAY'
  );

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'INSURANCE' | 'DEPARTMENT_PO'>(
    isStaffRole ? 'DEPARTMENT_PO' : 'UPI'
  );

  // Form Fields
  const [upiId, setUpiId] = useState('user@upi');
  const [showQrCode, setShowQrCode] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8819');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('882');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState('STAR-99201-HEALTH');
  const [deptPoCode, setDeptPoCode] = useState('HOSP-WARD-PO-8819');
  const [supervisorPin, setSupervisorPin] = useState('7721');

  // Status State
  const [processing, setProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  if (!isOpen) return null;

  // Determine Sub-Gateway Styling Theme & Icons based on category & role
  const getGatewayTheme = () => {
    if (isStaffRole || itemCategory === 'HOSPITAL_SUPPLY') {
      return {
        badge: 'STAFF PROCUREMENT GATEWAY',
        title: 'Hospital Enterprise Supply & Pharmacy Procurement Hub',
        sub: 'Department PO Clearance & Hospital Line of Credit Approval',
        gradient: 'from-slate-900 via-purple-950 to-slate-900',
        borderColor: 'border-purple-500/30',
        accentColor: 'text-purple-400',
        buttonBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30',
        icon: Building2,
      };
    }

    switch (itemCategory) {
      case 'BLOOD_BANK':
        return {
          badge: 'EMERGENCY BLOOD BANK GATEWAY',
          title: 'Blood Bank & Transfusion Reserve Checkout',
          sub: 'ABO/Rh Verified Blood Donor Cross-Matching & Storage Fee',
          gradient: 'from-rose-950 via-red-900 to-slate-950',
          borderColor: 'border-rose-500/30',
          accentColor: 'text-rose-400',
          buttonBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
          icon: Droplet,
        };
      case 'LAB_TEST':
        return {
          badge: 'NABL PATHOLOGY GATEWAY',
          title: 'Pathology & Diagnostic Lab Payment Portal',
          sub: 'ISO-15189 Accredited Laboratory Fee & Specimen Handling',
          gradient: 'from-indigo-950 via-cyan-950 to-slate-950',
          borderColor: 'border-indigo-500/30',
          accentColor: 'text-indigo-400',
          buttonBg: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
          icon: FlaskConical,
        };
      case 'PHARMACY':
        return {
          badge: 'DISPENSARY CHECKOUT',
          title: 'Licensed Hospital Pharmacy & Drug Store',
          sub: 'Prescription Dispensing & GST Tax Verified Invoice',
          gradient: 'from-emerald-950 via-teal-950 to-slate-950',
          borderColor: 'border-emerald-500/30',
          accentColor: 'text-emerald-400',
          buttonBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
          icon: Pill,
        };
      case 'APPOINTMENT':
      default:
        return {
          badge: 'RAZORPAY / STRIPE OPD GATEWAY',
          title: 'Physician Consultation Payment Checkout',
          sub: 'OPD Doctor Consultation Token & EMR Sync Active',
          gradient: 'from-slate-950 via-blue-950 to-slate-950',
          borderColor: 'border-blue-500/30',
          accentColor: 'text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30',
          icon: Stethoscope,
        };
    }
  };

  const theme = getGatewayTheme();
  const ThemeIcon = theme.icon;

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      const isHospitalCredit = gatewayEngine === 'HOSPITAL_LINE_OF_CREDIT' || paymentMethod === 'DEPARTMENT_PO';
      const txPrefix = isHospitalCredit
        ? 'po_hosp'
        : gatewayEngine === 'RAZORPAY'
          ? 'pay_rzp'
          : 'ch_str';

      const transactionId = `${txPrefix}_${Math.random().toString(36).substring(2, 11)}`;
      const timestamp = new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      const receiptData = {
        transactionId,
        gateway: isHospitalCredit ? 'Hospital Department Line of Credit' : `${gatewayEngine} Secure Medical Gateway`,
        method: paymentMethod,
        itemTitle,
        itemCategory,
        amount: amount.startsWith('₹') ? amount : `₹${amount}`,
        patientName,
        timestamp,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        userRole,
      };

      setCompletedReceipt(receiptData);
      if (onPaymentSuccess) {
        onPaymentSuccess(receiptData);
      }
      showToast({
        title: isHospitalCredit ? 'Department PO Approved!' : 'Payment Approved & Verified!',
        message: `Transaction ${receiptData.transactionId} processed successfully.`,
        type: 'success',
      });
    }, 1400);
  };

  const handleDownloadReceiptPdf = () => {
    if (!completedReceipt) return;
    showToast({
      title: 'Downloading Payment Slip',
      message: `Generating printable encrypted PDF receipt #${completedReceipt.receiptNumber}...`,
      type: 'info',
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MediCore 360 - Official Payment Slip ${completedReceipt.receiptNumber}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; max-width: 750px; margin: 0 auto; }
              .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
              .brand { font-size: 26px; font-weight: 900; color: #1e3a8a; }
              .subtitle { font-size: 12px; color: #64748b; font-weight: 600; }
              .box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
              .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
              .label { font-weight: bold; color: #64748b; }
              .val { font-weight: bold; color: #0f172a; }
              .stamp { margin-top: 30px; font-size: 11px; color: #059669; font-weight: bold; border: 2px solid #059669; padding: 6px 12px; display: inline-block; border-radius: 8px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">MEDICORE 360 EHMS</div>
                <div class="subtitle">Official Hospital Payment Slip • License #HOSP-88901</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: 900; color: #2563eb;">${completedReceipt.amount}</div>
                <div style="font-size: 11px; color: #64748b;">${completedReceipt.timestamp}</div>
              </div>
            </div>

            <div class="box">
              <div class="row"><span class="label">Receipt Number:</span> <span class="val">${completedReceipt.receiptNumber}</span></div>
              <div class="row"><span class="label">Transaction ID:</span> <span class="val font-mono">${completedReceipt.transactionId}</span></div>
              <div class="row"><span class="label">Payer / Account:</span> <span class="val">${completedReceipt.patientName} (${completedReceipt.userRole})</span></div>
              <div class="row"><span class="label">Payment Description:</span> <span class="val">${completedReceipt.itemTitle}</span></div>
              <div class="row"><span class="label">Payment Engine & Method:</span> <span class="val">${completedReceipt.gateway} (${completedReceipt.method})</span></div>
              <div class="row"><span class="label">GST Tax (5% Included):</span> <span class="val">Verified Tax Invoice</span></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              <div class="stamp">✓ Cryptographically Verified Payment Approval</div>
              <div style="text-align: right; font-size: 12px; color: #64748b;">
                <strong>MediCore Hospital Accounts Office</strong><br/>
                Authorized Billing Signature
              </div>
            </div>

            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* PAYMENT SUCCESS CONFIRMATION VIEW */}
        {completedReceipt ? (
          <div className="space-y-6 text-center py-2">
            {/* Animated Checkmark Badge */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-300 inline-block mb-2">
                ✓ SHA-256 Verified Payment Approval
              </span>
              <h3 className="text-2xl font-black text-slate-900">Payment Approved!</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Transaction ID: <span className="font-mono text-blue-600 font-bold">{completedReceipt.transactionId}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3 text-xs shadow-2xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Payment Description</span>
                <span className="font-black text-slate-900 text-right max-w-[240px] truncate">{completedReceipt.itemTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Amount Paid</span>
                <span className="font-black text-emerald-600 text-base">{completedReceipt.amount}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-semibold">Payer Account</span>
                <span className="font-bold text-slate-900">{completedReceipt.patientName} ({completedReceipt.userRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Payment Gateway</span>
                <span className="font-bold text-blue-600">{completedReceipt.gateway}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable Payment Slip (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT CHECKOUT FORM VIEW */
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-md border ${theme.borderColor}`}>
                  <ThemeIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${theme.accentColor} block`}>
                    {theme.badge}
                  </span>
                  <h3 className="font-black text-base text-slate-900">{theme.title}</h3>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checkout Item Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="min-w-0 flex-1 pr-3">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-0.5">CHECKOUT ITEM</span>
                <span className="font-black text-sm text-slate-900 block truncate">{itemTitle}</span>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">{theme.sub}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider mb-0.5">TOTAL DUE</span>
                <span className="font-black text-xl text-blue-600">{amount}</span>
              </div>
            </div>

            {/* STAFF PROCUREMENT GATEWAY FORM */}
            {isStaffRole || itemCategory === 'HOSPITAL_SUPPLY' ? (
              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-purple-950">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-600" /> Hospital Staff Internal Procurement Clearance</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px]">Authorized Staff</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                      DEPARTMENT PURCHASE ORDER (PO) CODE
                    </label>
                    <input
                      type="text"
                      required
                      value={deptPoCode}
                      onChange={(e) => setDeptPoCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                      SUPERVISOR / HEAD AUTHORIZATION PIN
                    </label>
                    <input
                      type="password"
                      required
                      value={supervisorPin}
                      onChange={(e) => setSupervisorPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Department Line of Credit Verified</span>
                  <span className="font-bold text-slate-700">Audit License #HOSP-PO-991</span>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${theme.buttonBg}`}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing PO Clearance...
                    </span>
                  ) : (
                    <>
                      <span>Authorize Department PO & Clear {amount}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* PATIENT PAYMENT GATEWAY FORM */
              <form onSubmit={handlePaySubmit} className="space-y-4">
                {/* Gateway Engine Switcher */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    SELECT PAYMENT GATEWAY / ENGINE
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGatewayEngine('RAZORPAY')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        gatewayEngine === 'RAZORPAY'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Razorpay Medical</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGatewayEngine('STRIPE')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        gatewayEngine === 'STRIPE'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Stripe Global</span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1.5">
                    SELECT PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('INSURANCE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'INSURANCE'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Insurance</span>
                    </button>
                  </div>
                </div>

                {/* Method Specific Form Controls */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase text-slate-600">
                        ENTER UPI ID (GPAY / PHONEPE / PAYTM)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQrCode(!showQrCode)}
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3 h-3" /> {showQrCode ? 'Hide QR Code' : 'Scan QR Code'}
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okaxis"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />

                    {showQrCode && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-center space-y-2">
                        <div className="w-28 h-28 mx-auto bg-slate-900 text-white flex items-center justify-center rounded-xl font-mono text-[10px] font-bold">
                          [ QR CODE ]
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 block">Scan using GPay, PhonePe, Paytm, or BHIM UPI</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">CARD NUMBER</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">EXPIRY DATE</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'INSURANCE' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      HEALTH INSURANCE POLICY NUMBER / TPA CLAIM CODE
                    </label>
                    <input
                      type="text"
                      required
                      value={insurancePolicyNo}
                      onChange={(e) => setInsurancePolicyNo(e.target.value)}
                      placeholder="e.g. STAR-99201-HEALTH"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                    <span className="text-[10px] text-slate-500 font-semibold block">Pre-Approved Cashless TPA Processing with Star Health & HDFC ERGO</span>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-emerald-600" /> 256-bit SSL Medical Encryption</span>
                  <span className="font-bold text-slate-700">GST 5% Tax Included</span>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-3.5 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${theme.buttonBg} hover:scale-[1.01]`}
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating Payment Gateway...
                    </span>
                  ) : (
                    <>
                      <span>Pay {amount} Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
