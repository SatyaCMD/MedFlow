'use client';

export interface LabReportData {
  findings: string;
  notes: string;
  technicianName: string;
  submittedAt: string;
  doctorName: string;
}

export interface LabOrderRecord {
  id: string;
  rxNumber: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  testName: string;
  category: string;
  specimen: string;
  fastingRequirement: string;
  date: string;
  timestamp: number;
  status: 'PENDING_SAMPLE' | 'IN_PROCESSING' | 'REPORT_SUBMITTED';
  report?: LabReportData;
}

export interface ClinicalRecord {
  id: string;
  rxNumber: string;
  patientName: string;
  mrn: string;
  doctorName: string;
  department: string;
  date: string;
  timestamp: number;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
  labTests?: Array<{
    name: string;
    category?: string;
    specimen?: string;
    instructions?: string;
  }>;
  signatureHash: string;
}

export interface PharmacySaleRecord {
  id: string;
  invoiceNo: string;
  date: string;
  timestamp: number;
  customerName: string; // Patient Name or Hospital Dept
  mrn?: string;
  type: 'PATIENT_DISPENSARY' | 'HOSPITAL_WARD_STOCK';
  items: Array<{
    medicineName: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  dispensedBy: string;
}

const STORAGE_KEYS = {
  CLINICAL_RECORDS: 'medicore_clinical_records',
  LAB_ORDERS: 'medicore_lab_orders',
  PHARMACY_SALES: 'medicore_pharmacy_sales',
};

// Initial Seed Clinical Records (Within 1 Year)
const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'cr-101',
    rxNumber: 'RX-2026-88912',
    patientName: 'Sarah Connor',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    date: '2026-07-20',
    timestamp: new Date('2026-07-20').getTime(),
    diagnosis: 'Essential Hypertension & Cardiac Risk Profiling',
    medications: [
      { name: 'Amlodipine Besylate 5mg Tablets', dosage: 'Once Daily (QD - Morning) • 30 Days', instructions: 'After Food — Take with water after breakfast' },
      { name: 'Atorvastatin 10mg Tablets', dosage: 'At Bedtime (HS - Night) • 30 Days', instructions: 'After Food — Lipid management therapy' },
    ],
    labTests: [
      { name: 'Lipid Profile (Total Cholesterol, HDL, LDL)', category: 'Metabolic & Hormonal', specimen: 'Serum', instructions: '12-Hour Fasting Required' },
      { name: 'ECG / EKG 12-Lead Cardiac Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive', instructions: 'Fasting Not Required' },
    ],
    signatureHash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
  },
  {
    id: 'cr-102',
    rxNumber: 'RX-2026-77401',
    patientName: 'John Doe',
    mrn: 'MC-1002',
    doctorName: 'Dr. Devendra Roy',
    department: 'Cardiology',
    date: '2026-06-15',
    timestamp: new Date('2026-06-15').getTime(),
    diagnosis: 'Acute Arrhythmia & Cardiac Palpitations',
    medications: [
      { name: 'Metoprolol Succinate 25mg Tablets', dosage: 'Twice Daily (BID - Every 12 Hours) • 14 Days', instructions: 'After Food — Monitor heart rate' },
    ],
    labTests: [
      { name: 'ECG / EKG 12-Lead Cardiac Diagnostic Tracing', category: 'Cardiac & ECG', specimen: 'Non-Invasive Diagnostic', instructions: 'Immediate' },
    ],
    signatureHash: 'SHA256: 3c12e50d890a77b612fe889104018274d',
  },
  {
    id: 'cr-103',
    rxNumber: 'RX-2025-55109',
    patientName: 'Sarah Connor',
    mrn: 'MC-1001',
    doctorName: 'Dr. Priya Sharma',
    department: 'Internal Medicine',
    date: '2025-11-10',
    timestamp: new Date('2025-11-10').getTime(),
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    medications: [
      { name: 'Amoxicillin 500mg Capsules', dosage: 'Thrice Daily (TID - Every 8 Hours) • 7 Days', instructions: 'After Food — Take full course' },
      { name: 'Paracetamol 650mg Tablets', dosage: 'As Needed (PRN) • 5 Days', instructions: 'After Food — For fever > 100°F' },
    ],
    signatureHash: 'SHA256: 77a01bc992d34e00192eab8871029471f',
  },
];

// Initial Seed Lab Orders
const INITIAL_LAB_ORDERS: LabOrderRecord[] = [
  {
    id: 'lo-201',
    rxNumber: 'RX-2026-88912',
    patientName: 'Sarah Connor',
    mrn: 'MC-1001',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    testName: 'Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)',
    category: 'Metabolic & Hormonal',
    specimen: 'Serum (Yellow Top)',
    fastingRequirement: '12-Hour Fasting Required',
    date: '2026-07-20',
    timestamp: new Date('2026-07-20').getTime(),
    status: 'REPORT_SUBMITTED',
    report: {
      findings: 'Total Cholesterol: 210 mg/dL (Mildly Elevated), HDL: 48 mg/dL, LDL: 135 mg/dL, Triglycerides: 160 mg/dL',
      notes: 'Mild hyperlipidemia noted. Continue statin therapy and dietary restriction.',
      technicianName: 'Rajesh Kumar (Chief Lab Technician)',
      submittedAt: '2026-07-20 04:30 PM',
      doctorName: 'Dr. Anup Singh',
    },
  },
  {
    id: 'lo-202',
    rxNumber: 'RX-2026-77401',
    patientName: 'John Doe',
    mrn: 'MC-1002',
    doctorName: 'Dr. Devendra Roy',
    department: 'Cardiology',
    testName: 'ECG / EKG 12-Lead Cardiac Diagnostic Tracing',
    category: 'Cardiac & ECG',
    specimen: 'Non-Invasive Diagnostic',
    fastingRequirement: 'Fasting Not Required',
    date: '2026-07-23',
    timestamp: new Date('2026-07-23').getTime(),
    status: 'IN_PROCESSING',
  },
  {
    id: 'lo-203',
    rxNumber: 'RX-2026-99014',
    patientName: 'Bruce Wayne',
    mrn: 'MC-1003',
    doctorName: 'Dr. Rajesh Patel',
    department: 'Orthopedics',
    testName: 'CBC (Complete Blood Count & Differential)',
    category: 'Blood & Pathology',
    specimen: 'Venous Blood (EDTA)',
    fastingRequirement: 'Fasting Not Required',
    date: '2026-07-24',
    timestamp: new Date('2026-07-24').getTime(),
    status: 'PENDING_SAMPLE',
  },
];

// Initial Seed Pharmacy Sales Records
const INITIAL_PHARMACY_SALES: PharmacySaleRecord[] = [
  {
    id: 'ps-301',
    invoiceNo: 'INV-2026-0091',
    date: '2026-07-23 11:20 AM',
    timestamp: new Date('2026-07-23').getTime(),
    customerName: 'Sarah Connor (MC-1001)',
    mrn: 'MC-1001',
    type: 'PATIENT_DISPENSARY',
    items: [
      { medicineName: 'Amlodipine Besylate 5mg Tablets', qty: 30, unitPrice: 8.5, total: 255 },
      { medicineName: 'Atorvastatin 10mg Tablets', qty: 30, unitPrice: 14.0, total: 420 },
    ],
    totalAmount: 675,
    paymentMethod: 'Credit Card',
    dispensedBy: 'Pharmacist Dispensary',
  },
  {
    id: 'ps-302',
    invoiceNo: 'INV-2026-0092',
    date: '2026-07-23 02:45 PM',
    timestamp: new Date('2026-07-23').getTime(),
    customerName: 'ICU Critical Care Ward',
    type: 'HOSPITAL_WARD_STOCK',
    items: [
      { medicineName: 'Amoxicillin 500mg Injection', qty: 50, unitPrice: 45.0, total: 2250 },
      { medicineName: 'Normal Saline 500ml IV Pack', qty: 100, unitPrice: 35.0, total: 3500 },
    ],
    totalAmount: 5750,
    paymentMethod: 'Hospital Internal Audit',
    dispensedBy: 'Pharmacist Dispensary',
  },
];

export const getClinicalRecords = (): ClinicalRecord[] => {
  if (typeof window === 'undefined') return INITIAL_CLINICAL_RECORDS;
  const stored = localStorage.getItem(STORAGE_KEYS.CLINICAL_RECORDS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CLINICAL_RECORDS, JSON.stringify(INITIAL_CLINICAL_RECORDS));
    return INITIAL_CLINICAL_RECORDS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CLINICAL_RECORDS;
  }
};

export const saveClinicalRecord = (record: ClinicalRecord) => {
  const existing = getClinicalRecords();
  const updated = [record, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CLINICAL_RECORDS, JSON.stringify(updated));
  }

  // Also auto-create Lab Orders for any prescribed lab tests!
  if (record.labTests && record.labTests.length > 0) {
    const existingOrders = getLabOrders();
    const newOrders: LabOrderRecord[] = record.labTests.map((t, idx) => ({
      id: `lo-${Date.now()}-${idx}`,
      rxNumber: record.rxNumber,
      patientName: record.patientName,
      mrn: record.mrn,
      doctorName: record.doctorName,
      department: record.department,
      testName: t.name,
      category: t.category || 'Diagnostic Pathology',
      specimen: t.specimen || 'Clinical Specimen',
      fastingRequirement: t.instructions || 'Standard Protocol',
      date: record.date,
      timestamp: record.timestamp,
      status: 'PENDING_SAMPLE',
    }));
    saveLabOrders([...newOrders, ...existingOrders]);
  }

  return updated;
};

export const getLabOrders = (): LabOrderRecord[] => {
  if (typeof window === 'undefined') return INITIAL_LAB_ORDERS;
  const stored = localStorage.getItem(STORAGE_KEYS.LAB_ORDERS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.LAB_ORDERS, JSON.stringify(INITIAL_LAB_ORDERS));
    return INITIAL_LAB_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_LAB_ORDERS;
  }
};

export const saveLabOrders = (orders: LabOrderRecord[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAB_ORDERS, JSON.stringify(orders));
  }
};

export const submitLabReport = (orderId: string, reportData: LabReportData) => {
  const orders = getLabOrders();
  const updated = orders.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: 'REPORT_SUBMITTED' as const,
        report: reportData,
      };
    }
    return o;
  });
  saveLabOrders(updated);
  return updated;
};

export const getPharmacySales = (): PharmacySaleRecord[] => {
  if (typeof window === 'undefined') return INITIAL_PHARMACY_SALES;
  const stored = localStorage.getItem(STORAGE_KEYS.PHARMACY_SALES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PHARMACY_SALES, JSON.stringify(INITIAL_PHARMACY_SALES));
    return INITIAL_PHARMACY_SALES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PHARMACY_SALES;
  }
};

export const savePharmacySale = (sale: PharmacySaleRecord) => {
  const existing = getPharmacySales();
  const updated = [sale, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PHARMACY_SALES, JSON.stringify(updated));
  }
  return updated;
};
