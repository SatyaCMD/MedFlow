'use client';

export interface DispensaryOrder {
  id: string;
  orderNo: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  medications: Array<{ name: string; qty: number; instructions: string }>;
  totalAmount: number;
  date: string;
  status: 'PENDING_FULFILLMENT' | 'DISPENSED' | 'READY_FOR_PICKUP';
}

export interface DiagnosticOrder {
  id: string;
  orderNo: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  testName: string;
  category: string;
  specimen: string;
  urgency: 'STAT_CRITICAL' | 'URGENT' | 'ROUTINE';
  date: string;
  status: 'SAMPLE_COLLECTED' | 'IN_PROCESSING' | 'REPORT_COMPLETED';
}

export interface WardConsultation {
  id: string;
  consultNo: string;
  patientName: string;
  mrn: string;
  roomBed: string;
  attendingDoctor: string;
  consultingDoctor: string;
  specialty: string;
  urgency: 'EMERGENCY_STAT' | 'POST_OP_EVALUATION' | 'ROUTINE_ROUNDS';
  reason: string;
  requestedAt: string;
  status: 'PENDING_ACKNOWLEDGMENT' | 'ROUND_IN_PROGRESS' | 'CONSULTATION_COMPLETED';
}

export interface TransfusionOrder {
  id: string;
  orderNo: string;
  patientName: string;
  mrn: string;
  bloodGroup: string;
  units: number;
  requestingDoctor: string;
  department: string;
  priority: 'CRITICAL_STAT' | 'HIGH_PRIORITY' | 'ROUTINE';
  crossMatchStatus: 'VERIFIED_MATCH' | 'TESTING_IN_PROGRESS' | 'PENDING_SAMPLE';
  date: string;
  status: 'PENDING_CLEARANCE' | 'APPROVED_DISPATCHED' | 'TRANSFUSION_COMPLETED';
}

export interface DepartmentConsultation {
  id: string;
  consultNo: string;
  requestingDept: string;
  targetDept: string;
  attendingDoctor: string;
  consultantDoctor: string;
  patientName: string;
  mrn: string;
  urgency: 'STAT' | 'HIGH' | 'NORMAL';
  turnaroundTime: string;
  date: string;
  status: 'SCHEDULED' | 'IN_CONSULTATION' | 'COMPLETED';
}

// Initial Seed Dispensary Orders
export const INITIAL_DISPENSARY_ORDERS: DispensaryOrder[] = [
  {
    id: 'do-101',
    orderNo: 'DISP-2026-8801',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    doctorName: 'Dr. Devendra Roy',
    department: 'Cardiology',
    medications: [
      { name: 'Amlodipine Besylate 5mg Tablets', qty: 30, instructions: '1 tab daily after breakfast' },
      { name: 'Atorvastatin 10mg Tablets', qty: 30, instructions: '1 tab daily at bedtime' },
    ],
    totalAmount: 450,
    date: 'Aug 03, 2026 10:15 AM',
    status: 'PENDING_FULFILLMENT',
  },
  {
    id: 'do-102',
    orderNo: 'DISP-2026-8802',
    patientName: 'Jane Patient',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    medications: [
      { name: 'Amoxicillin 625mg Antibiotic', qty: 10, instructions: '1 tab every 12 hours' },
      { name: 'Paracetamol 650mg Tablets', qty: 15, instructions: '1 tab as needed for fever' },
    ],
    totalAmount: 320,
    date: 'Aug 03, 2026 11:30 AM',
    status: 'PENDING_FULFILLMENT',
  },
  {
    id: 'do-103',
    orderNo: 'DISP-2026-8803',
    patientName: 'John Doe',
    mrn: 'MC-1002',
    doctorName: 'Dr. Gregory House',
    department: 'Internal Medicine',
    medications: [
      { name: 'Metformin 500mg SR Tablets', qty: 60, instructions: '1 tab twice daily with meals' },
    ],
    totalAmount: 210,
    date: 'Aug 03, 2026 09:45 AM',
    status: 'DISPENSED',
  },
];

// Initial Seed Diagnostic Orders
export const INITIAL_DIAGNOSTIC_ORDERS: DiagnosticOrder[] = [
  {
    id: 'lab-101',
    orderNo: 'DX-2026-4401',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    doctorName: 'Dr. Devendra Roy',
    department: 'Cardiology',
    testName: 'Lipid Profile Panel & Cardiac Troponin-I',
    category: 'Pathology & Metabolic',
    specimen: 'Venous Blood (Serum)',
    urgency: 'STAT_CRITICAL',
    date: 'Aug 03, 2026 10:30 AM',
    status: 'IN_PROCESSING',
  },
  {
    id: 'lab-102',
    orderNo: 'DX-2026-4402',
    patientName: 'Jane Patient',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Pulmonology',
    testName: 'Complete Blood Count (CBC) + ESR',
    category: 'Hematology',
    specimen: 'EDTA Whole Blood',
    urgency: 'URGENT',
    date: 'Aug 03, 2026 11:00 AM',
    status: 'SAMPLE_COLLECTED',
  },
  {
    id: 'lab-103',
    orderNo: 'DX-2026-4403',
    patientName: 'Sarah Connor',
    mrn: 'MC-1003',
    doctorName: 'Dr. Siddharth Joshi',
    department: 'Neurology',
    testName: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Endocrinology',
    specimen: 'Serum Specimen',
    urgency: 'ROUTINE',
    date: 'Aug 03, 2026 08:30 AM',
    status: 'REPORT_COMPLETED',
  },
];

// Initial Seed Ward Consultations
export const INITIAL_WARD_CONSULTATIONS: WardConsultation[] = [
  {
    id: 'wc-101',
    consultNo: 'WRD-2026-301',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    roomBed: 'ICU Bed 04',
    attendingDoctor: 'Dr. Devendra Roy',
    consultingDoctor: 'Dr. Siddharth Joshi',
    specialty: 'Neurology Evaluation',
    urgency: 'EMERGENCY_STAT',
    reason: 'Post-hypertensive crisis neurological assessment & BP titration review.',
    requestedAt: 'Aug 03, 2026 11:15 AM',
    status: 'PENDING_ACKNOWLEDGMENT',
  },
  {
    id: 'wc-102',
    consultNo: 'WRD-2026-302',
    patientName: 'Jane Patient',
    mrn: 'MC-1001',
    roomBed: 'Private Ward 302',
    attendingDoctor: 'Dr. Anup Singh',
    consultingDoctor: 'Dr. Meera Iyer',
    specialty: 'Pulmonary Consult',
    urgency: 'POST_OP_EVALUATION',
    reason: 'Respiratory clearance & post-operative lung expansion monitoring.',
    requestedAt: 'Aug 03, 2026 10:00 AM',
    status: 'ROUND_IN_PROGRESS',
  },
  {
    id: 'wc-103',
    consultNo: 'WRD-2026-303',
    patientName: 'Bruce Wayne',
    mrn: 'MC-1004',
    roomBed: 'Surgical ICU 01',
    attendingDoctor: 'Dr. Shweta Kapoor',
    consultingDoctor: 'Dr. Manish Chatterjee',
    specialty: 'Spine Orthopedics',
    urgency: 'ROUTINE_ROUNDS',
    reason: 'Joint mobility & post-trauma spinal alignment check.',
    requestedAt: 'Aug 03, 2026 09:15 AM',
    status: 'CONSULTATION_COMPLETED',
  },
];

// Initial Seed Transfusion Orders
export const INITIAL_TRANSFUSION_ORDERS: TransfusionOrder[] = [
  {
    id: 'to-101',
    orderNo: 'TX-2026-9901',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    bloodGroup: 'O+',
    units: 2,
    requestingDoctor: 'Dr. Devendra Roy',
    department: 'Cardiology ICU',
    priority: 'CRITICAL_STAT',
    crossMatchStatus: 'VERIFIED_MATCH',
    date: 'Aug 03, 2026 11:20 AM',
    status: 'PENDING_CLEARANCE',
  },
  {
    id: 'to-102',
    orderNo: 'TX-2026-9902',
    patientName: 'Sarah Connor',
    mrn: 'MC-1003',
    bloodGroup: 'AB-',
    units: 1,
    requestingDoctor: 'Dr. Tarun Gupta',
    department: 'Surgical Oncology',
    priority: 'HIGH_PRIORITY',
    crossMatchStatus: 'VERIFIED_MATCH',
    date: 'Aug 03, 2026 10:45 AM',
    status: 'APPROVED_DISPATCHED',
  },
  {
    id: 'to-103',
    orderNo: 'TX-2026-9903',
    patientName: 'Bruce Wayne',
    mrn: 'MC-1004',
    bloodGroup: 'B+',
    units: 3,
    requestingDoctor: 'Dr. Shweta Kapoor',
    department: 'Trauma ER',
    priority: 'CRITICAL_STAT',
    crossMatchStatus: 'TESTING_IN_PROGRESS',
    date: 'Aug 03, 2026 09:30 AM',
    status: 'PENDING_CLEARANCE',
  },
];

// Initial Seed Department Consultations
export const INITIAL_DEPARTMENT_CONSULTATIONS: DepartmentConsultation[] = [
  {
    id: 'dc-101',
    consultNo: 'DEPT-2026-501',
    requestingDept: 'Cardiology',
    targetDept: 'Neurology',
    attendingDoctor: 'Dr. Devendra Roy',
    consultantDoctor: 'Dr. Siddharth Joshi',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1005',
    urgency: 'STAT',
    turnaroundTime: '15 Mins Avg',
    date: 'Aug 03, 2026 11:15 AM',
    status: 'IN_CONSULTATION',
  },
  {
    id: 'dc-102',
    consultNo: 'DEPT-2026-502',
    requestingDept: 'Pulmonology',
    targetDept: 'Pediatrics',
    attendingDoctor: 'Dr. Anup Singh',
    consultantDoctor: 'Dr. Meera Iyer',
    patientName: 'Jane Patient',
    mrn: 'MC-1001',
    urgency: 'HIGH',
    turnaroundTime: '25 Mins Avg',
    date: 'Aug 03, 2026 10:30 AM',
    status: 'SCHEDULED',
  },
  {
    id: 'dc-103',
    consultNo: 'DEPT-2026-503',
    requestingDept: 'Orthopedics',
    targetDept: 'Radiology',
    attendingDoctor: 'Dr. Shweta Kapoor',
    consultantDoctor: 'Dr. Sunil Verma',
    patientName: 'Bruce Wayne',
    mrn: 'MC-1004',
    urgency: 'NORMAL',
    turnaroundTime: '40 Mins Avg',
    date: 'Aug 03, 2026 09:00 AM',
    status: 'COMPLETED',
  },
];

const KEYS = {
  DISPENSARY: 'medflow_dispensary_orders_v1',
  DIAGNOSTIC: 'medflow_diagnostic_orders_v1',
  WARD: 'medflow_ward_consultations_v1',
  TRANSFUSION: 'medflow_transfusion_orders_v1',
  DEPT_CONSULT: 'medflow_dept_consultations_v1',
};

export const getDispensaryOrdersStore = (): DispensaryOrder[] => {
  if (typeof window === 'undefined') return INITIAL_DISPENSARY_ORDERS;
  const stored = localStorage.getItem(KEYS.DISPENSARY);
  if (!stored) {
    localStorage.setItem(KEYS.DISPENSARY, JSON.stringify(INITIAL_DISPENSARY_ORDERS));
    return INITIAL_DISPENSARY_ORDERS;
  }
  try { return JSON.parse(stored); } catch { return INITIAL_DISPENSARY_ORDERS; }
};

export const updateDispensaryOrderStatus = (id: string, status: DispensaryOrder['status']) => {
  const current = getDispensaryOrdersStore();
  const updated = current.map((o) => (o.id === id ? { ...o, status } : o));
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.DISPENSARY, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow_orders_updated'));
  }
  return updated;
};

export const getDiagnosticOrdersStore = (): DiagnosticOrder[] => {
  if (typeof window === 'undefined') return INITIAL_DIAGNOSTIC_ORDERS;
  const stored = localStorage.getItem(KEYS.DIAGNOSTIC);
  if (!stored) {
    localStorage.setItem(KEYS.DIAGNOSTIC, JSON.stringify(INITIAL_DIAGNOSTIC_ORDERS));
    return INITIAL_DIAGNOSTIC_ORDERS;
  }
  try { return JSON.parse(stored); } catch { return INITIAL_DIAGNOSTIC_ORDERS; }
};

export const updateDiagnosticOrderStatus = (id: string, status: DiagnosticOrder['status']) => {
  const current = getDiagnosticOrdersStore();
  const updated = current.map((o) => (o.id === id ? { ...o, status } : o));
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.DIAGNOSTIC, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow_orders_updated'));
  }
  return updated;
};

export const getWardConsultationsStore = (): WardConsultation[] => {
  if (typeof window === 'undefined') return INITIAL_WARD_CONSULTATIONS;
  const stored = localStorage.getItem(KEYS.WARD);
  if (!stored) {
    localStorage.setItem(KEYS.WARD, JSON.stringify(INITIAL_WARD_CONSULTATIONS));
    return INITIAL_WARD_CONSULTATIONS;
  }
  try { return JSON.parse(stored); } catch { return INITIAL_WARD_CONSULTATIONS; }
};

export const updateWardConsultationStatus = (id: string, status: WardConsultation['status']) => {
  const current = getWardConsultationsStore();
  const updated = current.map((c) => (c.id === id ? { ...c, status } : c));
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.WARD, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow_orders_updated'));
  }
  return updated;
};

export const getTransfusionOrdersStore = (): TransfusionOrder[] => {
  if (typeof window === 'undefined') return INITIAL_TRANSFUSION_ORDERS;
  const stored = localStorage.getItem(KEYS.TRANSFUSION);
  if (!stored) {
    localStorage.setItem(KEYS.TRANSFUSION, JSON.stringify(INITIAL_TRANSFUSION_ORDERS));
    return INITIAL_TRANSFUSION_ORDERS;
  }
  try { return JSON.parse(stored); } catch { return INITIAL_TRANSFUSION_ORDERS; }
};

export const updateTransfusionOrderStatus = (id: string, status: TransfusionOrder['status']) => {
  const current = getTransfusionOrdersStore();
  const updated = current.map((o) => (o.id === id ? { ...o, status } : o));
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.TRANSFUSION, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow_orders_updated'));
  }
  return updated;
};

export const getDeptConsultationsStore = (): DepartmentConsultation[] => {
  if (typeof window === 'undefined') return INITIAL_DEPARTMENT_CONSULTATIONS;
  const stored = localStorage.getItem(KEYS.DEPT_CONSULT);
  if (!stored) {
    localStorage.setItem(KEYS.DEPT_CONSULT, JSON.stringify(INITIAL_DEPARTMENT_CONSULTATIONS));
    return INITIAL_DEPARTMENT_CONSULTATIONS;
  }
  try { return JSON.parse(stored); } catch { return INITIAL_DEPARTMENT_CONSULTATIONS; }
};

export const updateDeptConsultationStatus = (id: string, status: DepartmentConsultation['status']) => {
  const current = getDeptConsultationsStore();
  const updated = current.map((c) => (c.id === id ? { ...c, status } : c));
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.DEPT_CONSULT, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow_orders_updated'));
  }
  return updated;
};
