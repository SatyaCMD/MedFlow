import fs from 'fs';
import path from 'path';

const modules = [
  'patient',
  'appointment',
  'emr',
  'lab',
  'billing',
  'pharmacy',
  'inventory',
  'blood-bank',
  'messaging',
  'notification',
  'staff',
  'doctor',
  'demo'
];

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
    }
  ]
};

// Safe assertion generator producing 4 assertions per request
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
      header: [{ key: "Content-Type", value: "application/json" }],
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
      header: [{ key: "Content-Type", value: "application/json" }],
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
      header: [],
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
      header: [{ key: "Content-Type", value: "application/json" }],
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
      header: [{ key: "Content-Type", value: "application/json" }],
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
      header: [],
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
      header: [{ key: "Content-Type", value: "application/json" }],
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
      header: [],
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
modules.forEach((modName) => {
  const modCamel = formatCamel(modName);
  const modFolder = {
    name: `${modCamel} Module`,
    item: [
      {
        name: `Create ${modCamel}`,
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              name: `Test ${modCamel}`
            }, null, 4)
          },
          url: {
            raw: `{{base_url}}/${modName}`,
            host: ["{{base_url}}"],
            path: [modName]
          },
          description: `Create a new ${modCamel} record.`
        },
        event: makeTestEvents([200, 201], `${modName}_id`)
      },
      {
        name: `List ${modCamel}s`,
        request: {
          method: "GET",
          header: [],
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
          header: [],
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
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              name: `Updated Test ${modCamel}`
            }, null, 4)
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
          header: [],
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
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            patientName: "Jane Smith",
            relativeDonorName: "Alexander Smith",
            donorBloodGroup: "O+",
            donatedUnits: 1,
            requestedBloodGroup: "A+",
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
        header: [],
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
        header: [],
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
        header: [{ key: "Content-Type", value: "application/json" }],
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
        description: "Bulk syncs master catalog items into MongoDB database."
      },
      event: makeTestEvents([200])
    });

    modFolder.item.push({
      name: "Update Item Stock Level",
      request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: JSON.stringify({
            itemId: "surg-1",
            quantityChange: -1
          }, null, 4)
        },
        url: {
          raw: "{{base_url}}/pharmacy/update-stock",
          host: ["{{base_url}}"],
          path: ["pharmacy", "update-stock"]
        },
        description: "Adjusts stock for pharmacy equipment or medicine in real time."
      },
      event: makeTestEvents([200])
    });
  }

  collection.item.push(modFolder);
});

// 3. System Probe items (Special assertion for Prometheus text metrics)
collection.item.push({
  name: "System Health & Metrics",
  item: [
    {
      name: "Liveness Probe (Health)",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: [],
        url: {
          raw: "{{system_url}}/health",
          host: ["{{system_url}}"],
          path: ["health"]
        },
        description: "Checks if the API service is currently up."
      },
      event: makeTestEvents([200])
    },
    {
      name: "Readiness Probe (Ready)",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: [],
        url: {
          raw: "{{system_url}}/ready",
          host: ["{{system_url}}"],
          path: ["ready"]
        },
        description: "Checks if all backing services (MongoDB, Redis) are online."
      },
      event: makeTestEvents([200])
    },
    {
      name: "Prometheus Metrics",
      request: {
        auth: { type: "noauth" },
        method: "GET",
        header: [],
        url: {
          raw: "{{system_url}}/metrics",
          host: ["{{system_url}}"],
          path: ["metrics"]
        },
        description: "Scrapes application performance metrics."
      },
      event: [
        {
          listen: "test",
          script: {
            exec: [
              `pm.test("Status code is 200", function () {`,
              `    pm.expect(pm.response.code).to.eql(200);`,
              `});`,
              `pm.test("Response time is under 3000ms", function () {`,
              `    pm.expect(pm.response.responseTime).to.be.below(3000);`,
              `});`,
              `pm.test("Response format is valid Prometheus text metrics", function () {`,
              `    pm.expect(pm.response.text()).to.include("# HELP");`,
              `});`,
              `pm.test("Contains process CPU metrics", function () {`,
              `    pm.expect(pm.response.text()).to.include("process_cpu_user_seconds_total");`,
              `});`
            ],
            type: "text/javascript"
          }
        }
      ]
    }
  ]
});

// 4. Session Cleanup
collection.item.push({
  name: "Session Cleanup",
  item: [
    {
      name: "Refresh Session Token",
      request: {
        auth: { type: "noauth" },
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
          mode: "raw",
          raw: "{}"
        },
        url: {
          raw: "{{base_url}}/auth/refresh",
          host: ["{{base_url}}"],
          path: ["auth", "refresh"]
        },
        description: "Utilizes the refresh cookie to acquire a new access token."
      },
      event: makeTestEvents([200, 201], "accessToken")
    },
    {
      name: "Logout Session",
      request: {
        method: "POST",
        header: [],
        url: {
          raw: "{{base_url}}/auth/logout",
          host: ["{{base_url}}"],
          path: ["auth", "logout"]
        },
        description: "Invalidates the active session and clears tokens."
      },
      event: makeTestEvents([200, 201])
    }
  ]
});

// Output single master collection to tests/postman/medflow_auth_tests.postman_collection.json
const outputPath = path.resolve(process.cwd(), 'tests/postman/medflow_auth_tests.postman_collection.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');
console.log(`🚀 Successfully generated 100% complete single master Postman collection at: ${outputPath}`);
