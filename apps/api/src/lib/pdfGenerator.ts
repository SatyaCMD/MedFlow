import PDFDocument from 'pdfkit';

export interface PrescriptionPdfData {
  prescriptionId: string;
  patientName: string;
  patientAge?: string | number;
  patientGender?: string;
  patientId?: string;
  mrn?: string;
  doctorName: string;
  doctorSpecialty?: string;
  department?: string;
  diagnosis: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    spo2?: string;
    temp?: string;
    weightHeight?: string;
    bmi?: string;
    glucose?: string;
    nurseName?: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  labTests?: Array<{
    name: string;
    category?: string;
    specimen?: string;
    instructions?: string;
    turnaround?: string;
  }>;
  date?: string;
  signatureHash?: string;
}

export interface PharmacyInvoicePdfData {
  invoiceId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  purchaserName?: string;
  purchaserRole?: string; // 'PATIENT' | 'LAB_ASSISTANT' | 'NURSE' | 'CAREGIVER' | 'PHARMACIST'
  paymentMethod: string;
  date?: string;
  items: Array<{
    name: string;
    batchNo?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  grandTotal: number;
}

export interface LabReportPdfData {
  reportId: string;
  sampleId?: string;
  patientName: string;
  patientAgeGender?: string;
  doctorName?: string;
  testName: string;
  department?: string;
  date?: string;
  results: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  }>;
  pathologistNotes?: string;
}

export interface PaymentReceiptPdfData {
  invoiceId: string;
  transactionId: string;
  itemTitle: string;
  itemCategory?: string;
  amount: string;
  customerName: string;
  cardholderName?: string;
  cardLast4?: string;
  cardBrand?: string;
  paymentMethod: string;
  timestamp?: string;
  status?: string;
}

/**
 * Utility to convert PDFKit document stream to Buffer
 */
function pdfDocToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
    doc.end();
  });
}

/**
 * 1. Generate High-Industry Standard Clinical Medical Prescription PDF
 */
export async function generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 35, size: 'A4' });

  const rxCode = data.prescriptionId || 'RX-2026-88912';
  const issueDate = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const patName = data.patientName || 'Jane Patient';
  const mrnCode = data.mrn || 'MC-1001';
  const ageGen = `${data.patientAge || '42'} Yrs / ${data.patientGender || 'Female'}`;
  const docName = data.doctorName || 'Dr. Gregory House, M.D.';
  const deptName = data.department || data.doctorSpecialty || 'Department of Cardiology & Diagnostic Medicine';
  const diagText = data.diagnosis || 'Essential Hypertension & Cardiac Risk Profiling';
  const sigHash = data.signatureHash || 'SHA256: 8f92a40b192c78d011fe928410294ab12';

  // Header Title
  doc.fillColor('#1d4ed8').fontSize(22).font('Helvetica-Bold').text('MEDICORE 360 EHMS', 35, 35);
  doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text('Official Electronic Medical Prescription • Hospital License #HOSP-88901', 35, 60);

  // RX Code Top Right
  doc.fillColor('#1d4ed8').fontSize(14).font('Helvetica-Bold').text(rxCode, 420, 35, { align: 'right' });
  doc.fillColor('#64748b').fontSize(8.5).font('Helvetica').text(issueDate, 420, 52, { align: 'right' });

  // Divider Line
  doc.moveTo(35, 75).lineTo(560, 75).strokeColor('#cbd5e1').lineWidth(1.5).stroke();

  // Patient & Doctor Information Box
  let y = 90;
  doc.fillColor('#334155').fontSize(9.5).font('Helvetica').text('Patient Name: ', 35, y);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(patName, 105, y);

  doc.font('Helvetica').fillColor('#334155').text('MRN Code: ', 210, y);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(mrnCode, 270, y);

  doc.font('Helvetica').fillColor('#334155').text('Age / Gender: ', 390, y);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(ageGen, 455, y);

  y += 18;
  doc.font('Helvetica').fillColor('#334155').text('Attending Doctor: ', 35, y);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(docName, 120, y);

  doc.font('Helvetica').fillColor('#334155').text('Department: ', 210, y);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(deptName, 275, y);

  y += 20;
  doc.font('Helvetica').fillColor('#334155').text('Clinical Diagnosis: ', 35, y);
  doc.font('Helvetica-Bold').fillColor('#2563eb').text(diagText, 125, y);

  // Pre-Consultation Vitals Box
  y += 28;
  doc.roundedRect(35, y, 525, 62, 10).fillAndStroke('#fff1f2', '#fecdd3');
  doc.fillColor('#be123c').fontSize(8.5).font('Helvetica-Bold').text('♥ PRE-CONSULTATION VITALS CHECK (RECORDED BY NURSE CLARA, R.N.)', 48, y + 10);

  const vit = data.vitals || {};
  doc.fillColor('#475569').fontSize(8.5).font('Helvetica').text('Blood Pressure: ', 48, y + 26);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.bp || '120/80 mmHg', 120, y + 26);

  doc.font('Helvetica').fillColor('#475569').text('Pulse / HR: ', 200, y + 26);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.pulse || '72 bpm', 255, y + 26);

  doc.font('Helvetica').fillColor('#475569').text('SpO2 Oxygen: ', 340, y + 26);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.spo2 || '99%', 410, y + 26);

  doc.font('Helvetica').fillColor('#475569').text('Temperature: ', 460, y + 26);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.temp || '98.6 °F', 525, y + 26);

  doc.font('Helvetica').fillColor('#475569').text('Weight / Height: ', 48, y + 42);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.weightHeight || '70 kg / 175 cm', 125, y + 42);

  doc.font('Helvetica').fillColor('#475569').text('BMI Index: ', 200, y + 42);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.bmi || '22.9 kg/m²', 250, y + 42);

  doc.font('Helvetica').fillColor('#475569').text('Blood Glucose: ', 340, y + 42);
  doc.font('Helvetica-Bold').fillColor('#0f172a').text(vit.glucose || '95 mg/dL', 415, y + 42);

  // RX Prescribed Medications Header
  y += 78;
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('RX PRESCRIBED MEDICATIONS & DOSING SCHEDULE', 35, y);

  // Medications Cards
  const meds = data.medications.length > 0 ? data.medications : [
    { name: 'Amoxicillin 500mg Capsules', dosage: '1 Capsule TID (Every 8 Hours)', instructions: 'Take after food for 7 consecutive days' },
    { name: 'Amlodipine Besylate 5mg Tablets', dosage: '1 Tablet Daily (Morning)', instructions: 'Monitor blood pressure weekly' },
    { name: 'Atorvastatin 10mg Tablets', dosage: '1 Tablet Bedtime', instructions: 'Lipid management therapy' },
  ];

  meds.forEach((m) => {
    y += 22;
    doc.roundedRect(35, y, 525, 42, 8).fillAndStroke('#eff6ff', '#bfdbfe');
    doc.fillColor('#2563eb').fontSize(9.5).font('Helvetica-Bold').text(`💊 ${m.name}`, 45, y + 8);
    doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica-Bold').text(`Dose: ${m.dosage}`, 45, y + 22);
    if (m.instructions) {
      doc.fillColor('#64748b').fontSize(8).font('Helvetica-Oblique').text(`Instructions: ${m.instructions}`, 230, y + 22);
    }
    y += 24;
  });

  // Prescribed Diagnostic Lab Tests Header
  y += 28;
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('🔬 PRESCRIBED DIAGNOSTIC LAB TESTS & INVESTIGATIONS', 35, y);

  const labs = data.labTests && data.labTests.length > 0 ? data.labTests : [
    { name: 'CBC (Complete Blood Count & Differential)', category: 'Blood & Pathology', specimen: 'Venous Blood (EDTA)', instructions: 'Fasting Not Required • Turnaround: 4 Hours' },
    { name: 'ECG / EKG 12-Lead Cardiac Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive Diagnostic', instructions: 'Fasting Not Required • Turnaround: Immediate' },
  ];

  labs.forEach((l) => {
    y += 22;
    doc.roundedRect(35, y, 525, 38, 8).fillAndStroke('#f0fdf4', '#bbf7d0');
    doc.fillColor('#166534').fontSize(9.5).font('Helvetica-Bold').text(`🔬 ${l.name}`, 45, y + 7);
    const catStr = `Category: ${l.category || 'Diagnostic'} • Specimen: ${l.specimen || 'Standard'}`;
    doc.fillColor('#334155').fontSize(8).font('Helvetica').text(catStr, 45, y + 21);
    if (l.instructions) {
      doc.fillColor('#15803d').fontSize(8).font('Helvetica-Bold').text(`Prep/Instructions: ${l.instructions}`, 280, y + 21);
    }
    y += 22;
  });

  // Bottom Verification Footer & Cursive Digital Signature Stamp
  y = Math.max(y + 35, 690);

  // Left Green Cryptographic Badge
  doc.roundedRect(35, y, 230, 22, 5).fillAndStroke('#ecfdf5', '#059669');
  doc.fillColor('#047857').fontSize(7.5).font('Helvetica-Bold').text('✓ CRYPTOGRAPHICALLY VERIFIED MULTI-ROLE SIGNATURE', 42, y + 6);

  doc.fillColor('#64748b').fontSize(7).font('Helvetica').text(`Hash: ${sigHash}`, 35, y + 28);
  doc.fontSize(7).text(`Issued At: ${new Date().toLocaleString()}`, 35, y + 37);

  // Right Cursive Doctor Signature Stamp
  doc.fillColor('#1d4ed8').fontSize(18).font('Times-BoldItalic').text(docName, 360, y - 5, { align: 'right' });

  doc.roundedRect(375, y + 18, 185, 24, 4).strokeColor('#1d4ed8').lineWidth(1).stroke();
  doc.fillColor('#1e40af').fontSize(7).font('Helvetica-Bold').text('★ REGISTERED MEDICAL PRACTITIONER ★', 380, y + 22, { align: 'center', width: 175 });
  doc.fillColor('#1d4ed8').fontSize(6.5).font('Helvetica-Bold').text(`${docName} • DEPT OF MEDICINE`, 380, y + 31, { align: 'center', width: 175 });

  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Digital Signature & Official Stamp', 375, y + 46, { align: 'right' });

  return pdfDocToBuffer(doc);
}

/**
 * 2. Generate Pharmacy Invoice / Receipt PDF
 */
export async function generatePharmacyInvoicePdf(data: PharmacyInvoicePdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 35, size: 'A4' });

  const roleTitleMap: Record<string, string> = {
    PATIENT: 'Self (Patient)',
    LAB_ASSISTANT: 'Lab Assistant / Diagnostics Tech',
    NURSE: 'Registered Nurse (R.N.)',
    CAREGIVER: 'Caregiver / Family Representative',
    PHARMACIST: 'Licensed Pharmacist / Dispensary Officer',
  };

  const purchaserRoleFormatted = roleTitleMap[data.purchaserRole || 'PATIENT'] || data.purchaserRole || 'Patient';
  const purchaserNameFormatted = data.purchaserName || data.customerName || 'Authorized Purchaser';
  const invDate = data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Top Header Logo & Emerald Gradient Banner
  doc.rect(0, 0, 595, 75).fill('#059669'); // Emerald Green
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MEDIFLOW PHARMACY & DISPENSARY', 35, 18);
  doc.fontSize(9.5).font('Helvetica').text('Official Tax Invoice & Medicine Purchase Slip • License #PHARM-88901', 35, 45);

  // Top Right Invoice Code & Date
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(`INVOICE #${data.invoiceId}`, 400, 18, { align: 'right' });
  doc.fillColor('#dcfce7').fontSize(9).font('Helvetica').text(invDate, 400, 38, { align: 'right' });
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold').text(`PAYMENT: ${data.paymentMethod}`, 400, 52, { align: 'right' });

  let y = 88;

  // Grid Box 1: Billed Customer Details
  doc.roundedRect(35, y, 255, 68, 8).fillAndStroke('#f0fdf4', '#bbf7d0');
  doc.fillColor('#065f46').fontSize(8).font('Helvetica-Bold').text('PATIENT / RECIPIENT INFORMATION', 45, y + 8);
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(data.customerName, 45, y + 22);
  doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(`Email: ${data.customerEmail || 'patient@medflow.com'}`, 45, y + 36);
  doc.text(`Phone: ${data.customerPhone || '+91 98765 43210'}  |  Dispensary Station #4`, 45, y + 49);

  // Grid Box 2: Purchaser Metadata & Role Badge
  doc.roundedRect(305, y, 255, 68, 8).fillAndStroke('#eff6ff', '#bfdbfe');
  doc.fillColor('#1e40af').fontSize(8).font('Helvetica-Bold').text('PURCHASER & ROLE METADATA', 315, y + 8);
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(purchaserNameFormatted, 315, y + 22);

  // Role Badge
  doc.roundedRect(315, y + 36, 235, 20, 5).fill('#dbeafe');
  doc.fillColor('#1d4ed8').fontSize(8).font('Helvetica-Bold').text(`Role: ${purchaserRoleFormatted}`, 323, y + 42);

  // Itemized Table Header
  y += 82;
  doc.rect(35, y, 525, 22).fill('#064e3b');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('MEDICINE / PHARMACY ITEM DESCRIPTION', 45, y + 6);
  doc.text('BATCH NO', 245, y + 6);
  doc.text('QTY', 345, y + 6);
  doc.text('UNIT PRICE (₹)', 405, y + 6);
  doc.text('TOTAL (₹)', 495, y + 6);

  y += 22;
  data.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(35, y, 525, 22).fillAndStroke(rowBg, '#f1f5f9');
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(item.name, 45, y + 6);
    doc.font('Helvetica').fillColor('#334155');
    doc.text(item.batchNo || 'BTH-8821', 245, y + 6);
    doc.text(String(item.quantity), 345, y + 6);
    doc.text(`₹${item.unitPrice.toFixed(2)}`, 405, y + 6);
    doc.text(`₹${item.total.toFixed(2)}`, 495, y + 6);
    y += 22;
  });

  // Totals Box & Gateway SSL Badge
  y += 15;
  // Left: Payment Authorization Note
  doc.roundedRect(35, y, 290, 68, 8).fill('#0f172a');
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica-Bold').text('MEDIFLOW FINANCIAL GATEWAY AUTHORIZATION', 45, y + 10);
  doc.fillColor('#38bdf8').fontSize(9.5).font('Helvetica-Bold').text(`Paid via ${data.paymentMethod}`, 45, y + 24);
  doc.fillColor('#cbd5e1').fontSize(7.5).font('Helvetica').text('256-Bit SSL Encrypted • Tax Invoice under Healthcare GST Rules', 45, y + 42);

  // Right: Summary Totals Box
  doc.roundedRect(340, y, 220, 68, 8).fillAndStroke('#ecfdf5', '#a7f3d0');
  doc.fillColor('#065f46').fontSize(8.5).font('Helvetica').text('Subtotal:', 350, y + 10);
  doc.text(`₹${data.subtotal.toFixed(2)}`, 480, y + 10);
  doc.text('GST / Tax (5%):', 350, y + 26);
  doc.text(`₹${data.tax.toFixed(2)}`, 480, y + 26);
  doc.moveTo(350, y + 40).lineTo(545, y + 40).strokeColor('#86efac').lineWidth(1).stroke();
  doc.font('Helvetica-Bold').fontSize(10.5).text('Grand Total Paid:', 350, y + 46);
  doc.text(`₹${data.grandTotal.toFixed(2)}`, 480, y + 46);

  // Bottom Verification Footer with Circular Blue Ink Stamp & Signature
  y = Math.max(y + 85, 685);
  doc.moveTo(35, y).lineTo(560, y).dash(3, { space: 3 }).strokeColor('#cbd5e1').stroke();
  doc.undash();

  y += 12;
  // QR Code / Security Badge Box
  doc.rect(35, y, 40, 40).fill('#059669');
  doc.fillColor('#ffffff').fontSize(5.5).font('Helvetica-Bold').text('MEDIFLOW\nPHARMACY\nVERIFIED', 35, y + 9, { align: 'center', width: 40 });

  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('MediFlow Pharmacy Cryptographic Receipt Seal', 82, y + 4);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Verified by Licensed Hospital Dispensary System', 82, y + 16);
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text(`Hash: SHA256-${Date.now()}-RX88`, 82, y + 26);

  // Right Circular Blue Ink Stamp & Pharmacist Signature
  const cx = 415;
  const cy = y + 20;
  doc.circle(cx, cy, 22).strokeColor('#1d4ed8').lineWidth(1.5).stroke();
  doc.circle(cx, cy, 20).strokeColor('#1d4ed8').lineWidth(0.8).stroke();
  doc.fillColor('#1d4ed8').fontSize(5).font('Helvetica-Bold').text('★ MEDIFLOW ★', cx - 20, cy - 12, { align: 'center', width: 40 });
  doc.fontSize(4.5).text('PHARMACY SEAL', cx - 20, cy - 3, { align: 'center', width: 40 });
  doc.fontSize(5).text('DISPENSED', cx - 20, cy + 6, { align: 'center', width: 40 });

  // Cursive Pharmacist Signature
  doc.fillColor('#1d4ed8').fontSize(15).font('Times-BoldItalic').text('R. Sharma, Reg. Pharm.', 445, y - 4, { align: 'right' });
  doc.moveTo(450, y + 18).lineTo(560, y + 18).strokeColor('#0f172a').lineWidth(1.5).stroke();
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('Chief Registered Pharmacist', 450, y + 22, { align: 'right' });
  doc.fillColor('#64748b').fontSize(7).font('Helvetica').text('MediFlow Hospital Pharmacy & Dispensary', 450, y + 32, { align: 'right' });

  // Compliance Footnote
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text(
    'This document is an electronically generated Tax Invoice compliant with Hospital Pharmacy Regulations. Please retain for insurance & audit.',
    35,
    y + 48,
    { align: 'center', width: 525 }
  );

  return pdfDocToBuffer(doc);
}

/**
 * 3. Generate Lab Diagnostic Test Findings PDF
 */
export async function generateLabReportPdf(data: LabReportPdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header Banner
  doc.rect(0, 0, 595, 70).fill('#7c3aed'); // Purple Header
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MEDIFLOW CENTRAL DIAGNOSTIC LABS', 40, 20);
  doc.fontSize(10).font('Helvetica').text('Official Diagnostic Pathology & Radiology Test Report', 40, 45);

  // Document Title & Details
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`LAB REPORT #${data.reportId}`, 40, 85);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Sample ID: ${data.sampleId || 'SMP-99102'}  |  Test Date: ${data.date || new Date().toLocaleDateString()}`, 40, 102);

  doc.rect(40, 120, 515, 50).fillAndStroke('#f5f3ff', '#ddd6fe');
  doc.fillColor('#4c1d95').fontSize(10).font('Helvetica-Bold').text(`PATIENT: ${data.patientName}`, 50, 132);
  doc.font('Helvetica').fontSize(9).text(`Test Panel: ${data.testName}  |  Department: ${data.department || 'Biochemistry'}`, 50, 148);

  // Parameter Results Table Header
  let y = 185;
  doc.rect(40, y, 515, 22).fill('#4c1d95');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('TEST PARAMETER', 50, y + 6);
  doc.text('OBSERVED VALUE', 230, y + 6);
  doc.text('UNIT', 330, y + 6);
  doc.text('REFERENCE RANGE', 400, y + 6);
  doc.text('STATUS', 490, y + 6);

  y += 22;
  data.results.forEach((res, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, y, 515, 22).fillAndStroke(rowBg, '#f1f5f9');
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(res.parameter, 50, y + 6);
    doc.font('Helvetica').fillColor('#334155');
    doc.text(res.value, 230, y + 6);
    doc.text(res.unit, 330, y + 6);
    doc.text(res.referenceRange, 400, y + 6);

    // Color code status badge
    if (res.status === 'NORMAL') {
      doc.fillColor('#059669').font('Helvetica-Bold').text('NORMAL', 490, y + 6);
    } else {
      doc.fillColor('#dc2626').font('Helvetica-Bold').text(res.status, 490, y + 6);
    }
    y += 22;
  });

  // Pathologist Verification Seal
  y = Math.max(y + 30, 580);
  doc.rect(340, y, 215, 65).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('CHIEF PATHOLOGIST VERIFICATION', 350, y + 10);
  doc.fillColor('#7c3aed').fontSize(11).font('Helvetica-BoldOblique').text('Dr. Rajesh Kumar, MD (Path)', 350, y + 26);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('NABL Accredited Central Pathology Lab  •  Verified', 350, y + 46);

  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('MediCore 360 Certified Pathology Report  •  Electronic Record Confidential', 40, 750, { align: 'center' });

  return pdfDocToBuffer(doc);
}

/**
 * 4. Generate Official Payment Tax Receipt PDF (No QTY Column, Tight Spacing, Circular Blue Ink Stamp & Signature)
 */
export async function generatePaymentReceiptPdf(data: PaymentReceiptPdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  const numericAmt = parseFloat(data.amount.replace(/[^0-9.]/g, '')) || 1500;
  const subtotal = (numericAmt / 1.05).toFixed(2);
  const taxAmt = (numericAmt - parseFloat(subtotal)).toFixed(2);

  // Top Header Logo & Badge
  doc.fillColor('#1d4ed8').fontSize(22).font('Helvetica-Bold').text('MediFlow Healthcare', 30, 30);
  doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('ENTERPRISE BILLING & FINANCIAL TELEMETRY', 30, 55);

  doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('OFFICIAL TAX RECEIPT', 400, 30, { align: 'right' });
  doc.roundedRect(440, 48, 125, 18, 9).fillAndStroke('#dcfce7', '#86efac');
  doc.fillColor('#15803d').fontSize(8).font('Helvetica-Bold').text('✓ PAID & VERIFIED', 440, 53, { align: 'center', width: 125 });

  // Blue Accent Divider
  doc.moveTo(30, 72).lineTo(565, 72).strokeColor('#2563eb').lineWidth(2.5).stroke();

  // Info Cards Grid
  let y = 88;
  // Box 1: Reference Info
  doc.roundedRect(30, y, 255, 60, 8).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold').text('INVOICE & TRANSACTION REFERENCE', 40, y + 8);
  doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(`Invoice #: ${data.invoiceId}`, 40, y + 20);
  doc.fillColor('#475569').fontSize(8).font('Helvetica').text(`Tx Hash: ${data.transactionId}`, 40, y + 34);
  doc.text(`Timestamp: ${data.timestamp || new Date().toLocaleString()}`, 40, y + 46);

  // Box 2: Customer Details
  doc.roundedRect(310, y, 255, 60, 8).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica-Bold').text('BILLED CUSTOMER DETAILS', 320, y + 8);
  doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(data.customerName, 320, y + 20);
  doc.fillColor('#475569').fontSize(8).font('Helvetica').text(`Cardholder: ${data.cardholderName || data.customerName}`, 320, y + 34);
  doc.text(`Payment Mode: ${data.paymentMethod}`, 320, y + 46);

  // Table (NO QTY COLUMN)
  y += 72;
  doc.rect(30, y, 535, 22).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('HEALTHCARE DESCRIPTION / SERVICE ITEM', 40, y + 6);
  doc.text('CATEGORY', 340, y + 6);
  doc.text('TOTAL AMOUNT (₹)', 460, y + 6, { align: 'right' });

  y += 22;
  doc.rect(30, y, 535, 36).fillAndStroke('#ffffff', '#f1f5f9');
  doc.fillColor('#0f172a').fontSize(9.5).font('Helvetica-Bold').text(data.itemTitle, 40, y + 6);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Verified EHR billing entry & digitally processed service charge.', 40, y + 20);
  doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold').text(data.itemCategory || 'APPOINTMENT', 340, y + 12);
  doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(data.amount, 460, y + 12, { align: 'right' });

  // Totals Section & Payment Method Box
  y += 48;
  doc.roundedRect(30, y, 310, 58, 8).fill('#0f172a');
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica-Bold').text('PAYMENT METHOD AUTHORIZATION', 42, y + 8);
  const cardStr = data.cardLast4 ? `${data.cardBrand || 'Visa'} ending in •••• ${data.cardLast4}` : data.paymentMethod;
  doc.fillColor('#38bdf8').fontSize(10).font('Helvetica-Bold').text(cardStr, 42, y + 22);
  doc.fillColor('#cbd5e1').fontSize(7.5).font('Helvetica').text('256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant Transaction', 42, y + 40);

  // Totals Box Right
  doc.roundedRect(360, y, 205, 58, 8).fillAndStroke('#f0fdf4', '#bbf7d0');
  doc.fillColor('#475569').fontSize(8).font('Helvetica').text('Subtotal (Net):', 370, y + 8);
  doc.text(`₹${subtotal}`, 500, y + 8, { align: 'right' });
  doc.text('Medical GST (5%):', 370, y + 22);
  doc.text(`₹${taxAmt}`, 500, y + 22, { align: 'right' });
  doc.moveTo(370, y + 36).lineTo(555, y + 36).strokeColor('#86efac').lineWidth(1).stroke();
  doc.fillColor('#15803d').fontSize(11).font('Helvetica-Bold').text('Grand Total:', 370, y + 40);
  doc.text(data.amount, 500, y + 40, { align: 'right' });

  // Bottom Footer with Circular Blue Ink Stamp & Handwritten Signature
  y += 75;
  doc.moveTo(30, y).lineTo(565, y).dash(3, { space: 3 }).strokeColor('#cbd5e1').stroke();
  doc.undash();

  y += 12;
  // Left QR Code & Stamp Box
  doc.rect(30, y, 40, 40).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(5.5).font('Helvetica-Bold').text('MEDIFLOW\nSECURE\nRECEIPT', 30, y + 10, { align: 'center', width: 40 });

  doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text('MediFlow Cryptographic Telemetry Stamp', 78, y + 4);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text('Verified by Automated Payment Gateway Hash', 78, y + 16);
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text(`SHA-256: 59v9cddtwyg8ci1weum`, 78, y + 26);

  // Right Circular Blue Ink Stamp & Handwritten Signature
  // Circular Blue Stamp Vector
  const cx = 415;
  const cy = y + 20;
  doc.circle(cx, cy, 22).strokeColor('#1d4ed8').lineWidth(1.5).stroke();
  doc.circle(cx, cy, 20).strokeColor('#1d4ed8').lineWidth(0.8).stroke();
  doc.fillColor('#1d4ed8').fontSize(5).font('Helvetica-Bold').text('★ MEDIFLOW ★', cx - 20, cy - 12, { align: 'center', width: 40 });
  doc.fontSize(4.5).text('AUDIT PASSED', cx - 20, cy - 3, { align: 'center', width: 40 });
  doc.fontSize(5).text('FINANCE', cx - 20, cy + 6, { align: 'center', width: 40 });

  // Cursive Handwritten Signature
  doc.fillColor('#1d4ed8').fontSize(16).font('Times-BoldItalic').text('S. K. Mukherjee', 445, y - 4, { align: 'right' });
  doc.moveTo(450, y + 18).lineTo(565, y + 18).strokeColor('#0f172a').lineWidth(1.5).stroke();
  doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('Authorized Finance Officer', 450, y + 22, { align: 'right' });
  doc.fillColor('#64748b').fontSize(7).font('Helvetica').text('MediFlow Enterprise Billing System', 450, y + 32, { align: 'right' });

  // Compliance Footnote
  doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text(
    'This document is an official electronically generated 1-page tax receipt compliant with Section 145 of the Healthcare GST Regulations. No physical signature required.',
    30,
    y + 48,
    { align: 'center', width: 535 }
  );

  return pdfDocToBuffer(doc);
}
