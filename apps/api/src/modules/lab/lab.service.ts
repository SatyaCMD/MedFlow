/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { LabRepository } from './lab.repository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { generateLabReportPdf } from '../../lib/pdfGenerator.js';
import { getLabReportEmail } from '../../lib/emailTemplates.js';
import { sendMail } from '../../lib/mailer.js';

export class LabService {
  private repository = new LabRepository();

  async getLabList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getLabById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Lab not found', 404, 'NOT_FOUND');
    return item;
  }

  async createLab(data: any, hospitalId: string) {
    const created = await this.repository.create(data, hospitalId);

    // Generate PDF Lab Report & Dispatch Email to Patient with Attachment
    try {
      const reportId = created._id?.toString() || `LAB-${Date.now().toString().slice(-6)}`;
      const patientName = data.patientName || 'Patient';
      const testName = data.testName || 'Complete Blood Count (CBC)';
      const patientEmail = data.patientEmail || data.email || 'patient@medflow.com';

      const pdfBuffer = await generateLabReportPdf({
        reportId,
        patientName,
        testName,
        department: data.department || 'Hematology & Biochemistry',
        results: data.results || [
          { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'NORMAL' },
          { parameter: 'Total Leucocyte Count (WBC)', value: '7,800', unit: '/uL', referenceRange: '4,000 - 11,000', status: 'NORMAL' },
          { parameter: 'Platelet Count', value: '250,000', unit: '/uL', referenceRange: '150,000 - 450,000', status: 'NORMAL' },
          { parameter: 'Fasting Blood Sugar (FBS)', value: '98', unit: 'mg/dL', referenceRange: '70 - 100', status: 'NORMAL' },
        ],
      });

      const emailTpl = getLabReportEmail({ patientName, reportId, testName });

      sendMail({
        to: patientEmail,
        subject: emailTpl.subject,
        html: emailTpl.html,
        attachments: [
          {
            filename: `Lab_Report_${reportId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      }).catch(() => {});
    } catch {
      // Non-blocking notification
    }

    return created;
  }

  async updateLab(id: string, data: any, hospitalId: string) {
    await this.getLabById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteLab(id: string, hospitalId: string) {
    await this.getLabById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}
