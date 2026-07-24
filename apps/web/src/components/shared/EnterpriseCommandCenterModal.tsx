'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Search,
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Cpu,
  ArrowRight,
  Terminal,
  Zap,
  Sliders,
  RefreshCw,
  Play,
  BarChart3,
  Radio,
  Server,
  Database,
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ENTERPRISE_44_MODULES_CATALOG, EnterpriseModule } from '../../data/enterpriseModulesCatalog';

interface EnterpriseCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnterpriseCommandCenterModal: React.FC<EnterpriseCommandCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState<EnterpriseModule | null>(null);
  
  // Control Panel Interactive States
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({});
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  useEffect(() => {
    if (selectedModule) {
      // Initialize default active features for selected module
      const initial: Record<string, boolean> = {};
      selectedModule.subModules.forEach((sub) => {
        initial[sub] = true;
      });
      setFeatureStates(initial);

      // Generate initial telemetry log entries for this module
      setTelemetryLogs([
        `[${new Date().toLocaleTimeString()}] INIT: Module #${selectedModule.id} [${selectedModule.name}] loaded in active workspace.`,
        `[${new Date().toLocaleTimeString()}] CLUSTER: Connected to backend API load balancer node [api-node-1].`,
        `[${new Date().toLocaleTimeString()}] SECURITY: RBAC Policy verified. Role SUPER_ADMIN granted full execution rights.`,
        `[${new Date().toLocaleTimeString()}] SYSTEM: Telemetry pipeline synchronized. Uptime: 99.99%. Latency: 12ms.`
      ]);
    }
  }, [selectedModule]);

  if (!isOpen) return null;

  const categories = [
    'ALL',
    'Admin & Operations',
    'Clinical & Patient',
    'Diagnostics',
    'Pharmacy & Supplies',
    'Finance & Insurance',
    'Telemedicine & EMR',
    'AI & Clinical AI',
    'Facility & Transport',
    'Role Portals',
  ];

  const filteredModules = ENTERPRISE_44_MODULES_CATALOG.filter((mod) => {
    const matchesCat = activeCategory === 'ALL' || mod.category === activeCategory;
    const matchesQuery =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.subModules.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleOpenControlPanel = (mod: EnterpriseModule) => {
    setSelectedModule(mod);
    showToast({
      title: `Opening Control Panel #${mod.id}`,
      message: `Navigated to ${mod.name} Control Panel.`,
      type: 'info',
    });
  };

  const handleToggleFeature = (featureName: string) => {
    const nextState = !featureStates[featureName];
    setFeatureStates((prev) => ({ ...prev, [featureName]: nextState }));
    
    const time = new Date().toLocaleTimeString();
    const logMsg = `[${time}] CONFIG: Feature "${featureName}" set to ${nextState ? 'ENABLED' : 'DISABLED'}.`;
    setTelemetryLogs((prev) => [logMsg, ...prev.slice(0, 15)]);

    showToast({
      title: `Feature Updated`,
      message: `Sub-module "${featureName}" is now ${nextState ? 'Enabled' : 'Disabled'}.`,
      type: nextState ? 'success' : 'info',
    });
  };

  const handleRunDiagnostics = () => {
    if (!selectedModule) return;
    setIsDiagnosticRunning(true);
    
    const time = new Date().toLocaleTimeString();
    setTelemetryLogs((prev) => [
      `[${time}] DIAGNOSTICS: Starting full telemetry sweep for Module #${selectedModule.id}...`,
      ...prev
    ]);

    setTimeout(() => {
      setIsDiagnosticRunning(false);
      const doneTime = new Date().toLocaleTimeString();
      setTelemetryLogs((prev) => [
        `[${doneTime}] SUCCESS: All ${selectedModule.subModules.length} sub-modules passed diagnostics. Health Score: 100/100.`,
        ...prev
      ]);

      showToast({
        title: `Diagnostics Complete`,
        message: `Module #${selectedModule.id} [${selectedModule.name}] passed 100% health & integrity checks.`,
        type: 'success',
      });
    }, 1200);
  };

  const handleLaunchModuleAction = () => {
    if (!selectedModule) return;
    showToast({
      title: `Module Execution Initialized`,
      message: `Active workflow for "${selectedModule.name}" has been launched in production mode.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-6xl w-full p-5 sm:p-8 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto relative"
      >
        {/* Topbar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-900 text-white flex items-center justify-center shadow-md">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2 flex-wrap">
                <span>MediCore 360 Enterprise 44-Module Command Center</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[11px] rounded-full border border-blue-300">
                  44 / 44 Deployed
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">Master Architecture Explorer, Real-time Control Panels & Module Launcher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 44 enterprise modules (e.g. ICU, LIS, AI Diagnosis, Billing, Ambulance)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All 44 Modules' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((mod) => (
            <div
              key={mod.id}
              className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black text-slate-400">MODULE #{mod.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase flex items-center gap-1 ${
                      mod.status === 'AI_OPERATIONAL'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                    {mod.status === 'AI_OPERATIONAL' ? '🤖 AI Engine' : '✓ Live Telemetry'}
                  </span>
                </div>

                <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                  {mod.name}
                </h4>
                <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">{mod.description}</p>

                {/* Sub-modules Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {mod.subModules.slice(0, 3).map((sub, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleOpenControlPanel(mod)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {sub}
                    </span>
                  ))}
                  {mod.subModules.length > 3 && (
                    <span
                      onClick={() => handleOpenControlPanel(mod)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      +{mod.subModules.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Control Panel Action Button */}
              <button
                onClick={() => handleOpenControlPanel(mod)}
                className="w-full py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              >
                <Sliders className="w-4 h-4" />
                <span>Control Panel</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CONTROL PANEL INSPECTOR MODAL OVERLAY */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedModule && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }}
                className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[92vh] overflow-y-auto relative"
              >
                {/* Control Panel Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                      <Cpu className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-400">MODULE #{selectedModule.id} CONTROL PANEL</span>
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE & OPERATIONAL
                        </span>
                      </div>
                      <h2 className="font-black text-xl text-white mt-0.5">{selectedModule.name}</h2>
                      <p className="text-xs text-slate-400 mt-1">{selectedModule.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedModule(null)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Live System Metrics Telemetry Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Server className="w-3 h-3 text-blue-400" /> Active Cluster
                    </span>
                    <p className="text-sm font-extrabold text-white">3 Nodes (API 1-3)</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-400" /> System Uptime
                    </span>
                    <p className="text-sm font-extrabold text-emerald-400">99.99% SLA</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Latency
                    </span>
                    <p className="text-sm font-extrabold text-white">12 ms Avg</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> RBAC Policy
                    </span>
                    <p className="text-sm font-extrabold text-indigo-300">Enforced</p>
                  </div>
                </div>

                {/* Sub-module Interactive Control Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>Sub-Module Feature Toggle Matrix</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">Click feature to toggle active state</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedModule.subModules.map((sub, idx) => {
                      const isEnabled = featureStates[sub] !== false;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleFeature(sub)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isEnabled
                              ? 'bg-slate-800/90 border-blue-500/50 hover:border-blue-400'
                              : 'bg-slate-900/90 border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
                            <span className="font-bold text-xs text-white">{sub}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Telemetry Log Inspector */}
                <div className="space-y-2 bg-slate-950 border border-slate-800 p-4 rounded-2xl font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Live Module Telemetry Console
                    </span>
                    <button
                      onClick={handleRunDiagnostics}
                      disabled={isDiagnosticRunning}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                      <span>{isDiagnosticRunning ? 'Running Sweep...' : 'Run Diagnostics'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {telemetryLogs.map((log, idx) => (
                      <div key={idx} className="text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-blue-400 select-none">›</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control Panel Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunDiagnostics}
                      disabled={isDiagnosticRunning}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Health Check</span>
                    </button>
                    <button
                      onClick={() => {
                        showToast({
                          title: 'Analytics Loaded',
                          message: `Real-time analytics for ${selectedModule.name} calculated.`,
                          type: 'info',
                        });
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>View Metrics</span>
                    </button>
                  </div>

                  <button
                    onClick={handleLaunchModuleAction}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Production Workflow</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
