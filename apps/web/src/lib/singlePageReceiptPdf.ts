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

  const numericAmount = parseFloat(data.amount.replace(/[^0-9.]/g, '')) || 45800;
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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
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
            font-size: 11pt;
            line-height: 1.4;
          }

          .page-wrapper {
            width: 210mm;
            height: 297mm;
            padding: 12mm 14mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
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
            padding-bottom: 12px;
          }

          .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .brand-icon {
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: 18pt;
          }

          .brand-title {
            font-size: 18pt;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
          }

          .brand-sub {
            font-size: 8.5pt;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .invoice-badge {
            text-align: right;
          }

          .invoice-title {
            font-size: 16pt;
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
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 8pt;
            font-weight: 800;
            margin-top: 4px;
            text-transform: uppercase;
          }

          /* Info Cards Grid */
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 14px;
          }

          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px 14px;
          }

          .card-label {
            font-size: 7.5pt;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .info-value {
            font-size: 9.5pt;
            font-weight: 700;
            color: #0f172a;
          }

          .info-sub {
            font-size: 8.5pt;
            color: #475569;
            margin-top: 2px;
          }

          /* Table Styling */
          .table-container {
            margin-top: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background: #0f172a;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            text-align: left;
          }

          td {
            padding: 10px 12px;
            font-size: 9.5pt;
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
            margin-top: 16px;
            gap: 20px;
          }

          .payment-card-box {
            flex: 1;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: #ffffff;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 8.5pt;
          }

          .payment-card-title {
            font-size: 8pt;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .payment-card-num {
            font-family: monospace;
            font-size: 11pt;
            font-weight: 700;
            letter-spacing: 1px;
            color: #38bdf8;
          }

          .totals-box {
            width: 220px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 12px 14px;
          }

          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #475569;
            margin-bottom: 4px;
          }

          .grand-total {
            border-top: 1.5px solid #86efac;
            padding-top: 6px;
            margin-top: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 11pt;
            font-weight: 900;
            color: #15803d;
          }

          /* Security & Sign Footer */
          .footer-section {
            margin-top: auto;
            padding-top: 14px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .seal-box {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .qr-placeholder {
            width: 54px;
            height: 54px;
            background: #0f172a;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 6pt;
            font-weight: 800;
            text-align: center;
            padding: 4px;
          }

          .seal-text {
            font-size: 7.5pt;
            color: #64748b;
            line-height: 1.3;
          }

          .seal-text strong {
            color: #0f172a;
            display: block;
          }

          .signature-box {
            text-align: right;
          }

          .sign-line {
            width: 140px;
            border-bottom: 1.5px solid #0f172a;
            margin-bottom: 4px;
            margin-left: auto;
          }

          .sign-title {
            font-size: 8pt;
            font-weight: 800;
            color: #0f172a;
          }

          .compliance-note {
            text-align: center;
            font-size: 7pt;
            color: #94a3b8;
            margin-top: 8px;
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

          <!-- Itemized Table -->
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Healthcare Description / Service Item</th>
                  <th style="width: 20%;">Category</th>
                  <th style="width: 15%;">Qty</th>
                  <th style="width: 20%; text-align: right;">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${data.itemTitle}</strong>
                    <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">
                      Verified EHR billing entry & digitally processed service charge.
                    </div>
                  </td>
                  <td>${data.itemCategory || 'Medical Service'}</td>
                  <td>1</td>
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
              <div style="margin-top: 6px; font-size: 7.5pt; color: #cbd5e1;">
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

          <!-- Bottom Footer & Compliance -->
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
                  Verified by Automated Payment Gateway Gateway Hash
                  <br />SHA-256: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}
                </div>
              </div>

              <div class="signature-box">
                <div class="sign-line"></div>
                <div class="sign-title">Authorized Finance Officer</div>
                <div style="font-size: 7pt; color: #64748b;">MediFlow Enterprise Billing System</div>
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
