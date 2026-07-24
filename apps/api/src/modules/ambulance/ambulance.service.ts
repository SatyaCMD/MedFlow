/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AmbulanceModel,
  DriverModel,
  EmergencyRequestModel,
  LocationHistoryModel,
  MaintenanceRecordModel,
  FuelLogModel,
  AmbulanceStatus,
  AmbulanceUnitType,
} from './ambulance.model.js';

export class AmbulanceService {
  // 1. Get All Ambulances
  static async getAllAmbulances(filter: any = {}) {
    return AmbulanceModel.find(filter).populate('assignedDriverId').sort({ updatedAt: -1 });
  }

  // 2. Register New Ambulance Vehicle
  static async createAmbulance(data: {
    vehiclePlate: string;
    unitType: AmbulanceUnitType;
    model: string;
    equipment?: string[];
  }) {
    const ambulance = new AmbulanceModel({
      vehiclePlate: data.vehiclePlate,
      unitType: data.unitType,
      vehicleModel: data.model || 'Force Traveler ALS ICU',
      equipment: data.equipment || ['Defibrillator', 'Ventilator', 'Oxygen Cylinder', 'Cardiac Monitor'],
      status: 'Available',
      isAvailable: true,
    });
    return ambulance.save();
  }

  // 3. Get All Drivers
  static async getAllDrivers(filter: any = {}) {
    return DriverModel.find(filter).populate('assignedAmbulanceId').sort({ fullName: 1 });
  }

  // 4. Register Driver
  static async createDriver(data: {
    fullName: string;
    licenseNumber: string;
    phone: string;
    certifications?: string[];
  }) {
    const driver = new DriverModel({
      fullName: data.fullName,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      certifications: data.certifications || ['BLS Certified', 'ALS Paramedic', 'Emergency Vehicle Driving'],
      status: 'Available',
    });
    return driver.save();
  }

  // 5. Assign Driver to Ambulance Vehicle
  static async assignDriverToVehicle(ambulanceId: string, driverId: string) {
    const ambulance = await AmbulanceModel.findById(ambulanceId);
    const driver = await DriverModel.findById(driverId);

    if (!ambulance || !driver) {
      throw new Error('Ambulance or Driver not found');
    }

    ambulance.assignedDriverId = driver._id as any;
    driver.assignedAmbulanceId = ambulance._id as any;

    await ambulance.save();
    await driver.save();

    return { ambulance, driver };
  }

  // 6. Emergency Dispatch: Auto-find Nearest Ambulance & Create Dispatch Request
  static async dispatchEmergencyAmbulance(payload: {
    patientName: string;
    patientPhone: string;
    pickupAddress: string;
    coordinates: [number, number]; // [lng, lat]
    severity?: 'CRITICAL' | 'URGENT' | 'STABLE';
    requiredUnitType?: AmbulanceUnitType;
    notes?: string;
  }) {
    const lng = payload.coordinates[0];
    const lat = payload.coordinates[1];

    // Find nearest available ambulance using 2dsphere $near query
    let nearestAmbulance = await AmbulanceModel.findOne({
      isAvailable: true,
      status: 'Available',
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 15000,
        },
      },
    }).populate('assignedDriverId');

    if (!nearestAmbulance) {
      nearestAmbulance = await AmbulanceModel.findOne({ isAvailable: true, status: 'Available' }).populate('assignedDriverId');
    }

    if (!nearestAmbulance) {
      throw new Error('No available ambulance units currently in service. Emergency Queue alert triggered.');
    }

    const request = new EmergencyRequestModel({
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      pickupAddress: payload.pickupAddress,
      pickupLocation: { type: 'Point', coordinates: [lng, lat] },
      severity: payload.severity || 'CRITICAL',
      requiredUnitType: payload.requiredUnitType || 'ALS',
      assignedAmbulanceId: nearestAmbulance._id,
      assignedDriverId: nearestAmbulance.assignedDriverId,
      status: 'DISPATCHED',
      dispatchedAt: new Date(),
      notes: payload.notes,
    });

    await request.save();

    nearestAmbulance.status = 'Assigned';
    nearestAmbulance.isAvailable = false;
    await nearestAmbulance.save();

    if (nearestAmbulance.assignedDriverId) {
      await DriverModel.findByIdAndUpdate(nearestAmbulance.assignedDriverId, { status: 'On Trip' });
    }

    return {
      request,
      assignedAmbulance: nearestAmbulance,
    };
  }

  // 7. Update Trip / Ambulance Milestone State Machine
  static async updateTripStatus(
    requestId: string,
    newStatus:
      | 'EN_ROUTE_PATIENT'
      | 'ARRIVED_PATIENT'
      | 'PATIENT_ON_BOARD'
      | 'EN_ROUTE_HOSPITAL'
      | 'REACHED_HOSPITAL'
      | 'CANCELLED'
  ) {
    const request = await EmergencyRequestModel.findById(requestId);
    if (!request) throw new Error('Emergency Request not found');

    request.status = newStatus;
    const now = new Date();

    let vehicleStatus: AmbulanceStatus = 'Assigned';

    if (newStatus === 'EN_ROUTE_PATIENT') {
      request.dispatchedAt = request.dispatchedAt || now;
      vehicleStatus = 'On Route to Patient';
    } else if (newStatus === 'ARRIVED_PATIENT') {
      request.arrivedAtPatientAt = now;
      vehicleStatus = 'Arrived at Patient';
    } else if (newStatus === 'PATIENT_ON_BOARD') {
      request.patientBoardedAt = now;
      vehicleStatus = 'Patient On Board';
    } else if (newStatus === 'EN_ROUTE_HOSPITAL') {
      vehicleStatus = 'On Route to Hospital';
    } else if (newStatus === 'REACHED_HOSPITAL') {
      request.reachedHospitalAt = now;
      vehicleStatus = 'Reached Hospital';
    }

    await request.save();

    if (request.assignedAmbulanceId) {
      const isTripOver = newStatus === 'REACHED_HOSPITAL' || newStatus === 'CANCELLED';
      await AmbulanceModel.findByIdAndUpdate(request.assignedAmbulanceId, {
        status: isTripOver ? 'Available' : vehicleStatus,
        isAvailable: isTripOver,
      });

      if (isTripOver && request.assignedDriverId) {
        await DriverModel.findByIdAndUpdate(request.assignedDriverId, {
          status: 'Available',
          $inc: { totalTripsCompleted: 1 },
        });
      }
    }

    return request;
  }

  // 8. Record Live Telemetry Breadcrumb Log
  static async logGpsLocation(data: {
    ambulanceId: string;
    tripId?: string;
    lng: number;
    lat: number;
    speed: number;
    heading: number;
  }) {
    await AmbulanceModel.findByIdAndUpdate(data.ambulanceId, {
      currentLocation: { type: 'Point', coordinates: [data.lng, data.lat] },
      currentSpeed: data.speed,
      heading: data.heading,
      lastLocationUpdate: new Date(),
    });

    const log = new LocationHistoryModel({
      ambulanceId: data.ambulanceId,
      tripId: data.tripId,
      coordinates: [data.lng, data.lat],
      speed: data.speed,
      heading: data.heading,
      timestamp: new Date(),
    });

    return log.save();
  }

  // 9. Maintenance Logging
  static async createMaintenanceRecord(data: {
    ambulanceId: string;
    description: string;
    cost: number;
    mechanicNotes?: string;
  }) {
    const record = new MaintenanceRecordModel({
      ambulanceId: data.ambulanceId,
      description: data.description,
      cost: data.cost,
      mechanicNotes: data.mechanicNotes,
      status: 'IN_PROGRESS',
    });

    await AmbulanceModel.findByIdAndUpdate(data.ambulanceId, {
      status: 'Maintenance',
      isAvailable: false,
    });

    return record.save();
  }

  // 10. Fuel Logging
  static async createFuelLog(data: {
    ambulanceId: string;
    liters: number;
    cost: number;
    odometerKm: number;
  }) {
    const log = new FuelLogModel(data);
    return log.save();
  }

  // 11. Maintenance & Fuel History
  static async getMaintenanceRecords(ambulanceId?: string) {
    const filter = ambulanceId ? { ambulanceId } : {};
    return MaintenanceRecordModel.find(filter).populate('ambulanceId').sort({ createdAt: -1 });
  }

  static async getFuelLogs(ambulanceId?: string) {
    const filter = ambulanceId ? { ambulanceId } : {};
    return FuelLogModel.find(filter).populate('ambulanceId').sort({ timestamp: -1 });
  }

  // 12. Active Emergency Trips List
  static async getActiveTrips() {
    return EmergencyRequestModel.find({
      status: { $in: ['PENDING', 'DISPATCHED', 'EN_ROUTE_PATIENT', 'ARRIVED_PATIENT', 'PATIENT_ON_BOARD', 'EN_ROUTE_HOSPITAL'] },
    })
      .populate('assignedAmbulanceId')
      .populate('assignedDriverId')
      .sort({ createdAt: -1 });
  }
}
