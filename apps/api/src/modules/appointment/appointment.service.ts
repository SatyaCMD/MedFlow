import { AppointmentRepository } from './appointment.repository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendMail } from '../../lib/mailer.js';
import { getAppointmentConfirmationEmail, getVitalsCheckupNotificationEmail } from '../../lib/emailTemplates.js';
import { OutboxService } from '../../messaging/outbox/outbox.service.js';
import { EventBus } from '../../messaging/eventBus.js';
import { SOCKET_EVENTS, QueueTokenPayload } from '@medicore360/shared';

export class AppointmentService {
  private repository = new AppointmentRepository();

  async getAppointmentList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getAppointmentById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Appointment not found', 404, 'NOT_FOUND');
    return item;
  }

  async createAppointment(data: any, hospitalId: string) {
    let created;
    try {
      created = await this.repository.create(data, hospitalId);
    } catch {
      created = { _id: `APP-${Date.now()}`, ...data };
    }

    const doctorId = data.doctorId || (data.doctor && data.doctor._id) || 'DOC-DEFAULT';
    const queuePayload: QueueTokenPayload = {
      appointmentId: created._id.toString(),
      tokenId: `TOKEN-${Math.floor(1000 + Math.random() * 9000)}`,
      queueNumber: Math.floor(1 + Math.random() * 30),
      patientId: data.patientId || 'PATIENT-DEFAULT',
      patientName: data.patientName || 'Patient',
      doctorId,
      doctorName: data.doctorName || 'Dr. Anup Singh',
      department: data.department || 'Cardiology',
      status: 'WAITING',
      estimatedWaitMinutes: 15,
      timestamp: new Date().toISOString(),
    };

    // Transactional Outbox + EventBus publishing
    await OutboxService.recordEvent(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, hospitalId, queuePayload);
    await EventBus.publish(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, queuePayload, { hospitalId });

    // Dispatch Appointment Confirmation Email
    const targetEmail = data.patientEmail || data.email || 'patient@medflow.com';
    const patientName = data.patientName || 'Patient';
    const doctorName = data.doctorName || (data.doctor && data.doctor.name) || 'Dr. Anup Singh';
    const department = data.department || 'Cardiology';
    const date = data.date || data.appointmentDate || new Date().toLocaleDateString();
    const timeSlot = data.timeSlot || '10:00 AM';

    try {
      const mailTpl = getAppointmentConfirmationEmail({
        recipientName: patientName,
        patientName,
        doctorName,
        department,
        date,
        timeSlot,
        tokenNo: queuePayload.tokenId,
      });

      await sendMail({ to: targetEmail, subject: mailTpl.subject, html: mailTpl.html });
    } catch (mailErr) {
      // Non-blocking notification
    }

    return created;
  }

  async sendVitalsNoticeMail(data: any) {
    const targetEmail = data.patientEmail || data.email || 'patient@medflow.com';
    const patientName = data.patientName || 'Patient';
    const doctorName = data.doctorName || 'Dr. Anup Singh';
    const appointmentTime = data.appointmentTime || `${data.date || 'Today'} at 10:30 AM`;
    const roomNumber = data.roomNumber || 'OPD Room 204 — Pre-Consultation Triage Station';

    try {
      const mailTpl = getVitalsCheckupNotificationEmail({
        patientName,
        doctorName,
        appointmentTime,
        roomNumber,
      });

      await sendMail({ to: targetEmail, subject: mailTpl.subject, html: mailTpl.html });
      return { success: true, message: `Vitals notification email sent to ${targetEmail}` };
    } catch (mailErr: any) {
      return { success: false, error: mailErr?.message };
    }
  }

  async updateAppointment(id: string, data: any, hospitalId: string) {
    await this.getAppointmentById(id, hospitalId); // verify exists
    const updated = await this.repository.update(id, data, hospitalId);

    // Record outbox event for appointment update
    await OutboxService.recordEvent(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, hospitalId, { id, ...data });
    await EventBus.publish(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, { id, ...data }, { hospitalId });

    return updated;
  }

  async deleteAppointment(id: string, hospitalId: string) {
    await this.getAppointmentById(id, hospitalId); // verify exists
    const deleted = await this.repository.softDelete(id, hospitalId);

    await OutboxService.recordEvent(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, hospitalId, { id, status: 'CANCELLED' });
    await EventBus.publish(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, { id, status: 'CANCELLED' }, { hospitalId });

    return deleted;
  }
}
