import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 min
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';

export default function () {
  // 1. Check Liveness Probe
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health success is true': (r) => r.json().success === true,
  });

  sleep(1);

  // 2. Check Readiness Probe
  const readyRes = http.get(`${BASE_URL}/ready`);
  check(readyRes, {
    'ready status is 200': (r) => r.status === 200,
    'ready success is true': (r) => r.json().success === true,
  });

  sleep(2);
}
