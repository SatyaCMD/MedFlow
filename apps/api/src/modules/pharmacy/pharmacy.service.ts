/* eslint-disable @typescript-eslint/no-explicit-any */
import { PharmacyItemModel } from './pharmacy.model.js';
import { generatePharmacyInvoicePdf } from '../../lib/pdfGenerator.js';
import { getPharmacyInvoiceEmail } from '../../lib/emailTemplates.js';
import { sendMail } from '../../lib/mailer.js';

export class PharmacyService {
  async getPharmacyList(hospitalId: string = 'HOSP-001') {
    return PharmacyItemModel.find({ hospitalId, deletedAt: null }).sort({ category: 1, name: 1 });
  }

  async syncCatalog(items: any[], hospitalId: string = 'HOSP-001') {
    if (!items || items.length === 0) return { syncedCount: 0 };

    const operations = items.map((item) => ({
      updateOne: {
        filter: { hospitalId, itemId: item.id || item.itemId },
        update: {
          $set: {
            hospitalId,
            itemId: item.id || item.itemId,
            name: item.name,
            category: item.category || 'SURGICAL_SUPPLY',
            price: item.price || 100,
            unit: item.unit || 'Unit',
            stock: item.stock || 50,
            batch: item.batch || 'BATCH-001',
            expiry: item.expiry || 'Dec 2028',
            description: item.description || '',
            deletedAt: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await PharmacyItemModel.bulkWrite(operations);
    return { syncedCount: (result.upsertedCount || 0) + (result.modifiedCount || 0) };
  }

  async updateStock(itemId: string, quantityChange: number, hospitalId: string = 'HOSP-001') {
    let item = await PharmacyItemModel.findOne({ hospitalId, itemId, deletedAt: null });

    if (!item) {
      // Auto-provision item if database catalog sync has not run yet
      item = await PharmacyItemModel.create({
        hospitalId,
        itemId,
        name: `Medical Equipment (${itemId})`,
        category: 'SURGICAL_SUPPLY',
        price: 350,
        unit: 'Set',
        stock: 50,
        batch: 'AUTO-SEED',
        expiry: 'Dec 2029',
        description: 'Auto-provisioned inventory item',
      });
    }

    const newStock = Math.max(0, item.stock + quantityChange);
    item.stock = newStock;
    await item.save();
    return item;
  }

  async processPurchaseCheckout(data: any, _hospitalId: string = 'HOSP-001') {
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const customerName = data.customerName || 'Patient';
    const customerEmail = data.customerEmail || data.email || 'patient@medflow.com';
    const items = data.items || [
      { name: 'Paracetamol 650mg (Strip of 10)', batchNo: 'BTH-8821', quantity: 2, unitPrice: 35.0, total: 70.0 },
      { name: 'Amoxicillin 500mg (Strip of 10)', batchNo: 'BTH-4412', quantity: 1, unitPrice: 120.0, total: 120.0 },
    ];
    const subtotal = data.subtotal || items.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 190.0;
    const tax = data.tax || +(subtotal * 0.05).toFixed(2);
    const grandTotal = data.grandTotal || subtotal + tax;

    try {
      const pdfBuffer = await generatePharmacyInvoicePdf({
        invoiceId,
        customerName,
        customerPhone: data.phone,
        paymentMethod: data.paymentMethod || 'UPI / Online Card',
        items,
        subtotal,
        tax,
        grandTotal,
      });

      const emailTpl = getPharmacyInvoiceEmail({ customerName, invoiceId, grandTotal });

      sendMail({
        to: customerEmail,
        subject: emailTpl.subject,
        html: emailTpl.html,
        attachments: [
          {
            filename: `Pharmacy_Invoice_${invoiceId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      }).catch(() => {});
    } catch {
      // Non-blocking notification
    }

    return { invoiceId, grandTotal, items, status: 'DISPENSED' };
  }
}
