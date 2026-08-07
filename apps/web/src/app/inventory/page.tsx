'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../../components/shared/AppShell';
import { StatCard } from '../../components/shared/StatCard';
import { DataTable } from '../../components/shared/DataTable';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  PharmacyItem,
  MASTER_PHARMACY_CATALOG,
} from '../../data/pharmacyCatalog';
import {
  getPharmacyInventory,
  replenishStock,
  INVENTORY_UPDATED_EVENT,
} from '../../data/pharmacyInventoryStore';
import { PharmacyPurchaseModal } from '../../components/shared/PharmacyPurchaseModal';
import {
  Pill,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Box,
  Building2,
  X,
  Sparkles,
  ShoppingBag,
  Filter,
  ShieldCheck,
  Layers,
  BarChart2,
  Check,
} from 'lucide-react';

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [inventory, setInventory] = useState<PharmacyItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const currentRole = user?.role || 'PHARMACIST';

  useEffect(() => {
    setInventory(getPharmacyInventory());

    const handleInventoryUpdate = (e: any) => {
      if (e.detail) {
        setInventory(e.detail);
      } else {
        setInventory(getPharmacyInventory());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
      return () => {
        window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
      };
    }
  }, []);

  if (!loading && !user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const handleReorderStock = (item: PharmacyItem) => {
    const updated = replenishStock(item.id, 500);
    setInventory(updated);
    showToast({
      title: 'Stock Replenished! 📦',
      message: `Added +500 units to ${item.name}. New total quantity: ${item.stock + 500} units.`,
      type: 'success',
    });
  };

  // KPI Calculations
  const totalSKUs = inventory.length;
  const totalQuantityUnits = inventory.reduce((sum, item) => sum + (item.stock > 0 ? item.stock : 0), 0);
  const lowStockItems = inventory.filter((i) => i.stock > 0 && i.stock <= 50);
  const outOfStockItems = inventory.filter((i) => i.stock <= 0);

  // Filtering Inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.batch.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const columns = [
    {
      header: 'MEDICINE NAME & BATCH SPEC',
      accessor: (row: PharmacyItem) => (
        <div className="flex flex-col max-w-[240px] sm:max-w-xs">
          <span className="font-extrabold text-slate-900 text-xs truncate" title={row.name}>{row.name}</span>
          <span className="text-[10px] text-slate-500 font-medium truncate" title={row.description}>{row.description}</span>
          <span className="text-[10px] font-mono font-bold text-amber-700 mt-0.5">
            Batch: {row.batch} • ₹{row.price} / {row.unit}
          </span>
        </div>
      ),
    },
    {
      header: 'CATEGORY',
      accessor: (row: PharmacyItem) => {
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (row.category === 'TABLET_CAPSULE') badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
        if (row.category === 'SYRUP_LIQUID') badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
        if (row.category === 'INJECTION_VACCINE') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
        if (row.category === 'SURGICAL_SUPPLY') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
        if (row.category === 'LAB_REAGENT') badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
        if (row.category === 'DIGITAL_DEVICE') badgeColor = 'bg-cyan-50 text-cyan-800 border-cyan-200';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${badgeColor}`}>
            {row.category.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'AVAILABLE QUANTITY',
      accessor: (row: PharmacyItem) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-slate-900 text-sm tabular-nums">
            {row.stock}
          </span>
          <span className="text-xs font-bold text-slate-500">{row.unit}s</span>
        </div>
      ),
    },
    {
      header: 'EXPIRY DATE',
      accessor: (row: PharmacyItem) => (
        <span className="text-slate-600 font-semibold text-xs">{row.expiry}</span>
      ),
    },
    {
      header: 'AVAILABILITY STATUS',
      accessor: (row: PharmacyItem) => {
        const isOut = row.stock <= 0;
        const isLow = row.stock > 0 && row.stock <= 50;

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              isOut
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : isLow
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {isOut ? 'OUT OF STOCK' : isLow ? `LOW STOCK (${row.stock})` : '🟢 IN STOCK'}
          </span>
        );
      },
    },
    {
      header: 'STOCK ACTIONS',
      align: 'right' as const,
      accessor: (row: PharmacyItem) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleReorderStock(row)}
            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
            title="Replenish +500 units"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reorder (+500)</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppShell userRole={currentRole}>
      <div className="space-y-8 max-w-6xl mx-auto pb-12 font-sans">
        {/* Page Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Box className="w-6 h-6 text-amber-600" />
              Pharmacy Inventory Master & Medicine Stock Search
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Real-time search engine for hospital medicines, available quantities, batch tracking, and inventory stock alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Purchase / Deduct Inventory</span>
            </button>
          </div>
        </div>

        {/* Live KPI Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Registered Medicines"
            value={`${totalSKUs} SKUs`}
            change={8.5}
            changeLabel="catalog inventory"
            icon={Pill}
          />
          <StatCard
            title="Total Available Stock Quantity"
            value={`${totalQuantityUnits.toLocaleString()} Units`}
            change={14.2}
            changeLabel="units in warehouse"
            icon={Package}
          />
          <StatCard
            title="Low Stock Alerts (<50)"
            value={`${lowStockItems.length} Items`}
            change={-2.0}
            changeLabel="requires reorder"
            icon={AlertTriangle}
          />
          <StatCard
            title="Out of Stock Alerts"
            value={`${outOfStockItems.length} Items`}
            change={0.0}
            changeLabel="restock required"
            icon={Box}
          />
        </div>

        {/* Interactive Search Bar & Category Filter Bar */}
        <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Medicine Name, Brand, Formula, Category, or Batch Number (e.g. Paracetamol, Insulin, BAT-9901)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-500 shrink-0">
              Showing <span className="text-amber-700 font-black">{filteredInventory.length}</span> matching medicines
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>

            {[
              { id: 'ALL', label: 'All Catalog' },
              { id: 'TABLET_CAPSULE', label: '💊 Tablets & Capsules' },
              { id: 'SYRUP_LIQUID', label: '🥤 Syrups & Liquids' },
              { id: 'INJECTION_VACCINE', label: '💉 Injections & Vaccines' },
              { id: 'SYRUP_DROPPER', label: '💧 Eye/Ear Droppers' },
              { id: 'SPECIALTY_MEDICINE', label: 'Specialty Medicine' },
              { id: 'SURGICAL_SUPPLY', label: '✂️ Surgical Supply' },
              { id: 'LAB_REAGENT', label: '🧪 Lab Reagent' },
              { id: 'DIGITAL_DEVICE', label: '⚡ Digital Device' },
            ].map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory Master Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              PHARMACY MEDICINE INVENTORY SEARCH RESULT ({filteredInventory.length})
            </h2>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Live Stock Audit Synchronized
            </span>
          </div>

          <DataTable
            columns={columns}
            data={filteredInventory}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredInventory.length / 10) || 1}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Pharmacy Purchase Modal Trigger */}
        <PharmacyPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          patientName="Sai Satyabrata"
        />
      </div>
    </AppShell>
  );
}
