// Health check endpoint for monitoring and load balancer probes
// Provides comprehensive system health status

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Health check response interface
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheck
    memory: HealthCheck
    disk?: HealthCheck
    external?: HealthCheck
  }
  metadata: {
    nodeVersion: string
    platform: string
    environment: string
  }
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn'
  responseTime?: number
  message?: string
  details?: Record<string, any>
}

// Process start time for uptime calculation
const processStartTime = Date.now()

// Memory threshold in bytes (800MB)
const MEMORY_THRESHOLD = 800 * 1024 * 1024

// Database connection timeout
const DB_TIMEOUT = 5000

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  try {
    // Initialize health checks
    const checks: HealthCheckResponse['checks'] = {
      database: { status: 'fail' },
      memory: { status: 'fail' }
    }

    // Database health check
    try {
      const supabase = await createClient()
      const dbStartTime = Date.now()
      
      // Simple query to test database connectivity
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single()

      const dbResponseTime = Date.now() - dbStartTime

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is acceptable for health check
        checks.database = {
          status: 'fail',
          responseTime: dbResponseTime,
          message: `Database error: ${error.message}`,
          details: { code: error.code }
        }
      } else {
        checks.database = {
          status: dbResponseTime > DB_TIMEOUT ? 'warn' : 'pass',
          responseTime: dbResponseTime,
          message: dbResponseTime > DB_TIMEOUT ? 'Slow response time' : 'Connected successfully'
        }
      }
    } catch (error) {
      checks.database = {
        status: 'fail',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage()
    const isMemoryHigh = memoryUsage.rss > MEMORY_THRESHOLD

    checks.memory = {
      status: isMemoryHigh ? 'warn' : 'pass',
      message: `RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      details: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      }
    }

    // Disk space check (if in server environment)
    if (typeof process !== 'undefined' && process.platform !== 'browser') {
      try {
        const fs = await import('fs')
        const stats = await fs.promises.statfs('/')
        const freeSpace = stats.free
        const totalSpace = stats.size
        const usedPercentage = ((totalSpace - freeSpace) / totalSpace) * 100

        checks.disk = {
          status: usedPercentage > 90 ? 'warn' : 'pass',
          message: `${Math.round(usedPercentage)}% used`,
          details: {
            freeGB: Math.round(freeSpace / 1024 / 1024 / 1024),
            totalGB: Math.round(totalSpace / 1024 / 1024 / 1024),
            usedPercentage: Math.round(usedPercentage)
          }
        }
      } catch {
        // Disk check not available in this environment
      }
    }

    // External services check (optional)
    if (process.env.ENABLE_EXTERNAL_HEALTH_CHECK === 'true') {
      const externalStartTime = Date.now()
      try {
        // Example: Check external API or service
        const response = await fetch(process.env.EXTERNAL_SERVICE_URL || '', {
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        })
        
        const externalResponseTime = Date.now() - externalStartTime
        
        checks.external = {
          status: response.ok ? 'pass' : 'fail',
          responseTime: externalResponseTime,
          message: response.ok ? 'External service accessible' : `HTTP ${response.status}`
        }
      } catch {
        checks.external = {
          status: 'fail',
          responseTime: Date.now() - externalStartTime,
          message: 'External service unreachable'
        }
      }
    }

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail')
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn')
    
    let overallStatus: HealthCheckResponse['status'] = 'healthy'
    if (hasFailures) {
      overallStatus = 'unhealthy'
    } else if (hasWarnings) {
      overallStatus = 'degraded'
    }

    // Build response
    const healthResponse: HealthCheckResponse = {
      status: overallStatus,
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - processStartTime) / 1000),
      checks,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      }
    }

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthResponse, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    // Emergency fallback response
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp,
      version: 'unknown',
      uptime: Math.floor((Date.now() - processStartTime) / 1000),
      checks: {
        database: { status: 'fail', message: 'Health check error' },
        memory: { status: 'fail', message: 'Health check error' }
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      }
    }

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Simple HEAD request for basic health check
export async function HEAD(): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error && error.code !== 'PGRST116') {
      return new NextResponse(null, { status: 503 })
    }

    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}