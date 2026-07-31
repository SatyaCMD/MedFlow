/**
 * MediCore 360 Enterprise Responsive HTML Email Templates Engine
 * High-Industry Standard Email Designs for EMR, Rx, Billing & Security Alerts.
 */

const cleanDoctorTitle = (name: string): string => {
  if (!name) return 'Dr. Specialist';
  const cleaned = name.replace(/^(Dr\.\s*)+/i, '').trim();
  return `Dr. ${cleaned}`;
};

const BASE_WRAPPER = (headerGradient: string, headerTitle: string, headerSub: string, contentHtml: string, footerNote: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: ${headerGradient}; padding: 32px 32px 28px; text-align: left; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.85); margin-bottom: 6px;">
                      MediCore 360 EHMS Platform
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                      ${headerTitle}
                    </h1>
                    <p style="margin: 6px 0 0; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.9);">
                      ${headerSub}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px; color: #1e293b; font-size: 14px; line-height: 1.6;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Security & System Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 6px; font-weight: 700; color: #475569;">
                MediCore 360 Health Systems • HIPAA & ISO 27001 Certified EMR Platform
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 10px;">
                ${footerNote} • This is an automated clinical notification. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Clinical Medical Prescription Email (With PDF Attachment Callout)
 */
export function getPrescriptionEmail(params: {
  patientName: string;
  doctorName: string;
  diagnosis: string;
  rxId: string;
}) {
  const docNameFormatted = cleanDoctorTitle(params.doctorName);
  const rxCode = params.rxId.startsWith('RX-') ? params.rxId : `RX-${params.rxId}`;

  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Dear ${params.patientName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      <strong>${docNameFormatted}</strong> has finalized your medical consultation and generated your certified Electronic Prescription (Rx).
    </p>

    <!-- Prescribed Summary Box -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 5px solid #0284c7; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 0.5px;">Prescription Reference:</span>
            <div style="font-size: 15px; font-weight: 900; color: #0c4a6e; margin-top: 2px;">#${rxCode}</div>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 0.5px;">Clinical Diagnosis:</span>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${params.diagnosis}</div>
          </td>
        </tr>
        <tr>
          <td>
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 0.5px;">Fulfillment Status:</span>
            <div style="margin-top: 4px;">
              <span style="display: inline-block; background-color: #dcfce7; color: #15803d; border: 1px solid #86efac; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px;">
                ✓ Verified & Sent to Pharmacy Dispensary
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- PDF Attachment Highlight Box -->
    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" valign="top">
            <div style="width: 36px; height: 36px; background-color: #e0f2fe; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
              📄
            </div>
          </td>
          <td style="padding-left: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">Official Prescription PDF Attached</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              File: <strong style="color: #0369a1;">Prescription_${rxCode}.pdf</strong>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              Contains full dosage instructions, vitals telemetry, and digital doctor signature stamp.
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject: `🩺 Certified Medical Prescription #${rxCode} — ${params.patientName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      'Electronic Medical Prescription',
      'Official Patient EMR & Clinical Records Vault',
      bodyContent,
      `Rx Ref #${rxCode} • Issued by ${docNameFormatted}`
    ),
  };
}

/**
 * 2. Successful Workstation Login Security Alert
 */
export function getLoginAlertEmail(params: {
  userName: string;
  role: string;
  timestamp: string;
  ipAddress?: string;
}) {
  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Hello ${params.userName},</h2>
    <p style="color: #334155; margin-bottom: 16px;">
      A successful authentication session was established for your <strong>${params.role}</strong> workstation account.
    </p>

    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; border: 1px solid #e2e8f0; border-left-width: 4px; padding: 16px 20px; border-radius: 10px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>Authenticated Role:</strong> <span style="color: #2563eb; font-weight: 700;">${params.role}</span></td></tr>
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>Login Timestamp:</strong> ${params.timestamp}</td></tr>
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>IP Telemetry:</strong> ${params.ipAddress || '127.0.0.1 (Authorized Host)'}</td></tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; margin: 0;">
      If you performed this action, no further steps are required. If this was not you, please lock your credentials immediately from the security portal.
    </p>
  `;

  return {
    subject: '🔒 Security Telemetry: Successful Workstation Login Alert',
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      'Security Authentication Telemetry',
      'Workstation Access Control & Audit Log',
      bodyContent,
      `Session IP: ${params.ipAddress || '127.0.0.1'}`
    ),
  };
}

/**
 * 3. Failed Login Security Warning Email
 */
export function getFailedLoginAlertEmail(params: {
  userName: string;
  timestamp: string;
  ipAddress?: string;
}) {
  const bodyContent = `
    <h2 style="margin-top: 0; color: #991b1b; font-size: 17px; font-weight: 800;">Security Notice for ${params.userName},</h2>
    <p style="color: #334155; margin-bottom: 16px;">
      An incorrect password attempt was rejected while attempting to access your MedFlow workstation.
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecdd3; border-left: 5px solid #dc2626; padding: 16px 20px; border-radius: 10px; margin-bottom: 20px; color: #991b1b;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>Attempt Time:</strong> ${params.timestamp}</td></tr>
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>Origin IP:</strong> ${params.ipAddress || '127.0.0.1'}</td></tr>
        <tr><td style="padding: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="font-weight: 800; text-transform: uppercase;">Authentication Blocked</span></td></tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; margin: 0;">
      If you forgot your password, you can reset it via the portal reset option. If you did not attempt to log in, please notify security officers.
    </p>
  `;

  return {
    subject: '⚠️ SECURITY WARNING: Incorrect Password Attempt Detected',
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
      'Security Breach Prevention Warning',
      'Unauthorized Workstation Password Attempt',
      bodyContent,
      'Security Audit Log Active'
    ),
  };
}

/**
 * 4. Password Reset OTP Verification Code Email
 */
export function getPasswordResetOtpEmail(params: {
  userName: string;
  otpCode: string;
}) {
  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Hello ${params.userName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      You requested a password reset for your MediCore 360 workstation account. Use the single-use 6-digit verification code below:
    </p>

    <div style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px; margin: 0 auto 24px; text-align: center; max-width: 260px;">
      <span style="font-size: 30px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">${params.otpCode}</span>
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
      This verification code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
    </p>
  `;

  return {
    subject: '🔑 Password Reset Verification Code — MediCore 360',
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      'Password Reset Verification',
      'Single-Use Security OTP Authentication',
      bodyContent,
      'Confidential Security OTP'
    ),
  };
}

/**
 * 5. Signup Email Verification
 */
export function getSignupVerificationEmail(params: {
  userName: string;
  role: string;
  verificationCode: string;
}) {
  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Welcome, ${params.userName}!</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      Your registration for the <strong>${params.role}</strong> workstation is almost complete. Please enter the verification code below to verify your email address:
    </p>

    <div style="background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; margin: 0 auto 24px; text-align: center; max-width: 260px;">
      <span style="font-size: 30px; font-weight: 900; letter-spacing: 8px; color: #15803d; font-family: monospace;">${params.verificationCode}</span>
    </div>

    <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
      Once verified, your profile will enter the admin activation queue.
    </p>
  `;

  return {
    subject: '✉️ Verify Your Email Address — Welcome to MediCore 360',
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
      'Account Email Verification',
      'MediCore 360 Workstation Onboarding',
      bodyContent,
      'Email Identity Service'
    ),
  };
}

/**
 * 6. Appointment Confirmation Email
 */
export function getAppointmentConfirmationEmail(params: {
  recipientName: string;
  isDoctor?: boolean;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  tokenNo?: string;
}) {
  const docNameFormatted = cleanDoctorTitle(params.doctorName);

  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Hello ${params.recipientName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      The clinical consultation appointment has been scheduled and confirmed in our system.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #2563eb; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Attending Physician:</strong> ${docNameFormatted} (${params.department})</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Patient Name:</strong> ${params.patientName}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Date & Time Slot:</strong> ${params.date} at ${params.timeSlot}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Queue Token Number:</strong> <span style="color: #2563eb; font-weight: 800;">#${params.tokenNo || 'A-12'}</span></td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Clinic Location:</strong> OPD Outpatient Wing, Floor 2, Suite 204</td></tr>
      </table>
    </div>
  `;

  return {
    subject: `📅 Appointment Confirmed: ${docNameFormatted} with ${params.patientName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      'Clinical Appointment Confirmed',
      'Outpatient Consultation Schedule',
      bodyContent,
      `Token #${params.tokenNo || 'A-12'}`
    ),
  };
}

/**
 * 7. Pharmacy Purchase Slip Email (With Attached PDF)
 */
export function getPharmacyInvoiceEmail(params: {
  customerName: string;
  invoiceId: string;
  grandTotal: number;
}) {
  const invCode = params.invoiceId.startsWith('INV-') ? params.invoiceId : `INV-${params.invoiceId}`;

  const bodyContent = `
    <h2 style="margin-top: 0; color: #065f46; font-size: 17px; font-weight: 800;">Dear ${params.customerName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      Thank you for your medicine purchase at the MediCore 360 Pharmacy & Dispensary. Below is your transaction summary:
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Tax Invoice ID:</strong> #${invCode}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Grand Total Paid:</strong> <span style="color: #15803d; font-size: 16px; font-weight: 900;">₹${params.grandTotal.toFixed(2)}</span></td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: #166534; font-weight: 800;">✓ Completed & Dispensed</span></td></tr>
      </table>
    </div>

    <!-- PDF Callout -->
    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" valign="top">
            <div style="width: 36px; height: 36px; background-color: #dcfce7; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
              🧾
            </div>
          </td>
          <td style="padding-left: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">Official Itemized Tax Invoice Attached</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              File: <strong style="color: #15803d;">Pharmacy_Invoice_${invCode}.pdf</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject: `💊 Pharmacy Purchase Receipt #${invCode} — ${params.customerName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
      'Pharmacy Dispensary Tax Invoice',
      'Itemized Medicine Purchase Receipt',
      bodyContent,
      `Invoice #${invCode}`
    ),
  };
}

/**
 * 8. Lab Diagnostic Test Results Email Notification (With PDF)
 */
export function getLabReportEmail(params: {
  patientName: string;
  reportId: string;
  testName: string;
}) {
  const rptCode = params.reportId.startsWith('LAB-') ? params.reportId : `LAB-${params.reportId}`;

  const bodyContent = `
    <h2 style="margin-top: 0; color: #4c1d95; font-size: 17px; font-weight: 800;">Dear ${params.patientName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      Your diagnostic laboratory test results for <strong>${params.testName}</strong> have been published and certified by our Chief Pathologist.
    </p>

    <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-left: 5px solid #7c3aed; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Report Reference ID:</strong> #${rptCode}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Diagnostic Test Panel:</strong> ${params.testName}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Quality Accreditation:</strong> <span style="color: #6d28d9; font-weight: 800;">NABL & ISO-15189 Certified</span></td></tr>
      </table>
    </div>

    <!-- PDF Callout -->
    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" valign="top">
            <div style="width: 36px; height: 36px; background-color: #f3e8ff; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
              🧪
            </div>
          </td>
          <td style="padding-left: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">Official Pathology Test Report Attached</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              File: <strong style="color: #6d28d9;">Lab_Report_${rptCode}.pdf</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject: `🧪 Diagnostic Lab Results Published #${rptCode} — ${params.patientName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
      'Diagnostic Laboratory Findings',
      'Pathology & Radiology Test Results',
      bodyContent,
      `Report #${rptCode}`
    ),
  };
}

/**
 * 9. Payment Confirmation & Official Tax Receipt Email (With Attached PDF)
 */
export function getPaymentTaxReceiptEmail(params: {
  customerName: string;
  invoiceId: string;
  transactionId: string;
  itemTitle: string;
  amount: string;
  paymentMethod: string;
}) {
  const invCode = params.invoiceId.startsWith('ORD-') || params.invoiceId.startsWith('INV-') ? params.invoiceId : `ORD-RX-${params.invoiceId}`;

  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Dear ${params.customerName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      Thank you for your payment to MediFlow Healthcare. Your transaction was processed successfully and verified by our automated financial telemetry gateway.
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Tax Invoice Number:</strong> #${invCode}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Transaction Hash:</strong> <span style="font-family: monospace; color: #166534;">${params.transactionId}</span></td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Item Billed:</strong> ${params.itemTitle}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Payment Method:</strong> ${params.paymentMethod}</td></tr>
        <tr><td style="padding: 4px 0; font-size: 13px;"><strong>Total Amount Paid:</strong> <span style="color: #15803d; font-size: 16px; font-weight: 900;">${params.amount}</span></td></tr>
      </table>
    </div>

    <!-- PDF Attachment Callout -->
    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" valign="top">
            <div style="width: 36px; height: 36px; background-color: #dcfce7; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
              💳
            </div>
          </td>
          <td style="padding-left: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a;">Official Tax Receipt PDF Attached</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              File: <strong style="color: #15803d;">Official_Tax_Receipt_${invCode}.pdf</strong>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
              Includes itemized billing breakdown, medical GST tax, authorized finance officer signature, and circular blue ink stamp.
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject: `💳 Payment Receipt & Official Tax Invoice #${invCode} — ${params.customerName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
      'Official Healthcare Tax Receipt',
      'MediFlow Financial Telemetry & Payment Verification',
      bodyContent,
      `Tax Receipt #${invCode}`
    ),
  };
}

/**
 * 10. Pre-Consultation Nurse Vitals Checkup Notification Email
 */
export function getVitalsCheckupNotificationEmail(params: {
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  roomNumber: string;
}) {
  const docNameFormatted = cleanDoctorTitle(params.doctorName);
  const room = params.roomNumber || 'OPD Room 204 — Pre-Consultation Triage Station';

  const bodyContent = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 17px; font-weight: 800;">Dear ${params.patientName},</h2>
    <p style="color: #334155; margin-bottom: 20px;">
      Your OPD appointment with <strong>${docNameFormatted}</strong> has been approved and confirmed.
    </p>

    <!-- Room & Time Location Box -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 5px solid #0284c7; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 0.5px;">Pre-Consultation Nurse Triage Location:</span>
            <div style="font-size: 16px; font-weight: 900; color: #0c4a6e; margin-top: 2px;">📍 ${room}</div>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px;"><strong>Scheduled Date & Time:</strong> ${params.appointmentTime}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px;"><strong>Attending Physician:</strong> ${docNameFormatted}</td>
        </tr>
      </table>
    </div>

    <!-- Mandatory Vitals Checkup Notice -->
    <div style="background-color: #fffbebf5; border: 1px solid #fef3c7; border-left: 5px solid #d97706; padding: 18px 20px; border-radius: 12px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="40" valign="top">
            <div style="width: 36px; height: 36px; background-color: #fef3c7; border-radius: 10px; text-align: center; line-height: 36px; font-size: 18px;">
              🩺
            </div>
          </td>
          <td style="padding-left: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: #92400e;">Mandatory Pre-Consultation Nurse Vitals Checkup</div>
            <div style="font-size: 12px; color: #b45309; margin-top: 2px;">
              Please report to <strong>${room}</strong> 15 minutes prior to your consultation for baseline Blood Pressure, Pulse, SpO2, Temperature, and Blood Glucose logging.
            </div>
            <div style="font-size: 11px; color: #d97706; margin-top: 4px; font-weight: 700;">
              * Note: Doctor consultation action tabs remain temporarily locked until Nurse Vitals are logged into your EHR profile.
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return {
    subject: `🩺 Appointment Confirmed & Vitals Checkup Alert (Room 204) — ${params.patientName}`,
    html: BASE_WRAPPER(
      'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      'Pre-Consultation Nurse Vitals Checkup Alert',
      'MediFlow Clinical Triage & OPD Appointment Service',
      bodyContent,
      `Vitals Room Location: ${room}`
    ),
  };
}

