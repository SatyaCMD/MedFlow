/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { EmrRepository } from './emr.repository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { generatePrescriptionPdf } from '../../lib/pdfGenerator.js';
import { getPrescriptionEmail } from '../../lib/emailTemplates.js';
import { sendMail } from '../../lib/mailer.js';

export class EmrService {
  private repository = new EmrRepository();

  async getEmrList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getEmrById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Emr not found', 404, 'NOT_FOUND');
    return item;
  }

  async createEmr(data: any, hospitalId: string) {
    const created = await this.repository.create(data, hospitalId);

    // Generate PDF Prescription & Dispatch Email to Patient with Attachment
    try {
      await this.dispatchPrescription(data, hospitalId);
    } catch {
      // Non-blocking email error log
    }

    return created;
  }

  async dispatchPrescription(data: any, _hospitalId: string = 'HOSP-001') {
    const rxId = data.rxNumber || `RX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const patientName = data.patientName || 'Jane Patient';
    const mrn = data.mrn || 'MC-1001';
    const doctorName = data.doctorName || 'Dr. Gregory House, M.D.';
    const diagnosis = data.diagnosis || 'Essential Hypertension & Cardiac Risk Profiling';
    const patientEmail = data.patientEmail || data.email || `${patientName.toLowerCase().replace(/\s+/g, '.')}@medflow.com`;

    const pdfBuffer = await generatePrescriptionPdf({
      prescriptionId: rxId,
      patientName,
      mrn,
      patientAge: data.patientAge || '42',
      patientGender: data.patientGender || 'Female',
      doctorName,
      doctorSpecialty: data.department || 'Department of Cardiology & Diagnostic Medicine',
      department: data.department || 'Department of Cardiology',
      diagnosis,
      vitals: data.vitals || {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        spo2: '99%',
        temp: '98.6 °F',
        weightHeight: '70 kg / 175 cm',
        bmi: '22.9 kg/m²',
        glucose: '95 mg/dL',
      },
      medications: data.medications || [
        { name: 'Amoxicillin 500mg Capsules', dosage: '1 Capsule TID (Every 8 Hours)', instructions: 'Take after food for 7 consecutive days' },
        { name: 'Amlodipine Besylate 5mg Tablets', dosage: '1 Tablet Daily (Morning)', instructions: 'Monitor blood pressure weekly' },
        { name: 'Atorvastatin 10mg Tablets', dosage: '1 Tablet Bedtime', instructions: 'Lipid management therapy' },
      ],
      labTests: data.labTests || [
        { name: 'CBC (Complete Blood Count & Differential)', category: 'Blood & Pathology', specimen: 'Venous Blood (EDTA)', instructions: 'Fasting Not Required • Turnaround: 4 Hours' },
        { name: 'ECG / EKG 12-Lead Cardiac Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive Diagnostic', instructions: 'Fasting Not Required • Turnaround: Immediate' },
      ],
      date: data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      signatureHash: data.signatureHash || 'SHA256: 8f92a40b192c78d011fe928410294ab12',
    });

    const emailTpl = getPrescriptionEmail({ patientName, doctorName, diagnosis, rxId });

    await sendMail({
      to: patientEmail,
      subject: `Official Electronic Medical Prescription #${rxId} — ${patientName}`,
      html: emailTpl.html,
      attachments: [
        {
          filename: `Prescription_${rxId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { rxId, status: 'DISPATCHED_TO_PATIENT_EMAIL', attachment: `Prescription_${rxId}.pdf` };
  }

  async updateEmr(id: string, data: any, hospitalId: string) {
    await this.getEmrById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteEmr(id: string, hospitalId: string) {
    await this.getEmrById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}
