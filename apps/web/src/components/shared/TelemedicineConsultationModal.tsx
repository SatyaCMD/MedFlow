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
  ShieldAlert
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

  // Callback Ref for Guaranteed Video DOM Element Attachment
  const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && mediaStream) {
      node.srcObject = mediaStream;
    }
  }, [mediaStream]);

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
    setChatMessages((prev) => [
      ...prev,
      { sender: doctorName, text: newChatMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className={`bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col ${
            isFullscreen ? 'h-full max-h-full rounded-none' : 'max-h-[94vh]'
          }`}
        >
          {/* Executive Header Bar */}
          <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-black text-xs sm:text-sm text-emerald-400 uppercase tracking-wider">
                  HD TELEMEDICINE SUITE CONNECTED
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 hidden sm:inline-block">
                256-BIT WEBRTC ENCRYPTED
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Call Timer */}
              <div className="px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>{formatCallTime(callSeconds)}</span>
              </div>

              {/* Resolution Tag */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>1080p 60fps • 14ms</span>
              </div>

              {/* Side Drawer Toggle Button */}
              <button
                onClick={() => setIsClinicalDrawerOpen(!isClinicalDrawerOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isClinicalDrawerOpen
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EHR Clinical Notes</span>
                {isClinicalDrawerOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                title="Close Room"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Video Suite Container with Optional Split Clinical Panel */}
          <div className="flex-1 flex overflow-hidden relative bg-slate-950">
            {/* Left Main Video Area */}
            <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto relative">
              {/* Patient HD Live Video Canvas */}
              <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[380px] flex flex-col justify-between p-4 shadow-xl">
                {/* Top Patient Header Info */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                    <User className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-black text-xs text-white block leading-none">{patientName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{patientMrn} • Patient Stream</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 rounded-xl text-[10px] font-black uppercase">
                    🟢 ONLINE
                  </span>
                </div>

                {/* Patient Live Video Stream Simulation / Avatar Feed */}
                <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10 space-y-3">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-1 shadow-2xl shadow-emerald-500/20">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                        <User className="w-16 h-16 text-slate-300" />
                      </div>
                    </div>
                    {/* Pulsating Audio Frequency Bar */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-950 border border-emerald-500/60 rounded-full flex items-center gap-1">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-black text-sm text-white">{patientName}</h5>
                    <p className="text-[11px] font-semibold text-slate-400">Audio/Video Stream Active • Opus 48kHz</p>
                  </div>
                </div>

                {/* Patient Live Vitals HUD (Bottom Overlay) */}
                <div className="flex items-center gap-2 z-10 overflow-x-auto pt-2">
                  <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>72 BPM</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>98% SpO2</span>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>120/80 BP</span>
                  </div>
                </div>
              </div>

              {/* Doctor Live Webcam Video Feed Canvas */}
              <div className="relative bg-slate-900 border-2 border-blue-500/60 rounded-3xl overflow-hidden min-h-[300px] sm:min-h-[380px] flex flex-col justify-between p-4 shadow-xl">
                {/* Doctor Video Overlay Header */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800">
                    <Stethoscope className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-black text-xs text-white block leading-none">{doctorName}</span>
                      <span className="text-[10px] text-blue-400 font-bold">Attending Physician • REG: MCI-889012</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                    isCameraActive ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {isCameraActive ? '📷 LIVE CAMERA ACTIVE' : 'CAMERA MUTED'}
                  </span>
                </div>

                {/* Real Live Hardware Video Element / Fallback */}
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

                  {/* Doctor Video Stream Face Representation when webcam permission pending/simulated */}
                  {(!isCameraActive || !mediaStream) && (
                    <div className="flex flex-col items-center justify-center text-center space-y-3 z-10 p-6">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-950">
                          <Stethoscope className="w-14 h-14 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-white">{doctorName}</h5>
                        <span className="text-[11px] font-bold text-blue-300 block">Department of Cardiology & Medicine</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Doctor Video HUD Footer (Bottom Overlay) */}
                <div className="flex items-center justify-between z-10 pt-2 bg-gradient-to-t from-slate-950/90 to-transparent p-2 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    Doctor Video Feed (Self View)
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800">
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
                  className="bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 overflow-hidden shadow-2xl"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase text-blue-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-500" /> Clinical EMR & Live Case Notes
                    </h4>
                    <button onClick={() => setIsClinicalDrawerOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {/* Patient Overview Box */}
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-400 block uppercase">PATIENT DEMOGRAPHICS</span>
                      <div className="font-bold text-white">{patientName} ({patientMrn})</div>
                      <div className="text-[11px] text-slate-400">42 Yrs • Female • OPD Consultation</div>
                    </div>

                    {/* Live Doctor Clinical Observations */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase block">DOCTOR IN-CALL CLINICAL NOTES</label>
                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-blue-500"
                        placeholder="Type real-time clinical notes & diagnosis during call..."
                      />
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase block flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> IN-CALL CHAT & MESSAGES
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                        {chatMessages.map((m, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                              <span>{m.sender}</span>
                              <span>{m.time}</span>
                            </div>
                            <div className="text-[11px] text-slate-200 font-medium bg-slate-900 p-2 rounded-lg border border-slate-800">
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
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                        />
                        <button type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500">
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Drawer Footer Prescribe Button */}
                  <div className="p-3 border-t border-slate-800 bg-slate-950">
                    {onOpenPrescribeStudio && (
                      <button
                        onClick={onOpenPrescribeStudio}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Pill className="w-4 h-4 text-blue-200" />
                        <span>Launch E-Prescribe Studio</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Control Dock Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                Opus 48kHz High-Fidelity Audio
              </span>
            </div>

            {/* Center Buttons */}
            <div className="flex items-center gap-3">
              {/* Mic Button */}
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

              {/* Camera Button */}
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

              {/* Screen Share Button */}
              <button
                onClick={() => {
                  setIsScreenSharing(!isScreenSharing);
                  showToast({
                    title: isScreenSharing ? 'Screen Sharing Stopped' : 'Screen Sharing Active',
                    message: isScreenSharing ? 'Returned to video feeds.' : 'Sharing clinical EHR workstation window.',
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

              {/* EHR Drawer Button */}
              <button
                onClick={() => setIsClinicalDrawerOpen(!isClinicalDrawerOpen)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">EHR Case Notes</span>
              </button>

              {/* Prescribe Rx Button */}
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

            {/* End Call Button */}
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
