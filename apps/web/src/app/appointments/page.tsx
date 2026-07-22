'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Calendar, Plus, Clock, CheckCircle2 } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  department: string;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export default function AppointmentsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const mockAppointments: Appointment[] = [
    { id: '1', time: '09:00 AM', patient: 'John Doe', doctor: 'Dr. House', department: 'Cardiology', type: 'Follow-up Checkup', status: 'confirmed' },
    { id: '2', time: '10:30 AM', patient: 'Jane Smith', doctor: 'Dr. Watson', department: 'Pediatrics', type: 'Routine Consultation', status: 'pending' },
    { id: '3', time: '11:15 AM', patient: 'Robert Lee', doctor: 'Dr. Strange', department: 'Orthopedics', type: 'X-Ray Review', status: 'completed' },
    { id: '4', time: '02:00 PM', patient: 'Emily Davis', doctor: 'Dr. House', department: 'Endocrinology', type: 'Insulin Dosage Sync', status: 'confirmed' },
  ];

  const columns = [
    { header: 'Time Slot', accessor: (row: Appointment) => <span className="font-bold text-blue-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {row.time}</span> },
    { header: 'Patient Name', accessor: (row: Appointment) => <span className="font-bold text-slate-900">{row.patient}</span> },
    { header: 'Attending Doctor', accessor: (row: Appointment) => <span className="text-slate-800 font-semibold">{row.doctor}</span> },
    { header: 'Department', accessor: (row: Appointment) => <span className="text-slate-600 font-medium">{row.department}</span> },
    { header: 'Consultation Type', accessor: (row: Appointment) => <span className="text-slate-700 font-medium">{row.type}</span> },
    {
      header: 'Status',
      accessor: (row: Appointment) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            row.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Clinical Appointments Board
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Real-time scheduling matrix for outpatient visits and specialist consultations.
            </p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Today's Bookings" value="42" change={12.0} changeLabel="8 slots remaining" />
          <StatCard title="Confirmed Visits" value="38" change={98.0} changeLabel="confirmation rate" />
          <StatCard title="Avg Consult Time" value="18 min" change={-4.5} changeLabel="improved efficiency" />
        </div>

        {/* Appointments Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Today's Consultation Schedule
            </h2>
            <span className="text-xs text-blue-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Live Sync Active
            </span>
          </div>

          <DataTable
            columns={columns}
            data={mockAppointments}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </div>
    </AppShell>
  );
}
