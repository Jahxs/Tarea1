/**
 * ==============================================================================
 * TaskHub - Grafana k6 Baseline Performance Test (Phase 1)
 * ==============================================================================
 * 
 * Objective:
 * Measure the baseline performance of TaskHub API (GET /api/tareas)
 * running on a single Spring Boot 3 instance before implementing load balancing.
 * 
 * Target Architecture (Current State):
 * Client (k6) -> Nginx Reverse Proxy (Port 80) -> Spring Boot (Port 8080) -> PostgreSQL (Port 5432)
 * 
 * Key Metrics Collected:
 * - http_reqs: Total requests executed & Throughput (Requests Per Second - RPS)
 * - http_req_duration: End-to-end request latency (min, avg, med, max, p90, p95)
 * - http_req_failed: Ratio of failed HTTP requests (status != 200)
 * 
 * Execution:
 * k6 run -e BASE_URL=http://54.91.56.83 baseline-test.js
 * ==============================================================================
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// --- Custom Metrics ---
// Tracks error rate specifically for the GET /api/tareas endpoint
const failureRate = new Rate('failed_requests_rate');
// Tracks latency trend specifically for /api/tareas
const tareasLatencyTrend = new Trend('tareas_response_time_ms');

// --- Target URL Configuration ---
// Can be overridden via environment variable: -e BASE_URL="http://54.91.56.83"
// Defaults to deployed AWS EC2 public IP or localhost
const BASE_URL = (__ENV.BASE_URL || 'http://54.91.56.83').replace(/\/+$/, '');
const ENDPOINT = `${BASE_URL}/api/tareas`;

// --- Test Configuration & Workload Profile ---
// Controlled, gentle workload profile designed for AWS EC2 t3.micro (1 GB RAM, burstable CPU)
export const options = {
    // Stage-based execution (ramp-up -> steady-state -> ramp-down)
    stages: [
        { duration: '10s', target: 5 },   // Ramp-up: 0 to 5 Virtual Users (VUs) over 10s
        { duration: '20s', target: 5 },   // Steady-state: hold 5 VUs for 20s
        { duration: '10s', target: 0 },   // Ramp-down: scale down from 5 to 0 VUs over 10s
    ],

    // SLA / SLO Performance Thresholds:
    // If any threshold fails, k6 exits with non-zero exit code (fails CI/CD pipelines)
    thresholds: {
        // HTTP request failure rate must be less than 1% (99%+ success rate)
        'http_req_failed': ['rate<0.01'],

        // 95% of all requests must complete within 500ms
        'http_req_duration': ['p(95)<500', 'p(99)<1000'],

        // Custom metric threshold: failed requests rate < 1%
        'failed_requests_rate': ['rate<0.01'],
    },

    // HTTP connection configuration
    insecureSkipTLSVerify: true,
};

/**
 * Default Virtual User (VU) execution loop
 */
export default function () {
    const params = {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'TaskHub-k6-LoadTest/1.0',
        },
        tags: {
            endpoint: 'get_tareas',
        },
        timeout: '10s',
    };

    const startTime = new Date();
    const res = http.get(ENDPOINT, params);
    const duration = new Date() - startTime;

    // Record custom latency metric
    tareasLatencyTrend.add(duration);

    // Assertions / Validations
    const isSuccess = check(res, {
        'status is 200 (OK)': (r) => r.status === 200,
        'content-type is JSON': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
        'response body is non-empty': (r) => r.body && r.body.length > 0,
        'response is valid array': (r) => {
            try {
                const parsed = JSON.parse(r.body);
                return Array.isArray(parsed);
            } catch (e) {
                return false;
            }
        },
    });

    // Record failure in custom rate metric
    failureRate.add(!isSuccess);

    // Pacing / Think Time:
    // Pause for 1 second between requests to simulate realistic user pacing
    // and avoid overwhelming single t3.micro CPU burst limits
    sleep(1);
}
