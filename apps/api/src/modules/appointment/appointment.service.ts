/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { AppointmentRepository } from './appointment.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

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
    return this.repository.create(data, hospitalId);
  }

  async updateAppointment(id: string, data: any, hospitalId: string) {
    await this.getAppointmentById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteAppointment(id: string, hospitalId: string) {
    await this.getAppointmentById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

