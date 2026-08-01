'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  SOCKET_EVENTS,
  AmbulanceLocationPayload,
  QueueTokenPayload,
  LiveHospitalMetricsPayload,
  BedAvailabilityPayload,
  BloodStockPayload,
  EmergencyAlertPayload,
  LiveChatMessagePayload,
} from '@medicore360/shared';

// 1. Live Ambulance GPS Tracking Hook
export const useAmbulanceTracking = (ambulanceId?: string) => {
  const { trackingSocket } = useSocket();
  const [location, setLocation] = useState<AmbulanceLocationPayload | null>(null);

  useEffect(() => {
    if (!trackingSocket) return;

    if (ambulanceId) {
      trackingSocket.emit('join_ambulance_room', ambulanceId);
    }

    const handleUpdate = (data: AmbulanceLocationPayload) => {
      setLocation(data);
    };

    trackingSocket.on(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATED, handleUpdate);

    return () => {
      trackingSocket.off(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATED, handleUpdate);
    };
  }, [trackingSocket, ambulanceId]);

  return location;
};

// 2. Live Appointment OPD Queue Hook
export const useAppointmentQueue = (doctorId?: string) => {
  const { queueSocket } = useSocket();
  const [queueTokens, setQueueTokens] = useState<QueueTokenPayload[]>([]);

  useEffect(() => {
    if (!queueSocket) return;

    if (doctorId) {
      queueSocket.emit('join_doctor_opd', doctorId);
    }

    const handleTokenUpdate = (token: QueueTokenPayload) => {
      setQueueTokens((prev) => {
        const idx = prev.findIndex((t) => t.appointmentId === token.appointmentId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = token;
          return updated;
        }
        return [...prev, token];
      });
    };

    queueSocket.on(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, handleTokenUpdate);

    return () => {
      queueSocket.off(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, handleTokenUpdate);
    };
  }, [queueSocket, doctorId]);

  return queueTokens;
};

// 3. Live Hospital KPI Metrics Hook
export const useLiveHospitalMetrics = () => {
  const { hospitalStatusSocket } = useSocket();
  const [metrics, setMetrics] = useState<LiveHospitalMetricsPayload | null>(null);

  useEffect(() => {
    if (!hospitalStatusSocket) return;

    const handleMetrics = (data: LiveHospitalMetricsPayload) => {
      setMetrics(data);
    };

    hospitalStatusSocket.on(SOCKET_EVENTS.METRICS_UPDATED, handleMetrics);

    return () => {
      hospitalStatusSocket.off(SOCKET_EVENTS.METRICS_UPDATED, handleMetrics);
    };
  }, [hospitalStatusSocket]);

  return metrics;
};

// 4. Live ICU / Bed Availability Hook
export const useBedAvailability = () => {
  const { hospitalStatusSocket } = useSocket();
  const [bedUpdates, setBedUpdates] = useState<BedAvailabilityPayload[]>([]);

  useEffect(() => {
    if (!hospitalStatusSocket) return;

    const handleBed = (bed: BedAvailabilityPayload) => {
      setBedUpdates((prev) => [bed, ...prev.slice(0, 19)]);
    };

    hospitalStatusSocket.on(SOCKET_EVENTS.BED_STATUS_UPDATED, handleBed);

    return () => {
      hospitalStatusSocket.off(SOCKET_EVENTS.BED_STATUS_UPDATED, handleBed);
    };
  }, [hospitalStatusSocket]);

  return bedUpdates;
};

// 5. Emergency Code Blue Panic Alert Hook
export const useEmergencyAlerts = () => {
  const { emergencySocket } = useSocket();
  const [activeAlert, setActiveAlert] = useState<EmergencyAlertPayload | null>(null);

  useEffect(() => {
    if (!emergencySocket) return;

    const handleAlert = (alert: EmergencyAlertPayload) => {
      setActiveAlert(alert);
    };

    emergencySocket.on(SOCKET_EVENTS.EMERGENCY_ALERT_BROADCAST, handleAlert);

    return () => {
      emergencySocket.off(SOCKET_EVENTS.EMERGENCY_ALERT_BROADCAST, handleAlert);
    };
  }, [emergencySocket]);

  return { activeAlert, dismissAlert: () => setActiveAlert(null) };
};
