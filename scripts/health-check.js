#!/usr/bin/env node

/**
 * Health Check Script
 * Validates application health and core functionality
 */

const https = require('https');
const http = require('http');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

// Health check endpoints
const ENDPOINTS = [
  '/',
  '/api/health',
  '/fr',
  '/en', 
  '/es',
  '/auth/login'
];

// Core Web Vitals thresholds
const PERFORMANCE_THRESHOLDS = {
  responseTime: 1000, // 1 second
  dbResponseTime: 500, // 500ms
  memoryUsage: 512 * 1024 * 1024, // 512MB
};

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    const request = client.get(url, { timeout }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          responseTime,
          headers: res.headers,
          body: data
        });
      });
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Request timeout for ${url}`));
    });
  });
}

/**
 * Check database connectivity
 */
async function checkDatabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: 'skipped', reason: 'No Supabase URL configured' };
  }
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      5000
    );
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.statusCode === 200 ? 'healthy' : 'unhealthy',
      responseTime,
      statusCode: response.statusCode
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Check system resources
 */
function checkResources() {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      healthy: memUsage.rss < PERFORMANCE_THRESHOLDS.memoryUsage
    },
    uptime,
    nodeVersion: process.version,
    platform: process.platform
  };
}

/**
 * Main health check
 */
async function healthCheck() {
  console.log('🏥 Starting health check...');
  console.log(`📍 Target URL: ${APP_URL}`);
  console.log('');
  
  const results = {
    timestamp: new Date().toISOString(),
    app_url: APP_URL,
    endpoints: [],
    database: null,
    resources: null,
    overall: 'healthy'
  };
  
  // Check endpoints
  console.log('🌐 Checking endpoints...');
  for (const endpoint of ENDPOINTS) {
    const url = `${APP_URL}${endpoint}`;
    try {
      const response = await makeRequest(url);
      const isHealthy = response.statusCode >= 200 && response.statusCode < 400;
      
      results.endpoints.push({
        endpoint,
        url,
        status: isHealthy ? 'healthy' : 'unhealthy',
        statusCode: response.statusCode,
        responseTime: response.responseTime
      });
      
      const icon = isHealthy ? '✅' : '❌';
      const status = `${response.statusCode} (${response.responseTime}ms)`;
      console.log(`  ${icon} ${endpoint.padEnd(20)} ${status}`);
      
      if (!isHealthy) results.overall = 'unhealthy';
      
    } catch (error) {
      results.endpoints.push({
        endpoint,
        url,
        status: 'unhealthy',
        error: error.message
      });
      
      console.log(`  ❌ ${endpoint.padEnd(20)} ERROR: ${error.message}`);
      results.overall = 'unhealthy';
    }
  }
  
  // Check database
  console.log('');
  console.log('🗄️  Checking database...');
  results.database = await checkDatabase();
  const dbIcon = results.database.status === 'healthy' ? '✅' : 
                 results.database.status === 'skipped' ? '⚠️' : '❌';
  console.log(`  ${dbIcon} Database: ${results.database.status}`);
  
  if (results.database.responseTime) {
    console.log(`     Response time: ${results.database.responseTime}ms`);
  }
  if (results.database.error) {
    console.log(`     Error: ${results.database.error}`);
    results.overall = 'unhealthy';
  }
  
  // Check resources
  console.log('');
  console.log('💾 Checking system resources...');
  results.resources = checkResources();
  
  const memMB = Math.round(results.resources.memory.rss / 1024 / 1024);
  const memIcon = results.resources.memory.healthy ? '✅' : '⚠️';
  console.log(`  ${memIcon} Memory: ${memMB}MB RSS`);
  console.log(`  ⏱️  Uptime: ${Math.round(results.resources.uptime)}s`);
  console.log(`  🏷️  Node.js: ${results.resources.nodeVersion}`);
  
  if (!results.resources.memory.healthy) {
    results.overall = 'degraded';
  }
  
  // Summary
  console.log('');
  console.log('📊 SUMMARY');
  console.log('─'.repeat(50));
  
  const overallIcon = results.overall === 'healthy' ? '✅' : 
                      results.overall === 'degraded' ? '⚠️' : '❌';
  console.log(`Overall Status: ${overallIcon} ${results.overall.toUpperCase()}`);
  
  const healthyEndpoints = results.endpoints.filter(e => e.status === 'healthy').length;
  console.log(`Endpoints: ${healthyEndpoints}/${results.endpoints.length} healthy`);
  
  if (results.database.status !== 'skipped') {
    console.log(`Database: ${results.database.status}`);
  }
  
  console.log(`Memory Usage: ${memMB}MB`);
  console.log('');
  
  // Output JSON for CI
  if (process.env.CI) {
    console.log('📄 JSON OUTPUT:');
    console.log(JSON.stringify(results, null, 2));
  }
  
  // Exit code
  const exitCode = results.overall === 'healthy' ? 0 : 1;
  process.exit(exitCode);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run health check
healthCheck().catch((error) => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});