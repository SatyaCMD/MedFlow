/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EnterpriseModule {
  id: number;
  name: string;
  category: string;
  status: 'ACTIVE_TELEMETRY' | 'AI_OPERATIONAL' | 'DEPLOYED';
  description: string;
  subModules: string[];
}

export const ENTERPRISE_44_MODULES_CATALOG: EnterpriseModule[] = [
  // 1. Core Administrative & HR
  { id: 1, name: 'Core Administrative Departments', category: 'Admin & Operations', status: 'ACTIVE_TELEMETRY', description: 'Multi-hospital branch telemetry, role permissions, and system config.', subModules: ['Hospital Dashboard', 'Super Admin', 'Multi Hospital Management', 'Branch Management', 'User Management', 'RBAC Permissions', 'Audit & Activity Logs'] },
  { id: 2, name: 'Patient Management & EMR', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'Registration, EMR timeline, chronic disease profiles, and consent forms.', subModules: ['Patient Registration', 'Medical History', 'Family History', 'Allergies', 'Chronic Diseases', 'Patient Timeline', 'Digital Signatures', 'Insurance Details'] },
  { id: 3, name: 'Appointment Management', category: 'Scheduling', status: 'ACTIVE_TELEMETRY', description: 'Online booking, queue management, token engine, and doctor availability.', subModules: ['Doctor Appointment', 'Walk-in Registration', 'Online Booking', 'Token Management', 'Queue Control', 'Rescheduling', 'Follow-up Reminders'] },

  // 4 to 8. Clinical Departments
  { id: 4, name: 'OPD (Outpatient Department)', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'OPD registration, consultation notes, diagnosis, and prescription studio.', subModules: ['OPD Registration', 'Consultation', 'Clinical Notes', 'Diagnosis', 'Prescription Studio', 'Procedure Recording', 'OPD Billing'] },
  { id: 5, name: 'IPD (Inpatient Department)', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'Admission, bed allocation, ward transfer, nursing notes, and vitals sync.', subModules: ['Admission', 'Bed Allocation', 'Ward Transfer', 'Nursing Notes', 'Vital Monitoring', 'Medication Administration', 'Discharge Summary'] },
  { id: 6, name: 'Emergency Department (ER)', category: 'Emergency & Critical', status: 'ACTIVE_TELEMETRY', description: 'Triage management, trauma care, ambulance arrival, and emergency procedures.', subModules: ['Emergency Registration', 'Trauma Management', 'Triage Protocol', 'Critical Care', 'Ambulance Arrival', 'Emergency Procedures'] },
  { id: 7, name: 'ICU Management', category: 'Emergency & Critical', status: 'ACTIVE_TELEMETRY', description: 'Ventilator telemetry, critical observation, nurse charting, and ICU dashboard.', subModules: ['ICU Admission', 'Ventilator Monitoring', 'Critical Observation', 'Nurse Charting', 'ICU Dashboard'] },
  { id: 8, name: 'Operation Theatre (OT)', category: 'Surgical Care', status: 'ACTIVE_TELEMETRY', description: 'Surgery scheduling, pre-op checklist, surgical team logs, and post-op care.', subModules: ['Surgery Scheduling', 'Pre-op Checklist', 'Surgical Team Logs', 'Operation Notes', 'Instrument Tracking', 'OT Billing'] },

  // 9 to 10. Diagnostics
  { id: 9, name: 'Laboratory Information System (LIS)', category: 'Diagnostics', status: 'ACTIVE_TELEMETRY', description: 'Sample collection, barcode generation, result entry, and pathologist verification.', subModules: ['Lab Orders', 'Sample Collection', 'Barcode Generation', 'Test Processing', 'Pathologist Verification', 'Digital Reports'] },
  { id: 10, name: 'Radiology Information System (RIS)', category: 'Diagnostics', status: 'ACTIVE_TELEMETRY', description: 'X-Ray, CT, MRI, Ultrasound, PET, DICOM PACS integration, and radiologist reports.', subModules: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'PACS Integration', 'Radiologist Reports'] },

  // 11 to 15. Pharmacy, Blood Bank & Wards
  { id: 11, name: 'Pharmacy & Digital E-Store', category: 'Pharmacy & Supplies', status: 'ACTIVE_TELEMETRY', description: 'Medicine inventory, digital health devices, drug interaction alerts, and billing.', subModules: ['Medicine Inventory', 'Digital Devices & Mobility Aids', 'Prescription Dispensing', 'Drug Interaction Alerts', 'Expiry Tracking', 'Pharmacy Billing'] },
  { id: 12, name: 'Blood Bank Management', category: 'Pharmacy & Supplies', status: 'ACTIVE_TELEMETRY', description: 'Donor registration, blood collection, component separation, and request dispatch.', subModules: ['Donor Registration', 'Blood Testing', 'Blood Storage', 'Blood Components', 'Blood Request & Issue', 'Inventory Tracker'] },
  { id: 13, name: 'Nursing Management', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'Duty assignment, pre-consultation vitals check, shift notes, and care plans.', subModules: ['Nurse Dashboard', 'Duty Assignment', 'Medication Chart', 'Pre-Consult Vitals', 'Nursing Assessment'] },
  { id: 14, name: 'Ward Management', category: 'Facility & Wards', status: 'ACTIVE_TELEMETRY', description: 'Ward creation, room allocation, bed matrix, cleaning status, and maintenance.', subModules: ['Ward Creation', 'Room Allocation', 'Bed Matrix', 'Occupancy Dashboard', 'Cleaning Status'] },
  { id: 15, name: 'Bed Management', category: 'Facility & Wards', status: 'ACTIVE_TELEMETRY', description: 'Bed availability, reservation, transfer, isolation beds, and occupancy analytics.', subModules: ['Bed Availability', 'Bed Reservation', 'Bed Transfer', 'Isolation Beds', 'ICU Bed Matrix'] },

  // 16 to 20. Finance, HR & Procurement
  { id: 16, name: 'Billing & Finance (₹ INR)', category: 'Finance & Insurance', status: 'ACTIVE_TELEMETRY', description: 'OPD/IPD/Pharmacy billing, GST invoices, advance payments, and financial reports.', subModules: ['OPD/IPD Billing', 'Pharmacy Billing', 'Laboratory Billing', 'Discount & Refund', 'GST Invoice Engine', 'Financial Reports'] },
  { id: 17, name: 'Insurance & TPA Management', category: 'Finance & Insurance', status: 'ACTIVE_TELEMETRY', description: 'Policy verification, cashless approvals, claim tracking, and TPA settlement.', subModules: ['Insurance Companies', 'Policy Verification', 'Cashless Approval', 'Claims Tracking', 'TPA Settlement'] },
  { id: 18, name: 'Inventory & Supply Management', category: 'Pharmacy & Supplies', status: 'ACTIVE_TELEMETRY', description: 'Medical supplies, surgical items, purchase orders, vendor management, and low stock.', subModules: ['Inventory Dashboard', 'Medical Supplies', 'Surgical Items', 'Vendor Management', 'Low Stock Alerts'] },
  { id: 19, name: 'Procurement System', category: 'Pharmacy & Supplies', status: 'ACTIVE_TELEMETRY', description: 'Purchase requests, goods receipt, invoice verification, and procurement reports.', subModules: ['Purchase Requests', 'Purchase Orders', 'Goods Receipt', 'Invoice Verification', 'Procurement Reports'] },
  { id: 20, name: 'Human Resource (HR) Management', category: 'Admin & Operations', status: 'ACTIVE_TELEMETRY', description: 'Employee directory, designations, salary payroll, attendance, and performance.', subModules: ['Employees', 'Departments', 'Designations', 'Salary & Payroll', 'Attendance', 'Performance'] },

  // 21 to 26. Clinical Support & Telemedicine
  { id: 21, name: 'Doctor Management', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'Profiles, qualifications, schedules, consultation fees, and reviews.', subModules: ['Doctor Profiles', 'Qualifications', 'Schedules', 'Consultation Fees (₹)', 'Availability'] },
  { id: 22, name: 'Nursing Station Hub', category: 'Clinical & Patient', status: 'ACTIVE_TELEMETRY', description: 'Ward dashboard, assigned patients, vitals recording, and shift reports.', subModules: ['Ward Dashboard', 'Assigned Patients', 'Vitals Telemetry', 'Shift Reports'] },
  { id: 23, name: 'Telemedicine & Video Consult', category: 'Telemedicine & EMR', status: 'ACTIVE_TELEMETRY', description: 'Video consultation room, audio/chat consult, and digital prescription issuance.', subModules: ['Video Consultation', 'Audio Consult', 'Chat Consult', 'Digital Prescription Sync'] },
  { id: 24, name: 'Electronic Medical Record (EMR)', category: 'Telemedicine & EMR', status: 'ACTIVE_TELEMETRY', description: 'Medical history, diagnosis, treatments, prescriptions, lab and radiology reports.', subModules: ['Medical History', 'Diagnosis Logs', 'Prescriptions Vault', 'Lab & Imaging Reports'] },
  { id: 25, name: 'Electronic Health Record (EHR)', category: 'Telemedicine & EMR', status: 'ACTIVE_TELEMETRY', description: 'Lifetime health record, cross-hospital history, and longitudinal records.', subModules: ['Long-term Record', 'Cross-Hospital History', 'Lifetime Health Archive'] },
  { id: 26, name: 'Clinical Decision Support System (CDSS)', category: 'AI & Clinical AI', status: 'AI_OPERATIONAL', description: 'Drug interaction alerts, allergy warnings, and AI diagnosis suggestions.', subModules: ['Drug Interaction Alerts', 'Allergy Warnings', 'AI Diagnosis Suggestions', 'Treatment Recs'] },

  // 27 to 33. Facility, Transport & Support
  { id: 27, name: 'Infection Control & COVID Tracking', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Infection case logging, isolation tracking, COVID monitoring, and antibiotic stewardship.', subModules: ['Infection Cases', 'Isolation Tracking', 'COVID Tracking', 'Antibiotic Monitoring'] },
  { id: 28, name: 'Ambulance & Live GPS Tracking', category: 'Emergency & Transport', status: 'ACTIVE_TELEMETRY', description: 'Swiggy/Blinkit-style real-time GPS tracking, ALS ICU units, driver card, and ETA.', subModules: ['Live GPS Tracking', 'Driver Card', 'ALS ICU Ambulance', 'ETA Countdown', 'Emergency Dispatch'] },
  { id: 29, name: 'Diet & Nutrition Management', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Dietician dashboard, personalized diet plans, meal schedules, and nutritional assessment.', subModules: ['Dietician Dashboard', 'Diet Plans', 'Meal Schedule', 'Nutritional Assessment'] },
  { id: 30, name: 'Housekeeping & Maintenance', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Room cleaning, bed sanitization, maintenance requests, and laundry logs.', subModules: ['Room Cleaning', 'Bed Sanitization', 'Maintenance Requests', 'Laundry Logs'] },
  { id: 31, name: 'Biomedical Equipment Management', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Equipment inventory, calibration logs, preventive maintenance, and service history.', subModules: ['Equipment Inventory', 'Calibration Logs', 'Maintenance', 'Service History'] },
  { id: 32, name: 'CSSD Sterilization Center', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Autoclave management, instrument tracking, sterilization logs, and sterile inventory.', subModules: ['Sterilization', 'Instrument Tracking', 'Autoclave Management', 'Sterile Stock'] },
  { id: 33, name: 'Mortuary Management', category: 'Facility & Support', status: 'ACTIVE_TELEMETRY', description: 'Body registration, cold storage allocation, documentation, and release logs.', subModules: ['Body Registration', 'Storage Allocation', 'Release Documentation'] },

  // 34 to 37. AI, Marketing & Analytics
  { id: 34, name: 'Marketing & Patient CRM', category: 'CRM & Analytics', status: 'ACTIVE_TELEMETRY', description: 'Patient feedback, health campaigns, loyalty rewards, and satisfaction scores.', subModules: ['Patient Feedback', 'Campaigns', 'Loyalty Programs', 'Notifications'] },
  { id: 35, name: 'Communication Center', category: 'CRM & Analytics', status: 'ACTIVE_TELEMETRY', description: 'Email, SMS, WhatsApp Business API, push notifications, OTP engine, and announcements.', subModules: ['Email SMTP', 'SMS Gateway', 'WhatsApp Business API', 'Push Notifications', 'OTP Engine'] },
  { id: 36, name: 'Reports & Executive Analytics', category: 'CRM & Analytics', status: 'ACTIVE_TELEMETRY', description: 'Revenue analytics, doctor performance, patient statistics, and disease trends.', subModules: ['Revenue Reports', 'Doctor Performance', 'Patient Statistics', 'Bed Occupancy Analytics'] },
  { id: 37, name: 'AI Medical Intelligence Engine', category: 'AI & Clinical AI', status: 'AI_OPERATIONAL', description: 'AI assistant, symptom checker, report summarizer, and bed prediction engine.', subModules: ['AI Assistant', 'AI Symptom Checker', 'AI Report Summarizer', 'AI Bed Prediction', 'AI Risk Score'] },

  // 38 to 44. Security, Integrations & Portals
  { id: 38, name: 'Security & HIPAA Compliance', category: 'Security & Integrations', status: 'ACTIVE_TELEMETRY', description: 'RBAC, Argon2id auth, 2FA, JWT session control, audit logs, and HIPAA compliance.', subModules: ['RBAC Scope', 'MFA / 2FA', 'Audit Logs', 'AES-256 Encryption', 'HIPAA/GDPR Compliance'] },
  { id: 39, name: 'System Integrations Architecture', category: 'Security & Integrations', status: 'ACTIVE_TELEMETRY', description: 'Payment gateways, PACS DICOM, HL7/FHIR APIs, barcode, and biometric devices.', subModules: ['Payment Gateways', 'PACS / DICOM', 'HL7 & FHIR APIs', 'Barcode Scanners', 'Biometric Devices'] },
  { id: 40, name: 'Patient Mobile Portal', category: 'Role Portals', status: 'ACTIVE_TELEMETRY', description: 'Patient portal for appointments, EMR reports, Rx downloads, and payments.', subModules: ['Appointment Booking', 'Reports & Rx', 'Payments (₹)', 'Telemedicine', 'Medical History'] },
  { id: 41, name: 'Doctor Clinical Portal', category: 'Role Portals', status: 'ACTIVE_TELEMETRY', description: 'Physician workstation for schedule, EMR, prescribing studio, and video consults.', subModules: ['Daily Schedule', 'Patient List', 'Prescribing Studio', 'Lab & Imaging Orders'] },
  { id: 42, name: 'Nurse Station Portal', category: 'Role Portals', status: 'ACTIVE_TELEMETRY', description: 'Nurse workstation for assigned ward beds, vitals check, and supply ordering.', subModules: ['Assigned Patients', 'Pre-Consult Vitals', 'Supply Ordering', 'Shift Handover'] },
  { id: 43, name: 'Reception & Registration Portal', category: 'Role Portals', status: 'ACTIVE_TELEMETRY', description: 'Reception desk for patient registration, appointment check-in, and billing.', subModules: ['Registration Desk', 'Check-in Queue', 'Billing Counter', 'Token Dispenser'] },
  { id: 44, name: 'Admin Enterprise Portal', category: 'Role Portals', status: 'ACTIVE_TELEMETRY', description: 'Hospital control center for multi-branch monitoring, HR, and financial analytics.', subModules: ['Control Center', 'Financial Analytics', 'HR Telemetry', 'System Monitoring'] },
];
