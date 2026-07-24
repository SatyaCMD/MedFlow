'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard } from '../shared/StatCard';
import { DataTable } from '../shared/DataTable';
import { useToast } from '../../context/ToastContext';
import {
  getPharmacySales,
  savePharmacySale,
  PharmacySaleRecord,
} from '../../data/medicalHistoryStore';
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
  History,
  Receipt,
  ShoppingBag,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [salesSearchQuery, setSalesSearchQuery] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('MEDICINE');
  const [newItemStock, setNewItemStock] = useState('250');
  const [newItemBatch, setNewItemBatch] = useState('BAT-99210');
  const [newItemExpiry, setNewItemExpiry] = useState('2028-12-31');

  // Sales Records
  const [salesRecords, setSalesRecords] = useState<PharmacySaleRecord[]>([]);

  // Inventory Data
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Amoxicillin 500mg Capsules', category: 'Medicine', batch: 'BAT-88912', stock: 450, unit: 'Capsules', expiry: 'Nov 2027', status: 'In Stock' },
    { id: '2', name: 'Amlodipine Besylate 5mg', category: 'Medicine', batch: 'BAT-77210', stock: 320, unit: 'Tablets', expiry: 'Jan 2028', status: 'In Stock' },
    { id: '3', name: 'Sterile Surgical Gloves (Size 7.5)', category: 'Hospital Consumable', batch: 'SUP-44120', stock: 24, unit: 'Pairs', expiry: 'Aug 2026', status: 'Low Stock Alert (<50)' },
    { id: '4', name: 'IV Saline Normal 0.9% (500ml)', category: 'Hospital Consumable', batch: 'SUP-99102', stock: 180, unit: 'Bags', expiry: 'May 2027', status: 'In Stock' },
    { id: '5', name: 'Single-Use Syringes 5ml', category: 'Hospital Consumable', batch: 'SUP-11204', stock: 18, unit: 'Units', expiry: 'Dec 2026', status: 'Low Stock Alert (<50)' },
  ]);

  useEffect(() => {
    setSalesRecords(getPharmacySales());
  }, [isSalesHistoryOpen]);

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      category: newItemCategory === 'MEDICINE' ? 'Medicine' : 'Hospital Consumable',
      batch: newItemBatch,
      stock: parseInt(newItemStock, 10),
      unit: 'Units',
      expiry: newItemExpiry,
      status: parseInt(newItemStock, 10) < 50 ? 'Low Stock Alert (<50)' : 'In Stock',
    };
    setInventory([newItem, ...inventory]);
    setIsAddItemModalOpen(false);
    showToast({
      title: 'Inventory Item Added!',
      message: `Registered ${newItem.name} (Batch: ${newItem.batch}) into Pharmacy Master Stock.`,
      type: 'success',
    });
  };

  const handleReorder = (item: any) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock + 500, status: 'In Stock' } : i))
    );
    showToast({
      title: 'Stock Reorder Dispatched!',
      message: `Added +500 units to ${item.name} inventory.`,
      type: 'success',
    });
  };

  // Filter Sales Records
  const filteredSales = salesRecords.filter((s) => {
    if (!salesSearchQuery) return true;
    const q = salesSearchQuery.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.invoiceNo.toLowerCase().includes(q) ||
      s.date.toLowerCase().includes(q) ||
      s.items.some((i) => i.medicineName.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'Item Description',
      accessor: (row: typeof inventory[0]) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.name}</span>
          <span className="text-[10px] font-bold text-amber-600">Batch: {row.batch}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row: typeof inventory[0]) => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Current Stock Level',
      accessor: (row: typeof inventory[0]) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.stock} {row.unit}
        </span>
      ),
    },
    { header: 'Expiration Date', accessor: (row: typeof inventory[0]) => <span className="text-slate-600 font-semibold">{row.expiry}</span> },
    {
      header: 'Stock Status',
      accessor: (row: typeof inventory[0]) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
            row.status.includes('Low')
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Manager Actions',
      accessor: (row: typeof inventory[0]) => (
        <button
          onClick={() => handleReorder(row)}
          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reorder Stock</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-amber-600" />
            Hospital Pharmacy & Inventory Management Center
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Manage medicine stocks, hospital consumable supplies, batch numbers, and sales audit history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSalesHistoryOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Dispensary & Sales Audit History</span>
          </button>

          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Stock Items" value="1,240 SKUs" change={4.5} changeLabel="active inventory" icon={Package} />
        <StatCard title="Low Stock Alerts (<50)" value="2 Items" change={-1.0} changeLabel="reorder required" icon={AlertTriangle} />
        <StatCard title="Prescriptions Fulfilled" value={`${salesRecords.length} Sales`} change={12.0} changeLabel="100% verified" icon={CheckCircle2} />
        <StatCard title="Hospital Consumables" value="840 Units" change={0.0} changeLabel="syringes & IV saline" icon={Box} />
      </div>

      {/* Main Inventory Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-amber-600" /> Pharmacy & Hospital Supplies Inventory Master
          </h2>
          <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Automated Reorder Engine Active
          </span>
        </div>

        <DataTable
          columns={columns}
          data={inventory}
          currentPage={currentPage}
          totalPages={1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Dispensary & Sales Audit History Modal */}
      <AnimatePresence>
        {isSalesHistoryOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Dispensary & Sales Audit History Vault</h3>
                    <p className="text-xs font-semibold text-slate-500">Track date, time, customer/hospital department, items sold, and payment status</p>
                  </div>
                </div>
                <button onClick={() => setIsSalesHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={salesSearchQuery}
                  onChange={(e) => setSalesSearchQuery(e.target.value)}
                  placeholder="Search sales history by Invoice #, Patient Name, Hospital Ward, Medicine..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{sale.customerName}</span>
                        <span className="text-[11px] font-bold text-amber-700 block">Invoice #{sale.invoiceNo} • {sale.type === 'PATIENT_DISPENSARY' ? 'Patient Prescription Sale' : 'Hospital Ward Stock Dispense'}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base text-slate-900 block">₹{sale.totalAmount}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">{sale.date} ({sale.paymentMethod})</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">DISPENSED ITEMS AUDIT</span>
                      {sale.items?.map((it, idx) => (
                        <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900">{it.medicineName} (Qty: {it.qty})</span>
                          <span className="text-amber-700">₹{it.unitPrice} / unit = ₹{it.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold flex items-center justify-between pt-1">
                      <span>Dispensed By: {sale.dispensedBy}</span>
                      <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Audit Verified</span>
                    </div>
                  </div>
                ))}

                {filteredSales.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
                    No pharmacy sales records found matching "{salesSearchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW INVENTORY ITEM MODAL */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Add Stock to Pharmacy Inventory</h3>
                    <p className="text-xs font-semibold text-slate-500">Register new medicine or hospital consumable item</p>
                  </div>
                </div>
                <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Item Name & Specification
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg, Sterile Gloves"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Category
                    </label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="MEDICINE">Prescription Medicine</option>
                      <option value="CONSUMABLE">Hospital Consumable Supply</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Initial Quantity Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Batch Code Number
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemBatch}
                      onChange={(e) => setNewItemBatch(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsAddItemModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                    <Sparkles className="w-4 h-4" />
                    <span>Save Item to Inventory</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
