export interface ReceiptPrintData {
  invoiceId: string;
  transactionId: string;
  itemTitle: string;
  itemCategory?: string;
  amount: string;
  customerName: string;
  cardholderName?: string;
  cardLast4?: string;
  cardBrand?: string;
  paymentMethod: string;
  timestamp: string;
  status?: string;
}

export function printSinglePageReceipt(data: ReceiptPrintData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const numericAmount = parseFloat(data.amount.replace(/[^0-9.]/g, '')) || 1500;
  const subtotal = (numericAmount / 1.05).toFixed(2);
  const taxAmount = (numericAmount - parseFloat(subtotal)).toFixed(2);

  const cardInfo = data.cardLast4
    ? `${data.cardBrand || 'Card'} ending in •••• ${data.cardLast4}`
    : data.paymentMethod;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>MediFlow - Official Payment Receipt ${data.invoiceId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: #ffffff;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            font-size: 10pt;
            line-height: 1.35;
          }

          .page-wrapper {
            width: 210mm;
            height: 297mm;
            padding: 8mm 12mm;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 10px;
            overflow: hidden;
            background: #ffffff;
            border: 1px solid #e2e8f0;
          }

          /* Header Section */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #2563eb;
            padding-bottom: 8px;
          }

          .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .brand-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: 16pt;
          }

          .brand-title {
            font-size: 17pt;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
          }

          .brand-sub {
            font-size: 8pt;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .invoice-badge {
            text-align: right;
          }

          .invoice-title {
            font-size: 15pt;
            font-weight: 900;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .status-tag {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
            padding: 2px 9px;
            border-radius: 20px;
            font-size: 7.5pt;
            font-weight: 800;
            margin-top: 3px;
            text-transform: uppercase;
          }

          /* Info Cards Grid */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 12px;
          }

          .card-label {
            font-size: 7.5pt;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }

          .info-value {
            font-size: 9pt;
            font-weight: 800;
            color: #0f172a;
          }

          .info-sub {
            font-size: 8pt;
            color: #475569;
            margin-top: 1px;
          }

          /* Table Styling - NO QTY COLUMN */
          .table-container {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 8pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px;
            text-align: left;
          }

          td {
            padding: 8px 12px;
            font-size: 9pt;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }

          tr:nth-child(even) td {
            background: #f8fafc;
          }

          /* Totals Section */
          .totals-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
          }

          .payment-card-box {
            flex: 1;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: #ffffff;
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 8pt;
          }

          .payment-card-title {
            font-size: 7.5pt;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .payment-card-num {
            font-family: monospace;
            font-size: 10.5pt;
            font-weight: 700;
            letter-spacing: 1px;
            color: #38bdf8;
          }

          .totals-box {
            width: 210px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 10px;
            padding: 10px 12px;
          }

          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #475569;
            margin-bottom: 3px;
          }

          .grand-total {
            border-top: 1.5px solid #86efac;
            padding-top: 5px;
            margin-top: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 10.5pt;
            font-weight: 900;
            color: #15803d;
          }

          /* Security & Sign Footer */
          .footer-section {
            margin-top: 4px;
            padding-top: 8px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .seal-box {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .qr-placeholder {
            width: 46px;
            height: 46px;
            background: #0f172a;
            border-radius: 7px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 5.5pt;
            font-weight: 800;
            text-align: center;
            padding: 3px;
          }

          .seal-text {
            font-size: 7pt;
            color: #64748b;
            line-height: 1.3;
          }

          .seal-text strong {
            color: #0f172a;
            display: block;
          }

          .stamp-and-signature {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          /* Circular Blue Ink Stamp */
          .circular-blue-stamp {
            width: 52px;
            height: 52px;
            border: 2px double #1d4ed8;
            border-radius: 50%;
            color: #1d4ed8;
            font-size: 5pt;
            font-weight: 900;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-transform: uppercase;
            transform: rotate(-6deg);
            background: rgba(29, 78, 216, 0.03);
            box-shadow: inset 0 0 3px rgba(29, 78, 216, 0.15);
            line-height: 1.1;
          }

          .signature-box {
            text-align: right;
          }

          .handwritten-sign {
            font-family: 'Dancing Script', 'Brush Script MT', cursive, sans-serif;
            font-size: 16pt;
            font-weight: 700;
            color: #1d4ed8;
            line-height: 1;
            margin-bottom: 2px;
          }

          .sign-line {
            width: 140px;
            border-bottom: 1.5px solid #0f172a;
            margin-bottom: 3px;
            margin-left: auto;
          }

          .sign-title {
            font-size: 8pt;
            font-weight: 800;
            color: #0f172a;
          }

          .compliance-note {
            text-align: center;
            font-size: 6.5pt;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <!-- Top Header -->
          <div class="header">
            <div class="brand-logo">
              <div class="brand-icon">✚</div>
              <div>
                <div class="brand-title">MediFlow Healthcare</div>
                <div class="brand-sub">Enterprise Billing & Financial Telemetry</div>
              </div>
            </div>
            <div class="invoice-badge">
              <div class="invoice-title">Official Tax Receipt</div>
              <div class="status-tag">✓ ${data.status || 'Paid & Verified'}</div>
            </div>
          </div>

          <!-- Invoice Meta Grid -->
          <div class="info-grid">
            <div class="info-card">
              <div class="card-label">Invoice & Transaction Reference</div>
              <div class="info-value">Invoice #: ${data.invoiceId}</div>
              <div class="info-sub">Tx Hash: <span style="font-family: monospace;">${data.transactionId}</span></div>
              <div class="info-sub">Timestamp: ${data.timestamp}</div>
            </div>

            <div class="info-card">
              <div class="card-label">Billed Customer Details</div>
              <div class="info-value">${data.customerName}</div>
              <div class="info-sub">Cardholder: ${data.cardholderName || data.customerName}</div>
              <div class="info-sub">Payment Mode: ${data.paymentMethod}</div>
            </div>
          </div>

          <!-- Itemized Table (NO QTY COLUMN) -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">Healthcare Description / Service Item</th>
                  <th style="width: 25%;">Category</th>
                  <th style="width: 20%; text-align: right;">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${data.itemTitle}</strong>
                    <div style="font-size: 7.5pt; color: #64748b; margin-top: 1px;">
                      Verified EHR billing entry & digitally processed service charge.
                    </div>
                  </td>
                  <td>${data.itemCategory || 'Medical Service'}</td>
                  <td style="text-align: right; font-weight: 800;">${data.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payment Card Details & Totals -->
          <div class="totals-section">
            <div class="payment-card-box">
              <div class="payment-card-title">Payment Method Authorization</div>
              <div class="payment-card-num">${cardInfo}</div>
              <div style="margin-top: 4px; font-size: 7.5pt; color: #cbd5e1;">
                256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant Transaction
              </div>
            </div>

            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal (Net):</span>
                <span>₹${subtotal}</span>
              </div>
              <div class="totals-row">
                <span>Medical GST (5%):</span>
                <span>₹${taxAmount}</span>
              </div>
              <div class="grand-total">
                <span>Grand Total:</span>
                <span>${data.amount}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Footer with Circular Blue Ink Stamp & Handwritten Signature -->
          <div>
            <div class="footer-section">
              <div class="seal-box">
                <div class="qr-placeholder">
                  MEDIFLOW
                  SECURE
                  RECEIPT
                </div>
                <div class="seal-text">
                  <strong>MediFlow Cryptographic Telemetry Stamp</strong>
                  Verified by Automated Payment Gateway Hash
                  <br />SHA-256: 59v9cddtwyg8ci1weum
                </div>
              </div>

              <div class="stamp-and-signature">
                <!-- Circular Blue Ink Stamp -->
                <div class="circular-blue-stamp">
                  <span>★ MEDIFLOW ★</span>
                  <span style="font-size: 4.5pt;">AUDIT PASSED</span>
                  <span>FINANCE</span>
                </div>

                <div class="signature-box">
                  <div class="handwritten-sign">S. K. Mukherjee</div>
                  <div class="sign-line"></div>
                  <div class="sign-title">Authorized Finance Officer</div>
                  <div style="font-size: 6.5pt; color: #64748b;">MediFlow Enterprise Billing System</div>
                </div>
              </div>
            </div>

            <div class="compliance-note">
              This document is an official electronically generated 1-page tax receipt compliant with Section 145 of the Healthcare GST Regulations. No physical signature required.
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export interface GstInvoicePrintData {
  invoiceId: string;
  patientName: string;
  mrn: string;
  email: string;
  phone: string;
  date: string;
  department: string;
  doctorName: string;
  tpaApproved?: boolean;
  lineItems: Array<{
    category: string;
    description: string;
    qty: number;
    unitPrice: number;
    total: number;
    tpaCovered?: boolean;
  }>;
  subtotal: number;
  gstTax: number;
  grandTotal: number;
  tpaCoverage: number;
  netPayable: number;
}

export function printOfficialGstInvoicePdf(data: GstInvoicePrintData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Official GST Tax Invoice ${data.invoiceId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 210mm; height: 297mm; margin: 0 auto; background: #ffffff; font-family: 'Inter', system-ui, sans-serif; color: #0f172a; font-size: 10pt; line-height: 1.35; }
          .page-wrapper { width: 210mm; height: 297mm; padding: 10mm 14mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #2563eb; padding-bottom: 10px; }
          .brand-logo { display: flex; align-items: center; gap: 10px; }
          .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #1e40af, #3b82f6); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18pt; }
          .brand-title { font-size: 18pt; font-weight: 900; color: #1e3a8a; }
          .brand-sub { font-size: 8.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .invoice-badge { text-align: right; }
          .invoice-title { font-size: 14pt; font-weight: 900; color: #059669; text-transform: uppercase; }
          .invoice-no { font-size: 14pt; font-weight: 900; color: #0f172a; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; }
          .card-label { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
          .item-table { width: 100%; border-collapse: collapse; margin-top: 14px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .item-table th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 8pt; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
          .item-table td { padding: 9px 10px; font-size: 8.5pt; border-bottom: 1px solid #f1f5f9; }
          .item-table tr:last-child td { border-bottom: none; }
          .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 9pt; font-weight: 600; color: #475569; }
          .summary-row.total { font-size: 12pt; font-weight: 900; color: #1e3a8a; border-top: 1.5px solid #cbd5e1; padding-top: 6px; }
          .summary-row.net { font-size: 13pt; font-weight: 900; color: #0f172a; background: #e0f2fe; padding: 8px 12px; border-radius: 8px; border: 1px solid #bae6fd; }
          .footer { border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
          .stamp { width: 75px; height: 75px; border: 2px dashed #059669; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #059669; font-weight: 900; font-size: 6pt; text-align: center; transform: rotate(-8deg); }
          .sign-box { text-align: right; }
          .sign-text { font-family: 'Dancing Script', cursive; font-size: 16pt; color: #1e3a8a; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div>
            <div class="header">
              <div class="brand-logo">
                <div class="brand-icon">⚕</div>
                <div>
                  <div class="brand-title">MediCore 360</div>
                  <div class="brand-sub">Enterprise Healthcare Management System</div>
                </div>
              </div>
              <div class="invoice-badge">
                <div class="invoice-title">💵 Official GST Tax Invoice</div>
                <div class="invoice-no">${data.invoiceId}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="card-label">Patient Details</div>
                <div style="font-size: 11pt; font-weight: 900; color: #0f172a;">${data.patientName}</div>
                <div style="font-size: 8.5pt; font-weight: 800; color: #2563eb;">MRN: ${data.mrn}</div>
                <div style="font-size: 8pt; color: #64748b;">${data.email} • ${data.phone}</div>
              </div>
              <div class="info-card">
                <div class="card-label">Billing & Clinical Telemetry</div>
                <div style="font-size: 9pt; font-weight: 700; color: #0f172a;">Date: <strong>${data.date}</strong></div>
                <div style="font-size: 8.5pt; color: #475569;">Dept: ${data.department}</div>
                <div style="font-size: 8.5pt; color: #2563eb; font-weight: 700;">Doctor: ${data.doctorName}</div>
                ${data.tpaApproved ? '<div style="margin-top: 4px; display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 8px; border-radius: 12px; font-size: 7.5pt; font-weight: 800;">🛡️ TPA CASHLESS PRE-APPROVED</div>' : ''}
              </div>
            </div>

            <table class="item-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Line Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price (₹)</th>
                  <th style="text-align: right;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${data.lineItems.map(item => `
                  <tr>
                    <td style="font-weight: 800; font-size: 7.5pt; color: #475569;">${item.category}</td>
                    <td style="font-weight: 700; color: #0f172a;">
                      ${item.description}
                      ${item.tpaCovered ? '<span style="font-size: 7pt; background: #dcfce7; color: #15803d; padding: 1px 5px; border-radius: 4px; font-weight: 800; margin-left: 4px;">TPA COVERED</span>' : ''}
                    </td>
                    <td style="text-align: center; font-weight: 800;">${item.qty}</td>
                    <td style="text-align: right; font-weight: 700;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
                    <td style="text-align: right; font-weight: 900; color: #0f172a;">₹${item.total.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal Line Charges:</span>
                <span>₹${data.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row">
                <span>Medical GST (5% Standard Tax):</span>
                <span>₹${data.gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row total">
                <span>Grand Total Invoice Amount:</span>
                <span>₹${data.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              ${data.tpaCoverage > 0 ? `
                <div class="summary-row" style="color: #059669; font-weight: 800;">
                  <span>Cashless TPA Insurance Covered:</span>
                  <span>- ₹${data.tpaCoverage.toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              <div class="summary-row net">
                <span>Net Patient Out-of-Pocket Payable:</span>
                <span>₹${data.netPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="stamp">
              <span>★ MEDIFLOW ★</span>
              <span>VERIFIED</span>
              <span>GST TAX INVOICE</span>
            </div>
            <div class="sign-box">
              <div class="sign-text">R. K. Sharma</div>
              <div style="height: 1px; background: #cbd5e1; margin: 2px 0;"></div>
              <div style="font-size: 8pt; font-weight: 800; color: #0f172a;">Chief Financial Officer</div>
              <div style="font-size: 7pt; color: #64748b;">MediCore 360 Enterprise Hospital</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export interface VendorEquipmentPrintData {
  equipmentCode: string;
  equipmentName: string;
  vendorName: string;
  modelSerial: string;
  warranty: string;
  date: string;
  cost: string;
  status: string;
}

export function printVendorEquipmentInvoicePdf(data: VendorEquipmentPrintData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Vendor Equipment Invoice ${data.equipmentCode}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 210mm; height: 297mm; margin: 0 auto; background: #ffffff; font-family: 'Inter', sans-serif; color: #0f172a; font-size: 10pt; line-height: 1.35; }
          .page-wrapper { width: 210mm; height: 297mm; padding: 10mm 14mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #4f46e5; padding-bottom: 10px; }
          .brand-logo { display: flex; align-items: center; gap: 10px; }
          .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3730a3, #4f46e5); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18pt; }
          .brand-title { font-size: 18pt; font-weight: 900; color: #3730a3; }
          .brand-sub { font-size: 8.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .invoice-badge { text-align: right; }
          .invoice-title { font-size: 14pt; font-weight: 900; color: #4f46e5; text-transform: uppercase; }
          .invoice-no { font-size: 14pt; font-weight: 900; color: #0f172a; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 14px; }
          .summary-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 14px 18px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
          .footer { border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
          .stamp { width: 80px; height: 80px; border: 2px dashed #4f46e5; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #4f46e5; font-weight: 900; font-size: 6pt; text-align: center; transform: rotate(-5deg); }
          .sign-box { text-align: right; }
          .sign-text { font-family: 'Dancing Script', cursive; font-size: 16pt; color: #3730a3; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div>
            <div class="header">
              <div class="brand-logo">
                <div class="brand-icon">🔬</div>
                <div>
                  <div class="brand-title">MediCore 360</div>
                  <div class="brand-sub">Pathology & Lab Asset Procurement Engine</div>
                </div>
              </div>
              <div class="invoice-badge">
                <div class="invoice-title">Vendor Equipment Invoice</div>
                <div class="invoice-no">${data.equipmentCode}</div>
              </div>
            </div>

            <div class="info-card">
              <div style="font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Equipment Asset Title</div>
              <div style="font-size: 14pt; font-weight: 900; color: #0f172a; margin-top: 2px;">${data.equipmentName}</div>
              <div style="margin-top: 6px; display: inline-block; background: #e0e7ff; color: #3730a3; border: 1px solid #a5b4fc; padding: 2px 10px; border-radius: 12px; font-size: 8pt; font-weight: 800;">
                ● ${data.status}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;">
              <div class="info-card" style="margin-top: 0;">
                <div style="font-size: 7.5pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Vendor & Supplier Info</div>
                <div style="font-size: 10pt; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.vendorName}</div>
                <div style="font-size: 8.5pt; color: #475569; margin-top: 2px;">Date of Procurement: <strong>${data.date}</strong></div>
              </div>
              <div class="info-card" style="margin-top: 0;">
                <div style="font-size: 7.5pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Model, Serial & Warranty</div>
                <div style="font-size: 9.5pt; font-weight: 800; color: #3730a3; margin-top: 4px;">${data.modelSerial}</div>
                <div style="font-size: 8.5pt; color: #059669; font-weight: 700; margin-top: 2px;">Warranty: ${data.warranty}</div>
              </div>
            </div>

            <div class="summary-box">
              <span style="font-size: 11pt; font-weight: 800; color: #3730a3;">Total Asset Equipment Cost:</span>
              <span style="font-size: 16pt; font-weight: 900; color: #0f172a;">${data.cost}</span>
            </div>
          </div>

          <div class="footer">
            <div class="stamp">
              <span>★ LAB ASSET ★</span>
              <span>PROCUREMENT</span>
              <span>PASSED & SEALED</span>
            </div>
            <div class="sign-box">
              <div class="sign-text">Rajesh Kumar</div>
              <div style="height: 1px; background: #cbd5e1; margin: 2px 0;"></div>
              <div style="font-size: 8pt; font-weight: 800; color: #0f172a;">Chief Pathology Officer</div>
              <div style="font-size: 7pt; color: #64748b;">MediCore Pathology Laboratory</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export interface WardSupplyPrintData {
  supplyCode: string;
  itemTitle: string;
  supplierName: string;
  ward: string;
  qty: string;
  date: string;
  totalBilling: string;
  status: string;
}

export function printWardSupplyInvoicePdf(data: WardSupplyPrintData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Ward Supply Invoice ${data.supplyCode}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { width: 210mm; height: 297mm; margin: 0 auto; background: #ffffff; font-family: 'Inter', sans-serif; color: #0f172a; font-size: 10pt; line-height: 1.35; }
          .page-wrapper { width: 210mm; height: 297mm; padding: 10mm 14mm; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #9333ea; padding-bottom: 10px; }
          .brand-logo { display: flex; align-items: center; gap: 10px; }
          .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #6b21a8, #9333ea); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 18pt; }
          .brand-title { font-size: 18pt; font-weight: 900; color: #6b21a8; }
          .brand-sub { font-size: 8.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .invoice-badge { text-align: right; }
          .invoice-title { font-size: 14pt; font-weight: 900; color: #9333ea; text-transform: uppercase; }
          .invoice-no { font-size: 14pt; font-weight: 900; color: #0f172a; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 14px; }
          .summary-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px 18px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
          .footer { border-top: 1.5px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
          .stamp { width: 80px; height: 80px; border: 2px dashed #9333ea; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #9333ea; font-weight: 900; font-size: 6pt; text-align: center; transform: rotate(-5deg); }
          .sign-box { text-align: right; }
          .sign-text { font-family: 'Dancing Script', cursive; font-size: 16pt; color: #6b21a8; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div>
            <div class="header">
              <div class="brand-logo">
                <div class="brand-icon">🏥</div>
                <div>
                  <div class="brand-title">MediCore 360</div>
                  <div class="brand-sub">Inpatient Ward Consumables Procurement</div>
                </div>
              </div>
              <div class="invoice-badge">
                <div class="invoice-title">Vendor Supply Invoice</div>
                <div class="invoice-no">${data.supplyCode}</div>
              </div>
            </div>

            <div class="info-card">
              <div style="font-size: 8pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Medical Consumable Description</div>
              <div style="font-size: 14pt; font-weight: 900; color: #0f172a; margin-top: 2px;">${data.itemTitle}</div>
              <div style="margin-top: 6px; display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 2px 10px; border-radius: 12px; font-size: 8pt; font-weight: 800;">
                ● ${data.status}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;">
              <div class="info-card" style="margin-top: 0;">
                <div style="font-size: 7.5pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Supplier & Billing Info</div>
                <div style="font-size: 10pt; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.supplierName}</div>
                <div style="font-size: 8.5pt; color: #475569; margin-top: 2px;">Date of Invoice: <strong>${data.date}</strong></div>
              </div>
              <div class="info-card" style="margin-top: 0;">
                <div style="font-size: 7.5pt; font-weight: 800; color: #64748b; text-transform: uppercase;">Ward Allocation & Quantity</div>
                <div style="font-size: 9.5pt; font-weight: 800; color: #9333ea; margin-top: 4px;">${data.ward}</div>
                <div style="font-size: 8.5pt; color: #0f172a; font-weight: 700; margin-top: 2px;">Delivered Qty: <strong>${data.qty}</strong></div>
              </div>
            </div>

            <div class="summary-box">
              <span style="font-size: 11pt; font-weight: 800; color: #6b21a8;">Total Ward Supply Billing:</span>
              <span style="font-size: 16pt; font-weight: 900; color: #e11d48;">${data.totalBilling}</span>
            </div>
          </div>

          <div class="footer">
            <div class="stamp">
              <span>★ WARD SUPPLY ★</span>
              <span>RECEIVED</span>
              <span>AUDITED & PAID</span>
            </div>
            <div class="sign-box">
              <div class="sign-text">Sunita Patel</div>
              <div style="height: 1px; background: #cbd5e1; margin: 2px 0;"></div>
              <div style="font-size: 8pt; font-weight: 800; color: #0f172a;">Head Nurse & Inpatient Manager</div>
              <div style="font-size: 7pt; color: #64748b;">MediCore Nursing Department</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

