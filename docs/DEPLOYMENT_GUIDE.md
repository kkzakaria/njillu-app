# Deployment Guide

Comprehensive deployment guide for the Client Management System with automated CI/CD pipelines, zero-downtime deployment strategies, and disaster recovery procedures.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Local Development](#local-development)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Backup and Recovery](#backup-and-recovery)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Overview

The deployment architecture consists of:

- **Next.js Application**: Containerized client management system
- **Supabase Backend**: Database and authentication services
- **Reverse Proxy**: Traefik for load balancing and SSL termination
- **Monitoring Stack**: Prometheus, Grafana, and Loki
- **CI/CD Pipeline**: GitHub Actions with automated testing and deployment

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│  Traefik Proxy  │────│  Application    │
│   (Traefik)     │    │  (SSL/TLS)      │    │  (Next.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   Monitoring    │    │   Caching       │             │
│   (Prometheus)  │    │   (Redis)       │             │
└─────────────────┘    └─────────────────┘             │
                                                        │
┌─────────────────┐    ┌─────────────────┐             │
│   Logging       │    │   Database      │─────────────┘
│   (Loki)        │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

**Production Server:**
- Ubuntu 20.04+ or CentOS 8+
- 4+ CPU cores
- 8GB+ RAM
- 100GB+ SSD storage
- Docker 20.10+
- Docker Compose 2.0+

**Development Environment:**
- Node.js 20.x
- pnpm latest
- Docker Desktop
- Git

### Required Accounts and Services

1. **GitHub**: Repository hosting and CI/CD
2. **Supabase**: Database and authentication
3. **Domain Provider**: SSL certificates and DNS
4. **Cloud Storage**: AWS S3 for backups (optional)
5. **Monitoring**: Sentry for error tracking (optional)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/njillu-app.git
cd njillu-app
```

### 2. Environment Variables

Create environment files for each deployment stage:

#### Development (.env.local)
```bash
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-secret-min-32-chars
```

#### Staging (.env.staging)
```bash
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL_STAGING=staging-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=staging-anon-key
SUPABASE_SERVICE_ROLE_KEY_STAGING=staging-service-role-key
NEXTAUTH_SECRET_STAGING=staging-secret
```

#### Production (.env.production)
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=prod-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
NEXTAUTH_SECRET=prod-secret
```

### 3. GitHub Secrets

Configure the following secrets in your GitHub repository:

**Supabase Configuration:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL_STAGING`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING`
- `SUPABASE_SERVICE_ROLE_KEY_STAGING`

**Authentication:**
- `NEXTAUTH_SECRET`
- `NEXTAUTH_SECRET_STAGING`

**Server Access:**
- `STAGING_SSH_PRIVATE_KEY`
- `STAGING_USER`
- `STAGING_HOST`
- `PRODUCTION_SSH_PRIVATE_KEY`
- `PRODUCTION_USER`
- `PRODUCTION_HOST`

**Monitoring and Notifications:**
- `SLACK_WEBHOOK_URL`
- `GRAFANA_ADMIN_PASSWORD`

**Cloud Storage (Optional):**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `BACKUP_S3_BUCKET`

## Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Supabase (Optional)

```bash
supabase start
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Run Tests

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

## Staging Deployment

### Automated Deployment

Staging deployment is triggered automatically on pushes to the `main` branch.

### Manual Deployment

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy with specific options
./scripts/deploy.sh staging --skip-tests --force
```

### Docker Compose Staging

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f

# Stop staging environment
docker-compose -f docker-compose.staging.yml down
```

## Production Deployment

### Prerequisites

1. **Server Setup**: Ensure production server meets system requirements
2. **DNS Configuration**: Point domain to production server IP
3. **SSL Certificates**: Configure Let's Encrypt or provide certificates
4. **Backup Strategy**: Set up automated backups

### Automated Production Deployment

Production deployment is triggered by:
- Pushes to `main` branch (after staging success)
- Manual workflow dispatch
- Git tags (for versioned releases)

### Manual Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy specific version
git tag v1.0.0
git push origin v1.0.0
```

### Zero-Downtime Deployment Process

The deployment process ensures zero downtime through:

1. **Health Checks**: Verify current system health
2. **Backup Creation**: Automatic backup before deployment
3. **Parallel Deployment**: Start new instances alongside current ones
4. **Traffic Switch**: Gradually shift traffic to new instances
5. **Validation**: Comprehensive post-deployment validation
6. **Rollback**: Automatic rollback on failure

### Production Docker Compose

```bash
# Start production environment
docker-compose up -d

# Scale application instances
docker-compose up -d --scale app=3

# Rolling update
docker-compose pull
docker-compose up -d --no-deps --scale app=2 app
# Wait for health check
docker-compose up -d --no-deps --scale app=1 app
```

## Monitoring and Observability

### Access Monitoring Dashboards

- **Grafana**: https://monitoring.your-domain.com
- **Prometheus**: https://prometheus.your-domain.com:9090
- **Traefik**: https://traefik.your-domain.com:8080

### Key Metrics to Monitor

**Application Metrics:**
- Response time (95th percentile < 2s)
- Error rate (< 1%)
- Memory usage (< 80% of limit)
- CPU usage (< 80%)

**Business Metrics:**
- Bills of Lading processing rate
- Folder creation success rate
- User authentication success rate
- Database query performance

**Infrastructure Metrics:**
- Disk usage (< 80%)
- Network I/O
- Container health
- Database connections

### Alerts Configuration

Critical alerts are configured for:
- Application downtime (> 1 minute)
- High error rate (> 5% for 2 minutes)
- High response time (> 5s for 5 minutes)
- High memory usage (> 90% for 5 minutes)
- Database connection failures

## Backup and Recovery

### Automated Backup Strategy

**Daily Backups:**
- Database dump (encrypted)
- Application configuration
- User-uploaded files
- System logs

**Retention Policy:**
- Daily backups: 30 days
- Weekly backups: 3 months
- Monthly backups: 1 year

### Manual Backup

```bash
# Create production backup
./scripts/backup-production.sh

# Verify backup integrity
./scripts/verify-backup.sh /path/to/backup

# List available backups
ls -la /opt/backups/njillu-app/
```

### Disaster Recovery

#### Complete System Recovery

1. **Provision New Infrastructure**
2. **Restore from Latest Backup**
3. **Verify Data Integrity**
4. **Update DNS Records**
5. **Monitor System Health**

#### Application Rollback

```bash
# Rollback to previous version
./scripts/rollback-production.sh --previous

# Rollback to specific version
./scripts/rollback-production.sh --version v1.0.0

# Database-only rollback
./scripts/rollback-production.sh --database-only

# Dry run to see what would happen
./scripts/rollback-production.sh --dry-run
```

## Security Considerations

### Production Security Checklist

- [ ] SSL/TLS certificates configured and auto-renewing
- [ ] Security headers implemented (CSP, HSTS, etc.)
- [ ] Environment variables secured (no secrets in code)
- [ ] Database access restricted to application
- [ ] Regular security updates applied
- [ ] Backup encryption enabled
- [ ] Access logs monitored
- [ ] Rate limiting configured
- [ ] CORS policies implemented
- [ ] Input validation on all endpoints

### Security Headers

The application implements security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Network Security

- Application runs in isolated Docker network
- Database access limited to application containers
- External access only through reverse proxy
- Rate limiting on all public endpoints

## Troubleshooting

### Common Issues

#### Deployment Failures

**Issue**: Docker build fails
```bash
# Check Docker daemon
sudo systemctl status docker

# Clean Docker cache
docker system prune -af

# Rebuild with no cache
docker-compose build --no-cache
```

**Issue**: Health checks failing
```bash
# Check application logs
docker-compose logs app

# Test health endpoint manually
curl -f http://localhost:3000/api/health

# Check database connectivity
docker-compose exec app curl -f http://supabase:8000/health
```

#### Database Issues

**Issue**: Migration failures
```bash
# Check migration status
supabase migration list

# Reset database (development only)
supabase db reset

# Manual migration rollback
./scripts/rollback-production.sh --database-only
```

#### Performance Issues

**Issue**: High memory usage
```bash
# Check container resource usage
docker stats

# Increase memory limits in docker-compose.yml
# Monitor application metrics in Grafana
```

**Issue**: Slow response times
```bash
# Check database query performance
# Review application logs
# Analyze Prometheus metrics
# Consider scaling horizontally
```

### Log Analysis

**Application Logs:**
```bash
# Real-time logs
docker-compose logs -f app

# Search logs for errors
docker-compose logs app | grep ERROR

# Export logs for analysis
docker-compose logs --since 24h app > app-logs.txt
```

**System Logs:**
```bash
# System resource usage
top
htop
iotop

# Disk usage
df -h
du -sh /var/lib/docker/

# Network connectivity
ss -tulpn
netstat -tulpn
```

### Recovery Procedures

#### Application Recovery

1. **Check Health Status**
   ```bash
   curl -f https://your-domain.com/api/health
   ```

2. **Restart Application**
   ```bash
   docker-compose restart app
   ```

3. **Scale If Needed**
   ```bash
   docker-compose up -d --scale app=3
   ```

4. **Full System Restart**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### Database Recovery

1. **Check Database Health**
   ```bash
   # Test database connectivity
   docker-compose exec app node -e "console.log('Testing DB...')"
   ```

2. **Restore from Backup**
   ```bash
   ./scripts/rollback-production.sh --database-only
   ```

3. **Verify Data Integrity**
   ```bash
   # Run integrity checks
   # Verify critical data exists
   ```

### Support and Escalation

**Monitoring Alerts**: Check Grafana dashboards first
**Log Analysis**: Use Loki for centralized log search
**Performance Issues**: Review Prometheus metrics
**Security Incidents**: Check access logs and enable debug mode temporarily

For critical issues:
1. Check monitoring dashboards
2. Review application and system logs
3. Execute appropriate recovery procedures
4. Document incident and resolution
5. Update monitoring and alerting rules if needed

## Best Practices

### Deployment Best Practices

1. **Always test in staging first**
2. **Use automated testing in CI/CD**
3. **Monitor deployment progress**
4. **Have rollback plan ready**
5. **Document all changes**
6. **Coordinate with team**

### Security Best Practices

1. **Keep secrets out of code**
2. **Use principle of least privilege**
3. **Regular security updates**
4. **Monitor for vulnerabilities**
5. **Encrypt backups**
6. **Audit access logs**

### Monitoring Best Practices

1. **Monitor business metrics**
2. **Set meaningful alerts**
3. **Use structured logging**
4. **Regular dashboard reviews**
5. **Incident response procedures**
6. **Capacity planning**

This deployment guide provides comprehensive instructions for deploying and maintaining the Client Management System in production environments with high availability, security, and observability.