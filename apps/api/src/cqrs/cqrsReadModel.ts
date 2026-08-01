import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import {
  LiveHospitalMetricsPayload,
  BedAvailabilityPayload,
  BloodStockPayload,
  DoctorPresencePayload,
  AmbulanceLocationPayload,
} from '@medicore360/shared';

export class CQRSReadModel {
  // Hospital Live KPI Aggregates
  public static async getHospitalMetrics(hospitalId: string): Promise<LiveHospitalMetricsPayload> {
    try {
      const key = `cqrs:metrics:${hospitalId}`;
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // Default fallback state if cache miss
      const fallback: LiveHospitalMetricsPayload = {
        hospitalId,
        totalPatients: 1420,
        todayAppointments: 68,
        todayRevenue: 425000,
        emergencyCases: 4,
        availableBeds: 28,
        onlineDoctors: 14,
        totalBloodUnits: 154,
        activeAmbulances: 6,
        timestamp: new Date().toISOString(),
      };

      await redis.setex(key, 300, JSON.stringify(fallback));
      return fallback;
    } catch (err) {
      logger.error({ err, hospitalId }, 'CQRSReadModel: Error reading hospital metrics from Redis.');
      throw err;
    }
  }

  public static async updateHospitalMetrics(
    hospitalId: string,
    updates: Partial<LiveHospitalMetricsPayload>
  ): Promise<LiveHospitalMetricsPayload> {
    const current = await this.getHospitalMetrics(hospitalId);
    const updated: LiveHospitalMetricsPayload = {
      ...current,
      ...updates,
      timestamp: new Date().toISOString(),
    };

    const key = `cqrs:metrics:${hospitalId}`;
    await redis.setex(key, 300, JSON.stringify(updated));
    return updated;
  }

  // Bed Availability State Map
  public static async updateBedState(hospitalId: string, bed: BedAvailabilityPayload): Promise<void> {
    const key = `cqrs:beds:${hospitalId}:${bed.bedId}`;
    await redis.setex(key, 86400, JSON.stringify(bed));
  }

  // Blood Stock State Map
  public static async updateBloodStock(hospitalId: string, blood: BloodStockPayload): Promise<void> {
    const key = `cqrs:blood:${hospitalId}:${blood.bloodGroup}`;
    await redis.setex(key, 86400, JSON.stringify(blood));
  }

  // Doctor Presence State Map
  public static async updateDoctorPresence(hospitalId: string, presence: DoctorPresencePayload): Promise<void> {
    const key = `cqrs:doctor:${hospitalId}:${presence.doctorId}`;
    await redis.setex(key, 86400, JSON.stringify(presence));
  }

  // Active Ambulance Tracking Location
  public static async updateAmbulanceLocation(hospitalId: string, location: AmbulanceLocationPayload): Promise<void> {
    const key = `cqrs:ambulance:${hospitalId}:${location.ambulanceId}`;
    await redis.setex(key, 3600, JSON.stringify(location));
  }
}
