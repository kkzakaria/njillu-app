import { NextRequest, NextResponse } from 'next/server';

/**
 * Performance Metrics Collection Endpoint
 * Collects and stores performance metrics
 */

interface PerformanceMetrics {
  timestamp: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  uptime: number;
  loadAverage?: number[];
  cpuUsage?: NodeJS.CpuUsage;
  environment: string;
}

export async function GET(request: NextRequest) {
  // Verify this is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Collect metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      uptime: process.uptime(),
      cpuUsage,
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Add load average if available (Linux/macOS)
    try {
      const os = require('os');
      metrics.loadAverage = os.loadavg();
    } catch {
      // Not available on all platforms
    }
    
    // Log metrics
    const memMB = Math.round(metrics.memory.rss / 1024 / 1024);
    const heapMB = Math.round(metrics.memory.heapUsed / 1024 / 1024);
    
    console.log(`Performance metrics - Memory: ${memMB}MB RSS, ${heapMB}MB heap, Uptime: ${Math.round(metrics.uptime)}s`);
    
    // Here you could store metrics in your database or send to monitoring service
    // For example: await storeMetrics(metrics);
    // Or: await sendToDatadog(metrics);
    
    // Check for concerning metrics
    const concerns = [];
    
    if (memMB > 512) {
      concerns.push(`High memory usage: ${memMB}MB`);
    }
    
    if (metrics.uptime < 60) {
      concerns.push(`Recent restart: uptime ${Math.round(metrics.uptime)}s`);
    }
    
    if (concerns.length > 0) {
      console.warn('Performance concerns:', concerns);
    }
    
    return NextResponse.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      metrics,
      concerns
    });
    
  } catch (error) {
    console.error('Performance metrics collection failed:', error);
    
    return NextResponse.json({
      status: 'failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}