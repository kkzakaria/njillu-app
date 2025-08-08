import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron Health Check Endpoint
 * Runs periodic health checks and can trigger alerts
 */

export async function GET(request: NextRequest) {
  // Verify this is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const startTime = Date.now();
    
    // Run health check against our own endpoint
    const baseUrl = request.headers.get('x-forwarded-proto') && request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}`
      : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const healthResponse = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Cron-Health-Check/1.0'
      }
    });
    
    const healthData = await healthResponse.json();
    const responseTime = Date.now() - startTime;
    
    // Log health check result
    console.log(`Health check result: ${healthData.status} (${responseTime}ms)`);
    
    // If unhealthy, could send alerts here
    if (healthData.status === 'unhealthy') {
      console.warn('Application is unhealthy:', healthData);
      
      // TODO: Integrate with notification service (Slack, Discord, email, etc.)
      // await sendAlert(healthData);
    }
    
    return NextResponse.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      health: healthData,
      responseTime
    });
    
  } catch (error) {
    console.error('Cron health check failed:', error);
    
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