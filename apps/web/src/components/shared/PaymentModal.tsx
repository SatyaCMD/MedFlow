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
  ChevronRight,
  Printer,
  Copy,
  ExternalLink,
  FileText
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
  const [activeTab, setActiveTab] = useState<'SLIP_PREVIEW' | 'TAX_DETAILS' | 'SECURITY'>('SLIP_PREVIEW');

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

      // Clean raw numeric price string
      const rawPrice = parseFloat(amount.replace(/[^0-9.]/g, '')) || 1500;
      const gstTax = (rawPrice * 0.05).toFixed(2);
      const baseAmount = (rawPrice - parseFloat(gstTax)).toFixed(2);

      const receiptData = {
        transactionId,
        gateway: isHospitalCredit ? 'Hospital Department Line of Credit' : `${gatewayEngine} Secure Medical Gateway`,
        method: paymentMethod,
        itemTitle,
        itemCategory,
        amount: amount.startsWith('₹') ? amount : `₹${amount}`,
        baseAmount: `₹${baseAmount}`,
        gstTax: `₹${gstTax}`,
        patientName,
        timestamp,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        userRole,
        hsnCode: '999312 (Healthcare Services)',
        gstin: '27AABCM8819Q1ZM',
        hospitalLicense: 'HOSP-NABL-88901',
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
      title: 'Generating PDF Payment Slip',
      message: `Preparing high-resolution encrypted PDF slip #${completedReceipt.receiptNumber}...`,
      type: 'info',
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>MediCore 360 EHMS — Official Payment Slip ${completedReceipt.receiptNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
              
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                background-color: #f1f5f9;
                color: #0f172a;
                padding: 40px 20px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .slip-container {
                max-width: 800px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05);
                overflow: hidden;
                border: 1px solid #cbd5e1;
              }

              /* Top Premium Dark Brand Banner */
              .brand-header {
                background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);
                color: #ffffff;
                padding: 36px 40px;
                position: relative;
                border-bottom: 4px solid #3b82f6;
              }
              .brand-header-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .brand-logo-title {
                font-size: 28px;
                font-weight: 900;
                letter-spacing: -0.5px;
                color: #ffffff;
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .brand-subtitle {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: #93c5fd;
                margin-top: 4px;
              }
              .header-badge {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 12px;
                text-align: right;
              }
              .header-badge-num {
                font-size: 18px;
                font-weight: 900;
                color: #60a5fa;
                font-family: monospace;
              }
              .header-badge-lbl {
                font-size: 10px;
                font-weight: 700;
                color: #cbd5e1;
                text-transform: uppercase;
              }

              .hospital-meta {
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.15);
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #94a3b8;
                font-weight: 500;
              }

              /* Main Body Content */
              .slip-body {
                padding: 40px;
              }

              /* 2-Column Details Grid */
              .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
                margin-bottom: 32px;
              }
              .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 20px;
              }
              .card-label {
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-bottom: 12px;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 6px;
              }
              .card-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
              }
              .card-row:last-child { margin-bottom: 0; }
              .prop-name { color: #64748b; font-weight: 600; }
              .prop-val { color: #0f172a; font-weight: 700; text-align: right; }
              .mono { font-family: monospace; color: #2563eb; }

              /* Table Styling */
              .invoice-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                overflow: hidden;
                margin-bottom: 32px;
              }
              .invoice-table th {
                background: #0f172a;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 14px 20px;
                text-align: left;
              }
              .invoice-table td {
                padding: 16px 20px;
                font-size: 13px;
                border-bottom: 1px solid #f1f5f9;
              }
              .invoice-table tr:last-child td { border-bottom: none; }
              .invoice-table tr:nth-child(even) td { background: #f8fafc; }

              /* Total Due Banner */
              .total-banner {
                background: #eff6ff;
                border: 1.5px solid #bfdbfe;
                border-radius: 16px;
                padding: 20px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
              }
              .total-title { font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase; }
              .total-sub { font-size: 11px; font-weight: 600; color: #3b82f6; }
              .total-val { font-size: 28px; font-weight: 900; color: #1e3a8a; }

              /* Footer & Verification Seal */
              .slip-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 24px;
                border-top: 2px dashed #cbd5e1;
              }
              .security-seal {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .qr-box {
                width: 64px;
                height: 64px;
                background: #0f172a;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 9px;
                font-family: monospace;
                text-align: center;
                padding: 4px;
              }
              .seal-badge {
                background: #ecfdf5;
                border: 1.5px solid #a7f3d0;
                color: #047857;
                padding: 8px 14px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
              }

              .signatory {
                text-align: right;
              }
              .signatory-title { font-size: 12px; font-weight: 800; color: #0f172a; }
              .signatory-sub { font-size: 10px; font-weight: 600; color: #64748b; }

              .disclaimer {
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
                margin-top: 24px;
                font-weight: 500;
              }

              @media print {
                body { background: white; padding: 0; }
                .slip-container { border: none; box-shadow: none; border-radius: 0; }
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              <!-- Top Dark Header Banner -->
              <div class="brand-header">
                <div class="brand-header-top">
                  <div>
                    <div class="brand-logo-title">
                      <span>🏥</span> MEDICORE 360 HEALTHCARE
                    </div>
                    <div class="brand-subtitle">
                      Official Payment Acknowledgment & Tax Invoice
                    </div>
                  </div>
                  <div class="header-badge">
                    <div class="header-badge-lbl">Receipt Number</div>
                    <div class="header-badge-num">${completedReceipt.receiptNumber}</div>
                  </div>
                </div>

                <div class="hospital-meta">
                  <span>Lic #: ${completedReceipt.hospitalLicense}</span>
                  <span>GSTIN: ${completedReceipt.gstin}</span>
                  <span>ISO 9001:2025 Certified Medical Center</span>
                </div>
              </div>

              <!-- Main Body Content -->
              <div class="slip-body">
                <!-- 2-Column Info Grid -->
                <div class="grid-2">
                  <div class="info-card">
                    <div class="card-label">Patient & Payer Information</div>
                    <div class="card-row">
                      <span class="prop-name">Patient Name:</span>
                      <span class="prop-val">${completedReceipt.patientName}</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Account Scope:</span>
                      <span class="prop-val">${completedReceipt.userRole || 'PATIENT'}</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Health ABHA ID:</span>
                      <span class="prop-val mono">91-8821-4920</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Payment Status:</span>
                      <span class="prop-val" style="color: #047857;">✓ SUCCESSFUL (SETTLED)</span>
                    </div>
                  </div>

                  <div class="info-card">
                    <div class="card-label">Transaction Audit Trail</div>
                    <div class="card-row">
                      <span class="prop-name">Transaction ID:</span>
                      <span class="prop-val mono">${completedReceipt.transactionId}</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Payment Engine:</span>
                      <span class="prop-val">${completedReceipt.gateway}</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Payment Method:</span>
                      <span class="prop-val">${completedReceipt.method}</span>
                    </div>
                    <div class="card-row">
                      <span class="prop-name">Date & Time:</span>
                      <span class="prop-val">${completedReceipt.timestamp}</span>
                    </div>
                  </div>
                </div>

                <!-- Itemized Invoice Table -->
                <table class="invoice-table">
                  <thead>
                    <tr>
                      <th>Service / Medical Description</th>
                      <th>Category Scope</th>
                      <th>HSN / SAC Code</th>
                      <th style="text-align: right;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 700; color: #0f172a;">${completedReceipt.itemTitle}</td>
                      <td><span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">${completedReceipt.itemCategory}</span></td>
                      <td style="font-family: monospace; color: #64748b;">${completedReceipt.hsnCode}</td>
                      <td style="text-align: right; font-weight: 800; color: #0f172a;">${completedReceipt.baseAmount}</td>
                    </tr>
                    <tr>
                      <td colspan="3" style="text-align: right; font-weight: 600; color: #64748b;">GST Tax (5% Healthcare Standard):</td>
                      <td style="text-align: right; font-weight: 700; color: #64748b;">${completedReceipt.gstTax}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Total Amount Banner -->
                <div class="total-banner">
                  <div>
                    <div class="total-title">Total Amount Paid (Inclusive of Taxes)</div>
                    <div class="total-sub">Payment Verified via 256-bit SSL Medical Gateway</div>
                  </div>
                  <div class="total-val">${completedReceipt.amount}</div>
                </div>

                <!-- Footer & Digital Verification Seal -->
                <div class="slip-footer">
                  <div class="security-seal">
                    <div class="qr-box">
                      [ QR VERIFY ]<br/>SHA-256
                    </div>
                    <div class="seal-badge">
                      ✓ CRYPTOGRAPHICALLY SIGNED & VERIFIED
                    </div>
                  </div>

                  <div class="signatory">
                    <div className="signatory-title">MediCore Hospital Accounts Office</div>
                    <div className="signatory-sub">Digitally Authorized Signatory Stamp</div>
                  </div>
                </div>

                <div class="disclaimer">
                  This is an official computer-generated medical tax invoice & payment receipt issued under Section 31 of the GST Act. Valid without manual signature when verified digitally.
                </div>
              </div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const copyTxIdToClipboard = () => {
    if (!completedReceipt) return;
    navigator.clipboard.writeText(completedReceipt.transactionId);
    showToast({ title: 'Transaction ID Copied!', message: completedReceipt.transactionId, type: 'success' });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* PAYMENT SUCCESS CONFIRMATION VIEW */}
        {completedReceipt ? (
          <div className="space-y-6">
            {/* Header Success Ribbon */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md">
                    <CheckCircle2 className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      ✓ Cryptographically Verified Settlement
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">Payment Approved & Verified!</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">RECEIPT NO</span>
                  <span className="font-mono text-sm font-black text-blue-300">{completedReceipt.receiptNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-800/80 text-slate-300">
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  TxID: <strong className="text-white">{completedReceipt.transactionId}</strong>
                  <button onClick={copyTxIdToClipboard} className="text-blue-400 hover:text-blue-300 cursor-pointer p-0.5" title="Copy TxID">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="text-slate-400">{completedReceipt.timestamp}</span>
              </div>
            </div>

            {/* Interactive Tab Switcher for Receipt Voucher Inspection */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('SLIP_PREVIEW')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'SLIP_PREVIEW'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Voucher Slip View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TAX_DETAILS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'TAX_DETAILS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>GST Tax Breakdown</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('SECURITY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'SECURITY'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SSL Security</span>
              </button>
            </div>

            {/* Tab 1: Interactive Voucher Slip View */}
            {activeTab === 'SLIP_PREVIEW' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">CHECKOUT ITEM</span>
                    <strong className="text-slate-900 text-sm block">{completedReceipt.itemTitle}</strong>
                    <span className="text-blue-600 font-bold block mt-0.5">Category: {completedReceipt.itemCategory}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">TOTAL AMOUNT PAID</span>
                    <strong className="text-emerald-600 text-2xl font-black block">{completedReceipt.amount}</strong>
                    <span className="text-slate-500 font-semibold block text-[10px]">Taxes Included (5% GST)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-700 font-semibold">
                  <div><span className="text-slate-400 block text-[10px] font-bold">PAYER NAME</span><strong className="text-slate-900">{completedReceipt.patientName}</strong></div>
                  <div><span className="text-slate-400 block text-[10px] font-bold">PAYER ROLE</span><strong className="text-slate-900">{completedReceipt.userRole}</strong></div>
                  <div><span className="text-slate-400 block text-[10px] font-bold">GATEWAY ENGINE</span><strong className="text-blue-700">{completedReceipt.gateway}</strong></div>
                  <div><span className="text-slate-400 block text-[10px] font-bold">PAYMENT METHOD</span><strong className="text-slate-900">{completedReceipt.method}</strong></div>
                </div>
              </div>
            )}

            {/* Tab 2: GST Tax Breakdown View */}
            {activeTab === 'TAX_DETAILS' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Service / HSN Code:</span>
                  <span className="font-mono font-bold text-slate-900">{completedReceipt.hsnCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">Base Service Charge:</span>
                  <span className="font-bold text-slate-900">{completedReceipt.baseAmount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold">GST Tax (5% Standard):</span>
                  <span className="font-bold text-slate-900">{completedReceipt.gstTax}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1 text-slate-900">
                  <span>Grand Total Settled:</span>
                  <span className="text-blue-600">{completedReceipt.amount}</span>
                </div>
              </div>
            )}

            {/* Tab 3: Security & Verification */}
            {activeTab === 'SECURITY' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono text-[9px] font-bold text-center">
                    [ QR SEAL ]
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Cryptographically Signed Medical Receipt</h4>
                    <p className="text-slate-500 text-[11px] font-semibold">Verified against MediCore 360 SHA-256 Ledger • License #{completedReceipt.hospitalLicense}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceiptPdf}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] uppercase tracking-wider"
              >
                <Printer className="w-4 h-4 text-blue-200" />
                <span>Print & Save High-Resolution PDF Payment Slip</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl cursor-pointer transition-colors"
              >
                Close Receipt Window
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
