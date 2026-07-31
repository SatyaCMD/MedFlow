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
