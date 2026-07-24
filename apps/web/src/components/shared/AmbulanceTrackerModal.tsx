'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-console */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  Phone,
  ShieldCheck,
  MapPin,
  Navigation,
  Clock,
  UserCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Activity,
  Truck,
  RotateCcw,
  ArrowRight,
  Radio,
  Building2,
  Plus,
  Minus,
  Maximize2,
  Home,
  Layers,
  Globe
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DriverProfile {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  phone: string;
  plate: string;
  unitType: string;
  paramedic: string;
}

const DRIVER_DATASET: DriverProfile[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Kumar',
    avatar: 'RK',
    rating: 4.9,
    phone: '+91 98765 43210',
    plate: 'MH-02-EQ-9912',
    unitType: 'Advanced Life Support (ALS) ICU',
    paramedic: 'Paramedic Specialist Vikram (Trauma Certified)',
  },
  {
    id: 'drv-2',
    name: 'Amit Sharma',
    avatar: 'AS',
    rating: 4.85,
    phone: '+91 98123 77410',
    plate: 'DL-01-AM-4421',
    unitType: 'Cardiac Care ICU Response Unit',
    paramedic: 'Paramedic Specialist Deepak Varma',
  },
  {
    id: 'drv-3',
    name: 'Suresh Patil',
    avatar: 'SP',
    rating: 4.95,
    phone: '+91 99401 22849',
    plate: 'KA-03-ER-8820',
    unitType: 'Trauma & Burn ICU Ambulance',
    paramedic: 'Paramedic Specialist Ananya Rao',
  },
  {
    id: 'drv-4',
    name: 'Dharmendra Roy',
    avatar: 'DR',
    rating: 4.88,
    phone: '+91 97321 00582',
    plate: 'WB-04-AB-1109',
    unitType: 'Pediatric Neonatal ICU Support',
    paramedic: 'Paramedic Specialist Pooja Chawla',
  },
  {
    id: 'drv-5',
    name: 'Vikram Malhotra',
    avatar: 'VM',
    rating: 4.9,
    phone: '+91 98992 34110',
    plate: 'HR-26-EM-9034',
    unitType: 'Ventilator Critical Transport Unit',
    paramedic: 'Paramedic Specialist Rajesh Nambiar',
  },
];

// Fetch Google Maps API Key strictly from environment variables (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface AmbulanceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPickupLocation?: string;
}

export const AmbulanceTrackerModal: React.FC<AmbulanceTrackerModalProps> = ({
  isOpen,
  onClose,
  defaultPickupLocation = 'Badagada, Bhubaneswar',
}) => {
  const { showToast } = useToast();

  // Mode: 'REQUEST_FORM' -> 'DISPATCHING' -> 'LIVE_TRACKING'
  const [step, setStep] = useState<'REQUEST_FORM' | 'DISPATCHING' | 'LIVE_TRACKING'>('REQUEST_FORM');

  // Input & Unit Selection
  const [pickupAddress, setPickupAddress] = useState(defaultPickupLocation);
  const [selectedUnitType, setSelectedUnitType] = useState('ALS');

  // Random Assigned Driver
  const [assignedDriver, setAssignedDriver] = useState<DriverProfile>(DRIVER_DATASET[0]);

  // Live Animation Tracking State
  const [etaSeconds, setEtaSeconds] = useState(517); // 8m 37s
  const [progressPercent, setProgressPercent] = useState(25);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1); // 1: Accepted, 2: En Route, 3: Arrived & Picked Up, 4: ER Transport
  const [distanceKm, setDistanceKm] = useState(1.8);
  const [vehicleSpeed, setVehicleSpeed] = useState(48);

  // Map View Mode: 'STREET' | 'SATELLITE'
  const [mapType, setMapType] = useState<'STREET' | 'SATELLITE'>('STREET');

  // Geocoded Coordinates for Map Center
  const [coords, setCoords] = useState<[number, number]>([20.2458, 85.8452]); // Default Badagada, Bhubaneswar
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Dynamically load Google Maps JS API script or Leaflet Map Engine inside div ref
  useEffect(() => {
    if (!isOpen || step !== 'LIVE_TRACKING') return;

    let isMounted = true;

    const loadMapEngine = async () => {
      // 1. Geocode Pickup Address using Nominatim / Geocoding
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pickupAddress)}&format=json&limit=1`
        );
        const data = await res.json();
        if (data && data[0] && isMounted) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords([lat, lon]);
        }
      } catch (err) {
        console.warn('Geocoding fallback:', err);
      }

      // 2. Load Leaflet CSS & JS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
    };

    loadMapEngine();

    return () => {
      isMounted = false;
    };
  }, [isOpen, step, pickupAddress]);

  // Render Map Layer in native Div Ref with resize trigger
  useEffect(() => {
    if (!isOpen || step !== 'LIVE_TRACKING' || !mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 15,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Trigger size invalidation to fix hidden height render bugs
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    // Tile Layer: CartoDB Voyager / OpenStreetMap Street Style
    const tileUrl =
      mapType === 'SATELLITE'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // 1. Patient Home Icon Marker
    const homeIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:#0f172a; color:white; width:34px; height:34px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid white; box-shadow:0 10px 20px rgba(0,0,0,0.3); font-size:16px;">🏠</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker(coords, { icon: homeIcon }).addTo(map).bindPopup(`<b>Pickup Location</b><br/>${pickupAddress}`);

    // 2. Hospital ER Base Icon Marker (offset ~1.2 km west)
    const hospitalCoords: [number, number] = [coords[0] - 0.008, coords[1] - 0.012];
    const hospitalIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:#2563eb; color:white; width:34px; height:34px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid white; box-shadow:0 10px 20px rgba(0,0,0,0.3); font-size:16px;">🏥</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker(hospitalCoords, { icon: hospitalIcon }).addTo(map).bindPopup('<b>MediCore ER Base</b>');

    // 3. Navigation Blue Polyline
    const polyline = L.polyline([hospitalCoords, coords], {
      color: '#2563eb',
      weight: 6,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // 4. Moving Ambulance Icon Marker
    const ambIcon = L.divIcon({
      className: 'custom-amb-pin',
      html: `<div style="background:#dc2626; color:white; width:36px; height:36px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 0 15px rgba(220,38,38,0.8); font-size:18px;">🚑</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const p = Math.max(0, Math.min(100, progressPercent)) / 100;
    const startPt = currentStage === 4 ? coords : hospitalCoords;
    const endPt = currentStage === 4 ? hospitalCoords : coords;

    const currentLat = startPt[0] + (endPt[0] - startPt[0]) * p;
    const currentLng = startPt[1] + (endPt[1] - startPt[1]) * p;

    L.marker([currentLat, currentLng], { icon: ambIcon }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, step, coords, mapType, progressPercent, currentStage, pickupAddress]);

  // Live Dispatch Simulation Timer
  useEffect(() => {
    if (!isOpen || step !== 'LIVE_TRACKING') return;

    const interval = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) {
          if (currentStage === 2) {
            setCurrentStage(3);
            showToast({
              title: 'Ambulance Arrived at Pickup Location!',
              message: `${assignedDriver.name} (${assignedDriver.plate}) has arrived at ${pickupAddress}. Patient picked up.`,
              type: 'success',
            });
            setTimeout(() => {
              setCurrentStage(4);
              setEtaSeconds(360);
              setProgressPercent(10);
              showToast({
                title: 'Phase 2: Transporting to ER Trauma Center',
                message: `Ambulance van is driving passenger to MediCore Hospital ER.`,
                type: 'info',
              });
            }, 3000);
            return 0;
          } else if (currentStage === 4) {
            clearInterval(interval);
            showToast({
              title: 'Safely Arrived at MediCore ER!',
              message: 'Patient delivered directly to ER Emergency Trauma Ward.',
              type: 'success',
            });
            return 0;
          }
          return 0;
        }
        return prev - 1;
      });

      setProgressPercent((prev) => {
        const next = Math.min(100, prev + 1.2);
        const remDistance = parseFloat((1.8 * (1 - next / 100)).toFixed(1));
        setDistanceKm(remDistance > 0 ? remDistance : 0.1);
        setVehicleSpeed(Math.floor(42 + Math.random() * 18));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, step, currentStage, assignedDriver, pickupAddress, showToast]);

  if (!isOpen) return null;

  const formatEta = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleRequestAmbulanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim()) {
      showToast({ title: 'Pickup Address Required', message: 'Please enter your pickup location.', type: 'warning' });
      return;
    }

    setStep('DISPATCHING');
    const randomDriverIndex = Math.floor(Math.random() * DRIVER_DATASET.length);
    const selected = DRIVER_DATASET[randomDriverIndex];
    setAssignedDriver(selected);

    setTimeout(() => {
      setStep('LIVE_TRACKING');
      setCurrentStage(2);
      setEtaSeconds(517);
      setProgressPercent(20);
      setDistanceKm(1.8);

      showToast({
        title: 'Emergency Ambulance Dispatched!',
        message: `Driver ${selected.name} (${selected.plate}) assigned. En route to ${pickupAddress}.`,
        type: 'success',
      });
    }, 1500);
  };

  const handleCallDriver = () => {
    showToast({
      title: `Calling Driver ${assignedDriver.name}`,
      message: `Connecting to ${assignedDriver.phone}...`,
      type: 'info',
    });
  };

  const handleSimulatePickup = () => {
    setCurrentStage(4);
    setEtaSeconds(360);
    setProgressPercent(15);
    showToast({
      title: 'Passenger Picked Up! En Route to ER',
      message: 'Ambulance van now transporting patient to MediCore ER Trauma Center.',
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[94vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                Real-Time Live GPS Ambulance Tracker
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Google Maps API Integration • Geocoded Live Navigation • Live Telemetry
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1: PICKUP ADDRESS & VEHICLE SELECTION FORM */}
        {step === 'REQUEST_FORM' && (
          <form onSubmit={handleRequestAmbulanceSubmit} className="space-y-5">
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>Emergency Ambulance Dispatch Request</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Enter your pickup address (e.g. Badagada, Bhubaneswar, or Green Park, Delhi). The map dynamically centers and tracks your location in real time.
              </p>
            </div>

            {/* Pickup Address Field */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Pickup Address / Landmark</span>
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter Flat / House No, Street Address, Area, City..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>

            {/* Ambulance Unit Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Select Ambulance Response Unit
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedUnitType('ALS')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedUnitType === 'ALS'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-xs">ALS ICU Unit</span>
                  <span className="block text-[10px] opacity-90 font-medium mt-0.5">Ventilator + Monitor</span>
                  <span className="block text-xs font-extrabold mt-1">₹1,500</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUnitType('BLS')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedUnitType === 'BLS'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-xs">BLS Emergency</span>
                  <span className="block text-[10px] opacity-90 font-medium mt-0.5">Oxygen + Stretcher</span>
                  <span className="block text-xs font-extrabold mt-1">₹800</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUnitType('PEDIATRIC')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedUnitType === 'PEDIATRIC'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-black text-xs">Neonatal ICU</span>
                  <span className="block text-[10px] opacity-90 font-medium mt-0.5">Incubator Unit</span>
                  <span className="block text-xs font-extrabold mt-1">₹2,000</span>
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <Siren className="w-5 h-5 animate-pulse" />
              <span>Request Immediate Emergency Dispatch</span>
            </button>
          </form>
        )}

        {/* STEP 2: DISPATCH MATCHING RADAR SPINNER */}
        {step === 'DISPATCHING' && (
          <div className="py-12 space-y-6 text-center">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-600 animate-spin" />
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-lg">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">Geocoding Address & Assigning Emergency Unit...</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Centering Map on <strong className="text-slate-800">{pickupAddress}</strong>...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: DYNAMIC REAL MAP TRACKING */}
        {step === 'LIVE_TRACKING' && (
          <div className="space-y-4">
            {/* 100% UN-OBSCURED DYNAMIC MAP CONTAINER IN NATIVE DIV REF */}
            <div className="relative h-72 min-h-[288px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-100 p-3 select-none flex flex-col justify-between">
              {/* Dynamic Native Div Map Engine (Zero Iframe Block Errors!) */}
              <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%', minHeight: '288px', position: 'absolute', inset: 0, zIndex: 0 }}
                className="rounded-3xl"
              />

              {/* Floating Top Status Header */}
              <div className="relative z-10 flex items-center justify-between pointer-events-auto">
                <span className="px-3.5 py-1 bg-rose-600 text-white font-black text-[11px] rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{currentStage === 4 ? 'ER TRANSPORT IN PROGRESS' : 'LIVE DISPATCH TRACKING'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMapType(mapType === 'STREET' ? 'SATELLITE' : 'STREET')}
                    className="px-3 py-1 bg-white/95 hover:bg-white text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mapType === 'STREET' ? 'Satellite View' : 'Street Map'}</span>
                  </button>

                  <span className="px-3 py-1 bg-slate-900/90 border border-slate-700 text-emerald-400 font-black text-xs rounded-full font-mono shadow-md">
                    ETA: {formatEta(etaSeconds)}
                  </span>
                </div>
              </div>

              {/* Bottom Address Pin Badge */}
              <div className="relative z-10 self-start pointer-events-auto">
                <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-xs text-white rounded-xl border border-slate-700 text-[11px] font-bold shadow-lg flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                  <span>Google Maps API Location: <strong className="text-amber-400">{pickupAddress}</strong></span>
                </div>
              </div>
            </div>

            {/* ACTIVE NAVIGATION ROUTE & TELEMETRY BAR (PLACED CLEANLY BELOW MAP) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-white shadow-xl">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Active Navigation Route</span>
                  <span className="font-extrabold text-white text-xs truncate block mt-0.5">
                    {currentStage === 4
                      ? `${pickupAddress} ➔ MediCore ER`
                      : `MediCore ER Base ➔ ${pickupAddress}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Distance</span>
                  <span className="font-mono font-black text-amber-400 text-xs">{distanceKm} km</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Live Speed</span>
                  <span className="font-mono font-black text-emerald-400 text-xs">{vehicleSpeed} km/h</span>
                </div>

                {/* SIMULATE PICKUP BUTTON (PLACED CLEANLY INSIDE TELEMETRY BAR BELOW MAP) */}
                {currentStage === 2 && (
                  <button
                    type="button"
                    onClick={handleSimulatePickup}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Pickup</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4-Stage Dispatch Milestones */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                Dispatch Milestones & Transport Status
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
                    currentStage >= 1
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span>1. Accepted</span>
                  <CheckCircle2 className="w-4 h-4 mt-1 text-emerald-600" />
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
                    currentStage === 2
                      ? 'bg-blue-100 border-blue-300 text-blue-900 animate-pulse'
                      : currentStage > 2
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span>2. En Route</span>
                  <Siren className="w-4 h-4 mt-1 text-blue-600" />
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
                    currentStage === 3
                      ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                      : currentStage > 3
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span>3. Arrived & Picked Up</span>
                  <MapPin className="w-4 h-4 mt-1" />
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center ${
                    currentStage === 4
                      ? 'bg-rose-100 border-rose-300 text-rose-900 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  <span>4. ER Transport</span>
                  <Activity className="w-4 h-4 mt-1 text-rose-600" />
                </div>
              </div>
            </div>

            {/* Driver & Paramedic Details Card */}
            <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/90 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                    {assignedDriver.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{assignedDriver.name}</span>
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-200">
                        {assignedDriver.rating} ★
                      </span>
                    </h4>
                    <p className="text-xs font-bold text-blue-600">Certified Emergency Driver</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCallDriver}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Driver</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-blue-200/80">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Vehicle Plate</span>
                  <span className="font-black text-slate-900">{assignedDriver.plate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Ambulance Unit</span>
                  <span className="font-bold text-rose-600 truncate block">{assignedDriver.unitType}</span>
                </div>
                <div className="col-span-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Paramedic</span>
                  <span className="font-bold text-slate-800">{assignedDriver.paramedic}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('REQUEST_FORM')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Change Location / Address</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Close Tracking Window
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
