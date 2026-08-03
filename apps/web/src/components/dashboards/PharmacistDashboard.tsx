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
  getClinicalRecords,
  ClinicalRecord,
} from '../../data/medicalHistoryStore';
import { PrescriptionPdfModal, PrescriptionData } from '../shared/PrescriptionPdfModal';
import {
  PharmacyItem,
} from '../../data/pharmacyCatalog';
import {
  getPharmacyInventory,
  replenishStock,
  addPharmacyItemToInventory,
  INVENTORY_UPDATED_EVENT,
} from '../../data/pharmacyInventoryStore';
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
  ShieldCheck,
  Syringe,
  FlaskConical,
  FileText,
} from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isSalesHistoryOpen, setIsSalesHistoryOpen] = useState(false);
  const [salesSearchQuery, setSalesSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // New Stock Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<any>('TABLET_CAPSULE');
  const [newItemPrice, setNewItemPrice] = useState('120');
  const [newItemUnit, setNewItemUnit] = useState('Strip');
  const [newItemStock, setNewItemStock] = useState('250');
  const [newItemBatch, setNewItemBatch] = useState('BAT-99210');
  const [newItemExpiry, setNewItemExpiry] = useState('Dec 2028');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Sales Records
  const [salesRecords, setSalesRecords] = useState<PharmacySaleRecord[]>([]);

  // Reactive Pharmacy Inventory Data
  const [inventory, setInventory] = useState<PharmacyItem[]>([]);

  // Doctor-Issued Clinical Prescriptions Stream
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [selectedRxData, setSelectedRxData] = useState<PrescriptionData | undefined>(undefined);
  const [isRxPdfOpen, setIsRxPdfOpen] = useState(false);

  useEffect(() => {
    setClinicalRecords(getClinicalRecords());

    const handleClinicalUpdate = () => {
      setClinicalRecords(getClinicalRecords());
    };

    window.addEventListener('medflow-clinical-records-updated', handleClinicalUpdate);
    return () => {
      window.removeEventListener('medflow-clinical-records-updated', handleClinicalUpdate);
    };
  }, []);

  // Synchronize inventory with pharmacyInventoryStore & custom window events
  useEffect(() => {
    setInventory(getPharmacyInventory());
    setSalesRecords(getPharmacySales());

    const handleInventoryUpdate = (e: any) => {
      if (e.detail) {
        setInventory(e.detail);
      } else {
        setInventory(getPharmacyInventory());
      }
      setSalesRecords(getPharmacySales());
    };

    window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
    return () => {
      window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
    };
  }, []);

  useEffect(() => {
    if (isSalesHistoryOpen) {
      setSalesRecords(getPharmacySales());
    }
  }, [isSalesHistoryOpen]);

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PharmacyItem = {
      id: `pharm-custom-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      price: Number.parseFloat(newItemPrice) || 100,
      unit: newItemUnit || 'Unit',
      batch: newItemBatch,
      stock: Number.parseInt(newItemStock, 10) || 100,
      expiry: newItemExpiry || 'Dec 2028',
      description: newItemDesc || 'Newly registered inventory item',
    };

    const updated = addPharmacyItemToInventory(newItem);
    setInventory(updated);
    setIsAddItemModalOpen(false);
    showToast({
      title: 'Inventory Item Added!',
      message: `Registered ${newItem.name} (Batch: ${newItem.batch}, Stock: ${newItem.stock}) into Central Pharmacy Inventory.`,
      type: 'success',
    });
  };

  const handleReorder = (item: PharmacyItem) => {
    const updated = replenishStock(item.id, 500);
    setInventory(updated);
    showToast({
      title: 'Stock Reordered & Replenished! 📦',
      message: `Added +500 units to ${item.name} (New Stock: ${item.stock + 500}).`,
      type: 'success',
    });
  };

  // KPI Calculations
  const lowStockItems = inventory.filter((i) => i.stock <= 50);
  const outOfStockItems = inventory.filter((i) => i.stock <= 0);
  const totalSKUs = inventory.length;

  // Filter Inventory Data
  const filteredInventory = inventory.filter((item) => {
    if (!inventorySearchQuery) return true;
    const q = inventorySearchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.batch.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  // Filter Sales Records
  const filteredSales = salesRecords.filter((s) => {
    if (!salesSearchQuery) return true;
    const q = salesSearchQuery.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      s.invoiceNo.toLowerCase().includes(q) ||
      s.date.toLowerCase().includes(q) ||
      (s.dispensedBy && s.dispensedBy.toLowerCase().includes(q)) ||
      s.items.some((i) => i.medicineName.toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'Item Description & Batch',
      accessor: (row: PharmacyItem) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.name}</span>
          <span className="text-[10px] font-bold text-amber-700">Batch: {row.batch} • Unit Price: ₹{row.price}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row: PharmacyItem) => {
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
        if (row.category === 'TABLET_CAPSULE') badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
        if (row.category === 'SYRUP_LIQUID') badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
        if (row.category === 'INJECTION_VACCINE') badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
        if (row.category === 'SURGICAL_SUPPLY') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
        if (row.category === 'LAB_REAGENT') badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor}`}>
            {row.category.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Stock Level',
      accessor: (row: PharmacyItem) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.stock} {row.unit}
        </span>
      ),
    },
    { header: 'Expiry Date', accessor: (row: PharmacyItem) => <span className="text-slate-600 font-semibold text-xs">{row.expiry}</span> },
    {
      header: 'Inventory Status',
      accessor: (row: PharmacyItem) => {
        const isOut = row.stock <= 0;
        const isLow = row.stock > 0 && row.stock <= 50;

        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              isOut
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : isLow
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}
          >
            {isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK ALERT (<50)' : 'IN STOCK'}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: PharmacyItem) => (
        <button
          onClick={() => handleReorder(row)}
          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reorder (+500)</span>
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
            Real-time stock deduction for Patients, Nurses, Caregivers, & Lab Tech purchases with sales audit vault.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsSalesHistoryOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Dispensary & Sales Audit History</span>
          </button>

          <button
            onClick={() => {
              const newSale: PharmacySaleRecord = {
                id: `ps-${Date.now()}`,
                invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                timestamp: Date.now(),
                customerName: 'Sarah Connor (MC-1001)',
                mrn: 'MC-1001',
                type: 'PATIENT_DISPENSARY',
                items: [
                  { medicineName: 'Paracetamol 650mg Tablets', qty: 2, unitPrice: 35, total: 70 },
                  { medicineName: 'Amoxicillin 625mg Antibiotic', qty: 1, unitPrice: 210, total: 210 },
                ],
                totalAmount: 280,
                paymentMethod: 'Credit Card (Paid)',
                dispensedBy: 'Pharmacist Dispensary (PHARMACIST)',
              };
              savePharmacySale(newSale);
              setSalesRecords(getPharmacySales());
              showToast({
                title: 'Prescription Dispensed & Billed! 💊',
                message: `Generated GST Dispensary Invoice #${newSale.invoiceNo} for ${newSale.customerName}.`,
                type: 'success',
              });
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Dispense & Bill Patient</span>
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
        <StatCard title="Total Inventory SKUs" value={`${totalSKUs} SKUs`} change={5.2} changeLabel="active catalog" icon={Package} />
        <StatCard title="Low Stock Alerts (<50)" value={`${lowStockItems.length} Items`} change={-1.0} changeLabel="reorder required" icon={AlertTriangle} />
        <StatCard title="Dispensary Sales Fulfilled" value={`${salesRecords.length} Sales`} change={14.0} changeLabel="audit verified" icon={CheckCircle2} />
        <StatCard title="Out of Stock Alerts" value={`${outOfStockItems.length} Items`} change={0.0} changeLabel="requires restocking" icon={Box} />
      </div>

      {/* LIVE DOCTOR-ISSUED PRESCRIPTIONS QUEUE FOR PHARMACIST */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-amber-600 animate-bounce" />
              Live Doctor-Issued Prescriptions Stream ({clinicalRecords.length} Received)
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Prescriptions signed by attending doctors automatically synced live to the pharmacy queue
            </p>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-black rounded-full uppercase">
            🟢 LIVE DOCTOR SYNCHRONIZATION ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinicalRecords.slice(0, 4).map((rec) => (
            <div key={rec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="font-mono font-black text-amber-700 block text-xs">{rec.rxNumber}</span>
                  <span className="font-black text-slate-900 block text-sm">{rec.patientName} ({rec.mrn})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-500 block">{rec.date}</span>
                  <span className="text-blue-700 font-bold block text-[11px]">{rec.doctorName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis & Prescribed Dosage</span>
                <p className="font-semibold text-slate-800 text-xs truncate" title={rec.diagnosis}>{rec.diagnosis}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.medications.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-700">
                      💊 {m.name} ({m.dosage})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const rxData: PrescriptionData = {
                      rxNumber: rec.rxNumber,
                      patientName: rec.patientName,
                      mrn: rec.mrn,
                      age: '32 Yrs',
                      gender: 'Female',
                      bloodGroup: 'O+',
                      doctorName: rec.doctorName,
                      department: rec.department,
                      date: rec.date,
                      diagnosis: rec.diagnosis,
                      medications: rec.medications,
                      labTests: rec.labTests?.map((t) => ({
                        name: t.name,
                        category: t.category || 'Pathology',
                        specimen: t.specimen || 'Blood Specimen',
                        instructions: t.instructions || 'Standard Protocol',
                      })),
                      signatureHash: rec.signatureHash,
                    };
                    setSelectedRxData(rxData);
                    setIsRxPdfOpen(true);
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Prescription PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newSale: PharmacySaleRecord = {
                      id: `ps-${Date.now()}`,
                      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                      date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                      timestamp: Date.now(),
                      customerName: `${rec.patientName} (${rec.mrn})`,
                      mrn: rec.mrn,
                      type: 'PATIENT_DISPENSARY',
                      items: rec.medications.map((m) => ({
                        medicineName: m.name,
                        qty: 1,
                        unitPrice: 150,
                        total: 150,
                      })),
                      totalAmount: rec.medications.length * 150,
                      paymentMethod: 'Pharmacy Credit (Paid)',
                      dispensedBy: 'Pharmacist Dispensary (PHARMACIST)',
                    };
                    savePharmacySale(newSale);
                    setSalesRecords(getPharmacySales());
                    showToast({
                      title: 'Prescription Dispensed & Billed! 💊',
                      message: `Generated GST Invoice #${newSale.invoiceNo} for ${rec.patientName}. Inventory stock deducted.`,
                      type: 'success',
                    });
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Dispense & Bill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Box className="w-4 h-4 text-amber-600" /> Central Pharmacy & Consumables Master Inventory
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={inventorySearchQuery}
              onChange={(e) => setInventorySearchQuery(e.target.value)}
              placeholder="Filter inventory table..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredInventory}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredInventory.length / 10) || 1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Dispensary & Sales Audit History Vault Modal */}
      <AnimatePresence>
        {isSalesHistoryOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Dispensary & Sales Audit History Vault</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Audit history of purchases made by Patients, Nurses, Caregivers, Lab Techs, and Pharmacists
                    </p>
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
                  placeholder="Search sales audit history by Invoice #, Patient Name, Purchaser Role..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <div key={sale.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                      <div>
                        <span className="font-black text-slate-900 text-sm block">{sale.customerName}</span>
                        <span className="text-[11px] font-bold text-amber-700 block">
                          Invoice #{sale.invoiceNo} • {sale.type === 'PATIENT_DISPENSARY' ? 'Patient Prescription Sale' : 'Hospital Ward / Lab Stock Dispense'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-base text-slate-900 block">₹{sale.totalAmount}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">{sale.date} ({sale.paymentMethod})</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">DISPENSED & DEDUCTED ITEMS AUDIT</span>
                      {sale.items?.map((it, idx) => (
                        <div key={idx} className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-900">{it.medicineName} (Qty: {it.qty})</span>
                          <span className="text-amber-700">₹{it.unitPrice} / unit = ₹{it.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between pt-1">
                      <span>Purchaser / Dispensed By: <strong className="text-slate-900">{sale.dispensedBy}</strong></span>
                      <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Audit Verified & Stock Deducted</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
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
                    <p className="text-xs font-semibold text-slate-500">Register new medicine, tablet, syrup, injection or reagent</p>
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
                    placeholder="e.g. Paracetamol 650mg, Insulin Pen, Blood Grouping Kit"
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
                      <option value="TABLET_CAPSULE">💊 Tablets & Capsules</option>
                      <option value="SYRUP_LIQUID">🥤 Syrups & Liquids</option>
                      <option value="INJECTION_VACCINE">💉 Injections & Vaccines</option>
                      <option value="SYRUP_DROPPER">💧 Eye/Ear Droppers</option>
                      <option value="SPECIALTY_MEDICINE">Specialty Medicine</option>
                      <option value="SURGICAL_SUPPLY">✂️ Surgical Supply</option>
                      <option value="LAB_REAGENT">🧪 Lab Reagent</option>
                      <option value="DIGITAL_DEVICE">⚡ Digital Device</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Unit Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Initial Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Unit Packaging
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      placeholder="Strip, Bottle, Vial, Kit"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Batch Code
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
                      type="text"
                      required
                      value={newItemExpiry}
                      onChange={(e) => setNewItemExpiry(e.target.value)}
                      placeholder="Dec 2028"
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

      {/* Official Doctor Prescription PDF Viewer Modal */}
      <PrescriptionPdfModal
        isOpen={isRxPdfOpen}
        onClose={() => setIsRxPdfOpen(false)}
        prescriptionData={selectedRxData}
      />
    </div>
  );
};
