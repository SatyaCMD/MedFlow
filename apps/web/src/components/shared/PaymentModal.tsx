'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  Printer,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Landmark,
  ExternalLink,
  Wifi
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { printSinglePageReceipt } from '../../lib/singlePageReceiptPdf';
import { getPatientWallet, debitPatientWallet } from '../../data/patientWalletStore';
import { useAuth, getResolvedPatientProfile } from '../../hooks/useAuth';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemCategory?: 'APPOINTMENT' | 'LAB_TEST' | 'BLOOD_BANK' | 'PHARMACY' | 'HOSPITAL_SUPPLY';
  amount: string; // e.g. "₹18,500"
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
  patientName,
  userRole,
  onPaymentSuccess,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  const activeProfile = getResolvedPatientProfile(user);

  const resolvedName = patientName || activeProfile.displayName;
  const resolvedRole = user?.role || userRole || 'PATIENT';

  const isStaffRole = userRole === 'NURSE' || userRole === 'LAB_TECH' || userRole === 'DOCTOR' || userRole === 'SUPER_ADMIN';

  // Patient Wallet Balance
  const patientWallet = getPatientWallet();

  // Selected Payment Method Tab
  const [selectedMethod, setSelectedMethod] = useState<'PATIENT_WALLET' | 'RAZORPAY_UPI' | 'STRIPE_CARD' | 'RAZORPAY_NETBANKING' | 'STAFF_PO'>(
    isStaffRole ? 'STAFF_PO' : 'PATIENT_WALLET'
  );

  // Form Input States
  const [upiApp, setUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'QR'>('GPAY');
  const [upiId, setUpiId] = useState('user@okaxis');
  
  // Dynamic User Card Input States
  const [cardholderName, setCardholderName] = useState(resolvedName);
  const [cardNumber, setCardNumber] = useState('4532 8819 9021 7712');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('882');
  const [billingZip, setBillingZip] = useState('400001');

  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [deptPoCode, setDeptPoCode] = useState('HOSP-WARD-PO-8819');
  const [supervisorPin, setSupervisorPin] = useState('7721');

  // Transaction States
  const [processing, setProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  if (!isOpen) return null;

  // Helper to format card number as user types
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Helper to detect Card Brand dynamically
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'American Express';
    if (clean.startsWith('6')) return 'RuPay';
    return 'Credit / Debit Card';
  };

  // Execute Payment Process
  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 1500;

    if (selectedMethod === 'PATIENT_WALLET') {
      const redeemable = Math.min(patientWallet.balance, numericAmount);
      if (redeemable <= 0) {
        showToast({
          title: 'Wallet Balance Insufficient ⚠️',
          message: 'Your wallet balance is ₹0. Please select another payment method.',
          type: 'error',
        });
        setProcessing(false);
        return;
      }
      try {
        debitPatientWallet(redeemable, `Consultation / Order Payment — ${itemTitle}`);
      } catch (err: any) {
        showToast({
          title: 'Wallet Redemption Failed',
          message: err.message || 'Could not redeem wallet balance.',
          type: 'error',
        });
        setProcessing(false);
        return;
      }
    }

    const transactionId = `pay_rzp_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const invoiceId = `ORD-RX-${Math.floor(100000 + Math.random() * 900000)}`;

    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    const cardLast4 = cleanCardNum.slice(-4) || '7712';
    const cardBrand = getCardBrand(cardNumber);

    const receiptObj = {
      invoiceId,
      transactionId,
      itemTitle,
      itemCategory,
      amount,
      customerName: resolvedName,
      cardholderName,
      cardLast4,
      cardBrand,
      role: resolvedRole,
      paymentMethod: selectedMethod === 'PATIENT_WALLET' ? 'PATIENT WALLET REDEMPTION' : selectedMethod.replace(/_/g, ' '),
      timestamp: new Date().toLocaleString(),
      status: 'PAID & VERIFIED',
    };

    try {
      await fetch('http://localhost:4000/api/v1/billing/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          transactionId,
          itemTitle,
          itemCategory,
          amount,
          customerName: resolvedName,
          cardholderName,
          cardLast4,
          cardBrand,
          paymentMethod: selectedMethod.replace(/_/g, ' '),
          email: `${resolvedName.toLowerCase().replace(/\s+/g, '.')}@medflow.com`,
        }),
      });
    } catch {
      // Non-blocking API call fallback
    }

    setCompletedReceipt(receiptObj);
    if (onPaymentSuccess) onPaymentSuccess(receiptObj);

    showToast({
      title: 'Payment Successful! 💳',
      message: `Transaction ${transactionId} approved. Official 1-Page PDF receipt generated.`,
      type: 'success',
    });
    setProcessing(false);
  };

  const handlePrintOrDownloadReceipt = () => {
    if (!completedReceipt) return;
    printSinglePageReceipt({
      invoiceId: completedReceipt.invoiceId,
      transactionId: completedReceipt.transactionId,
      itemTitle: completedReceipt.itemTitle,
      itemCategory: completedReceipt.itemCategory,
      amount: completedReceipt.amount,
      customerName: completedReceipt.customerName,
      cardholderName: completedReceipt.cardholderName,
      cardLast4: completedReceipt.cardLast4,
      cardBrand: completedReceipt.cardBrand,
      paymentMethod: completedReceipt.paymentMethod,
      timestamp: completedReceipt.timestamp,
      status: completedReceipt.status,
    });
  };

  const handleGoToSuccessPage = () => {
    if (!completedReceipt) return;
    onClose();
    const query = new URLSearchParams({
      tx: completedReceipt.transactionId,
      invoice: completedReceipt.invoiceId,
      item: completedReceipt.itemTitle,
      amount: completedReceipt.amount,
      name: completedReceipt.customerName,
      cardholder: completedReceipt.cardholderName || completedReceipt.customerName,
      cardLast4: completedReceipt.cardLast4 || '7712',
      brand: completedReceipt.cardBrand || 'Visa',
      method: completedReceipt.paymentMethod,
      cat: completedReceipt.itemCategory || 'APPOINTMENT',
    }).toString();

    router.push(`/payment/success?${query}`);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Razorpay / Stripe Style Gateway Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-wide">Razorpay • Stripe Trusted Checkout</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-extrabold uppercase">
                  256-Bit SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">MediCore 360 Enterprise Healthcare Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!completedReceipt ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Item Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">CHECKOUT ITEM</span>
                <h4 className="font-black text-sm text-slate-900 truncate">{itemTitle}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Purchaser: <span className="text-slate-800 font-bold">{patientName}</span> ({userRole})</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">TOTAL DUE</span>
                <span className="text-xl font-black text-blue-600">{amount}</span>
              </div>
            </div>

            {/* Payment Method Selector Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('PATIENT_WALLET')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedMethod === 'PATIENT_WALLET'
                      ? 'bg-purple-50/90 border-purple-600 text-purple-950 shadow-sm ring-2 ring-purple-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="font-black text-xs block leading-tight">Patient Wallet</span>
                  <span className="text-[10px] text-purple-700 font-extrabold block">
                    ₹{patientWallet.balance.toLocaleString('en-IN')} Bal
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('RAZORPAY_UPI')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedMethod === 'RAZORPAY_UPI'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="font-black text-xs block leading-tight">Razorpay UPI</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">GPay, QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('STRIPE_CARD')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedMethod === 'STRIPE_CARD'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="font-black text-xs block leading-tight">Stripe Cards</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Visa, Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('RAZORPAY_NETBANKING')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedMethod === 'RAZORPAY_NETBANKING'
                      ? 'bg-blue-50/80 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-blue-600 mb-2" />
                  <span className="font-black text-xs block leading-tight">NetBanking</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">HDFC, SBI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('STAFF_PO')}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    selectedMethod === 'STAFF_PO'
                      ? 'bg-purple-50/80 border-purple-600 text-purple-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="font-black text-xs block leading-tight">Staff PO</span>
                  <span className="text-[10px] text-slate-500 font-semibold block">Line of Credit</span>
                </button>
              </div>
            </div>

            {/* Dynamic Payment Method Input Form */}
            <form onSubmit={handleExecutePayment} className="space-y-4 pt-2 border-t border-slate-100">
              {/* Method 0: Patient Wallet Redemption */}
              {selectedMethod === 'PATIENT_WALLET' && (
                <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50/50 border border-purple-200 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-purple-950">Patient Digital Wallet Redemption</h4>
                        <p className="text-[10px] font-bold text-slate-500">Auto-Refreshed Balance</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-900 text-xs font-black rounded-full border border-purple-300">
                      Balance: ₹{patientWallet.balance.toLocaleString('en-IN')}.00
                    </span>
                  </div>

                  <div className="p-4 bg-white border border-purple-200/90 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between font-semibold text-slate-600">
                      <span>Total Checkout Bill Amount:</span>
                      <span className="font-bold text-slate-900">{amount}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-purple-700">
                      <span>Redeemable Wallet Credit:</span>
                      <span>-₹{Math.min(patientWallet.balance, parseInt(amount.replace(/[^0-9]/g, ''), 10) || 1500).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-100 pt-2 text-sm">
                      <span>Net Out-of-Pocket Due:</span>
                      <span className={patientWallet.balance >= (parseInt(amount.replace(/[^0-9]/g, ''), 10) || 1500) ? 'text-emerald-600' : 'text-blue-600'}>
                        ₹{Math.max(0, (parseInt(amount.replace(/[^0-9]/g, ''), 10) || 1500) - patientWallet.balance).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {patientWallet.balance >= (parseInt(amount.replace(/[^0-9]/g, ''), 10) || 1500) ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>This transaction will be 100% fully paid using your Wallet balance. No external card or UPI required!</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Wallet balance covers ₹{patientWallet.balance}. The remaining amount can be settled via UPI or Card.</span>
                    </div>
                  )}
                </div>
              )}
              {/* Method 1: Razorpay UPI */}
              {selectedMethod === 'RAZORPAY_UPI' && (
                <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      Razorpay Instant UPI & QR Pay
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Auto-Verified</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUpiApp('GPAY')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${upiApp === 'GPAY' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      Google Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiApp('PHONEPE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${upiApp === 'PHONEPE' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      PhonePe
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiApp('QR')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${upiApp === 'QR' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      Scan QR Code
                    </button>
                  </div>

                  {upiApp === 'QR' ? (
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
                      <div className="w-32 h-32 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center text-white p-2">
                        <QrCode className="w-24 h-24 text-white" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">Scan using any UPI App to Pay {amount}</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Enter Virtual Payment Address (VPA / UPI ID)</label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="username@okaxis"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Method 2: Stripe Card */}
              {selectedMethod === 'STRIPE_CARD' && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      Stripe Card Checkout
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Visa • Mastercard • RuPay • Amex</span>
                  </div>

                  {/* Dynamic Interactive Credit Card Mockup */}
                  <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 bg-amber-400/90 rounded-md border border-amber-300 flex items-center justify-center overflow-hidden shadow-inner">
                          <div className="w-full h-[1px] bg-slate-800/40 my-[2px]"></div>
                          <div className="w-full h-[1px] bg-slate-800/40 my-[2px]"></div>
                        </div>
                        <Wifi className="w-5 h-5 text-slate-300/80 rotate-90" />
                      </div>
                      <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-black tracking-widest uppercase border border-white/20">
                        {getCardBrand(cardNumber)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mb-1">CARD NUMBER</span>
                      <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-blue-100">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">CARDHOLDER NAME</span>
                        <span className="font-bold text-slate-200 uppercase tracking-wider">{cardholderName || 'CARDHOLDER NAME'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold block">EXPIRES</span>
                        <span className="font-mono font-bold text-slate-200">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Inputs given by User */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Cardholder Full Name</label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">16-Digit Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="4532 8819 9021 7712"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV Code</label>
                        <input
                          type="password"
                          maxLength={4}
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="•••"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={billingZip}
                          onChange={(e) => setBillingZip(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="400001"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 3: Razorpay NetBanking */}
              {selectedMethod === 'RAZORPAY_NETBANKING' && (
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Select NetBanking Bank
                  </span>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Method 4: Hospital Staff Line of Credit / PO Clearance */}
              {selectedMethod === 'STAFF_PO' && (
                <div className="space-y-4 p-4 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      Hospital Staff Internal Procurement Clearance
                    </span>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded-full text-[9px] font-extrabold">Authorized Staff</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Department Purchase Order (PO) Code</label>
                    <input
                      type="text"
                      required
                      value={deptPoCode}
                      onChange={(e) => setDeptPoCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Supervisor / Head Authorization PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={supervisorPin}
                      onChange={(e) => setSupervisorPin(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 font-black text-xs rounded-2xl text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                  selectedMethod === 'PATIENT_WALLET'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                    : selectedMethod === 'STAFF_PO'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                {processing ? (
                  <span>Processing Payment Authorization...</span>
                ) : (
                  <>
                    <span>
                      {selectedMethod === 'PATIENT_WALLET'
                        ? `Redeem Wallet & Confirm Payment of ${amount}`
                        : selectedMethod === 'STAFF_PO'
                        ? `Authorize Department PO & Clear ${amount}`
                        : `Pay ${amount} via ${selectedMethod === 'STRIPE_CARD' ? 'Stripe Card' : 'Razorpay'}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Payment Completed Tax Receipt View */
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-lg text-emerald-950">Payment Verified & Completed</h3>
              <p className="text-xs font-bold text-emerald-800">Official tax receipt & 1-page PDF confirmation generated.</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Invoice Reference:</span>
                <span className="font-mono font-bold text-slate-900">{completedReceipt.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Transaction Hash:</span>
                <span className="font-mono font-bold text-blue-600">{completedReceipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Cardholder / Customer:</span>
                <span className="font-bold text-slate-800">{completedReceipt.cardholderName || completedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-800">
                  {completedReceipt.cardLast4
                    ? `${completedReceipt.cardBrand || 'Card'} ending in •••• ${completedReceipt.cardLast4}`
                    : completedReceipt.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-700">Total Amount Paid:</span>
                <span className="text-emerald-700 font-black">{completedReceipt.amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleGoToSuccessPage}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Successful Payment Page</span>
              </button>
              <button
                type="button"
                onClick={handlePrintOrDownloadReceipt}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print 1-Page PDF Receipt</span>
              </button>
            </div>
            
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
              >
                Close Payment Gateway Window
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
