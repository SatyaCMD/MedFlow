import PDFDocument from 'pdfkit';

export interface PrescriptionPdfData {
  prescriptionId: string;
  patientName: string;
  patientAge?: string | number;
  patientGender?: string;
  patientId?: string;
  doctorName: string;
  doctorSpecialty?: string;
  department?: string;
  diagnosis: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  date?: string;
}

export interface PharmacyInvoicePdfData {
  invoiceId: string;
  customerName: string;
  customerPhone?: string;
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
 * 1. Generate Clinical Medical Prescription PDF
 */
export async function generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header Banner
  doc.rect(0, 0, 595, 70).fill('#1e40af'); // Navy Blue Header
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MEDIFLOW CLINICAL WORKSTATION', 40, 20);
  doc.fontSize(10).font('Helvetica').text('Official Electronic Health Record & Medical Prescription', 40, 45);

  // Document Title & RX Badge
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`PRESCRIPTION RX #${data.prescriptionId}`, 40, 85);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Date Issued: ${data.date || new Date().toLocaleDateString()}`, 40, 102);

  // Patient & Doctor Information Box
  doc.rect(40, 120, 515, 70).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fillColor('#1e293b').fontSize(10).font('Helvetica-Bold').text(`PATIENT: ${data.patientName}`, 50, 130);
  doc.font('Helvetica').fontSize(9).text(`Age/Gender: ${data.patientAge || '32'} Yrs / ${data.patientGender || 'Male'}  |  Patient ID: ${data.patientId || 'PAT-10923'}`, 50, 146);
  if (data.vitals) {
    doc.text(`Vitals: BP: ${data.vitals.bp || '120/80 mmHg'}  |  Pulse: ${data.vitals.pulse || '72 bpm'}  |  Temp: ${data.vitals.temp || '98.6°F'}`, 50, 162);
  }

  doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(10).text(`DOCTOR: ${data.doctorName}`, 320, 130);
  doc.font('Helvetica').fontSize(9).text(`Specialty: ${data.doctorSpecialty || 'General Physician'}`, 320, 146);
  doc.text(`Department: ${data.department || 'Outpatient Clinic'}`, 320, 162);

  // Diagnosis Section
  doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text('CLINICAL DIAGNOSIS & SYMPTOMS', 40, 205);
  doc.rect(40, 220, 515, 35).fillAndStroke('#eff6ff', '#bfdbfe');
  doc.fillColor('#1e3a8a').fontSize(9.5).font('Helvetica-Bold').text(data.diagnosis || 'Upper Respiratory Tract Infection with Fever', 50, 230);

  // Medication Table Header
  doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text('PRESCRIBED MEDICATIONS & DOSAGE INSTRUCTIONS', 40, 270);
  
  let y = 285;
  doc.rect(40, y, 515, 22).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('MEDICINE DRUG NAME', 50, y + 6);
  doc.text('DOSAGE', 230, y + 6);
  doc.text('FREQUENCY', 330, y + 6);
  doc.text('DURATION', 440, y + 6);

  y += 22;
  data.medications.forEach((med, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, y, 515, 24).fillAndStroke(rowBg, '#f1f5f9');
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(med.name, 50, y + 7);
    doc.font('Helvetica').fillColor('#334155');
    doc.text(med.dosage, 230, y + 7);
    doc.text(med.frequency, 330, y + 7);
    doc.text(med.duration, 440, y + 7);
    y += 24;
  });

  // Footer & Digital Sign Seal
  y = Math.max(y + 30, 580);
  doc.rect(340, y, 215, 65).fillAndStroke('#f8fafc', '#cbd5e1');
  doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text('DOCTOR DIGITAL VERIFICATION', 350, y + 10);
  doc.fillColor('#2563eb').fontSize(12).font('Helvetica-BoldOblique').text(`${data.doctorName}`, 350, y + 26);
  doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(`Verified Electronic Signature  •  Reg #${data.prescriptionId.slice(-6)}`, 350, y + 46);

  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('MediCore 360 HIPAA Compliant Telemetry Record  •  Confidential Patient EMR Data', 40, 750, { align: 'center' });

  return pdfDocToBuffer(doc);
}

/**
 * 2. Generate Pharmacy Invoice / Receipt PDF
 */
export async function generatePharmacyInvoicePdf(data: PharmacyInvoicePdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header Banner
  doc.rect(0, 0, 595, 70).fill('#059669'); // Emerald Green Header
  doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MEDIFLOW PHARMACY & DISPENSARY', 40, 20);
  doc.fontSize(10).font('Helvetica').text('Official Tax Invoice & Medicine Purchase Slip', 40, 45);

  // Invoice Details Box
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`INVOICE #${data.invoiceId}`, 40, 85);
  doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(`Date: ${data.date || new Date().toLocaleDateString()}  |  Payment Mode: ${data.paymentMethod}`, 40, 102);

  doc.rect(40, 120, 515, 50).fillAndStroke('#f0fdf4', '#bbf7d0');
  doc.fillColor('#065f46').fontSize(10).font('Helvetica-Bold').text(`CUSTOMER / PATIENT: ${data.customerName}`, 50, 132);
  doc.font('Helvetica').fontSize(9).text(`Phone: ${data.customerPhone || '+91 98765 43210'}  |  Dispensary Station #4`, 50, 148);

  // Itemized Table Header
  let y = 185;
  doc.rect(40, y, 515, 22).fill('#064e3b');
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('MEDICINE ITEM', 50, y + 6);
  doc.text('BATCH NO', 230, y + 6);
  doc.text('QTY', 330, y + 6);
  doc.text('UNIT PRICE (₹)', 390, y + 6);
  doc.text('TOTAL (₹)', 480, y + 6);

  y += 22;
  data.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    doc.rect(40, y, 515, 22).fillAndStroke(rowBg, '#f1f5f9');
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold').text(item.name, 50, y + 6);
    doc.font('Helvetica').fillColor('#334155');
    doc.text(item.batchNo || 'BTH-8821', 230, y + 6);
    doc.text(String(item.quantity), 330, y + 6);
    doc.text(`₹${item.unitPrice.toFixed(2)}`, 390, y + 6);
    doc.text(`₹${item.total.toFixed(2)}`, 480, y + 6);
    y += 22;
  });

  // Summary Totals Box
  y += 15;
  doc.rect(340, y, 215, 75).fillAndStroke('#ecfdf5', '#a7f3d0');
  doc.fillColor('#065f46').fontSize(9).font('Helvetica');
  doc.text('Subtotal:', 350, y + 10);
  doc.text(`₹${data.subtotal.toFixed(2)}`, 480, y + 10);
  doc.text('GST / Tax (5%):', 350, y + 26);
  doc.text(`₹${data.tax.toFixed(2)}`, 480, y + 26);
  doc.font('Helvetica-Bold').fontSize(11).text('Grand Total:', 350, y + 46);
  doc.text(`₹${data.grandTotal.toFixed(2)}`, 480, y + 46);

  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica').text('Thank you for choosing MediCore 360 Pharmacy. Please retain this receipt for insurance & audit.', 40, 750, { align: 'center' });

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
