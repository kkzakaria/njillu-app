# Deployment Runbook

Quick reference guide for deployment operations and emergency procedures.

## Quick Commands

### Local Development
```bash
pnpm install                    # Install dependencies
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm test:unit                 # Run unit tests
pnpm test:e2e                  # Run E2E tests
```

### Deployment
```bash
./scripts/deploy.sh staging           # Deploy to staging
./scripts/deploy.sh production        # Deploy to production
./scripts/deploy.sh production --force # Force deploy without checks
```

### Docker Operations
```bash
# Staging
docker-compose -f docker-compose.staging.yml up -d
docker-compose -f docker-compose.staging.yml logs -f app
docker-compose -f docker-compose.staging.yml down

# Production
docker-compose up -d
docker-compose logs -f app
docker-compose restart app
docker-compose down
```

### Database Operations
```bash
./scripts/migrate-staging.sh          # Run staging migrations
./scripts/migrate-production.sh       # Run production migrations
supabase migration list               # Check migration status
```

### Backup Operations
```bash
./scripts/backup-production.sh        # Create backup
ls -la /opt/backups/njillu-app/       # List backups
```

### Rollback Operations
```bash
./scripts/rollback-production.sh --previous    # Rollback to previous
./scripts/rollback-production.sh --version v1.0.0  # Rollback to version
./scripts/rollback-production.sh --dry-run     # Test rollback
```

## Health Checks

### Application Health
```bash
curl -f https://your-domain.com/api/health
curl -f https://staging.your-domain.com/api/health
```

### Service Status
```bash
docker-compose ps                      # Check container status
docker stats                          # Check resource usage
docker-compose logs --tail=50 app     # Check recent logs
```

### Database Health
```bash
# Test database connectivity through application
curl -f https://your-domain.com/api/health | jq '.checks.database'
```

## Monitoring URLs

### Production
- **Application**: https://your-domain.com
- **Health Check**: https://your-domain.com/api/health
- **Metrics**: https://your-domain.com/api/metrics
- **Grafana**: https://monitoring.your-domain.com
- **Traefik Dashboard**: https://traefik.your-domain.com:8080

### Staging
- **Application**: https://staging.your-domain.com
- **Health Check**: https://staging.your-domain.com/api/health
- **Grafana**: https://staging.your-domain.com:3001

## Emergency Procedures

### Application Down
1. Check health endpoint: `curl -f https://your-domain.com/api/health`
2. Check container status: `docker-compose ps`
3. Restart application: `docker-compose restart app`
4. Check logs: `docker-compose logs -f app`
5. If still down, rollback: `./scripts/rollback-production.sh --previous`

### Database Issues
1. Check database health in health endpoint
2. Check Supabase dashboard
3. Review database logs
4. If critical, rollback database: `./scripts/rollback-production.sh --database-only`

### High Memory/CPU Usage
1. Check metrics in Grafana
2. Check container resources: `docker stats`
3. Scale application: `docker-compose up -d --scale app=3`
4. If persistent, investigate and restart: `docker-compose restart app`

### Disk Space Full
1. Check disk usage: `df -h`
2. Clean Docker: `docker system prune -af`
3. Clean old logs: `find /var/log -name "*.log" -mtime +7 -delete`
4. Clean old backups: Script handles this automatically

### SSL Certificate Issues
1. Check certificate expiry: `openssl x509 -in cert.pem -text -noout`
2. Check Traefik logs: `docker-compose logs traefik`
3. Restart Traefik: `docker-compose restart traefik`
4. Manual certificate renewal if needed

## Deployment Checklist

### Pre-Deployment
- [ ] Tests passing in CI/CD
- [ ] Staging deployment successful
- [ ] Database migrations reviewed
- [ ] Backup created
- [ ] Team notified
- [ ] Change window scheduled

### During Deployment
- [ ] Monitor deployment progress
- [ ] Watch health checks
- [ ] Monitor error rates
- [ ] Check application functionality
- [ ] Verify database connectivity

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Metrics looking normal
- [ ] No critical alerts
- [ ] User acceptance testing
- [ ] Team notification of completion
- [ ] Documentation updated

## Escalation Matrix

### Level 1 - Application Issues
- Response Time: 15 minutes
- Actions: Restart services, check logs, basic troubleshooting

### Level 2 - Service Degradation
- Response Time: 5 minutes
- Actions: Scale services, investigate root cause, consider rollback

### Level 3 - Complete Outage
- Response Time: Immediate
- Actions: Immediate rollback, incident response, emergency procedures

## Contact Information

### On-Call Rotation
- Primary: [Contact Information]
- Secondary: [Contact Information]
- Escalation: [Contact Information]

### Service Providers
- **Supabase Support**: [Support Channel]
- **AWS Support**: [Support Channel]
- **Domain Provider**: [Support Channel]

## Environment Variables Reference

### Required for All Environments
```
NODE_ENV
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_SECRET
```

### Production Additional
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
BACKUP_S3_BUCKET
SENTRY_DSN
GRAFANA_ADMIN_PASSWORD
```

## Common Error Codes

### HTTP Status Codes
- **200**: Healthy
- **503**: Service unavailable
- **500**: Internal server error
- **404**: Not found
- **401**: Unauthorized

### Application Error Codes
- **DB_CONNECTION_FAILED**: Database connectivity issue
- **MIGRATION_FAILED**: Database migration error
- **AUTH_SERVICE_DOWN**: Authentication service unavailable
- **MEMORY_LIMIT_EXCEEDED**: Out of memory

## Performance Thresholds

### Response Times
- **Healthy**: < 1s
- **Warning**: 1-2s
- **Critical**: > 2s

### Error Rates
- **Healthy**: < 0.1%
- **Warning**: 0.1-1%
- **Critical**: > 1%

### Resource Usage
- **Memory**: < 80% healthy, > 90% critical
- **CPU**: < 70% healthy, > 90% critical
- **Disk**: < 80% healthy, > 90% critical

## Useful Commands

### Log Analysis
```bash
# Search for errors in logs
docker-compose logs app | grep -i error

# Get logs from specific time
docker-compose logs --since 2h app

# Follow logs in real-time
docker-compose logs -f app

# Export logs for analysis
docker-compose logs app > app-logs-$(date +%Y%m%d).log
```

### System Information
```bash
# Check system resources
top
htop
free -h
df -h

# Check network connections
ss -tulpn
netstat -tulpn

# Check Docker information
docker info
docker system df
```

### Database Operations
```bash
# Check Supabase status
supabase status

# List migrations
supabase migration list

# Reset local database (development only)
supabase db reset
```

This runbook provides quick access to essential deployment operations and emergency procedures for the Client Management System.