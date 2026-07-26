'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  ArrowRightLeft,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Clock,
  Activity
} from 'lucide-react';
import { BloodBankModal } from '../shared/BloodBankModal';
import { useToast } from '../../context/ToastContext';

interface BloodStock {
  group: string;
  units: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  shelfLifeDays: number;
}

export const BloodBankDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfusions' | 'donors'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');

  const [stocks, setStocks] = useState<BloodStock[]>([
    { group: 'A+', units: 28, status: 'OPTIMAL', shelfLifeDays: 35 },
    { group: 'A-', units: 6, status: 'CRITICAL', shelfLifeDays: 22 },
    { group: 'B+', units: 34, status: 'OPTIMAL', shelfLifeDays: 40 },
    { group: 'B-', units: 9, status: 'MODERATE', shelfLifeDays: 18 },
    { group: 'AB+', units: 15, status: 'OPTIMAL', shelfLifeDays: 29 },
    { group: 'AB-', units: 4, status: 'CRITICAL', shelfLifeDays: 14 },
    { group: 'O+', units: 48, status: 'OPTIMAL', shelfLifeDays: 42 },
    { group: 'O-', units: 12, status: 'MODERATE', shelfLifeDays: 25 },
  ]);

  const transfusions = [
    { id: 'TR-9041', patient: 'Rohan Sharma', bloodGroup: 'O+', units: 2, doctor: 'Dr. Anup Singh', priority: 'URGENT', status: 'DISPACHED', time: '10 mins ago' },
    { id: 'TR-9042', patient: 'Meena Verma', bloodGroup: 'A-', units: 1, doctor: 'Dr. Devendra Roy', priority: 'CRITICAL', status: 'CROSS_MATCHING', time: '25 mins ago' },
    { id: 'TR-9043', patient: 'Vikram Malhotra', bloodGroup: 'B+', units: 3, doctor: 'Dr. Priya Sharma', priority: 'ROUTINE', status: 'PENDING', time: '1 hour ago' },
    { id: 'TR-9044', patient: 'Sunita Rao', bloodGroup: 'AB+', units: 1, doctor: 'Dr. Siddharth Joshi', priority: 'ROUTINE', status: 'RESERVED', time: '2 hours ago' },
  ];

  const donors = [
    { id: 'DN-301', name: 'Amitabh Sen', group: 'O+', contact: '+91 98765-43210', lastDonated: '2026-07-20', status: 'ELIGIBLE' },
    { id: 'DN-302', name: 'Kavita Reddy', group: 'A-', contact: '+91 91234-56789', lastDonated: '2026-06-15', status: 'ELIGIBLE' },
    { id: 'DN-303', name: 'Suresh Menon', group: 'B+', contact: '+91 99887-76655', lastDonated: '2026-07-26', status: 'DONATED_TODAY' },
    { id: 'DN-304', name: 'Pooja Hegde', group: 'O-', contact: '+91 94433-22110', lastDonated: '2026-05-10', status: 'ELIGIBLE' },
  ];

  const handleAddUnit = (group: string) => {
    setStocks(prev =>
      prev.map(s => s.group === group ? { ...s, units: s.units + 1, status: s.units + 1 > 10 ? 'OPTIMAL' : 'MODERATE' } : s)
    );
    showToast({ title: 'Reserve Stock Updated', message: `Added +1 Unit to ${group} Blood Reserve Stock`, type: 'success' });
  };

  const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
  const criticalGroups = stocks.filter(s => s.status === 'CRITICAL').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Droplets className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-200 text-xs font-bold">
              <Activity className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Blood Bank & Transfusion Control Center
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Blood Reserve Management</h1>
            <p className="text-xs md:text-sm text-red-100/80 font-medium max-w-2xl">
              Real-time monitoring of blood inventories, donor exchange requests, cross-matching validation, and emergency donor mobilization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-2xl shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Rapid Donor Exchange
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reserve Units</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalUnits}</span>
            <span className="text-xs text-emerald-600 font-bold">Units in Vault</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Ready for emergency dispatch</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Low Groups</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{criticalGroups}</span>
            <span className="text-xs text-amber-600 font-bold">Groups &lt; 10 Units</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Requires donor mobilization (A-, AB-)</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Transfusions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{transfusions.length}</span>
            <span className="text-xs text-blue-600 font-bold">Active Orders</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Cross-matching & dispatch active</p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Donors Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">14</span>
            <span className="text-xs text-emerald-600 font-bold">+4 vs yesterday</span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold">Screened and verified donors</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Blood Reserves
            </button>
            <button
              onClick={() => setActiveTab('transfusions')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'transfusions'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transfusion Orders ({transfusions.length})
            </button>
            <button
              onClick={() => setActiveTab('donors')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                activeTab === 'donors'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donor Registry ({donors.length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blood group, donor, or patient..."
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        {/* Tab 1: Live Blood Reserves Grid */}
        {activeTab === 'inventory' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stocks
                .filter((s) => !searchTerm || s.group.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((stock) => (
                  <motion.div
                    key={stock.group}
                    whileHover={{ scale: 1.02 }}
                    className="p-5 bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl relative overflow-hidden space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-lg shadow-2xs">
                        {stock.group}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          stock.status === 'OPTIMAL'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : stock.status === 'MODERATE'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                        }`}
                      >
                        {stock.status}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{stock.units}</span>
                        <span className="text-xs font-bold text-slate-500">units</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Avg shelf life: {stock.shelfLifeDays} days
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleAddUnit(stock.group)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Plus className="w-3 h-3" /> Add Unit
                      </button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Exchange
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Transfusion Orders */}
        {activeTab === 'transfusions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Group Required</th>
                  <th className="pb-3">Units</th>
                  <th className="pb-3">Prescribing Physician</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {transfusions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-3 font-bold text-slate-900">{t.patient}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-md">
                        {t.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 font-bold">{t.units} Unit(s)</td>
                    <td className="py-3">{t.doctor}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          t.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : t.priority === 'URGENT'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Donor Registry */}
        {activeTab === 'donors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="pb-3">Donor ID</th>
                  <th className="pb-3">Full Name</th>
                  <th className="pb-3">Blood Group</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Last Donation Date</th>
                  <th className="pb-3">Eligibility Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {donors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{d.id}</td>
                    <td className="py-3 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-md">
                        {d.group}
                      </span>
                    </td>
                    <td className="py-3">{d.contact}</td>
                    <td className="py-3">{d.lastDonated}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <BloodBankModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
