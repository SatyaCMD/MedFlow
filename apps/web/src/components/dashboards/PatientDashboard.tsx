'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Calendar,
  FileText,
  Clock,
  Download,
  CheckCircle2,
  HeartPulse,
  Pill,
  Plus,
  X,
  Sparkles
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const [appointments, setAppointments] = useState([
    { id: '1', date: 'Tomorrow 09:00 AM', doctor: 'Dr. Gregory House', dept: 'Cardiology', location: 'Clinic Suite 4B', status: 'Confirmed' },
    { id: '2', date: 'Jul 28, 2026 10:30 AM', doctor: 'Dr. John Watson', dept: 'General Medicine', location: 'Building A Room 102', status: 'Upcoming' },
  ]);

  const [myRecords] = useState([
    { id: '1', date: 'Jul 21, 2026', type: 'Blood Chemistry Panel', doctor: 'Dr. House', result: 'Normal Range', download: 'PDF Report' },
    { id: '2', date: 'Jul 15, 2026', type: 'EKG Cardiac Tracing', doctor: 'Dr. Strange', result: 'Sinus Rhythm', download: 'PDF Report' },
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Gregory House');
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [selectedSlot, setSelectedSlot] = useState('Tomorrow 11:00 AM');
  const [reason, setReason] = useState('Routine Health Screening');

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt = {
      id: Date.now().toString(),
      date: selectedSlot,
      doctor: selectedDoctor,
      dept: selectedDept,
      location: 'Main Medical Center Suite 201',
      status: 'Confirmed',
    };
    setAppointments([newAppt, ...appointments]);
    setIsModalOpen(false);
    showToast({
      title: 'Appointment Booked!',
      message: `Your visit with ${selectedDoctor} for ${selectedSlot} has been confirmed.`,
      type: 'success',
    });
  };

  const handleDownload = (reportName: string) => {
    showToast({
      title: 'Downloading EMR Report',
      message: `Preparing encrypted PDF file for ${reportName}...`,
      type: 'info',
    });
  };

  const appointmentColumns = [
    { header: 'Date & Time', accessor: (row: typeof appointments[0]) => <span className="font-bold text-blue-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {row.date}</span> },
    { header: 'Attending Physician', accessor: (row: typeof appointments[0]) => <span className="font-bold text-slate-900">{row.doctor}</span> },
    { header: 'Department', accessor: (row: typeof appointments[0]) => <span className="text-slate-700 font-medium">{row.dept}</span> },
    { header: 'Location', accessor: (row: typeof appointments[0]) => <span className="text-slate-600 font-semibold">{row.location}</span> },
    {
      header: 'Status',
      accessor: (row: typeof appointments[0]) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
          {row.status}
        </span>
      ),
    },
  ];

  const recordColumns = [
    { header: 'Record Date', accessor: (row: typeof myRecords[0]) => <span className="text-slate-600 font-semibold">{row.date}</span> },
    { header: 'Clinical Diagnostic Report', accessor: (row: typeof myRecords[0]) => <span className="font-bold text-slate-900">{row.type}</span> },
    { header: 'Ordering Physician', accessor: (row: typeof myRecords[0]) => <span className="text-slate-700 font-medium">{row.doctor}</span> },
    { header: 'Result Summary', accessor: (row: typeof myRecords[0]) => <span className="text-emerald-700 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {row.result}</span> },
    {
      header: 'Actions',
      accessor: (row: typeof myRecords[0]) => (
        <button
          onClick={() => handleDownload(row.type)}
          className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600" />
            Patient Personal Health Portal
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Welcome, Jane Patient. View your upcoming doctor visits, downloadable lab reports, and active prescriptions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Next Doctor Visit" value="Tomorrow" change={0.0} changeLabel="09:00 AM with Dr. House" icon={Calendar} />
        <StatCard title="Active Prescriptions" value="3 Active" change={0.0} changeLabel="all filled" icon={Pill} />
        <StatCard title="Recent Lab Reports" value="2 New" change={100.0} changeLabel="ready for download" icon={FileText} />
        <StatCard title="Outstanding Balance" value="$0.00" change={0.0} changeLabel="all invoices paid" icon={CheckCircle2} />
      </div>

      {/* My Upcoming Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> My Scheduled Appointments
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Book Another Slot
          </button>
        </div>

        <DataTable
          columns={appointmentColumns}
          data={appointments}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* My EMR Diagnostic Reports */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" /> My Electronic Health & Diagnostic Reports
        </h2>

        <DataTable
          columns={recordColumns}
          data={myRecords}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* BOOK APPOINTMENT MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Book New Doctor Visit</h3>
                    <p className="text-xs font-semibold text-slate-500">Schedule a consultation with our specialist team</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4">
                {/* Select Doctor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Attending Physician
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => {
                      setSelectedDoctor(e.target.value);
                      if (e.target.value.includes('House')) setSelectedDept('Cardiology');
                      if (e.target.value.includes('Watson')) setSelectedDept('General Medicine');
                      if (e.target.value.includes('Strange')) setSelectedDept('Neurology');
                      if (e.target.value.includes('Cameron')) setSelectedDept('Immunology');
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  >
                    <option value="Dr. Gregory House">Dr. Gregory House — Cardiology & Diagnostics</option>
                    <option value="Dr. John Watson">Dr. John Watson — General Medicine</option>
                    <option value="Dr. Stephen Strange">Dr. Stephen Strange — Neurology</option>
                    <option value="Dr. Allison Cameron">Dr. Allison Cameron — Immunology</option>
                  </select>
                </div>

                {/* Department & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedDept}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Time Slot
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    >
                      <option value="Tomorrow 09:00 AM">Tomorrow 09:00 AM</option>
                      <option value="Tomorrow 11:30 AM">Tomorrow 11:30 AM</option>
                      <option value="Jul 26, 2026 02:00 PM">Jul 26, 2026 02:00 PM</option>
                      <option value="Jul 28, 2026 10:30 AM">Jul 28, 2026 10:30 AM</option>
                    </select>
                  </div>
                </div>

                {/* Consultation Reason */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Annual Checkup, Cardiac Followup"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
