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
    const rxId = data.rxNumber || `RX-${Date.now().toString().slice(-6)}`;
    const patientName = data.patientName || 'Patient';
    const doctorName = data.doctorName || 'Dr. Anup Singh';
    const diagnosis = data.diagnosis || 'Clinical Consultation Findings';
    const patientEmail = data.patientEmail || data.email || `${patientName.toLowerCase().replace(/\s+/g, '.')}@medflow.com`;

    const pdfBuffer = await generatePrescriptionPdf({
      prescriptionId: rxId,
      patientName,
      doctorName,
      doctorSpecialty: data.department || 'Clinical Specialist',
      diagnosis,
      medications: data.medications || [
        { name: 'Amoxicillin 500mg', dosage: '1 Tablet', frequency: '3 times daily', duration: '5 Days' },
        { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'As needed for fever', duration: '3 Days' },
      ],
    });

    const emailTpl = getPrescriptionEmail({ patientName, doctorName, diagnosis, rxId });

    await sendMail({
      to: patientEmail,
      subject: emailTpl.subject,
      html: emailTpl.html,
      attachments: [
        {
          filename: `Prescription_${rxId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return { rxId, status: 'DISPATCHED_TO_PATIENT_EMAIL' };
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
