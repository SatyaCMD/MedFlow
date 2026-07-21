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
  'messaging',
  'notification',
  'staff',
  'doctor',
  'demo'
];

const formatCamel = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const collection = {
  info: {
    _postman_id: "8a715f53-bb74-4b5b-801b-c12e52b2f6ef",
    name: "MediCore 360 - Complete API Suite",
    description: "Integration test suite to validate authentication, OTP, and all business module APIs (Patient, Appointment, EMR, Lab, Billing, etc.).",
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

// 1. Add Authentication folder items
const authItems = [
  {
    name: "Register New User",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" }
      ],
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
      description: "Registers a new super admin profile to test all system modules."
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "pm.test(\"Status code is 201 or 409\", function () {",
            "    pm.expect(pm.response.code).to.be.oneOf([201, 409]);",
            "});",
            "pm.test(\"Response envelope format valid\", function () {",
            "    var jsonData = pm.response.json();",
            "    pm.expect(jsonData).to.have.property('success');",
            "});"
          ],
          type: "text/javascript"
        }
      }
    ]
  },
  {
    name: "Attempt Credentials Login (Triggers OTP)",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" }
      ],
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
      description: "Submits credentials and returns a tempToken."
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "pm.test(\"Status code is 200 or 201\", function () {",
            "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
            "});",
            "var jsonData = pm.response.json();",
            "if (jsonData.data && jsonData.data.tempToken) {",
            "    pm.globals.set(\"tempToken\", jsonData.data.tempToken);",
            "    console.log(\"Saved tempToken for OTP step: \" + jsonData.data.tempToken);",
            "}"
          ],
          type: "text/javascript"
        }
      }
    ]
  },
  {
    name: "Retrieve OTP from Mailpit",
    request: {
      auth: { type: "noauth" },
      method: "GET",
      header: [],
      url: {
        raw: "http://localhost:8026/api/v1/messages",
        protocol: "http",
        host: ["localhost"],
        port: "8026",
        path: ["api", "v1", "messages"]
      },
      description: "Retrieves verification emails from the local Mailpit service."
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "pm.test(\"Status code is 200\", function () {",
            "    pm.expect(pm.response.code).to.eql(200);",
            "});",
            "var resJson = pm.response.json();",
            "if (resJson && resJson.messages && resJson.messages.length > 0) {",
            "    var latest = resJson.messages[0];",
            "    var snippet = latest.Snippet || \"\";",
            "    var codeMatch = snippet.match(/\\d{6}/);",
            "    if (codeMatch) {",
            "        pm.globals.set(\"otpCode\", codeMatch[0]);",
            "        console.log(\"Successfully retrieved OTP: \" + codeMatch[0]);",
            "    } else {",
            "        console.log(\"Could not find a 6-digit OTP in snippet: \" + snippet);",
            "    }",
            "} else {",
            "    console.log(\"No messages in Mailpit inbox.\");",
            "}"
          ],
          type: "text/javascript"
        }
      }
    ]
  },
  {
    name: "Verify One-Time Password (OTP)",
    request: {
      auth: { type: "noauth" },
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json" }
      ],
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
      description: "Verifies the temporary token with the OTP code dynamically retrieved from Mailpit."
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "pm.test(\"Status code is 200 or 201\", function () {",
            "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
            "});",
            "var jsonData = pm.response.json();",
            "if (jsonData.data && jsonData.data.accessToken) {",
            "    pm.globals.set(\"accessToken\", jsonData.data.accessToken);",
            "    console.log(\"Access Token successfully stored.\");",
            "}"
          ],
          type: "text/javascript"
        }
      }
    ]
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
      description: "Verifies session access by hitting the /auth/me endpoint."
    },
    event: [
      {
        listen: "test",
        script: {
          exec: [
            "pm.test(\"Status code is 200 or 201\", function () {",
            "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
            "});"
          ],
          type: "text/javascript"
        }
      }
    ]
  }
];

collection.item.push({
  name: "Authentication & Session",
  item: authItems
});

// 2. Add Business Modules
modules.forEach((modName) => {
  const modCamel = formatCamel(modName);
  const modFolder = {
    name: `${modCamel} Module`,
    item: [
      {
        name: `Create ${modCamel}`,
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" }
          ],
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
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test(\"Status code is 201\", function () {",
                "    pm.expect(pm.response.code).to.eql(201);",
                "});",
                "var jsonData = pm.response.json();",
                `if (jsonData.success && jsonData.data && jsonData.data._id) {`,
                `    pm.globals.set("${modName}_id", jsonData.data._id);`,
                `    console.log("Saved ${modName}_id: " + jsonData.data._id);`,
                "}"
              ],
              type: "text/javascript"
            }
          }
        ]
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
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test(\"Status code is 200\", function () {",
                "    pm.expect(pm.response.code).to.eql(200);",
                "});"
              ],
              type: "text/javascript"
            }
          }
        ]
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
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test(\"Status code is 200\", function () {",
                "    pm.expect(pm.response.code).to.eql(200);",
                "});"
              ],
              type: "text/javascript"
            }
          }
        ]
      },
      {
        name: `Update ${modCamel}`,
        request: {
          method: "PUT",
          header: [
            { key: "Content-Type", value: "application/json" }
          ],
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
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test(\"Status code is 200\", function () {",
                "    pm.expect(pm.response.code).to.eql(200);",
                "});"
              ],
              type: "text/javascript"
            }
          }
        ]
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
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test(\"Status code is 200\", function () {",
                "    pm.expect(pm.response.code).to.eql(200);",
                "});"
              ],
              type: "text/javascript"
            }
          }
        ]
      }
    ]
  };
  collection.item.push(modFolder);
});

// 3. Add System Probe items
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
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.expect(pm.response.code).to.eql(200);",
              "});"
            ],
            type: "text/javascript"
          }
        }
      ]
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
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test(\"Status code is 200\", function () {",
              "    pm.expect(pm.response.code).to.eql(200);",
              "});"
            ],
            type: "text/javascript"
          }
        }
      ]
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
              "pm.test(\"Status code is 200\", function () {",
              "    pm.expect(pm.response.code).to.eql(200);",
              "});"
            ],
            type: "text/javascript"
          }
        }
      ]
    }
  ]
});

// 4. Add session refresh and logout at the end
collection.item.push({
  name: "Session Cleanup",
  item: [
    {
      name: "Refresh Session Token",
      request: {
        auth: { type: "noauth" },
        method: "POST",
        header: [
          { key: "Content-Type", value: "application/json" }
        ],
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
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test(\"Status code is 200 or 201\", function () {",
              "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
              "});",
              "var jsonData = pm.response.json();",
              "if (jsonData.data && jsonData.data.accessToken) {",
              "    pm.globals.set(\"accessToken\", jsonData.data.accessToken);",
              "}"
            ],
            type: "text/javascript"
          }
        }
      ]
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
      event: [
        {
          listen: "test",
          script: {
            exec: [
              "pm.test(\"Status code is 200 or 201\", function () {",
              "    pm.expect(pm.response.code).to.be.oneOf([200, 201]);",
              "});"
            ],
            type: "text/javascript"
          }
        }
      ]
    }
  ]
});

// Write to final path
const outputPath = path.resolve(process.cwd(), 'tests/postman/medflow_auth_tests.postman_collection.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), 'utf8');
console.log(`🚀 Successfully generated full collection at: ${outputPath}`);
