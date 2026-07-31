'use client';

export interface BillingLineItem {
  id: string;
  description: string;
  category: 'CONSULTATION' | 'PHARMACY' | 'LAB_TEST' | 'ROOM_STAY' | 'NURSING_CARE' | 'SURGICAL';
  qty: number;
  unitPrice: number;
  amount: number;
  tpaCovered: boolean;
}

export interface PatientInvoice {
  id: string;
  invoiceCode: string;
  date: string;
  timestamp: number;
  patientName: string;
  mrn: string;
  email?: string;
  phone?: string;
  department: string;
  attendingDoctor: string;
  lineItems: BillingLineItem[];
  subtotal: number;
  gstRatePercent: number; // 5%
  gstAmount: number;
  totalAmount: number;
  tpaInsuranceName?: string;
  tpaApprovedAmount: number;
  netPatientPayable: number;
  tpaStatus: 'TPA Cashless Pre-Approved' | 'Direct Patient Payment' | 'Star Health TPA Claim Pending' | 'HDFC ERGO TPA Settled' | 'Max Bupa Claim Processing';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  paymentMethod: string;
}

export interface NurseSupplyInvoice {
  id: string;
  invoiceNo: string;
  purchaseDate: string;
  timestamp: number;
  supplierName: string;
  itemName: string;
  category: 'IV_FLUIDS' | 'SYRINGES' | 'GLOVES' | 'BANDAGES' | 'DRESSING_KITS' | 'OXYGEN_EQUIPMENT';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  gstAmount: number;
  allocatedWard: string;
  purchasedByNurse: string;
  paymentStatus: 'PAID' | 'PENDING_APPROVAL';
}

export interface LabEquipmentInvoice {
  id: string;
  invoiceNo: string;
  purchaseDate: string;
  timestamp: number;
  vendorName: string;
  equipmentName: string;
  modelNumber: string;
  serialNumber: string;
  category: 'ANALYZER' | 'CENTRIFUGE' | 'THERMAL_CYCLER' | 'MICROSCOPE' | 'REAGENT_KIT';
  cost: number;
  gstAmount: number;
  totalCost: number;
  warrantyPeriod: string;
  purchasedByTech: string;
  maintenanceStatus: 'CALIBRATED & OPERATIONAL' | 'SCHEDULED FOR SERVICING' | 'NEWLY INSTALLED';
}

const STORAGE_KEYS = {
  PATIENT_INVOICES: 'medflow_patient_invoices',
  NURSE_SUPPLY_INVOICES: 'medflow_nurse_supply_invoices',
  LAB_EQUIPMENT_INVOICES: 'medflow_lab_equipment_invoices',
};

const INITIAL_PATIENT_INVOICES: PatientInvoice[] = [
  {
    id: 'inv-101',
    invoiceCode: 'INV-2026-9901',
    date: '2026-07-28',
    timestamp: new Date('2026-07-28').getTime(),
    patientName: 'Sarah Connor',
    mrn: 'MC-1001',
    email: 'sarah.connor@example.com',
    phone: '+91 98765 43210',
    department: 'IPD Cardiology Ward',
    attendingDoctor: 'Dr. Anup Singh',
    lineItems: [
      { id: 'li-1', description: 'Interventional Cardiology Consultation & OPD', category: 'CONSULTATION', qty: 1, unitPrice: 2500, amount: 2500, tpaCovered: true },
      { id: 'li-2', description: 'Coronary Angiography Procedure & Cath Lab', category: 'SURGICAL', qty: 1, unitPrice: 28000, amount: 28000, tpaCovered: true },
      { id: 'li-3', description: 'IPD Cardiac ICU Bed Stay (2 Days @ ₹4,500/day)', category: 'ROOM_STAY', qty: 2, unitPrice: 4500, amount: 9000, tpaCovered: true },
      { id: 'li-4', description: 'Continuous Cardiac Telemetry & ICU Nursing Care', category: 'NURSING_CARE', qty: 2, unitPrice: 1200, amount: 2400, tpaCovered: true },
      { id: 'li-5', description: 'Cardiovascular Dispensary Prescriptions (Amlodipine, Atorvastatin)', category: 'PHARMACY', qty: 1, unitPrice: 1900, amount: 1900, tpaCovered: false },
    ],
    subtotal: 43800,
    gstRatePercent: 5,
    gstAmount: 2190,
    totalAmount: 45990,
    tpaInsuranceName: 'Star Health Allied Insurance (Policy #SH-884920)',
    tpaApprovedAmount: 43800,
    netPatientPayable: 2190,
    tpaStatus: 'TPA Cashless Pre-Approved',
    paymentStatus: 'PAID',
    paymentMethod: 'Cashless TPA + UPI',
  },
  {
    id: 'inv-102',
    invoiceCode: 'INV-2026-9902',
    date: '2026-07-27',
    timestamp: new Date('2026-07-27').getTime(),
    patientName: 'John Doe',
    mrn: 'MC-1002',
    email: 'john.doe@example.com',
    phone: '+91 98123 45678',
    department: 'OPD Neurology',
    attendingDoctor: 'Dr. Siddharth Joshi',
    lineItems: [
      { id: 'li-6', description: 'Neurological OPD Consultation Fee', category: 'CONSULTATION', qty: 1, unitPrice: 1500, amount: 1500, tpaCovered: false },
      { id: 'li-7', description: 'Brain MRI (1.5 Tesla Scan) & Radiographic Audit', category: 'LAB_TEST', qty: 1, unitPrice: 6500, amount: 6500, tpaCovered: false },
      { id: 'li-8', description: 'Neuro-protective Prescriptions & Supplements', category: 'PHARMACY', qty: 1, unitPrice: 850, amount: 850, tpaCovered: false },
    ],
    subtotal: 8850,
    gstRatePercent: 5,
    gstAmount: 442.5,
    totalAmount: 9292.5,
    tpaStatus: 'Direct Patient Payment',
    tpaApprovedAmount: 0,
    netPatientPayable: 9292.5,
    paymentStatus: 'PAID',
    paymentMethod: 'Credit Card (Visa ending in 4092)',
  },
  {
    id: 'inv-103',
    invoiceCode: 'INV-2026-9903',
    date: '2026-07-26',
    timestamp: new Date('2026-07-26').getTime(),
    patientName: 'Bruce Wayne',
    mrn: 'MC-1003',
    email: 'bruce.wayne@example.com',
    phone: '+91 99887 76655',
    department: 'Emergency & Orthopedics',
    attendingDoctor: 'Dr. Rajesh Patel',
    lineItems: [
      { id: 'li-9', description: 'Emergency Triage & Orthopedic OPD', category: 'CONSULTATION', qty: 1, unitPrice: 2000, amount: 2000, tpaCovered: true },
      { id: 'li-10', description: 'Joint Reconstruction & Splinting Consumables', category: 'SURGICAL', qty: 1, unitPrice: 8500, amount: 8500, tpaCovered: true },
      { id: 'li-11', description: 'Digital X-Ray Extremities (Right Knee & Ankle)', category: 'LAB_TEST', qty: 2, unitPrice: 950, amount: 1900, tpaCovered: true },
    ],
    subtotal: 12400,
    gstRatePercent: 5,
    gstAmount: 620,
    totalAmount: 13020,
    tpaInsuranceName: 'HDFC ERGO Health Insurance (Policy #HE-992014)',
    tpaApprovedAmount: 12400,
    netPatientPayable: 620,
    tpaStatus: 'Star Health TPA Claim Pending',
    paymentStatus: 'PENDING',
    paymentMethod: 'Star Health TPA Claim',
  },
  {
    id: 'inv-104',
    invoiceCode: 'INV-2026-9904',
    date: '2026-07-25',
    timestamp: new Date('2026-07-25').getTime(),
    patientName: 'Jane Patient',
    mrn: 'MC-1004',
    email: 'patient@medicore360.com',
    phone: '+91 97766 55443',
    department: 'General OPD Care',
    attendingDoctor: 'Dr. Priya Sharma',
    lineItems: [
      { id: 'li-12', description: 'General Wellness & Pediatric OPD Consultation', category: 'CONSULTATION', qty: 1, unitPrice: 1200, amount: 1200, tpaCovered: true },
      { id: 'li-13', description: 'Complete Blood Count (CBC) & Lipid Profile Test', category: 'LAB_TEST', qty: 1, unitPrice: 1400, amount: 1400, tpaCovered: true },
      { id: 'li-14', description: 'Multivitamin & Anti-inflammatory Dispensary Kit', category: 'PHARMACY', qty: 1, unitPrice: 650, amount: 650, tpaCovered: false },
    ],
    subtotal: 3250,
    gstRatePercent: 5,
    gstAmount: 162.5,
    totalAmount: 3412.5,
    tpaInsuranceName: 'Max Bupa Health Insurance (Policy #MB-551029)',
    tpaApprovedAmount: 2600,
    netPatientPayable: 812.5,
    tpaStatus: 'Max Bupa Claim Processing',
    paymentStatus: 'PAID',
    paymentMethod: 'Net Banking (HDFC Bank)',
  },
];

const INITIAL_NURSE_SUPPLY_INVOICES: NurseSupplyInvoice[] = [
  {
    id: 'ns-201',
    invoiceNo: 'SUP-2026-011',
    purchaseDate: '2026-07-29',
    timestamp: new Date('2026-07-29').getTime(),
    supplierName: 'MediSurge Hospital Supplies Ltd.',
    itemName: 'Sterile Syringes 5ml (Pack of 100)',
    category: 'SYRINGES',
    quantity: 15,
    unitPrice: 450,
    totalAmount: 6750,
    gstAmount: 337.5,
    allocatedWard: 'ICU Critical Care Ward',
    purchasedByNurse: 'Sunita Patel, ICU Chief Nurse',
    paymentStatus: 'PAID',
  },
  {
    id: 'ns-202',
    invoiceNo: 'SUP-2026-012',
    purchaseDate: '2026-07-28',
    timestamp: new Date('2026-07-28').getTime(),
    supplierName: 'Baxter Healthcare India',
    itemName: 'IV Normal Saline 0.9% 500ml (Box of 24)',
    category: 'IV_FLUIDS',
    quantity: 20,
    unitPrice: 650,
    totalAmount: 13000,
    gstAmount: 650,
    allocatedWard: 'Emergency Triage Ward',
    purchasedByNurse: 'Rohan Mukherjee, Lead Nurse',
    paymentStatus: 'PAID',
  },
  {
    id: 'ns-203',
    invoiceNo: 'SUP-2026-013',
    purchaseDate: '2026-07-26',
    timestamp: new Date('2026-07-26').getTime(),
    supplierName: 'Karam Latex Gloves Corp',
    itemName: 'Surgical Powder-Free Gloves (Box of 100)',
    category: 'GLOVES',
    quantity: 25,
    unitPrice: 850,
    totalAmount: 21250,
    gstAmount: 1062.5,
    allocatedWard: 'Post-Op Surgical Ward',
    purchasedByNurse: 'Priya Nambiar, Ward Nurse',
    paymentStatus: 'PAID',
  },
  {
    id: 'ns-204',
    invoiceNo: 'SUP-2026-014',
    purchaseDate: '2026-07-24',
    timestamp: new Date('2026-07-24').getTime(),
    supplierName: 'Steris Medical Dressings',
    itemName: 'Sterile Gauze Bandages & Wound Dressing Kits',
    category: 'DRESSING_KITS',
    quantity: 40,
    unitPrice: 320,
    totalAmount: 12800,
    gstAmount: 640,
    allocatedWard: 'Pediatric Ward',
    purchasedByNurse: 'Anita Sharma, Lead Caregiver',
    paymentStatus: 'PAID',
  },
];

const INITIAL_LAB_EQUIPMENT_INVOICES: LabEquipmentInvoice[] = [
  {
    id: 'le-301',
    invoiceNo: 'EQP-2026-801',
    purchaseDate: '2026-07-20',
    timestamp: new Date('2026-07-20').getTime(),
    vendorName: 'Sysmex India Diagnostic Instruments',
    equipmentName: 'Automated Hematology 5-Part Cell Counter',
    modelNumber: 'Sysmex XN-550',
    serialNumber: 'SN-XN550-9941',
    category: 'ANALYZER',
    cost: 450000,
    gstAmount: 22500,
    totalCost: 472500,
    warrantyPeriod: '3 Years AMC & Calibration',
    purchasedByTech: 'Rajesh Kumar, Chief Lab Tech',
    maintenanceStatus: 'CALIBRATED & OPERATIONAL',
  },
  {
    id: 'le-302',
    invoiceNo: 'EQP-2026-802',
    purchaseDate: '2026-07-15',
    timestamp: new Date('2026-07-15').getTime(),
    vendorName: 'Thermo Fisher Scientific',
    equipmentName: 'Refrigerated High-Speed Micro-Centrifuge',
    modelNumber: 'Thermo Fresco 21',
    serialNumber: 'SN-TF21-4402',
    category: 'CENTRIFUGE',
    cost: 185000,
    gstAmount: 9250,
    totalCost: 194250,
    warrantyPeriod: '2 Years Comprehensive',
    purchasedByTech: 'Aman Gupta, Pathology Tech',
    maintenanceStatus: 'CALIBRATED & OPERATIONAL',
  },
  {
    id: 'le-303',
    invoiceNo: 'EQP-2026-803',
    purchaseDate: '2026-07-10',
    timestamp: new Date('2026-07-10').getTime(),
    vendorName: 'Bio-Rad Laboratories',
    equipmentName: 'Real-Time Quantitative PCR Thermal Cycler',
    modelNumber: 'CFX96 Touch Real-Time System',
    serialNumber: 'SN-CFX96-1029',
    category: 'THERMAL_CYCLER',
    cost: 820000,
    gstAmount: 41000,
    totalCost: 861000,
    warrantyPeriod: '5 Years OEM Warranty',
    purchasedByTech: 'Ritu Deshmukh, Genomics Specialist',
    maintenanceStatus: 'NEWLY INSTALLED',
  },
  {
    id: 'le-304',
    invoiceNo: 'EQP-2026-804',
    purchaseDate: '2026-07-05',
    timestamp: new Date('2026-07-05').getTime(),
    vendorName: 'Roche Diagnostics India',
    equipmentName: 'Cobas Clinical Biochemistry Reagent Kit (5000 Tests)',
    modelNumber: 'Cobas c311 Kit',
    serialNumber: 'LOT-CB-2026-07',
    category: 'REAGENT_KIT',
    cost: 125000,
    gstAmount: 6250,
    totalCost: 131250,
    warrantyPeriod: 'Expiry: Dec 2027',
    purchasedByTech: 'Sunil Verma, Diagnostic Tech',
    maintenanceStatus: 'CALIBRATED & OPERATIONAL',
  },
];

// Helper Functions
export const getPatientInvoices = (): PatientInvoice[] => {
  if (typeof window === 'undefined') return INITIAL_PATIENT_INVOICES;
  const stored = localStorage.getItem(STORAGE_KEYS.PATIENT_INVOICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PATIENT_INVOICES, JSON.stringify(INITIAL_PATIENT_INVOICES));
    return INITIAL_PATIENT_INVOICES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PATIENT_INVOICES;
  }
};

export const savePatientInvoice = (invoice: PatientInvoice): PatientInvoice[] => {
  const existing = getPatientInvoices();
  const updated = [invoice, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PATIENT_INVOICES, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow-patient-invoices-updated'));
  }
  return updated;
};

export const getNurseSupplyInvoices = (): NurseSupplyInvoice[] => {
  if (typeof window === 'undefined') return INITIAL_NURSE_SUPPLY_INVOICES;
  const stored = localStorage.getItem(STORAGE_KEYS.NURSE_SUPPLY_INVOICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.NURSE_SUPPLY_INVOICES, JSON.stringify(INITIAL_NURSE_SUPPLY_INVOICES));
    return INITIAL_NURSE_SUPPLY_INVOICES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_NURSE_SUPPLY_INVOICES;
  }
};

export const saveNurseSupplyInvoice = (invoice: NurseSupplyInvoice): NurseSupplyInvoice[] => {
  const existing = getNurseSupplyInvoices();
  const updated = [invoice, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.NURSE_SUPPLY_INVOICES, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow-nurse-supply-invoices-updated'));
  }
  return updated;
};

export const getLabEquipmentInvoices = (): LabEquipmentInvoice[] => {
  if (typeof window === 'undefined') return INITIAL_LAB_EQUIPMENT_INVOICES;
  const stored = localStorage.getItem(STORAGE_KEYS.LAB_EQUIPMENT_INVOICES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.LAB_EQUIPMENT_INVOICES, JSON.stringify(INITIAL_LAB_EQUIPMENT_INVOICES));
    return INITIAL_LAB_EQUIPMENT_INVOICES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_LAB_EQUIPMENT_INVOICES;
  }
};

export const saveLabEquipmentInvoice = (invoice: LabEquipmentInvoice): LabEquipmentInvoice[] => {
  const existing = getLabEquipmentInvoices();
  const updated = [invoice, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LAB_EQUIPMENT_INVOICES, JSON.stringify(updated));
    window.dispatchEvent(new Event('medflow-lab-equipment-invoices-updated'));
  }
  return updated;
};
