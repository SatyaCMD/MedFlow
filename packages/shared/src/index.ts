import { z } from 'zod';

// Roles Definition
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  AMBULANCE_ADMIN: 'AMBULANCE_ADMIN',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
  PHARMACIST: 'PHARMACIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  BLOOD_BANK: 'BLOOD_BANK',
  PATIENT: 'PATIENT',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permissions Definition
export const PERMISSIONS = {
  PATIENT_CREATE: 'patient:create',
  PATIENT_READ: 'patient:read',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',
  
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',
  
  EMR_CREATE: 'emr:create',
  EMR_READ: 'emr:read',
  EMR_UPDATE: 'emr:update',
  
  BILLING_CREATE: 'billing:create',
  BILLING_READ: 'billing:read',
  BILLING_REFUND: 'billing:refund',
  
  RBAC_MANAGE: 'rbac:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to Permissions Matrix Configuration
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.HOSPITAL_ADMIN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.BILLING_READ,
  ],
  [ROLES.AMBULANCE_ADMIN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.EMR_CREATE,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.EMR_UPDATE,
  ],
  [ROLES.NURSE]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_CREATE,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.RECEPTIONIST]: [
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_READ,
  ],
  [ROLES.PHARMACIST]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.LAB_TECHNICIAN]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.BLOOD_BANK]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.EMR_READ,
  ],
  [ROLES.PATIENT]: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.EMR_READ,
    PERMISSIONS.BILLING_READ,
  ],
};

// API Standard Response Envelopes
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Patient Registration Validation Schema
export const PatientRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dob: z.string().datetime({ message: 'Invalid ISO date string for date of birth' }),
  gender: z.enum(['male', 'female', 'other']),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  consentSigned: z.boolean().refine((val) => val === true, {
    message: 'Patient consent must be accepted',
  }),
});

export type PatientRegistrationInput = z.infer<typeof PatientRegistrationSchema>;

// ==========================================
// REAL-TIME EVENT TAXONOMY & SOCKET EVENTS
// ==========================================

export const SOCKET_NAMESPACES = {
  TRACKING: '/tracking',
  QUEUE: '/queue',
  NOTIFICATIONS: '/notifications',
  CHAT: '/chat',
  HOSPITAL_STATUS: '/hospital-status',
  EMERGENCY: '/emergency',
} as const;

export const SOCKET_EVENTS = {
  // Ambulance Tracking
  AMBULANCE_LOCATION_UPDATED: 'ambulance.location.updated',
  AMBULANCE_STATUS_CHANGED: 'ambulance.status.changed',
  AMBULANCE_GEOFENCE_ALERT: 'ambulance.geofence.alert',

  // OPD Appointment Queue
  QUEUE_TOKEN_UPDATED: 'queue.token.updated',
  QUEUE_NEXT_PATIENT: 'queue.next.patient',
  QUEUE_DELAY_ALERT: 'queue.delay.alert',
  QUEUE_PRIORITY_OVERRIDE: 'queue.priority.override',

  // Live Notifications
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_READ: 'notification.read',

  // ICU / Bed Availability
  BED_STATUS_UPDATED: 'bed.status.updated',

  // Blood Bank Inventory
  BLOOD_STOCK_UPDATED: 'blood.stock.updated',
  BLOOD_ALERT_CRITICAL: 'blood.alert.critical',

  // Doctor Presence & Status
  DOCTOR_STATUS_CHANGED: 'doctor.status.changed',

  // Dashboard Live Metrics
  METRICS_UPDATED: 'metrics.updated',

  // Live Chat
  CHAT_MESSAGE_SENT: 'chat.message.sent',
  CHAT_TYPING_STATUS: 'chat.typing.status',
  CHAT_SEEN_RECEIPT: 'chat.seen.receipt',
  CHAT_PRESENCE_UPDATED: 'chat.presence.updated',

  // Operation Theatre Status
  OT_STATUS_UPDATED: 'ot.status.updated',

  // Pharmacy Inventory
  PHARMACY_STOCK_UPDATED: 'pharmacy.stock.updated',

  // Lab Status
  LAB_STATUS_UPDATED: 'lab.status.updated',

  // Emergency Panic System
  EMERGENCY_ALERT_BROADCAST: 'emergency.alert.broadcast',
} as const;

// ==========================================
// KAFKA TOPICS DEFINITION
// ==========================================

export const KAFKA_TOPICS = {
  PATIENT_EVENTS: 'patient-events',
  APPOINTMENT_EVENTS: 'appointment-events',
  BILLING_EVENTS: 'billing-events',
  AMBULANCE_EVENTS: 'ambulance-events',
  DOCTOR_EVENTS: 'doctor-events',
  INVENTORY_EVENTS: 'inventory-events',
  NOTIFICATION_EVENTS: 'notification-events',
  LAB_EVENTS: 'lab-events',
  ANALYTICS_EVENTS: 'analytics-events',
} as const;

// ==========================================
// RABBITMQ QUEUES & EXCHANGES
// ==========================================

export const RABBITMQ_EXCHANGES = {
  DIRECT: 'medflow.direct',
  TOPIC: 'medflow.topic',
  FANOUT: 'medflow.fanout',
  DEAD_LETTER: 'medflow.dlx',
} as const;

export const RABBITMQ_QUEUES = {
  EMAIL_NOTIFICATIONS: 'email.notifications',
  SMS_NOTIFICATIONS: 'sms.notifications',
  PUSH_NOTIFICATIONS: 'push.notifications',
  AUDIT_LOGS: 'audit.logs',
  ACCOUNTING_PROCESS: 'accounting.process',
  ANALYTICS_SYNC: 'analytics.sync',
  DLQ: 'dlq.medflow',
  RETRY: 'retry.medflow',
  EMERGENCY_PRIORITY: 'priority.emergency',
} as const;

// ==========================================
// FEATURE FLAGS
// ==========================================

export const FEATURE_FLAGS = {
  ENABLE_LIVE_CHAT: 'ENABLE_LIVE_CHAT',
  ENABLE_AMBULANCE_TRACKING: 'ENABLE_AMBULANCE_TRACKING',
  ENABLE_EMERGENCY_PANIC: 'ENABLE_EMERGENCY_PANIC',
  ENABLE_KAFKA_STREAMING: 'ENABLE_KAFKA_STREAMING',
  ENABLE_REALTIME_METRICS: 'ENABLE_REALTIME_METRICS',
} as const;

// ==========================================
// STANDARDIZED EVENT ENVELOPE (OUTBOX & BUS)
// ==========================================

export interface EventTraceContext {
  correlationId: string;
  traceId?: string;
  spanId?: string;
}

export interface EventEnvelope<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  eventVersion: string;
  timestamp: string;
  producer: string;
  hospitalId: string;
  traceContext: EventTraceContext;
  data: T;
}

// ==========================================
// DOMAIN DATA TYPES & PAYLOADS
// ==========================================

export interface AmbulanceLocationPayload {
  ambulanceId: string;
  licensePlate: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  headingDegree: number;
  status: 'AVAILABLE' | 'BUSY' | 'EMERGENCY' | 'MAINTENANCE';
  etaMinutes?: number;
  destinationFacility?: string;
  timestamp: string;
}

export interface QueueTokenPayload {
  appointmentId: string;
  tokenId: string;
  queueNumber: number;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'EMERGENCY_PRIORITY';
  estimatedWaitMinutes: number;
  timestamp: string;
}

export interface BedAvailabilityPayload {
  bedId: string;
  bedNumber: string;
  wardName: string;
  department: string;
  status: 'OCCUPIED' | 'VACANT' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE';
  patientId?: string;
  patientName?: string;
  updatedBy: string;
  timestamp: string;
}

export interface BloodStockPayload {
  bloodBankId: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsAvailable: number;
  status: 'NORMAL' | 'LOW' | 'CRITICAL' | 'EXPIRED_WARNING';
  timestamp: string;
}

export interface DoctorPresencePayload {
  doctorId: string;
  doctorName: string;
  department: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'CONSULTING' | 'EMERGENCY' | 'LUNCH' | 'LEAVE';
  roomNumber?: string;
  timestamp: string;
}

export interface EmergencyAlertPayload {
  alertId: string;
  code: 'CODE_BLUE' | 'FIRE' | 'CARDIAC_EMERGENCY' | 'TRAUMA' | 'MASS_CASUALTY';
  location: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  triggeredBy: string;
  triggeredByName: string;
  timestamp: string;
}

export interface LiveChatMessagePayload {
  messageId: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  recipientId: string;
  recipientRole: Role;
  content: string;
  attachments?: { fileName: string; fileUrl: string; fileType: string }[];
  status: 'SENT' | 'DELIVERED' | 'READ';
  timestamp: string;
}

export interface LiveHospitalMetricsPayload {
  hospitalId: string;
  totalPatients: number;
  todayAppointments: number;
  todayRevenue: number;
  emergencyCases: number;
  availableBeds: number;
  onlineDoctors: number;
  totalBloodUnits: number;
  activeAmbulances: number;
  timestamp: string;
}

