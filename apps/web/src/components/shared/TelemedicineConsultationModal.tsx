'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Activity,
  HeartPulse,
  FileText,
  Pill,
  X,
  Share2,
  Volume2,
  Radio,
  User,
  Camera,
  AlertCircle,
  Stethoscope,
  Clock,
  CheckCircle2,
  FlaskConical
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface TelemedicineConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientMrn?: string;
  doctorName?: string;
  onOpenPrescribeStudio?: () => void;
}

export const TelemedicineConsultationModal: React.FC<TelemedicineConsultationModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Jane Patient',
  patientMrn = 'MC-1001',
  doctorName = 'Dr. Anup Singh',
  onOpenPrescribeStudio,
}) => {
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stream & Hardware States
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Call Duration Timer
  const [callSeconds, setCallSeconds] = useState(258); // Starts at 04:18

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Live Camera Access Setup
  useEffect(() => {
    if (!isOpen) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    const requestWebcam = async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        activeStream = stream;
        setMediaStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Webcam permission error:', err);
        setCameraError('Camera access permission required or device unavailable.');
      }
    };

    requestWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Bind video element when mediaStream changes
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraActive(videoTrack.enabled);
      }
    } else {
      setIsCameraActive((prev) => !prev);
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicActive(audioTrack.enabled);
      }
    } else {
      setIsMicActive((prev) => !prev);
    }
  };

  const handleEndCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    onClose();
    showToast({
      title: 'Consultation Call Ended',
      message: `Telemedicine session with ${patientName} completed and saved to EMR Audit Vault.`,
      type: 'info',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col ${
            isFullscreen ? 'h-full max-h-full rounded-none' : 'max-h-[92vh]'
          }`}
        >
          {/* Executive Header Ribbon */}
          <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block animate-ping absolute inset-0" />
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block relative" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs sm:text-sm text-emerald-400 uppercase tracking-wide">
                    HD Telemedicine Suite Connected
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline-block">
                    256-Bit WebRTC Encrypted
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Patient: <strong className="text-slate-200">{patientName} ({patientMrn})</strong> • OPD Consultation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Call Timer Badge */}
              <div className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>{formatCallTime(callSeconds)}</span>
              </div>

              {/* Connection Quality */}
              <div className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-800">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>1080p 60fps • 14ms</span>
              </div>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Room Canvas */}
          <div className="relative flex-1 bg-slate-950 min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
            {/* Background Simulated Grid & Pulse */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

            {/* Main Patient Video Feed Representation */}
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              {/* Patient Simulated Avatar Stream */}
              <div className="flex flex-col items-center justify-center space-y-4 z-10 p-6 text-center">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 p-1 shadow-2xl shadow-blue-500/20">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-950">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                  </div>
                  <span className="w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full absolute bottom-1 right-1 flex items-center justify-center text-[10px] text-black font-black">
                    ✓
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{patientName}</h4>
                  <p className="text-xs font-semibold text-slate-400">Audio/Video Stream Synchronized • HD WebRTC</p>
                </div>
              </div>

              {/* Patient Telemetry Overlay HUD (Top-Left) */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                  <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>72 BPM</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>98% SpO2</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg hidden sm:flex">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>120/80 BP</span>
                </div>
              </div>

              {/* Doctor Live Webcam Picture-In-Picture (PIP) Window */}
              <div className="absolute bottom-4 right-4 z-30 w-44 sm:w-60 h-32 sm:h-40 bg-slate-900 border-2 border-blue-500/80 rounded-2xl overflow-hidden shadow-2xl group transition-all">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-2 text-center">
                    <VideoOff className="w-8 h-8 text-rose-500 mb-1" />
                    <span className="text-[10px] font-bold">Doctor Camera Muted</span>
                  </div>
                )}

                {/* PIP Overlay Label */}
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-slate-950/80 backdrop-blur-xs rounded-lg text-[10px] font-bold text-white flex items-center justify-between">
                  <span className="truncate flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-blue-400" />
                    {doctorName} (You)
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Camera Permission Warning (if blocked) */}
          {cameraError && (
            <div className="px-4 py-2 bg-amber-950/60 border-t border-amber-800/60 text-amber-300 text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                {cameraError}
              </span>
              <span className="text-[10px] underline cursor-pointer" onClick={() => window.location.reload()}>Retry Permissions</span>
            </div>
          )}

          {/* Interactive Control Dock Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Left Info */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                Audio: High-Fidelity Opus 48kHz
              </span>
            </div>

            {/* Center Controls Dock */}
            <div className="flex items-center gap-3">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`p-3.5 rounded-2xl font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center ${
                  isMicActive
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'
                }`}
                title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                onClick={toggleCamera}
                className={`p-3.5 rounded-2xl font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center ${
                  isCameraActive
                    ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'
                }`}
                title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraActive ? <Video className="w-5 h-5 text-emerald-400" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Screen Share */}
              <button
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  showToast({
                    title: isScreenSharing ? 'Screen Share Stopped' : 'Screen Share Active',
                    message: isScreenSharing ? 'Returned to video view.' : 'Sharing clinical EHR workstation window.',
                    type: 'info',
                  });
                }}
                className={`p-3.5 rounded-2xl font-bold transition-all border border-slate-700 cursor-pointer ${
                  isScreenSharing ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Open E-Prescribe Studio in Call */}
              {onOpenPrescribeStudio && (
                <button
                  onClick={onOpenPrescribeStudio}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Pill className="w-4 h-4" />
                  <span className="hidden sm:inline">Prescribe Rx</span>
                </button>
              )}
            </div>

            {/* Right End Call Button */}
            <div>
              <button
                onClick={handleEndCall}
                className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Consultation Call</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
