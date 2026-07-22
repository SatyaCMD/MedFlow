'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { Users, UserPlus, Search, Filter, ShieldCheck } from 'lucide-react';

interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  status: 'admitted' | 'outpatient' | 'discharged';
  doctor: string;
}

export default function PatientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const mockPatients: Patient[] = [
    { id: '1', mrn: 'MC-1001', name: 'John Doe', age: 45, gender: 'Male', condition: 'Hypertension', status: 'admitted', doctor: 'Dr. House' },
    { id: '2', mrn: 'MC-1002', name: 'Jane Smith', age: 32, gender: 'Female', condition: 'Asthma Severity II', status: 'outpatient', doctor: 'Dr. Watson' },
    { id: '3', mrn: 'MC-1003', name: 'Robert Lee', age: 58, gender: 'Male', condition: 'Post-Op Knee Replacement', status: 'discharged', doctor: 'Dr. Strange' },
    { id: '4', mrn: 'MC-1004', name: 'Emily Davis', age: 27, gender: 'Female', condition: 'Type 1 Diabetes', status: 'admitted', doctor: 'Dr. House' },
    { id: '5', mrn: 'MC-1005', name: 'Michael Brown', age: 64, gender: 'Male', condition: 'Coronary Artery Stent', status: 'admitted', doctor: 'Dr. Watson' },
  ];

  const filteredPatients = mockPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: 'MRN Number', accessor: (row: Patient) => <span className="font-bold text-blue-600">{row.mrn}</span> },
    { header: 'Patient Name', accessor: (row: Patient) => <span className="font-bold text-slate-900">{row.name}</span> },
    { header: 'Demographics', accessor: (row: Patient) => <span className="text-slate-700 font-medium">{row.age} yrs • {row.gender}</span> },
    { header: 'Clinical Condition', accessor: (row: Patient) => <span className="text-slate-800 font-semibold">{row.condition}</span> },
    {
      header: 'Care Status',
      accessor: (row: Patient) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            row.status === 'admitted'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : row.status === 'outpatient'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    { header: 'Attending Physician', accessor: (row: Patient) => <span className="text-slate-700 font-medium">{row.doctor}</span> },
  ];

  return (
    <AppShell userRole="SUPER_ADMIN">
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Patient Master Directory
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Central electronic medical records index across all clinical wards and outpatient departments.
            </p>
          </div>
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer">
            <UserPlus className="w-4 h-4" />
            <span>Admit New Patient</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Total Registered Patients" value="1,248" change={8.4} changeLabel="this month" />
          <StatCard title="Currently Admitted" value="142" change={-1.2} changeLabel="ward capacity 84%" />
          <StatCard title="Outpatient Consults" value="384" change={14.1} changeLabel="vs last week" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Patient Name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Ward</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Active Medical Census ({filteredPatients.length})
            </h2>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> HIPAA Encryption Active
            </span>
          </div>

          <DataTable
            columns={columns}
            data={filteredPatients}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

      </div>
    </AppShell>
  );
}
