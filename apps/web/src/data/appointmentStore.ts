'use client';

export interface SharedAppointment {
  id: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  location: string;
  purpose?: string;
  status: 'PENDING DOCTOR APPROVAL' | 'PENDING NURSE VITALS' | 'VITALS RECORDED & READY FOR DOCTOR' | 'Approved' | 'Approved & Confirmed' | 'Completed' | 'Completed & Prescribed' | 'Confirmed' | 'Rescheduled';
  isPaid: boolean;
  amount: string;
  patientEmail?: string;
  patientPhone?: string;
  vitals?: {
    bp: string;
    hr: string;
    temp: string;
    spo2?: string;
    recordedAt?: string;
    nurseName?: string;
  };
}

const APPOINTMENTS_STORAGE_KEY = 'medflow_shared_appointments_v2';

const INITIAL_APPOINTMENTS: SharedAppointment[] = [];

export function getSharedAppointments(): SharedAppointment[] {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveSharedAppointment(newApp: SharedAppointment): SharedAppointment[] {
  const current = getSharedAppointments();
  const updated = [newApp, ...current];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
    } catch {
      // Non-blocking storage
    }
  }
  return updated;
}

export function updateSharedAppointmentStatus(id: string, status: SharedAppointment['status']): SharedAppointment[] {
  const current = getSharedAppointments();
  const updated = current.map((a) => (a.id === id ? { ...a, status } : a));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
    } catch {
      // Non-blocking storage
    }
  }
  return updated;
}

export function updateSharedAppointmentVitals(id: string, vitals: SharedAppointment['vitals']): SharedAppointment[] {
  const current = getSharedAppointments();
  const updated = current.map((a) => (a.id === id ? { ...a, vitals, status: 'VITALS RECORDED & READY FOR DOCTOR' as const } : a));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
    } catch {
      // Non-blocking storage
    }
  }
  return updated;
}

export function updateSharedAppointmentPaid(id: string, isPaid: boolean): SharedAppointment[] {
  const current = getSharedAppointments();
  const updated = current.map((a) => (a.id === id ? { ...a, isPaid } : a));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
    } catch {
      // Non-blocking storage
    }
  }
  return updated;
}
