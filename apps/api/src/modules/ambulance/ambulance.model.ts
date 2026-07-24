import mongoose, { Schema, Document } from 'mongoose';

// 1. Ambulance Status & Unit Types
export type AmbulanceStatus =
  | 'Available'
  | 'Assigned'
  | 'On Route to Patient'
  | 'Arrived at Patient'
  | 'Patient On Board'
  | 'On Route to Hospital'
  | 'Reached Hospital'
  | 'Maintenance'
  | 'Out of Service';

export type AmbulanceUnitType = 'ALS' | 'BLS' | 'NEONATAL' | 'CARDIAC_CRITICAL';

export interface IAmbulance extends Document {
  vehiclePlate: string;
  unitType: AmbulanceUnitType;
  vehicleModel: string;
  status: AmbulanceStatus;
  equipment: string[];
  assignedDriverId?: mongoose.Types.ObjectId;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  currentSpeed: number; // km/h
  heading: number; // degrees 0-360
  lastLocationUpdate: Date;
  isAvailable: boolean;
  hospitalUnitId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AmbulanceSchema = new Schema<IAmbulance>(
  {
    vehiclePlate: { type: String, required: true, unique: true, index: true },
    unitType: { type: String, required: true, enum: ['ALS', 'BLS', 'NEONATAL', 'CARDIAC_CRITICAL'], default: 'ALS' },
    vehicleModel: { type: String, required: true, default: 'Force Traveler ALS ICU' },
    status: {
      type: String,
      required: true,
      enum: [
        'Available',
        'Assigned',
        'On Route to Patient',
        'Arrived at Patient',
        'Patient On Board',
        'On Route to Hospital',
        'Reached Hospital',
        'Maintenance',
        'Out of Service',
      ],
      default: 'Available',
      index: true,
    },
    equipment: [{ type: String }],
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true, default: [77.209, 28.6139] },
    },
    currentSpeed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    lastLocationUpdate: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true, index: true },
    hospitalUnitId: { type: String, default: 'MediCore Main ER Base' },
  },
  { timestamps: true }
);

AmbulanceSchema.index({ currentLocation: '2dsphere' });

export const AmbulanceModel = mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);

// 2. Driver Schema
export interface IDriver extends Document {
  fullName: string;
  licenseNumber: string;
  phone: string;
  certifications: string[];
  rating: number;
  status: 'Available' | 'On Duty' | 'Off Duty' | 'On Trip';
  assignedAmbulanceId?: mongoose.Types.ObjectId;
  totalTripsCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    fullName: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    certifications: [{ type: String }],
    rating: { type: Number, default: 4.9 },
    status: { type: String, enum: ['Available', 'On Duty', 'Off Duty', 'On Trip'], default: 'Available', index: true },
    assignedAmbulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance' },
    totalTripsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DriverModel = mongoose.model<IDriver>('Driver', DriverSchema);

// 3. Emergency Dispatch Request Schema
export interface IEmergencyRequest extends Document {
  patientName: string;
  patientPhone: string;
  pickupAddress: string;
  pickupLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  severity: 'CRITICAL' | 'URGENT' | 'STABLE';
  requiredUnitType: AmbulanceUnitType;
  assignedAmbulanceId?: mongoose.Types.ObjectId;
  assignedDriverId?: mongoose.Types.ObjectId;
  status:
    | 'PENDING'
    | 'DISPATCHED'
    | 'EN_ROUTE_PATIENT'
    | 'ARRIVED_PATIENT'
    | 'PATIENT_ON_BOARD'
    | 'EN_ROUTE_HOSPITAL'
    | 'REACHED_HOSPITAL'
    | 'CANCELLED';
  dispatchedAt?: Date;
  arrivedAtPatientAt?: Date;
  patientBoardedAt?: Date;
  reachedHospitalAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    pickupLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    severity: { type: String, enum: ['CRITICAL', 'URGENT', 'STABLE'], default: 'CRITICAL' },
    requiredUnitType: { type: String, enum: ['ALS', 'BLS', 'NEONATAL', 'CARDIAC_CRITICAL'], default: 'ALS' },
    assignedAmbulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance' },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    status: {
      type: String,
      enum: [
        'PENDING',
        'DISPATCHED',
        'EN_ROUTE_PATIENT',
        'ARRIVED_PATIENT',
        'PATIENT_ON_BOARD',
        'EN_ROUTE_HOSPITAL',
        'REACHED_HOSPITAL',
        'CANCELLED',
      ],
      default: 'PENDING',
      index: true,
    },
    dispatchedAt: { type: Date },
    arrivedAtPatientAt: { type: Date },
    patientBoardedAt: { type: Date },
    reachedHospitalAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

EmergencyRequestSchema.index({ pickupLocation: '2dsphere' });

export const EmergencyRequestModel = mongoose.model<IEmergencyRequest>('EmergencyRequest', EmergencyRequestSchema);

// 4. Location History Schema
export interface ILocationHistory extends Document {
  ambulanceId: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId;
  coordinates: [number, number];
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: Date;
}

const LocationHistorySchema = new Schema<ILocationHistory>(
  {
    ambulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance', required: true, index: true },
    tripId: { type: Schema.Types.ObjectId, ref: 'EmergencyRequest' },
    coordinates: { type: [Number], required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    accuracy: { type: Number, default: 5 },
    timestamp: { type: Date, default: Date.now, expires: '30d' },
  },
  { timestamps: false }
);

export const LocationHistoryModel = mongoose.model<ILocationHistory>('LocationHistory', LocationHistorySchema);

// 5. Maintenance Record Schema
export interface IMaintenanceRecord extends Document {
  ambulanceId: mongoose.Types.ObjectId;
  serviceDate: Date;
  description: string;
  cost: number;
  mechanicNotes?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    ambulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance', required: true, index: true },
    serviceDate: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    cost: { type: Number, required: true },
    mechanicNotes: { type: String },
    status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'], default: 'SCHEDULED' },
  },
  { timestamps: true }
);

export const MaintenanceRecordModel = mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);

// 6. Fuel Log Schema
export interface IFuelLog extends Document {
  ambulanceId: mongoose.Types.ObjectId;
  liters: number;
  cost: number;
  odometerKm: number;
  timestamp: Date;
}

const FuelLogSchema = new Schema<IFuelLog>(
  {
    ambulanceId: { type: Schema.Types.ObjectId, ref: 'Ambulance', required: true, index: true },
    liters: { type: Number, required: true },
    cost: { type: Number, required: true },
    odometerKm: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FuelLogModel = mongoose.model<IFuelLog>('FuelLog', FuelLogSchema);
