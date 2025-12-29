# Deployment Guide

## Overview

This guide covers deploying TAC to production environments. The recommended deployment platform is **Vercel**, but the application can be deployed to any Node.js hosting provider.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** - Production database configured
2. **WhatsApp Business Account** - For messaging (optional)
3. **Twilio Account** - For SMS fallback (optional)
4. **Upstash Account** - For rate limiting (optional)
5. **Sentry Account** - For error monitoring (optional)
6. **Domain Name** - For production URL

---

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/tac)

### Manual Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy

```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

#### 4. Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional - WhatsApp
WHATSAPP_ACCESS_TOKEN=EAAx...
WHATSAPP_PHONE_NUMBER_ID=123...
WHATSAPP_TEMPLATE_NAME=invoice
WHATSAPP_DEFAULT_COUNTRY_CODE=91

# Optional - Twilio
TWILIO_ACCOUNT_SID=ACx...
TWILIO_AUTH_TOKEN=xxx

# Optional - Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXx...

# Optional - Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# Application
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["bom1"],  // Mumbai region for India
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## Docker Deployment

### Dockerfile

```dockerfile
# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  tac:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    ports:
      - "3000:3000"
    environment:
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t tac:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production tac:latest

# Or with docker-compose
docker-compose up -d
```

---

## Self-Hosted Deployment

### Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Storage | 10 GB | 20+ GB |
| Node.js | 18.17+ | 20.x LTS |

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Start with PM2
pm2 start npm --name "tac" -- start

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

### PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tac',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tac',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
};
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/tac
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## Database Setup

### Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project in production region
   - Note the project URL and keys

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link to project
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

3. **Enable Row Level Security**
   - Verify RLS is enabled on all tables
   - Test policies with different user roles

4. **Configure Realtime**
   - Enable Realtime for required tables
   - Set up Realtime security policies

### Database Backups

```bash
# Manual backup via Supabase CLI
supabase db dump -f backup.sql

# Restore from backup
supabase db push < backup.sql
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Run linter
        run: npm run lint
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Secrets

Configure in GitHub → Repository → Settings → Secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Post-Deployment Checklist

### Security

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Service role key not exposed
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] CSP headers configured

### Database

- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Backups configured
- [ ] Connection pooling enabled

### Monitoring

- [ ] Sentry configured
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring setup
- [ ] Error alerts configured

### Performance

- [ ] Image optimization enabled
- [ ] Static assets cached
- [ ] API response times verified
- [ ] Database query performance checked

### Testing

- [ ] Smoke tests passed
- [ ] Authentication flow tested
- [ ] Critical paths verified
- [ ] Mobile responsiveness checked

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection Issues

```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

#### WhatsApp Integration Issues

- Verify template is approved in Meta Business Manager
- Check phone number format (E.164)
- Verify access token hasn't expired

#### Rate Limiting Not Working

- Verify Upstash credentials
- Check Redis connection
- Review rate limit configuration

### Logs

```bash
# Vercel logs
vercel logs --follow

# PM2 logs
pm2 logs tac

# Docker logs
docker logs -f tac
```

---

## Scaling Considerations

### Horizontal Scaling

- Deploy to multiple Vercel regions
- Use Vercel Edge Functions for global distribution
- Configure database connection pooling

### Caching Strategy

- Enable ISR for semi-static pages
- Use Vercel Edge caching
- Implement Redis caching for frequently accessed data

### Performance Optimization

- Enable Next.js image optimization
- Lazy load non-critical components
- Implement pagination for large data sets

---

## Rollback Procedure

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Manual

```bash
# Git rollback
git revert HEAD
git push origin main

# Or restore from backup
git checkout [previous-commit-hash]
npm run build
pm2 restart tac
```

---

*End of Documentation*

---

## Documentation Summary

This documentation covers:

1. **Project Overview** - Business context and features
2. **Architecture** - Tech stack and system design
3. **Database Schema** - All tables and relationships
4. **API Reference** - Complete endpoint documentation
5. **Authentication** - Security and RBAC implementation
6. **Frontend Components** - UI component library
7. **Dashboard Modules** - Feature modules breakdown
8. **Integrations** - External service configurations
9. **Configuration** - Environment variables guide
10. **Deployment** - Production deployment guide

For questions or updates, contact the development team.
