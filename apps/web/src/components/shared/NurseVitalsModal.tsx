'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Weight, Sparkles, X, CheckCircle2, User, Stethoscope } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface NurseVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  onVitalsSubmitted: (vitals: any) => void;
}

export const NurseVitalsModal: React.FC<NurseVitalsModalProps> = ({
  isOpen,
  onClose,
  patientName,
  doctorName,
  onVitalsSubmitted,
}) => {
  const { showToast } = useToast();

  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [spo2, setSpo2] = useState('99');
  const [temp, setTemp] = useState('98.6');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [glucose, setGlucose] = useState('95');
  const [nurseName, setNurseName] = useState('Nurse Clara, R.N.');

  if (!isOpen) return null;

  const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vitalsData = {
      bp: `${bpSystolic}/${bpDiastolic} mmHg`,
      pulse: `${pulse} bpm`,
      spo2: `${spo2}%`,
      temp: `${temp} °F`,
      weight: `${weight} kg`,
      height: `${height} cm`,
      bmi: `${bmi} kg/m²`,
      glucose: `${glucose} mg/dL`,
      nurseName,
      recordedAt: new Date().toLocaleString(),
    };

    onVitalsSubmitted(vitalsData);
    showToast({
      title: 'Pre-Consultation Vitals Recorded!',
      message: `Vitals for ${patientName} saved & auto-synced to ${doctorName}'s consultation sheet.`,
      type: 'success',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Pre-Consultation Vitals Check</h3>
              <p className="text-xs font-semibold text-slate-500">Nurse & Caregiver Pre-Check for {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient & Attending Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-semibold">
            <div>
              <span className="text-slate-500 block">Patient:</span>
              <span className="font-black text-slate-900">{patientName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Attending Doctor:</span>
              <span className="font-black text-blue-600">{doctorName}</span>
            </div>
          </div>

          {/* Blood Pressure & Heart Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Blood Pressure (mmHg)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  required
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center outline-none"
                />
                <span className="font-black text-slate-400">/</span>
                <input
                  type="number"
                  required
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Heart Rate / Pulse (bpm)
              </label>
              <input
                type="number"
                required
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* SpO2 & Temperature */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Oxygen Saturation (SpO2 %)
              </label>
              <input
                type="number"
                required
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="99"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Body Temperature (°F)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.6"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Weight, Height & BMI */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Calculated BMI
              </label>
              <input
                type="text"
                disabled
                value={bmi}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 text-center"
              />
            </div>
          </div>

          {/* Glucose & Attending Nurse */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Blood Glucose (mg/dL)
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="95"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Attending Nurse
              </label>
              <input
                type="text"
                required
                value={nurseName}
                onChange={(e) => setNurseName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Record & Sync Vitals to Doctor</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
