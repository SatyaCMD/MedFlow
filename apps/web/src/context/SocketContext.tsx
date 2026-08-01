'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_NAMESPACES } from '@medicore360/shared';

interface SocketContextValue {
  trackingSocket: Socket | null;
  queueSocket: Socket | null;
  notificationsSocket: Socket | null;
  chatSocket: Socket | null;
  hospitalStatusSocket: Socket | null;
  emergencySocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  trackingSocket: null,
  queueSocket: null,
  notificationsSocket: null,
  chatSocket: null,
  hospitalStatusSocket: null,
  emergencySocket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [sockets, setSockets] = useState<SocketContextValue>({
    trackingSocket: null,
    queueSocket: null,
    notificationsSocket: null,
    chatSocket: null,
    hospitalStatusSocket: null,
    emergencySocket: null,
    isConnected: false,
  });

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || 'demo-jwt-token' : '';

    const opts = {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    };

    const trackingSocket = io(`${backendUrl}${SOCKET_NAMESPACES.TRACKING}`, opts);
    const queueSocket = io(`${backendUrl}${SOCKET_NAMESPACES.QUEUE}`, opts);
    const notificationsSocket = io(`${backendUrl}${SOCKET_NAMESPACES.NOTIFICATIONS}`, opts);
    const chatSocket = io(`${backendUrl}${SOCKET_NAMESPACES.CHAT}`, opts);
    const hospitalStatusSocket = io(`${backendUrl}${SOCKET_NAMESPACES.HOSPITAL_STATUS}`, opts);
    const emergencySocket = io(`${backendUrl}${SOCKET_NAMESPACES.EMERGENCY}`, opts);

    trackingSocket.on('connect', () => {
      setSockets((prev) => ({ ...prev, isConnected: true }));
    });

    setSockets({
      trackingSocket,
      queueSocket,
      notificationsSocket,
      chatSocket,
      hospitalStatusSocket,
      emergencySocket,
      isConnected: true,
    });

    return () => {
      trackingSocket.disconnect();
      queueSocket.disconnect();
      notificationsSocket.disconnect();
      chatSocket.disconnect();
      hospitalStatusSocket.disconnect();
      emergencySocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={sockets}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
