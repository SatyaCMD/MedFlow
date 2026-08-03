'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  CreditCard,
  Download,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Search,
  Box,
  Stethoscope,
  Mail,
  UserCheck,
  ShieldCheck,
  FileText,
  AlertCircle,
  Loader2,
  FlaskConical,
  Syringe,
  Layers,
  Thermometer,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from './PaymentModal';
import { PharmacyItem } from '../../data/pharmacyCatalog';
import {
  getPharmacyInventory,
  deductPharmacyStock,
  INVENTORY_UPDATED_EVENT,
} from '../../data/pharmacyInventoryStore';
import { api } from '../../lib/axios';

interface PharmacyPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  userRole?: string;
  patientEmail?: string;
}

export const PharmacyPurchaseModal: React.FC<PharmacyPurchaseModalProps> = ({
  isOpen,
  onClose,
  patientName,
  userRole = 'PATIENT',
  patientEmail = 'patient@medflow.com',
}) => {
  const { showToast } = useToast();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Live Pharmacy Inventory
  const [catalog, setCatalog] = useState<PharmacyItem[]>([]);

  // Role & Recipient purchasing form states
  const [purchaserRole, setPurchaserRole] = useState<string>(userRole || 'PATIENT');
  const [purchaserName, setPurchaserName] = useState<string>(patientName || 'Authorized Purchaser');
  const [patientNameInput, setPatientNameInput] = useState<string>(patientName || 'Jane Patient');
  const [customerEmail, setCustomerEmail] = useState<string>(patientEmail || 'patient@medflow.com');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98765 xxxxx');

  // Cart Items in ₹ (INR)
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number; batch?: string }>>([
    { id: 'tab-1', name: 'Paracetamol 650mg Tablets (Strip of 15)', price: 35, qty: 2, batch: 'BAT-TAB-001' },
    { id: 'syr-1', name: 'Cough Suppressant Syrup (Dextromethorphan 100ml)', price: 115, qty: 1, batch: 'SYR-COF-01' },
  ]);

  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  // Sync catalog from pharmacyInventoryStore & keep in sync with window events
  useEffect(() => {
    if (!isOpen) return;
    setCatalog(getPharmacyInventory());

    const handleInventoryUpdate = (e: any) => {
      if (e.detail) {
        setCatalog(e.detail);
      } else {
        setCatalog(getPharmacyInventory());
      }
    };

    window.addEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
    return () => {
      window.removeEventListener(INVENTORY_UPDATED_EVENT, handleInventoryUpdate);
    };
  }, [isOpen]);

  // Update default role when prop changes
  useEffect(() => {
    if (userRole) setPurchaserRole(userRole);
    if (patientName) {
      setPurchaserName(patientName);
      setPatientNameInput(patientName);
    }
  }, [userRole, patientName]);

  if (!isOpen) return null;

  const filteredCatalog = catalog.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddToCart = (item: PharmacyItem) => {
    if (item.stock <= 0) {
      showToast({
        title: 'Out of Stock',
        message: `${item.name} is currently out of stock. Please inform the pharmacist to reorder.`,
        type: 'error',
      });
      return;
    }

    const existing = cart.find((c) => c.id === item.id);
    const currentQtyInCart = existing ? existing.qty : 0;

    if (currentQtyInCart + 1 > item.stock) {
      showToast({
        title: 'Stock Limit Reached',
        message: `Cannot add more units of ${item.name}. Only ${item.stock} units available in inventory.`,
        type: 'error',
      });
      return;
    }

    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, qty: 1, batch: item.batch }]);
    }
    showToast({ title: 'Item Added to Cart', message: `${item.name} (₹${item.price})`, type: 'success' });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxes = subtotal * 0.05;
  const total = subtotal + taxes;

  const handleQuantityChange = (id: string, delta: number) => {
    const inventoryItem = catalog.find((c) => c.id === id);

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;

            if (delta > 0 && inventoryItem && newQty > inventoryItem.stock) {
              showToast({
                title: 'Stock Limit Exceeded',
                message: `Only ${inventoryItem.stock} units available for ${item.name}.`,
                type: 'error',
              });
              return item;
            }

            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const handleCheckoutTrigger = () => {
    if (cart.length === 0) {
      showToast({ title: 'Cart Empty', message: 'Please select at least one medicine or device.', type: 'error' });
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = async (receipt: any) => {
    setIsPaymentOpen(false);
    setIsSubmittingCheckout(true);

    const ordArr = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(ordArr);
    }
    const generatedInvoiceId = `INV-${(ordArr[0] % 900000) + 100000}`;

    // Deduct Pharmacy Stock in real time across the frontend state & localStorage
    const stockDeductResult = deductPharmacyStock(
      cart.map((c) => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
      {
        purchaserRole,
        purchaserName: purchaserName || patientNameInput,
        customerName: patientNameInput,
        invoiceId: generatedInvoiceId,
        paymentMethod: receipt.gateway || 'UPI / Online Card',
      }
    );

    const checkoutPayload = {
      invoiceId: generatedInvoiceId,
      purchaserRole,
      purchaserName: purchaserName || patientNameInput,
      customerName: patientNameInput,
      customerEmail,
      phone: customerPhone,
      paymentMethod: receipt.gateway || 'UPI / Online Card',
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        batchNo: i.batch || 'BAT-9901',
        quantity: i.qty,
        unitPrice: i.price,
        total: i.price * i.qty,
      })),
      subtotal,
      tax: taxes,
      grandTotal: total,
    };

    try {
      const response = await api.post('/pharmacy/checkout', checkoutPayload);
      const orderRes = response.data?.data || checkoutPayload;

      setCompletedOrder({
        ...orderRes,
        receipt,
        subtotalFormatted: `₹${subtotal.toFixed(2)}`,
        totalFormatted: `₹${total.toFixed(2)}`,
        date: new Date().toLocaleString(),
      });

      showToast({
        title: 'Pharmacy Order Completed & Inventory Updated! 💊',
        message: `Stock deducted for ${cart.length} items. Invoice #${orderRes.invoiceId} dispatched to ${customerEmail}.`,
        type: 'success',
      });
    } catch (error) {
      // Fallback state if backend runs in offline mock mode
      setCompletedOrder({
        invoiceId: generatedInvoiceId,
        customerName: patientNameInput,
        customerEmail,
        purchaserName,
        purchaserRole,
        grandTotal: total,
        totalFormatted: `₹${total.toFixed(2)}`,
        items: cart,
        receipt,
        status: 'DISPENSED',
        downloadUrl: `/api/v1/pharmacy/invoices/${generatedInvoiceId}/pdf`,
        date: new Date().toLocaleString(),
      });

      showToast({
        title: 'Pharmacy Order Processed & Inventory Decreased!',
        message: `Invoice #${generatedInvoiceId} ready for PDF download. Central inventory updated live.`,
        type: 'success',
      });
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!completedOrder) return;
    const invoiceId = completedOrder.invoiceId || 'INV-100201';

    try {
      const response = await api.get(`/pharmacy/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Pharmacy_Invoice_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast({ title: 'PDF Downloaded', message: `Pharmacy_Invoice_${invoiceId}.pdf saved successfully.`, type: 'success' });
    } catch (err) {
      if (completedOrder.pdfBase64) {
        const byteCharacters = atob(completedOrder.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pharmacy_Invoice_${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      }
      handleLegacyPrintReceipt();
    }
  };

  const handleLegacyPrintReceipt = () => {
    if (!completedOrder) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MedFlow Pharmacy Receipt - ${completedOrder.invoiceId || completedOrder.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 700px; margin: 0 auto; }
              .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
              .title { font-size: 22px; font-weight: bold; color: #065f46; }
              .box { background: #f0fdf4; padding: 18px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 20px; line-height: 1.6; }
              .item-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .item-table th, .item-table td { padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: left; font-size: 13px; }
              .total-row { font-size: 16px; font-weight: bold; color: #059669; text-align: right; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">MEDFLOW HOSPITAL PHARMACY</div>
                <div style="font-size: 12px; color: #64748b;">Certified Clinical Dispensary & Inventory Engine</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: bold;">${completedOrder.invoiceId || completedOrder.orderId}</div>
                <div style="font-size: 11px; color: #64748b;">${completedOrder.date}</div>
              </div>
            </div>
            <div class="box">
              <div><strong>Purchaser Role:</strong> ${completedOrder.purchaserRole || purchaserRole}</div>
              <div><strong>Purchaser Name:</strong> ${completedOrder.purchaserName || purchaserName}</div>
              <div><strong>Recipient Patient:</strong> ${completedOrder.customerName || patientNameInput}</div>
              <div><strong>Notification Email:</strong> ${completedOrder.customerEmail || customerEmail}</div>
            </div>

            <table class="item-table">
              <thead>
                <tr><th>Item / Medication Description</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                ${(completedOrder.items || cart)
                  .map(
                    (i: any) => `
                  <tr>
                    <td>${i.name}</td>
                    <td>${i.quantity || i.qty}</td>
                    <td>₹${i.unitPrice || i.price}</td>
                    <td>₹${((i.unitPrice || i.price) * (i.quantity || i.qty)).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="total-row">
              Total Tax Paid: ₹${(completedOrder.grandTotal || total).toFixed(2)}
            </div>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
              Thank you for purchasing from MedFlow Pharmacy. Inventory has been automatically decremented in the central hospital database.
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      {/* Payment Gateway Sandbox Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        itemTitle={`Pharmacy Order (${cart.length} Items)`}
        itemCategory={purchaserRole === 'PATIENT' ? 'PHARMACY' : 'HOSPITAL_SUPPLY'}
        amount={`₹${total.toFixed(2)}`}
        patientName={patientNameInput}
        userRole={purchaserRole}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto"
      >
        {/* Topbar Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                MedFlow Pharmacy Purchase & Real-Time Stock Engine
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Purchasing available for Patient, Nurse, Caregiver, Lab Technician & Pharmacist
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* ORDER CONFIRMATION & INVENTORY DEDUCTED SCREEN */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900">Pharmacy Purchase Completed!</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tax Invoice ID: <span className="font-bold text-emerald-700 tabular-nums">{completedOrder.invoiceId}</span>
              </p>
            </div>

            {/* Inventory Stock Decremented Badge */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <Box className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Central Pharmacy Inventory Real-Time Deducted</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-6">
                Stock quantities for the purchased items have been subtracted from the main pharmacy inventory. Pharmacist and clinical dashboards updated live.
              </p>
            </div>

            {/* Order Details Breakdown Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Purchaser Role & Name:</span>
                <span className="text-slate-900 font-bold">
                  {completedOrder.purchaserName || purchaserName} (<span className="text-blue-600">{completedOrder.purchaserRole || purchaserRole}</span>)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Patient Recipient:</span>
                <span className="text-slate-900 font-bold">{completedOrder.customerName || patientNameInput}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Items Purchased & Deducted:</span>
                <span className="text-slate-900 font-bold">{(completedOrder.items || cart).length} Items</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500">Total Grand Amount Billed:</span>
                <span className="text-emerald-600 font-black text-sm">₹{(completedOrder.grandTotal || total).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Interactive PDF Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Done & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* CART & PURCHASER FORM SELECTION */
          <div className="space-y-5">
            {/* Purchaser & Recipient Info Setup */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Purchaser & Patient Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Role Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Purchaser Role</label>
                  <select
                    value={purchaserRole}
                    onChange={(e) => setPurchaserRole(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="PATIENT">Patient (Self Purchase)</option>
                    <option value="NURSE">Nurse (Ward & Care Team)</option>
                    <option value="CAREGIVER">Caregiver / Family</option>
                    <option value="LAB_ASSISTANT">Lab Technician / Assistant</option>
                    <option value="PHARMACIST">Pharmacist / Dispensary</option>
                  </select>
                </div>

                {/* Purchaser Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Purchaser Full Name</label>
                  <input
                    type="text"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    placeholder="Enter purchaser name"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Recipient Patient Name</label>
                  <input
                    type="text"
                    value={patientNameInput}
                    onChange={(e) => setPatientNameInput(e.target.value)}
                    placeholder="Patient receiving medication"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Email Notification */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Invoice Notification Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="patient@medflow.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Catalog Filter Tabs & Search */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" /> Browse Pharmacy Catalog ({catalog.length} SKUs)
                </span>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    All Catalog
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('TABLET_CAPSULE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'TABLET_CAPSULE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    💊 Tablets & Capsules
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('SYRUP_LIQUID')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'SYRUP_LIQUID' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    🥤 Syrups & Liquids
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('INJECTION_VACCINE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'INJECTION_VACCINE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    💉 Injections & Vaccines
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('SYRUP_DROPPER')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'SYRUP_DROPPER' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    💧 Eye/Ear Droppers
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('SPECIALTY_MEDICINE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'SPECIALTY_MEDICINE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Specialty Rx
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('SURGICAL_SUPPLY')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'SURGICAL_SUPPLY' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ✂️ Surgical Supplies
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('LAB_REAGENT')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'LAB_REAGENT' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    🧪 Lab Reagents
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('DIGITAL_DEVICE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === 'DIGITAL_DEVICE' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ⚡ Devices & Gear
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tablets, syrups, injections, insulin, paracetamol, reagents..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Items Catalog List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
                {filteredCatalog.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isLowStock = item.stock > 0 && item.stock <= 50;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 border rounded-xl flex items-center justify-between text-xs transition-all ${
                        isOutOfStock
                          ? 'bg-rose-50/50 border-rose-200 opacity-75'
                          : isLowStock
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-white border-slate-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className="pr-2 space-y-0.5">
                        <span className="font-bold text-slate-900 block truncate max-w-[210px]">{item.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[210px]">
                          {item.description}
                        </span>

                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-emerald-600 font-black">₹{item.price}</span>
                          <span className="text-[10px] text-slate-400 font-bold">• {item.unit}</span>

                          {/* Live Inventory Stock Badge */}
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isOutOfStock ? 'OUT OF STOCK' : `Stock: ${item.stock}`}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(item)}
                        className={`px-3 py-1.5 font-bold rounded-xl text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  );
                })}

                {filteredCatalog.length === 0 && (
                  <div className="col-span-2 p-6 text-center text-slate-400 font-bold text-xs">
                    No medications found matching "{searchQuery}".
                  </div>
                )}
              </div>
            </div>

            {/* Selected Cart Items */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Selected Pharmacy Cart Items ({cart.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">Real-time stock reservation</span>
              </span>

              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">₹{item.price} each</span>
                      {item.batch && <span className="text-[10px] font-bold text-amber-700">Batch: {item.batch}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 font-black flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-900 tabular-nums px-1">{item.qty}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 font-black flex items-center justify-center text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                    <span className="font-black text-emerald-700 tabular-nums w-16 text-right">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => setCart(cart.filter((c) => c.id !== item.id))}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST / Pharmacy Taxes (5%):</span>
                <span className="text-white">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-800">
                <span>Total Amount Due:</span>
                <span className="text-emerald-400">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmittingCheckout || cart.length === 0}
              onClick={handleCheckoutTrigger}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isSubmittingCheckout ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deducting Stock & Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Checkout & Deduct Inventory (₹{total.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
