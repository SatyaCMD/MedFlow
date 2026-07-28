/**
 * MediCore 360 Enterprise Responsive HTML Email Templates Engine
 */

const EMAIL_HEADER_STYLE = `
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  padding: 24px;
  text-align: center;
  color: #ffffff;
  border-radius: 12px 12px 0 0;
`;

const EMAIL_FOOTER_STYLE = `
  background-color: #f8fafc;
  padding: 16px;
  text-align: center;
  font-size: 11px;
  color: #64748b;
  border-radius: 0 0 12px 12px;
  border-top: 1px solid #e2e8f0;
`;

const WRAPPER_STYLE = `
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

/**
 * 1. Successful Login Alert Email (All Roles)
 */
export function getLoginAlertEmail(params: {
  userName: string;
  role: string;
  timestamp: string;
  ipAddress?: string;
}) {
  return {
    subject: '🔒 Security Alert: New Successful Login to Your MedFlow Account',
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="${EMAIL_HEADER_STYLE}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">MEDIFLOW WORKSTATION</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Account Security Telemetry Alert</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 16px;">Hello ${params.userName},</h2>
          <p>We detected a successful authentication session login to your <strong>${params.role}</strong> workstation.</p>
          <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 2px 0;"><strong>Workstation Role:</strong> ${params.role}</p>
            <p style="margin: 2px 0;"><strong>Login Timestamp:</strong> ${params.timestamp}</p>
            <p style="margin: 2px 0;"><strong>IP Address:</strong> ${params.ipAddress || '127.0.0.1 (Local Workstation)'}</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">If this was you, no action is required. If you did not initiate this session, please lock your account or notify your system administrator immediately.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Health Systems  •  Confidential Security Alert
        </div>
      </div>
    `,
  };
}

/**
 * 2. Failed Login Attempt Security Warning Email (All Roles)
 */
export function getFailedLoginAlertEmail(params: {
  userName: string;
  timestamp: string;
  ipAddress?: string;
}) {
  return {
    subject: '⚠️ SECURITY WARNING: Incorrect Password Attempt Detected',
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #f43f5e 100%); ${EMAIL_HEADER_STYLE.replace('background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);', '')}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">SECURITY WARNING</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Failed Workstation Password Attempt</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #991b1b; font-size: 16px;">Security Notice for ${params.userName},</h2>
          <p>An incorrect password was entered while attempting to log into your MedFlow workstation.</p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin: 16px 0; color: #991b1b;">
            <p style="margin: 2px 0;"><strong>Attempt Time:</strong> ${params.timestamp}</p>
            <p style="margin: 2px 0;"><strong>Origin IP:</strong> ${params.ipAddress || '127.0.0.1'}</p>
            <p style="margin: 2px 0;"><strong>Status:</strong> Authentication Blocked</p>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you forgot your password, you can reset your credentials from the login screen. If you did not make this attempt, your account may be target of an unauthorized access attempt.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Security  •  Automated Security Telemetry
        </div>
      </div>
    `,
  };
}

/**
 * 3. Password Reset Email (All Roles EXCEPT Admins)
 */
export function getPasswordResetOtpEmail(params: {
  userName: string;
  otpCode: string;
}) {
  return {
    subject: '🔑 MedFlow Account Password Reset Verification Code',
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="${EMAIL_HEADER_STYLE}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">MEDIFLOW AUTHENTICATION</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Password Reset Verification Code</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 16px;">Hello ${params.userName},</h2>
          <p style="color: #475569;">You requested a password reset for your MedFlow workstation account. Use the 6-digit OTP code below to verify your request:</p>
          <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 16px; margin: 20px auto; max-width: 240px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #1d4ed8; font-family: monospace;">${params.otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Account Access  •  Confidential Single-Use OTP
        </div>
      </div>
    `,
  };
}

/**
 * 4. Signup Email Verification (All Roles EXCEPT Admins)
 */
export function getSignupVerificationEmail(params: {
  userName: string;
  role: string;
  verificationCode: string;
}) {
  return {
    subject: '✉️ Welcome to MedFlow! Please Verify Your Email Address',
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="${EMAIL_HEADER_STYLE}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">WELCOME TO MEDIFLOW</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Email Identity Verification</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6; text-align: center;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 16px;">Welcome, ${params.userName}!</h2>
          <p style="color: #475569;">Your <strong>${params.role}</strong> profile has been registered. Please verify your email address using the verification code below to activate your account:</p>
          <div style="background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px auto; max-width: 240px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #047857; font-family: monospace;">${params.verificationCode}</span>
          </div>
          <p style="font-size: 12px; color: #64748b;">Once verified, your workstation profile will enter the admin verification queue for full access.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Onboarding  •  Email Verification Service
        </div>
      </div>
    `,
  };
}

/**
 * 5. Appointment Booking Confirmation Email (Patient & Doctor)
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
  return {
    subject: `📅 Appointment Confirmed: ${params.doctorName} with ${params.patientName}`,
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="${EMAIL_HEADER_STYLE}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">APPOINTMENT CONFIRMED</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">MediCore 360 Consultation Schedule</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 16px;">Hello ${params.recipientName},</h2>
          <p>The clinical appointment has been confirmed. Below are the consultation details:</p>
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Doctor:</strong> ${params.doctorName} (${params.department})</p>
            <p style="margin: 4px 0;"><strong>Patient:</strong> ${params.patientName}</p>
            <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${params.date} at ${params.timeSlot}</p>
            <p style="margin: 4px 0;"><strong>Queue Token Number:</strong> #${params.tokenNo || 'A-12'}</p>
            <p style="margin: 4px 0;"><strong>Venue:</strong> OPD Outpatient Clinic, Floor 2, Room 204</p>
          </div>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Appointments  •  Automated Schedule Service
        </div>
      </div>
    `,
  };
}

/**
 * 6. Prescription Issued Email Notification (Attached PDF)
 */
export function getPrescriptionEmail(params: {
  patientName: string;
  doctorName: string;
  diagnosis: string;
  rxId: string;
}) {
  return {
    subject: `🩺 Medical Prescription & Diagnosis Issued (RX #${params.rxId})`,
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="${EMAIL_HEADER_STYLE}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">CLINICAL PRESCRIPTION</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">MediCore 360 Electronic Medical Record</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #0f172a; font-size: 16px;">Dear ${params.patientName},</h2>
          <p><strong>Dr. ${params.doctorName}</strong> has finalized your clinical consultation and issued your electronic prescription.</p>
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 2px 0;"><strong>Prescription ID:</strong> #${params.rxId}</p>
            <p style="margin: 2px 0;"><strong>Diagnosis:</strong> ${params.diagnosis}</p>
            <p style="margin: 2px 0;"><strong>Status:</strong> Verified & Sent to Pharmacy</p>
          </div>
          <p>📎 <strong>Download Attached PDF:</strong> Your official medical prescription PDF (<code>Prescription_RX_${params.rxId}.pdf</code>) is attached to this email.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 EMR  •  Official Digital Health Record
        </div>
      </div>
    `,
  };
}

/**
 * 7. Pharmacy Purchase Slip Email Notification (Attached PDF)
 */
export function getPharmacyInvoiceEmail(params: {
  customerName: string;
  invoiceId: string;
  grandTotal: number;
}) {
  return {
    subject: `💊 Pharmacy Purchase Receipt & Slip (Invoice #${params.invoiceId})`,
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); ${EMAIL_HEADER_STYLE.replace('background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);', '')}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">PHARMACY RECEIPT</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Dispensary Tax Invoice</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #065f46; font-size: 16px;">Dear ${params.customerName},</h2>
          <p>Thank you for your medicine purchase at MediCore 360 Dispensary.</p>
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 2px 0;"><strong>Invoice ID:</strong> #${params.invoiceId}</p>
            <p style="margin: 2px 0;"><strong>Total Paid:</strong> ₹${params.grandTotal.toFixed(2)}</p>
            <p style="margin: 2px 0;"><strong>Dispensary Status:</strong> Completed & Packed</p>
          </div>
          <p>📎 <strong>Download Attached Receipt PDF:</strong> Your official purchase slip (<code>Pharmacy_Invoice_${params.invoiceId}.pdf</code>) is attached to this email.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Dispensary  •  Official Receipt
        </div>
      </div>
    `,
  };
}

/**
 * 8. Lab Test Results Email Notification (Attached PDF)
 */
export function getLabReportEmail(params: {
  patientName: string;
  reportId: string;
  testName: string;
}) {
  return {
    subject: `🧪 Diagnostic Lab Results Published (Report #${params.reportId})`,
    html: `
      <div style="${WRAPPER_STYLE}">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); ${EMAIL_HEADER_STYLE.replace('background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);', '')}">
          <h1 style="margin: 0; font-size: 20px; font-weight: 800;">DIAGNOSTIC LAB REPORT</h1>
          <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">Pathology & Radiology Test Results</p>
        </div>
        <div style="padding: 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <h2 style="margin-top: 0; color: #4c1d95; font-size: 16px;">Dear ${params.patientName},</h2>
          <p>Your diagnostic laboratory test results for <strong>${params.testName}</strong> have been finalized by our chief pathologist.</p>
          <div style="background-color: #f5f3ff; border-left: 4px solid #8b5cf6; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 2px 0;"><strong>Report ID:</strong> #${params.reportId}</p>
            <p style="margin: 2px 0;"><strong>Test Name:</strong> ${params.testName}</p>
            <p style="margin: 2px 0;"><strong>Verification Status:</strong> Verified & NABL Certified</p>
          </div>
          <p>📎 <strong>Download Attached PDF Report:</strong> Your full pathology test report PDF (<code>Lab_Report_${params.reportId}.pdf</code>) is attached to this email.</p>
        </div>
        <div style="${EMAIL_FOOTER_STYLE}">
          © ${new Date().getFullYear()} MediCore 360 Diagnostics  •  Confidential Lab Findings
        </div>
      </div>
    `,
  };
}
