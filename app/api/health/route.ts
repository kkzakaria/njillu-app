import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Health Check API Endpoint
 * Provides application health status and metrics
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        memory: { status: 'unknown', usage: 0 },
        uptime: process.uptime()
      },
      responseTime: 0
    };
    
    // Check database connectivity
    try {
      const dbStartTime = Date.now();
      const supabase = await createClient();
      
      // Simple health check query
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      
      const dbResponseTime = Date.now() - dbStartTime;
      
      health.checks.database = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime: dbResponseTime,
        ...(error && { error: error.message })
      };
      
      if (error) {
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      health.status = 'unhealthy';
    }
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);
    const memThresholdMB = 512; // 512MB threshold
    
    health.checks.memory = {
      status: memUsageMB > memThresholdMB ? 'warning' : 'healthy',
      usage: memUsageMB,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
    };
    
    if (memUsageMB > memThresholdMB && health.status === 'healthy') {
      health.status = 'degraded';
    }
    
    // Calculate total response time
    health.responseTime = Date.now() - startTime;
    
    // Determine HTTP status code
    const statusCode = health.status === 'healthy' ? 200 : 
                       health.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Handle other HTTP methods
export async function HEAD(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Quick database ping
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    return new NextResponse(null, { 
      status: error ? 503 : 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}