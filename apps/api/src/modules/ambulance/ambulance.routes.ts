import { Router } from 'express';
import { AmbulanceController } from './ambulance.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '@medicore360/shared';

const router = Router();

// Protect all ambulance routes with authentication
router.use(authenticate);

// Fleet Vehicles CRUD
router.get('/', AmbulanceController.getAllAmbulances);
router.post('/', authorize(PERMISSIONS.PATIENT_CREATE), AmbulanceController.createAmbulance);

// Drivers CRUD & Assignment
router.get('/drivers', AmbulanceController.getAllDrivers);
router.post('/drivers', authorize(PERMISSIONS.PATIENT_CREATE), AmbulanceController.createDriver);
router.post('/assign-driver', authorize(PERMISSIONS.PATIENT_UPDATE), AmbulanceController.assignDriver);

// Emergency Dispatch Request
router.post('/dispatch', AmbulanceController.dispatchEmergency);
router.patch('/trip/:tripId/status', AmbulanceController.updateTripStatus);
router.get('/trips/active', AmbulanceController.getActiveTrips);

// Live GPS Telemetry Logging
router.post('/gps', AmbulanceController.logGps);

// Maintenance & Fuel Telemetry Logs
router.get('/maintenance', AmbulanceController.getMaintenance);
router.post('/maintenance', authorize(PERMISSIONS.PATIENT_UPDATE), AmbulanceController.createMaintenance);
router.get('/fuel', AmbulanceController.getFuelLogs);
router.post('/fuel', authorize(PERMISSIONS.PATIENT_UPDATE), AmbulanceController.createFuelLog);

export default router;
