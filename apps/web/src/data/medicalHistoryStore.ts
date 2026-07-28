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
const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [];

// Initial Seed Lab Orders
const INITIAL_LAB_ORDERS: LabOrderRecord[] = [];

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
