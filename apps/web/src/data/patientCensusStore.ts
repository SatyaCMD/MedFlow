'use client';

export interface CareTransferRecord {
  id: string;
  fromStaff: string;
  toStaff: string;
  staffRole: 'DOCTOR' | 'NURSE' | 'LAB_TECH';
  reasonType: 'DOCTOR_ON_LEAVE' | 'CRITICAL_CASE_ESCALATION' | 'SPECIALIST_CONSULTATION' | 'NURSE_CARE_HANDOFF' | 'LAB_TECH_ASSIGNMENT';
  notes: string;
  timestamp: string;
}

export interface PatientCensusRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  condition: string;
  status: 'admitted' | 'outpatient' | 'discharged';
  doctorName: string;
  nurseName: string;
  labTechName: string;
  ward: string;
  roomNo: string;
  transferHistory: CareTransferRecord[];
}

export interface BloodTransfusionRequest {
  id: string;
  patientName: string;
  mrn: string;
  bloodGroup: string;
  units: number;
  priority: 'CRITICAL_STAT' | 'URGENT' | 'ELECTIVE';
  requestedBy: string;
  doctorName: string;
  doctorStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  doctorApprovedAt?: string;
  bloodBankAdminStatus: 'PENDING' | 'DISPATCHED' | 'REJECTED';
  bloodBankDispatchedAt?: string;
  dispatchCode?: string;
  timestamp: string;
}

const CENSUS_STORAGE_KEY = 'medicore_patient_census_v2';
const BLOOD_REQUESTS_KEY = 'medicore_blood_requests_v2';

const DEFAULT_PATIENTS: PatientCensusRecord[] = [
  {
    id: 'p-1',
    mrn: 'MC-1001',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O-Negative',
    condition: 'Hypertension & Cardiac Risk Profiling',
    status: 'admitted',
    doctorName: 'Dr. House',
    nurseName: 'Nurse Clara Barton',
    labTechName: 'Lab Tech David Miller',
    ward: 'ICU Ward A',
    roomNo: 'Bed 102',
    transferHistory: [],
  },
  {
    id: 'p-2',
    mrn: 'MC-1002',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A-Positive',
    condition: 'Asthma Severity II with Bronchospasm',
    status: 'outpatient',
    doctorName: 'Dr. Watson',
    nurseName: 'Nurse Florence Nightingale',
    labTechName: 'Lab Tech Sarah Jenkins',
    ward: 'Pulmonology OPD',
    roomNo: 'Room 204',
    transferHistory: [],
  },
  {
    id: 'p-3',
    mrn: 'MC-1003',
    name: 'Robert Lee',
    age: 58,
    gender: 'Male',
    bloodGroup: 'B-Positive',
    condition: 'Post-Op Knee Replacement Recovery',
    status: 'discharged',
    doctorName: 'Dr. Strange',
    nurseName: 'Nurse Clara Barton',
    labTechName: 'Lab Tech David Miller',
    ward: 'Orthopedics Ward',
    roomNo: 'Room 312',
    transferHistory: [],
  },
  {
    id: 'p-4',
    mrn: 'MC-1004',
    name: 'Emily Davis',
    age: 27,
    gender: 'Female',
    bloodGroup: 'AB-Negative',
    condition: 'Type 1 Diabetes Mellitus with Ketoacidosis',
    status: 'admitted',
    doctorName: 'Dr. House',
    nurseName: 'Nurse Florence Nightingale',
    labTechName: 'Lab Tech Sarah Jenkins',
    ward: 'Endocrinology Ward',
    roomNo: 'Bed 408',
    transferHistory: [],
  },
  {
    id: 'p-5',
    mrn: 'MC-1005',
    name: 'Michael Brown',
    age: 64,
    gender: 'Male',
    bloodGroup: 'O-Positive',
    condition: 'Coronary Artery Stent & Angioplasty',
    status: 'admitted',
    doctorName: 'Dr. Watson',
    nurseName: 'Nurse Clara Barton',
    labTechName: 'Lab Tech David Miller',
    ward: 'Cardiology CCU',
    roomNo: 'Bed 106',
    transferHistory: [],
  },
  {
    id: 'p-6',
    mrn: 'MC-1006',
    name: 'Sarah Connor',
    age: 39,
    gender: 'Female',
    bloodGroup: 'O-Negative',
    condition: 'Refractory Cardiac Arrhythmia',
    status: 'admitted',
    doctorName: 'Dr. Strange',
    nurseName: 'Nurse Florence Nightingale',
    labTechName: 'Lab Tech Sarah Jenkins',
    ward: 'ICU Ward B',
    roomNo: 'Bed 109',
    transferHistory: [],
  },
];

const DEFAULT_BLOOD_REQUESTS: BloodTransfusionRequest[] = [
  {
    id: 'BR-9901',
    patientName: 'John Doe',
    mrn: 'MC-1001',
    bloodGroup: 'O-Negative',
    units: 2,
    priority: 'CRITICAL_STAT',
    requestedBy: 'Nurse Clara Barton',
    doctorName: 'Dr. House',
    doctorStatus: 'APPROVED',
    doctorApprovedAt: '31 Jul 2026, 06:30 AM',
    bloodBankAdminStatus: 'DISPATCHED',
    bloodBankDispatchedAt: '31 Jul 2026, 07:15 AM',
    dispatchCode: 'BBD-O-NEG-8821',
    timestamp: '31 Jul 2026, 06:15 AM',
  },
  {
    id: 'BR-9902',
    patientName: 'Emily Davis',
    mrn: 'MC-1004',
    bloodGroup: 'AB-Negative',
    units: 1,
    priority: 'URGENT',
    requestedBy: 'Nurse Florence Nightingale',
    doctorName: 'Dr. House',
    doctorStatus: 'APPROVED',
    doctorApprovedAt: '31 Jul 2026, 07:10 AM',
    bloodBankAdminStatus: 'PENDING',
    timestamp: '31 Jul 2026, 06:50 AM',
  },
  {
    id: 'BR-9903',
    patientName: 'Sarah Connor',
    mrn: 'MC-1006',
    bloodGroup: 'O-Negative',
    units: 2,
    priority: 'CRITICAL_STAT',
    requestedBy: 'Patient Sarah Connor',
    doctorName: 'Dr. Strange',
    doctorStatus: 'PENDING',
    bloodBankAdminStatus: 'PENDING',
    timestamp: '31 Jul 2026, 07:30 AM',
  },
];

// Helper to get census
export function getPatientCensus(): PatientCensusRecord[] {
  if (typeof window === 'undefined') return DEFAULT_PATIENTS;
  try {
    const raw = localStorage.getItem(CENSUS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CENSUS_STORAGE_KEY, JSON.stringify(DEFAULT_PATIENTS));
      return DEFAULT_PATIENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PATIENTS;
  }
}

// Helper to save census
export function savePatientCensus(records: PatientCensusRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CENSUS_STORAGE_KEY, JSON.stringify(records));
}

// Transfer Patient Care / Handoff Staff
export function transferPatientCare(
  patientId: string,
  targetStaffName: string,
  staffRole: 'DOCTOR' | 'NURSE' | 'LAB_TECH',
  reasonType: 'DOCTOR_ON_LEAVE' | 'CRITICAL_CASE_ESCALATION' | 'SPECIALIST_CONSULTATION' | 'NURSE_CARE_HANDOFF' | 'LAB_TECH_ASSIGNMENT',
  notes: string
): PatientCensusRecord | null {
  const current = getPatientCensus();
  let updatedPatient: PatientCensusRecord | null = null;

  const nextRecords = current.map((pat) => {
    if (pat.id === patientId || pat.mrn === patientId) {
      let fromStaff = pat.doctorName;
      if (staffRole === 'NURSE') fromStaff = pat.nurseName;
      if (staffRole === 'LAB_TECH') fromStaff = pat.labTechName;

      const newTransfer: CareTransferRecord = {
        id: `tr-${Date.now()}`,
        fromStaff,
        toStaff: targetStaffName,
        staffRole,
        reasonType,
        notes,
        timestamp: new Date().toLocaleString(),
      };

      const updated = {
        ...pat,
        doctorName: staffRole === 'DOCTOR' ? targetStaffName : pat.doctorName,
        nurseName: staffRole === 'NURSE' ? targetStaffName : pat.nurseName,
        labTechName: staffRole === 'LAB_TECH' ? targetStaffName : pat.labTechName,
        transferHistory: [newTransfer, ...pat.transferHistory],
      };
      updatedPatient = updated;
      return updated;
    }
    return pat;
  });

  savePatientCensus(nextRecords);
  return updatedPatient;
}

// Blood Request Helper
export function getBloodRequests(): BloodTransfusionRequest[] {
  if (typeof window === 'undefined') return DEFAULT_BLOOD_REQUESTS;
  try {
    const raw = localStorage.getItem(BLOOD_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(BLOOD_REQUESTS_KEY, JSON.stringify(DEFAULT_BLOOD_REQUESTS));
      return DEFAULT_BLOOD_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BLOOD_REQUESTS;
  }
}

export function saveBloodRequests(list: BloodTransfusionRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLOOD_REQUESTS_KEY, JSON.stringify(list));
}

// Approve Blood Request by Doctor
export function doctorApproveBloodRequest(requestId: string, doctorName: string): BloodTransfusionRequest[] {
  const list = getBloodRequests();
  const updated = list.map((req) => {
    if (req.id === requestId) {
      return {
        ...req,
        doctorName,
        doctorStatus: 'APPROVED' as const,
        doctorApprovedAt: new Date().toLocaleString(),
      };
    }
    return req;
  });
  saveBloodRequests(updated);
  return updated;
}

// Dispatch Blood Request by Blood Bank Admin
export function bloodBankDispatchBloodRequest(requestId: string): BloodTransfusionRequest[] {
  const list = getBloodRequests();
  const updated = list.map((req) => {
    if (req.id === requestId) {
      return {
        ...req,
        bloodBankAdminStatus: 'DISPATCHED' as const,
        bloodBankDispatchedAt: new Date().toLocaleString(),
        dispatchCode: `BBD-${req.bloodGroup.replace(/[^A-Z]/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }
    return req;
  });
  saveBloodRequests(updated);
  return updated;
}

// Create New Blood Request
export function createBloodRequest(reqData: Partial<BloodTransfusionRequest>): BloodTransfusionRequest[] {
  const list = getBloodRequests();
  const newReq: BloodTransfusionRequest = {
    id: `BR-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: reqData.patientName || 'Patient',
    mrn: reqData.mrn || 'MC-1001',
    bloodGroup: reqData.bloodGroup || 'O-Negative',
    units: reqData.units || 1,
    priority: reqData.priority || 'URGENT',
    requestedBy: reqData.requestedBy || 'Attending Physician',
    doctorName: reqData.doctorName || 'Dr. House',
    doctorStatus: 'PENDING',
    bloodBankAdminStatus: 'PENDING',
    timestamp: new Date().toLocaleString(),
  };
  const updated = [newReq, ...list];
  saveBloodRequests(updated);
  return updated;
}
