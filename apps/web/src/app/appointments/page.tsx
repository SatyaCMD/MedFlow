'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { PaymentModal } from '../../components/shared/PaymentModal';
import { BookDoctorVisitModal } from '../../components/shared/BookDoctorVisitModal';
import { useToast } from '../../context/ToastContext';
import { MEDICAL_DEPARTMENTS_CATALOG, REAL_DOCTORS_DATASET, DoctorProfile } from '../../data/medicalCatalog';
import {
  Calendar,
  Clock,
  Stethoscope,
  Star,
  Sparkles,
  Search,
  ShieldCheck,
  Building2,
  Filter,
  Award,
  Plus
} from 'lucide-react';

export default function AppointmentsPage() {
  const { showToast } = useToast();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeDepartment, setActiveDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [isBookVisitOpen, setIsBookVisitOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({
    title: '',
    category: 'APPOINTMENT' as 'APPOINTMENT' | 'LAB_TEST' | 'HOSPITAL_SUPPLY',
    amount: '₹1,500',
    patientName: 'Alex Care',
  });

  const currentCategory = MEDICAL_DEPARTMENTS_CATALOG[activeCategoryIndex];

  const filteredDoctors = REAL_DOCTORS_DATASET.filter((doc) => {
    const matchesDept = activeDepartment === 'ALL' || doc.department.toUpperCase() === activeDepartment.toUpperCase();
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const handleProceedToPaymentFromModal = (bookingDetails: any) => {
    setIsBookVisitOpen(false);
    setPaymentTarget({
      title: `Doctor Consultation — ${bookingDetails.doctor.name} (${bookingDetails.department})`,
      category: 'APPOINTMENT',
      amount: bookingDetails.amount,
      patientName: bookingDetails.patientName,
    });
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (receipt: any) => {
    showToast({
      title: 'Appointment Booked!',
      message: `Confirmed consultation. Receipt #${receipt.receiptNumber} generated.`,
      type: 'success',
    });
  };

  return (
    <AppShell userRole="PATIENT">
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Book Doctor Visit Modal */}
        <BookDoctorVisitModal
          isOpen={isBookVisitOpen}
          onClose={() => setIsBookVisitOpen(false)}
          onProceedToPayment={handleProceedToPaymentFromModal}
        />

        {/* Payment Gateway Sandbox Checkout Modal */}
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          itemTitle={paymentTarget.title}
          itemCategory={paymentTarget.category}
          amount={paymentTarget.amount}
          patientName={paymentTarget.patientName}
          onPaymentSuccess={handlePaymentSuccess}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Comprehensive Hospital Specialist Directory & Booking Hub
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              50+ Medical Departments, Super-Specialties, Emergency Services, and 25+ verified doctors per department.
            </p>
          </div>

          <button
            onClick={() => setIsBookVisitOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Book New Visit
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Active Specialties" value="50+ Departments" change={100.0} changeLabel="all medical branches" icon={Building2} />
          <StatCard title="Verified Specialists" value="25+ Per Dept" change={0.0} changeLabel="MD, DM, MCh degrees" icon={Award} />
          <StatCard title="Instant Slot Booking" value="Real-time" change={0.0} changeLabel="5-7 slots per doctor" icon={Clock} />
        </div>

        {/* Category Navigation Bar */}
        <div className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Select Medical Category
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {MEDICAL_DEPARTMENTS_CATALOG.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategoryIndex(idx);
                  setActiveDepartment('ALL');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategoryIndex === idx
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filters & Search */}
        <div className="space-y-4 bg-slate-50 border border-slate-200 p-4 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search physician by name, sub-specialty..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none shadow-2xs"
              />
            </div>

            {/* Department Pills for active Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveDepartment('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDepartment === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All {currentCategory.category}
              </button>

              {currentCategory.departments.map((dept, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDepartment(dept.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeDepartment === dept.name
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-5 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Doctor Topbar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                      {doc.avatar}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] font-bold text-blue-600">{doc.specialty}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-slate-500">{doc.qualification}</p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Experience</span>
                    <span className="font-bold text-slate-800">{doc.experience}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[9px] uppercase">Consult Fee</span>
                    <span className="font-black text-blue-600">{doc.fee}</span>
                  </div>
                </div>
              </div>

              {/* Slot & Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1 text-[11px] text-slate-600 font-semibold">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span className="truncate max-w-[120px]">{doc.nextSlot}</span>
                </div>

                <button
                  onClick={() => setIsBookVisitOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Book ({doc.fee})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
