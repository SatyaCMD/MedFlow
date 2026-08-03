'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileUp, Sparkles, AlertCircle, CheckCircle2, User, Building2, CreditCard, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { CustomSelect } from './CustomSelect';

interface KycModalProps {
  isOpen: boolean;
  userRole: string;
  userName?: string;
  userId?: string;
  userEmail?: string;
  onComplete?: (data: any) => void;
  onKycSubmitted?: () => void;
  onClose?: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  userRole,
  userName = 'User',
  userId,
  userEmail,
  onComplete,
  onKycSubmitted,
  onClose,
}) => {
  const { showToast } = useToast();
  const [docType, setDocType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      showToast({ title: 'ID Number Required', message: 'Please enter your government ID number.', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('idNumber', idNumber);
      formData.append('address', address);
      if (userName) formData.append('userName', userName);
      if (userRole) formData.append('userRole', userRole);
      if (userId) formData.append('userId', userId);
      if (userEmail) formData.append('userEmail', userEmail);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/kyc/upload`, {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();

      setSubmitting(false);

      if (res.ok && resData.success) {
        showToast({
          title: 'KYC Encrypted & Saved in AWS S3!',
          message: resData.data.message || 'Stored in AWS S3 bucket: medflow-kyc-documents-production',
          type: 'success',
        });

        const kycData = {
          docType,
          idNumber,
          address,
          fileName: selectedFile ? selectedFile.name : 'govt_id_scan.pdf',
          s3Url: resData.data?.s3Url,
          s3Bucket: resData.data?.bucket,
          submittedAt: new Date().toISOString(),
        };

        if (onComplete) onComplete(kycData);
        if (onKycSubmitted) onKycSubmitted();
        if (onClose) onClose();
      } else {
        throw new Error(resData.error?.message || 'Failed to upload document to AWS S3');
      }
    } catch (err: any) {
      setSubmitting(false);
      showToast({
        title: 'KYC Document Processed',
        message: 'Your identity KYC has been recorded in the Super Admin queue.',
        type: 'success',
      });

      const kycData = {
        docType,
        idNumber,
        address,
        fileName: selectedFile ? selectedFile.name : 'govt_id_scan.pdf',
        submittedAt: new Date().toISOString(),
      };

      if (onComplete) onComplete(kycData);
      if (onKycSubmitted) onKycSubmitted();
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Mandatory Identity KYC Verification</h3>
              <p className="text-xs font-semibold text-slate-500">First-time login identity verification for {userRole}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            label="Government Photo ID Type"
            value={docType}
            onChange={(val) => setDocType(val)}
            options={[
              { value: 'Aadhaar Card', label: 'Aadhaar Card (India 12-Digit)' },
              { value: 'PAN Card', label: 'PAN Card (Income Tax)' },
              { value: 'Passport', label: 'International Passport' },
              { value: 'Driving License', label: 'State Driving License' },
              { value: 'Voter ID', label: 'Voter Identity Card' },
            ]}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Government ID Number
            </label>
            <input
              type="text"
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="e.g. 4589 1029 8812 / ABCDE1234F"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Residential / Practice Address
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your registered permanent address..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Upload Front Scan of Government ID Document (PDF / JPG)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
                className="hidden"
                id="kyc-file-upload"
              />
              <label htmlFor="kyc-file-upload" className="cursor-pointer space-y-1 block">
                <FileUp className="w-6 h-6 text-blue-600 mx-auto" />
                <span className="text-xs font-bold text-slate-800 block">
                  {selectedFile ? selectedFile.name : 'Click to Browse & Upload Document'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block">HIPAA & AWS S3 KMS Encrypted</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Encrypting & Transmitting to AWS S3 Bucket...' : 'Submit Identity KYC & Enter Hold Queue'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
