'use client';

import { creditPatientWallet } from './patientWalletStore';

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
  status:
    | 'PENDING DOCTOR APPROVAL'
    | 'PENDING NURSE VITALS'
    | 'VITALS RECORDED & READY FOR DOCTOR'
    | 'Approved'
    | 'Approved & Confirmed'
    | 'Completed'
    | 'Completed & Prescribed'
    | 'EXPIRED & REFUNDED'
    | 'Confirmed'
    | 'Rescheduled';
  isPaid: boolean;
  amount: string;
  createdAt?: number; // Timestamp when booked
  rxNumber?: string;
  hasPrescription?: boolean;
  prescriptionData?: any;
  isFollowUp?: boolean;
  discountPercent?: number;
  patientEmail?: string;
  vitalsDone?: boolean;
  vitals?: {
    bp: string;
    hr: string;
    temp: string;
    spo2?: string;
    recordedAt?: string;
    nurseName?: string;
  };
}

const APPOINTMENTS_STORAGE_KEY = 'medflow_shared_appointments_v4';

const now = Date.now();
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const INITIAL_APPOINTMENTS: SharedAppointment[] = [
  {
    id: 'APP-99201',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    date: 'Today',
    timeSlot: '08:30 AM',
    location: 'Cardiology Wing Suite 101',
    purpose: 'Cardiovascular Risk Audit & Follow-Up',
    status: 'PENDING DOCTOR APPROVAL',
    isPaid: true,
    amount: '₹1,500',
    createdAt: now - 3 * 60 * 60 * 1000, // 3 hours ago
  },
  {
    id: 'APP-99202',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    date: 'Jul 31, 2026',
    timeSlot: '08:30 AM',
    location: 'Cardiology Wing Suite 101',
    purpose: 'Hypertension Diagnostic Workup',
    status: 'VITALS RECORDED & READY FOR DOCTOR',
    isPaid: true,
    amount: '₹1,500',
    createdAt: now - 1 * 24 * 60 * 60 * 1000,
    vitals: {
      bp: '120/80 mmHg',
      hr: '74 bpm',
      temp: '98.6 °F',
      spo2: '99 %',
      recordedAt: '08:15 AM',
      nurseName: 'Nurse Clara Barton (Room 204)',
    },
  },
  {
    id: 'APP-99203',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Devendra Roy, M.D.',
    department: 'Cardiology & Internal Medicine',
    date: 'Jul 21, 2026',
    timeSlot: '10:30 AM',
    location: 'OPD Suite 204',
    purpose: 'Cardiology OPD Consultation & EMR Audit',
    status: 'Completed & Prescribed',
    isPaid: true,
    amount: '₹1,500',
    createdAt: now - 10 * 24 * 60 * 60 * 1000,
    hasPrescription: true,
    rxNumber: 'RX-2026-9901',
    prescriptionData: {
      rxNumber: 'RX-2026-9901',
      patientName: 'Sai Satyabrata',
      mrn: 'MC-1001',
      age: '19 Yrs',
      gender: 'Male',
      bloodGroup: 'O+',
      doctorName: 'Dr. Devendra Roy, M.D.',
      department: 'Cardiology & Internal Medicine',
      date: 'Jul 21, 2026',
      diagnosis: 'Essential Hypertension (ICD-10 I10)',
      nurseVitals: {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        spo2: '99%',
        temp: '98.6 °F',
        weight: '70 kg',
        height: '175 cm',
        bmi: '22.9 kg/m²',
        glucose: '95 mg/dL',
        nurseName: 'Nurse Clara, R.N.',
      },
      medications: [
        { name: 'Amlodipine Besylate 5mg Tablets', dosage: 'Once Daily (QD - Morning)', instructions: 'Take after breakfast for 30 Days' },
        { name: 'Atorvastatin 10mg Tablets', dosage: 'At Bedtime (HS - Night)', instructions: 'Take before bed for 30 Days' },
      ],
      labTests: [
        { name: 'Lipid Profile (Total Cholesterol, HDL, LDL)', category: 'Metabolic & Hormonal', specimen: 'Serum', instructions: '12-Hour Fasting Required' },
        { name: 'ECG / EKG 12-Lead Cardiac Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive', instructions: 'Fasting Not Required' },
      ],
      signatureHash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
    },
  },
  {
    id: 'APP-88402',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Siddharth Joshi',
    department: 'Neurology',
    date: 'Jul 25, 2026',
    timeSlot: '02:00 PM',
    location: 'Neurology Suite 305',
    purpose: 'Migraine & EEG Workup',
    status: 'EXPIRED & REFUNDED',
    isPaid: true,
    amount: '₹1,500',
    createdAt: now - 5 * 24 * 60 * 60 * 1000, // 5 days ago (Auto Refunded)
  },
];

export function getSharedAppointments(userEmail?: string): SharedAppointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    let appointments: SharedAppointment[] = [];
    if (raw) {
      appointments = JSON.parse(raw);
    } else {
      appointments = INITIAL_APPOINTMENTS;
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    const refunded = checkAndAutoRefundExpiredAppointments(appointments);

    if (!userEmail) return refunded;

    const cleanEmail = userEmail.trim().toLowerCase();
    const isSeedUser = cleanEmail.includes('sai_satyabrata') || cleanEmail.includes('test_admin') || cleanEmail.includes('patient@medflow.com');
    
    // Filter appointments matching this patient's email or name
    return refunded.filter((app) => {
      if (app.patientEmail && app.patientEmail.toLowerCase() === cleanEmail) return true;
      if (isSeedUser && app.patientName.toLowerCase().includes('satyabrata')) return true;
      if (app.patientEmail && cleanEmail.includes(app.patientEmail.split('@')[0])) return true;
      return false;
    });
  } catch {
    return [];
  }
}

export function saveSharedAppointment(newApp: SharedAppointment): SharedAppointment[] {
  const current = getSharedAppointments(); // Get all from unified storage
  const appToAdd = {
    ...newApp,
    createdAt: newApp.createdAt || Date.now(),
  };
  const updated = [appToAdd, ...current];
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

export function updateSharedAppointmentStatus(
  id: string,
  status: SharedAppointment['status']
): SharedAppointment[] {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(APPOINTMENTS_STORAGE_KEY) : null;
  const current: SharedAppointment[] = raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
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

export function updateSharedAppointmentVitals(
  id: string,
  vitals: SharedAppointment['vitals']
): SharedAppointment[] {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(APPOINTMENTS_STORAGE_KEY) : null;
  const current: SharedAppointment[] = raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
  const updated = current.map((a) =>
    a.id === id ? { ...a, vitals, vitalsDone: true, status: 'VITALS RECORDED & READY FOR DOCTOR' as const } : a
  );
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

export function updateSharedAppointmentWithRx(
  targetIdOrMrnOrName: string,
  rxData: any
): SharedAppointment[] {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(APPOINTMENTS_STORAGE_KEY) : null;
  const current: SharedAppointment[] = raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS;
  
  let targetFound = false;
  const updated = current.map((a) => {
    const match =
      a.id === targetIdOrMrnOrName ||
      a.mrn === targetIdOrMrnOrName ||
      a.patientName.toLowerCase().includes(targetIdOrMrnOrName.toLowerCase());
    
    if (match && !targetFound) {
      targetFound = true;
      return {
        ...a,
        status: 'Completed & Prescribed' as const,
        hasPrescription: true,
        rxNumber: rxData.rxNumber,
        prescriptionData: rxData,
      };
    }
    return a;
  });

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

// 3-Day Auto-Refund Engine Function
export function checkAndAutoRefundExpiredAppointments(
  currentAppointments?: SharedAppointment[],
  customStorageKey?: string
): SharedAppointment[] {
  const appointments = currentAppointments || getSharedAppointments();
  const currentTime = Date.now();
  let changed = false;

  const updated = appointments.map((app) => {
    if (app.status === 'PENDING DOCTOR APPROVAL' && app.isPaid) {
      const createdTime = app.createdAt || currentTime;
      if (currentTime - createdTime >= THREE_DAYS_MS) {
        changed = true;
        // Credit paid amount to patient wallet
        const numericAmount = parseInt(app.amount.replace(/[^0-9]/g, ''), 10) || 1500;
        creditPatientWallet(
          numericAmount,
          `Auto-Refund: Doctor approval pending over 3 days (Appointment #${app.id})`,
          app.id
        );

        return {
          ...app,
          status: 'EXPIRED & REFUNDED' as const,
        };
      }
    }
    return app;
  });

  if (changed && typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
      window.dispatchEvent(new Event('medflow-wallet-updated'));
    } catch {
      // Non-blocking
    }
  }

  return updated;
}

// Manual Test Simulation Helper Function (Triggers Immediate 3-Day Refund for Demo)
export function simulateThreeDayRefundForDemo(appointmentId?: string): {
  success: boolean;
  refundedApp: SharedAppointment | null;
  amount: number;
} {
  const current = getSharedAppointments();
  const target = appointmentId
    ? current.find((a) => a.id === appointmentId)
    : current.find((a) => a.status === 'PENDING DOCTOR APPROVAL' && a.isPaid);

  if (!target) {
    return { success: false, refundedApp: null, amount: 0 };
  }

  const numericAmount = parseInt(target.amount.replace(/[^0-9]/g, ''), 10) || 1500;
  creditPatientWallet(
    numericAmount,
    `Simulated Auto-Refund: 3-Day Expiry Guarantee (Appointment #${target.id})`,
    target.id
  );

  const updated = current.map((a) =>
    a.id === target.id
      ? {
          ...a,
          status: 'EXPIRED & REFUNDED' as const,
          createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        }
      : a
  );

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('medflow-appointment-updated'));
      window.dispatchEvent(new Event('medflow-wallet-updated'));
    } catch {
      // Non-blocking
    }
  }

  return {
    success: true,
    refundedApp: { ...target, status: 'EXPIRED & REFUNDED' },
    amount: numericAmount,
  };
}
