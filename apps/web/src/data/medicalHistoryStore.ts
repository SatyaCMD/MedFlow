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
  CLINICAL_RECORDS: 'medicore_clinical_records_v2',
  LAB_ORDERS: 'medicore_lab_orders_v2',
  PHARMACY_SALES: 'medicore_pharmacy_sales_v2',
};

// Initial Seed Clinical Records (Within 1 Year)
const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'cr-101',
    rxNumber: 'RX-2026-9901',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Devendra Roy, M.D.',
    department: 'Cardiology & Internal Medicine',
    date: 'Jul 21, 2026',
    timestamp: new Date('2026-07-21').getTime(),
    diagnosis: 'Essential Hypertension (ICD-10 I10)',
    medications: [
      { name: 'Amlodipine Besylate 5mg Tablets', dosage: 'Once Daily (QD - Morning)', instructions: 'Take after breakfast with water for 30 Days' },
      { name: 'Atorvastatin 10mg Tablets', dosage: 'At Bedtime (HS - Night)', instructions: 'Take before bed for 30 Days' },
    ],
    labTests: [
      { name: 'Lipid Profile Panel', category: 'Metabolic & Hormonal', specimen: 'Serum', instructions: '12-Hour Fasting Required' },
      { name: 'CBC Complete Blood Count', category: 'Blood & Pathology', specimen: 'Venous Blood', instructions: 'Fasting Not Required' },
    ],
    signatureHash: 'SHA256: 8f92a40b192c78d011fe928410294ab12',
  },
  {
    id: 'cr-102',
    rxNumber: 'RX-2026-9902',
    patientName: 'John Doe',
    mrn: 'MC-1002',
    doctorName: 'Dr. Siddharth Joshi',
    department: 'Neurology',
    date: 'Jul 15, 2026',
    timestamp: new Date('2026-07-15').getTime(),
    diagnosis: 'Acute Migraine Aura (ICD-10 G43.1)',
    medications: [
      { name: 'Sumatriptan 50mg Tablets', dosage: 'As Needed (PRN - Symptomatic)', instructions: 'Take 1 tablet at onset of migraine aura' },
      { name: 'Propranolol 40mg Sustained Release', dosage: 'Twice Daily (BID)', instructions: 'Take 1 tablet morning & evening' },
    ],
    labTests: [
      { name: 'Brain MRI 1.5T Scan', category: 'Radiology & Scans', specimen: 'MRI Scan', instructions: 'Fasting Not Required' },
    ],
    signatureHash: 'SHA256: 4e91b20a11fc78d099be20194ab99',
  },
  {
    id: 'cr-103',
    rxNumber: 'RX-2026-9903',
    patientName: 'Sarah Connor',
    mrn: 'MC-1003',
    doctorName: 'Dr. Anup Singh',
    department: 'Cardiology',
    date: 'Jul 28, 2026',
    timestamp: new Date('2026-07-28').getTime(),
    diagnosis: 'Coronary Post-Op Recovery (ICD-10 Z95.5)',
    medications: [
      { name: 'Clopidogrel 75mg Tablets', dosage: 'Once Daily (QD)', instructions: 'Take morning after breakfast' },
      { name: 'Aspirin 81mg Gastro-resistant', dosage: 'Once Daily (QD)', instructions: 'Take after lunch' },
    ],
    labTests: [
      { name: 'Cardiac Troponin I Test', category: 'Cardiac & ECG', specimen: 'Plasma', instructions: 'STAT Emergency' },
    ],
    signatureHash: 'SHA256: 9a88b10c44fd99a221ce30194bc00',
  },
];

// Initial Seed Lab Orders
const INITIAL_LAB_ORDERS: LabOrderRecord[] = [
  {
    id: 'lo-101',
    rxNumber: 'RX-2026-9901',
    patientName: 'Sai Satyabrata',
    mrn: 'MC-1001',
    doctorName: 'Dr. Devendra Roy, M.D.',
    department: 'Cardiology',
    testName: 'Lipid Profile Panel',
    category: 'Metabolic & Hormonal',
    specimen: 'Serum',
    fastingRequirement: '12-Hour Fasting Required',
    date: 'Jul 21, 2026',
    timestamp: new Date('2026-07-21').getTime(),
    status: 'REPORT_SUBMITTED',
    report: {
      findings: 'Total Cholesterol: 215 mg/dL, HDL: 46 mg/dL, LDL: 138 mg/dL, Triglycerides: 160 mg/dL',
      notes: 'Mild hyperlipidemia noted. Continue Statin therapy.',
      technicianName: 'Rajesh Lab Tech',
      submittedAt: '2026-07-21 04:30 PM',
      doctorName: 'Dr. Devendra Roy, M.D.',
    },
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

export const getClinicalRecords = (userEmail?: string): ClinicalRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CLINICAL_RECORDS);
    let records: ClinicalRecord[] = [];
    if (!stored) {
      records = INITIAL_CLINICAL_RECORDS;
      localStorage.setItem(STORAGE_KEYS.CLINICAL_RECORDS, JSON.stringify(INITIAL_CLINICAL_RECORDS));
    } else {
      records = JSON.parse(stored);
    }

    if (!userEmail) return records;

    const cleanEmail = userEmail.trim().toLowerCase();
    const isSeedUser = cleanEmail.includes('sai_satyabrata') || cleanEmail.includes('test_admin') || cleanEmail.includes('patient@medflow.com');

    return records.filter((r) => {
      if (isSeedUser && r.patientName.toLowerCase().includes('satyabrata')) return true;
      if (cleanEmail && r.patientName.toLowerCase().includes(cleanEmail.split('@')[0])) return true;
      return false;
    });
  } catch {
    return [];
  }
};

export const saveClinicalRecord = (record: ClinicalRecord) => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CLINICAL_RECORDS) : null;
  const existing: ClinicalRecord[] = raw ? JSON.parse(raw) : INITIAL_CLINICAL_RECORDS;
  const updated = [record, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CLINICAL_RECORDS, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow-clinical-records-updated'));
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

export const getLabOrders = (userEmail?: string): LabOrderRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAB_ORDERS);
    let orders: LabOrderRecord[] = [];
    if (!stored) {
      orders = INITIAL_LAB_ORDERS;
      localStorage.setItem(STORAGE_KEYS.LAB_ORDERS, JSON.stringify(INITIAL_LAB_ORDERS));
    } else {
      orders = JSON.parse(stored);
    }

    if (!userEmail) return orders;

    const cleanEmail = userEmail.trim().toLowerCase();
    const isSeedUser = cleanEmail.includes('sai_satyabrata') || cleanEmail.includes('test_admin') || cleanEmail.includes('patient@medflow.com');

    return orders.filter((o) => {
      if (isSeedUser && o.patientName.toLowerCase().includes('satyabrata')) return true;
      if (cleanEmail && o.patientName.toLowerCase().includes(cleanEmail.split('@')[0])) return true;
      return false;
    });
  } catch {
    return [];
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
