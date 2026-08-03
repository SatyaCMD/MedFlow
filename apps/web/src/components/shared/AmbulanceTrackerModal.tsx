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
    phone: '+91 98765 xxxxx',
    plate: 'MH-02-EQ-9912',
    unitType: 'Advanced Life Support (ALS) ICU',
    paramedic: 'Paramedic Specialist Vikram (Trauma Certified)',
  },
  {
    id: 'drv-2',
    name: 'Amit Sharma',
    avatar: 'AS',
    rating: 4.85,
    phone: '+91 98123 xxxxx',
    plate: 'DL-01-AM-4421',
    unitType: 'Cardiac Care ICU Response Unit',
    paramedic: 'Paramedic Specialist Deepak Varma',
  },
  {
    id: 'drv-3',
    name: 'Suresh Patil',
    avatar: 'SP',
    rating: 4.95,
    phone: '+91 99401 xxxxx',
    plate: 'KA-03-ER-8820',
    unitType: 'Trauma & Burn ICU Ambulance',
    paramedic: 'Paramedic Specialist Ananya Rao',
  },
  {
    id: 'drv-4',
    name: 'Dharmendra Roy',
    avatar: 'DR',
    rating: 4.88,
    phone: '+91 97321 xxxxx',
    plate: 'WB-04-AB-1109',
    unitType: 'Pediatric Neonatal ICU Support',
    paramedic: 'Paramedic Specialist Pooja Chawla',
  },
  {
    id: 'drv-5',
    name: 'Vikram Malhotra',
    avatar: 'VM',
    rating: 4.9,
    phone: '+91 98992 xxxxx',
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
  initialStep?: 'REQUEST_FORM' | 'DISPATCHING' | 'LIVE_TRACKING';
}

export const AmbulanceTrackerModal: React.FC<AmbulanceTrackerModalProps> = ({
  isOpen,
  onClose,
  defaultPickupLocation = 'Badagada, Bhubaneswar',
  initialStep = 'LIVE_TRACKING',
}) => {
  const { showToast } = useToast();

  // Mode: 'REQUEST_FORM' -> 'DISPATCHING' -> 'LIVE_TRACKING'
  const [step, setStep] = useState<'REQUEST_FORM' | 'DISPATCHING' | 'LIVE_TRACKING'>(initialStep);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  // Input & Unit Selection
  const [pickupAddress, setPickupAddress] = useState(defaultPickupLocation);
  const [selectedUnitType, setSelectedUnitType] = useState('ALS');

  // Random Assigned Driver
  const [assignedDriver, setAssignedDriver] = useState<DriverProfile>(DRIVER_DATASET[0]);

  // Live Animation Tracking State: Strict 2-minute (120-second) simulation loop
  const [etaSeconds, setEtaSeconds] = useState(120); // Exactly 2 minutes countdown (120s -> 0s)
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1); // 1: Accepted, 2: Driving to Pickup, 3: Patient Picked Up, 4: Driving to ER
  const [distanceKm, setDistanceKm] = useState(2.4);
  const [vehicleSpeed, setVehicleSpeed] = useState(52);
  const [isSimulationFinished, setIsSimulationFinished] = useState(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<1 | 2 | 3>(1); // 1x vs 2x vs 3x speed multiplier

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
          const lat = Number.parseFloat(data[0].lat);
          const lon = Number.parseFloat(data[0].lon);
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
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = 'anonymous';
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
      html: `<div style="background:#0f172a; color:white; width:34px; height:34px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid white; box-shadow:0 10px 20px rgba(0,0,0,0.3); font-size:16px;">📍</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker(coords, { icon: homeIcon }).addTo(map).bindPopup(`<b>Pickup Spot</b><br/>${pickupAddress}`);

    // 2. Hospital ER Base Icon Marker (offset ~1.2 km west)
    const hospitalCoords: [number, number] = [coords[0] - 0.008, coords[1] - 0.012];
    const hospitalIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:#2563eb; color:white; width:34px; height:34px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid white; box-shadow:0 10px 20px rgba(0,0,0,0.3); font-size:16px;">🏥</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker(hospitalCoords, { icon: hospitalIcon }).addTo(map).bindPopup('<b>MediCore Emergency ER Ward</b>');

    // 3. Navigation Blue Polyline
    const polyline = L.polyline([hospitalCoords, coords], {
      color: '#dc2626',
      weight: 6,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

    // 4. Moving Ambulance Icon Marker
    const ambIcon = L.divIcon({
      className: 'custom-amb-pin',
      html: `<div style="background:#dc2626; color:white; width:38px; height:38px; borderRadius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 0 20px rgba(220,38,38,0.9); font-size:20px;">🚑</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const p = Math.max(0, Math.min(100, progressPercent)) / 100;
    const startPt = currentStage >= 3 ? coords : hospitalCoords;
    const endPt = currentStage >= 3 ? hospitalCoords : coords;

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

  // Strict 2-Minute (120-Second) Live Dispatch Simulation Loop Timer
  useEffect(() => {
    if (!isOpen || step !== 'LIVE_TRACKING' || isSimulationFinished) return;

    const intervalTimeMs = simSpeedMultiplier === 3 ? 100 : simSpeedMultiplier === 2 ? 400 : 1000;

    const interval = setInterval(() => {
      setEtaSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSimulationFinished(true);
          setCurrentStage(4);
          setProgressPercent(100);
          setDistanceKm(0.0);
          setVehicleSpeed(0);

          showToast({
            title: '🎉 Job Finished! Patient Admitted to ER',
            message: `Ambulance ${assignedDriver.plate} has successfully arrived at MediCore Hospital ER. Patient safely admitted.`,
            type: 'success',
          });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('medflow_ambulance_pickup_drop_completed', {
                detail: {
                  vehiclePlate: assignedDriver.plate,
                  driverName: assignedDriver.name,
                  timestamp: Date.now(),
                },
              })
            );
          }
          return 0;
        }

        const remaining = prev - 1;
        const elapsed = 120 - remaining;

        // Stage Transitions over the 2-Minute (120s) Loop:
        // 0s - 60s (First Minute): Phase 1 - En Route to Patient Pickup
        // 60s mark: Patient Picked Up & Loaded onto Ambulance!
        // 60s - 120s (Second Minute): Phase 2 - Patient En Route to Hospital ER Ward
        if (elapsed < 60) {
          setCurrentStage(2);
          const p1Progress = (elapsed / 60) * 100;
          setProgressPercent(p1Progress);
          const remDist = Number.parseFloat((2.4 * (1 - p1Progress / 100)).toFixed(1));
          setDistanceKm(remDist > 0 ? remDist : 0.1);
        } else if (elapsed === 60) {
          setCurrentStage(3);
          setProgressPercent(0);
          setDistanceKm(3.2);
          showToast({
            title: 'Phase 2: Patient Picked Up! Driving to ER',
            message: `Driver ${assignedDriver.name} has picked up patient at ${pickupAddress}. En route to ER Trauma Center.`,
            type: 'info',
          });
        } else {
          setCurrentStage(4);
          const p2Progress = ((elapsed - 60) / 60) * 100;
          setProgressPercent(p2Progress);
          const remDist = Number.parseFloat((3.2 * (1 - p2Progress / 100)).toFixed(1));
          setDistanceKm(remDist > 0 ? remDist : 0.1);
        }

        const randBuf = new Uint32Array(1);
        window.crypto.getRandomValues(randBuf);
        setVehicleSpeed(Math.floor(48 + (randBuf[0] % 18)));

        return remaining;
      });
    }, intervalTimeMs);

    return () => clearInterval(interval);
  }, [isOpen, step, isSimulationFinished, simSpeedMultiplier, assignedDriver, pickupAddress, showToast]);

  if (!isOpen) return null;

  const formatEta = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleRestartSimulation = () => {
    setIsSimulationFinished(false);
    setEtaSeconds(120);
    setProgressPercent(0);
    setCurrentStage(2);
    setDistanceKm(2.4);
    setVehicleSpeed(52);
    showToast({
      title: 'Restarting 2-Minute Live Map Simulation',
      message: 'Ambulance dispatch simulation restarted from 02:00 countdown.',
      type: 'info',
    });
  };

  const handleRequestAmbulanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim()) {
      showToast({ title: 'Pickup Address Required', message: 'Please enter your pickup location.', type: 'warning' });
      return;
    }

    setStep('DISPATCHING');
    const driverArray = new Uint32Array(1);
    window.crypto.getRandomValues(driverArray);
    const randomDriverIndex = driverArray[0] % DRIVER_DATASET.length;
    const selected = DRIVER_DATASET[randomDriverIndex];
    setAssignedDriver(selected);

    setTimeout(() => {
      setStep('LIVE_TRACKING');
      setIsSimulationFinished(false);
      setCurrentStage(2);
      setEtaSeconds(120);
      setProgressPercent(0);
      setDistanceKm(2.4);

      showToast({
        title: 'Emergency Ambulance Dispatched!',
        message: `Driver ${selected.name} (${selected.plate}) assigned. 2-Minute live dispatch simulation started!`,
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

  const handleFastSimulateComplete = () => {
    setIsSimulationFinished(true);
    setCurrentStage(4);
    setProgressPercent(100);
    setDistanceKm(0.0);
    setVehicleSpeed(0);
    setEtaSeconds(0);

    showToast({
      title: '⚡ Fast Simulated Pickup & Drop Completed!',
      message: `Ambulance ${assignedDriver.plate} has delivered patient to MediCore Hospital ER. Fleet updated.`,
      type: 'success',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('medflow_ambulance_pickup_drop_completed', {
          detail: {
            vehiclePlate: assignedDriver.plate,
            driverName: assignedDriver.name,
            timestamp: Date.now(),
          },
        })
      );
    }
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
              <label htmlFor="pickupAddress" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Pickup Address / Landmark</span>
              </label>
              <input
                id="pickupAddress"
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
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                Select Ambulance Response Unit
              </span>
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
          <div className="space-y-4 font-sans">
            {/* 100% UN-OBSCURED DYNAMIC MAP CONTAINER WITH BUILT-IN VECTOR & LEAFLET DUAL ENGINE */}
            <div className="relative h-72 min-h-[288px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-900 p-3 select-none flex flex-col justify-between">
              {/* Dynamic Leaflet Div Map Engine */}
              <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '100%', minHeight: '288px', position: 'absolute', inset: 0, zIndex: 0 }}
                className="rounded-3xl opacity-40"
              />

              {/* 100% RELIABLE HIGH-DEFINITION SWIGGY/UBER-STYLE ANIMATED VECTOR MAP CANVAS */}
              <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden rounded-3xl">
                <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="none">
                  <defs>
                    <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapType === 'SATELLITE' ? 'rgba(51,65,85,0.4)' : 'rgba(203,213,225,0.4)'} strokeWidth="1" />
                    </pattern>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  {/* Map Background */}
                  <rect width="100%" height="100%" fill={mapType === 'SATELLITE' ? '#0b1120' : '#f8fafc'} />
                  <rect width="100%" height="100%" fill="url(#streetGrid)" />

                  {/* Simulated City Building Blocks */}
                  <rect x="50" y="25" width="80" height="55" rx="8" fill={mapType === 'SATELLITE' ? '#1e293b' : '#e2e8f0'} opacity="0.8" />
                  <rect x="170" y="15" width="120" height="60" rx="8" fill={mapType === 'SATELLITE' ? '#1e293b' : '#e2e8f0'} opacity="0.8" />
                  <rect x="330" y="25" width="90" height="50" rx="8" fill={mapType === 'SATELLITE' ? '#1e293b' : '#e2e8f0'} opacity="0.8" />
                  <rect x="460" y="115" width="90" height="65" rx="8" fill={mapType === 'SATELLITE' ? '#1e293b' : '#e2e8f0'} opacity="0.8" />
                  <rect x="210" y="165" width="110" height="75" rx="8" fill={mapType === 'SATELLITE' ? '#1e293b' : '#e2e8f0'} opacity="0.8" />

                  {/* River Curve */}
                  <path d="M 0 240 Q 200 200 400 260 T 600 230" fill="none" stroke={mapType === 'SATELLITE' ? '#0284c7' : '#38bdf8'} strokeWidth="18" opacity="0.35" />

                  {/* Main Road Layout */}
                  <path d="M 80 180 C 180 180, 240 100, 320 100 C 400 100, 440 140, 520 80" fill="none" stroke={mapType === 'SATELLITE' ? '#334155' : '#cbd5e1'} strokeWidth="18" strokeLinecap="round" />
                  <path d="M 80 180 C 180 180, 240 100, 320 100 C 400 100, 440 140, 520 80" fill="none" stroke={mapType === 'SATELLITE' ? '#475569' : '#ffffff'} strokeWidth="12" strokeLinecap="round" />

                  {/* Glowing Animated Swiggy/Uber-Style Route Polyline */}
                  <path
                    d="M 80 180 C 180 180, 240 100, 320 100 C 400 100, 440 140, 520 80"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="6"
                    strokeDasharray="10 6"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />

                  {/* Street Labels */}
                  <text x="130" y="202" fill={mapType === 'SATELLITE' ? '#94a3b8' : '#64748b'} fontSize="10" fontWeight="800">MediCore ER Blvd</text>
                  <text x="300" y="85" fill={mapType === 'SATELLITE' ? '#94a3b8' : '#64748b'} fontSize="10" fontWeight="800">Ring Road Express</text>
                  <text x="430" y="65" fill={mapType === 'SATELLITE' ? '#fb7185' : '#e11d48'} fontSize="10" fontWeight="800">Green Park Ave</text>

                  {/* 📍 PATIENT PICKUP LOCATION PIN (x: 520, y: 80) */}
                  <g transform="translate(520, 80)">
                    <circle r="18" fill="#f43f5e" opacity="0.3">
                      <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="9" fill="#f43f5e" stroke="#ffffff" strokeWidth="2.5" />
                    <text x="14" y="4" fill={mapType === 'SATELLITE' ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="900">📍 PATIENT PICKUP</text>
                  </g>

                  {/* 🏥 MEDICORE ER HOSPITAL WARD PIN (x: 80, y: 180) */}
                  <g transform="translate(80, 180)">
                    <circle r="18" fill="#2563eb" opacity="0.3">
                      <animate attributeName="r" values="10;28;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                    <text x="-95" y="24" fill={mapType === 'SATELLITE' ? '#38bdf8' : '#1d4ed8'} fontSize="11" fontWeight="900">🏥 MediCore ER Ward</text>
                  </g>

                  {/* 🚑 ANIMATED MOVING AMBULANCE MARKER */}
                  {(() => {
                    const p = Math.max(0, Math.min(100, progressPercent)) / 100;
                    const startX = currentStage >= 3 ? 520 : 80;
                    const startY = currentStage >= 3 ? 80 : 180;
                    const endX = currentStage >= 3 ? 80 : 520;
                    const endY = currentStage >= 3 ? 180 : 80;
                    const ctrlX = 300;
                    const ctrlY = 90;

                    const currX = (1 - p) * (1 - p) * startX + 2 * (1 - p) * p * ctrlX + p * p * endX;
                    const currY = (1 - p) * (1 - p) * startY + 2 * (1 - p) * p * ctrlY + p * p * endY;

                    return (
                      <g transform={`translate(${currX}, ${currY})`}>
                        <circle r="22" fill="#dc2626" opacity="0.35">
                          <animate attributeName="r" values="14;30;14" dur="1s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1s" repeatCount="indefinite" />
                        </circle>
                        <circle r="16" fill="#dc2626" stroke="#ffffff" strokeWidth="3" />
                        <text x="-9" y="5" fill="#ffffff" fontSize="14">🚑</text>

                        {/* Floating Speed Telemetry Pill above Ambulance */}
                        <g transform="translate(0, -28)">
                          <rect x="-36" y="-12" width="72" height="18" rx="9" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" />
                          <text x="0" y="0" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="900">
                            {vehicleSpeed > 0 ? `${vehicleSpeed} km/h` : 'STATIONARY'}
                          </text>
                        </g>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Floating Top Status Header */}
              <div className="relative z-10 flex items-center justify-between pointer-events-auto flex-wrap gap-2">
                <span
                  className={`px-3.5 py-1 text-white font-black text-[11px] rounded-full shadow-lg flex items-center gap-1.5 ${
                    isSimulationFinished
                      ? 'bg-emerald-600'
                      : currentStage >= 3
                      ? 'bg-blue-600 animate-pulse'
                      : 'bg-rose-600 animate-pulse'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>
                    {isSimulationFinished
                      ? '✅ JOB COMPLETED — PATIENT ADMITTED TO ER'
                      : currentStage >= 3
                      ? '🔵 PHASE 2: PATIENT ON BOARD — EN ROUTE TO ER'
                      : '🔴 PHASE 1: DISPATCHED — EN ROUTE TO PICKUP'}
                  </span>
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Speed Multiplier (1x, 2x, 3x Turbo) */}
                  <button
                    type="button"
                    onClick={() => setSimSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
                    className={`px-2.5 py-1 text-xs font-black rounded-xl border shadow-md flex items-center gap-1 cursor-pointer transition-all ${
                      simSpeedMultiplier === 3
                        ? 'bg-rose-500 text-white border-rose-400 font-black animate-pulse shadow-rose-500/40'
                        : simSpeedMultiplier === 2
                        ? 'bg-amber-400 text-slate-900 border-amber-500 font-black'
                        : 'bg-slate-800/90 text-slate-200 border-slate-700'
                    }`}
                    title="Toggle Speed Multiplier (1x, 2x, 3x Turbo Mode)"
                  >
                    <span>⚡ {simSpeedMultiplier}x Speed</span>
                  </button>

                  {/* Fast Simulated Pickup & Drop Button */}
                  {!isSimulationFinished && (
                    <button
                      type="button"
                      onClick={handleFastSimulateComplete}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                      title="Instant Fast-Forward Simulated Pickup & ER Drop"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fast Complete Trip</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setMapType(mapType === 'STREET' ? 'SATELLITE' : 'STREET')}
                    className="px-3 py-1 bg-white/95 hover:bg-white text-slate-800 font-extrabold text-xs rounded-xl border border-slate-300 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mapType === 'STREET' ? 'Satellite View' : 'Street Map'}</span>
                  </button>

                  <span className="px-3 py-1 bg-slate-900/90 border border-slate-700 text-emerald-400 font-black text-xs rounded-full font-mono shadow-md">
                    2-MIN LOOP: {formatEta(etaSeconds)}
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

            {/* 2-MINUTE JOB COMPLETED NOTIFICATION BANNER */}
            {isSimulationFinished && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-lg shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-emerald-950">2-Minute Dispatch Mission Completed!</h4>
                    <p className="text-xs text-emerald-800 font-medium">
                      Ambulance <strong>{assignedDriver.plate}</strong> delivered patient to ER Trauma Bed #04 in exactly 2 minutes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRestartSimulation}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-Run 2-Min Live Simulation</span>
                </button>
              </div>
            )}

            {/* ACTIVE NAVIGATION ROUTE & TELEMETRY BAR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-white shadow-xl">
              <div className="flex items-center gap-3 truncate">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Live Swiggy / Uber Simulation Path</span>
                  <span className="font-extrabold text-white text-xs truncate block mt-0.5">
                    {currentStage >= 3
                      ? `${pickupAddress} ➔ MediCore Emergency ER`
                      : `MediCore ER Base ➔ ${pickupAddress}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Distance Remaining</span>
                  <span className="font-mono font-black text-amber-400 text-xs">{distanceKm} km</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">GPS Live Speed</span>
                  <span className="font-mono font-black text-emerald-400 text-xs">{vehicleSpeed} km/h</span>
                </div>
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
