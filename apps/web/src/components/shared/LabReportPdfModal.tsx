'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
  Activity,
  UserCheck,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth, getResolvedPatientProfile } from '../../hooks/useAuth';

export interface LabReportModalData {
  reportId: string;
  patientName: string;
  mrn: string;
  age?: string;
  gender?: string;
  doctorName: string;
  department: string;
  testName: string;
  category: string;
  specimen: string;
  sampleCollectedAt: string;
  reportDate: string;
  technicianName: string;
  findings: Array<{
    parameter: string;
    result: string;
    unit: string;
    referenceRange: string;
    status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  }>;
  overallInterpretation: string;
  technicianNotes?: string;
  signatureHash: string;
}

interface LabReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData?: LabReportModalData;
}

export const LabReportPdfModal: React.FC<LabReportPdfModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const activeProfile = getResolvedPatientProfile(user);

  if (!isOpen) return null;

  const defaultSampleData: LabReportModalData = {
    reportId: 'LAB-2026-88192',
    patientName: activeProfile.displayName,
    mrn: activeProfile.mrn,
    age: activeProfile.age,
    gender: activeProfile.gender,
    doctorName: 'Dr. Devendra Roy, M.D.',
    department: 'Cardiology & Diagnostic Pathology',
    testName: 'Lipid Profile Panel & Fasting Serum Audit',
    category: 'Metabolic & Pathology',
    specimen: 'Venous Serum (EDTA Gold Top)',
    sampleCollectedAt: 'Jul 21, 2026 • 08:30 AM',
    reportDate: 'Jul 21, 2026 • 04:30 PM',
    technicianName: 'Rajesh Kumar, Chief Lab Specialist',
    findings: [
      { parameter: 'Total Cholesterol', result: '215', unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'ELEVATED' },
      { parameter: 'HDL (High-Density Lipoprotein)', result: '46', unit: 'mg/dL', referenceRange: '> 40 mg/dL', status: 'NORMAL' },
      { parameter: 'LDL (Low-Density Lipoprotein)', result: '138', unit: 'mg/dL', referenceRange: '< 100 mg/dL', status: 'ELEVATED' },
      { parameter: 'Triglycerides', result: '160', unit: 'mg/dL', referenceRange: '< 150 mg/dL', status: 'ELEVATED' },
      { parameter: 'VLDL Cholesterol', result: '31', unit: 'mg/dL', referenceRange: '5 - 40 mg/dL', status: 'NORMAL' },
    ],
    overallInterpretation: 'Mild hyperlipidemia noted with elevated LDL and Triglycerides. Statin therapy and dietary counseling recommended.',
    technicianNotes: 'Sample processed on automated Sysmex XN-550 biochemistry analyzer. Internal QC controls passed.',
    signatureHash: 'SHA256: 9e0011a45bb921c44fae8901239ab',
  };

  const data = reportData || defaultSampleData;

  const handlePrintDownload = () => {
    showToast({
      title: 'Downloading Diagnostic Report PDF 🧪',
      message: `Generating encrypted lab report document #${data.reportId}...`,
      type: 'info',
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>MediFlow 360 - Official Diagnostic Lab Report ${data.reportId}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: 'Inter', sans-serif;
                padding: 40px;
                color: #0f172a;
                max-width: 800px;
                margin: 0 auto;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header { border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-space: space-between; align-items: center; }
              .brand { font-size: 24px; font-weight: 900; color: #312e81; }
              .subtitle { font-size: 11px; color: #64748b; font-weight: 600; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 25px; font-size: 12px; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
              .table th { background: #4f46e5; color: white; padding: 10px; text-align: left; font-weight: 800; }
              .table td { border-bottom: 1px solid #e2e8f0; padding: 10px; font-weight: 600; }
              .badge-elevated { color: #c2410c; background: #fff7ed; padding: 3px 8px; border-radius: 6px; font-weight: 800; }
              .badge-normal { color: #15803d; background: #f0fdf4; padding: 3px 8px; border-radius: 6px; font-weight: 800; }
              .footer { border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px; display: flex; justify-space: space-between; font-size: 11px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">MediFlow Diagnostic Pathology</div>
                <div class="subtitle">NABH & NABL Accredited Central Pathology Station • ISO 15189 Certified</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 900; font-size: 14px; color: #4f46e5;">REPORT #${data.reportId}</div>
                <div style="font-size: 11px; color: #64748b;">Issued: ${data.reportDate}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div><strong>Patient Name:</strong> ${data.patientName} (${data.gender}, ${data.age})</div>
              <div><strong>MRN / UHID:</strong> ${data.mrn}</div>
              <div><strong>Referring Doctor:</strong> ${data.doctorName}</div>
              <div><strong>Department:</strong> ${data.department}</div>
              <div><strong>Test Prescribed:</strong> ${data.testName}</div>
              <div><strong>Specimen:</strong> ${data.specimen}</div>
            </div>

            <h3 style="font-size: 14px; font-weight: 900; margin-bottom: 12px; color: #312e81;">DIAGNOSTIC PATHOLOGY FINDINGS</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Test Parameter</th>
                  <th>Observed Result</th>
                  <th>Biological Reference Interval</th>
                  <th>Flag / Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.findings
                  .map(
                    (f) => `
                  <tr>
                    <td><strong>${f.parameter}</strong></td>
                    <td><strong>${f.result} ${f.unit}</strong></td>
                    <td>${f.referenceRange}</td>
                    <td><span class="${f.status === 'ELEVATED' ? 'badge-elevated' : 'badge-normal'}">${f.status}</span></td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 25px; font-size: 12px;">
              <strong style="color: #312e81; display: block; margin-bottom: 4px;">Pathologist Clinical Interpretation:</strong>
              ${data.overallInterpretation}
            </div>

            <div class="footer">
              <div>
                <div>Sign-off: <strong>${data.technicianName}</strong></div>
                <div>Hash: ${data.signatureHash}</div>
              </div>
              <div style="text-align: right;">
                <div>Verified by: <strong>${data.doctorName}</strong></div>
                <div>256-Bit Encrypted Diagnostic Vault</div>
              </div>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <span>Official Diagnostic Lab Report</span>
                <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded-full">
                  NABL Certified
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Report #{data.reportId} • Issued on {data.reportDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient & Doctor Meta */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/90 p-4 rounded-2xl text-xs font-semibold text-slate-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Details</span>
            <span className="font-black text-slate-900 block">{data.patientName} ({data.gender}, {data.age})</span>
            <span className="text-slate-500 block">MRN: {data.mrn}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescribing Doctor</span>
            <span className="font-black text-slate-900 block">{data.doctorName}</span>
            <span className="text-slate-500 block">{data.department}</span>
          </div>
        </div>

        {/* Test Name Header */}
        <div className="p-4 bg-indigo-900 text-white rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-extrabold text-indigo-300 tracking-wider block">Diagnostic Investigation</span>
          <h4 className="font-black text-base">{data.testName}</h4>
          <span className="text-xs text-indigo-200 block">Specimen: {data.specimen} • Collected: {data.sampleCollectedAt}</span>
        </div>

        {/* Pathology Parameters Table */}
        <div className="space-y-2">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">Observed Laboratory Parameters</h5>
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-black text-slate-700">
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Reference Interval</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {data.findings.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">{f.parameter}</td>
                    <td className="p-3 font-black text-indigo-950">{f.result} {f.unit}</td>
                    <td className="p-3 text-slate-500">{f.referenceRange}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        f.status === 'ELEVATED' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pathologist Interpretation */}
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl space-y-1 text-xs">
          <span className="font-extrabold text-slate-900 block">Pathologist Clinical Interpretation:</span>
          <p className="text-slate-700 font-medium leading-relaxed">{data.overallInterpretation}</p>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted Lab Vault</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrintDownload}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download & Print PDF Report</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
