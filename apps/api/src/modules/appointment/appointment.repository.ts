/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Appointment, IAppointment } from './appointment.model.js';

export class AppointmentRepository extends BaseRepository<IAppointment> {
  constructor() {
    super(Appointment);
  }
}

