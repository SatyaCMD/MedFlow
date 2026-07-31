'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightLeft,
  X,
  UserCheck,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  FlaskConical,
  HeartHandshake
} from 'lucide-react';
import { PatientCensusRecord, transferPatientCare } from '../../data/patientCensusStore';
import { useToast } from '../../context/ToastContext';

interface CareTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientCensusRecord | null;
  onTransferSuccess?: () => void;
}

export const CareTransferModal: React.FC<CareTransferModalProps> = ({
  isOpen,
  onClose,
  patient,
  onTransferSuccess,
}) => {
  const { showToast } = useToast();

  const [staffRole, setStaffRole] = useState<'DOCTOR' | 'NURSE' | 'LAB_TECH'>('DOCTOR');
  const [reasonType, setReasonType] = useState<'DOCTOR_ON_LEAVE' | 'CRITICAL_CASE_ESCALATION' | 'SPECIALIST_CONSULTATION' | 'NURSE_CARE_HANDOFF' | 'LAB_TECH_ASSIGNMENT'>('DOCTOR_ON_LEAVE');
  const [targetStaff, setTargetStaff] = useState('Dr. Watson');
  const [handoffNotes, setHandoffNotes] = useState('Primary attending physician on holiday/out of office. Handoff vital signs & ongoing treatment plan.');

  if (!isOpen || !patient) return null;

  const doctorOptions = ['Dr. House', 'Dr. Watson', 'Dr. Strange', 'Dr. Elizabeth Blackwell'].filter(d => d !== patient.doctorName);
  const nurseOptions = ['Nurse Clara Barton', 'Nurse Florence Nightingale', 'Nurse Mary Seacole'].filter(n => n !== patient.nurseName);
  const techOptions = ['Lab Tech David Miller', 'Lab Tech Sarah Jenkins'].filter(t => t !== patient.labTechName);

  const availableStaff = staffRole === 'DOCTOR' ? doctorOptions : staffRole === 'NURSE' ? nurseOptions : techOptions;

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    const result = transferPatientCare(
      patient.id,
      targetStaff || availableStaff[0] || 'Dr. Watson',
      staffRole,
      reasonType,
      handoffNotes
    );

    if (result) {
      showToast({
        title: 'Patient Care Transferred! ⇄',
        message: `Patient ${patient.name} (${patient.mrn}) reassigned to ${targetStaff} (Reason: ${reasonType.replace(/_/g, ' ')}).`,
        type: 'success',
      });
      if (onTransferSuccess) onTransferSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  Transfer Patient Case & Handoff Care
                </h2>
                <p className="text-xs text-blue-200/80 font-medium">
                  Reassign attending physician, caregiver nurse, or lab tech for {patient.name} ({patient.mrn})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleExecuteTransfer} className="p-6 space-y-5 text-xs text-slate-800">
            
            {/* Patient Context Summary */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">{patient.name} <span className="text-blue-600 font-extrabold">({patient.mrn})</span></div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{patient.age} Yrs • {patient.gender} • Blood Group: <span className="text-red-600 font-bold">{patient.bloodGroup}</span></div>
                <div className="text-[11px] text-slate-700 font-medium mt-0.5">Condition: {patient.condition}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Current Attending</div>
                <div className="text-xs font-black text-slate-800">{patient.doctorName}</div>
                <div className="text-[10px] font-semibold text-emerald-600 uppercase mt-0.5">{patient.status}</div>
              </div>
            </div>

            {/* Select Handoff Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Handoff Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStaffRole('DOCTOR');
                    setTargetStaff(doctorOptions[0] || 'Dr. Watson');
                    setReasonType('DOCTOR_ON_LEAVE');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    staffRole === 'DOCTOR'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Attending Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStaffRole('NURSE');
                    setTargetStaff(nurseOptions[0] || 'Nurse Florence Nightingale');
                    setReasonType('NURSE_CARE_HANDOFF');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    staffRole === 'NURSE'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Ward Nurse</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStaffRole('LAB_TECH');
                    setTargetStaff(techOptions[0] || 'Lab Tech David Miller');
                    setReasonType('LAB_TECH_ASSIGNMENT');
                  }}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    staffRole === 'LAB_TECH'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>Lab Technician</span>
                </button>
              </div>
            </div>

            {/* Select Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Reason for Transfer / Reassignment
              </label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DOCTOR_ON_LEAVE">🏖️ Doctor / Staff on Holiday or Leave</option>
                <option value="CRITICAL_CASE_ESCALATION">🚨 Critical Case Escalation (Emergency Specialist Transfer)</option>
                <option value="SPECIALIST_CONSULTATION">🩺 Specialist Consultation Referral</option>
                <option value="NURSE_CARE_HANDOFF">🔄 Ward Nurse Shift Handoff</option>
                <option value="LAB_TECH_ASSIGNMENT">🔬 Lab Sample Testing Handoff</option>
              </select>
            </div>

            {/* Target Practitioner Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Reassign To ({staffRole})
              </label>
              <select
                value={targetStaff}
                onChange={(e) => setTargetStaff(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableStaff.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinical Handoff Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Clinical Handoff Instructions & Notes
              </label>
              <textarea
                rows={3}
                value={handoffNotes}
                onChange={(e) => setHandoffNotes(e.target.value)}
                placeholder="Enter handoff notes regarding patient stability, meds, and pending lab tests..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirm Case Transfer</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
