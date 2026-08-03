'use client';

import { MASTER_PHARMACY_CATALOG, PharmacyItem } from './pharmacyCatalog';
import { savePharmacySale, PharmacySaleRecord } from './medicalHistoryStore';

const INVENTORY_STORAGE_KEY = 'medflow_pharmacy_inventory_v2';
export const INVENTORY_UPDATED_EVENT = 'medflow_inventory_updated';

// Helper to initialize or fetch current inventory from localStorage
export function getPharmacyInventory(): PharmacyItem[] {
  if (typeof window === 'undefined') return MASTER_PHARMACY_CATALOG;
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(MASTER_PHARMACY_CATALOG));
      return MASTER_PHARMACY_CATALOG;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading pharmacy inventory from localStorage:', error);
    return MASTER_PHARMACY_CATALOG;
  }
}

// Save inventory array to localStorage and broadcast change event
function saveAndNotifyInventory(items: PharmacyItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT, { detail: items }));
  } catch (error) {
    console.error('Error saving pharmacy inventory:', error);
  }
}

export interface PurchaserInfo {
  purchaserRole: string; // 'PATIENT' | 'NURSE' | 'CAREGIVER' | 'LAB_ASSISTANT' | 'PHARMACIST'
  purchaserName: string;
  customerName: string;
  invoiceId?: string;
  paymentMethod?: string;
}

// Deduct inventory when items are purchased by Patient, Nurse/Caregiver, Lab Tech, or Pharmacist
export function deductPharmacyStock(
  items: { id: string; name?: string; qty: number; price: number }[],
  purchaserInfo: PurchaserInfo
): { success: boolean; message: string; remainingStock: Record<string, number> } {
  const currentInventory = getPharmacyInventory();
  const updatedInventory = [...currentInventory];
  const remainingStockMap: Record<string, number> = {};
  const purchasedItemsAudit: Array<{ medicineName: string; qty: number; unitPrice: number; total: number }> = [];

  let grandTotal = 0;

  for (const requestedItem of items) {
    const index = updatedInventory.findIndex((i) => i.id === requestedItem.id);
    if (index === -1) {
      return {
        success: false,
        message: `Item ID "${requestedItem.id}" not found in pharmacy inventory catalog.`,
        remainingStock: {},
      };
    }

    const currentItem = updatedInventory[index];
    if (currentItem.stock < requestedItem.qty) {
      return {
        success: false,
        message: `Insufficient stock for "${currentItem.name}". Requested ${requestedItem.qty}, but only ${currentItem.stock} available.`,
        remainingStock: {},
      };
    }

    // Deduct quantity
    const newStock = Math.max(0, currentItem.stock - requestedItem.qty);
    updatedInventory[index] = {
      ...currentItem,
      stock: newStock,
    };

    remainingStockMap[currentItem.id] = newStock;
    const itemTotal = requestedItem.price * requestedItem.qty;
    grandTotal += itemTotal;

    purchasedItemsAudit.push({
      medicineName: currentItem.name,
      qty: requestedItem.qty,
      unitPrice: requestedItem.price,
      total: itemTotal,
    });
  }

  // Save updated inventory to localStorage & broadcast event
  saveAndNotifyInventory(updatedInventory);

  // Log sale record into medicalHistoryStore for audit vault
  const invoiceNo = purchaserInfo.invoiceId || `INV-${Date.now().toString().slice(-6)}`;
  const saleRecord: PharmacySaleRecord = {
    id: `ps-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    invoiceNo,
    date: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    timestamp: Date.now(),
    customerName: purchaserInfo.customerName || 'Patient Recipient',
    type: purchaserInfo.purchaserRole === 'PATIENT' ? 'PATIENT_DISPENSARY' : 'HOSPITAL_WARD_STOCK',
    items: purchasedItemsAudit,
    totalAmount: grandTotal,
    paymentMethod: purchaserInfo.paymentMethod || 'Online / Card Payment',
    dispensedBy: `${purchaserInfo.purchaserName} (${purchaserInfo.purchaserRole})`,
  };

  savePharmacySale(saleRecord);

  return {
    success: true,
    message: `Successfully deducted inventory for ${items.length} items. Stock updated.`,
    remainingStock: remainingStockMap,
  };
}

// Replenish / Reorder stock for an item (+ quantity)
export function replenishStock(itemId: string, quantityToAdd: number): PharmacyItem[] {
  const currentInventory = getPharmacyInventory();
  const updated = currentInventory.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        stock: item.stock + quantityToAdd,
      };
    }
    return item;
  });

  saveAndNotifyInventory(updated);
  return updated;
}

// Add a new custom item to pharmacy inventory
export function addPharmacyItemToInventory(newItem: PharmacyItem): PharmacyItem[] {
  const currentInventory = getPharmacyInventory();
  const updated = [newItem, ...currentInventory];
  saveAndNotifyInventory(updated);
  return updated;
}

// Reset inventory to master seed defaults
export function resetPharmacyInventory(): PharmacyItem[] {
  saveAndNotifyInventory(MASTER_PHARMACY_CATALOG);
  return MASTER_PHARMACY_CATALOG;
}
