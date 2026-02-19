# Code Changes for AWS EC2 Deployment

## Summary
All necessary code changes have been made to make the backend compatible with AWS EC2 deployment. This document lists all changes made.

---

## Files Modified

### 1. **backend/src/server.ts** ✅
**Changes Made:**
- Added `HOST` variable that defaults to `0.0.0.0` (binds to all network interfaces)
- Added `NODE_ENV` variable for environment awareness
- Replaced hardcoded CORS origins with `getAllowedOrigins()` function
- Function checks `ALLOWED_ORIGINS` environment variable first
- Falls back to localhost values only in development mode
- Changed `app.listen(PORT)` to `app.listen(PORT, HOST)` to bind properly
- Fixed PORT parsing: `parseInt(process.env.PORT || '8081', 10)` to ensure numeric type
- Updated console logs to be AWS-aware (don't show localhost in production)
- Added log showing which host and port server is listening on

**Why These Changes:**
- AWS EC2 instances need server to listen on `0.0.0.0`, not just localhost
- External load balancers can't reach servers that only listen on localhost
- Environment variables from AWS must be properly read
- Production deployments should not hardcode development URLs

---

### 2. **backend/src/config/database.ts** ✅
**Changes Made:**
- Added `validateDatabaseConfig()` function
- Function checks for required environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Process exits with clear error message if any variables are missing
- Removed default values that would break on AWS (localhost as default)
- Used non-null assertion (!) to ensure variables are set
- Increased connection pool: `min: 5, max: 20` (was `min: 2, max: 10`)
- Added `acquireConnectionTimeout: 30000` for better handling of connection timeouts
- Improved MySQL connection handling for AWS RDS

**Why These Changes:**
- AWS RDS endpoint must be provided via environment variable
- No fallback to localhost ensures clear error if AWS setup is wrong
- Larger connection pool handles concurrent requests better
- Timeout configuration prevents hanging connections
- Non-null assertions provide TypeScript type safety

---

### 3. **backend/package.json** ✅
**Changes Made:**
- Modified `start` script to run migrations before starting server:
  ```
  "start": "npm run migrate && npm run init:relations && npm run init:id-proof-types && node dist/server.js"
  ```
- Added `start:prod` script for production deployments:
  ```
  "start:prod": "NODE_ENV=production npm run start"
  ```

**Why These Changes:**
- Ensures database migrations run automatically when server starts
- Initializes required tables (relations, ID proof types) before the app runs
- Prevents "table not found" errors after deployment
- Production script ensures correct NODE_ENV is set

---

### 4. **backend/src/jobs/monthlyFeesGeneration.ts** ✅
**Changes Made:**
- Added comprehensive AWS deployment notes in comments
- Made cron pattern dynamic: Uses production pattern (`'5 0 1 * *'`) if `NODE_ENV=production`
- Uses development pattern (`'5 * * * *'`) otherwise
- Added timezone awareness comments for AWS UTC handling
- Updated console logs to show environment and schedule being used
- Added warning message suggesting CloudWatch Events for production

**Why These Changes:**
- Development mode cron runs hourly for testing
- Production mode cron runs monthly on 1st at 12:05 AM UTC
- AWS UTC timezone is now properly documented
- Users are aware in-process cron may not be reliable
- Production deployments can use CloudWatch Events for better reliability

---

## Files Created

### 1. **backend/.env.example** ✅
**Purpose:** Template showing all required environment variables

**Contents Include:**
- Server configuration (NODE_ENV, PORT, HOST)
- AWS RDS database configuration with example endpoint
- JWT secret generation note
- File upload paths
- CORS configuration with production example
- Email configuration with Gmail app password instructions
- Frontend URL for password reset links
- AWS configuration for optional S3 integration
- Cron job timezone notes

**Usage:**
```bash
cp backend/.env.example backend/.env
# Edit .env with actual values
```

---

### 2. **frontend/.env.example** ✅
**Purpose:** Template for frontend environment variables

**Contents Include:**
- API URL configuration (local and production)
- App name
- Environment indicator (development/production)

---

### 3. **AWS_EC2_DEPLOYMENT_GUIDE.md** ✅
**Purpose:** Complete step-by-step deployment guide

**Sections Include:**
- Prerequisites and overview
- RDS database setup (with security group configuration)
- EC2 instance creation
- SSH connection instructions
- System preparation (Node.js, npm, PM2, Nginx)
- Repository cloning and setup
- Environment configuration
- Database migration and initialization
- Server startup with PM2
- Nginx reverse proxy configuration
- SSL/HTTPS setup with Let's Encrypt
- Frontend deployment (optional)
- Monitoring and maintenance
- Troubleshooting guide
- Performance optimization tips
- Security checklist
- Useful commands reference

**Usage:**
This is the main deployment guide. Follow it step-by-step to deploy on AWS EC2.

---

### 4. **AWS_DEPLOYMENT_CHECKLIST.md** ✅
**Purpose:** Quick reference checklist for deployment

**Sections Include:**
- Pre-deployment checklist
- AWS setup verification
- EC2 setup verification
- Repository setup on EC2
- Environment configuration checklist
- Database setup verification
- Application startup checks
- PM2 process management
- Health checks
- Nginx configuration
- SSL/HTTPS setup
- Frontend deployment
- Production security
- Monitoring & alerts
- Backup & disaster recovery
- Post-deployment testing
- Troubleshooting commands

**Usage:**
Use this as a checklist while deploying. Check off each item as completed.

---

## Key Configuration Changes

### Before (Local Development)
```env
NODE_ENV=development
PORT=8081
HOST=localhost  # ❌ Wrong for AWS
DB_HOST=localhost  # ❌ AWS RDS is not localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Mahi@0712  # ❌ Exposed in git
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173  # ❌ Hardcoded
```

### After (AWS Production)
```env
NODE_ENV=production
PORT=8081
HOST=0.0.0.0  # ✅ Listen on all interfaces
DB_HOST=hostel-management-db.c9akciq32.us-east-1.rds.amazonaws.com  # ✅ RDS endpoint
DB_PORT=3306
DB_USER=dbadmin  # ✅ Proper user
DB_PASSWORD=****  # ✅ Stored securely in AWS
ALLOWED_ORIGINS=https://your-frontend-domain.com  # ✅ Dynamic from environment
```

---

## What Was The Main Issue?

### ❌ Why Backend Wasn't Deploying Before:

1. **Localhost Hardcoding**
   - `DB_HOST=localhost` - RDS endpoint is NOT localhost
   - Database connection would fail immediately
   - Server would exit with "connection failed" error

2. **Server Not Binding Properly**
   - `app.listen(PORT)` only binds to localhost
   - AWS load balancer/external traffic couldn't reach the server
   - Health checks would fail

3. **Missing Environment Variables**
   - No validation that required variables were set
   - Missing variables would cause cryptic runtime errors
   - No clear error message about what was wrong

4. **Database Initialization**
   - Migrations and init scripts weren't running on startup
   - Tables might not exist
   - Schema mismatches would cause query failures

5. **Unreliable Cron Jobs**
   - In-process cron only runs if server keeps running
   - If server restarts, jobs won't run

### ✅ What Was Fixed:

1. **Proper AWS RDS Support**
   - Environment variable validation ensures DB_HOST is set
   - No localhost defaults that break on AWS
   - Connection pool optimized for RDS

2. **Correct Network Binding**
   - Server listens on `0.0.0.0:8081`
   - External traffic can reach the server
   - Load balancers and reverse proxies can connect

3. **Environment-Aware Configuration**
   - Cron patterns change based on NODE_ENV
   - CORS origins from environment variables
   - No hardcoded localhost references in code

4. **Automatic Database Setup**
   - Migrations run before server starts
   - Tables are initialized automatically
   - No manual setup steps after deployment

5. **Clear Error Messages**
   - Missing environment variables cause immediate, clear error
   - Administrator knows exactly what needs to be configured

---

## Deployment Process

### 1. Build Backend
```bash
cd backend
npm install
npm run build
```

### 2. Upload to AWS EC2
```bash
# Clone repository on EC2
git clone <your-repo>
cd backend
npm install
npm run build
```

### 3. Configure Environment
```bash
# Create .env from .env.example
cp .env.example .env
nano .env
# Edit with your AWS RDS endpoint, credentials, etc.
```

### 4. Start with PM2
```bash
npm install -g pm2
pm2 start "npm start" --name "hostel-backend"
pm2 save
pm2 startup
```

### 5. Configure Nginx
```bash
# Reverse proxy from port 80/443 to 8081
sudo nano /etc/nginx/sites-available/hostel-backend
# [Use the provided Nginx config]
sudo systemctl reload nginx
```

### 6. Verify Deployment
```bash
# Health check
curl http://localhost:8081/health

# Check logs
pm2 logs hostel-backend
```

---

## Environment Variables Required for AWS

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Set to production |
| `PORT` | `8081` | Server port |
| `HOST` | `0.0.0.0` | Listen on all interfaces |
| `DB_HOST` | `hostel-mgmt-db.xxx.rds.amazonaws.com` | RDS endpoint |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `dbadmin` | Database user |
| `DB_PASSWORD` | `SecurePassword123!` | Database password |
| `DB_NAME` | `Hostel` | Database name |
| `JWT_SECRET` | `<secure-random>` | Generate with: `openssl rand -base64 32` |
| `ALLOWED_ORIGINS` | `https://your-frontend.com` | Frontend URL for CORS |
| `UPLOAD_PATH` | `./uploads` | File upload directory |
| `EMAIL_SERVICE` | `gmail` | Email service provider |
| `EMAIL_USER` | `your@gmail.com` | Gmail address |
| `EMAIL_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail app password |
| `EMAIL_FROM` | `noreply@hostelmanagement.com` | From address |
| `FRONTEND_URL` | `https://your-frontend.com` | For password reset links |

---

## Testing Deployment

### 1. Connect to EC2
```bash
ssh -i key.pem ubuntu@your-ec2-ip
```

### 2. Check Backend Status
```bash
pm2 status
pm2 logs hostel-backend
```

### 3. Test Health Endpoint
```bash
curl http://localhost:8081/health
# Response: {"success":true,"message":"Server is running"...}
```

### 4. Test API Endpoint
```bash
curl http://localhost:8081/api
# Response: {"success":true,"message":"Hostel Management API","version":"1.0.0"}
```

### 5. Check Database Connection
```bash
# Should see "✅ Database connected successfully" in logs
pm2 logs hostel-backend | grep "Database"
```

---

## Summary

✅ **Code is now AWS-ready**
✅ **All environment variables are properly validated**
✅ **Database is configured for RDS**
✅ **Server binds to correct interface (0.0.0.0)**
✅ **Migrations run automatically**
✅ **Clear error messages if setup is wrong**
✅ **Production/development modes handled correctly**

**Next Step:** Follow `AWS_EC2_DEPLOYMENT_GUIDE.md` to deploy on AWS EC2

