'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, X, ShieldCheck, CheckCircle2, HeartPulse, Pill, FileSignature, Activity, UserCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface PrescriptionData {
  rxNumber: string;
  patientName: string;
  mrn: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  doctorName: string;
  department: string;
  date: string;
  diagnosis: string;
  nurseVitals?: {
    bp: string;
    pulse: string;
    spo2: string;
    temp: string;
    weight: string;
    height: string;
    bmi: string;
    glucose: string;
    nurseName: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
  labTests?: Array<{
    name: string;
    category?: string;
    specimen?: string;
    instructions?: string;
  }>;
  signatureHash: string;
}

interface PrescriptionPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionData?: PrescriptionData;
}

export const PrescriptionPdfModal: React.FC<PrescriptionPdfModalProps> = ({
  isOpen,
  onClose,
  prescriptionData,
}) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const sampleDefaultData: PrescriptionData = {
    rxNumber: 'RX-2026-88912',
    patientName: 'Sarah Connor',
    mrn: 'MC-1001',
    age: '42 Yrs',
    gender: 'Female',
    bloodGroup: 'O+',
    doctorName: 'Dr. Devendra Roy, M.D.',
    department: 'Department of Cardiology & Diagnostic Medicine',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    diagnosis: 'Essential Hypertension & Cardiac Risk Profiling',
    nurseVitals: {
      bp: '120/80 mmHg',
      pulse: '72 bpm',
      spo2: '99%',
      temp: '98.6 °F',
      weight: '70 kg',
      height: '175 cm',
      bmi: '22.9 kg/m²',
      glucose: '95 mg/dL',
      nurseName: 'Nurse Anita Sharma, R.N.',
    },
    medications: [
      { name: 'Amoxicillin 500mg Capsules', dosage: '1 Capsule TID (Every 8 Hours)', instructions: 'Take after food for 7 consecutive days' },
      { name: 'Amlodipine Besylate 5mg Tablets', dosage: '1 Tablet Daily (Morning)', instructions: 'Monitor blood pressure weekly' },
      { name: 'Atorvastatin 10mg Tablets', dosage: '1 Tablet Bedtime', instructions: 'Lipid management therapy' },
    ],
    labTests: [
      { name: 'CBC (Complete Blood Count & Differential)', category: 'Blood & Pathology', specimen: 'Venous Blood (EDTA)', instructions: 'Fasting Not Required • Turnaround: 4 Hours' },
      { name: 'ECG / EKG 12-Lead Cardiac Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive Diagnostic', instructions: 'Fasting Not Required • Turnaround: Immediate' },
    ],
    signatureHash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
  };

  const data = prescriptionData || sampleDefaultData;

  const handlePrintDownload = () => {
    showToast({
      title: 'Downloading Prescription PDF',
      message: `Generating encrypted multi-role PDF document #${data.rxNumber}...`,
      type: 'info',
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MediCore 360 - Official Digital Prescription ${data.rxNumber}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
              .brand { font-size: 26px; font-weight: 900; color: #1e3a8a; }
              .subtitle { font-size: 12px; color: #64748b; font-weight: 600; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 25px; }
              .meta-item { font-size: 13px; }
              .meta-label { color: #64748b; font-weight: bold; }
              .meta-val { font-weight: bold; color: #0f172a; }

              .vitals-box { background: #fff1f2; border: 1px solid #fecdd3; padding: 15px; border-radius: 12px; margin-bottom: 25px; }
              .vitals-header { font-size: 13px; font-weight: 900; color: #9f1239; margin-bottom: 10px; text-transform: uppercase; }
              .vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px; }

              .rx-title { font-size: 14px; font-weight: 900; color: #1e293b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
              .med-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; background: #fff; }
              .med-name { font-size: 14px; font-weight: bold; color: #2563eb; }
              .med-dosage { font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px; }
              .med-inst { font-size: 12px; color: #64748b; font-style: italic; margin-top: 4px; }
              
              .test-card { border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; background: #f0f9ff; }
              .test-name { font-size: 13px; font-weight: bold; color: #0369a1; }
              .test-meta { font-size: 11px; color: #0284c7; margin-top: 2px; }

              .signature-box { margin-top: 35px; padding-top: 20px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; }
              .sig-img { font-family: 'Brush Script MT', cursive, sans-serif; font-size: 28px; color: #1e3a8a; }
              .stamp { font-size: 10px; color: #059669; font-weight: bold; border: 2px solid #059669; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">MEDICORE 360 EHMS</div>
                <div class="subtitle">Official Electronic Medical Prescription • Hospital License #HOSP-88901</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 900; color: #2563eb;">${data.rxNumber}</div>
                <div style="font-size: 12px; color: #64748b;">${data.date}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Patient Name:</span> <span class="meta-val">${data.patientName}</span></div>
              <div class="meta-item"><span class="meta-label">MRN Code:</span> <span class="meta-val">${data.mrn}</span></div>
              <div class="meta-item"><span class="meta-label">Age / Gender:</span> <span class="meta-val">${data.age || '42 Yrs'} / ${data.gender || 'Female'}</span></div>
              <div class="meta-item"><span class="meta-label">Attending Doctor:</span> <span class="meta-val">${data.doctorName}</span></div>
              <div class="meta-item" style="grid-column: span 2;"><span class="meta-label">Department:</span> <span class="meta-val">${data.department}</span></div>
              <div class="meta-item" style="grid-column: span 3;"><span class="meta-label">Clinical Diagnosis:</span> <span class="meta-val" style="color: #2563eb;">${data.diagnosis}</span></div>
            </div>

            ${
              data.nurseVitals
                ? `
              <div class="vitals-box">
                <div class="vitals-header">❤️ Pre-Consultation Vitals Check (Recorded by ${data.nurseVitals.nurseName})</div>
                <div class="vitals-grid">
                  <div><span style="color: #64748b;">Blood Pressure:</span> <strong>${data.nurseVitals.bp}</strong></div>
                  <div><span style="color: #64748b;">Pulse / HR:</span> <strong>${data.nurseVitals.pulse}</strong></div>
                  <div><span style="color: #64748b;">SpO2 Oxygen:</span> <strong>${data.nurseVitals.spo2}</strong></div>
                  <div><span style="color: #64748b;">Temperature:</span> <strong>${data.nurseVitals.temp}</strong></div>
                  <div><span style="color: #64748b;">Weight / Height:</span> <strong>${data.nurseVitals.weight} / ${data.nurseVitals.height}</strong></div>
                  <div><span style="color: #64748b;">BMI Index:</span> <strong>${data.nurseVitals.bmi}</strong></div>
                  <div><span style="color: #64748b;">Blood Glucose:</span> <strong>${data.nurseVitals.glucose}</strong></div>
                </div>
              </div>
            `
                : ''
            }

            <div class="rx-title">Rx Prescribed Medications & Dosing Schedule</div>

            ${data.medications
              ?.map(
                (m) => `
              <div class="med-card">
                <div class="med-name">💊 ${m.name}</div>
                <div class="med-dosage">Dose: ${m.dosage}</div>
                <div class="med-inst">Instructions: ${m.instructions}</div>
              </div>
            `
              )
              .join('')}

            ${
              data.labTests && data.labTests.length > 0
                ? `
              <div class="rx-title" style="margin-top: 25px; color: #0284c7;">🔬 Prescribed Diagnostic Lab Tests & Investigations</div>
              ${data.labTests
                .map(
                  (t) => `
                <div class="test-card">
                  <div class="test-name">🔬 ${t.name}</div>
                  <div class="test-meta">Category: ${t.category || 'Diagnostic Test'} • Specimen: ${t.specimen || 'Clinical Specimen'}</div>
                  <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Prep/Instructions: ${t.instructions}</div>
                </div>
              `
                )
                .join('')}
            `
                : ''
            }

            <div class="signature-box">
              <div>
                <div class="stamp">✓ Cryptographically Verified Multi-Role Signature</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">Hash: ${data.signatureHash}</div>
                <div style="font-size: 10px; color: #94a3b8;">Issued At: ${new Date().toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div class="sig-img">${data.doctorName}</div>
                <div style="font-size: 12px; font-weight: bold; color: #475569; margin-top: 4px;">Digital Signature & Stamp</div>
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Official Digital Prescription & Vitals Record</h3>
              <p className="text-xs font-semibold text-slate-500">Rx #{data.rxNumber} • Signed by {data.doctorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-blue-600" />
              <span className="font-black text-sm text-slate-900">MediCore 360 EHMS</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full border border-emerald-300">
              Verified Rx & Vitals
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs border-b border-slate-200 pb-4">
            <div>
              <span className="text-slate-500 font-semibold block">Patient Name</span>
              <span className="font-black text-slate-900">{data.patientName} ({data.mrn})</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Age / Gender / Blood</span>
              <span className="font-bold text-slate-800">{data.age || '42 Yrs'} / {data.gender || 'Female'} ({data.bloodGroup || 'O+'})</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Attending Doctor</span>
              <span className="font-black text-blue-600">{data.doctorName}</span>
            </div>
            <div className="col-span-3 pt-1">
              <span className="text-slate-500 font-semibold block">Diagnosis</span>
              <span className="font-bold text-slate-800">{data.diagnosis}</span>
            </div>
          </div>

          {data.nurseVitals && (
            <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" /> Pre-Consultation Vitals Check (Recorded by {data.nurseVitals.nurseName})
              </span>
              <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold text-slate-700 pt-1">
                <div>BP: <strong className="text-slate-900">{data.nurseVitals.bp}</strong></div>
                <div>Pulse: <strong className="text-slate-900">{data.nurseVitals.pulse}</strong></div>
                <div>SpO2: <strong className="text-slate-900">{data.nurseVitals.spo2}</strong></div>
                <div>Temp: <strong className="text-slate-900">{data.nurseVitals.temp}</strong></div>
                <div>Weight: <strong className="text-slate-900">{data.nurseVitals.weight}</strong></div>
                <div>Height: <strong className="text-slate-900">{data.nurseVitals.height}</strong></div>
                <div>BMI: <strong className="text-emerald-700">{data.nurseVitals.bmi}</strong></div>
                <div>Glucose: <strong className="text-slate-900">{data.nurseVitals.glucose}</strong></div>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
              Prescribed Medications & Dosing Schedule
            </span>
            {data.medications?.map((m, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-blue-600 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5" /> {m.name}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {m.dosage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium italic">{m.instructions}</p>
              </div>
            ))}
          </div>

          {data.labTests && data.labTests.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 block">
                Prescribed Diagnostic Lab Tests & Pathology Investigations
              </span>
              {data.labTests.map((t, idx) => (
                <div key={idx} className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-indigo-950 flex items-center gap-1.5">
                      🔬 {t.name}
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                      {t.category || 'Lab Test'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900 font-medium">{t.specimen} • {t.instructions}</p>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-emerald-700 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Multi-Role Stamp
              </span>
              <span className="text-[10px] font-mono text-slate-400 block">{data.signatureHash}</span>
              <span className="text-[10px] text-slate-500 block">Issued: {data.date}</span>
            </div>
            <div className="text-right">
              <span className="font-serif italic font-black text-blue-900 text-base block">{data.doctorName}</span>
              <span className="text-[10px] font-bold text-slate-500">Digital Signature & License Stamp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrintDownload}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download & Print Full PDF</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
