'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Search,
  Star,
  Sparkles,
  ShieldCheck,
  Building2,
  Stethoscope,
  Paperclip,
  Trash2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { REAL_DOCTORS_DATASET, DoctorProfile } from '../../data/medicalCatalog';

interface BookDoctorVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment?: (bookingDetails: any) => void;
}

const DEPARTMENTS_METADATA: { [key: string]: { icon: string; doctorsCount: string; description: string } } = {
  'Cardiology': { icon: '🫀', doctorsCount: '25+ Doctors', description: 'Heart & Vascular Care' },
  'General Medicine': { icon: '🩺', doctorsCount: '30+ Doctors', description: 'Primary & Diagnostic Care' },
  'Neurology': { icon: '🧠', doctorsCount: '20+ Doctors', description: 'Brain & Nervous System' },
  'Orthopedics': { icon: '🦴', doctorsCount: '22+ Doctors', description: 'Bones, Joints & Spine' },
  'Pediatrics': { icon: '👶', doctorsCount: '18+ Doctors', description: 'Child & Infant Healthcare' },
  'Dermatology': { icon: '✨', doctorsCount: '15+ Doctors', description: 'Skin, Hair & Aesthetics' },
  'Oncology': { icon: '🛡️', doctorsCount: '16+ Doctors', description: 'Cancer Care & Chemotherapy' },
  'Gynecology & Obstetrics': { icon: '🚺', doctorsCount: '24+ Doctors', description: 'Women’s Health & Maternity' },
  'ENT (Otorhinolaryngology)': { icon: '👂', doctorsCount: '14+ Doctors', description: 'Ear, Nose & Throat Clinic' },
  'Ophthalmology': { icon: '👁️', doctorsCount: '15+ Doctors', description: 'Eye Care & Cataract Surgery' },
  'Gastroenterology': { icon: '🫄', doctorsCount: '17+ Doctors', description: 'Digestive & Liver Care' },
  'Psychiatry': { icon: '🧩', doctorsCount: '12+ Doctors', description: 'Mental Health & Wellness' },
  'Urology': { icon: '💧', doctorsCount: '14+ Doctors', description: 'Kidney & Urinary Tract' },
  'Nephrology': { icon: '🧪', doctorsCount: '13+ Doctors', description: 'Renal Care & Dialysis' },
  'Pulmonology': { icon: '🫁', doctorsCount: '16+ Doctors', description: 'Lungs & Respiratory Care' },
  'Emergency Medicine': { icon: '🚑', doctorsCount: '40+ Doctors', description: '24/7 Trauma & Critical Care' },
};

export const BookDoctorVisitModal: React.FC<BookDoctorVisitModalProps> = ({
  isOpen,
  onClose,
  onProceedToPayment,
}) => {
  const { showToast } = useToast();

  // 1. Mandatory Patient Information Fields
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [visitReason, setVisitReason] = useState('Routine Health Screening');

  // 2. Department & Doctor Selection
  const [selectedDept, setSelectedDept] = useState('Cardiology');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(REAL_DOCTORS_DATASET[0]);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

  // 3. Calendar Date & Time Slots
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // 4. Optional AWS S3 File Attachment Upload State
  const [s3Attachment, setS3Attachment] = useState<{
    fileName: string;
    fileSize: string;
    s3Url: string;
    uploadProgress: number;
    isUploading: boolean;
  } | null>(null);

  const doctorDropdownRef = useRef<HTMLDivElement>(null);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Departments list
  const departmentsList = [
    'Cardiology',
    'General Medicine',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Gynecology & Obstetrics',
    'ENT (Otorhinolaryngology)',
    'Ophthalmology',
    'Gastroenterology',
    'Psychiatry',
    'Urology',
    'Nephrology',
    'Pulmonology',
    'Emergency Medicine',
  ];

  // Filtered departments
  const filteredDepartments = departmentsList.filter((dept) =>
    dept.toLowerCase().includes(deptSearchQuery.toLowerCase())
  );

  // Filter 25+ Doctors for selected department
  const filteredDoctors = REAL_DOCTORS_DATASET.filter((doc) => {
    const matchesDept = doc.department.toUpperCase() === selectedDept.toUpperCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
      doc.fee.toLowerCase().includes(doctorSearchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Next 14 days calendar generator
  const getNext14Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const dateNum = date.getDate();
      const formattedStr = `${dayName}, ${monthName} ${dateNum}`;
      dates.push({ dayName, monthName, dateNum, formattedStr });
    }
    return dates;
  };

  const calendarDays = getNext14Days();

  useEffect(() => {
    if (isOpen) {
      if (!selectedDate) setSelectedDate(calendarDays[0].formattedStr);
      if (selectedDoctor && selectedDoctor.availableSlots && selectedDoctor.availableSlots.length > 0) {
        setSelectedTimeSlot(selectedDoctor.availableSlots[0]);
      }
    }
  }, [isOpen]);

  // When department changes, select the first doctor in that department
  useEffect(() => {
    const deptDocs = REAL_DOCTORS_DATASET.filter((d) => d.department.toUpperCase() === selectedDept.toUpperCase());
    if (deptDocs.length > 0) {
      setSelectedDoctor(deptDocs[0]);
      if (deptDocs[0].availableSlots && deptDocs[0].availableSlots.length > 0) {
        setSelectedTimeSlot(deptDocs[0].availableSlots[0]);
      }
    }
  }, [selectedDept]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(event.target as Node)) {
        setIsDoctorDropdownOpen(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle AWS S3 Medical Document Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast({ title: 'File Too Large', message: 'Maximum file size allowed is 25MB.', type: 'warning' });
      return;
    }

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const simulatedS3Url = `https://medflow-emr-vault.s3.ap-south-1.amazonaws.com/patient-uploads/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    setS3Attachment({
      fileName: file.name,
      fileSize: fileSizeMb,
      s3Url: simulatedS3Url,
      uploadProgress: 20,
      isUploading: true,
    });

    let progress = 20;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setS3Attachment({
          fileName: file.name,
          fileSize: fileSizeMb,
          s3Url: simulatedS3Url,
          uploadProgress: 100,
          isUploading: false,
        });
        showToast({
          title: 'Document Saved to AWS S3 Vault',
          message: `${file.name} uploaded securely & linked to consulting doctor.`,
          type: 'success',
        });
      } else {
        setS3Attachment((prev) => (prev ? { ...prev, uploadProgress: progress } : null));
      }
    }, 250);
  };

  const handleRemoveAttachment = () => {
    setS3Attachment(null);
    showToast({ title: 'Attachment Removed', message: 'File unlinked from appointment booking.', type: 'info' });
  };

  // Mandatory Validation & Proceed to Payment
  const handleProceedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      showToast({ title: 'Missing Patient Name', message: 'Please enter patient name.', type: 'warning' });
      return;
    }
    if (!patientAge || parseInt(patientAge) <= 0) {
      showToast({ title: 'Invalid Age', message: 'Please enter valid patient age.', type: 'warning' });
      return;
    }
    if (!patientPhone.trim()) {
      showToast({ title: 'Missing Phone Number', message: 'Please enter contact phone number.', type: 'warning' });
      return;
    }
    if (!patientEmail.trim()) {
      showToast({ title: 'Missing Email Address', message: 'Please enter email address.', type: 'warning' });
      return;
    }
    if (!selectedTimeSlot) {
      showToast({ title: 'Select Time Slot', message: 'Please pick an available consultation time slot.', type: 'warning' });
      return;
    }

    const numericFee = parseInt(selectedDoctor.fee.replace(/[^0-9]/g, '')) || 1500;

    const bookingDetails = {
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      patientEmail,
      visitReason,
      department: selectedDept,
      doctor: selectedDoctor,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      s3Attachment,
      consultationFee: numericFee,
    };

    if (onProceedToPayment) {
      onProceedToPayment(bookingDetails);
    } else {
      showToast({
        title: 'Appointment Booking Confirmed!',
        message: `Consultation booked with ${selectedDoctor.name} on ${selectedDate} at ${selectedTimeSlot}.`,
        type: 'success',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const activeDeptMeta = DEPARTMENTS_METADATA[selectedDept] || {
    icon: '🏥',
    doctorsCount: '20+ Doctors',
    description: 'Specialist Healthcare',
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <span>Book Doctor Visit & Outpatient Consultation</span>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Verified OPD
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Select Department • 25+ Specialist Doctors • Live Slots • AWS S3 Vault Security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleProceedSubmit} className="space-y-6">
          {/* SECTION 1: MANDATORY PATIENT DETAILS */}
          <div className="space-y-3 bg-slate-50 border border-slate-200/90 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>1. Patient Information (Mandatory *)</span>
              </h4>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                * All 5 Fields Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Patient Name */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Full Patient Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Smith"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Patient Age */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  placeholder="e.g. 34"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Patient Gender */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={patientGender}
                  onChange={(e: any) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Reason For Visit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Routine Health Checkup, Fever & Chest Pain, Skin Rash, Follow-up"
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* SECTION 2: HIGH-INDUSTRY STANDARD INTERACTIVE DEPARTMENT & DOCTOR SELECTION */}
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>2. Select Department & Attending Physician</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* HIGH INDUSTRY STANDARD CUSTOM INTERACTIVE DEPARTMENT DROPDOWN */}
              <div className="relative" ref={deptDropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Hospital Department (16 Specialties)
                </label>

                {/* Department Dropdown Trigger Button */}
                <div
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl text-xs font-bold text-slate-900 cursor-pointer flex items-center justify-between transition-all shadow-2xs hover:bg-slate-100/80"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-base flex items-center justify-center shadow-2xs shrink-0">
                      {activeDeptMeta.icon}
                    </div>
                    <div className="truncate text-left">
                      <span className="font-black text-slate-900 block truncate">
                        {selectedDept}
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold block truncate">
                        {activeDeptMeta.description} • {activeDeptMeta.doctorsCount}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      isDeptDropdownOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </div>

                {/* Searchable Interactive Department Dropdown Popup Panel */}
                <AnimatePresence>
                  {isDeptDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-80"
                    >
                      {/* Search Header */}
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50 relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-5 top-4" />
                        <input
                          type="text"
                          value={deptSearchQuery}
                          onChange={(e) => setDeptSearchQuery(e.target.value)}
                          placeholder="Search hospital department..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                        />
                      </div>

                      {/* Department Items List */}
                      <div className="overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
                        {filteredDepartments.map((dept) => {
                          const meta = DEPARTMENTS_METADATA[dept] || {
                            icon: '🏥',
                            doctorsCount: '20+ Doctors',
                            description: 'Healthcare Specialty',
                          };
                          const isSelected = dept === selectedDept;
                          return (
                            <div
                              key={dept}
                              onClick={() => {
                                setSelectedDept(dept);
                                setIsDeptDropdownOpen(false);
                                setDeptSearchQuery('');
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border border-blue-200/90 text-blue-900 font-bold'
                                  : 'hover:bg-slate-50 text-slate-800 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <span className="text-lg shrink-0">{meta.icon}</span>
                                <div className="truncate">
                                  <span className="font-extrabold text-xs block text-slate-900 truncate">
                                    {dept}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium block truncate">
                                    {meta.description}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-extrabold bg-blue-100/80 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                  {meta.doctorsCount}
                                </span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive Custom Doctor Dropdown */}
              <div className="relative" ref={doctorDropdownRef}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Attending Physician ({filteredDoctors.length}+ Available)
                </label>

                {/* Dropdown Toggle Trigger Button */}
                <div
                  onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl text-xs font-bold text-slate-900 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-2xs shrink-0">
                      {selectedDoctor.avatar}
                    </div>
                    <div className="truncate">
                      <span className="font-black text-slate-900 block truncate">
                        {selectedDoctor.name} — {selectedDoctor.department} ({selectedDoctor.fee})
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDoctorDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Custom Interactive Searchable Dropdown Popup */}
                <AnimatePresence>
                  {isDoctorDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden space-y-2 max-h-72 flex flex-col"
                    >
                      {/* Doctor Search Filter */}
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50 relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-5 top-4" />
                        <input
                          type="text"
                          value={doctorSearchQuery}
                          onChange={(e) => setDoctorSearchQuery(e.target.value)}
                          placeholder={`Search ${selectedDept} doctors...`}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      {/* Doctors List */}
                      <div className="overflow-y-auto divide-y divide-slate-100 p-1">
                        {filteredDoctors.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctor(doc);
                              if (doc.availableSlots && doc.availableSlots.length > 0) {
                                setSelectedTimeSlot(doc.availableSlots[0]);
                              }
                              setIsDoctorDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-between ${
                              doc.id === selectedDoctor.id ? 'bg-blue-50/80 border border-blue-200/80' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                                {doc.avatar}
                              </div>
                              <div className="truncate">
                                <span className="font-extrabold text-xs text-slate-900 block truncate">
                                  {doc.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-semibold block truncate">
                                  {doc.qualification} • {doc.specialty}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-black text-xs text-blue-600 block">{doc.fee}</span>
                              <span className="text-[10px] text-amber-600 font-bold flex items-center justify-end gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {doc.rating} ({doc.reviews})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Doctor Info Quick Card */}
            {selectedDoctor && (
              <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {selectedDoctor.avatar}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{selectedDoctor.name}</span>
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-200">
                        {selectedDoctor.rating} ★ ({selectedDoctor.reviews} reviews)
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {selectedDoctor.qualification} — <strong className="text-slate-800">{selectedDoctor.specialty}</strong> ({selectedDoctor.subSpecialty})
                    </p>
                    <p className="text-[10px] text-blue-600 font-bold mt-0.5">
                      Consultation Location: {selectedDoctor.hospitalUnit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">OPD Fee</span>
                  <span className="font-black text-sm text-slate-900">{selectedDoctor.fee}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: CALENDAR DATE SELECTION & 5-7 TIME SLOTS */}
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>3. Consultation Date & Time Slot Selection (5-7 Slots Available)</span>
            </h4>

            {/* Date Scroll Picker */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-2">
                Select Date (Next 14 Days Available)
              </label>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {calendarDays.map((cd, idx) => {
                  const isSelected = selectedDate === cd.formattedStr;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDate(cd.formattedStr)}
                      className={`min-w-[85px] p-3 rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-105'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-[10px] font-extrabold uppercase opacity-80">{cd.dayName}</span>
                      <span className="block text-base font-black mt-0.5">{cd.dateNum}</span>
                      <span className="block text-[10px] font-bold opacity-90 mt-0.5">{cd.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots grid (More than 5 slots per doctor) */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-2 flex items-center justify-between">
                <span>Select OPD Time Slot for {selectedDoctor?.name || 'Doctor'}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedDoctor?.availableSlots?.length || 6} Slots Available
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {selectedDoctor?.availableSlots?.map((slot, idx) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-105'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: OPTIONAL AWS S3 FILE UPLOAD (INSPECTION/REPORTS/MEDICINES) */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>4. Upload Medical Reports / Infection Images / Medicines (Optional)</span>
              </h4>
              <span className="text-[10px] font-extrabold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                AWS S3 Encrypted Storage
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              You may optionally upload previous prescriptions, diagnostic lab reports, or infection images. Uploaded files are stored in AWS S3 and made available directly to your consulting physician.
            </p>

            {/* AWS S3 Upload Box */}
            {!s3Attachment ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-blue-50/30">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
                  <Paperclip className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-slate-800">
                  Click to Upload Reports / Images (PNG, JPG, PDF, DICOM)
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                  Stored securely in AWS S3 Bucket • Max 25MB
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-3.5 bg-white border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                      📄
                    </div>
                    <div className="truncate">
                      <span className="font-extrabold text-xs text-slate-900 block truncate">
                        {s3Attachment.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {s3Attachment.fileSize} • Stored on AWS S3
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {s3Attachment.isUploading && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-blue-600">
                      <span>Uploading to AWS S3...</span>
                      <span>{s3Attachment.uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${s3Attachment.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <span>Confirm & Proceed to Appointment Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
