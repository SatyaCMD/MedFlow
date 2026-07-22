'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { Settings, Shield, Bell, Key, Database, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [hospitalName, setHospitalName] = useState('Central Memorial Hospital');
  const [tenantId, setTenantId] = useState('TENANT-8902-NY');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('15');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Hospital System Settings
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Configure multi-tenant isolation, security policies, and hospital workstation preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Hospital Identity Settings */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> Hospital Identity & Tenant Isolation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hospital Facility Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tenant UUID Domain Scope</label>
                <input
                  type="text"
                  value={tenantId}
                  disabled
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security & Authentication Policy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> OWASP Security & Session Policy
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-900">Require Multi-Factor Authentication (OTP)</span>
                  <span className="block text-[11px] font-medium text-slate-500">Enforce Mailpit/SMTP 6-digit PIN verification for clinical roles</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    mfaEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    mfaEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Session Inactivity Timeout (Minutes)</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 Minutes (HIPAA Standard)</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved Successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Changes take effect across all workstation sessions.</span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>

        </form>

      </div>
    </AppShell>
  );
}
