// Prometheus metrics endpoint for monitoring
// Exposes application and business metrics in Prometheus format

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface MetricData {
  name: string
  help: string
  type: 'counter' | 'gauge' | 'histogram'
  value: number
  labels?: Record<string, string>
}

// Metrics cache to avoid excessive database queries
const metricsCache = new Map<string, { value: any, timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

async function getCachedValue<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = metricsCache.get(key)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.value as T
  }
  
  const value = await fetcher()
  metricsCache.set(key, { value, timestamp: now })
  return value
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const metrics: MetricData[] = []

    // System metrics
    const memoryUsage = process.memoryUsage()
    
    metrics.push({
      name: 'nodejs_memory_rss_bytes',
      help: 'Resident set size memory usage',
      type: 'gauge',
      value: memoryUsage.rss
    })

    metrics.push({
      name: 'nodejs_memory_heap_total_bytes',
      help: 'Total heap memory',
      type: 'gauge',
      value: memoryUsage.heapTotal
    })

    metrics.push({
      name: 'nodejs_memory_heap_used_bytes',
      help: 'Used heap memory',
      type: 'gauge',
      value: memoryUsage.heapUsed
    })

    // Process uptime
    metrics.push({
      name: 'nodejs_process_uptime_seconds',
      help: 'Process uptime in seconds',
      type: 'gauge',
      value: process.uptime()
    })

    // Database metrics
    try {
      // Bills of Lading metrics
      const blCounts = await getCachedValue('bl_counts', async () => {
        const { data: totalBL } = await supabase
          .from('bills_of_lading')
          .select('id', { count: 'exact', head: true })

        const { data: activeBL } = await supabase
          .from('bills_of_lading')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)

        return { total: totalBL?.length || 0, active: activeBL?.length || 0 }
      })

      metrics.push({
        name: 'bl_total_count',
        help: 'Total number of bills of lading',
        type: 'gauge',
        value: blCounts.total
      })

      metrics.push({
        name: 'bl_active_count',
        help: 'Number of active bills of lading',
        type: 'gauge',
        value: blCounts.active
      })

      // Folder metrics
      const folderCounts = await getCachedValue('folder_counts', async () => {
        const { data: totalFolders } = await supabase
          .from('folders')
          .select('id', { count: 'exact', head: true })

        const { data: activeFolders } = await supabase
          .from('folders')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)

        // Count by status
        const { data: statusCounts } = await supabase
          .from('folders')
          .select('status')
          .is('deleted_at', null)

        const statusBreakdown = statusCounts?.reduce((acc: Record<string, number>, folder) => {
          acc[folder.status] = (acc[folder.status] || 0) + 1
          return acc
        }, {}) || {}

        return { 
          total: totalFolders?.length || 0, 
          active: activeFolders?.length || 0,
          byStatus: statusBreakdown
        }
      })

      metrics.push({
        name: 'folders_total_count',
        help: 'Total number of folders',
        type: 'gauge',
        value: folderCounts.total
      })

      metrics.push({
        name: 'folders_active_count',
        help: 'Number of active folders',
        type: 'gauge',
        value: folderCounts.active
      })

      // Folder status metrics
      Object.entries(folderCounts.byStatus).forEach(([status, count]) => {
        metrics.push({
          name: 'folders_by_status_count',
          help: 'Number of folders by status',
          type: 'gauge',
          value: count as number,
          labels: { status }
        })
      })

      // User metrics
      const userCount = await getCachedValue('user_count', async () => {
        const { data } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
        return data?.length || 0
      })

      metrics.push({
        name: 'users_total_count',
        help: 'Total number of registered users',
        type: 'gauge',
        value: userCount
      })

      // Shipping companies metrics
      const shippingCompanyCount = await getCachedValue('shipping_company_count', async () => {
        const { data } = await supabase
          .from('shipping_companies')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null)
        return data?.length || 0
      })

      metrics.push({
        name: 'shipping_companies_count',
        help: 'Number of active shipping companies',
        type: 'gauge',
        value: shippingCompanyCount
      })

    } catch (error) {
      // Database metrics failed, but continue with other metrics
      console.error('Failed to fetch database metrics:', error)
      
      metrics.push({
        name: 'database_metrics_error',
        help: 'Database metrics collection error',
        type: 'gauge',
        value: 1
      })
    }

    // Business metrics (these would be incremented by actual application events)
    // For now, these are placeholder examples
    metrics.push({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      type: 'counter',
      value: 0,
      labels: { method: 'GET', status: '200' }
    })

    metrics.push({
      name: 'bl_processing_errors_total',
      help: 'Total BL processing errors',
      type: 'counter',
      value: 0
    })

    metrics.push({
      name: 'folder_creation_failures_total',
      help: 'Total folder creation failures',
      type: 'counter',
      value: 0
    })

    metrics.push({
      name: 'auth_failures_total',
      help: 'Total authentication failures',
      type: 'counter',
      value: 0,
      labels: { reason: 'invalid_credentials' }
    })

    // Convert metrics to Prometheus format
    const prometheusOutput = metrics.map(metric => {
      let output = `# HELP ${metric.name} ${metric.help}\n`
      output += `# TYPE ${metric.name} ${metric.type}\n`
      
      if (metric.labels) {
        const labelStr = Object.entries(metric.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',')
        output += `${metric.name}{${labelStr}} ${metric.value}\n`
      } else {
        output += `${metric.name} ${metric.value}\n`
      }
      
      return output
    }).join('\n')

    return new NextResponse(prometheusOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Metrics endpoint error:', error)
    
    // Return minimal metrics in case of error
    const errorOutput = `# HELP metrics_error Metrics collection error
# TYPE metrics_error gauge
metrics_error 1
`

    return new NextResponse(errorOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
      }
    })
  }
}