'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Role, Permission, ROLE_PERMISSIONS } from '@medicore360/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  hospitalId: string;
  mrn?: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
}

export function getResolvedPatientProfile(user: User | null) {
  const rawName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email ? user.email.split('@')[0] : 'Sai Satyabrata';
  const displayName = user?.role === 'DOCTOR' && !rawName.toLowerCase().startsWith('dr') ? `Dr. ${rawName}` : rawName;
  return {
    displayName,
    email: user?.email || 'patient@medflow.com',
    mrn: user?.mrn || 'MC-1001',
    age: user?.age || '19 Yrs',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'O+',
    phone: user?.phone || '+91 98765 43210',
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, userData: User) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const hasAuth = !!api.defaults.headers.common['Authorization'];
    if (!hasAuth) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (accessToken: string, userData: User) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with local logout cleanup even if session was already invalid
    } finally {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Preserve appointment store, medical history, and KYC completion history across logins
        const dataBackup: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('medflow_') || key.startsWith('medicore_'))) {
            const val = localStorage.getItem(key);
            if (val) dataBackup[key] = val;
          }
        }
        localStorage.clear();
        Object.entries(dataBackup).forEach(([k, v]) => localStorage.setItem(k, v));
        window.location.href = '/login';
      }
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const { hasPermission } = useAuth();
  return { hasPermission };
};
