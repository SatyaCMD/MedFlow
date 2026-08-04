import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 500 },  // Ramp-up to 500 Virtual Users
    { duration: '3m', target: 2000 }, // Sustain 2,000 Virtual Users (~20,000 req/sec)
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<50'], // 95% of requests must complete in < 50ms
    http_req_failed: ['rate<0.01'],  // Less than 1% failure rate
  },
};

export default function () {
  const res = http.get('http://api.medflow.internal/api/v1/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.1);
}
