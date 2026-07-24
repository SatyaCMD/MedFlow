'use client';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, FileUp, CreditCard, Download, CheckCircle2, X, Plus, Trash2, Sparkles, ShoppingBag, Search, Box, Stethoscope } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from './PaymentModal';
import { MASTER_PHARMACY_CATALOG, PharmacyItem } from '../../data/pharmacyCatalog';

interface PharmacyPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  userRole?: string;
}

export const PharmacyPurchaseModal: React.FC<PharmacyPurchaseModalProps> = ({
  isOpen,
  onClose,
  patientName,
  userRole = 'PATIENT',
}) => {
  const { showToast } = useToast();
  const [uploadedRxName, setUploadedRxName] = useState<string | null>('Digital_Signed_Rx_89021.pdf');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Cart Items in ₹ (INR)
  const [cart, setCart] = useState([
    { id: 'dev-1', name: 'Digital Blood Glucose Meter Kit (Glucometer + 50 Strips)', price: 1450, qty: 1 },
    { id: 'pharm-1', name: 'Levetiracetam 500mg Tablets (Strip of 10)', price: 280, qty: 1 },
    { id: 'pharm-8', name: 'Pantoprazole 40mg Tablets (Strip of 10)', price: 110, qty: 1 },
  ]);

  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (!isOpen) return null;

  const filteredCatalog = MASTER_PHARMACY_CATALOG.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddToCart = (item: PharmacyItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { id: item.id, name: item.name, price: item.price, qty: 1 }]);
    }
    showToast({ title: 'Item Added to Cart', message: `${item.name} (₹${item.price})`, type: 'success' });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxes = subtotal * 0.05;
  const total = subtotal + taxes;

  const handleQuantityChange = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const handleCheckoutTrigger = () => {
    if (cart.length === 0) {
      showToast({ title: 'Cart Empty', message: 'Please add at least one medication or device.', type: 'error' });
      return;
    }
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (receipt: any) => {
    setIsPaymentOpen(false);
    const orderData = {
      orderId: `ORD-RX-${Math.floor(100000 + Math.random() * 900000)}`,
      receipt,
      items: cart,
      subtotal: `₹${subtotal.toFixed(2)}`,
      total: `₹${total.toFixed(2)}`,
      rxDocument: uploadedRxName || 'Verified Digital Signature Rx',
      date: new Date().toLocaleString(),
    };
    setCompletedOrder(orderData);
    showToast({
      title: 'Pharmacy & Devices Order Placed!',
      message: `Order #${orderData.orderId} dispatched for dispensing & delivery.`,
      type: 'success',
    });
  };

  const handleDownloadReceipt = () => {
    if (!completedOrder) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MediCore 360 - Official Pharmacy & Devices Receipt ${completedOrder.orderId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 700px; margin: 0 auto; }
              .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-between; }
              .title { font-size: 24px; font-weight: bold; color: #065f46; }
              .box { background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 20px; }
              .item-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              .item-table th, .item-table td { padding: 10px; border-bottom: 1px solid #cbd5e1; text-align: left; font-size: 13px; }
              .total-row { font-size: 16px; font-weight: bold; color: #059669; text-align: right; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">MEDICORE 360 E-PHARMACY & MEDICAL DEVICES</div>
                <div style="font-size: 12px; color: #64748b;">Licensed Hospital Pharmacy</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: bold;">${completedOrder.orderId}</div>
                <div style="font-size: 11px; color: #64748b;">${completedOrder.date}</div>
              </div>
            </div>
            <div class="box">
              <div><strong>Purchaser:</strong> ${patientName}</div>
              <div><strong>Role:</strong> ${userRole}</div>
              <div><strong>Payment Transaction:</strong> ${completedOrder.receipt.transactionId}</div>
            </div>

            <table class="item-table">
              <thead>
                <tr><th>Item / Digital Health Device</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                ${completedOrder.items
                  .map(
                    (i: any) => `
                  <tr>
                    <td>${i.name}</td>
                    <td>${i.qty}</td>
                    <td>₹${i.price}</td>
                    <td>₹${(i.price * i.qty).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="total-row">
              Total Amount Paid: ${completedOrder.total}
            </div>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px;">
              Thank you for purchasing from MediCore 360 Certified Pharmacy & Medical Devices Store.
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      {/* Payment Gateway Sandbox Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        itemTitle={`Pharmacy & Digital Devices Order (${cart.length} Items)`}
        itemCategory={userRole === 'PATIENT' ? 'PHARMACY' : 'HOSPITAL_SUPPLY'}
        amount={`₹${total.toFixed(2)}`}
        patientName={patientName}
        userRole={userRole}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Topbar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Hospital Pharmacy & Digital Devices E-Store</h3>
              <p className="text-xs font-semibold text-slate-500">Medicines, Glucometers, Wheelchairs, Walking Sticks & Surgical Supplies</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* ORDER CONFIRMATION SCREEN */
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">Pharmacy & Devices Order Confirmed!</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Order ID: <span className="font-bold text-slate-800 tabular-nums">{completedOrder.orderId}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Charged:</span>
                <span className="text-emerald-600 font-black text-sm">{completedOrder.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Account:</span>
                <span className="text-slate-800 font-bold">{completedOrder.receipt.gateway}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Pharmacy & Device Receipt (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* CART & CATALOG SELECTION */
          <div className="space-y-5">
            {/* Catalog Filter Tabs & Search */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Browse Catalog
                </span>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activeCategory === 'ALL' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    All Items
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('DIGITAL_DEVICE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activeCategory === 'DIGITAL_DEVICE' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    ⚡ Digital Devices & Mobility Aids
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('SPECIALTY_MEDICINE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activeCategory === 'SPECIALTY_MEDICINE' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    Specialty Rx
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCategory('GENERAL_MEDICINE')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      activeCategory === 'GENERAL_MEDICINE' ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    General Common
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search glucometer, weight scale, walking stick, wheelchair, amoxicillin..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 bg-white border border-slate-200 rounded-xl">
                {filteredCatalog.map((item) => (
                  <div key={item.id} className="p-2 border border-slate-100 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[200px]">{item.description}</span>
                      <span className="text-amber-600 font-black">₹{item.price}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                Selected Pharmacy & Device Cart Items ({cart.length})
              </span>

              {cart.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-slate-500 font-semibold">₹{item.price} each</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(item.id, -1)} className="w-6 h-6 rounded-lg bg-slate-200 font-black flex items-center justify-center">
                      -
                    </button>
                    <span className="font-black text-slate-900 tabular-nums px-1">{item.qty}</span>
                    <button onClick={() => handleQuantityChange(item.id, 1)} className="w-6 h-6 rounded-lg bg-slate-200 font-black flex items-center justify-center">
                      +
                    </button>
                    <span className="font-black text-blue-600 tabular-nums w-16 text-right">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </span>
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
              onClick={handleCheckoutTrigger}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout (₹{total.toFixed(2)})</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
