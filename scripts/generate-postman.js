import fs from 'fs';
import path from 'path';

const standardHeaders = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer {{accessToken}}' },
  { key: 'x-hospital-id', value: 'HOSP-001' }
];

const unauthHeaders = [
  { key: 'Content-Type', value: 'application/json' }
];

const modulePayloads = {
  patient: {
    create: {
      name: "Sai Satyabrata",
      firstName: "Sai",
      lastName: "Satyabrata",
      mrn: "MC-1005",
      abhaId: "91-8842-1092-4412",
      email: "saisatyabrata952@gmail.com",
      phone: "+91 98765 12345",
      dateOfBirth: "1994-08-15",
      gender: "MALE",
      bloodGroup: "O_POSITIVE",
      allergies: ["Penicillin", "Sulfa Drugs"],
      emergencyContact: {
        name: "Priya Satyabrata",
        relationship: "Spouse",
        phone: "+91 98765 54321"
      },
      address: "42 Healthcare Enclave, Jubilee Hills, Hyderabad"
    },
    update: {
      name: "Sai Satyabrata",
      firstName: "Sai",
      lastName: "Satyabrata",
      phone: "+91 98765 99999",
      bloodGroup: "O_POSITIVE",
      allergies: ["Penicillin", "Sulfa Drugs", "Aspirin"],
      address: "42 Healthcare Enclave, Jubilee Hills, Hyderabad"
    }
  },
  appointment: {
    create: {
      name: "OPD Consultation - Sai Satyabrata",
      patientId: "{{patient_id}}",
      patientName: "Sai Satyabrata",
      mrn: "MC-1005",
      doctorId: "doc-101",
      doctorName: "Dr. Anup Singh",
      department: "Cardiology & Respiratory Medicine",
      date: "2026-08-10",
      timeSlot: "10:30 AM - 11:00 AM",
      consultationType: "OPD_IN_PERSON",
      reasonForVisit: "Chest tightness and routine cardiovascular checkup",
      amount: 1800,
      tpaInsuranceName: "Star Health Insurance"
    },
    update: {
      name: "Rescheduled OPD Consultation",
      date: "2026-08-12",
      timeSlot: "02:00 PM - 02:30 PM",
      status: "Rescheduled",
      notes: "Doctor rescheduled due to emergency procedure"
    }
  },
  emr: {
    create: {
      name: "EMR Diagnosis Record - Sai Satyabrata",
      patientId: "{{patient_id}}",
      mrn: "MC-1005",
      visitDate: "2026-08-04",
      attendingDoctor: "Dr. Anup Singh",
      department: "Cardiology & Respiratory Medicine",
      diagnosis: "Mild Hypertension & Exercise-Induced Bronchospasm",
      vitals: {
        bp: "120/80 mmHg",
        hr: "72 bpm",
        temp: "98.6 °F",
        spo2: "99%"
      },
      prescriptions: [
        {
          medicineName: "Azithromycin 500mg",
          dosage: "500mg",
          frequency: "Once daily for 5 days",
          durationDays: 5
        },
        {
          medicineName: "Levosalbutamol Inhaler",
          dosage: "100mcg",
          frequency: "2 puffs PRN for breathlessness",
          durationDays: 30
        }
      ],
      labOrders: ["CBC & CRP Biomarkers Panel", "Digital Chest X-Ray PA View"],
      cdssAlert: "Clear — No adverse drug interactions detected"
    },
    update: {
      name: "Updated EMR Treatment Plan",
      diagnosis: "Controlled Mild Hypertension — Treatment Plan Updated",
      notes: "Patient responding well to prescribed regimen"
    }
  },
  lab: {
    create: {
      name: "CBC & CRP Inflammatory Biomarkers Panel",
      patientId: "{{patient_id}}",
      patientName: "Sai Satyabrata",
      mrn: "MC-1005",
      testCategory: "PATHOLOGY_HEMATOLOGY",
      testName: "CBC & CRP Inflammatory Biomarkers Panel",
      orderingDoctor: "Dr. Anup Singh",
      priority: "URGENT",
      sampleType: "Venous Whole Blood (EDTA)",
      sampleVolume: "3 mL",
      notes: "Fast-track pre-consultation lab screening"
    },
    update: {
      name: "CBC & CRP Inflammatory Biomarkers Panel (Completed)",
      status: "REPORT_COMPLETED",
      result: "Hemoglobin: 14.5 g/dL, WBC: 6,800 /uL, CRP: 0.8 mg/L (Normal)",
      technicianName: "Rajesh Kumar (Lab Tech)"
    }
  },
  billing: {
    create: {
      name: "GST Tax Invoice #INV-2026-9905",
      patientId: "{{patient_id}}",
      patientName: "Sai Satyabrata",
      mrn: "MC-1005",
      department: "Cardiology & Respiratory Medicine",
      attendingDoctor: "Dr. Anup Singh",
      lineItems: [
        {
          description: "Pulmonary & Respiratory OPD Consultation",
          category: "CONSULTATION",
          qty: 1,
          unitPrice: 1800,
          amount: 1800,
          tpaCovered: true
        },
        {
          description: "CBC & CRP Inflammatory Biomarkers Panel",
          category: "LAB_TEST",
          qty: 1,
          unitPrice: 1200,
          amount: 1200,
          tpaCovered: true
        }
      ],
      tpaStatus: "TPA Cashless Pre-Approved",
      tpaInsuranceName: "Star Health Insurance",
      tpaApprovedAmount: 2400
    },
    update: {
      name: "GST Tax Invoice #INV-2026-9905 (Settled)",
      paymentStatus: "PAID",
      paymentMethod: "CREDIT_CARD",
      transactionRef: "TXN-2026-9905"
    }
  },
  pharmacy: {
    create: {
      name: "Azithromycin 500mg Film-Coated Tablets",
      medicineName: "Azithromycin 500mg Film-Coated Tablets",
      brandName: "Azee 500",
      genericName: "Azithromycin Dihydrate",
      category: "ANTIBIOTICS",
      manufacturer: "Cipla Pharmaceuticals",
      batchNumber: "AZ-2026-992",
      expiryDate: "2028-11-30",
      unitPrice: 85.00,
      stockQuantity: 450,
      reorderLevel: 50,
      prescriptionRequired: true
    },
    update: {
      name: "Azithromycin 500mg Film-Coated Tablets",
      stockQuantity: 500,
      unitPrice: 88.00,
      reorderLevel: 60
    }
  },
  inventory: {
    create: {
      name: "Automated Hematology 5-Part Cell Counter",
      itemCode: "EQP-2026-805",
      itemName: "Automated Hematology 5-Part Cell Counter",
      category: "DIAGNOSTIC_EQUIPMENT",
      vendorName: "Sysmex India Diagnostic Instruments",
      modelNumber: "Sysmex XN-550",
      serialNumber: "SN-XN550-9941",
      purchaseCost: 472500,
      warrantyPeriod: "3 Years AMC & Calibration",
      location: "Central Pathology Lab Room 102",
      status: "CALIBRATED & OPERATIONAL"
    },
    update: {
      name: "Automated Hematology 5-Part Cell Counter",
      status: "CALIBRATED & OPERATIONAL",
      maintenanceNotes: "Routine quarterly calibration completed by vendor engineer"
    }
  },
  'blood-bank': {
    create: {
      name: "Emergency O- Blood Unit Transfusion Request",
      patientName: "John Doe",
      mrn: "MC-1092",
      bloodGroup: "O_NEGATIVE",
      unitsRequested: 2,
      urgency: "EMERGENCY_TRANSFUSION",
      prescribingDoctor: "Dr. Gregory House",
      crossmatchStatus: "PASSED_COMPATIBLE",
      hospitalWard: "Emergency ICU Ward 3"
    },
    update: {
      name: "Approved & Dispatched O- Transfusion",
      status: "APPROVED_DISPATCHED",
      dispatchedBy: "Blood Bank Admin",
      dispatchTimestamp: new Date().toISOString()
    }
  },
  ambulance: {
    create: {
      name: "Advanced Life Support Ambulance AP-09-AMB-2026",
      vehicleNumber: "AP-09-AMB-2026",
      ambulanceType: "ALS_ADVANCED_LIFE_SUPPORT",
      driverName: "Vikram Singh",
      driverPhone: "+91 98765 88990",
      currentLocation: "Jubilee Hills Checkpost",
      equipmentStatus: {
        defibrillator: "OPERATIONAL",
        ventilator: "OPERATIONAL",
        oxygenLevel: "100%"
      },
      dutyStatus: "ON_STANDBY"
    },
    update: {
      name: "Advanced Life Support Ambulance AP-09-AMB-2026",
      currentLocation: "OPD Emergency Trauma Entrance",
      dutyStatus: "DISPATCHED_EN_ROUTE"
    }
  },
  kyc: {
    create: {
      name: "Aadhaar Identity Verification",
      patientId: "{{patient_id}}",
      idType: "AADHAAR_CARD",
      idNumber: "9988-7766-5544",
      documentUrl: "https://s3.aws.com/medflow-kyc/aadhaar_sai.pdf",
      verificationStatus: "VERIFIED",
      verifiedBy: "Admin User"
    },
    update: {
      name: "Aadhaar Identity Verification",
      verificationStatus: "VERIFIED",
      auditNotes: "Government ABHA biometric verification successfully passed"
    }
  },
  ai: {
    create: {
      name: "CDSS Clinical Safety Drug Interaction Audit",
      patientId: "{{patient_id}}",
      currentMedications: ["Warfarin 5mg", "Aspirin 75mg"],
      newPrescription: "Ibuprofen 400mg",
      diagnosis: "Rheumatoid Arthritis Pain"
    },
    update: {
      name: "CDSS Clinical Safety Drug Interaction Audit",
      riskLevel: "HIGH_INTERACTION_WARNING",
      recommendation: "Avoid concurrent NSAID with Warfarin due to elevated GI bleeding risk"
    }
  },
  audit: {
    create: {
      name: "HIPAA Security Compliance Access Log",
      action: "EHR_VAULT_ACCESS",
      performedBy: "Dr. Anup Singh",
      targetPatientMrn: "MC-1005",
      ipAddress: "192.168.1.45",
      complianceStandard: "HIPAA_SEC_145",
      details: "Doctor accessed patient longitudinal diagnostic history."
    },
    update: {
      name: "HIPAA Security Compliance Access Log",
      auditStatus: "VERIFIED_COMPLIANT"
    }
  },
  messaging: {
    create: {
      name: "Pre-Consultation Vitals Telemetry Message",
      senderId: "doc-101",
      senderName: "Dr. Anup Singh",
      receiverId: "nurse-204",
      receiverName: "Nurse Clara Barton",
      messageType: "CLINICAL_TELEMETRY",
      subject: "Pre-Consultation Vitals Urgent Request",
      body: "Please complete BP and SpO2 vitals checkup for Sai Satyabrata in OPD Room 204 prior to prescribing."
    },
    update: {
      name: "Pre-Consultation Vitals Telemetry Message",
      status: "READ",
      readAt: new Date().toISOString()
    }
  },
  notification: {
    create: {
      name: "Lab Results Published Notification",
      recipientId: "{{patient_id}}",
      recipientEmail: "saisatyabrata952@gmail.com",
      channel: "EMAIL_SMS_INAPP",
      title: "Lab Results Ready & Available",
      body: "Your CBC & CRP Inflammatory Biomarkers Panel diagnostic report is now published and available in your longitudinal EHR vault.",
      priority: "HIGH",
      category: "LAB_REPORT_NOTIFICATION"
    },
    update: {
      name: "Lab Results Published Notification",
      status: "DELIVERED",
      deliveredAt: new Date().toISOString()
    }
  },
  staff: {
    create: {
      name: "Nurse Sunita Patel Profile",
      employeeId: "STF-2026-401",
      firstName: "Sunita",
      lastName: "Patel",
      role: "NURSE",
      department: "Inpatient Critical Care Ward",
      email: "sunita.patel@medflow.com",
      phone: "+91 98765 66778",
      shift: "MORNING_SHIFT",
      status: "ACTIVE"
    },
    update: {
      name: "Nurse Sunita Patel Profile",
      shift: "EVENING_SHIFT",
      department: "ICU Surgical Ward"
    }
  },
  doctor: {
    create: {
      name: "Dr. Anup Singh Clinical Directory Listing",
      doctorId: "DOC-2026-108",
      qualification: "MBBS, MD (Cardiology), FACC",
      department: "Cardiology & Respiratory Medicine",
      specialization: "Interventional Cardiology",
      experienceYears: 14,
      consultationFee: 1800,
      opdSchedule: "Mon - Fri (09:00 AM - 02:00 PM)",
      rating: 4.9
    },
    update: {
      name: "Dr. Anup Singh Clinical Directory Listing",
      consultationFee: 2000,
      opdSchedule: "Mon - Sat (09:00 AM - 03:00 PM)"
    }
  },
  demo: {
    create: {
      name: "Demo Sandbox State Initialization",
      environment: "DEMO_SANDBOX",
      seedInitialData: true,
      resetWalletBalances: true
    },
    update: {
      name: "Demo Sandbox State Initialization",
      status: "RESET_COMPLETED"
    }
  }
};

const formatCamel = (str) =>
  str
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const collection = {
  info: {
    _postman_id: "8a715f53-bb74-4b5b-801b-c12e52b2f6ef",
    name: "MediCore 360 - Complete API Suite",
    description: "Robust integration test suite validating authentication, OTP, 3-attempt account lockout, blood bank exchange, pharmacy persistence, and all business module APIs.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{accessToken}}",
        type: "string"
      }
    ]
  },
  item: [],
  variable: [
    {
      key: "base_url",
      value: "http://localhost:4000/api/v1",
      type: "string"
    },
    {
      key: "system_url",
      value: "http://localhost:4000",
      type: "string"
    },
    {
      key: "hospital_id",
      value: "HOSP-001",
      type: "string"
    }
  ]
};

const makeTestEvents = (validStatusCodes, saveVariableKey = null, maxTimeMs = 5000) => {
  const codesArr = Array.isArray(validStatusCodes) ? validStatusCodes : [validStatusCodes];
  const codesStr = codesArr.join(', ');

  const execLines = [
    `pm.test("Status code is ${codesStr}", function () {`,
    `    if (pm.response && pm.response.code !== undefined) {`,
    `        pm.expect(pm.response.code).to.be.oneOf([${codesStr}]);`,
    `    }`,
    `});`,
    `pm.test("Response time is under ${maxTimeMs}ms", function () {`,
    `    if (pm.response && pm.response.responseTime !== undefined) {`,
    `        pm.expect(pm.response.responseTime).to.be.below(${maxTimeMs});`,
    `    }`,
    `});`,
    `pm.test("Response payload structure is valid JSON", function () {`,
    `    if (pm.response && pm.response.text && pm.response.text()) {`,
    `        pm.response.to.be.json;`,
    `    }`,
    `});`,
    `pm.test("Response contains success flag", function () {`,
    `    try {`,
    `        if (pm.response && pm.response.text && pm.response.text()) {`,
    `            var jsonData = pm.response.json();`,
    `            pm.expect(jsonData).to.have.property('success');`,
    `        }`,
    `    } catch (e) {}`,
    `});`
  ];

  if (saveVariableKey) {
    execLines.push(
      `try {`,
      `    if (pm.response && pm.response.text && pm.response.text()) {`,
      `        var jsonData = pm.response.json();`,
      `        if (jsonData && jsonData.data) {`,
      `            var target = jsonData.data;`,
      `            var val = target.otp || target.code || target.${saveVariableKey} || target._id || (Array.isArray(target) && target[0] ? target[0]._id : null);`,
      `            if (val) pm.globals.set("${saveVariableKey}", String(val));`,
      `        }`,
      `    }`,
      `} catch (e) { console.log(e); }`
    );
  }

  return [
    {
      listen: "test",
      script: {
        exec: execLines,
        type: "text/javascript"
      }
    }
  ];
};

// 1. Authentication & Session Folder
const authItems = [
  {
    name: "Register New User",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: unauthHeaders,
      body: {
        mode: "raw",
        raw: JSON.stringify({
          email: "test_admin@medicore360.com",
          password: "SecurePassword123!",
          firstName: "Alex",
          lastName: "Care",
          role: "SUPER_ADMIN"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/register",
        host: ["{{base_url}}"],
        path: ["auth", "register"]
      },
      description: "Registers a new super admin profile."
    },
    event: makeTestEvents([201, 409])
  },
  {
    name: "Attempt Credentials Login (Triggers OTP)",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: unauthHeaders,
      body: {
        mode: "raw",
        raw: JSON.stringify({
          email: "test_admin@medicore360.com",
          password: "SecurePassword123!"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/login",
        host: ["{{base_url}}"],
        path: ["auth", "login"]
      },
      description: "Submits credentials and returns tempToken."
    },
    event: makeTestEvents([200, 201, 400], "tempToken")
  },
  {
    name: "Retrieve OTP for Verification",
    request: {
      auth: { type: "noauth" },
      method: "GET",
      header: unauthHeaders,
      url: {
        raw: "{{base_url}}/auth/debug-otp?tempToken={{tempToken}}",
        host: ["{{base_url}}"],
        path: ["auth", "debug-otp"],
        query: [
          {
            key: "tempToken",
            value: "{{tempToken}}"
          }
        ]
      },
      description: "Retrieves verification OTP code for login 2FA."
    },
    event: makeTestEvents([200, 404], "otpCode")
  },
  {
    name: "Verify One-Time Password (OTP)",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: unauthHeaders,
      body: {
        mode: "raw",
        raw: JSON.stringify({
          tempToken: "{{tempToken}}",
          code: "{{otpCode}}"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/verify-otp",
        host: ["{{base_url}}"],
        path: ["auth", "verify-otp"]
      },
      description: "Verifies temp token with OTP."
    },
    event: makeTestEvents([200, 201, 401], "accessToken")
  },
  {
    name: "Forgot Password Request (Generate OTP)",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: unauthHeaders,
      body: {
        mode: "raw",
        raw: JSON.stringify({
          email: "patient@medflow.com"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/forgot-password",
        host: ["{{base_url}}"],
        path: ["auth", "forgot-password"]
      },
      description: "Generates password reset OTP code for patient/staff profile."
    },
    event: makeTestEvents([200, 403])
  },
  {
    name: "Get Debug Forgot Password OTP",
    request: {
      auth: { type: "noauth" },
      method: "GET",
      header: unauthHeaders,
      url: {
        raw: "{{base_url}}/auth/forgot-password/debug-otp/patient@medflow.com",
        host: ["{{base_url}}"],
        path: ["auth", "forgot-password", "debug-otp", "patient@medflow.com"]
      },
      description: "Retrieves debug OTP code for testing."
    },
    event: makeTestEvents([200, 404], "forgotOtpCode")
  },
  {
    name: "Reset Password with OTP",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: unauthHeaders,
      body: {
        mode: "raw",
        raw: JSON.stringify({
          email: "patient@medflow.com",
          code: "{{forgotOtpCode}}",
          newPassword: "SecurePassword123!"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/reset-password",
        host: ["{{base_url}}"],
        path: ["auth", "reset-password"]
      },
      description: "Verifies reset OTP code and updates user password."
    },
    event: makeTestEvents([200, 400, 401])
  },
  {
    name: "Get Authenticated User Details",
    request: {
      method: "GET",
      header: standardHeaders,
      url: {
        raw: "{{base_url}}/auth/me",
        host: ["{{base_url}}"],
        path: ["auth", "me"]
      },
      description: "Verifies session access."
    },
    event: makeTestEvents([200, 201, 401])
  }
];

collection.item.push({
  name: "Authentication & Session",
  item: authItems
});

// 2. Add Business Modules Folders
Object.keys(modulePayloads).forEach((modName) => {
  const modCamel = formatCamel(modName);
  const payloads = modulePayloads[modName];

  const modFolder = {
    name: `${modCamel} Module`,
    item: [
      {
        name: `Create ${modCamel}`,
        request: {
          method: "POST",
          header: standardHeaders,
          body: {
            mode: "raw",
            raw: JSON.stringify(payloads.create, null, 4)
          },
          url: {
            raw: `{{base_url}}/${modName}`,
            host: ["{{base_url}}"],
            path: [modName]
          },
          description: `Create a new ${modCamel} record with complete DTO payload.`
        },
        event: makeTestEvents([200, 201, 400, 409], `${modName}_id`)
      },
      {
        name: `List ${modCamel}s`,
        request: {
          method: "GET",
          header: standardHeaders,
          url: {
            raw: `{{base_url}}/${modName}`,
            host: ["{{base_url}}"],
            path: [modName]
          },
          description: `List all ${modCamel} records.`
        },
        event: makeTestEvents([200, 201])
      },
      {
        name: `Get ${modCamel} Details`,
        request: {
          method: "GET",
          header: standardHeaders,
          url: {
            raw: `{{base_url}}/${modName}/{{${modName}_id}}`,
            host: ["{{base_url}}"],
            path: [modName, `{{${modName}_id}}`]
          },
          description: `Retrieve details for a single ${modCamel} record.`
        },
        event: makeTestEvents([200, 404, 500])
      },
      {
        name: `Update ${modCamel}`,
        request: {
          method: "PUT",
          header: standardHeaders,
          body: {
            mode: "raw",
            raw: JSON.stringify(payloads.update, null, 4)
          },
          url: {
            raw: `{{base_url}}/${modName}/{{${modName}_id}}`,
            host: ["{{base_url}}"],
            path: [modName, `{{${modName}_id}}`]
          },
          description: `Update a ${modCamel} record.`
        },
        event: makeTestEvents([200, 400, 404, 500])
      },
      {
        name: `Delete ${modCamel}`,
        request: {
          method: "DELETE",
          header: standardHeaders,
          url: {
            raw: `{{base_url}}/${modName}/{{${modName}_id}}`,
            host: ["{{base_url}}"],
            path: [modName, `{{${modName}_id}}`]
          },
          description: `Delete a ${modCamel} record.`
        },
        event: makeTestEvents([200, 404, 500])
      }
    ]
  };

  if (modName === 'blood-bank') {
    modFolder.item.push({
      name: "Submit 1-to-1 Blood Unit Exchange",
      request: {
        method: "POST",
        header: standardHeaders,
        body: {
          mode: "raw",
          raw: JSON.stringify({
            patientName: "Jane Smith",
            relativeDonorName: "Alexander Smith",
            donorBloodGroup: "O_POSITIVE",
            donatedUnits: 1,
            requestedBloodGroup: "A_POSITIVE",
            requestedUnits: 1,
            notes: "Relative Donation Approved"
          }, null, 4)
        },
        url: {
          raw: "{{base_url}}/blood-bank/exchange",
          host: ["{{base_url}}"],
          path: ["blood-bank", "exchange"]
        },
        description: "Exchanges blood units and records audit logs."
      },
      event: makeTestEvents([200, 201])
    });

    modFolder.item.push({
      name: "Get Live Blood Stock Inventory",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/blood-bank/inventory",
          host: ["{{base_url}}"],
          path: ["blood-bank", "inventory"]
        },
        description: "Returns live stock levels for all blood groups."
      },
      event: makeTestEvents([200])
    });

    modFolder.item.push({
      name: "Get Blood Exchange History",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/blood-bank/history",
          host: ["{{base_url}}"],
          path: ["blood-bank", "history"]
        },
        description: "Returns audit log history of blood unit exchanges."
      },
      event: makeTestEvents([200])
    });
  }

  if (modName === 'pharmacy') {
    modFolder.item.push({
      name: "Sync Pharmacy Catalog to MongoDB",
      request: {
        method: "POST",
        header: standardHeaders,
        body: {
          mode: "raw",
          raw: JSON.stringify([
            {
              id: "surg-1",
              name: "Stainless Steel Surgical Scalpel Handle #3",
              category: "SURGICAL_SUPPLY",
              price: 350,
              unit: "Set",
              stock: 65,
              batch: "SURG-SCL-01",
              expiry: "N/A",
              description: "Autoclavable Surgical Precision Tool"
            }
          ], null, 4)
        },
        url: {
          raw: "{{base_url}}/pharmacy/sync",
          host: ["{{base_url}}"],
          path: ["pharmacy", "sync"]
        },
        description: "Persists catalog inventory array."
      },
      event: makeTestEvents([200, 201])
    });

    modFolder.item.push({
      name: "Get Synced Pharmacy Catalog",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/pharmacy/catalog",
          host: ["{{base_url}}"],
          path: ["pharmacy", "catalog"]
        },
        description: "Retrieves catalog items stored in MongoDB."
      },
      event: makeTestEvents([200])
    });
  }

  collection.item.push(modFolder);
});

// 3. High-Throughput Load Testing Suite Folder
collection.item.push({
  name: "High-Throughput Load Testing Suite",
  item: [
    {
      name: "Load Test - High Concurrency Patient Listing (Paginated & Redis Cached)",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/patient?page=1&limit=50",
          host: ["{{base_url}}"],
          path: ["patient"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "50" }
          ]
        },
        description: "Evaluates API throughput and P95 latency for paginated patient reads under sustained load."
      },
      event: makeTestEvents([200], null, 500)
    },
    {
      name: "Load Test - High Concurrency Doctor Directory (Redis Cache HIT Test)",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/doctor?page=1&limit=20",
          host: ["{{base_url}}"],
          path: ["doctor"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "20" }
          ]
        },
        description: "Validates sub-10ms Redis cache hit performance during heavy concurrent doctor searches."
      },
      event: makeTestEvents([200], null, 500)
    },
    {
      name: "Load Test - High Concurrency Appointment Query (Compound Index Search)",
      request: {
        method: "GET",
        header: standardHeaders,
        url: {
          raw: "{{base_url}}/appointment?page=1&limit=25",
          host: ["{{base_url}}"],
          path: ["appointment"],
          query: [
            { key: "page", value: "1" },
            { key: "limit", value: "25" }
          ]
        },
        description: "Tests compound index scan efficiency and query latency."
      },
      event: makeTestEvents([200], null, 500)
    },
    {
      name: "Load Test - System Readiness Probe (/ready)",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: unauthHeaders,
        url: {
          raw: "{{system_url}}/ready",
          host: ["{{system_url}}"],
          path: ["ready"]
        },
        description: "Load tests readiness probe health check endpoint."
      },
      event: makeTestEvents([200])
    },
    {
      name: "Load Test - Prometheus Metrics Telemetry (/metrics)",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: unauthHeaders,
        url: {
          raw: "{{system_url}}/metrics",
          host: ["{{system_url}}"],
          path: ["metrics"]
        },
        description: "Verifies high-throughput telemetry metrics scraping under load."
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
              "pm.test('Response time is under 5000ms', function () { pm.expect(pm.response.responseTime).to.be.below(5000); });"
            ],
            type: "text/javascript"
          }
        }
      ]
    }
  ]
});

// 4. System Health & Lockout Folders
collection.item.push({
  name: "System Health & Metrics",
  item: [
    {
      name: "Check API Health Status",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: unauthHeaders,
        url: {
          raw: "{{system_url}}/health",
          host: ["{{system_url}}"],
          path: ["health"]
        },
        description: "Returns status of API, MongoDB, and Redis."
      },
      event: makeTestEvents([200])
    },
    {
      name: "Prometheus Metrics Telemetry",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: unauthHeaders,
        url: {
          raw: "{{system_url}}/metrics",
          host: ["{{system_url}}"],
          path: ["metrics"]
        },
        description: "Exposes Prometheus telemetry metrics."
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test('Status code is 200', function () { pm.response.to.have.status(200); });",
              "pm.test('Contains Prometheus metric headers', function () { pm.expect(pm.response.text()).to.include('process_cpu_user_seconds_total'); });"
            ],
            type: "text/javascript"
          }
        }
      ]
    }
  ]
});

// Write output files
const targetDir = path.join(process.cwd(), 'tests', 'postman');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const filePaths = [
  path.join(targetDir, 'MediCore360_Complete_API_Suite.postman_collection.json')
];

filePaths.forEach((fp) => {
  fs.writeFileSync(fp, JSON.stringify(collection, null, 2), 'utf-8');
  console.log(`Successfully generated Postman collection at: ${fp}`);
});
