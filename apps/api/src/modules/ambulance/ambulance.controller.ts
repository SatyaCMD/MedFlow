/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AmbulanceService } from './ambulance.service.js';

export class AmbulanceController {
  // GET /api/v1/ambulance - List all ambulances
  static async getAllAmbulances(req: Request, res: Response): Promise<void> {
    try {
      const { status, isAvailable } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

      const ambulances = await AmbulanceService.getAllAmbulances(filter);
      res.status(200).json({ success: true, count: ambulances.length, data: ambulances });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance - Register new ambulance
  static async createAmbulance(req: Request, res: Response): Promise<void> {
    try {
      const { vehiclePlate, unitType, model, equipment } = req.body;
      const ambulance = await AmbulanceService.createAmbulance({ vehiclePlate, unitType, model, equipment });
      res.status(201).json({ success: true, message: 'Ambulance vehicle registered', data: ambulance });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/ambulance/drivers - List all drivers
  static async getAllDrivers(_req: Request, res: Response): Promise<void> {
    try {
      const drivers = await AmbulanceService.getAllDrivers();
      res.status(200).json({ success: true, count: drivers.length, data: drivers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/drivers - Create driver
  static async createDriver(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, licenseNumber, phone, certifications } = req.body;
      const driver = await AmbulanceService.createDriver({ fullName, licenseNumber, phone, certifications });
      res.status(201).json({ success: true, message: 'Driver registered successfully', data: driver });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/assign-driver - Assign driver to vehicle
  static async assignDriver(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId, driverId } = req.body;
      const result = await AmbulanceService.assignDriverToVehicle(ambulanceId, driverId);
      res.status(200).json({ success: true, message: 'Driver assigned to vehicle', data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/dispatch - Request emergency dispatch
  static async dispatchEmergency(req: Request, res: Response): Promise<void> {
    try {
      const { patientName, patientPhone, pickupAddress, coordinates, severity, requiredUnitType, notes } = req.body;
      const result = await AmbulanceService.dispatchEmergencyAmbulance({
        patientName,
        patientPhone,
        pickupAddress,
        coordinates: coordinates || [77.209, 28.6139],
        severity,
        requiredUnitType,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Emergency Ambulance Dispatched successfully!',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // PATCH /api/v1/ambulance/trip/:tripId/status - Update milestone stage
  static async updateTripStatus(req: Request, res: Response): Promise<void> {
    try {
      const { tripId } = req.params;
      const { status } = req.body;
      const updated = await AmbulanceService.updateTripStatus(tripId, status);
      res.status(200).json({ success: true, message: `Trip status updated to ${status}`, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/gps - Log live GPS telemetry
  static async logGps(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId, tripId, lng, lat, speed, heading } = req.body;
      const log = await AmbulanceService.logGpsLocation({ ambulanceId, tripId, lng, lat, speed, heading });
      res.status(200).json({ success: true, message: 'GPS Telemetry recorded', data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/ambulance/trips/active - Get all active emergency trips
  static async getActiveTrips(_req: Request, res: Response): Promise<void> {
    try {
      const trips = await AmbulanceService.getActiveTrips();
      res.status(200).json({ success: true, count: trips.length, data: trips });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/maintenance - Log vehicle maintenance
  static async createMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId, description, cost, mechanicNotes } = req.body;
      const record = await AmbulanceService.createMaintenanceRecord({ ambulanceId, description, cost, mechanicNotes });
      res.status(201).json({ success: true, message: 'Maintenance record created', data: record });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/ambulance/maintenance - List maintenance records
  static async getMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId } = req.query;
      const records = await AmbulanceService.getMaintenanceRecords(ambulanceId as string);
      res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/ambulance/fuel - Log fuel fill-up
  static async createFuelLog(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId, liters, cost, odometerKm } = req.body;
      const log = await AmbulanceService.createFuelLog({ ambulanceId, liters, cost, odometerKm });
      res.status(201).json({ success: true, message: 'Fuel log recorded', data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/ambulance/fuel - List fuel logs
  static async getFuelLogs(req: Request, res: Response): Promise<void> {
    try {
      const { ambulanceId } = req.query;
      const logs = await AmbulanceService.getFuelLogs(ambulanceId as string);
      res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
