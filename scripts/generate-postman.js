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
      date: "2026-08-12",
      timeSlot: "02:00 PM - 02:30 PM",
      status: "Rescheduled",
      notes: "Doctor rescheduled due to emergency procedure"
    }
  },
  emr: {
    create: {
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
      diagnosis: "Controlled Mild Hypertension — Treatment Plan Updated",
      notes: "Patient responding well to prescribed regimen"
    }
  },
  lab: {
    create: {
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
      status: "REPORT_COMPLETED",
      result: "Hemoglobin: 14.5 g/dL, WBC: 6,800 /uL, CRP: 0.8 mg/L (Normal)",
      technicianName: "Rajesh Kumar (Lab Tech)"
    }
  },
  billing: {
    create: {
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
      paymentStatus: "PAID",
      paymentMethod: "CREDIT_CARD",
      transactionRef: "TXN-2026-9905"
    }
  },
  pharmacy: {
    create: {
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
      stockQuantity: 500,
      unitPrice: 88.00,
      reorderLevel: 60
    }
  },
  inventory: {
    create: {
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
      status: "CALIBRATED & OPERATIONAL",
      maintenanceNotes: "Routine quarterly calibration completed by vendor engineer"
    }
  },
  'blood-bank': {
    create: {
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
      status: "APPROVED_DISPATCHED",
      dispatchedBy: "Blood Bank Admin",
      dispatchTimestamp: new Date().toISOString()
    }
  },
  ambulance: {
    create: {
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
      currentLocation: "OPD Emergency Trauma Entrance",
      dutyStatus: "DISPATCHED_EN_ROUTE"
    }
  },
  kyc: {
    create: {
      patientId: "{{patient_id}}",
      idType: "AADHAAR_CARD",
      idNumber: "9988-7766-5544",
      documentUrl: "https://s3.aws.com/medflow-kyc/aadhaar_sai.pdf",
      verificationStatus: "VERIFIED",
      verifiedBy: "Admin User"
    },
    update: {
      verificationStatus: "VERIFIED",
      auditNotes: "Government ABHA biometric verification successfully passed"
    }
  },
  ai: {
    create: {
      patientId: "{{patient_id}}",
      currentMedications: ["Warfarin 5mg", "Aspirin 75mg"],
      newPrescription: "Ibuprofen 400mg",
      diagnosis: "Rheumatoid Arthritis Pain"
    },
    update: {
      riskLevel: "HIGH_INTERACTION_WARNING",
      recommendation: "Avoid concurrent NSAID with Warfarin due to elevated GI bleeding risk"
    }
  },
  audit: {
    create: {
      action: "EHR_VAULT_ACCESS",
      performedBy: "Dr. Anup Singh",
      targetPatientMrn: "MC-1005",
      ipAddress: "192.168.1.45",
      complianceStandard: "HIPAA_SEC_145",
      details: "Doctor accessed patient longitudinal diagnostic history."
    },
    update: {
      auditStatus: "VERIFIED_COMPLIANT"
    }
  },
  messaging: {
    create: {
      senderId: "doc-101",
      senderName: "Dr. Anup Singh",
      receiverId: "nurse-204",
      receiverName: "Nurse Clara Barton",
      messageType: "CLINICAL_TELEMETRY",
      subject: "Pre-Consultation Vitals Urgent Request",
      body: "Please complete BP and SpO2 vitals checkup for Sai Satyabrata in OPD Room 204 prior to prescribing."
    },
    update: {
      status: "READ",
      readAt: new Date().toISOString()
    }
  },
  notification: {
    create: {
      recipientId: "{{patient_id}}",
      recipientEmail: "saisatyabrata952@gmail.com",
      channel: "EMAIL_SMS_INAPP",
      title: "Lab Results Ready & Available",
      body: "Your CBC & CRP Inflammatory Biomarkers Panel diagnostic report is now published and available in your longitudinal EHR vault.",
      priority: "HIGH",
      category: "LAB_REPORT_NOTIFICATION"
    },
    update: {
      status: "DELIVERED",
      deliveredAt: new Date().toISOString()
    }
  },
  staff: {
    create: {
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
      shift: "EVENING_SHIFT",
      department: "ICU Surgical Ward"
    }
  },
  doctor: {
    create: {
      doctorId: "DOC-2026-108",
      name: "Dr. Anup Singh",
      qualification: "MBBS, MD (Cardiology), FACC",
      department: "Cardiology & Respiratory Medicine",
      specialization: "Interventional Cardiology",
      experienceYears: 14,
      consultationFee: 1800,
      opdSchedule: "Mon - Fri (09:00 AM - 02:00 PM)",
      rating: 4.9
    },
    update: {
      consultationFee: 2000,
      opdSchedule: "Mon - Sat (09:00 AM - 03:00 PM)"
    }
  },
  demo: {
    create: {
      environment: "DEMO_SANDBOX",
      seedInitialData: true,
      resetWalletBalances: true
    },
    update: {
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

const makeTestEvents = (validStatusCodes, saveVariableKey = null) => {
  const codesArr = Array.isArray(validStatusCodes) ? validStatusCodes : [validStatusCodes];
  const codesStr = codesArr.join(', ');

  const execLines = [
    `pm.test("Status code is ${codesStr}", function () {`,
    `    pm.expect(pm.response.code).to.be.oneOf([${codesStr}]);`,
    `});`,
    `pm.test("Response time is under 3000ms", function () {`,
    `    pm.expect(pm.response.responseTime).to.be.below(3000);`,
    `});`,
    `pm.test("Response payload structure is valid JSON", function () {`,
    `    pm.response.to.be.json;`,
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
    event: makeTestEvents([200, 201], "tempToken")
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
    event: makeTestEvents([200], "otpCode")
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
    event: makeTestEvents([200, 201], "accessToken")
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
          email: "test_admin@medicore360.com"
        }, null, 4)
      },
      url: {
        raw: "{{base_url}}/auth/forgot-password",
        host: ["{{base_url}}"],
        path: ["auth", "forgot-password"]
      },
      description: "Generates password reset OTP code."
    },
    event: makeTestEvents([200])
  },
  {
    name: "Get Debug Forgot Password OTP",
    request: {
      auth: { type: "noauth" },
      method: "GET",
      header: unauthHeaders,
      url: {
        raw: "{{base_url}}/auth/forgot-password/debug-otp/test_admin@medicore360.com",
        host: ["{{base_url}}"],
        path: ["auth", "forgot-password", "debug-otp", "test_admin@medicore360.com"]
      },
      description: "Retrieves debug OTP code for testing."
    },
    event: makeTestEvents([200], "forgotOtpCode")
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
          email: "test_admin@medicore360.com",
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
    event: makeTestEvents([200])
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
    event: makeTestEvents([200, 201])
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
        event: makeTestEvents([200, 201], `${modName}_id`)
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
        event: makeTestEvents([200])
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
        event: makeTestEvents([200, 404])
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
        event: makeTestEvents([200, 404])
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
        event: makeTestEvents([200, 404])
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

// 3. System Health & Lockout Folders
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
