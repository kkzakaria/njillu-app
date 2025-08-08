# Performance Monitoring Guide

Complete guide for monitoring and optimizing performance in production.

## Overview

The application includes comprehensive performance monitoring across multiple dimensions:

- **Core Web Vitals**: User experience metrics
- **Application Performance**: Response times and throughput
- **Infrastructure Metrics**: System resources and health
- **Business Metrics**: Feature usage and conversion

## Core Web Vitals Monitoring

### Target Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| Largest Contentful Paint (LCP) | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| First Input Delay (FID) | ≤ 100ms | 100ms - 300ms | > 300ms |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| First Contentful Paint (FCP) | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| Time to Interactive (TTI) | ≤ 3.8s | 3.8s - 7.3s | > 7.3s |

### Monitoring Tools

1. **Vercel Speed Insights**
   ```tsx
   // Automatic integration in app/layout.tsx
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

2. **Lighthouse CI**
   ```yaml
   # Runs automatically in CI/CD pipeline
   # Configuration in lighthouse.config.js
   # Reports available in GitHub Actions artifacts
   ```

3. **Real User Monitoring (RUM)**
   ```tsx
   // Built-in with Vercel Analytics
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Application Performance Monitoring

### API Response Times

**Health Check Endpoint** (`/api/health`):
```typescript
// Monitors:
// - Database response time
// - Memory usage
// - System uptime
// - Overall health status

// Target response time: < 500ms
// Acceptable response time: < 1000ms
// Alert threshold: > 1500ms
```

**Cron Jobs** for continuous monitoring:
- Health checks every 5 minutes
- Performance metrics collection hourly
- Automated alerts for degradation

### Database Performance

**Supabase Metrics**:
- Query execution time
- Connection pool utilization
- Cache hit rates
- Row Level Security (RLS) performance

**Optimization Strategies**:
```sql
-- Index optimization
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_folders_user_id ON folders(user_id);

-- Query optimization
EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;
```

### Bundle Size Monitoring

**Webpack Bundle Analyzer**:
```bash
# Generate bundle analysis
pnpm build:analyze

# View results in browser
open bundle-analyzer/client.html
```

**Bundle Size Targets**:
- Initial bundle: < 500KB
- Total bundle: < 1MB
- Individual chunks: < 250KB
- Vendor chunks: < 750KB

## Infrastructure Monitoring

### System Resource Monitoring

**Memory Usage**:
```javascript
// Monitored in /api/cron/performance-metrics
const memoryUsage = process.memoryUsage();
const metrics = {
  rss: memoryUsage.rss,           // Resident Set Size
  heapTotal: memoryUsage.heapTotal,
  heapUsed: memoryUsage.heapUsed,
  external: memoryUsage.external
};

// Alert thresholds:
// Warning: > 256MB
// Critical: > 512MB
```

**CPU Usage**:
```javascript
const cpuUsage = process.cpuUsage();
// Monitor user and system CPU time
// Track CPU efficiency over time
```

### Error Rate Monitoring

**Sentry Integration**:
```typescript
// Automatic error tracking
// Performance monitoring
// Release tracking
// User session replay

// Error rate targets:
// Normal: < 0.1%
// Acceptable: < 0.5%
// Alert: > 1.0%
```

**Custom Error Tracking**:
```typescript
// In middleware and API routes
try {
  // Application logic
} catch (error) {
  console.error('Operation failed:', {
    error: error.message,
    stack: error.stack,
    context: { /* relevant context */ }
  });
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }
}
```

## Performance Dashboards

### Vercel Dashboard

**Key Metrics**:
- Function invocations and duration
- Edge cache hit rates
- Bandwidth usage
- Error rates by function

**Alerts Configuration**:
- Function timeout alerts
- High error rate alerts
- Bandwidth usage alerts
- Performance regression alerts

### Supabase Dashboard

**Database Metrics**:
- Active connections
- Query performance
- Storage usage
- Auth metrics

**Monitoring Setup**:
- Connection pool monitoring
- Slow query identification
- Resource usage tracking
- Backup status monitoring

### Custom Performance Dashboard

Create a custom dashboard combining:

```typescript
// Performance metrics API
export async function GET() {
  const metrics = {
    // System metrics
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    
    // Application metrics
    responseTime: await measureResponseTime(),
    errorRate: await calculateErrorRate(),
    
    // Business metrics
    activeUsers: await getActiveUserCount(),
    featureUsage: await getFeatureUsage()
  };
  
  return Response.json(metrics);
}
```

## Performance Optimization Strategies

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   // Route-based code splitting (automatic with App Router)
   // Component-based code splitting
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <LoadingSpinner />,
     ssr: false // if component is client-side only
   });
   ```

2. **Image Optimization**
   ```tsx
   import Image from 'next/image';
   
   // Automatic optimization with Next.js Image component
   <Image
     src="/hero-image.jpg"
     alt="Hero"
     width={1200}
     height={600}
     priority // for above-the-fold images
     placeholder="blur" // with blurDataURL
   />
   ```

3. **Caching Strategy**
   ```typescript
   // API route caching
   export async function GET() {
     const data = await fetchData();
     
     return Response.json(data, {
       headers: {
         'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
       }
     });
   }
   ```

### Backend Optimization

1. **Database Query Optimization**
   ```sql
   -- Use efficient queries
   SELECT id, title, status 
   FROM folders 
   WHERE user_id = $1 
   ORDER BY updated_at DESC 
   LIMIT 20;
   
   -- Avoid N+1 queries
   SELECT f.*, u.name as user_name
   FROM folders f
   JOIN users u ON f.user_id = u.id
   WHERE f.status = 'active';
   ```

2. **Connection Pooling**
   ```typescript
   // Supabase automatically handles connection pooling
   // Configure pool size based on usage patterns
   const supabase = createClient(url, key, {
     db: {
       schema: 'public',
     },
     auth: {
       persistSession: false, // for server-side
     }
   });
   ```

3. **Middleware Optimization**
   ```typescript
   // Optimize middleware for performance
   export async function middleware(request: NextRequest) {
     // Skip middleware for static assets
     if (request.nextUrl.pathname.startsWith('/_next/static')) {
       return NextResponse.next();
     }
     
     // Efficient session checking
     const response = NextResponse.next();
     return await updateSession(request, response);
   }
   ```

## Monitoring Alerts

### Alert Configuration

**Critical Alerts** (Immediate notification):
- Application down (health check fails)
- Database connection lost
- Error rate > 5%
- Response time > 5 seconds

**Warning Alerts** (Monitor closely):
- Memory usage > 80%
- Error rate > 1%
- Response time > 2 seconds
- Bundle size increase > 20%

**Info Alerts** (Track trends):
- Performance regression detected
- New dependency vulnerabilities
- Usage pattern changes

### Alert Channels

```typescript
// Example alert integration
async function sendAlert(level: 'critical' | 'warning' | 'info', message: string) {
  if (level === 'critical') {
    // Send to multiple channels
    await Promise.all([
      sendSlackAlert(message),
      sendEmailAlert(message),
      // sendSMSAlert(message) for critical issues
    ]);
  } else if (level === 'warning') {
    await sendSlackAlert(message);
  }
  
  // Always log to monitoring service
  console.warn(`[${level.toUpperCase()}] ${message}`);
}
```

## Performance Testing

### Load Testing

```bash
# Use artillery or similar tool for load testing
npm install -g artillery

# Create artillery config
cat > load-test.yml << EOF
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
scenarios:
  - name: "API Health Check"
    requests:
      - get:
          url: "/api/health"
  - name: "Homepage"
    requests:
      - get:
          url: "/"
EOF

# Run load test
artillery run load-test.yml
```

### Performance Regression Testing

```yaml
# Automated performance testing in CI/CD
- name: Performance regression check
  run: |
    # Compare current build metrics with baseline
    pnpm build:analyze
    node scripts/compare-bundle-size.js
    
    # Lighthouse performance testing
    pnpm exec lhci autorun
```

## Optimization Recommendations

### High-Impact Optimizations

1. **Enable Compression**
   ```typescript
   // Already configured in next.config.ts
   compress: true,
   ```

2. **Optimize Images**
   ```typescript
   // Use Next.js Image component everywhere
   // Implement lazy loading
   // Use WebP/AVIF formats
   ```

3. **Implement Service Worker**
   ```typescript
   // For offline support and caching
   // Consider using Workbox
   ```

4. **Database Indexing**
   ```sql
   -- Create indexes for frequently queried columns
   CREATE INDEX idx_folders_user_status ON folders(user_id, status);
   CREATE INDEX idx_users_email ON users(email);
   ```

### Long-term Optimization

1. **CDN Configuration**
   - Use Vercel's Edge Network
   - Optimize cache headers
   - Implement edge-side includes

2. **Database Scaling**
   - Monitor query patterns
   - Implement read replicas
   - Consider database sharding for large datasets

3. **Architecture Optimization**
   - Move heavy computations to background jobs
   - Implement queue system for async processing
   - Consider serverless architecture patterns

## Performance Budget

| Category | Budget | Measurement |
|----------|--------|-------------|
| JavaScript | 500KB | Bundle size |
| CSS | 100KB | Style sheets |
| Images | 2MB total | Optimized formats |
| Fonts | 200KB | Subset fonts |
| Total Page Weight | 3MB | All resources |
| Time to Interactive | 3s | Lighthouse |
| First Contentful Paint | 1.5s | Core Web Vitals |

Monitor these budgets continuously and alert when exceeded.

---

## Resources

- **Vercel Analytics**: Built-in performance monitoring
- **Lighthouse**: Performance auditing tool
- **WebPageTest**: Detailed performance analysis
- **Sentry**: Error and performance monitoring
- **GTmetrix**: Performance analysis and recommendations

This performance monitoring guide should be reviewed and updated quarterly.