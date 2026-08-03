'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FlaskConical,
  ChevronRight,
  ChevronLeft,
  Send,
  MessageSquare,
  ShieldAlert,
  SwitchCamera,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';

interface TelemedicineConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientMrn?: string;
  doctorName?: string;
  userRole?: string;
  onOpenPrescribeStudio?: () => void;
}

export const TelemedicineConsultationModal: React.FC<TelemedicineConsultationModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Jane Patient',
  patientMrn = 'MC-1001',
  doctorName = 'Dr. Anup Singh',
  userRole,
  onOpenPrescribeStudio,
}) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Determine active self-view role (Patient vs Doctor)
  const inferredRole = userRole || (user?.role as string) || 'PATIENT';
  const [activeSelfViewRole, setActiveSelfViewRole] = useState<'PATIENT' | 'DOCTOR'>(
    inferredRole === 'PATIENT' || inferredRole === 'USER' ? 'PATIENT' : 'DOCTOR'
  );

  useEffect(() => {
    if (userRole) {
      setActiveSelfViewRole(userRole === 'PATIENT' ? 'PATIENT' : 'DOCTOR');
    } else if (user?.role) {
      const r = user.role as string;
      setActiveSelfViewRole(r === 'PATIENT' || r === 'USER' ? 'PATIENT' : 'DOCTOR');
    }
  }, [userRole, user]);

  // Hardware & Call States
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClinicalDrawerOpen, setIsClinicalDrawerOpen] = useState(false);

  // Live Clinical Notes State
  const [clinicalNotes, setClinicalNotes] = useState('Patient reports reduced fatigue after starting Amlodipine 5mg. BP is stable at 120/80 mmHg.');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: 'Secure WebRTC 256-Bit Encrypted Session Established.', time: '10:30 AM' },
    { sender: 'Patient (Jane)', text: 'Hello Doctor, I have uploaded my latest ECG report.', time: '10:31 AM' },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Call Duration Timer
  const [callSeconds, setCallSeconds] = useState(266); // 04:26

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

  // Callback Ref for Guaranteed Video DOM Element Attachment to Active Self-View Tile
  const setVideoNode = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && mediaStream) {
        node.srcObject = mediaStream;
      }
    },
    [mediaStream]
  );

  // Request Hardware Webcam Stream
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
        console.warn('Webcam permission note:', err);
        setCameraError('Browser webcam permission pending or virtual camera active.');
      }
    };

    requestWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    const senderLabel = activeSelfViewRole === 'PATIENT' ? patientName : doctorName;
    setChatMessages((prev) => [
      ...prev,
      { sender: senderLabel, text: newChatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setNewChatMessage('');
  };

  const handleEndCall = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    onClose();
    showToast({
      title: 'Telemedicine Session Concluded',
      message: `Consultation with ${patientName} saved to EMR longitudinal history.`,
      type: 'info',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md font-sans select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className={`bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col ${
            isFullscreen ? 'h-full max-h-full rounded-none' : 'max-h-[94vh]'
          }`}
        >
          {/* Executive Light Theme Header Bar */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-black text-xs sm:text-sm text-emerald-800 uppercase tracking-wider">
                  HD TELEMEDICINE SUITE CONNECTED
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block shadow-2xs">
                256-BIT WEBRTC ENCRYPTED
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Self-View Camera Mode Switcher Button */}
              <button
                type="button"
                onClick={() => setActiveSelfViewRole(activeSelfViewRole === 'PATIENT' ? 'DOCTOR' : 'PATIENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  activeSelfViewRole === 'PATIENT'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                }`}
                title="Switch active self-view camera stream between Patient and Doctor"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span className="text-[11px]">
                  Self-View: <strong className="uppercase">{activeSelfViewRole} CAM</strong>
                </span>
              </button>

              {/* Call Timer */}
              <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>{formatCallTime(callSeconds)}</span>
              </div>

              {/* Resolution Tag */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>1080p 60fps • 14ms</span>
              </div>

              {/* Side Drawer Toggle Button */}
              <button
                onClick={() => setIsClinicalDrawerOpen(!isClinicalDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  isClinicalDrawerOpen
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EHR Clinical Notes</span>
                {isClinicalDrawerOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Close Room"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Video Suite Container with Optional Split Clinical Panel */}
          <div className="flex-1 flex overflow-hidden relative bg-slate-100/70">
            {/* Left Main Video Area */}
            <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto relative">
              {/* ============================================================ */}
              {/* TILE 1: PATIENT VIDEO CANVAS (LEFT SIDE)                     */}
              {/* ============================================================ */}
              <div
                className={`relative bg-emerald-950/90 rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] flex flex-col justify-between p-4 shadow-xl transition-all ${
                  activeSelfViewRole === 'PATIENT'
                    ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/20 shadow-emerald-500/10'
                    : 'border border-slate-700'
                }`}
              >
                {/* Top Patient Header Info */}
                <div className="flex items-center justify-between z-10 w-full">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-black text-xs text-white block leading-none">{patientName}</span>
                      <span className="text-[10px] text-slate-300 font-semibold">{patientMrn} • Patient Stream</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm ${
                      activeSelfViewRole === 'PATIENT'
                        ? isCameraActive
                          ? 'bg-emerald-500 text-white border border-emerald-400'
                          : 'bg-rose-600 text-white border border-rose-400'
                        : 'bg-emerald-900/90 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    {activeSelfViewRole === 'PATIENT'
                      ? isCameraActive
                        ? '📷 LIVE CAMERA ACTIVE'
                        : 'CAMERA MUTED'
                      : '🟢 LIVE REMOTE PATIENT'}
                  </span>
                </div>

                {/* Video Feed / Media Stream Element for Patient when activeSelfViewRole === 'PATIENT' */}
                {activeSelfViewRole === 'PATIENT' ? (
                  <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
                    <video
                      ref={setVideoNode}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                        isCameraActive && mediaStream ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Patient Fallback Avatar when camera is disabled */}
                    {(!isCameraActive || !mediaStream) && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto w-full">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 shadow-2xl shadow-emerald-500/30">
                          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                            <User className="w-16 h-16 text-slate-300" />
                          </div>
                        </div>
                        <div className="w-full text-center">
                          <h5 className="font-black text-base text-white">{patientName}</h5>
                          <span className="text-xs font-bold text-emerald-400 block mt-0.5">Patient Camera Muted (Audio Stream Active)</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Remote Patient Stream Avatar Representation when Doctor is Self View */
                  <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10 space-y-3 w-full">
                    <div className="relative">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 shadow-2xl shadow-emerald-500/30">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                          <User className="w-16 h-16 text-slate-300" />
                        </div>
                      </div>
                      {/* Pulsating Audio Frequency Bar */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-emerald-500/60 rounded-full flex items-center gap-1 shadow-md">
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>

                    <div className="w-full text-center">
                      <h5 className="font-black text-base text-white">{patientName}</h5>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">Audio/Video Remote Stream Active • Opus 48kHz</p>
                    </div>
                  </div>
                )}

                {/* Patient Footer Overlay with Live Vitals HUD */}
                <div className="flex flex-col gap-2 z-10 pt-2 bg-gradient-to-t from-slate-950/95 to-transparent p-2 rounded-2xl w-full">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                      {activeSelfViewRole === 'PATIENT' ? 'Patient Video Feed (Self View)' : 'Patient Remote Feed'}
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                      HD 1080p Stream
                    </span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    <div className="px-2.5 py-1 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <HeartPulse className="w-3 h-3 text-rose-400 animate-pulse" />
                      <span>72 BPM</span>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>98% SpO2</span>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>120/80 BP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* TILE 2: DOCTOR VIDEO CANVAS (RIGHT SIDE)                      */}
              {/* ============================================================ */}
              <div
                className={`relative bg-slate-950 rounded-3xl overflow-hidden min-h-[320px] sm:min-h-[380px] flex flex-col justify-between p-4 shadow-xl transition-all ${
                  activeSelfViewRole === 'DOCTOR'
                    ? 'border-2 border-blue-500 ring-4 ring-blue-500/20 shadow-blue-500/10'
                    : 'border border-slate-800'
                }`}
              >
                {/* Doctor Video Overlay Header */}
                <div className="flex items-center justify-between z-10 w-full">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md">
                    <Stethoscope className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-black text-xs text-white block leading-none">{doctorName}</span>
                      <span className="text-[10px] text-blue-300 font-bold">Attending Physician • REG: MCI-889012</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-sm ${
                      activeSelfViewRole === 'DOCTOR'
                        ? isCameraActive
                          ? 'bg-blue-600 text-white border border-blue-400'
                          : 'bg-rose-600 text-white border border-rose-400'
                        : 'bg-blue-900/90 text-blue-300 border border-blue-700'
                    }`}
                  >
                    {activeSelfViewRole === 'DOCTOR'
                      ? isCameraActive
                        ? '📷 LIVE CAMERA ACTIVE'
                        : 'CAMERA MUTED'
                      : '🔵 LIVE REMOTE DOCTOR'}
                  </span>
                </div>

                {/* Video Feed / Media Stream Element for Doctor when activeSelfViewRole === 'DOCTOR' */}
                {activeSelfViewRole === 'DOCTOR' ? (
                  <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
                    <video
                      ref={setVideoNode}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                        isCameraActive && mediaStream ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Doctor Fallback Avatar when camera is disabled */}
                    {(!isCameraActive || !mediaStream) && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto w-full">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/30">
                          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-950">
                            <Stethoscope className="w-14 h-14 text-blue-400" />
                          </div>
                        </div>
                        <div className="w-full text-center">
                          <h5 className="font-black text-base text-white">{doctorName}</h5>
                          <span className="text-xs font-bold text-blue-300 block mt-0.5">Department of Cardiology & Medicine</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Remote Doctor Stream Avatar Representation when Patient is Self View */
                  <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10 space-y-3 w-full">
                    <div className="relative">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/30">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-950">
                          <Stethoscope className="w-14 h-14 text-blue-400" />
                        </div>
                      </div>
                      {/* Audio Pulse */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-blue-500/60 rounded-full flex items-center gap-1 shadow-md">
                        <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce" />
                        <span className="w-1 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                    <div className="w-full text-center">
                      <h5 className="font-black text-base text-white">{doctorName}</h5>
                      <span className="text-xs font-bold text-blue-300 block mt-0.5">Attending Physician Remote Stream Active</span>
                    </div>
                  </div>
                )}

                {/* Doctor Video HUD Footer (Bottom Overlay) */}
                <div className="flex items-center justify-between z-10 pt-2 bg-gradient-to-t from-slate-950/95 to-transparent p-2 rounded-2xl w-full">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    {activeSelfViewRole === 'DOCTOR' ? 'Doctor Video Feed (Self View)' : 'Doctor Remote Feed'}
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700">
                    HD 1080p Stream
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sliding Clinical EHR Drawer */}
            <AnimatePresence>
              {isClinicalDrawerOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-hidden shadow-2xl"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase text-blue-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" /> Clinical EMR & Live Case Notes
                    </h4>
                    <button onClick={() => setIsClinicalDrawerOpen(false)} className="text-slate-400 hover:text-slate-800 p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {/* Patient Overview Box */}
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-500 block uppercase">PATIENT DEMOGRAPHICS</span>
                      <div className="font-extrabold text-slate-900">{patientName} ({patientMrn})</div>
                      <div className="text-[11px] text-slate-600 font-semibold">42 Yrs • Female • OPD Consultation</div>
                    </div>

                    {/* Live Doctor Clinical Observations */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase block">DOCTOR IN-CALL CLINICAL NOTES</label>
                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                        placeholder="Type real-time clinical notes & diagnosis during call..."
                      />
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> IN-CALL CHAT & MESSAGES
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 border border-slate-200 rounded-xl">
                        {chatMessages.map((m, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                              <span>{m.sender}</span>
                              <span>{m.time}</span>
                            </div>
                            <div className="text-[11px] text-slate-800 font-semibold bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendMessage} className="flex gap-1.5">
                        <input
                          type="text"
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          placeholder="Type chat message..."
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                        />
                        <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 cursor-pointer shadow-xs">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Prescribe Studio Shortcut Button */}
                  {onOpenPrescribeStudio && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                      <button
                        onClick={onOpenPrescribeStudio}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Pill className="w-4 h-4" />
                        <span>Launch Digital Prescribe Studio</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Floating WebRTC Call Controls Light Theme Dock */}
          <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="hidden sm:inline">Opus 48kHz High-Fidelity Audio</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mic Mute Toggle */}
              <button
                onClick={toggleMic}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isMicActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse font-bold'
                }`}
                title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicActive ? <Mic className="w-5 h-5 text-slate-800" /> : <MicOff className="w-5 h-5 text-rose-600" />}
              </button>

              {/* Camera Toggle */}
              <button
                onClick={toggleCamera}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isCameraActive
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse font-bold'
                }`}
                title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {isCameraActive ? <Video className="w-5 h-5 text-slate-800" /> : <VideoOff className="w-5 h-5 text-rose-600" />}
              </button>

              {/* Screen Share Button */}
              <button
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  showToast({
                    title: isScreenSharing ? 'Screen Sharing Stopped' : 'Screen Sharing Active',
                    message: isScreenSharing ? 'Returned to video stream.' : 'Sharing clinical window with patient.',
                    type: 'info',
                  });
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isScreenSharing
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* EHR Drawer Button */}
              <button
                onClick={() => setIsClinicalDrawerOpen(!isClinicalDrawerOpen)}
                className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">EHR Case Notes</span>
              </button>
            </div>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="px-5 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Consultation Call</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
